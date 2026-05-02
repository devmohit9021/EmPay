/**
 * src/db/schema/payroll.schema.js
 * Drizzle schema for the `payroll` table.
 * Stores the computed payroll record for each employee per month.
 * This is the central output of the payroll engine.
 */

import {
  pgTable,
  uuid,
  integer,
  numeric,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees.schema.js";
import { payslips } from "./payslips.schema.js";

export const payroll = pgTable(
  "payroll",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    month: integer("month").notNull(),        // 1-12
    year: integer("year").notNull(),          // e.g. 2024
    baseSalary: numeric("base_salary", { precision: 12, scale: 2 }).notNull(),
    daysPresent: integer("days_present").notNull().default(0),
    leavesTaken: integer("leaves_taken").notNull().default(0),
    // Deductions breakdown stored individually for transparency
    pfDeduction: numeric("pf_deduction", { precision: 10, scale: 2 }).notNull(),
    professionalTax: numeric("professional_tax", { precision: 10, scale: 2 }).notNull(),
    // Total deductions = pf + professional_tax
    deductions: numeric("deductions", { precision: 10, scale: 2 }).notNull(),
    netSalary: numeric("net_salary", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // Prevent running payroll twice for the same employee in the same month/year
  (table) => ({
    uniquePayrollPerMonth: unique().on(table.employeeId, table.month, table.year),
  })
);

export const payrollRelations = relations(payroll, ({ one }) => ({
  employee: one(employees, {
    fields: [payroll.employeeId],
    references: [employees.id],
  }),
  payslip: one(payslips),
}));
