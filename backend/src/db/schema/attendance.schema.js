/**
 * src/db/schema/attendance.schema.js — v2
 * Added: check_out_time column.
 * Status is now auto-derived in the service: if check_in_time is set → PRESENT.
 * Employees use POST /attendance/checkin and POST /attendance/checkout as a toggle.
 */

import {
  pgTable,
  uuid,
  date,
  timestamp,
  pgEnum,
  unique,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { employees } from "./employees.schema.js";

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
]);

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employees.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: attendanceStatusEnum("status").notNull().default("PRESENT"),
    checkInTime: time("check_in_time"),
    checkOutTime: time("check_out_time"),   // NEW: supports check-out toggle
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueAttendancePerDay: unique().on(table.employeeId, table.date),
  })
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, {
    fields: [attendance.employeeId],
    references: [employees.id],
  }),
}));
