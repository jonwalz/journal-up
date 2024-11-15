# Growth Mindset Journal Application - Backend PRD

## 1. Overview

### 1.1 Product Purpose

A REST API backend service for a journaling application that incorporates growth mindset coaching techniques and leverages AI for personalized insights. The system uses long-term memory capabilities to provide context-aware interactions based on users' journal history.

### 1.2 Technical Stack

- Runtime: Bun
- Framework: ElysiaJS
- Database: Neon (Serverless PostgreSQL)
- Memory Store: Zep.ai
- API Documentation: OpenAPI/Swagger

### 1.3 Implementation Notes for LLM

When implementing this application:

1. Use TypeScript for all code implementation
2. Implement proper dependency injection patterns
3. Follow the repository pattern for data access
4. Use middleware for cross-cutting concerns
5. Implement proper error handling with custom error classes
6. Use environment variables for configuration
7. Follow SOLID principles

## 2. System Architecture

### 2.1 Core Components

1. Authentication Service

   ```typescript
   interface IAuthService {
     signup(email: string, password: string): Promise<User>;
     login(email: string, password: string): Promise<{ token: string }>;
     validateToken(token: string): Promise<User>;
     refreshToken(token: string): Promise<{ token: string }>;
   }
   ```

2. Journal Management Service

   ```typescript
   interface IJournalService {
     createJournal(userId: string, title: string): Promise<Journal>;
     getJournals(userId: string): Promise<Journal[]>;
     createEntry(journalId: string, content: string): Promise<Entry>;
     getEntries(journalId: string): Promise<Entry[]>;
   }
   ```

3. Mindset Metrics Service

   ```typescript
   interface IMetricsService {
     recordMetric(
       userId: string,
       type: MetricType,
       value: number
     ): Promise<Metric>;
     getMetrics(userId: string, timeRange?: DateRange): Promise<Metric[]>;
     analyzeProgress(userId: string): Promise<ProgressAnalysis>;
   }
   ```

4. AI Interaction Service

   ```typescript
   interface IAIService {
     initializeUserMemory(userId: string): Promise<void>;
     syncJournalToMemory(userId: string, entry: Entry): Promise<void>;
     chat(userId: string, message: string): Promise<AIResponse>;
   }
   ```

5. User Settings Service
   ```typescript
   interface ISettingsService {
     getSettings(userId: string): Promise<UserSettings>;
     updateSettings(
       userId: string,
       settings: Partial<UserSettings>
     ): Promise<UserSettings>;
   }
   ```

### 2.2 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);

-- Journals table
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journals_user_id ON journals(user_id);

-- Entries table
CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID REFERENCES journals(id),
    content TEXT NOT NULL,
    sentiment_score FLOAT,  -- Added for sentiment analysis
    growth_indicators JSONB, -- Store identified growth mindset indicators
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entries_journal_id ON entries(journal_id);
CREATE INDEX idx_entries_created_at ON entries(created_at);

-- Mindset metrics table
CREATE TABLE mindset_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    metric_type VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_metric_type CHECK (
        metric_type IN ('resilience', 'effort', 'challenge', 'feedback', 'learning')
    ),
    CONSTRAINT valid_metric_value CHECK (value BETWEEN 1 AND 10)
);

CREATE INDEX idx_metrics_user_id_recorded_at ON mindset_metrics(user_id, recorded_at);

-- User settings table
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    theme_preferences JSONB DEFAULT '{"mode": "light"}',
    privacy_settings JSONB DEFAULT '{"shareProgress": false, "allowAnalytics": true}',
    ai_interaction_settings JSONB DEFAULT '{"suggestionsEnabled": true, "reminderFrequency": "daily"}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_notification_prefs CHECK (
        jsonb_typeof(notification_preferences) = 'object'
        AND notification_preferences ? 'email'
        AND notification_preferences ? 'push'
    )
);
```

### 2.3 Type Definitions

```typescript
// Core types for the application
interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Journal {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Entry {
  id: string;
  journalId: string;
  content: string;
  sentimentScore?: number;
  growthIndicators?: GrowthIndicators;
  createdAt: Date;
  updatedAt: Date;
}

interface GrowthIndicators {
  resilience: number;
  effort: number;
  challenge: number;
  feedback: number;
  learning: number;
}

type MetricType =
  | "resilience"
  | "effort"
  | "challenge"
  | "feedback"
  | "learning";

interface Metric {
  id: string;
  userId: string;
  type: MetricType;
  value: number;
  notes?: string;
  recordedAt: Date;
}

interface UserSettings {
  userId: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
  themePreferences: {
    mode: "light" | "dark";
  };
  privacySettings: {
    shareProgress: boolean;
    allowAnalytics: boolean;
  };
  aiInteractionSettings: {
    suggestionsEnabled: boolean;
    reminderFrequency: "daily" | "weekly" | "monthly";
  };
}
```

## 3. API Endpoints

### 3.1 Authentication

```yaml
/auth:
  /signup:
    post:
      summary: Register new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                  example: "user@example.com"
                password:
                  type: string
                  format: password
                  minLength: 8
                  example: "SecurePass123!"
      responses:
        201:
          description: User created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: string
                  email: string
                  token: string
        400:
          description: Invalid input
          content:
            application/json:
              schema:
                type: object
                properties:
                  error: string
                  details: array
        409:
          description: Email already exists
          content:
            application/json:
              schema:
                type: object
                properties:
                  error: string

  /login:
    post:
      summary: Authenticate user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        200:
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token: string
                  refreshToken: string
                  expiresIn: number
        401:
          description: Invalid credentials
          content:
            application/json:
              schema:
                type: object
                properties:
                  error: string
```

[Previous sections 3.2-3.5 remain the same]

## 4. Security Requirements

### 4.1 Authentication

- JWT-based authentication
  ```typescript
  interface JWTPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
  }
  ```
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Token configuration:
  - Access token expiration: 1 hour
  - Refresh token expiration: 7 days
  - Token rotation on refresh
- Rate limiting:
  - Login: 5 attempts per minute
  - Signup: 3 attempts per minute
  - API endpoints: 100 requests per minute per user

### 4.2 Data Protection

```typescript
// Example middleware for request validation
const validateRequest = (schema: ValidationSchema) => async (c: Context) => {
  const body = await c.body;
  const validated = schema.safeParse(body);
  if (!validated.success) {
    return c.json(
      {
        error: "Validation failed",
        details: validated.error.issues,
      },
      400
    );
  }
  return c.next();
};

// Example CORS configuration
const corsConfig = {
  origin: ["https://your-frontend-domain.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  maxAge: 86400,
};
```

## 5. Performance Requirements

### 5.1 Response Time Targets

```typescript
interface PerformanceMetrics {
  responseTime: {
    p95: number; // 200ms
    p99: number; // 500ms
  };
  throughput: {
    requestsPerSecond: number; // 50
    concurrentUsers: number; // 1000
  };
  availability: {
    uptime: number; // 99.9%
    maxPlannedDowntime: number; // 4 hours/month
  };
}
```

### 5.2 Caching Strategy

```typescript
interface CacheConfig {
  // Redis cache configuration
  redis: {
    host: string;
    port: number;
    maxConnections: number;
  };
  // Cache TTL for different types of data
  ttl: {
    userSettings: number; // 1 hour
    journalList: number; // 5 minutes
    entryList: number; // 5 minutes
    metrics: number; // 10 minutes
  };
}
```

## 6. Zep Integration Requirements

### 6.1 Memory Management

```typescript
interface ZepConfig {
  apiKey: string;
  baseUrl: string;
  collections: {
    journals: string;
    metrics: string;
  };
  searchConfig: {
    maxResults: number;
    minRelevanceScore: number;
  };
}

interface MemorySession {
  userId: string;
  sessionId: string;
  created: Date;
  lastAccessed: Date;
  context: {
    recentEntries: Entry[];
    recentMetrics: Metric[];
    userPreferences: UserSettings;
  };
}
```

### 6.2 Integration Flow

1. Journal Entry Processing:

   ```typescript
   async function processJournalEntry(entry: Entry) {
     // 1. Store entry in database
     await journalRepository.save(entry);

     // 2. Analyze content
     const analysis = await analyzeContent(entry.content);

     // 3. Update Zep memory
     await zepClient.addMemory({
       userId: entry.userId,
       content: entry.content,
       metadata: {
         timestamp: entry.createdAt,
         sentiment: analysis.sentiment,
         topics: analysis.topics,
         growthIndicators: analysis.growthIndicators,
       },
     });

     // 4. Generate insights
     return await generateInsights(entry, analysis);
   }
   ```

2. Memory Context Management:
   ```typescript
   async function getConversationContext(userId: string) {
     return {
       recentEntries: await getRecentEntries(userId, 5),
       userMetrics: await getRecentMetrics(userId),
       growthTrends: await analyzeGrowthTrends(userId),
     };
   }
   ```

## 7. Monitoring and Logging

### 7.1 Logging Configuration

```typescript
interface LogConfig {
  level: "debug" | "info" | "warn" | "error";
  format: "json" | "text";
  destinations: {
    console: boolean;
    file: boolean;
    service: string; // e.g., 'datadog', 'cloudwatch'
  };
  retention: {
    days: number;
    maxSize: number;
  };
}
```

### 7.2 Metrics Collection

```typescript
interface SystemMetrics {
  // Resource utilization
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    free: number;
    cached: number;
  };
  // Application metrics
  api: {
    requestCount: number;
    errorCount: number;
    responseTime: number[];
  };
  database: {
    connectionCount: number;
    queryTime: number[];
    deadlocks: number;
  };
  zep: {
    requestCount: number;
    errorCount: number;
    latency: number[];
  };
}
```

## 8. Development Guidelines

### 8.1 Code Organization

```
src/
├── config/
│   ├── database.ts
│   ├── cache.ts
│   └── zep.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── journal.controller.ts
│   └── metrics.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── journal.service.ts
│   └── metrics.service.ts
├── repositories/
│   ├── user.repository.ts
│   ├── journal.repository.ts
│   └── metrics.repository.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── utils/
│   ├── logger.ts
│   ├── errors.ts
│   └── validators.ts
└── types/
    ├── domain.ts
    └── api.ts
```

### 8.2 Error Handling

````typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

// Error
### 8.2 Error Handling
```typescript
// Error handler middleware
const errorHandler = (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return c.json({
      status: 'error',
      code: err.code,
      message: err.message,
      details: err.details
    }, err.statusCode);
  }

  // Log unexpected errors
  logger.error('Unexpected error', { error: err });
  return c.json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  }, 500);
};

// Common error types
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  ZEP_INTEGRATION_ERROR = 'ZEP_INTEGRATION_ERROR',
}
````

### 8.3 Middleware Implementation

```typescript
// Authentication middleware
const authMiddleware = async (c: Context) => {
  const token = c.req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    throw new AppError(401, "No token provided", ErrorCodes.UNAUTHORIZED);
  }

  try {
    const decoded = await verifyToken(token);
    c.set("user", decoded);
    return c.next();
  } catch (error) {
    throw new AppError(401, "Invalid token", ErrorCodes.UNAUTHORIZED);
  }
};

// Rate limiting middleware
const rateLimitMiddleware = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (c: Context) => {
    throw new AppError(
      429,
      "Too many requests",
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  },
});
```

## 9. Growth Mindset Features

### 9.1 Mindset Analysis

```typescript
interface MindsetAnalysis {
  indicators: {
    resilience: number; // 0-10 scale
    effort: number; // 0-10 scale
    challenge: number; // 0-10 scale
    feedback: number; // 0-10 scale
    learning: number; // 0-10 scale
  };
  trends: {
    shortTerm: TrendAnalysis; // Last 7 days
    mediumTerm: TrendAnalysis; // Last 30 days
    longTerm: TrendAnalysis; // Last 90 days
  };
  recommendations: Array<{
    area: keyof MindsetIndicators;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }>;
}

interface TrendAnalysis {
  direction: "improving" | "declining" | "stable";
  changePercentage: number;
  confidenceScore: number;
}
```

### 9.2 AI Coaching Integration

```typescript
interface CoachingSystem {
  // Analysis of journal content
  contentAnalysis: {
    identifyMindsetPatterns(content: string): Promise<MindsetPatterns>;
    extractEmotionalTone(content: string): Promise<EmotionalTone>;
    detectChallenges(content: string): Promise<Challenge[]>;
  };

  // Coaching response generation
  responseGeneration: {
    generateCoachingPrompt(analysis: MindsetAnalysis): Promise<string>;
    createPersonalizedExercise(
      pattern: MindsetPatterns,
      difficulty: "beginner" | "intermediate" | "advanced"
    ): Promise<Exercise>;
    suggestNextSteps(analysis: MindsetAnalysis): Promise<Action[]>;
  };

  // Progress tracking
  progressTracking: {
    calculateGrowthScore(metrics: MindsetMetric[]): number;
    identifyStrengths(history: MindsetAnalysis[]): string[];
    suggestImprovementAreas(history: MindsetAnalysis[]): string[];
  };
}

interface MindsetPatterns {
  fixedMindsetTriggers: string[];
  growthMindsetIndicators: string[];
  behavioralPatterns: {
    pattern: string;
    frequency: number;
    impact: "positive" | "negative";
  }[];
}
```

## 10. Database Optimization

### 10.1 Indexing Strategy

```sql
-- Performance optimization indexes
CREATE INDEX idx_entries_user_journal ON entries(journal_id, created_at DESC);
CREATE INDEX idx_metrics_analysis ON mindset_metrics(user_id, metric_type, recorded_at DESC);
CREATE INDEX idx_journal_search ON journals USING GIN (to_tsvector('english', title));
CREATE INDEX idx_entry_search ON entries USING GIN (to_tsvector('english', content));

-- Partial indexes for common queries
CREATE INDEX idx_active_users ON users (id)
WHERE last_activity_at > NOW() - INTERVAL '30 days';

CREATE INDEX idx_recent_entries ON entries (journal_id, created_at)
WHERE created_at > NOW() - INTERVAL '7 days';
```

### 10.2 Query Optimization

```typescript
interface QueryOptimization {
  // Pagination configuration
  pagination: {
    defaultLimit: number;
    maxLimit: number;
    defaultOrder: "DESC" | "ASC";
  };

  // Eager loading relationships
  eagerLoading: {
    journals: ["entries", "metrics"];
    entries: ["journal", "metrics"];
    metrics: ["user"];
  };

  // Query timeouts
  timeouts: {
    read: number; // milliseconds
    write: number; // milliseconds
    long: number; // milliseconds, for reports/analytics
  };
}
```

## 11. Deployment Configuration

### 11.1 Environment Variables

```typescript
interface EnvironmentConfig {
  app: {
    port: number;
    env: "development" | "staging" | "production";
    debug: boolean;
  };
  database: {
    url: string;
    poolSize: number;
    ssl: boolean;
  };
  auth: {
    jwtSecret: string;
    tokenExpiry: string;
    refreshTokenExpiry: string;
  };
  zep: {
    apiKey: string;
    baseUrl: string;
    timeout: number;
  };
  cache: {
    url: string;
    ttl: number;
  };
  monitoring: {
    enabled: boolean;
    service: string;
    apiKey: string;
  };
}
```

### 11.2 Migration Strategy

```typescript
interface MigrationConfig {
  // Migration settings
  migrations: {
    directory: string;
    tableName: string;
    schemaName: string;
  };

  // Rollback settings
  rollback: {
    enabled: boolean;
    steps: number;
  };

  // Deployment hooks
  hooks: {
    preMigration: () => Promise<void>;
    postMigration: () => Promise<void>;
    onError: (error: Error) => Promise<void>;
  };
}
```

## 12. Testing Strategy

### 12.1 Test Configuration

```typescript
interface TestConfig {
  // Test environment settings
  environment: {
    database: string;
    port: number;
    mockExternalServices: boolean;
  };

  // Coverage requirements
  coverage: {
    statements: number; // 80%
    branches: number; // 75%
    functions: number; // 80%
    lines: number; // 80%
  };

  // Test timeouts
  timeouts: {
    unit: number; // 5000ms
    integration: number; // 10000ms
    e2e: number; // 30000ms
  };
}
```

### 12.2 Test Examples

```typescript
// Example unit test for journal service
describe("JournalService", () => {
  it("should create new journal entry", async () => {
    const entry = await journalService.createEntry({
      journalId: "test-id",
      content: "Test content",
      userId: "user-id",
    });

    expect(entry).toMatchObject({
      id: expect.any(String),
      content: "Test content",
      createdAt: expect.any(Date),
    });
  });
});

// Example integration test for metrics
describe("Metrics Integration", () => {
  it("should track mindset progress over time", async () => {
    const metrics = await metricsService.analyzeProgress("user-id", {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    });

    expect(metrics).toMatchObject({
      trend: expect.any(String),
      score: expect.any(Number),
      recommendations: expect.any(Array),
    });
  });
});
```
