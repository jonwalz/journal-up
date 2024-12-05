import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journals = pgTable("journals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  journalId: uuid("journal_id").references(() => journals.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  notificationPreferences: jsonb("notification_preferences").$type<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    reminderFrequency: string;
  }>().notNull().default({
    emailNotifications: true,
    pushNotifications: true,
    reminderFrequency: 'daily'
  }),
  themePreferences: jsonb("theme_preferences").$type<{
    darkMode: boolean;
    fontSize: string;
    colorScheme: string;
  }>().notNull().default({
    darkMode: false,
    fontSize: 'medium',
    colorScheme: 'default'
  }),
  privacySettings: jsonb("privacy_settings").$type<{
    journalVisibility: string;
    shareAnalytics: boolean;
  }>().notNull().default({
    journalVisibility: 'private',
    shareAnalytics: true
  }),
  aiInteractionSettings: jsonb("ai_interaction_settings").$type<{
    enableAiInsights: boolean;
    enableSentimentAnalysis: boolean;
    enableGrowthSuggestions: boolean;
  }>().notNull().default({
    enableAiInsights: true,
    enableSentimentAnalysis: true,
    enableGrowthSuggestions: true
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const metrics = pgTable("metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userInfo = pgTable("user_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  bio: text("bio"),
  timezone: text("timezone").notNull().default("UTC"),
  growthGoals: jsonb("growth_goals").$type<{
    shortTerm: string[];
    longTerm: string[];
  }>().default({
    shortTerm: [],
    longTerm: []
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
