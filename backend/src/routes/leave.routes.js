/**
 * src/routes/leave.routes.js
 * Leave module routes.
 *
 * POST  /leave/apply         — EMPLOYEE
 * GET   /leave/my            — EMPLOYEE
 * GET   /leave/all           — ADMIN, HR, PAYROLL
 * PATCH /leave/:id/approve   — PAYROLL only
 * PATCH /leave/:id/reject    — PAYROLL only
 */

import { Router } from "express";
import * as leaveController from "../controllers/leave.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { applyLeaveSchema } from "../validators/leave.validators.js";

const router = Router();

router.use(authenticateUser);

router.post(
  "/apply",
  authorizeRoles("EMPLOYEE"),
  validate(applyLeaveSchema),
  leaveController.applyLeave
);

router.get("/my", authorizeRoles("EMPLOYEE"), leaveController.getMyLeaves);

router.get(
  "/all",
  authorizeRoles("ADMIN", "HR", "PAYROLL"),
  leaveController.getAllLeaves
);

// Only PAYROLL officers manage the approval workflow
router.patch(
  "/:id/approve",
  authorizeRoles("PAYROLL", "ADMIN"),
  leaveController.approveLeave
);

router.patch(
  "/:id/reject",
  authorizeRoles("PAYROLL", "ADMIN"),
  leaveController.rejectLeave
);

export default router;
