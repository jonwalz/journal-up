import { createMigrationsTable, getMigratedFiles, markMigrationAsComplete } from './utils';
import * as initialSchema from './001_initial_schema';

interface Migration {
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const migrations: Record<string, Migration> = {
  '001_initial_schema': initialSchema,
};

async function runMigrations() {
  console.log('Starting migrations...');

  try {
    // Ensure migrations table exists
    await createMigrationsTable();
    console.log('✅ Migrations table ready');

    // Get list of completed migrations
    const completedMigrations = await getMigratedFiles();
    console.log('Completed migrations:', completedMigrations);

    // Run pending migrations
    for (const [name, migration] of Object.entries(migrations)) {
      if (!completedMigrations.includes(name)) {
        console.log(`Running migration: ${name}`);
        await migration.up();
        await markMigrationAsComplete(name);
        console.log(`✅ Completed migration: ${name}`);
      }
    }

    console.log('✨ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
