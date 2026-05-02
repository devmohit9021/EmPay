/**
 * src/db/migrate.js
 * Runs pending Drizzle ORM migrations against the database.
 * Execute with: node src/db/migrate.js
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

console.log("⏳ Running migrations...");

await migrate(db, { migrationsFolder: "./drizzle" });

console.log("✅ Migrations applied successfully!");

await pool.end();
process.exit(0);
