/**
 * src/db/schema/index.js
 * Central export for all Drizzle schemas and relations.
 *
 * IMPORTANT: Table definitions must be imported BEFORE relations
 * to avoid ESM circular dependency issues.
 * All cross-table relations are defined HERE after all tables are loaded.
 */

import { relations } from "drizzle-orm";

// ─── Table Definitions (order matters for FK references) ──────────────────────
export * from "./users.schema.js";
export * from "./attendance.schema.js";
export * from "./leaves.schema.js";
export * from "./payroll.schema.js";
export * from "./payslips.schema.js";
export * from "./employees.schema.js"; // Last — references the above via FK

// ─── Import all tables for relation definitions ───────────────────────────────
import { users } from "./users.schema.js";
import { employees } from "./employees.schema.js";
import { attendance, attendanceRelations } from "./attendance.schema.js";
import { leaves, leavesRelations } from "./leaves.schema.js";
import { payroll, payrollRelations } from "./payroll.schema.js";
import { payslips, payslipsRelations } from "./payslips.schema.js";

// ─── Employee Relations (defined here to break circular ESM dependency) ────────
export const employeeRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  attendance: many(attendance),
  leaves: many(leaves),
  payroll: many(payroll),
}));

// Re-export all other relations so Drizzle can discover them
export { attendanceRelations, leavesRelations, payrollRelations, payslipsRelations };
