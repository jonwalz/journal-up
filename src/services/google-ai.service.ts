import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../config/environment";
import { SYSTEM_PROMPT } from "../prompts/system.prompt";

const MODEL_NAME = "models/gemini-1.5-flash";

export class GoogleAIService {
  private model: GenerativeModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });
  }

  async chat(message: string, context?: string): Promise<string> {
    const chat = this.model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
      },
      systemInstruction: `${SYSTEM_PROMPT}${
        context ? `. Here is some context about the user: ${context}` : ""
      }`,
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}

export const googleAIService = new GoogleAIService();
