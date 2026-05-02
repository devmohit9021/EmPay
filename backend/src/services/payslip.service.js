/**
 * src/services/payslip.service.js
 * Business logic for payslip retrieval.
 *
 * Access rules:
 *  - EMPLOYEE: can only see their own payslips
 *  - ADMIN, HR, PAYROLL: can see any employee's payslips
 */

import { eq } from "drizzle-orm";
import db from "../db/connection.js";
import { payslips, payroll, employees, users } from "../db/schema/index.js";
import { getEmployeeByUserId } from "./employee.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * Fetches full payslip details for a given employee ID.
 * Joins payroll data for the complete salary breakdown.
 *
 * @param {string} requestingUserId   - The ID of the user making the request
 * @param {string} requestingUserRole - The role of the user making the request
 * @param {string} employeeId         - The target employee ID
 */
export const getPayslipsForEmployee = async (
  requestingUserId,
  requestingUserRole,
  employeeId
) => {
  // If the requester is an EMPLOYEE, verify they are requesting their own payslip
  if (requestingUserRole === "EMPLOYEE") {
    const ownProfile = await getEmployeeByUserId(requestingUserId);

    if (!ownProfile) {
      throw new AppError("No employee profile found for your account.", 404);
    }

    if (ownProfile.id !== employeeId) {
      throw new AppError(
        "Access denied. Employees can only view their own payslips.",
        403
      );
    }
  }

  // Fetch payslips joined with payroll data for the employee
  const results = await db
    .select({
      payslipId: payslips.id,
      generatedAt: payslips.generatedAt,
      payroll: {
        id: payroll.id,
        month: payroll.month,
        year: payroll.year,
        baseSalary: payroll.baseSalary,
        daysPresent: payroll.daysPresent,
        leavesTaken: payroll.leavesTaken,
        pfDeduction: payroll.pfDeduction,
        professionalTax: payroll.professionalTax,
        deductions: payroll.deductions,
        netSalary: payroll.netSalary,
      },
    })
    .from(payslips)
    .innerJoin(payroll, eq(payslips.payrollId, payroll.id))
    .where(eq(payroll.employeeId, employeeId))
    .orderBy(payroll.year, payroll.month);

  if (results.length === 0) {
    throw new AppError("No payslips found for this employee.", 404);
  }

  return results;
};
