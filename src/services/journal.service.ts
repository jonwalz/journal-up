import { JournalRepository } from "../repositories/journal.repository";
import { AuthorizationError } from "../utils/errors";
import type { IJournal, IEntry, IGrowthIndicators } from "../types";
import { ZepClient } from "@getzep/zep-cloud";
import { env } from "../config/environment";

interface ZepMemory {
  message?: {
    content: string;
    metadata?: Record<string, unknown>;
  };
  score?: number;
}

export class JournalService {
  private journalRepository: JournalRepository;
  private zepClient: ZepClient;

  constructor() {
    this.journalRepository = new JournalRepository();
    this.zepClient = new ZepClient({
      apiKey: env.ZEP_API_KEY,
    });
  }

  async createJournal(userId: string, title: string): Promise<IJournal> {
    return await this.journalRepository.create(userId, title);
  }

  async getJournals(userId: string): Promise<IJournal[]> {
    return await this.journalRepository.findByUserId(userId);
  }

  async createEntry({
    userId,
    journalId,
    content,
    firstName,
    lastName,
    email,
  }: {
    userId: string;
    journalId: string;
    content: string;
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<IEntry> {
    // Verify journal ownership
    const journal = await this.journalRepository.findById(journalId);
    if (journal.userId !== userId) {
      throw new AuthorizationError("You do not have access to this journal");
    }

    // Create the entry
    const entry = await this.journalRepository.createEntry(journalId, content);

    // Create Zep graph data for the entry
    const graphData = {
      id: entry.id,
      content: entry.content,
      metadata: {
        type: "journal_entry",
        journalId: journal.id,
        userFirstName: firstName,
        userLastName: lastName,
        userEmail: email,
      },
    };

    // TODO: Chunk the entry.content into smaller chunks and update the zep client to use chunked data

    // Add the graph data to Zep
    const zepResult = await this.zepClient.graph.add({
      data: JSON.stringify(graphData),
      userId: userId,
      type: "json",
    });

    // Analyze the entry asynchronously
    this.analyzeEntry(entry.id, content).catch((error) => {
      console.error("Error analyzing entry:", error);
    });

    return entry;
  }

  async getEntries(userId: string, journalId: string): Promise<IEntry[]> {
    // Verify journal ownership
    const journal = await this.journalRepository.findById(journalId);
    if (journal.userId !== userId) {
      throw new AuthorizationError("You do not have access to this journal");
    }

    return await this.journalRepository.getEntries(journalId);
  }

  private async analyzeEntry(entryId: string, content: string): Promise<void> {
    try {
      // Analyze sentiment and growth indicators using Zep
      // const _memory = await this.zepClient.searchMemory("journal_entries", {
      //   text: content,
      //   meta: {
      //     type: "analysis",
      //     entryId,
      //   },
      // });
      // Extract sentiment and growth indicators using the memory results
      // const sentimentScore = this.extractSentiment(_memory);
      // const growthIndicators = this.extractGrowthIndicators(_memory);
      // Update the entry with analysis results
      // await this.journalRepository.updateEntry(entryId, {
      //   sentimentScore,
      //   growthIndicators,
      // });
    } catch (error) {
      console.error("Error analyzing entry:", error);
      throw error;
    }
  }

  private extractSentiment(_memory: ZepMemory): number {
    // Implement sentiment extraction logic
    // This is a placeholder implementation
    return Math.random() * 2 - 1; // Returns a value between -1 and 1
  }

  private extractGrowthIndicators(_memory: ZepMemory): IGrowthIndicators {
    // Implement growth indicators extraction logic
    // This is a placeholder implementation
    return {
      resilience: Math.random() * 10,
      effort: Math.random() * 10,
      challenge: Math.random() * 10,
      feedback: Math.random() * 10,
      learning: Math.random() * 10,
    };
  }
}
