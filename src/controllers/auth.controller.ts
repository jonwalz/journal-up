import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";
import { validation } from "../plugins/validation";

const authService = new AuthService();

export const authController = new Elysia({ prefix: "/auth" })
  .use(validation)
  .post(
    "/signup",
    async ({ body, cookie }) => {
      const { email, password } = body;
      const { sessionToken } = await authService.signup(email, password);

      // Set cookies and return response
      cookie.token.value = sessionToken;
      return {
        success: true,
      };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
        422: t.Object({
          error: t.Object({
            code: t.String(),
            message: t.String(),
            details: t.Optional(
              t.Array(
                t.Object({
                  type: t.Number(),
                  schema: t.Record(t.String(), t.Any()),
                  path: t.String(),
                  value: t.Any(),
                  message: t.String(),
                  summary: t.String(),
                })
              )
            ),
          }),
        }),
      },
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 5 }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body }) => {
      const { email, password } = body;
      const { sessionToken, user, token } = await authService.login(
        email,
        password
      );

      return {
        success: true,
        user,
        sessionToken,
        token,
      };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          token: t.String(),
          sessionToken: t.String(),
          user: t.Object({
            id: t.String(),
          }),
        }),
        404: t.Object({
          error: t.Object({
            code: t.String(),
            message: t.String(),
          }),
        }),
        422: t.Object({
          error: t.Object({
            code: t.String(),
            message: t.String(),
            details: t.Optional(
              t.Array(
                t.Object({
                  type: t.Number(),
                  schema: t.Record(t.String(), t.Any()),
                  path: t.String(),
                  value: t.Any(),
                  message: t.String(),
                  summary: t.String(),
                })
              )
            ),
          }),
        }),
      },
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .post(
    "/logout",
    async ({ headers }) => {
      const sessionToken = headers["x-session-token"];
      if (sessionToken) {
        await authService.logout(sessionToken);
      }

      return {
        success: true,
      };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
      },
    }
  )
  .post(
    "/verify-session-token",
    async ({ headers }) => {
      const sessionToken = headers["x-session-token"];
      if (!sessionToken) {
        throw new Error("No session token provided");
      }

      const isValid = await authService.verifySessionToken(sessionToken);
      return { valid: isValid };
    },
    {
      response: t.Object({
        valid: t.Boolean(),
      }),
    }
  )
  .post(
    "/verify-auth-token",
    async ({ headers }) => {
      const authHeader = headers.authorization;
      if (!authHeader) {
        throw new Error("No authorization header provided");
      }

      const token = authHeader.replace("Bearer ", "");
      const isValid = await authService.verifyAuthToken(token);
      return { valid: isValid };
    },
    {
      response: t.Object({
        valid: t.Boolean(),
      }),
    }
  );
