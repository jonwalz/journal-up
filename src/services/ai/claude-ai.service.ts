import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/environment";
import { SYSTEM_PROMPT } from "../../prompts/system.prompt";
import { AI_MODELS } from "./constants/models";
import type { IAIService } from "./interfaces/ai-service.interface";

export class ClaudeAIService implements IAIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: env.CLAUDE_API_KEY,
    });
  }

  async chat(message: string, context?: string): Promise<string> {
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

    return response.content[0].type === "text" ? response.content[0].text : "";
  }

  async generateText(prompt: string): Promise<string> {
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

    return response.content[0].type === "text" ? response.content[0].text : "";
  }
}

export const claudeAIService = new ClaudeAIService();
