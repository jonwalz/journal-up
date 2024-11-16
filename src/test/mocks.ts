/// <reference types="bun-types" />

declare global {
  var neon: () => { sql: ReturnType<typeof mock> };
  var AuthService: typeof MockAuthServiceClass;
  var MetricsService: typeof MockMetricsServiceClass;
}

import { mock } from "bun:test";

// Mock database
globalThis.neon = () => ({
  sql: mock(() => Promise.resolve({ rows: [] })),
});

// Mock auth service
class MockAuthServiceClass {
  async signup(_email: string, _password: string) {
    return {
      token: "test-token",
      id: "test-id",
      email: _email,
    };
  }

  async login(_email: string, _password: string) {
    return {
      token: "test-token",
      id: "test-id",
      email: _email,
    };
  }

  async validateToken(_token: string) {
    return {
      id: "test-id",
      email: "test@example.com",
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

  async getMetrics(_userId: string, _startDate?: Date, _endDate?: Date) {
    return [
      {
        id: "test-metric-id",
        userId: _userId,
        type: "test-type",
        value: 1,
        notes: "test-notes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async analyzeProgress(_userId: string) {
    return {
      totalEntries: 1,
      averageValue: 1,
      trend: "up",
      recommendations: ["test-recommendation"],
    };
  }
}

// Set up mock service classes
globalThis.AuthService = MockAuthServiceClass;
globalThis.MetricsService = MockMetricsServiceClass;

export {};
