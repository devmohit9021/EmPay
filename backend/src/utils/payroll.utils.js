/**
 * src/utils/payroll.utils.js
 * Pure payroll calculation engine.
 * All business logic is here — isolated from the database layer.
 * This makes it easy to test and adjust without touching DB code.
 *
 * Formula:
 *   per_day_salary  = base_salary / total_working_days
 *   gross_salary    = per_day_salary × days_present
 *   pf_deduction    = base_salary × PF_PERCENTAGE
 *   professional_tax = PROFESSIONAL_TAX (fixed)
 *   net_salary      = gross_salary - pf_deduction - professional_tax
 */

/**
 * Calculates the payroll for a single employee.
 *
 * @param {Object} params
 * @param {number} params.baseSalary        - Employee's monthly base salary
 * @param {number} params.daysPresent       - Days marked as PRESENT in the month
 * @param {number} params.leavesTaken       - Number of approved PAID leave days
 * @param {number} params.unpaidLeaves      - Number of approved UNPAID leave days (LWP)
 * @param {number} [params.totalWorkingDays] - Working days in the month (default from env)
 * @returns {{
 *   grossSalary: number,
 *   pfDeduction: number,
 *   professionalTax: number,
 *   deductions: number,
 *   netSalary: number
 * }}
 */
export const calculateNetSalary = ({
  baseSalary,
  daysPresent,
  leavesTaken = 0,
  unpaidLeaves = 0,
  totalWorkingDays = Number(process.env.TOTAL_WORKING_DAYS) || 26,
}) => {
  const PF_PERCENTAGE = Number(process.env.PF_PERCENTAGE) || 0.12;
  const PROFESSIONAL_TAX = Number(process.env.PROFESSIONAL_TAX) || 200;

  // Avoid division by zero
  if (totalWorkingDays <= 0) {
    throw new Error("Total working days must be greater than 0");
  }

  const salary = Number(baseSalary);

  // User requested: "gross salary should be minus with basic salary and then that amount should be the net salary"
  // However, we now have Unpaid Leaves (LWP). We must deduct LWP from the basic salary.
  const perDaySalary = salary / totalWorkingDays;
  const lwpDeduction = parseFloat((unpaidLeaves * perDaySalary).toFixed(2));
  
  // Gross salary is the basic salary minus any unpaid leave deductions
  const grossSalary = parseFloat((salary - lwpDeduction).toFixed(2));

  // Deductions based strictly on the new gross salary
  const pfDeduction = parseFloat((grossSalary * PF_PERCENTAGE).toFixed(2));
  let professionalTax = parseFloat(PROFESSIONAL_TAX.toFixed(2));
  let deductions = parseFloat((pfDeduction + professionalTax).toFixed(2));

  // Cap deductions so they do not exceed gross salary
  if (deductions > grossSalary) {
    deductions = grossSalary;
    professionalTax = parseFloat(Math.max(0, deductions - pfDeduction).toFixed(2));
  }

  const netSalary = parseFloat((grossSalary - deductions).toFixed(2));

  return {
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    pfDeduction: parseFloat(pfDeduction.toFixed(2)),
    professionalTax: parseFloat(professionalTax.toFixed(2)),
    deductions: parseFloat(deductions.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
  };
};
