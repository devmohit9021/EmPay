/**
 * src/controllers/payroll.controller.js — v3
 * Added: getPayrollByEmployee, getPayrollPreview
 */

import * as payrollService from "../services/payroll.service.js";

export const runPayroll = async (req, res, next) => {
  try {
    const result = await payrollService.runPayroll(req.body);
    res.status(200).json({ success: true, message: "Payroll run complete", data: result });
  } catch (err) { next(err); }
};

export const getAllPayroll = async (req, res, next) => {
  try {
    const data = await payrollService.getAllPayroll();
    res.status(200).json({ success: true, count: data.length, data: { payroll: data } });
  } catch (err) { next(err); }
};

// GET /payroll/employee/:employeeId — payslip history for one employee
export const getPayrollByEmployee = async (req, res, next) => {
  try {
    const data = await payrollService.getPayrollByEmployee(req.params.employeeId);
    res.status(200).json({ success: true, count: data.length, data: { payroll: data } });
  } catch (err) { next(err); }
};

// GET /payroll/preview?month=&year= — preview payroll calculation for all employees (no DB write)
export const previewPayroll = async (req, res, next) => {
  try {
    const { month, year, totalWorkingDays } = req.query;
    const preview = await payrollService.previewPayroll({
      month: parseInt(month),
      year: parseInt(year),
      totalWorkingDays: totalWorkingDays ? parseInt(totalWorkingDays) : undefined,
    });
    res.status(200).json({ success: true, data: { preview } });
  } catch (err) { next(err); }
};

// GET /payroll/my — employee sees their own payslips
export const getMyPayroll = async (req, res, next) => {
  try {
    const { employees: emp } = await import("../db/schema/index.js");
    const { eq } = await import("drizzle-orm");
    const db = (await import("../db/connection.js")).default;
    // Find employee profile for this user
    const [employee] = await db.select({ id: emp.id }).from(emp).where(eq(emp.userId, req.user.id));
    if (!employee) return res.status(404).json({ success: false, message: "No employee profile found." });
    const data = await payrollService.getPayrollByEmployee(employee.id);
    res.status(200).json({ success: true, count: data.length, data: { payroll: data } });
  } catch (err) { next(err); }
};
