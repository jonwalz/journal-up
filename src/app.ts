import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";

export const app = new Elysia({ aot: false })
  .use(
    swagger({
      documentation: {
        info: {
          title: "Journal Up API",
          version: "1.0.0",
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
