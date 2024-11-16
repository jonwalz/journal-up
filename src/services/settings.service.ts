import { SettingsRepository } from "../repositories/settings.repository";
import { AppError } from "../utils/errors";
import type { IUserSettings } from "../types";
import type { UserSettings } from "../types/settings";

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  async getUserSettings(userId: string): Promise<IUserSettings> {
    try {
      const settings = await this.settingsRepository.getSettings(userId);
      return this.mapToIUserSettings(settings);
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw new AppError(
        500,
        "SETTINGS_SERVICE_ERROR",
        "Failed to get user settings"
      );
    }
  }

  async updateSettings(
    userId: string,
    settings: Partial<IUserSettings>
  ): Promise<IUserSettings> {
    try {
      this.validateSettings(settings);
      const mappedSettings = this.mapToUserSettings(settings);
      const updatedSettings = await this.settingsRepository.updateSettings(
        userId,
        mappedSettings
      );
      return this.mapToIUserSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        500,
        "SETTINGS_SERVICE_ERROR",
        "Failed to update settings"
      );
    }
  }

  private validateSettings(settings: Partial<IUserSettings>): void {
    if (settings.notificationPreferences) {
      const { email, push } = settings.notificationPreferences;
      if (email !== undefined && typeof email !== "boolean") {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Email notification preference must be a boolean"
        );
      }
      if (push !== undefined && typeof push !== "boolean") {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Push notification preference must be a boolean"
        );
      }
    }

    if (settings.themePreferences) {
      const { mode } = settings.themePreferences;
      if (mode && !["light", "dark"].includes(mode)) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Theme mode must be either 'light' or 'dark'"
        );
      }
    }

    if (settings.privacySettings) {
      const { shareProgress, allowAnalytics } = settings.privacySettings;
      if (shareProgress !== undefined && typeof shareProgress !== "boolean") {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Share progress setting must be a boolean"
        );
      }
      if (allowAnalytics !== undefined && typeof allowAnalytics !== "boolean") {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Allow analytics setting must be a boolean"
        );
      }
    }

    if (settings.aiInteractionSettings) {
      const { suggestionsEnabled, reminderFrequency } =
        settings.aiInteractionSettings;
      if (
        suggestionsEnabled !== undefined &&
        typeof suggestionsEnabled !== "boolean"
      ) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "AI suggestions enabled must be a boolean"
        );
      }
      if (
        reminderFrequency &&
        !["daily", "weekly", "monthly"].includes(reminderFrequency)
      ) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Reminder frequency must be 'daily', 'weekly', or 'monthly'"
        );
      }
    }
  }

  private mapToIUserSettings(settings: UserSettings): IUserSettings {
    return {
      userId: settings.userId,
      notificationPreferences: {
        email: settings.notificationPreferences.emailNotifications,
        push: settings.notificationPreferences.pushNotifications,
      },
      themePreferences: {
        mode: settings.themePreferences.darkMode ? "dark" : "light",
      },
      privacySettings: {
        shareProgress: settings.privacySettings.journalVisibility === "public",
        allowAnalytics: settings.privacySettings.shareAnalytics,
      },
      aiInteractionSettings: {
        suggestionsEnabled: settings.aiInteractionSettings.enableAiInsights,
        reminderFrequency: settings.notificationPreferences
          .reminderFrequency as "daily" | "weekly" | "monthly",
      },
      updatedAt: settings.updatedAt,
    };
  }

  private mapToUserSettings(
    settings: Partial<IUserSettings>
  ): Partial<UserSettings> {
    const mappedSettings: Partial<UserSettings> = {};

    if (settings.notificationPreferences) {
      mappedSettings.notificationPreferences = {
        emailNotifications: settings.notificationPreferences.email,
        pushNotifications: settings.notificationPreferences.push,
        reminderFrequency:
          settings.aiInteractionSettings?.reminderFrequency || "daily",
      };
    }

    if (settings.themePreferences) {
      mappedSettings.themePreferences = {
        darkMode: settings.themePreferences.mode === "dark",
        fontSize: "medium", // default
        colorScheme: "default", // default
      };
    }

    if (settings.privacySettings) {
      mappedSettings.privacySettings = {
        journalVisibility: settings.privacySettings.shareProgress
          ? "public"
          : "private",
        shareAnalytics: settings.privacySettings.allowAnalytics,
      };
    }

    if (settings.aiInteractionSettings) {
      mappedSettings.aiInteractionSettings = {
        enableAiInsights: settings.aiInteractionSettings.suggestionsEnabled,
        enableSentimentAnalysis:
          settings.aiInteractionSettings.suggestionsEnabled,
        enableGrowthSuggestions:
          settings.aiInteractionSettings.suggestionsEnabled,
      };
    }

    return mappedSettings;
  }
}

export const settingsService = new SettingsService();
