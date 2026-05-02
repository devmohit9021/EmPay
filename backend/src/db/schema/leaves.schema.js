/**
 * src/db/schema/leaves.schema.js — v2
 * Added:
 *  - document_url: path to uploaded supporting document
 *  - applied_by_user_id: who submitted the leave (employee self or HR on behalf)
 */

import {
  pgTable,
  uuid,
  date,
  text,
  timestamp,
  pgEnum,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees.schema.js";
import { users } from "./users.schema.js";

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
  // Tracks who submitted the request (employee themselves, or HR allocating)
  appliedByUserId: uuid("applied_by_user_id")
    .references(() => users.id, { onDelete: "set null" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  // Path to uploaded supporting document (e.g., medical certificate)
  documentUrl: text("document_url"),
  status: leaveStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leavesRelations = relations(leaves, ({ one }) => ({
  employee: one(employees, {
    fields: [leaves.employeeId],
    references: [employees.id],
  }),
  appliedBy: one(users, {
    fields: [leaves.appliedByUserId],
    references: [users.id],
  }),
}));
