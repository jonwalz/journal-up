import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import { LangChainAIService } from "../langchain-ai.service";
import { AI_MODELS } from "../constants/models";
import { env } from "../../../config/environment";

export const langchainAIServiceGemini = new LangChainAIService(
  new ChatGoogleGenerativeAI({
    apiKey: env.GEMINI_API_KEY,
    model: AI_MODELS.GEMINI_PRO,
    temperature: 0.7,
  })
);

export const langchainAIServiceClaude = new LangChainAIService(
  new ChatAnthropic({
    apiKey: env.CLAUDE_API_KEY,
    model: AI_MODELS.CLAUDE,
    temperature: 0.7,
  })
);
