import { sql } from "../config/database";

interface MigrationRow {
  name: string;
}

export async function createMigrationsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function getMigratedFiles(): Promise<string[]> {
  const result = await sql`
    SELECT name FROM migrations ORDER BY id;
  `;
  return result.map((row) => (row as MigrationRow).name);
}

export async function markMigrationAsComplete(
  migrationName: string
): Promise<void> {
  await sql`
    INSERT INTO migrations (name)
    VALUES (${migrationName});
  `;
}
