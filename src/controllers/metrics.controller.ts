import { Elysia, t } from "elysia";
import { MetricsService } from "../services/metrics.service";
import { authMiddleware } from "../middleware/auth";
import { ValidationError } from "../utils/errors";
import type { DateRange } from "../types/metrics";

export const metricsController = new Elysia({ prefix: "/metrics" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ body, user }) => {
      const metricsService = new MetricsService();
      return await metricsService.recordMetric(
        user.id,
        body.type,
        body.value,
        body.notes
      );
    },
    {
      body: t.Object({
        type: t.Union([
          t.Literal("resilience"),
          t.Literal("learning"),
          t.Literal("challenge"),
          t.Literal("feedback"),
          t.Literal("effort"),
        ]),
        value: t.Number(),
        notes: t.Optional(t.String()),
      }),
      error: ({ error }) => {
        if (error.message === "Validation Failed") {
          throw new ValidationError(error.message);
        }
        throw error;
      },
    }
  )
  .get("/", async ({ user, query }) => {
    const metricsService = new MetricsService();
    const timeRange: DateRange | undefined =
      query.startDate && query.endDate
        ? {
            start: new Date(query.startDate),
            end: new Date(query.endDate),
          }
        : undefined;
    return await metricsService.getMetrics(user.id, timeRange);
  })
  .get("/analysis", async ({ user }) => {
    const metricsService = new MetricsService();
    return await metricsService.analyzeProgress(user.id);
  });
