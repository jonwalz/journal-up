const baseDbUrl = process.env.TEST_DATABASE_URL;
if (!baseDbUrl) {
  throw new Error("TEST_DATABASE_URL environment variable is required");
}

const dbUrl = new URL(baseDbUrl);

const testEnv: Partial<Bun.Env> = {
  NODE_ENV: "test",
  PORT: "3000",
  DATABASE_URL: dbUrl.toString(),
  JWT_SECRET: "test_jwt_secret",
  ZEP_API_URL: "http://localhost:8000",
  ZEP_API_KEY: "test_zep_api_key",
  TZ: "UTC",
};

Object.assign(process.env, testEnv);
