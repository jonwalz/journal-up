import { ZepClient } from "zep-js";
import type {
  AIResponse,
  GrowthIndicator,
  MemorySearchResult,
  SentimentAnalysis,
} from "../types/ai";
import { env } from "../config/environment";
import type { IEntry } from "../types";
import { AppError } from "../utils/errors";

export class AIService {
  private zepClient: ZepClient;
  private readonly COLLECTION_NAME = "journal_entries";

  constructor() {
    this.zepClient = new ZepClient(env.ZEP_API_URL, env.ZEP_API_KEY);
  }

  async initializeUserMemory(userId: string): Promise<void> {
    try {
      await this.zepClient.searchMemory(this.COLLECTION_NAME, {
        text: `Initializing memory for user ${userId}`,
        meta: {
          type: "initialization",
          userId,
        },
      });
    } catch (error) {
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to initialize user memory"
      );
    }
  }

  async searchMemory(query: string): Promise<MemorySearchResult> {
    try {
      const response = await this.zepClient.searchMemory(this.COLLECTION_NAME, {
        text: query,
        meta: {
          type: "search",
        },
      });

      return {
        relevantMemories: response
          .map((r) => r.message?.content)
          .filter((content): content is string => content !== undefined),
        score: response[0]?.dist || 0,
      };
    } catch (error) {
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to search memory");
    }
  }

  async analyzeEntry(entry: IEntry): Promise<{
    sentiment: SentimentAnalysis;
    growthIndicators: GrowthIndicator[];
  }> {
    try {
      const response = await this.zepClient.searchMemory(this.COLLECTION_NAME, {
        text: entry.content,
        meta: {
          type: "analysis",
          entryId: entry.id,
        },
      });

      const sentiment = this.extractSentiment(response[0]);
      const growthIndicators = this.extractGrowthIndicators(response[0]);

      return {
        sentiment,
        growthIndicators,
      };
    } catch (error) {
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to analyze entry");
    }
  }

  async analyzeEntryContent(content: string): Promise<{
    sentiment: SentimentAnalysis;
    growthIndicators: GrowthIndicator[];
  }> {
    try {
      const response = await this.zepClient.searchMemory(this.COLLECTION_NAME, {
        text: content,
        meta: {
          type: "analysis",
        },
      });

      const sentiment = this.extractSentiment(response[0]);
      const growthIndicators = this.extractGrowthIndicators(response[0]);

      return {
        sentiment,
        growthIndicators,
      };
    } catch (error) {
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to analyze entry content"
      );
    }
  }

  async chat(userId: string, message: string): Promise<AIResponse> {
    try {
      const response = await this.zepClient.searchMemory(this.COLLECTION_NAME, {
        text: message,
        meta: {
          type: "chat",
          userId,
        },
      });

      const relevantContent = response[0]?.message?.content;
      const growthIndicators = this.extractGrowthIndicators(response[0]);

      return {
        message: relevantContent || "I couldn't find any relevant information.",
        context: {
          relatedEntries: response
            .slice(1)
            .map((r) => r.message?.content)
            .filter((content): content is string => content !== undefined),
          growthIndicators: growthIndicators.map(
            (indicator) =>
              `${indicator.type} (${Math.round(
                indicator.confidence * 100
              )}%): ${indicator.evidence}`
          ),
          suggestedActions: this.generateSuggestedActions(response[0]),
        },
      };
    } catch (error) {
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to process chat message"
      );
    }
  }

  private extractSentiment(memory: any): SentimentAnalysis {
    // Extract sentiment from memory response
    const score = memory?.dist || 0;
    let label: SentimentAnalysis["label"] = "neutral";

    if (score > 0.3) label = "positive";
    else if (score < -0.3) label = "negative";

    return {
      score,
      label,
      confidence: Math.abs(score),
    };
  }

  private extractGrowthIndicators(memory: any): GrowthIndicator[] {
    const indicators: GrowthIndicator[] = [];
    const types: GrowthIndicator["type"][] = [
      "resilience",
      "effort",
      "challenge",
      "feedback",
      "learning",
    ];

    // Extract growth indicators from memory response
    types.forEach((type) => {
      const confidence = Math.random(); // Replace with actual logic
      if (confidence > 0.5) {
        indicators.push({
          type,
          confidence,
          evidence: memory.message?.content || "",
        });
      }
    });

    return indicators;
  }

  private generateSuggestedActions(memory: any): string[] {
    // Extract action items from the memory content
    const content = memory?.message?.content;
    if (!content) return [];

    const actions = content
      .split("\n")
      .filter((line: string) => line.startsWith("- Action:"))
      .map((line: string) => line.replace("- Action:", "").trim());

    return actions.length > 0
      ? actions
      : ["Reflect on your progress", "Set a new goal", "Review past entries"];
  }
}

export const aiService = new AIService();
