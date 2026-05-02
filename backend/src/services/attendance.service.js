/**
 * src/services/attendance.service.js
 * Business logic for attendance tracking.
 *
 * Business Rules:
 *  - One attendance record per employee per day (enforced by DB unique constraint)
 *  - Date defaults to today (IST) if not provided
 *  - Employees can only mark their own attendance
 */

import { eq, and, between } from "drizzle-orm";
import db from "../db/connection.js";
import { attendance } from "../db/schema/index.js";
import { getEmployeeByUserId } from "./employee.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * Returns today's date in YYYY-MM-DD format.
 */
const getTodayDate = () => new Date().toISOString().split("T")[0];

/**
 * Marks attendance for the currently logged-in employee.
 */
export const markAttendance = async (userId, { date, status, checkInTime }) => {
  // Resolve the employee profile for this user
  const employee = await getEmployeeByUserId(userId);
  if (!employee) {
    throw new AppError(
      "No employee profile found for your account. Contact HR.",
      404
    );
  }

  const attendanceDate = date || getTodayDate();

  // Check if attendance already marked today (DB constraint will also catch this)
  const [existing] = await db
    .select({ id: attendance.id })
    .from(attendance)
    .where(
      and(
        eq(attendance.employeeId, employee.id),
        eq(attendance.date, attendanceDate)
      )
    );

  if (existing) {
    throw new AppError(`Attendance already marked for ${attendanceDate}`, 409);
  }

  const [record] = await db
    .insert(attendance)
    .values({
      employeeId: employee.id,
      date: attendanceDate,
      status,
      checkInTime: checkInTime || null,
    })
    .returning();

  return record;
};

/**
 * Fetches attendance history for the logged-in employee.
 */
export const getMyAttendance = async (userId) => {
  const employee = await getEmployeeByUserId(userId);
  if (!employee) {
    throw new AppError("No employee profile found for your account.", 404);
  }

  const records = await db
    .select()
    .from(attendance)
    .where(eq(attendance.employeeId, employee.id))
    .orderBy(attendance.date);

  return records;
};

/**
 * Fetches all attendance records (for Admin, HR, Payroll roles).
 * Supports optional month/year filtering.
 */
export const getAllAttendance = async ({ month, year } = {}) => {
  let query = db.select().from(attendance).orderBy(attendance.date);

  // If month and year provided, filter by date range
  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    // Get last day of the month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

    query = db
      .select()
      .from(attendance)
      .where(between(attendance.date, startDate, endDate))
      .orderBy(attendance.date);
  }

  return await query;
};

/**
 * Counts days present for a specific employee in a given month/year.
 * Used by the payroll engine.
 */
export const countDaysPresent = async (employeeId, month, year) => {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const records = await db
    .select({ status: attendance.status })
    .from(attendance)
    .where(
      and(
        eq(attendance.employeeId, employeeId),
        between(attendance.date, startDate, endDate)
      )
    );

  return records.filter((r) => r.status === "PRESENT").length;
};
