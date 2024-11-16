const baseDbUrl = process.env.DATABASE_URL;
if (!baseDbUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const dbUrl = new URL(baseDbUrl);
const pathParts = dbUrl.pathname.split("/");
pathParts[pathParts.length - 1] = pathParts[pathParts.length - 1] + "_test";
dbUrl.pathname = pathParts.join("/");

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
