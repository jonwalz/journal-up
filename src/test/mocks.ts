/// <reference types="bun-types" />

declare global {
  var neon: () => { sql: ReturnType<typeof mock> };
  var UserRepository: typeof MockUserRepository;
  var SessionRepository: typeof MockSessionRepository;
  var MetricsService: typeof MockMetricsServiceClass;
}

import { mock } from "bun:test";
import { AuthenticationError } from "../utils/errors";
import type { IUser } from "../types";

// Mock database
globalThis.neon = () => ({
  sql: mock(() => Promise.resolve({ rows: [] })),
});

// Mock repositories
class MockUserRepository {
  async create(email: string, passwordHash: string): Promise<IUser> {
    return {
      id: "test-id",
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findByEmail(email: string): Promise<IUser> {
    if (email !== "test@example.com") {
      throw new AuthenticationError("User not found");
    }
    return {
      id: "test-id",
      email,
      passwordHash: await Bun.password.hash("password123"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

class MockSessionRepository {
  async create(userId: string) {
    return {
      id: "test-session-id",
      userId,
      token: "test-session-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteByUserId(userId: string) {
    // Do nothing in mock
  }

  async deleteByToken(token: string) {
    // Do nothing in mock
  }

  async findByToken(token: string) {
    return {
      id: "test-session-id",
      userId: "test-id",
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Mock metrics service
class MockMetricsServiceClass {
  async recordMetric(
    _userId: string,
    _type: string,
    _value: number,
    _notes?: string
  ) {
    return {
      id: "test-metric-id",
      userId: _userId,
      type: _type,
      value: _value,
      notes: _notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getMetrics(_userId: string) {
    return [];
  }

  async analyzeProgress(_userId: string) {
    return {
      trends: [],
      insights: [],
      recommendations: [],
    };
  }
}

// Set up mock classes
globalThis.UserRepository = MockUserRepository;
globalThis.SessionRepository = MockSessionRepository;
globalThis.MetricsService = MockMetricsServiceClass;

export {};
