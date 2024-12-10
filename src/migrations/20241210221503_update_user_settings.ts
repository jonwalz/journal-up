import { sql } from '../config/database';

export async function up(): Promise<void> {
  // Drop existing user_settings table
  await sql`DROP TABLE IF EXISTS user_settings;`;

  // Create updated user_settings table with new structure
  await sql`
    CREATE TABLE user_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id),
      notification_preferences jsonb NOT NULL DEFAULT '{"emailNotifications":true,"pushNotifications":true,"reminderFrequency":"daily"}'::jsonb,
      theme_preferences jsonb NOT NULL DEFAULT '{"darkMode":false,"fontSize":"medium","colorScheme":"default"}'::jsonb,
      privacy_settings jsonb NOT NULL DEFAULT '{"journalVisibility":"private","shareAnalytics":true}'::jsonb,
      ai_interaction_settings jsonb NOT NULL DEFAULT '{"enableAiInsights":true,"enableSentimentAnalysis":true,"enableGrowthSuggestions":true}'::jsonb,
      created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Add index on user_id
  await sql`CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);`;
}

export async function down(): Promise<void> {
  // Revert to original user_settings table structure
  await sql`DROP TABLE IF EXISTS user_settings;`;
  
  await sql`
    CREATE TABLE user_settings (
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
