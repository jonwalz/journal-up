import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  ZEP_API_URL: z.string(),
  ZEP_API_KEY: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(env: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.errors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = (globalThis as typeof globalThis & { process?: { env: Record<string, string> } }).process?.env
  ? validateEnv((globalThis as typeof globalThis & { process?: { env: Record<string, string> } }).process.env) // For local development
  : validateEnv(globalThis as unknown as Record<string, unknown>); // For Cloudflare Workers
