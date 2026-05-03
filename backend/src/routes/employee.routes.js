/**
 * src/routes/employee.routes.js — v2
 *
 * GET  /employees/me     — Employee gets own profile (using JWT userId)
 * GET  /employees        — All authenticated (EMPLOYEE gets sanitized view)
 * GET  /employees/:id    — All authenticated
 * POST /employees        — ADMIN, HR
 * PATCH /employees/:id   — ADMIN, HR (full), PAYROLL (salary only)
 */

import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee.validators.js";

const router = Router();
router.use(authenticateUser);

// /me must be before /:id to avoid being matched as an id
router.get("/me", authorizeRoles("ADMIN", "HR", "PAYROLL", "EMPLOYEE"), employeeController.getMyProfile);
router.get("/", authorizeRoles("ADMIN", "HR", "PAYROLL", "EMPLOYEE"), employeeController.getAllEmployees);
router.get("/:id", authorizeRoles("ADMIN", "HR", "PAYROLL", "EMPLOYEE"), employeeController.getEmployeeById);
router.post("/", authorizeRoles("ADMIN", "HR"), validate(createEmployeeSchema), employeeController.createEmployee);
router.patch("/:id", authorizeRoles("ADMIN", "HR", "PAYROLL"), validate(updateEmployeeSchema), employeeController.updateEmployee);

export default router;
