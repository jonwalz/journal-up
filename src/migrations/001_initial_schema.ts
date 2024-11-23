import { sql } from '../config/database';

export async function up(): Promise<void> {
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;

  // Create sessions table
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);`;

  // Create journals table
  await sql`
    CREATE TABLE IF NOT EXISTS journals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);`;

  // Create entries table
  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      journal_id UUID REFERENCES journals(id),
      content TEXT NOT NULL,
      sentiment_score FLOAT,
      growth_indicators JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_entries_journal_id ON entries(journal_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at);`;

  // Create mindset metrics table
  await sql`
    CREATE TABLE IF NOT EXISTS mindset_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      metric_type VARCHAR(50) NOT NULL,
      value INTEGER NOT NULL,
      notes TEXT,
      recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_metric_type CHECK (
        metric_type IN ('resilience', 'effort', 'challenge', 'feedback', 'learning')
      ),
      CONSTRAINT valid_metric_value CHECK (value BETWEEN 1 AND 10)
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_metrics_user_id_recorded_at ON mindset_metrics(user_id, recorded_at);`;

  // Create user settings table
  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id UUID PRIMARY KEY REFERENCES users(id),
      notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
      theme_preferences JSONB DEFAULT '{"mode": "light"}',
      privacy_settings JSONB DEFAULT '{"shareProgress": false, "allowAnalytics": true}',
      ai_interaction_settings JSONB DEFAULT '{"suggestionsEnabled": true, "reminderFrequency": "daily"}',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_notification_prefs CHECK (
        jsonb_typeof(notification_preferences) = 'object'
        AND notification_preferences ? 'email'
        AND notification_preferences ? 'push'
      )
    );
  `;
}

export async function down(): Promise<void> {
  await sql`DROP TABLE IF EXISTS user_settings;`;
  await sql`DROP TABLE IF EXISTS mindset_metrics;`;
  await sql`DROP TABLE IF EXISTS entries;`;
  await sql`DROP TABLE IF EXISTS journals;`;
  await sql`DROP TABLE IF EXISTS sessions;`;
  await sql`DROP TABLE IF EXISTS users;`;
}
