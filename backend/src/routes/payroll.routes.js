/**
 * src/routes/payroll.routes.js
 * Payroll module routes.
 *
 * POST /payroll/run — ADMIN, PAYROLL
 */

import { Router } from "express";
import * as payrollController from "../controllers/payroll.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { payrollRunSchema } from "../validators/payroll.validators.js";

const router = Router();

router.use(authenticateUser);

router.post(
  "/run",
  authorizeRoles("ADMIN", "PAYROLL"),
  validate(payrollRunSchema),
  payrollController.runPayroll
);

export default router;
