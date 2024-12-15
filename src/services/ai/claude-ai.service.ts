import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/environment";
import { SYSTEM_PROMPT } from "../../prompts/system.prompt";
import { AI_MODELS } from "./constants/models";
import type { IAIService } from "./interfaces/ai-service.interface";
import type { AIResponse } from "../../types/ai";

export class ClaudeAIService implements IAIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: env.CLAUDE_API_KEY,
    });
  }

  async chat(message: string, context?: string): Promise<AIResponse> {
    const systemPrompt = `${SYSTEM_PROMPT}${
      context ? `. Here is some context about the user: ${context}` : ""
    }`;

    const response = await this.anthropic.messages.create({
      model: AI_MODELS.CLAUDE,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      system: systemPrompt,
    });

    return {
      message:
        response.content[0].type === "text" ? response.content[0].text : "",
    };
  }

  async generateText(prompt: string): Promise<AIResponse> {
    const response = await this.anthropic.messages.create({
      model: AI_MODELS.CLAUDE,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return {
      message:
        response.content[0].type === "text" ? response.content[0].text : "",
    };
  }

  async searchMemory(prompt: string): Promise<{ relevantMemories: string[] }> {
    const response = await this.anthropic.messages.create({
      model: AI_MODELS.CLAUDE,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return { relevantMemories: [response.content[0].type] };
  }
}

export const claudeAIService = new ClaudeAIService();
