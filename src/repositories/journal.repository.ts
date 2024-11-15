import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { journals, entries } from "../db/schema";
import type { IJournal, IEntry } from "../types";
import { NotFoundError } from "../utils/errors";

export class JournalRepository {
  async create(userId: string, title: string): Promise<IJournal> {
    const [journal] = await db
      .insert(journals)
      .values({ userId, title })
      .returning();

    return journal;
  }

  async findById(id: string): Promise<IJournal> {
    const [journal] = await db
      .select()
      .from(journals)
      .where(eq(journals.id, id))
      .limit(1);

    if (!journal) {
      throw new NotFoundError("Journal");
    }

    return journal;
  }

  async findByUserId(userId: string): Promise<IJournal[]> {
    return await db.select().from(journals).where(eq(journals.userId, userId));
  }

  async createEntry(journalId: string, content: string): Promise<IEntry> {
    const [entry] = await db
      .insert(entries)
      .values({ journalId, content })
      .returning();

    return entry;
  }

  async getEntries(journalId: string): Promise<IEntry[]> {
    return await db
      .select()
      .from(entries)
      .where(eq(entries.journalId, journalId));
  }

  async updateEntry(id: string, updates: Partial<IEntry>): Promise<IEntry> {
    const validFields = ["content"];

    const updateFields = Object.entries(updates)
      .filter(([key]) => validFields.includes(key))
      .map(([key, value]) => ({
        key,
        value,
      }));

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    const updateValues = Object.fromEntries(
      updateFields.map(({ key, value }) => [key, value])
    );

    const [entry] = await db
      .update(entries)
      .set(updateValues)
      .where(eq(entries.id, id))
      .returning();

    if (!entry) {
      throw new NotFoundError("Entry");
    }

    return entry;
  }
}
