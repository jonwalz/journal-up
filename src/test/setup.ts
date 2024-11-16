import "./test.env"; // Import test environment first
import "./mocks"; // Import mocks before other imports
import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { jwt } from "@elysiajs/jwt";
import { beforeAll } from "bun:test";
import { setupTestDatabase } from "./db-setup";

export const TEST_USER_ID = "test-user-id";
export const TEST_USER_EMAIL = "test@example.com";
export let TEST_TOKEN: string;

// Initialize test token
const jwtPlugin = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET!,
});

// Set up test database and mock auth service
beforeAll(async () => {
  // Set up test database
  await setupTestDatabase();
});

// Test app creation helper
interface TestAppOptions {
  auth?: boolean;
}

export function createTestApp(options: TestAppOptions = {}) {
  const app = new Elysia()
    .onError(({ error, set }) => {
      // Handle Elysia validation errors
      if ("type" in error && error.type === "validation") {
        set.status = 400;
        return {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation Failed",
          },
        };
      }
      throw error;
    })
    .use(jwtPlugin);

  if (options.auth) {
    app.use(authMiddleware);
  }

  return app;
}

// Test request helper
export async function request(
  app: Elysia,
  method: string,
  path: string,
  body?: Record<string, unknown>,
  token?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await app.handle(
      new Request(`http://localhost${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
    );

    let responseBody;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    return {
      status: response.status,
      body: responseBody,
    };
  } catch (error: unknown) {
    // Handle Elysia validation errors
    if (error && typeof error === 'object' && 'type' in error && error.type === 'validation') {
      return {
        status: 400,
        body: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation Failed",
          },
        },
      };
    }
    throw error;
  }
}
