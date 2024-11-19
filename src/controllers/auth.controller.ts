import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";
import { ValidationError } from "../utils/errors";

export const authController = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async (ctx) => {
      const authService = new AuthService();

      const { token } = await authService.signup(
        ctx.body.email,
        ctx.body.password
      );

      if (!token) {
        return ctx.error(400, {
          message: "Failed to create user",
        });
      }

      ctx.cookie.token.value = token;
      return {
        message: "User created successfully",
      };
    },
    {
      response: {
        200: t.Object({
          message: t.String(),
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
    async ({ body, error, cookie }) => {
      const authService = new AuthService();
      const { token } = await authService.login(body.email, body.password);

      if (!token) {
        return error(400, {
          message: "Failed to create user",
        });
      }

      cookie.token.value = token;
      return {
        message: "Successfully",
      };
    },
    {
      200: t.Object({
        message: t.String(),
      }),
      400: t.Object({
        message: t.String(),
      }),
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
  );
