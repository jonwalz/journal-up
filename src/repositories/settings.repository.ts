import { eq, sql } from "drizzle-orm";
import { db } from "../config/database";
import { userSettings } from "../db/schema";
import type { UserSettings } from "../types/settings";
import { AppError } from "../utils/errors";

export class SettingsRepository {
  constructor() {
    this.initializeTable().catch(console.error);
  }

  private async initializeTable() {
    try {
      // Drop table if exists
      await db.execute(sql`DROP TABLE IF EXISTS user_settings;`);

      // Create table
      await db.execute(sql`
        CREATE TABLE user_settings (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id),
          notification_preferences jsonb NOT NULL DEFAULT '{"emailNotifications":true,"pushNotifications":true,"reminderFrequency":"daily"}'::jsonb,
          theme_preferences jsonb NOT NULL DEFAULT '{"darkMode":false,"fontSize":"medium","colorScheme":"default"}'::jsonb,
          privacy_settings jsonb NOT NULL DEFAULT '{"journalVisibility":"private","shareAnalytics":true}'::jsonb,
          ai_interaction_settings jsonb NOT NULL DEFAULT '{"enableAiInsights":true,"enableSentimentAnalysis":true,"enableGrowthSuggestions":true}'::jsonb,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        );
      `);
      console.log("✅ Settings table initialized");
    } catch (error) {
      console.error("Failed to initialize settings table:", error);
      throw new AppError(
        500,
        "SETTINGS_INIT_ERROR",
        "Failed to initialize settings table"
      );
    }
  }

  async getSettings(userId: string): Promise<UserSettings> {
    try {
      const [settings] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      if (!settings) {
        return this.createDefaultSettings(userId);
      }

      return settings;
    } catch (error) {
      console.error('Failed to get user settings:', error);
      throw new AppError(
        500,
        "SETTINGS_FETCH_ERROR",
        "Failed to get user settings"
      );
    }
  }

  async updateSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    try {
      const [result] = await db
        .insert(userSettings)
        .values({
          userId,
          ...settings,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: {
            ...settings,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw new AppError(
        500,
        "SETTINGS_UPDATE_ERROR",
        "Failed to update user settings"
      );
    }
  }

  private async createDefaultSettings(userId: string): Promise<UserSettings> {
    try {
      const [settings] = await db
        .insert(userSettings)
        .values({
          userId,
        })
        .returning();

      return settings;
    } catch (error) {
      console.error('Failed to create default settings:', error);
      throw new AppError(
        500,
        "SETTINGS_CREATE_ERROR",
        "Failed to create default settings"
      );
    }
  }
}
