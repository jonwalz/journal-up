import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../config/environment";
import { AuthenticationError } from "../utils/errors";

type AuthUser = {
  id: string;
  email: string;
};

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  )
  .derive(
    {
      as: "global",
    },
    async ({ jwt, headers }): Promise<{ user: AuthUser }> => {
      const authorization = headers.authorization;
      if (!authorization) {
        throw new AuthenticationError("No authorization header");
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        throw new AuthenticationError("Invalid authorization format");
      }

      const payload = await jwt.verify(token);
      if (!payload) {
        throw new AuthenticationError("Invalid token");
      }

      return {
        user: payload as AuthUser,
      };
    }
  );
