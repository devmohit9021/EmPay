/**
 * src/db/schema/payslips.schema.js
 * Drizzle schema for the `payslips` table.
 * A payslip is the "document" generated from a payroll record.
 * 1:1 relationship with payroll.
 */

import {
  pgTable,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { payroll } from "./payroll.schema.js";

export const payslips = pgTable("payslips", {
  id: uuid("id").primaryKey().defaultRandom(),
  payrollId: uuid("payroll_id")
    .notNull()
    .unique()                             // One payslip per payroll record
    .references(() => payroll.id, { onDelete: "cascade" }),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const payslipsRelations = relations(payslips, ({ one }) => ({
  payroll: one(payroll, {
    fields: [payslips.payrollId],
    references: [payroll.id],
  }),
}));
