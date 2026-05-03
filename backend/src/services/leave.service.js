/**
 * src/services/leave.service.js — v2
 *
 * Changes:
 *  - getAllLeaves / getMyLeaves now JOIN with users/employees to show names
 *  - approveLeave deducts from leave_balances (Issues #7)
 *  - allocateLeave: HR/Admin can grant leaves to employees (Issue #11)
 *  - getLeaveBalance: Returns remaining balance for an employee
 *  - applyLeave now saves documentUrl and appliedByUserId
 */

import { eq, and } from "drizzle-orm";
import db from "../db/connection.js";
import { leaves, leaveBalances, employees, users } from "../db/schema/index.js";
import { getEmployeeByUserId } from "./employee.service.js";
import { AppError } from "../utils/AppError.js";

const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Employee applies for leave.
 * HR/Admin can supply targetEmployeeId to apply on behalf of an employee.
 */
export const applyLeave = async (userId, userRole, { startDate, endDate, reason, targetEmployeeId, documentUrl }) => {
  let employee;

  // HR/Admin can apply on behalf of another employee
  if ((userRole === "HR" || userRole === "ADMIN") && targetEmployeeId) {
    const [found] = await db.select().from(employees).where(eq(employees.id, targetEmployeeId));
    if (!found) throw new AppError("Target employee not found.", 404);
    employee = found;
  } else {
    employee = await getEmployeeByUserId(userId);
    if (!employee) throw new AppError("No employee profile found for your account.", 404);
  }

  // Check for overlapping PENDING leaves
  const existingLeaves = await db
    .select()
    .from(leaves)
    .where(and(eq(leaves.employeeId, employee.id), eq(leaves.status, "PENDING")));

  for (const leave of existingLeaves) {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    if (newStart <= new Date(leave.endDate) && newEnd >= new Date(leave.startDate)) {
      throw new AppError("A pending leave request overlapping these dates already exists.", 409);
    }
  }

  const [leave] = await db
    .insert(leaves)
    .values({
      employeeId: employee.id,
      appliedByUserId: userId,
      startDate,
      endDate,
      reason,
      documentUrl: documentUrl || null,
      status: "PENDING",
    })
    .returning();

  return { ...leave, totalDays: calculateLeaveDays(startDate, endDate) };
};

/**
 * Employee's own leaves — includes employee name in response.
 */
export const getMyLeaves = async (userId) => {
  const employee = await getEmployeeByUserId(userId);
  if (!employee) throw new AppError("No employee profile found for your account.", 404);

  return await db
    .select({
      id: leaves.id,
      startDate: leaves.startDate,
      endDate: leaves.endDate,
      reason: leaves.reason,
      documentUrl: leaves.documentUrl,
      status: leaves.status,
      createdAt: leaves.createdAt,
      employeeName: users.name,
      employeeCode: employees.employeeCode,
    })
    .from(leaves)
    .leftJoin(employees, eq(leaves.employeeId, employees.id))
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(leaves.employeeId, employee.id))
    .orderBy(leaves.createdAt);
};

/**
 * All leaves — with employee name and code for admin/HR dashboard (Issues #6, #8).
 */
export const getAllLeaves = async () => {
  return await db
    .select({
      id: leaves.id,
      startDate: leaves.startDate,
      endDate: leaves.endDate,
      reason: leaves.reason,
      documentUrl: leaves.documentUrl,
      status: leaves.status,
      createdAt: leaves.createdAt,
      employeeId: leaves.employeeId,
      // Employee details for admin dashboard
      employeeName: users.name,
      employeeCode: employees.employeeCode,
      department: employees.department,
    })
    .from(leaves)
    .leftJoin(employees, eq(leaves.employeeId, employees.id))
    .leftJoin(users, eq(employees.userId, users.id))
    .orderBy(leaves.createdAt);
};

/**
 * Approves a leave and deducts from leave balance (Issue #7).
 */
export const approveLeave = async (leaveId) => {
  const [leave] = await db.select().from(leaves).where(eq(leaves.id, leaveId));
  if (!leave) throw new AppError("Leave request not found", 404);
  if (leave.status !== "PENDING") throw new AppError(`Cannot update. Status is already "${leave.status}".`, 400);

  const leaveDays = calculateLeaveDays(leave.startDate, leave.endDate);
  const year = new Date(leave.startDate).getFullYear();

  // Fetch or auto-create leave balance for this year
  let [balance] = await db
    .select()
    .from(leaveBalances)
    .where(and(eq(leaveBalances.employeeId, leave.employeeId), eq(leaveBalances.year, year)));

  if (!balance) {
    // Auto-create balance with 0 granted (HR should allocate first, but handle gracefully)
    [balance] = await db
      .insert(leaveBalances)
      .values({ employeeId: leave.employeeId, year, totalGranted: 0, used: 0 })
      .returning();
  }

  const remaining = Math.max(0, balance.totalGranted - balance.used);
  let paidDays = leaveDays;
  let unpaidDays = 0;

  if (remaining < leaveDays) {
    paidDays = remaining;
    unpaidDays = leaveDays - remaining;
  }

  // Deduct from balance only the paid days
  if (paidDays > 0) {
    await db
      .update(leaveBalances)
      .set({ used: balance.used + paidDays, updatedAt: new Date() })
      .where(eq(leaveBalances.id, balance.id));
  }

  // Approve the leave and store breakdown
  const [updated] = await db
    .update(leaves)
    .set({ status: "APPROVED", paidDays, unpaidDays })
    .where(eq(leaves.id, leaveId))
    .returning();

  return { ...updated, leaveDaysDeducted: paidDays };
};

/**
 * Rejects a leave request.
 */
export const rejectLeave = async (leaveId) => {
  const [leave] = await db.select().from(leaves).where(eq(leaves.id, leaveId));
  if (!leave) throw new AppError("Leave request not found", 404);
  if (leave.status !== "PENDING") throw new AppError(`Cannot update. Status is already "${leave.status}".`, 400);

  const [updated] = await db
    .update(leaves)
    .set({ status: "REJECTED" })
    .where(eq(leaves.id, leaveId))
    .returning();
  return updated;
};

/**
 * HR allocates (grants) leave days to an employee for a year (Issue #11).
 */
export const allocateLeaves = async (employeeId, year, daysToGrant) => {
  const [employee] = await db.select({ id: employees.id }).from(employees).where(eq(employees.id, employeeId));
  if (!employee) throw new AppError("Employee not found", 404);

  const [existing] = await db
    .select()
    .from(leaveBalances)
    .where(and(eq(leaveBalances.employeeId, employeeId), eq(leaveBalances.year, year)));

  if (existing) {
    const [updated] = await db
      .update(leaveBalances)
      .set({ totalGranted: existing.totalGranted + daysToGrant, updatedAt: new Date() })
      .where(eq(leaveBalances.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(leaveBalances)
    .values({ employeeId, year, totalGranted: daysToGrant, used: 0 })
    .returning();
  return created;
};

/**
 * Returns current year leave balance for an employee.
 */
export const getLeaveBalance = async (employeeId) => {
  const year = new Date().getFullYear();
  const [balance] = await db
    .select()
    .from(leaveBalances)
    .where(and(eq(leaveBalances.employeeId, employeeId), eq(leaveBalances.year, year)));

  if (!balance) {
    return { employeeId, year, totalGranted: 0, used: 0, remaining: 0 };
  }

  return { ...balance, remaining: balance.totalGranted - balance.used };
};

/**
 * Count approved leave days in a specific month (used by payroll engine).
 */
export const countApprovedLeaveDays = async (employeeId, month, year) => {
  const allApproved = await db
    .select()
    .from(leaves)
    .where(and(eq(leaves.employeeId, employeeId), eq(leaves.status, "APPROVED")));

  let totalPaid = 0;
  let totalUnpaid = 0;
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  for (const leave of allApproved) {
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);

    // Calculate overlap with the specified month
    const overlapStart = leaveStart > monthStart ? leaveStart : monthStart;
    const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd;
    
    if (overlapStart <= overlapEnd) {
      // Find how many days overlap in total
      const overlapDays = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
      const totalLeaveDays = Math.round((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;

      // Apportion paid and unpaid days chronologically
      // Let's iterate over each day in the overlap and check if it falls in the paid or unpaid portion
      for (let i = 0; i < overlapDays; i++) {
        const currentDay = new Date(overlapStart);
        currentDay.setDate(currentDay.getDate() + i);
        
        // Find which day of the leave this is (0-indexed)
        const dayOfLeave = Math.round((currentDay - leaveStart) / (1000 * 60 * 60 * 24));
        
        if (dayOfLeave < leave.paidDays) {
          totalPaid++;
        } else {
          totalUnpaid++;
        }
      }
    }
  }
  return { totalPaid, totalUnpaid };
};
