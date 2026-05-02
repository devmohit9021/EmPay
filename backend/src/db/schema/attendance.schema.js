/**
 * src/db/schema/attendance.schema.js
 * Drizzle schema for the `attendance` table.
 * Tracks daily attendance per employee.
 * Unique constraint on (employee_id, date) prevents duplicate entries.
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

// Attendance status options
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
    date: date("date").notNull(),             // ISO date string e.g. "2024-05-01"
    status: attendanceStatusEnum("status").notNull().default("PRESENT"),
    checkInTime: time("check_in_time"),       // Optional check-in time
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // Composite unique constraint: one record per employee per day
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
