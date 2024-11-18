import { Elysia } from "elysia";
import { SignJWT, jwtVerify } from "jose";

// Types
type JWTPayload = {
  [key: string]: any;
};

interface JWTPluginConfig {
  name?: string;
  secret?: string;
  secretKey?: string;
  exp?: string | number;
  alg?: string;
}

interface Store {
  env: {
    [key: string]: string;
  };
}

declare module "elysia" {
  interface ElysiaInstance {
    jwt: {
      sign: (payload: JWTPayload, context: any) => Promise<string>;
      verify: (token: string, context: any) => Promise<JWTPayload>;
    };
  }
}

export const jwt = (config: JWTPluginConfig = {}) => {
  const getSecret = (store: any) => {
    const typedStore = store as Store;
    const secret = config.secretKey
      ? typedStore.env[config.secretKey]
      : config.secret;

    if (!secret) {
      throw new Error("JWT secret is not configured");
    }

    return secret;
  };

  return new Elysia({
    name: config.name || "jwt",
  })
    .decorate("jwt", {
      sign: async function (payload: JWTPayload, context: any) {
        const secret = getSecret(context.store);
        const secretKey = new TextEncoder().encode(secret);

        const jwt = new SignJWT(payload)
          .setProtectedHeader({ alg: config.alg || "HS256" })
          .setIssuedAt();

        if (config.exp) {
          if (typeof config.exp === "string") {
            jwt.setExpirationTime(config.exp);
          } else {
            jwt.setExpirationTime(Math.floor(Date.now() / 1000) + config.exp);
          }
        }

        return await jwt.sign(secretKey);
      },
      verify: async function (token: string, context: any) {
        const secret = getSecret(context.store);
        const secretKey = new TextEncoder().encode(secret);

        try {
          const { payload } = await jwtVerify(token, secretKey);
          return payload as JWTPayload;
        } catch (error) {
          throw new Error("Invalid token");
        }
      },
    })
    .onError(({ error, set }) => {
      if (error.message === "Invalid token") {
        set.status = 401;
        return {
          status: 401,
          message: "Unauthorized - Invalid token",
        };
      }
      if (error.message === "JWT secret is not configured") {
        set.status = 500;
        return {
          status: 500,
          message: "Server configuration error",
        };
      }
    });
};
