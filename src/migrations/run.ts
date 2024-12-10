import {
  createMigrationsTable,
  getMigratedFiles,
  markMigrationAsComplete,
} from "./utils";
import * as initialSchema from "./001_initial_schema";
import * as addUserInfoTable from "./20241205155539_add_user_info_table";
import * as updateUserSettings from "./20241210221503_update_user_settings";

interface Migration {
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const migrations: Record<string, Migration> = {
  "001_initial_schema": initialSchema,
  "20241205155539_add_user_info_table": addUserInfoTable,
  "20241210221503_update_user_settings": updateUserSettings,
};

export async function runMigrations() {
  console.log("Starting migrations...");

  try {
    // Ensure migrations table exists
    await createMigrationsTable();
    console.log("✅ Migrations table ready");

    // Get list of completed migrations
    const completedMigrations = await getMigratedFiles();
    console.log("Completed migrations:", completedMigrations);

    // Run pending migrations
    for (const [name, migration] of Object.entries(migrations)) {
      if (!completedMigrations.includes(name)) {
        console.log(`Running migration: ${name}`);
        await migration.up();
        await markMigrationAsComplete(name);
        console.log(`✅ Completed migration: ${name}`);
      }
    }

    console.log("✨ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Only run migrations directly if this file is being executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
