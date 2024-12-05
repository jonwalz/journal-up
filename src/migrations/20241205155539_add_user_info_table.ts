import { sql } from '../config/database';

export async function up(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS user_info (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      bio TEXT,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      growth_goals JSONB DEFAULT '{"shortTerm": [], "longTerm": []}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_user_info_user_id ON user_info(user_id);`;
}

export async function down(): Promise<void> {
  await sql`DROP TABLE IF EXISTS user_info;`;
}
