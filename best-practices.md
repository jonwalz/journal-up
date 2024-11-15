# TypeScript and ElysiaJS Coding Standards

## 1. TypeScript Configuration

### 1.1 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "types": ["bun-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowUnreachableCode": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.2 ESLint Configuration (.eslintrc)

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier", "import"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      }
    ],
    "import/order": [
      "error",
      {
        "groups": [
          ["builtin", "external"],
          "internal",
          ["parent", "sibling", "index"]
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
  "settings": {
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

## 2. Project Structure

```
src/
├── config/           # Configuration files and environment variables
├── controllers/      # Route handlers
├── services/         # Business logic
├── repositories/     # Database interactions
├── middleware/       # Custom middleware
├── utils/           # Helper functions and utilities
├── types/           # TypeScript type definitions
├── validators/      # Request validation schemas
└── index.ts         # Application entry point
```

## 3. ElysiaJS Best Practices

### 3.1 Route Definition

```typescript
// Bad ❌
app.get("/users", (c) => {
  // Implementation
});

// Good ✅
app.group("/users", (app) =>
  app
    .get("/", getUsersHandler)
    .post("/", createUserHandler)
    .guard({
      beforeHandle: [authMiddleware],
    })
);
```

### 3.2 Controller Pattern

```typescript
// users.controller.ts
export class UsersController {
  constructor(private userService: IUserService) {}

  // Use method decorators for route handlers
  @Get("/")
  async getUsers(c: Context): Promise<Response> {
    try {
      const users = await this.userService.getUsers();
      return c.json(users);
    } catch (error) {
      return handleError(error, c);
    }
  }

  @Post("/")
  async createUser(c: Context): Promise<Response> {
    const data = await c.body;
    const validation = userSchema.safeParse(data);

    if (!validation.success) {
      return c.json(
        { error: "Validation failed", details: validation.error.issues },
        400
      );
    }

    try {
      const user = await this.userService.createUser(validation.data);
      return c.json(user, 201);
    } catch (error) {
      return handleError(error, c);
    }
  }
}
```

### 3.3 Middleware Implementation

```typescript
// Middleware type definition
type Middleware = (c: Context) => Promise<Response | void>;

// Example middleware with proper typing
const authMiddleware: Middleware = async (c) => {
  const token = c.req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ error: "No token provided" }, 401);
  }

  try {
    const decoded = await verifyToken(token);
    c.set("user", decoded);
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
};
```

## 4. TypeScript Coding Standards

### 4.1 Type Definitions

```typescript
// Bad ❌
type User = {
  id: string;
  name: string;
  age: number;
};

// Good ✅
interface IUser {
  id: string;
  name: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

// Use specific types instead of primitive types
type UserId = string;
type Email = string;
type Password = string;

interface ICreateUserDto {
  email: Email;
  password: Password;
  name: string;
}
```

### 4.2 Error Handling

```typescript
// Define custom error types
class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Use specific error types
class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Handler function
const handleError = (error: unknown, c: Context): Response => {
  if (error instanceof AppError) {
    return c.json(
      {
        status: "error",
        code: error.code,
        message: error.message,
        details: error.details,
      },
      error.statusCode
    );
  }

  console.error("Unexpected error:", error);
  return c.json(
    {
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
    500
  );
};
```

### 4.3 Async/Await

```typescript
// Bad ❌
const getUser = (id: string) => {
  return userRepository
    .findById(id)
    .then((user) => user)
    .catch((error) => {
      throw error;
    });
};

// Good ✅
const getUser = async (id: string): Promise<IUser> => {
  try {
    const user = await userRepository.findById(id);
    return user;
  } catch (error) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }
};
```

### 4.4 Dependency Injection

```typescript
// Define service interfaces
interface IUserService {
  getUsers(): Promise<IUser[]>;
  createUser(data: ICreateUserDto): Promise<IUser>;
}

// Implement service
class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  async createUser(data: ICreateUserDto): Promise<IUser> {
    // Implementation
  }
}

// Use dependency container
import { container } from "tsyringe";

container.register<IUserRepository>("UserRepository", UserRepository);
container.register<IUserService>("UserService", UserService);
```

## 5. Database Access

### 5.1 Repository Pattern

```typescript
interface IUserRepository {
  findById(id: string): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  create(data: ICreateUserDto): Promise<IUser>;
  update(id: string, data: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<void>;
}

class UserRepository implements IUserRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async findById(id: string): Promise<IUser> {
    const user = await this.db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }
    return user;
  }

  // Other implementations...
}
```

## 6. Validation

### 6.1 Request Validation

```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const validateRequest =
  (schema: z.Schema) =>
  async (c: Context): Promise<Response | void> => {
    const body = await c.body;
    const result = schema.safeParse(body);

    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          details: result.error.issues,
        },
        400
      );
    }

    c.set("validated", result.data);
  };
```

## 7. Testing

### 7.1 Unit Tests

```typescript
import { describe, it, expect, beforeEach } from "bun:test";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    userService = new UserService(mockRepository);
  });

  it("should create a user", async () => {
    const userData: ICreateUserDto = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    mockRepository.create.mockResolvedValue({
      id: "1",
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await userService.createUser(userData);
    expect(result.email).toBe(userData.email);
    expect(mockRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

## 8. Documentation

### 8.1 Code Documentation

```typescript
/**
 * Service responsible for user-related operations
 * @implements {IUserService}
 */
class UserService implements IUserService {
  /**
   * Creates a new user in the system
   * @param {ICreateUserDto} data - The user data
   * @throws {ValidationError} When the data is invalid
   * @throws {ConflictError} When the email already exists
   * @returns {Promise<IUser>} The created user
   */
  async createUser(data: ICreateUserDto): Promise<IUser> {
    // Implementation
  }
}
```

### 8.2 API Documentation

```typescript
import { OpenAPIRoute } from "@elysiajs/openapi";

app.use(
  OpenAPIRoute({
    path: "/docs",
    spec: {
      info: {
        title: "API Documentation",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  })
);
```

## 9. Performance Considerations

### 9.1 Database Queries

```typescript
// Bad ❌
const getUsers = async (): Promise<IUser[]> => {
  const users = await db.query("SELECT * FROM users");
  const posts = await Promise.all(
    users.map((user) =>
      db.query("SELECT * FROM posts WHERE user_id = $1", [user.id])
    )
  );
  return users.map((user, i) => ({ ...user, posts: posts[i] }));
};

// Good ✅
const getUsers = async (): Promise<IUser[]> => {
  return db.query(cd /Users/jonathanwalz/repos/2024/journal-up
  bun install
  bun run dev`
    SELECT u.*, json_agg(p.*) as posts
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
    GROUP BY u.id
  `);
};
```

### 9.2 Caching

```typescript
import { createClient } from "redis";

const cache = createClient();

const getCachedData = async <T>(
  key: string,
  getter: () => Promise<T>,
  ttl: number = 3600
): Promise<T> => {
  const cached = await cache.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await getter();
  await cache.set(key, JSON.stringify(data), "EX", ttl);
  return data;
};
```

Follow these standards consistently throughout the codebase to maintain high quality and maintainable code. Regular code reviews should ensure adherence to these standards.
