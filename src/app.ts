import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";

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
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET,
      exp: "7d",
    })
  );
