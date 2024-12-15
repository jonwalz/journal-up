import type { AIResponse } from "../../../types/ai";

export interface IAIService {
  chat(userId: string, message: string): Promise<AIResponse>;
  generateText(prompt: string): Promise<string>;
  searchMemory(prompt: string): Promise<{ relevantMemories: string[] }>;
}
