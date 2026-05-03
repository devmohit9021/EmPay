/**
 * src/controllers/employee.controller.js — v3
 *
 * createEmployee: auto-resolves companyId from the requesting Admin's own
 * employee record, so the frontend never needs to supply it.
 */

import * as employeeService from "../services/employee.service.js";
import * as authService from "../services/auth.service.js";
import db from "../db/connection.js";
import { companies, employees, users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/AppError.js";

export const createEmployee = async (req, res, next) => {
  try {
    let { companyId, ...rest } = req.body;

    // Auto-resolve companyId from the Admin's own employee profile
    if (!companyId) {
      const [adminEmp] = await db
        .select({ companyId: employees.companyId })
        .from(employees)
        .where(eq(employees.userId, req.user.id));

      if (adminEmp?.companyId) {
        companyId = adminEmp.companyId;
      } else {
        // Fallback: use the first company in the database
        const [firstCompany] = await db.select({ id: companies.id }).from(companies);
        if (!firstCompany) throw new AppError("No company found. Please create a company in Settings first.", 400);
        companyId = firstCompany.id;
      }
    }

    const employee = await employeeService.createEmployee({ ...rest, companyId });
    res.status(201).json({ success: true, message: "Employee profile created", data: { employee } });
  } catch (err) { next(err); }
};

export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees(req.user.role);
    res.status(200).json({ success: true, count: employees.length, data: { employees } });
  } catch (err) { next(err); }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({ success: true, data: { employee } });
  } catch (err) { next(err); }
};

// GET /employees/me — logged-in user's own employee profile (Issues #15, #16)
export const getMyProfile = async (req, res, next) => {
  try {
    const emp = await employeeService.getEmployeeByUserId(req.user.id);
    if (!emp) {
      // Fallback for Admin who might not have an employee profile yet
      const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
      const [company] = await db.select().from(companies).limit(1); // usually just 1 company
      return res.status(200).json({
        success: true,
        data: {
          employee: {
            user: { name: user.name, email: user.email, role: user.role },
            company: company ? { name: company.name, code: company.code } : null,
            bankAccountNo: null,
            bankName: null,
            ifscCode: null,
          }
        }
      });
    }
    const employee = await employeeService.getEmployeeById(emp.id);
    res.status(200).json({ success: true, data: { employee } });
  } catch (err) { next(err); }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user.role);
    res.status(200).json({ success: true, message: "Employee updated", data: { employee } });
  } catch (err) { next(err); }
};
