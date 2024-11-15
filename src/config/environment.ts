import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  ZEP_API_URL: z.string(),
  ZEP_API_KEY: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.toString());
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
