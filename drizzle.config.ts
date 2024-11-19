import type { Config } from "drizzle-kit";
import { env } from "./src/config/environment";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;