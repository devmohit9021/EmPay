/**
 * src/db/schema/employees.schema.js
 * Drizzle schema for the `employees` table — v2
 *
 * New fields:
 *  - company_id        FK → companies (org hierarchy)
 *  - employee_code     Auto-generated unique ID (e.g. OIPRTR20240001)
 *  - joined_at         Date of joining (used in code generation)
 *  - manager_id        Self-referencing FK (nullable → "Employee without manager")
 *  - profile_photo     URL/path to profile image
 *  - bank_account_no   Bank account number (nullable → warning on profile)
 *  - bank_name         Bank name (nullable)
 *  - ifsc_code         IFSC code (nullable)
 */

import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  date,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";
import { companies } from "./companies.schema.js";

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),

  // ── Auth link ────────────────────────────────────────────────────────────────
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // ── Company hierarchy ────────────────────────────────────────────────────────
  // Nullable to support migration of existing rows — should be filled for all new employees
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "restrict" }),

  // ── Auto-generated employee code (e.g. OIPRTR20240001) ────────────────────
  employeeCode: varchar("employee_code", { length: 20 }).unique(),

  // ── HR data ─────────────────────────────────────────────────────────────────
  department: varchar("department", { length: 100 }).notNull(),
  designation: varchar("designation", { length: 100 }).notNull(),
  baseSalary: numeric("base_salary", { precision: 12, scale: 2 }).notNull(),
  joinedAt: date("joined_at"), // Used for employee code generation

  // ── Manager (self-referencing, nullable) ─────────────────────────────────────
  // If NULL → show "Employee without manager" on profile
  managerId: uuid("manager_id"), // No .references() here — added via raw SQL to avoid circular FK issues in Drizzle

  // ── Profile ──────────────────────────────────────────────────────────────────
  profilePhoto: text("profile_photo"),  // URL or file path
  mobile: varchar("mobile", { length: 20 }),
  location: varchar("location", { length: 255 }),
  about: text("about"),
  jobLove: text("job_love"),
  hobbies: text("hobbies"),
  skills: jsonb("skills"), // Array of strings or objects
  certifications: jsonb("certifications"), // Array of strings or objects

  // ── Bank details (nullable → show warning if incomplete) ─────────────────────
  bankAccountNo: varchar("bank_account_no", { length: 50 }),
  bankName: varchar("bank_name", { length: 100 }),
  ifscCode: varchar("ifsc_code", { length: 20 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
