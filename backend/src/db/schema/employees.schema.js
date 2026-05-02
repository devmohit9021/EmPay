/**
 * src/db/schema/employees.schema.js
 * Drizzle schema for the `employees` table.
 * Stores HR-specific employee profile data (not auth).
 * Has a 1:1 relationship with the users table.
 *
 * NOTE: Relations referencing attendance/leaves/payroll are defined
 * in schema/index.js (after all tables are loaded) to avoid
 * circular import issues in ESM.
 */

import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  // FK to users table — one employee maps to one user account
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  department: varchar("department", { length: 100 }).notNull(),
  designation: varchar("designation", { length: 100 }).notNull(),
  // Base salary stored as numeric for precise decimal handling
  baseSalary: numeric("base_salary", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
