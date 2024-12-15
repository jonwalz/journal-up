import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LangChainAIService } from "./langchain-ai.service";

export const langchainAIServiceGemini = new LangChainAIService(
  new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    temperature: 0.7,
  })
);
