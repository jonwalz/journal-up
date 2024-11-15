import { writeFileSync } from 'fs';
import { join } from 'path';

function createMigrationFile() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const name = process.argv[2];

  if (!name) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: bun run migrate:create <migration_name>');
    process.exit(1);
  }

  const filename = `${timestamp}_${name}.ts`;
  const template = `import { sql } from '../config/database';

export async function up(): Promise<void> {
  await sql\`
    -- Add your migration SQL here
  \`;
}

export async function down(): Promise<void> {
  await sql\`
    -- Add your rollback SQL here
  \`;
}
`;

  const filepath = join(process.cwd(), 'src', 'migrations', filename);
  writeFileSync(filepath, template);

  console.log(`✅ Created migration file: ${filename}`);
  process.exit(0);
}

createMigrationFile();
