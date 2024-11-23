import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { env } from "../config/environment";

const runMigrations = async () => {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("⏳ Running migrations...");

  const start = Date.now();
  await migrate(db, { migrationsFolder: "drizzle" });
  const end = Date.now();

  console.log(`✅ Migrations completed in ${end - start}ms`);
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
