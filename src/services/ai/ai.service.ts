import { ZepClient } from "@getzep/zep-cloud";
import type {
  AIResponse,
  GrowthIndicator,
  MemorySearchResult,
  SentimentAnalysis,
} from "../../types/ai";
import { env } from "../../config/environment";
import type { IEntry } from "../../types";
import { AppError } from "../../utils/errors";
import { langchainAIServiceClaude } from "./instances";

export class AIService {
  private zepClient: ZepClient;
  private readonly COLLECTION_NAME = "journal-entries";

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
        }
      );

      if (!memories[0]) {
        return { relevantMemories: [], score: 0 };
      }

      return this.convertZepMemoryResult(memories[0]);
    } catch (error) {
      console.error("Failed to search memory:", error);
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to search memory");
    }
  }

  async chat(
    userId: string,
    message: string,
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    const sessionId = Math.random().toString(36).slice(2);

    try {
      // Create zep memory session
      await this.zepClient.memory.addSession({
        sessionId,
        userId,
      });

      // Add message to memory
      await this.zepClient.memory.add(sessionId, {
        messages: [
          {
            content: message,
            roleType: "user",
            metadata: {
              type: "chat",
              userId,
            },
          },
        ],
      });

      // Get session memory
      const zepSession = await this.zepClient.memory.get(sessionId);

      // Parse message and add zepSession.facts as context
      const parsedMessage = JSON.parse(message);
      const messageWithContext = [
        ...parsedMessage,
        { context: zepSession.context },
      ];
      console.log("Message with context:", messageWithContext);

      // Use LangChain for chat with streaming support
      const response = await langchainAIServiceClaude.chat(
        userId,
        JSON.stringify(messageWithContext),
        onProgress
      );

      console.log("AI Chat Response:", response);
      // Store AI response in memory
      await this.zepClient.memory.add(sessionId, {
        messages: [
          {
            content: response.message,
            roleType: "assistant",
            metadata: {
              type: "chat",
              userId,
            },
          },
        ],
      });

      return response;
    } catch (error) {
      console.error("Failed to process chat message:", error);
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to process chat message"
      );
    }
  }

  async generateText(prompt: string): Promise<AIResponse> {
    try {
      const response = await langchainAIServiceClaude.generateText(prompt);
      return { message: response };
    } catch (error) {
      console.error("Failed to generate text:", error);
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to generate text");
    }
  }

  private extractMessageContent(
    message: string | undefined
  ): string | undefined {
    if (!message) return undefined;
    return message;
  }

  private extractSentiment(memory: MemorySearchResult): SentimentAnalysis {
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

  private extractGrowthIndicators(
    memory: MemorySearchResult
  ): GrowthIndicator[] {
    const content = this.extractMessageContent(memory.relevantMemories[0]);
    if (!content) return [];

    const indicators = content
      .split("\n")
      .filter((line: string) => line.startsWith("- Indicator:"))
      .map((line: string) => {
        const [type, evidence] = line
          .replace("- Indicator:", "")
          .split(":")
          .map((s) => s.trim());
        return {
          type: type.toLowerCase() as GrowthIndicator["type"],
          evidence: evidence || "",
          confidence: memory?.score || 0,
        };
      });

    return indicators.length > 0
      ? indicators
      : [
          {
            type: "learning",
            evidence: "No specific indicators found",
            confidence: 0,
          },
        ];
  }

  private generateSuggestedActions(memory: MemorySearchResult): string[] {
    const content = this.extractMessageContent(memory.relevantMemories[0]);
    if (!content) return [];

    const actions = content
      .split("\n")
      .filter((line: string) => line.startsWith("- Action:"))
      .map((line: string) => line.replace("- Action:", "").trim());

    return actions.length > 0
      ? actions
      : ["Reflect on your progress", "Set a new goal", "Review past entries"];
  }

  private convertZepMemoryResult(zepMemory: any): MemorySearchResult {
    return {
      relevantMemories: [zepMemory.message?.content || ""],
      score: zepMemory.score || 0,
    };
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

      const convertedMemory = this.convertZepMemoryResult(memories[0]);
      const sentiment = this.extractSentiment(convertedMemory);
      const growthIndicators = this.extractGrowthIndicators(convertedMemory);

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

      const convertedMemory = this.convertZepMemoryResult(memories[0]);
      const sentiment = this.extractSentiment(convertedMemory);
      const growthIndicators = this.extractGrowthIndicators(convertedMemory);

      return {
        sentiment,
        growthIndicators,
      };
    } catch (error) {
      console.error("Failed to analyze entry:", error);
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to analyze entry");
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
}

export const aiService = new AIService();
