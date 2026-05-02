/**
 * src/db/connection.js
 * Creates and exports the Drizzle ORM database client.
 * Uses the `pg` (node-postgres) pool under the hood.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

// Create a connection pool using DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for production readiness
  max: 10,           // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully");
    release();
  }
});

// Export Drizzle instance with full schema for type-safe queries
const db = drizzle(pool, { schema });

export default db;
