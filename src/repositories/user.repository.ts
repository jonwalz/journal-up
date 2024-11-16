import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users } from "../db/schema";
import type { IUser } from "../types";
import { NotFoundError, ConflictError } from "../utils/errors";

export class UserRepository {
  async create(email: string, passwordHash: string): Promise<IUser> {
    try {
      const [user] = await db
        .insert(users)
        .values({ email, passwordHash })
        .returning();

      return user;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === "23505") {
        // unique violation
        throw new ConflictError("Email already exists");
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  async findById(id: string): Promise<IUser> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();

    if (!user) {
      throw new NotFoundError("User");
    }
  }
}
