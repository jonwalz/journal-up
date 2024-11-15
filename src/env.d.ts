declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      JWT_SECRET: string;
      ZEP_API_URL: string;
      ZEP_API_KEY: string;
    }
  }
}

export {};
