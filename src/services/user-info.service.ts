import { UserInfoRepository } from "../repositories/user-info.repository";
import type { IUserInfo, ICreateUserInfo, IUpdateUserInfo } from "../types/user-info";
import { ValidationError } from "../utils/errors";

export class UserInfoService {
  private userInfoRepository: UserInfoRepository;

  constructor() {
    this.userInfoRepository = new UserInfoRepository();
  }

  async createUserInfo(data: ICreateUserInfo): Promise<IUserInfo> {
    this.validateUserInfo(data);
    return await this.userInfoRepository.create(data);
  }

  async getUserInfo(userId: string): Promise<IUserInfo> {
    return await this.userInfoRepository.findByUserId(userId);
  }

  async updateUserInfo(userId: string, data: IUpdateUserInfo): Promise<IUserInfo> {
    if (Object.keys(data).length === 0) {
      throw new ValidationError("No update data provided");
    }

    if (data.firstName || data.lastName) {
      this.validateNames(data.firstName, data.lastName);
    }

    return await this.userInfoRepository.update(userId, data);
  }

  async deleteUserInfo(userId: string): Promise<void> {
    await this.userInfoRepository.delete(userId);
  }

  private validateUserInfo(data: ICreateUserInfo): void {
    this.validateNames(data.firstName, data.lastName);

    if (data.timezone && !this.isValidTimezone(data.timezone)) {
      throw new ValidationError("Invalid timezone format");
    }

    if (data.growthGoals) {
      this.validateGrowthGoals(data.growthGoals);
    }
  }

  private validateNames(firstName?: string, lastName?: string): void {
    if (firstName !== undefined && firstName.trim().length === 0) {
      throw new ValidationError("First name cannot be empty");
    }
    if (lastName !== undefined && lastName.trim().length === 0) {
      throw new ValidationError("Last name cannot be empty");
    }
  }

  private validateGrowthGoals(goals: { shortTerm: string[]; longTerm: string[] }): void {
    if (!Array.isArray(goals.shortTerm) || !Array.isArray(goals.longTerm)) {
      throw new ValidationError("Growth goals must be arrays");
    }

    if (goals.shortTerm.some(goal => typeof goal !== "string") || 
        goals.longTerm.some(goal => typeof goal !== "string")) {
      throw new ValidationError("Growth goals must be strings");
    }
  }

  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (e) {
      return false;
    }
  }
}
