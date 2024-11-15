import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { env } from "./config/environment";

export const app = new Elysia()
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
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  );
