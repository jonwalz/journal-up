import * as jose from "jose";
import { UserRepository } from "../repositories/user.repository";
import { AuthenticationError } from "../utils/errors";
import { env } from "../config/environment";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(email: string, password: string): Promise<{ token: string }> {
    const passwordHash = await Bun.password.hash(password);
    const user = await this.userRepository.create(email, passwordHash);

    const token = await this.generateToken(user);
    return { token };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    try {
      const user = await this.userRepository.findByEmail(email);
      const isValid = await Bun.password.verify(password, user.passwordHash);

      if (!isValid) {
        throw new AuthenticationError("Invalid credentials");
      }

      const token = await this.generateToken(user);
      return { token };
    } catch (error) {
      throw new AuthenticationError("Invalid credentials");
    }
  }

  private async generateToken(user: {
    id: string;
    email: string;
  }): Promise<string> {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    return await new jose.SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);
  }
}
