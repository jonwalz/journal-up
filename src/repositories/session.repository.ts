import { eq, lt } from "drizzle-orm";
import { db } from "../config/database";
import { sessions } from "../db/schema";
import { NotFoundError } from "../utils/errors";
import { randomUUID } from "crypto";

export interface ISession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SessionRepository {
  async create(userId: string): Promise<ISession> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        token: randomUUID(),
        expiresAt,
      })
      .returning();

    return session;
  }

  async findByToken(token: string): Promise<ISession> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      throw new NotFoundError("Session");
    }

    return session;
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async deleteByToken(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}
