import 'dotenv/config';
import db from './src/db/connection.js';
import { sql } from 'drizzle-orm';

db.execute(sql`ALTER TABLE payroll ADD COLUMN IF NOT EXISTS unpaid_leaves INTEGER NOT NULL DEFAULT 0;`)
  .then(() => {
    console.log('Success');
    process.exit(0);
  })
  .catch(console.error);
