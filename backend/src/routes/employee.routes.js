/**
 * src/routes/employee.routes.js
 * Employee module routes.
 *
 * POST   /employees      — ADMIN, HR
 * GET    /employees      — ADMIN, HR
 * GET    /employees/:id  — ADMIN, HR
 * PATCH  /employees/:id  — ADMIN, HR
 */

import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../validators/employee.validators.js";

const router = Router();

// All employee routes require authentication
router.use(authenticateUser);

router.post(
  "/",
  authorizeRoles("ADMIN", "HR"),
  validate(createEmployeeSchema),
  employeeController.createEmployee
);

router.get(
  "/",
  authorizeRoles("ADMIN", "HR", "PAYROLL"),
  employeeController.getAllEmployees
);

// GET /employees/me — any authenticated user can get their own employee profile
router.get(
  "/me",
  employeeController.getMyEmployeeProfile
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "HR", "PAYROLL"),
  employeeController.getEmployeeById
);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "HR"),
  validate(updateEmployeeSchema),
  employeeController.updateEmployee
);

export default router;
