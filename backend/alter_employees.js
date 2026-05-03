import 'dotenv/config';
import db from './src/db/connection.js';
import { sql } from 'drizzle-orm';

const run = async () => {
  try {
    console.log("Running migration to add profile fields to employees...");
    await db.execute(sql`
      ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS mobile VARCHAR(20),
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS about TEXT,
      ADD COLUMN IF NOT EXISTS job_love TEXT,
      ADD COLUMN IF NOT EXISTS hobbies TEXT,
      ADD COLUMN IF NOT EXISTS skills JSONB,
      ADD COLUMN IF NOT EXISTS certifications JSONB;
    `);
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

run();
