/**
 * src/db/schema/leaves.schema.js
 * Drizzle schema for the `leaves` table.
 * Models the leave application and approval workflow.
 * State machine: PENDING → APPROVED | REJECTED
 */

import {
  pgTable,
  uuid,
  date,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees.schema.js";

export const leaveStatusEnum = pgEnum("leave_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const leaves = pgTable("leaves", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  // Status follows a strict workflow managed by the PAYROLL role
  status: leaveStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leavesRelations = relations(leaves, ({ one }) => ({
  employee: one(employees, {
    fields: [leaves.employeeId],
    references: [employees.id],
  }),
}));
