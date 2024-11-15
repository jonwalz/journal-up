import { sql } from '../src/config/database';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function runMigrations() {
    try {
        // Create migrations table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Get all migration files
        const migrationsDir = join(process.cwd(), 'migrations');
        const files = await readdir(migrationsDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

        // Get executed migrations
        const executedMigrations = await sql`SELECT name FROM migrations`;
        const executedNames = new Set(executedMigrations.map(m => m.name));

        // Run pending migrations
        for (const file of sqlFiles) {
            if (!executedNames.has(file)) {
                console.log(`Running migration: ${file}`);
                const filePath = join(migrationsDir, file);
                const content = await readFile(filePath, 'utf-8');
                
                // Split content into individual statements
                const statements = content
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);

                // Execute each statement
                for (const statement of statements) {
                    await sql([statement]);
                }
                
                await sql`INSERT INTO migrations (name) VALUES (${file})`;
                console.log(`Completed migration: ${file}`);
            }
        }

        console.log('All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
