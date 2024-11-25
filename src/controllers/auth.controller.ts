import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const authController = new Elysia({ prefix: "/auth" })
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
      const { sessionToken, user } = await authService.login(email, password);

      return {
        success: true,
        user,
        token: sessionToken,
      };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          token: t.String(),
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
  );
