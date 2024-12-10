export interface AIResponse {
  message: string;
  context?: {
    sessionId?: string;
    relatedEntries?: string[];
    growthIndicators?: string[];
    suggestedActions?: string[];
  };
}

export interface MemorySearchResult {
  relevantMemories: string[];
  score: number;
}

export interface GrowthIndicator {
  type: "resilience" | "effort" | "challenge" | "feedback" | "learning";
  confidence: number;
  evidence: string;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: "positive" | "negative" | "neutral";
  confidence: number;
}
