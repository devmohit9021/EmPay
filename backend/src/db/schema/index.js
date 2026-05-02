/**
 * src/db/schema/index.js — v2
 * Central barrel export for all schemas and relations.
 * All cross-table relations defined here to avoid circular ESM imports.
 */

import { relations } from "drizzle-orm";

// ─── Table Definitions ─────────────────────────────────────────────────────────
export * from "./companies.schema.js";
export * from "./users.schema.js";
export * from "./employees.schema.js";
export * from "./attendance.schema.js";
export * from "./leaves.schema.js";
export * from "./leave_balances.schema.js";
export * from "./payroll.schema.js";
export * from "./payslips.schema.js";

// ─── Imports for relation definitions ─────────────────────────────────────────
import { companies } from "./companies.schema.js";
import { users } from "./users.schema.js";
import { employees } from "./employees.schema.js";
import { attendance, attendanceRelations } from "./attendance.schema.js";
import { leaves, leavesRelations } from "./leaves.schema.js";
import { leaveBalances, leaveBalancesRelations } from "./leave_balances.schema.js";
import { payroll, payrollRelations } from "./payroll.schema.js";
import { payslips, payslipsRelations } from "./payslips.schema.js";

// ─── Company Relations ─────────────────────────────────────────────────────────
export const companyRelations = relations(companies, ({ many }) => ({
  employees: many(employees),
}));

// ─── Employee Relations (cross-table, defined here to avoid circular imports) ──
export const employeeRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [employees.companyId],
    references: [companies.id],
  }),
  // Self-referencing manager relationship
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: "managerRelation",
  }),
  subordinates: many(employees, { relationName: "managerRelation" }),
  attendance: many(attendance),
  leaves: many(leaves),
  leaveBalances: many(leaveBalances),
  payroll: many(payroll),
}));

// ─── Re-export all other relations ────────────────────────────────────────────
export {
  attendanceRelations,
  leavesRelations,
  leaveBalancesRelations,
  payrollRelations,
  payslipsRelations,
};
