import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Journal Up API",
          version: "0.0.1",
        },
      },
    })
  )
  .use(
    cors({
      origin: true, // Allow all origins since we're using relative URLs
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["content-type", "authorization", "x-session-token"],
      exposeHeaders: ["upgrade"], // Required for WebSocket
    })
  )
  .use(cookie())
  .onRequest(({ request }) => {
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`
    );
  })
  .onError(({ code, error, set }) => {
    console.error(`[${new Date().toISOString()}] Error:`, {
      code,
      error: error.message,
      stack: error.stack,
    });
    return { error: error.message };
  });
