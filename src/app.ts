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
  .use(cors())
  .use(cookie())
  .onRequest(({ request }) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`${request.method} ${request.url}`);
    }
  });
