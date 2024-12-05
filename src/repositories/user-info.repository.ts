import { db } from "../config/database";
import { userInfo } from "../db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../utils/errors";
import type { IUserInfo, ICreateUserInfo, IUpdateUserInfo } from "../types/user-info";

export class UserInfoRepository {
  async create(data: ICreateUserInfo): Promise<IUserInfo> {
    const [userInfoRecord] = await db
      .insert(userInfo)
      .values({
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        timezone: data.timezone || "UTC",
        growthGoals: data.growthGoals || { shortTerm: [], longTerm: [] },
      })
      .returning();

    return userInfoRecord;
  }

  async findByUserId(userId: string): Promise<IUserInfo> {
    const userInfoRecord = await db.query.userInfo.findFirst({
      where: eq(userInfo.userId, userId),
    });

    if (!userInfoRecord) {
      throw new NotFoundError("User info not found");
    }

    return userInfoRecord;
  }

  async update(userId: string, data: IUpdateUserInfo): Promise<IUserInfo> {
    const [userInfoRecord] = await db
      .update(userInfo)
      .set({
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.growthGoals && { growthGoals: data.growthGoals }),
        updatedAt: new Date(),
      })
      .where(eq(userInfo.userId, userId))
      .returning();

    if (!userInfoRecord) {
      throw new NotFoundError("User info not found");
    }

    return userInfoRecord;
  }

  async delete(userId: string): Promise<void> {
    const result = await db
      .delete(userInfo)
      .where(eq(userInfo.userId, userId))
      .returning();

    if (!result.length) {
      throw new NotFoundError("User info not found");
    }
  }
}
