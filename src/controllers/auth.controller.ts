import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";
import { ValidationError } from "../utils/errors";

export const authController = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async (ctx) => {
      console.log("Creating user...");
      const authService = new AuthService();

      return await authService.signup(ctx.body.email, ctx.body.password);
    },
    {
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
    async ({ body }) => {
      const authService = new AuthService();
      return await authService.login(body.email, body.password);
    },
    {
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
