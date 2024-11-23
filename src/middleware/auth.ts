import { Elysia } from "elysia";
import * as jose from "jose";
import { env } from "../config/environment";
import { AuthenticationError } from "../utils/errors";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

type AuthUser = {
  id: string;
  email: string;
};

export const authMiddleware = new Elysia().derive(
  {
    as: "global",
  },
  async ({ headers, path }): Promise<{ user: AuthUser }> => {
    if (path === "/swagger" || path === "/swagger/json") {
      return { user: { id: "swagger", email: "swagger" } };
    }
    const authHeader = headers.authorization;
    const sessionToken = headers["x-session-token"];

    if (!authHeader || !sessionToken) {
      throw new AuthenticationError("Missing authentication");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AuthenticationError("Invalid token format");
    }

    // Validate session first
    const isValidSession = await authService.validateSession(sessionToken);
    if (!isValidSession) {
      throw new AuthenticationError("Invalid or expired session");
    }

    try {
      const secret = new TextEncoder().encode(env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      return {
        user: payload as AuthUser,
      };
    } catch (error) {
      console.error("Failed to validate token:", error);
      throw new AuthenticationError("Invalid token");
    }
  }
);
