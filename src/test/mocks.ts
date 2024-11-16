import { mock } from "bun:test";

// Mock database
global.neon = () => ({
  sql: mock(() => Promise.resolve({ rows: [] })),
});

// Mock auth service
const mockAuthService = {
  async signup(email: string, password: string) {
    return {
      id: "test-user-id",
      email,
      token: "test-token",
    };
  },

  async login(email: string, password: string) {
    return {
      id: "test-user-id",
      email,
      token: "test-token",
    };
  },

  async validateToken(token: string) {
    return {
      id: "test-user-id",
      email: "test@example.com",
    };
  },
};

// Mock metrics service
const mockMetricsService = {
  async recordMetric(
    userId: string,
    type: string,
    value: number,
    notes?: string
  ) {
    return {
      id: "test-metric-id",
      userId,
      type,
      value,
      notes,
      timestamp: new Date(),
    };
  },

  async getMetrics(userId: string, startDate?: Date, endDate?: Date) {
    return [
      {
        id: "test-metric-id",
        userId,
        type: "mood",
        value: 7,
        timestamp: new Date(),
      },
    ];
  },

  async analyzeProgress(userId: string) {
    return {
      summary: {
        mood: {
          average: 7,
          trend: "stable",
        },
      },
    };
  },
};

// Mock service classes
// @ts-ignore
global.AuthService = class {
  constructor() {
    return mockAuthService;
  }
};

// @ts-ignore
global.MetricsService = class {
  constructor() {
    return mockMetricsService;
  }
};
