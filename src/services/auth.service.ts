import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { AuthenticationError, NotFoundError } from "../utils/errors";
import { generateToken } from "../utils/jwt";

export interface AuthResponse {
  token: string;
  sessionToken: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
  }

  async signup(email: string, password: string): Promise<AuthResponse> {
    const passwordHash = await Bun.password.hash(password);
    const user = await this.userRepository.create(email, passwordHash);

    const token = await this.generateToken(user);
    const session = await this.sessionRepository.create(user.id);

    return { token, sessionToken: session.token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findByEmail(email);
      const isValid = await Bun.password.verify(password, user.passwordHash);

      if (!isValid) {
        throw new AuthenticationError("Invalid credentials");
      }

      // Delete any existing sessions for this user
      await this.sessionRepository.deleteByUserId(user.id);

      const token = await this.generateToken(user);
      const session = await this.sessionRepository.create(user.id);

      return { token, sessionToken: session.token };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error; // Let NotFoundError propagate
      }
      if (error instanceof AuthenticationError) {
        throw new AuthenticationError("Invalid credentials", 401);
      }
      console.error("Failed to validate token:", error);
      throw new AuthenticationError("Invalid credentials");
    }
  }

  async logout(sessionToken: string): Promise<void> {
    await this.sessionRepository.deleteByToken(sessionToken);
  }

  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      const session = await this.sessionRepository.findByToken(sessionToken);
      return new Date() < session.expiresAt;
    } catch {
      return false;
    }
  }

  private async generateToken(user: {
    id: string;
    email: string;
  }): Promise<string> {
    return generateToken({ sub: user.id });
  }
}
