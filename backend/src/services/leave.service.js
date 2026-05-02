/**
 * src/services/leave.service.js
 * Business logic for leave applications and approval workflow.
 *
 * Workflow:
 *   Employee applies (PENDING)
 *     → Payroll Officer APPROVES or REJECTS
 *
 * Critical: Only APPROVED leaves affect payroll calculation.
 */

import { eq, and } from "drizzle-orm";
import db from "../db/connection.js";
import { leaves } from "../db/schema/index.js";
import { getEmployeeByUserId } from "./employee.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * Calculates the number of calendar days between two dates (inclusive).
 */
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Submits a new leave application for the logged-in employee.
 */
export const applyLeave = async (userId, { startDate, endDate, reason }) => {
  const employee = await getEmployeeByUserId(userId);
  if (!employee) {
    throw new AppError("No employee profile found for your account.", 404);
  }

  // Check for overlapping leave requests
  const existingLeaves = await db
    .select()
    .from(leaves)
    .where(
      and(
        eq(leaves.employeeId, employee.id),
        eq(leaves.status, "PENDING")
      )
    );

  // Simple overlap check: new leave should not overlap any pending leave
  for (const leave of existingLeaves) {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    const existStart = new Date(leave.startDate);
    const existEnd = new Date(leave.endDate);

    if (newStart <= existEnd && newEnd >= existStart) {
      throw new AppError(
        "You already have a pending leave request overlapping these dates.",
        409
      );
    }
  }

  const [leave] = await db
    .insert(leaves)
    .values({
      employeeId: employee.id,
      startDate,
      endDate,
      reason,
      status: "PENDING",
    })
    .returning();

  return {
    ...leave,
    totalDays: calculateLeaveDays(startDate, endDate),
  };
};

/**
 * Returns all leave applications for the logged-in employee.
 */
export const getMyLeaves = async (userId) => {
  const employee = await getEmployeeByUserId(userId);
  if (!employee) {
    throw new AppError("No employee profile found for your account.", 404);
  }

  return await db
    .select()
    .from(leaves)
    .where(eq(leaves.employeeId, employee.id))
    .orderBy(leaves.createdAt);
};

/**
 * Returns all leave applications (Admin, HR, Payroll).
 */
export const getAllLeaves = async () => {
  return await db.select().from(leaves).orderBy(leaves.createdAt);
};

/**
 * Approves a leave request (PAYROLL role only).
 * State transition: PENDING → APPROVED
 */
export const approveLeave = async (leaveId) => {
  return await updateLeaveStatus(leaveId, "APPROVED");
};

/**
 * Rejects a leave request (PAYROLL role only).
 * State transition: PENDING → REJECTED
 */
export const rejectLeave = async (leaveId) => {
  return await updateLeaveStatus(leaveId, "REJECTED");
};

/**
 * Internal helper to transition leave status.
 * Only PENDING leaves can be actioned.
 */
const updateLeaveStatus = async (leaveId, newStatus) => {
  const [leave] = await db
    .select()
    .from(leaves)
    .where(eq(leaves.id, leaveId));

  if (!leave) {
    throw new AppError("Leave request not found", 404);
  }

  if (leave.status !== "PENDING") {
    throw new AppError(
      `Cannot update leave. Current status is already "${leave.status}".`,
      400
    );
  }

  const [updated] = await db
    .update(leaves)
    .set({ status: newStatus })
    .where(eq(leaves.id, leaveId))
    .returning();

  return updated;
};

/**
 * Counts approved leave days for an employee in a specific month/year.
 * Used by the payroll engine to calculate paid leave days.
 */
export const countApprovedLeaveDays = async (employeeId, month, year) => {
  const allApprovedLeaves = await db
    .select()
    .from(leaves)
    .where(
      and(
        eq(leaves.employeeId, employeeId),
        eq(leaves.status, "APPROVED")
      )
    );

  // Filter and count leave days that fall within the target month
  let totalLeaveDays = 0;
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  for (const leave of allApprovedLeaves) {
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);

    // Find intersection of leave range with the month
    const overlapStart = leaveStart > monthStart ? leaveStart : monthStart;
    const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd;

    if (overlapStart <= overlapEnd) {
      const days = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
      totalLeaveDays += days;
    }
  }

  return totalLeaveDays;
};
