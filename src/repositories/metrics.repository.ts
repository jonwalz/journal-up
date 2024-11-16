import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../config/database";
import { metrics } from "../db/schema";
import type { Metric, MetricType } from "../types/metrics";
import { AppError } from "../utils/errors";

export class MetricsRepository {
  async recordMetric(
    userId: string,
    type: MetricType,
    value: number,
    notes?: string
  ): Promise<Metric> {
    try {
      const [rawMetric] = await db
        .insert(metrics)
        .values({
          userId,
          type,
          value: value.toString(),
          notes: notes || undefined,
        })
        .returning();

      return {
        ...rawMetric,
        type: rawMetric.type as MetricType,
        value: Number(rawMetric.value),
        notes: rawMetric.notes || undefined,
      };
    } catch (error) {
      console.error("Failed to record metric:", error);
      throw new AppError(500, "METRIC_RECORD_ERROR", "Failed to record metric");
    }
  }

  async getMetrics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Metric[]> {
    try {
      let conditions = [eq(metrics.userId, userId)];

      if (startDate) {
        conditions.push(gte(metrics.createdAt, startDate));
      }
      if (endDate) {
        conditions.push(lte(metrics.createdAt, endDate));
      }

      const rawMetrics = await db
        .select()
        .from(metrics)
        .where(and(...conditions))
        .orderBy(metrics.createdAt);

      return rawMetrics.map((metric) => {
        const metricType = metric.type as MetricType;
        if (!isValidMetricType(metricType)) {
          throw new AppError(
            500,
            "INVALID_METRIC_TYPE",
            `Invalid metric type: ${metric.type}`
          );
        }

        return {
          ...metric,
          type: metricType,
          value: Number(metric.value),
          notes: metric.notes || undefined,
        };
      });
    } catch (error) {
      console.error("Failed to get metrics:", error);
      throw new AppError(500, "METRICS_FETCH_ERROR", "Failed to get metrics");
    }
  }

  async getMetricsByType(
    userId: string,
    type: MetricType,
    startDate?: Date,
    endDate?: Date
  ): Promise<Metric[]> {
    try {
      let conditions = [eq(metrics.userId, userId), eq(metrics.type, type)];

      if (startDate) {
        conditions.push(gte(metrics.createdAt, startDate));
      }
      if (endDate) {
        conditions.push(lte(metrics.createdAt, endDate));
      }

      const rawMetrics = await db
        .select()
        .from(metrics)
        .where(and(...conditions))
        .orderBy(metrics.createdAt);

      return rawMetrics.map((metric) => ({
        ...metric,
        type: metric.type as MetricType,
        value: Number(metric.value),
        notes: metric.notes || undefined,
      }));
    } catch (error) {
      console.error("Failed to get metrics by type:", error);
      throw new AppError(500, "METRICS_FETCH_ERROR", "Failed to get metrics");
    }
  }

  async deleteMetric(id: string): Promise<void> {
    try {
      await db.delete(metrics).where(eq(metrics.id, id));
    } catch (error) {
      console.error("Failed to delete metric:", error);
      throw new AppError(500, "METRIC_DELETE_ERROR", "Failed to delete metric");
    }
  }
}

function isValidMetricType(type: string): type is MetricType {
  const validTypes: MetricType[] = [
    "resilience",
    "learning",
    "challenge",
    "feedback",
    "effort",
  ];
  return validTypes.includes(type as MetricType);
}
