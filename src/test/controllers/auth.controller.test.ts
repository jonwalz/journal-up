import { describe, expect, test } from "bun:test";
import { authController } from "../../controllers/auth.controller";
import { createTestApp, request } from "../setup";

describe("Auth Controller", () => {
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
      expect(response.body.errors[0].type).toBe(50);
    });

    test("should return 422 for short password", async () => {
      const app = createTestApp().use(authController);

      const response = await request(app, "POST", "/auth/signup", {
        email: "test@example.com",
        password: "short",
      });

      expect(response.status).toBe(422);
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

      expect(response.status).toBe(500);
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
