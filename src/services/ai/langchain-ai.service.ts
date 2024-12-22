import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { SYSTEM_PROMPT } from "../../prompts/system.prompt";
import type { AIResponse } from "../../types/ai";
import { AppError } from "../../utils/errors";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import type { Memory } from "@getzep/zep-cloud/api/types/Memory";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface Conversation {
  messages: ChatMessage[];
  lastActive: Date;
}

export class LangChainAIService {
  private llm: BaseChatModel;
  private conversations: Map<string, Conversation> = new Map();

  constructor(llm: BaseChatModel) {
    this.llm = llm;
  }

  async chat(
    userId: string,
    message: string,
    onProgress?: (chunk: string) => void
  ): Promise<AIResponse> {
    try {
      // Get or create conversation
      let conversation = this.conversations.get(userId);
      if (!conversation) {
        conversation = {
          messages: [],
          lastActive: new Date(),
        };
        this.conversations.set(userId, conversation);
      }

      // Add user message to history
      conversation.messages.push({
        role: "user",
        content: message,
        timestamp: new Date(),
      });

      // Convert messages to LangChain format
      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...conversation.messages.map((msg) =>
          msg.role === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        ),
      ];

      let fullResponse = "";

      // Get streaming response from LLM
      const stream = await this.llm.stream(messages);

      for await (const chunk of stream) {
        const chunkText = String(chunk.content);
        fullResponse += chunkText;

        // Send progress if callback is provided
        if (onProgress) {
          onProgress(chunkText);
        }
      }

      // Add AI response to history
      conversation.messages.push({
        role: "ai",
        content: fullResponse,
        timestamp: new Date(),
      });

      // Update last active time
      conversation.lastActive = new Date();

      return {
        message: fullResponse,
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

  async generateText(prompt: string, zepSession?: Memory): Promise<string> {
    try {
      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...(zepSession?.messages?.map((msg: any) =>
          msg.role === "human"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        ) || []),
        new HumanMessage(prompt),
      ];

      const response = await this.llm.invoke(messages);
      return String(response.content);
    } catch (error) {
      throw new AppError(
        500,
        "AI_SERVICE_ERROR",
        "Failed to generate text",
        error
      );
    }
  }

  async searchMemory(prompt: string): Promise<{ relevantMemories: string[] }> {
    try {
      const response = await this.generateText(prompt);
      // Split the response into separate insights
      const memories = response
        .split("\n")
        .filter((line) => line.trim().length > 0);
      return { relevantMemories: memories };
    } catch (error) {
      console.error("Failed to search memory:", error);
      throw new AppError(500, "AI_SERVICE_ERROR", "Failed to search memory");
    }
  }

  // Clean up old conversations (optional)
  cleanupOldConversations(maxAge: number = 86400000) {
    // 24 hours
    const now = new Date().getTime();
    for (const [userId, conversation] of this.conversations.entries()) {
      if (now - conversation.lastActive.getTime() > maxAge) {
        this.conversations.delete(userId);
      }
    }
  }
}
