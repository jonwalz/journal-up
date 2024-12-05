import * as jose from "jose";
import { env } from "../config/environment";
import { AuthenticationError } from "./errors";

export interface JWTPayload {
  sub: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

function isJWTPayload(payload: unknown): payload is JWTPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "sub" in payload &&
    "email" in payload &&
    typeof (payload as any).sub === "string" &&
    typeof (payload as any).email === "string"
  );
}

export async function generateToken(user: {
  id: string;
  email: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  return await new jose.SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthUser> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    if (!isJWTPayload(payload)) {
      throw new AuthenticationError("Invalid token payload structure");
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    console.error("[Auth] JWT validation failed:", error);
    throw new AuthenticationError("Invalid token");
  }
}
