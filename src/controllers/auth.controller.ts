import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";
import { ValidationError } from "../utils/errors";

const authService = new AuthService();

export const authController = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({ body, cookie, error }) => {
      const { email, password } = body;
      const { token, sessionToken } = await authService.signup(email, password);

      if (!token || !sessionToken) {
        return error(400, {
          message: "Failed to create user",
        });
      }

      cookie.token.value = token;
      return { success: true };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
        400: t.Object({
          message: t.String(),
        }),
      },
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
      }),
      error: ({ error }) => {
        if (error.message === "Validation Failed") {
          throw new ValidationError(error.message);
        }
        throw error;
      },
    }
  )
  .post(
    "/login",
    async ({ body, cookie, error }) => {
      const { email, password } = body;
      const { token, sessionToken } = await authService.login(email, password);

      if (!token || !sessionToken) {
        return error(400, {
          message: "Failed to create user",
        });
      }

      cookie.token.value = token;
      return { success: true };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
        400: t.Object({
          message: t.String(),
        }),
      },
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      error: ({ error }) => {
        if (error.message === "Validation Failed") {
          throw new ValidationError(error.message);
        }
        throw error;
      },
    }
  )
  .post(
    "/logout",
    async ({ headers, cookie }) => {
      const sessionToken = headers["x-session-token"];
      if (sessionToken) {
        await authService.logout(sessionToken);
      }
      cookie.token.value = "";
      return { success: true };
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
      },
    }
  );
