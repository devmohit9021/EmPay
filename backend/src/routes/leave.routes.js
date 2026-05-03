/**
 * src/routes/leave.routes.js — v2
 * Added: POST /allocate (HR/Admin), GET /balance/:employeeId
 * File upload middleware applied to POST /apply
 */

import { Router } from "express";
import * as leaveController from "../controllers/leave.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { applyLeaveSchema, allocateLeaveSchema } from "../validators/leave.validators.js";
import { handleLeaveUpload } from "../middleware/upload.middleware.js";

const router = Router();
router.use(authenticateUser);

// Employee applies (with optional document upload)
router.post("/apply", authorizeRoles("EMPLOYEE", "HR", "ADMIN"), handleLeaveUpload, validate(applyLeaveSchema), leaveController.applyLeave);

router.get("/my", authorizeRoles("EMPLOYEE"), leaveController.getMyLeaves);
router.get("/all", authorizeRoles("ADMIN", "HR", "PAYROLL"), leaveController.getAllLeaves);

// Approval workflow — Admin and HR can approve/reject
router.patch("/:id/approve", authorizeRoles("HR", "PAYROLL", "ADMIN"), leaveController.approveLeave);
router.patch("/:id/reject",  authorizeRoles("HR", "PAYROLL", "ADMIN"), leaveController.rejectLeave);

// HR/Admin: allocate leave days to an employee (Issue #11)
router.post("/allocate", authorizeRoles("HR", "ADMIN"), validate(allocateLeaveSchema), leaveController.allocateLeave);

// Leave balance (all authenticated)
router.get("/balance/:employeeId", authorizeRoles("ADMIN", "HR", "PAYROLL", "EMPLOYEE"), leaveController.getLeaveBalance);

export default router;
