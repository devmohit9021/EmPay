/**
 * src/services/analytics.service.js — NEW
 * Dashboard statistics for Admin/HR and Payroll dashboards.
 */

import { eq, and, count, sql } from "drizzle-orm";
import db from "../db/connection.js";
import { employees, attendance, leaves, payroll, users } from "../db/schema/index.js";

/**
 * Admin/HR Dashboard Stats.
 * Returns: total employees, today's attendance, pending leaves, role breakdown.
 */
export const getAdminStats = async () => {
  const today = new Date().toISOString().split("T")[0];

  // Total employees
  const [{ totalEmployees }] = await db
    .select({ totalEmployees: count() })
    .from(employees);

  // Today's check-ins
  const [{ checkedInToday }] = await db
    .select({ checkedInToday: count() })
    .from(attendance)
    .where(and(eq(attendance.date, today), eq(attendance.status, "PRESENT")));

  // Pending leaves
  const [{ pendingLeaves }] = await db
    .select({ pendingLeaves: count() })
    .from(leaves)
    .where(eq(leaves.status, "PENDING"));

  // Role breakdown
  const roleBreakdown = await db
    .select({ role: users.role, count: count() })
    .from(users)
    .groupBy(users.role);

  return {
    totalEmployees: Number(totalEmployees),
    checkedInToday: Number(checkedInToday),
    absentToday: Number(totalEmployees) - Number(checkedInToday),
    pendingLeaves: Number(pendingLeaves),
    roleBreakdown,
  };
};

/**
 * Payroll Dashboard Stats.
 * Returns the most recent payroll run summary.
 */
export const getPayrollStats = async () => {
  // Get distinct months that have been processed
  const months = await db
    .select({ month: payroll.month, year: payroll.year })
    .from(payroll)
    .groupBy(payroll.month, payroll.year)
    .orderBy(sql`${payroll.year} DESC, ${payroll.month} DESC`)
    .limit(1);

  if (months.length === 0) {
    return { message: "No payroll runs found yet.", latestMonth: null, totalNetSalaryDisbursed: 0 };
  }

  const { month, year } = months[0];

  const summary = await db
    .select({
      count: count(),
      totalNetSalary: sql`SUM(${payroll.netSalary})`,
      totalDeductions: sql`SUM(${payroll.deductions})`,
    })
    .from(payroll)
    .where(and(eq(payroll.month, month), eq(payroll.year, year)));

  return {
    latestMonth: { month, year },
    totalEmployeesPaid: Number(summary[0].count),
    totalNetSalaryDisbursed: parseFloat(Number(summary[0].totalNetSalary).toFixed(2)),
    totalDeductions: parseFloat(Number(summary[0].totalDeductions).toFixed(2)),
  };
};
