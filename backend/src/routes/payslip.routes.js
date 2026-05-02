/**
 * src/routes/payslip.routes.js
 * Payslip module routes.
 *
 * GET /payslip/:employeeId
 *   - EMPLOYEE: can only fetch their own payslip (enforced in service)
 *   - ADMIN, HR, PAYROLL: can fetch any employee's payslip
 */

import { Router } from "express";
import * as payslipController from "../controllers/payslip.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.get(
  "/:employeeId",
  authorizeRoles("ADMIN", "EMPLOYEE", "HR", "PAYROLL"),
  payslipController.getPayslipsForEmployee
);

export default router;
