import type { Memory } from "@getzep/zep-cloud/wrapper/memory";
import type { AIResponse } from "../../../types/ai";

export interface IAIService {
  chat(userId: string, message: string): Promise<AIResponse>;
  generateText(prompt: string, zepSession?: Memory): Promise<AIResponse>;
  searchMemory(prompt: string): Promise<{ relevantMemories: string[] }>;
}
