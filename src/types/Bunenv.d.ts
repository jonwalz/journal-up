declare global {
  namespace Bun {
    interface Env {
      NODE_ENV: "development" | "production" | "test";
      PORT?: string;
      DATABASE_URL?: string;
      JWT_SECRET?: string;
      ZEP_API_URL?: string;
      ZEP_API_KEY?: string;
      TZ?: string;
    }
  }
}

export {};
