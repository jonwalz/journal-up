import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LangChainAIService } from "../langchain-ai.service";
import { AI_MODELS } from "../constants/models";

export const langchainAIServiceGemini = new LangChainAIService(
  new ChatGoogleGenerativeAI({
    model: AI_MODELS.GEMINI_PRO,
    temperature: 0.7,
  })
);
