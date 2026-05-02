/**
 * src/services/payroll.service.js
 * CORE MODULE: Payroll processing engine.
 *
 * This service orchestrates the full payroll pipeline:
 *   1. Fetch all active employees (or specified subset)
 *   2. For each employee, fetch attendance and approved leave data
 *   3. Calculate net salary using the payroll utility
 *   4. Persist payroll records in the database
 *   5. Auto-generate payslips
 *
 * Business Rules:
 *   - One payroll record per employee per month/year
 *   - Approved leaves count as paid days
 *   - PF = 12% of base salary
 *   - Professional Tax = fixed (from env)
 */

import { eq, and, inArray } from "drizzle-orm";
import db from "../db/connection.js";
import { employees, payroll, payslips } from "../db/schema/index.js";
import { countDaysPresent } from "./attendance.service.js";
import { countApprovedLeaveDays } from "./leave.service.js";
import { calculateNetSalary } from "../utils/payroll.utils.js";
import { AppError } from "../utils/AppError.js";

/**
 * Runs the monthly payroll for all employees (or a subset).
 *
 * @param {Object} input
 * @param {number} input.month
 * @param {number} input.year
 * @param {string[]} [input.employeeIds] - If provided, run only for these employees
 * @param {number} [input.totalWorkingDays] - Override working days for this month
 *
 * @returns {Object} Summary of payroll run results
 */
export const runPayroll = async ({ month, year, employeeIds, totalWorkingDays }) => {
  // ── Step 1: Fetch target employees ─────────────────────────────────────────
  let targetEmployees;

  if (employeeIds && employeeIds.length > 0) {
    targetEmployees = await db
      .select()
      .from(employees)
      .where(inArray(employees.id, employeeIds));
  } else {
    targetEmployees = await db.select().from(employees);
  }

  if (targetEmployees.length === 0) {
    throw new AppError("No employees found to process payroll for.", 404);
  }

  const results = {
    month,
    year,
    processed: [],
    skipped: [],
    errors: [],
  };

  // ── Step 2: Process each employee ──────────────────────────────────────────
  for (const employee of targetEmployees) {
    try {
      // Check if payroll was already run for this employee this month
      const [existing] = await db
        .select({ id: payroll.id })
        .from(payroll)
        .where(
          and(
            eq(payroll.employeeId, employee.id),
            eq(payroll.month, month),
            eq(payroll.year, year)
          )
        );

      if (existing) {
        results.skipped.push({
          employeeId: employee.id,
          reason: `Payroll already processed for ${month}/${year}`,
        });
        continue;
      }

      // ── Step 3: Gather payroll inputs ──────────────────────────────────────
      const daysPresent = await countDaysPresent(employee.id, month, year);
      const leavesTaken = await countApprovedLeaveDays(employee.id, month, year);
      const baseSalary = Number(employee.baseSalary);

      // ── Step 4: Run the calculation engine ────────────────────────────────
      const { pfDeduction, professionalTax, deductions, netSalary } =
        calculateNetSalary({
          baseSalary,
          daysPresent,
          leavesTaken,
          totalWorkingDays,
        });

      // ── Step 5: Persist payroll record ────────────────────────────────────
      const [payrollRecord] = await db
        .insert(payroll)
        .values({
          employeeId: employee.id,
          month,
          year,
          baseSalary: String(baseSalary),
          daysPresent,
          leavesTaken,
          pfDeduction: String(pfDeduction),
          professionalTax: String(professionalTax),
          deductions: String(deductions),
          netSalary: String(netSalary),
        })
        .returning();

      // ── Step 6: Auto-generate payslip ─────────────────────────────────────
      const [payslip] = await db
        .insert(payslips)
        .values({ payrollId: payrollRecord.id })
        .returning();

      results.processed.push({
        employeeId: employee.id,
        payrollId: payrollRecord.id,
        payslipId: payslip.id,
        baseSalary,
        daysPresent,
        leavesTaken,
        deductions,
        netSalary,
      });
    } catch (err) {
      // Don't fail the entire run — log the error and continue
      results.errors.push({
        employeeId: employee.id,
        error: err.message,
      });
    }
  }

  return {
    success: true,
    summary: {
      totalEmployees: targetEmployees.length,
      processed: results.processed.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
    },
    results,
  };
};

/**
 * Fetches payroll records for a specific employee.
 * Used for payslip retrieval.
 */
export const getPayrollByEmployee = async (employeeId) => {
  return await db
    .select()
    .from(payroll)
    .where(eq(payroll.employeeId, employeeId))
    .orderBy(payroll.year, payroll.month);
};

/**
 * Fetches all payroll records across all employees.
 * Used by Admin/Payroll Officer dashboard.
 */
export const getAllPayroll = async () => {
  const { employees: emp, users } = await import("../db/schema/index.js");
  return await db
    .select({
      id: payroll.id,
      employeeId: payroll.employeeId,
      month: payroll.month,
      year: payroll.year,
      baseSalary: payroll.baseSalary,
      daysPresent: payroll.daysPresent,
      leavesTaken: payroll.leavesTaken,
      pfDeduction: payroll.pfDeduction,
      professionalTax: payroll.professionalTax,
      deductions: payroll.deductions,
      netSalary: payroll.netSalary,
      employeeName: users.name,
      employeeCode: emp.employeeCode,
      department: emp.department,
    })
    .from(payroll)
    .leftJoin(emp, eq(payroll.employeeId, emp.id))
    .leftJoin(users, eq(emp.userId, users.id))
    .orderBy(payroll.year, payroll.month);
};
