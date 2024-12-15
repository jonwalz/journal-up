import { MetricsRepository } from "../repositories/metrics.repository";
import type {
  Metric,
  MetricType,
  DateRange,
  ProgressAnalysis,
  MetricTrend,
  GrowthArea,
} from "../types/metrics";
import { ValidationError } from "../utils/errors";
import { AppError } from "../utils/errors"; // Added import statement
import { AIService } from "./ai/ai.service";
import type { IAIService } from "./ai/interfaces/ai-service.interface";

export class MetricsService {
  private metricsRepository: MetricsRepository;
  private aiService: IAIService;

  constructor() {
    this.metricsRepository = new MetricsRepository();
    this.aiService = new AIService();
  }

  async recordMetric(
    userId: string,
    metricType: MetricType,
    value: number,
    notes?: string
  ): Promise<Metric> {
    if (value < 1 || value > 10) {
      throw new ValidationError("Metric value must be between 1 and 10");
    }

    return await this.metricsRepository.recordMetric(
      userId,
      metricType,
      value,
      notes
    );
  }

  async getMetrics(userId: string, timeRange?: DateRange): Promise<Metric[]> {
    return await this.metricsRepository.getMetrics(
      userId,
      timeRange?.start,
      timeRange?.end
    );
  }

  async analyzeProgress(userId: string): Promise<ProgressAnalysis> {
    // Get current period metrics (last 30 days)
    const timeRange: DateRange = {
      end: new Date(),
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };

    // Get previous period metrics (30-60 days ago)
    const previousTimeRange: DateRange = {
      end: new Date(timeRange.start),
      start: new Date(timeRange.start.getTime() - 30 * 24 * 60 * 60 * 1000),
    };

    // Get metrics for both periods
    const currentMetrics = await this.getMetrics(userId, timeRange);
    const previousMetrics = await this.getMetrics(userId, previousTimeRange);

    // Calculate trends for each metric type
    const metricTrends = await this.calculateMetricTrends(
      currentMetrics,
      previousMetrics
    );

    // Calculate growth areas
    const growthAreas = await this.calculateGrowthAreas(metricTrends);

    // Calculate overall growth
    const overallGrowth = this.calculateOverallGrowth(metricTrends);

    // Generate AI-powered insights and recommendations
    const { insights, recommendations } = await this.generateAIInsights(
      userId,
      metricTrends,
      growthAreas
    );

    return {
      timeRange,
      metrics: metricTrends,
      topGrowthAreas: growthAreas,
      overallGrowth,
      insights,
      recommendations,
    };
  }

  private async calculateMetricTrends(
    currentMetrics: Metric[],
    previousMetrics: Metric[]
  ): Promise<Record<MetricType, MetricTrend>> {
    const trends: Record<MetricType, MetricTrend> = {} as Record<
      MetricType,
      MetricTrend
    >;
    const metricTypes: MetricType[] = [
      "resilience",
      "learning",
      "challenge",
      "feedback",
      "effort",
    ];

    for (const type of metricTypes) {
      const currentForType = currentMetrics.filter((m) => m.type === type);
      const previousForType = previousMetrics.filter((m) => m.type === type);

      if (currentForType.length === 0) continue;

      const currentAvg =
        currentForType.reduce((sum, m) => sum + m.value, 0) /
        currentForType.length;
      const previousAvg =
        previousForType.length > 0
          ? previousForType.reduce((sum, m) => sum + m.value, 0) /
            previousForType.length
          : currentAvg;

      const change = ((currentAvg - previousAvg) / previousAvg) * 100;

      trends[type] = {
        type,
        change: Number(change.toFixed(2)),
        trend:
          change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable",
        averageValue: Number(currentAvg.toFixed(2)),
        dataPoints: currentForType.length,
      };
    }

    return trends;
  }

  private async calculateGrowthAreas(
    trends: Record<MetricType, MetricTrend>
  ): Promise<GrowthArea[]> {
    const growthAreas: GrowthArea[] = [];

    for (const [type, trend] of Object.entries(trends)) {
      const strength = this.calculateStrength(trend);
      const suggestions = await this.generateGrowthSuggestions(
        type as MetricType
      );

      growthAreas.push({
        type: type as MetricType,
        strength,
        suggestions,
      });
    }

    // Sort by strength ascending (focus on areas needing most improvement)
    return growthAreas.sort((a, b) => a.strength - b.strength).slice(0, 3);
  }

  private calculateStrength(trend: MetricTrend): number {
    // Normalize average value to 0-1 scale
    const normalizedValue = (trend.averageValue - 1) / 9;

    // Factor in trend direction
    const trendFactor =
      trend.trend === "increasing"
        ? 0.1
        : trend.trend === "decreasing"
        ? -0.1
        : 0;

    // Calculate final strength (capped between 0 and 1)
    return Math.max(0, Math.min(1, normalizedValue + trendFactor));
  }

  private calculateOverallGrowth(
    trends: Record<MetricType, MetricTrend>
  ): number {
    const trendValues = Object.values(trends);
    if (trendValues.length === 0) return 0;

    const growthFactors = trendValues.map((trend) => {
      const normalizedValue = (trend.averageValue - 1) / 9;
      const trendFactor =
        trend.trend === "increasing"
          ? 0.1
          : trend.trend === "decreasing"
          ? -0.1
          : 0;
      return normalizedValue + trendFactor;
    });

    const averageGrowth =
      growthFactors.reduce((sum, factor) => sum + factor, 0) /
      growthFactors.length;
    return Math.max(0, Math.min(1, averageGrowth));
  }

  private async generateGrowthSuggestions(type: MetricType): Promise<string[]> {
    const suggestions: Record<MetricType, string[]> = {
      resilience: [
        "Practice mindfulness meditation to build emotional resilience",
        "Keep a resilience journal to track challenges and victories",
        "Develop a support network for difficult times",
      ],
      learning: [
        "Set specific learning goals for each week",
        "Try new learning methods or resources",
        "Share your knowledge with others to reinforce learning",
      ],
      challenge: [
        "Take on one new challenge each week",
        "Break down big challenges into smaller steps",
        "Celebrate small victories along the way",
      ],
      feedback: [
        "Seek feedback from trusted peers or mentors",
        "Reflect on feedback to identify areas for improvement",
        "Act on feedback to make positive changes",
      ],
      effort: [
        "Set realistic goals and deadlines",
        "Break tasks into smaller, manageable chunks",
        "Use a task list or planner to stay organized",
      ],
    };

    return suggestions[type];
  }

  private async generateAIInsights(
    userId: string,
    trends: Record<MetricType, MetricTrend>,
    growthAreas: GrowthArea[]
  ): Promise<{ insights: string[]; recommendations: string[] }> {
    try {
      // Use AI service to generate personalized insights
      const analysisPrompt = this.createAnalysisPrompt(trends, growthAreas);
      const aiResponse = await this.aiService.searchMemory(analysisPrompt);

      // Parse AI response for insights and recommendations
      const insights =
        aiResponse.relevantMemories[0]
          ?.split("RECOMMENDATIONS:")[0]
          ?.split("\n")
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^- /, "")) || [];

      const recommendations =
        aiResponse.relevantMemories[0]
          ?.split("RECOMMENDATIONS:")[1]
          ?.split("\n")
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^- /, "")) || [];

      return { insights, recommendations };
    } catch (error) {
      console.error("Failed to analyze metrics:", error);
      throw new AppError(500, "METRICS_ERROR", "Failed to analyze metrics");
    }
  }

  private createAnalysisPrompt(
    trends: Record<MetricType, MetricTrend>,
    growthAreas: GrowthArea[]
  ): string {
    return `Based on the user's growth metrics:
${Object.values(trends)
  .map((t) => `- ${t.type}: ${t.trend} (${t.change}% change)`)
  .join("\n")}

And their top growth areas:
${growthAreas
  .map((a) => `- ${a.type} (strength: ${(a.strength * 100).toFixed(0)}%)`)
  .join("\n")}

Please provide:
1. Key insights about their growth journey
2. Specific recommendations for improvement

Format your response as:
[insights]
RECOMMENDATIONS:
[recommendations]`;
  }

  private generateStaticInsights(
    trends: Record<MetricType, MetricTrend>
  ): string[] {
    return Object.values(trends)
      .filter((trend) => Math.abs(trend.change) > 5)
      .map((trend) => {
        const direction =
          trend.trend === "increasing" ? "improved" : "decreased";
        const magnitude =
          Math.abs(trend.change) > 20 ? "significantly" : "slightly";
        return `Your ${trend.type} has ${magnitude} ${direction} (${Math.abs(
          trend.change
        )}% change).`;
      });
  }

  private generateStaticRecommendations(growthAreas: GrowthArea[]): string[] {
    return growthAreas.flatMap((area) => area.suggestions.slice(0, 2));
  }

  private calculateTrend(metrics: Metric[]): string {
    return metrics.length > 0 ? "improving" : "stable";
  }
}
