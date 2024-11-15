export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJournal {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEntry {
  id: string;
  journalId: string;
  content: string;
  sentimentScore?: number;
  growthIndicators?: IGrowthIndicators;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGrowthIndicators {
  resilience: number;
  effort: number;
  challenge: number;
  feedback: number;
  learning: number;
}

export type MetricType = 'resilience' | 'effort' | 'challenge' | 'feedback' | 'learning';

export interface IMetric {
  id: string;
  userId: string;
  metricType: MetricType;
  value: number;
  notes?: string;
  recordedAt: Date;
}

export interface IUserSettings {
  userId: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
  themePreferences: {
    mode: 'light' | 'dark';
  };
  privacySettings: {
    shareProgress: boolean;
    allowAnalytics: boolean;
  };
  aiInteractionSettings: {
    suggestionsEnabled: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
  };
  updatedAt: Date;
}
