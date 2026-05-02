/**
 * src/index.js
 * Application entry point.
 * Bootstraps the Express server, loads environment variables,
 * mounts all routers, and starts listening.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import payslipRoutes from "./routes/payslip.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "EmPay HRMS API",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/leave", leaveRoutes);
app.use("/payroll", payrollRoutes);
app.use("/payslip", payslipRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 EmPay HRMS API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

export default app;
