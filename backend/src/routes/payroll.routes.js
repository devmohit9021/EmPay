/**
 * src/routes/payroll.routes.js — v3
 * Full payroll routing with preview, per-employee, and employee self-view.
 */

import { Router } from "express";
import * as payrollController from "../controllers/payroll.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { payrollRunSchema } from "../validators/payroll.validators.js";

const router = Router();
router.use(authenticateUser);

// Admin / Payroll: full access
router.get("/",        authorizeRoles("ADMIN", "PAYROLL"), payrollController.getAllPayroll);
router.post("/run",    authorizeRoles("ADMIN", "PAYROLL"), validate(payrollRunSchema), payrollController.runPayroll);
router.get("/preview", authorizeRoles("ADMIN", "PAYROLL"), payrollController.previewPayroll);

// Per-employee payslip history (Admin / Payroll can view any; employee via /my)
router.get("/my",               authorizeRoles("EMPLOYEE", "ADMIN", "PAYROLL"), payrollController.getMyPayroll);
router.get("/employee/:employeeId", authorizeRoles("ADMIN", "PAYROLL"), payrollController.getPayrollByEmployee);

export default router;
