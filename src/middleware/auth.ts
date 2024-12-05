import { Elysia } from "elysia";
import { AuthenticationError } from "../utils/errors";
import { AuthService } from "../services/auth.service";
import { type AuthUser, verifyToken } from "../utils/jwt";

const authService = new AuthService();

const SWAGGER_PATHS = ["/swagger", "/swagger/json"] as const;
const SWAGGER_USER: AuthUser = { id: "swagger", email: "swagger" };

export const authMiddleware = new Elysia().derive(
  {
    as: "global",
  },
  async ({ headers, path }): Promise<{ user: AuthUser }> => {
    // Allow swagger access without authentication
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (SWAGGER_PATHS.includes(path as any)) {
      return { user: SWAGGER_USER };
    }

    const authHeader = headers.authorization;
    const sessionToken = headers["x-session-token"];

    if (!authHeader || !sessionToken) {
      throw new AuthenticationError(
        `Missing authentication: ${
          !authHeader ? "authorization" : "session token"
        }`
      );
    }

    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      throw new AuthenticationError("Invalid authorization header format");
    }

    // Validate session first to prevent unnecessary JWT validation
    const isValidSession = await authService.validateSession(sessionToken);
    if (!isValidSession) {
      throw new AuthenticationError("Invalid or expired session");
    }

    const user = await verifyToken(token);
    return { user };
  }
);
