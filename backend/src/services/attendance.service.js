/**
 * src/services/attendance.service.js — v2
 *
 * Changes:
 *  - markAttendance is now "Check-In"
 *  - Added checkOut function for "Check-Out" toggle
 *  - Both actions operate on the same daily record
 */

import { eq, and, between } from "drizzle-orm";
import db from "../db/connection.js";
import { attendance } from "../db/schema/index.js";
import { getEmployeeByUserId } from "./employee.service.js";
import { AppError } from "../utils/AppError.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getCurrentTime = () => new Date().toTimeString().split(" ")[0]; // HH:MM:SS

/**
 * Check-In: creates today's attendance record for the employee.
 * Status is automatically set to PRESENT.
 */
export const markAttendance = async (userId, { date, status, checkInTime }) => {
  const employee = await getEmployeeByUserId(userId);
  if (!employee) throw new AppError("No employee profile found for your account. Contact HR.", 404);

  const attendanceDate = date || getTodayDate();

  const [existing] = await db
    .select({ id: attendance.id, checkInTime: attendance.checkInTime })
    .from(attendance)
    .where(and(eq(attendance.employeeId, employee.id), eq(attendance.date, attendanceDate)));

  if (existing) {
    if (existing.checkInTime) {
      throw new AppError(`Already checked in for ${attendanceDate}. Use check-out to record your departure.`, 409);
    }
    // Record exists but no check-in (e.g., manually created as ABSENT) — update it
    const [updated] = await db
      .update(attendance)
      .set({ status: "PRESENT", checkInTime: checkInTime || getCurrentTime() })
      .where(eq(attendance.id, existing.id))
      .returning();
    return updated;
  }

  const [record] = await db
    .insert(attendance)
    .values({
      employeeId: employee.id,
      date: attendanceDate,
      status: status || "PRESENT",
      checkInTime: checkInTime || getCurrentTime(),
    })
    .returning();

  return record;
};

/**
 * Check-Out: updates today's attendance record with the check-out time.
 * The green → red status toggle is controlled by this action.
 */
export const checkOut = async (userId) => {
  const employee = await getEmployeeByUserId(userId);
  if (!employee) throw new AppError("No employee profile found for your account.", 404);

  const today = getTodayDate();

  const [record] = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.employeeId, employee.id), eq(attendance.date, today)));

  if (!record) throw new AppError("No check-in record found for today. Please check in first.", 404);
  if (!record.checkInTime) throw new AppError("Cannot check out without checking in first.", 400);
  if (record.checkOutTime) throw new AppError("Already checked out for today.", 409);

  const [updated] = await db
    .update(attendance)
    .set({ checkOutTime: getCurrentTime() })
    .where(eq(attendance.id, record.id))
    .returning();

  return updated;
};

/**
 * Employee's own attendance history.
 */
export const getMyAttendance = async (userId) => {
  const employee = await getEmployeeByUserId(userId);
  if (!employee) throw new AppError("No employee profile found for your account.", 404);

  return await db
    .select()
    .from(attendance)
    .where(eq(attendance.employeeId, employee.id))
    .orderBy(attendance.date);
};

/**
 * All attendance (Admin, HR, Payroll) — with optional month/year filter.
 */
export const getAllAttendance = async ({ month, year } = {}) => {
  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    return await db
      .select()
      .from(attendance)
      .where(between(attendance.date, startDate, endDate))
      .orderBy(attendance.date);
  }
  return await db.select().from(attendance).orderBy(attendance.date);
};

/**
 * Count PRESENT days for payroll engine.
 */
export const countDaysPresent = async (employeeId, month, year) => {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const records = await db
    .select({ status: attendance.status })
    .from(attendance)
    .where(and(eq(attendance.employeeId, employeeId), between(attendance.date, startDate, endDate)));

  return records.filter((r) => r.status === "PRESENT").length;
};
