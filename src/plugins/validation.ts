import { Elysia } from "elysia";
import { AppError } from "../utils/errors";

export const validation = new Elysia().onError(({ error, set }) => {
  console.log("Validation error details:", JSON.stringify(error, null, 2));

  // Handle Elysia validation errors
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    error.type === "validation"
  ) {
    set.status = 422;
    return {
      errors: [
        {
          type: 52,
          message: error.message,
        },
      ],
    };
  }

  // Handle application errors
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  // Log unknown errors
  console.error("Unknown error:", error);

  // Let other errors propagate
  throw error;
});
