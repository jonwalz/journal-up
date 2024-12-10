import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { userSettings } from "../db/schema";
import type { UserSettings } from "../types/settings";
import { AppError } from "../utils/errors";

export class SettingsRepository {
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
      console.error("Failed to get user settings:", error);
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
      console.error("Failed to update user settings:", error);
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
      console.error("Failed to create default settings:", error);
      throw new AppError(
        500,
        "SETTINGS_CREATE_ERROR",
        "Failed to create default settings"
      );
    }
  }
}
