/**
 * src/validators/settings.validators.js — NEW
 */

import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string({ required_error: "Company name is required" }).min(2).max(200),
  code: z.string({ required_error: "Company code is required" }).length(2, "Code must be exactly 2 characters"),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(200),
});

export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "EMPLOYEE", "HR", "PAYROLL"], {
    errorMap: () => ({ message: "Role must be: ADMIN, EMPLOYEE, HR, or PAYROLL" }),
  }),
});
