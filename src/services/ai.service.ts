import { ZepClient } from "@getzep/zep-cloud";
import type {
  AIResponse,
  GrowthIndicator,
  MemorySearchResult,
  SentimentAnalysis,
} from "../types/ai";
import { env } from "../config/environment";
import type { IEntry } from "../types";
import { AppError } from "../utils/errors";

interface Message {
  content: string;
  role?: string;
  metadata?: Record<string, unknown>;
}

interface SearchResult {
  message?: Message | string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export class AIService {
  private zepClient: ZepClient;
  private readonly COLLECTION_NAME = "journal_entries";

  constructor() {
    this.zepClient = new ZepClient({
      apiKey: env.ZEP_API_KEY,
    });
  }

  async initializeUserMemory(userId: string): Promise<void> {
    try {
      await this.zepClient.memory.search(this.COLLECTION_NAME, {
        text: `Initializing memory for user ${userId}`,
        metadata: {
          type: "initialization",
          userId,
        },
      });
    } catch (error) {
      console.error("Failed to initialize user memory:", error);
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to initialize user memory"
      );
    }
  }

  async searchMemory(query: string): Promise<MemorySearchResult> {
    try {
      const memories = await this.zepClient.memory.search(
        this.COLLECTION_NAME,
        {
          text: query,
          metadata: {
            type: "search",
          },
        }
      );

      return {
        relevantMemories: memories
          .map((r) => this.extractMessageContent(r.message))
          .filter((content): content is string => content !== undefined),
        score: memories[0]?.score || 0,
      };
    } catch (error) {
      console.error("Failed to search memory:", error);
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to search memory");
    }
  }

  async analyzeEntry(entry: IEntry): Promise<{
    sentiment: SentimentAnalysis;
    growthIndicators: GrowthIndicator[];
  }> {
    try {
      const memories = await this.zepClient.memory.search(
        this.COLLECTION_NAME,
        {
          text: entry.content,
          metadata: {
            type: "analysis",
            entryId: entry.id,
          },
        }
      );

      if (!memories[0]) {
        throw new AppError(
          500,
          "AI_SERVICE_ERROR",
          "No analysis results found"
        );
      }

      const sentiment = this.extractSentiment(memories[0]);
      const growthIndicators = this.extractGrowthIndicators(memories[0]);

      return {
        sentiment,
        growthIndicators,
      };
    } catch (error) {
      console.error("Failed to analyze entry:", error);
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to analyze entry");
    }
  }

  async analyzeEntryContent(content: string): Promise<{
    sentiment: SentimentAnalysis;
    growthIndicators: GrowthIndicator[];
  }> {
    try {
      const memories = await this.zepClient.memory.search(
        this.COLLECTION_NAME,
        {
          text: content,
          metadata: {
            type: "analysis",
          },
        }
      );

      if (!memories[0]) {
        throw new AppError(
          500,
          "AI_SERVICE_ERROR",
          "No analysis results found"
        );
      }

      const sentiment = this.extractSentiment(memories[0]);
      const growthIndicators = this.extractGrowthIndicators(memories[0]);

      return {
        sentiment,
        growthIndicators,
      };
    } catch (error) {
      console.error("Failed to analyze entry content:", error);
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to analyze entry content"
      );
    }
  }

  async addToGraph(userId: string, data: any) {
    try {
      await this.zepClient.graph.add({
        data,
        userId: userId,
        type: "json",
      });

      return {
        success: true,
        message: "Data successfully added to graph",
      };
    } catch (error) {
      console.error("Error adding data to graph:", error);
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to add data to graph"
      );
    }
  }

  async chat(userId: string, message: string): Promise<AIResponse> {
    try {
      const memories = await this.zepClient.memory.search(
        this.COLLECTION_NAME,
        {
          text: message,
          metadata: {
            type: "chat",
            userId,
          },
        }
      );

      if (!memories[0]) {
        return {
          message: "I couldn't find any relevant information.",
          context: {
            relatedEntries: [],
            growthIndicators: [],
            suggestedActions: [
              "Start a new journal entry",
              "Review past entries",
            ],
          },
        };
      }

      const relevantContent = this.extractMessageContent(memories[0]?.message);
      const growthIndicators = this.extractGrowthIndicators(memories[0]);

      return {
        message: relevantContent || "I couldn't find any relevant information.",
        context: {
          relatedEntries: memories
            .slice(1)
            .map((r) => this.extractMessageContent(r.message))
            .filter((content): content is string => content !== undefined),
          growthIndicators: growthIndicators.map(
            (indicator) =>
              `${indicator.type} (${Math.round(
                indicator.confidence * 100
              )}%): ${indicator.evidence}`
          ),
          suggestedActions: this.generateSuggestedActions(memories[0]),
        },
      };
    } catch (error) {
      console.error("Failed to process chat message:", error);
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to process chat message"
      );
    }
  }

  private extractMessageContent(
    message: string | Message | undefined
  ): string | undefined {
    if (!message) return undefined;
    if (typeof message === "string") return message;
    return message.content;
  }

  private extractSentiment(memory: SearchResult): SentimentAnalysis {
    const score = memory?.score ?? 0;
    let label: SentimentAnalysis["label"] = "neutral";

    if (score > 0.3) label = "positive";
    else if (score < -0.3) label = "negative";

    return {
      score,
      label,
      confidence: Math.abs(score),
    };
  }

  private extractGrowthIndicators(memory: SearchResult): GrowthIndicator[] {
    const indicators: GrowthIndicator[] = [];
    const types: GrowthIndicator["type"][] = [
      "resilience",
      "effort",
      "challenge",
      "feedback",
      "learning",
    ];

    types.forEach((type) => {
      const confidence = Math.random(); // Replace with actual logic
      if (confidence > 0.5) {
        indicators.push({
          type,
          confidence,
          evidence: this.extractMessageContent(memory.message) || "",
        });
      }
    });

    return indicators;
  }

  private generateSuggestedActions(memory: SearchResult): string[] {
    const content = this.extractMessageContent(memory?.message);
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
