import { Elysia, t } from "elysia";
import { ValidationError } from "../utils/errors";

export const testController = new Elysia({ prefix: "/test" }).post(
  "/signup",
  async () => {
    return { message: "Hello, World!" };
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
);
