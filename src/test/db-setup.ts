import { sql } from "../config/database";
import { runMigrations } from "../migrations/run";

export async function setupTestDatabase() {
  try {
    // Drop all existing tables in the test database
    // Order matters due to foreign key constraints
    await sql`DROP TABLE IF EXISTS "entries" CASCADE`;
    await sql`DROP TABLE IF EXISTS "journals" CASCADE`;
    await sql`DROP TABLE IF EXISTS "sessions" CASCADE`;
    await sql`DROP TABLE IF EXISTS "users" CASCADE`;
    await sql`DROP TABLE IF EXISTS "migrations" CASCADE`;

    // Re-create tables using migrations
    await runMigrations();
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }
}
