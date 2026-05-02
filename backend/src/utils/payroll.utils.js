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
 * @param {number} params.leavesTaken       - Number of approved leave days
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
  totalWorkingDays = Number(process.env.TOTAL_WORKING_DAYS) || 26,
}) => {
  const PF_PERCENTAGE = Number(process.env.PF_PERCENTAGE) || 0.12;
  const PROFESSIONAL_TAX = Number(process.env.PROFESSIONAL_TAX) || 200;

  // Avoid division by zero
  if (totalWorkingDays <= 0) {
    throw new Error("Total working days must be greater than 0");
  }

  const salary = Number(baseSalary);

  // Per day salary rate
  const perDaySalary = salary / totalWorkingDays;

  // Gross = days actually present × per day rate
  // Note: Approved leaves count as present days per most HRMS logic.
  // Adjust daysPresent to include approved leaves in gross calculation.
  const effectiveDaysPresent = daysPresent + leavesTaken;
  const cappedDays = Math.min(effectiveDaysPresent, totalWorkingDays);
  const grossSalary = perDaySalary * cappedDays;

  // Deductions
  const pfDeduction = salary * PF_PERCENTAGE;
  const professionalTax = PROFESSIONAL_TAX;
  const deductions = pfDeduction + professionalTax;

  const netSalary = Math.max(0, grossSalary - deductions);

  return {
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    pfDeduction: parseFloat(pfDeduction.toFixed(2)),
    professionalTax: parseFloat(professionalTax.toFixed(2)),
    deductions: parseFloat(deductions.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
  };
};
