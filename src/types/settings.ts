export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderFrequency: string;
}

export interface ThemePreferences {
  darkMode: boolean;
  fontSize: string;
  colorScheme: string;
}

export interface PrivacySettings {
  journalVisibility: string;
  shareAnalytics: boolean;
}

export interface AiInteractionSettings {
  enableAiInsights: boolean;
  enableSentimentAnalysis: boolean;
  enableGrowthSuggestions: boolean;
}

export interface UserSettings {
  id: string;
  userId: string;
  notificationPreferences: NotificationPreferences;
  themePreferences: ThemePreferences;
  privacySettings: PrivacySettings;
  aiInteractionSettings: AiInteractionSettings;
  createdAt: Date;
  updatedAt: Date;
}
