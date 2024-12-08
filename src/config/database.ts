import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

// Import environment after schema to avoid circular dependencies
import { env } from "./environment";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export { sql };
