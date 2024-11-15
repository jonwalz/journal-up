import { Elysia, t } from "elysia";
import { SettingsService } from "../services/settings.service";
import { authMiddleware } from "../middleware/auth";
import { ValidationError } from "../utils/errors";

export const settingsController = new Elysia({ prefix: "/settings" })
  .use(authMiddleware)
  .get("/", async ({ user }) => {
    const settingsService = new SettingsService();
    return await settingsService.getUserSettings(user.id);
  })
  .patch(
    "/",
    async ({ body, user }) => {
      const settingsService = new SettingsService();
      return await settingsService.updateSettings(user.id, body);
    },
    {
      body: t.Object({
        notificationPreferences: t.Optional(
          t.Object({
            email: t.Boolean(),
            push: t.Boolean(),
          })
        ),
        themePreferences: t.Optional(
          t.Object({
            mode: t.Union([t.Literal("light"), t.Literal("dark")]),
          })
        ),
        privacySettings: t.Optional(
          t.Object({
            shareProgress: t.Boolean(),
            allowAnalytics: t.Boolean(),
          })
        ),
        aiInteractionSettings: t.Optional(
          t.Object({
            suggestionsEnabled: t.Boolean(),
            reminderFrequency: t.Union([
              t.Literal("daily"),
              t.Literal("weekly"),
              t.Literal("monthly"),
            ]),
          })
        ),
      }),
      error: ({ error }) => {
        if (error.message === "Validation Failed") {
          throw new ValidationError(error.message);
        }
        throw error;
      },
    }
  );
