import * as jose from "jose";
import { env } from "../config/environment";

export async function generateToken(payload: { sub: string }): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}
