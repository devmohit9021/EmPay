/**
 * src/db/schema/companies.schema.js
 * Drizzle schema for the `companies` table.
 * A Company is the top of the hierarchy.
 * All employees belong to a company, and the company code
 * is used as a prefix in the auto-generated Employee ID.
 */

import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Full company name e.g. "Odoo India"
  name: varchar("name", { length: 200 }).notNull(),
  // 2-letter uppercase code used in employee ID e.g. "OI"
  code: varchar("code", { length: 2 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
