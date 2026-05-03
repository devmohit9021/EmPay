/**
 * src/db/schema/leave_balances.schema.js
 * Drizzle schema for the `leave_balances` table.
 * HR allocates a leave budget to each employee per year.
 * When a leave is APPROVED, the used count increments and
 * remaining decrements automatically in the service layer.
 */

import {
  pgTable,
  uuid,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees.schema.js";

export const leaveBalances = pgTable(
  "leave_balances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),         // e.g. 2024
    totalGranted: integer("total_granted").notNull().default(0), // set by HR
    used: integer("used").notNull().default(0),                  // auto-incremented on approval
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  // One balance record per employee per year
  (table) => ({
    uniqueBalancePerYear: unique().on(table.employeeId, table.year),
  })
);

export const leaveBalancesRelations = relations(leaveBalances, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveBalances.employeeId],
    references: [employees.id],
  }),
}));
