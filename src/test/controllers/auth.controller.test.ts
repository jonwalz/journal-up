import { describe, expect, test, beforeEach } from "bun:test";
import { authController } from "../../controllers/auth.controller";
import { createTestApp, request } from "../setup";
import { sql } from "../../config/database";

describe("Auth Controller", () => {
  beforeEach(async () => {
    // Clean up the database before each test using CASCADE
    await sql`TRUNCATE TABLE users CASCADE;`;
  });

  describe("POST /auth/signup", () => {
    test("should successfully create a new user", async () => {
      const app = createTestApp().use(authController);

      const response = await request(app, "POST", "/auth/signup", {
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 422 for invalid email", async () => {
      const app = createTestApp().use(authController);

      const response = await request(app, "POST", "/auth/signup", {
        email: "invalid-email",
        password: "password123",
      });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toHaveLength(1);

      const error = JSON.parse(response.body.errors[0].message);
      expect(error.message).toBe("Expected string to match 'email' format");
      expect(response.body.errors[0].type).toBe(52);
    });

    test("should return 422 for short password", async () => {
      const app = createTestApp().use(authController);

      const response = await request(app, "POST", "/auth/signup", {
        email: "test@example.com",
        password: "123",
      });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toHaveLength(1);

      const error = JSON.parse(response.body.errors[0].message);
      expect(error.message).toBe(
        "Expected string length greater or equal to 5"
      );
      expect(response.body.errors[0].type).toBe(52);
    });
  });

  describe("POST /auth/login", () => {
    test("should successfully login user", async () => {
      const app = createTestApp().use(authController);

      // First create a user
      await request(app, "POST", "/auth/signup", {
        email: "test@example.com",
        password: "password123",
      });

      // Then try to login
      const response = await request(app, "POST", "/auth/login", {
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should return 404 for non-existent user", async () => {
      const app = createTestApp().use(authController);

      const response = await request(app, "POST", "/auth/login", {
        email: "wrong@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBe("User not found");
    });
  });

  describe("POST /auth/logout", () => {
    test("should successfully logout user", async () => {
      const app = createTestApp().use(authController);

      const response = await request(
        app,
        "POST",
        "/auth/logout",
        undefined,
        "test-token"
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should succeed even without session token", async () => {
      const app = createTestApp().use(authController);

      const response = await request(app, "POST", "/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
