import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../../config/environment";
import { SYSTEM_PROMPT } from "../../prompts/system.prompt";
import { AI_MODELS } from "./constants/models";
import type { IAIService } from "./interfaces/ai-service.interface";
import type { AIResponse } from "../../types/ai";

export class GoogleAIService implements IAIService {
  private model: GenerativeModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({
      model: AI_MODELS.GEMINI,
    });
  }

  async chat(message: string, context?: string): Promise<AIResponse> {
    const chat = this.model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
      },
      systemInstruction: `${SYSTEM_PROMPT}${
        context ? `. Here is some context about the user: ${context}` : ""
      }`,
    });

    const result = await chat.sendMessage(message);
    return {
      message: result.response.text(),
    };
  }

  async generateText(prompt: string): Promise<AIResponse> {
    const result = await this.model.generateContent(prompt);
    return {
      message: result.response.text(),
    };
  }

  async searchMemory(prompt: string): Promise<{ relevantMemories: string[] }> {
    const result = await this.model.generateContent(prompt);
    return { relevantMemories: [result.response.text()] };
  }
}

export const googleAIService = new GoogleAIService();
