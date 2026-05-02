/**
 * src/services/employee.service.js — v2
 *
 * Key additions:
 *  - Company-linked employee creation
 *  - Auto employee code generation
 *  - Role-scoped updates (PAYROLL can only change baseSalary)
 *  - Profile endpoint with manager info + bank detail warnings
 *  - Employee directory (sanitized for EMPLOYEE role — no baseSalary)
 */

import { eq, and } from "drizzle-orm";
import db from "../db/connection.js";
import { employees, users, companies } from "../db/schema/index.js";
import { generateEmployeeCode } from "../utils/employeeCode.utils.js";
import { AppError } from "../utils/AppError.js";

/**
 * Creates a new employee profile.
 * Validates user & company exist, generates unique employee code.
 */
export const createEmployee = async ({
  userId,
  companyId,
  department,
  designation,
  baseSalary,
  joinedAt,
  managerId,
}) => {
  // Validate user exists
  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, userId));
  if (!user) throw new AppError("User not found. Cannot create employee profile.", 404);

  // Validate company exists
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!company) throw new AppError("Company not found.", 404);

  // Check for duplicate employee profile
  const [existing] = await db.select({ id: employees.id }).from(employees).where(eq(employees.userId, userId));
  if (existing) throw new AppError("An employee profile already exists for this user.", 409);

  // Validate managerId if provided
  if (managerId) {
    const [manager] = await db.select({ id: employees.id }).from(employees).where(eq(employees.id, managerId));
    if (!manager) throw new AppError("Manager not found.", 404);
  }

  // Parse name for code generation
  const nameParts = user.name.trim().split(" ");
  const firstName = nameParts[0] || "XX";
  const lastName = nameParts[1] || "XX";

  // Generate employee code
  const employeeCode = await generateEmployeeCode(company.code, firstName, lastName, joinedAt || new Date());

  const [employee] = await db
    .insert(employees)
    .values({
      userId,
      companyId,
      department,
      designation,
      baseSalary: String(baseSalary),
      joinedAt: joinedAt || new Date().toISOString().split("T")[0],
      managerId: managerId || null,
      employeeCode,
    })
    .returning();

  return employee;
};

/**
 * Returns all employees.
 * If the requester is EMPLOYEE role — strip baseSalary and bank details (read-only directory view).
 */
export const getAllEmployees = async (requestorRole) => {
  const isEmployee = requestorRole === "EMPLOYEE";

  const result = await db
    .select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      department: employees.department,
      designation: employees.designation,
      joinedAt: employees.joinedAt,
      profilePhoto: employees.profilePhoto,
      // Sensitive fields — hidden for EMPLOYEE role
      ...(isEmployee ? {} : {
        baseSalary: employees.baseSalary,
        bankAccountNo: employees.bankAccountNo,
        bankName: employees.bankName,
        ifscCode: employees.ifscCode,
      }),
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
      company: {
        id: companies.id,
        name: companies.name,
        code: companies.code,
      },
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .leftJoin(companies, eq(employees.companyId, companies.id));

  return result;
};

/**
 * Returns a single employee profile with manager info and bank detail warnings.
 * Used by GET /employees/:id — main profile view.
 */
export const getEmployeeById = async (employeeId) => {
  const [emp] = await db
    .select({
      id: employees.id,
      employeeCode: employees.employeeCode,
      department: employees.department,
      designation: employees.designation,
      baseSalary: employees.baseSalary,
      joinedAt: employees.joinedAt,
      managerId: employees.managerId,
      profilePhoto: employees.profilePhoto,
      bankAccountNo: employees.bankAccountNo,
      bankName: employees.bankName,
      ifscCode: employees.ifscCode,
      createdAt: employees.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
      company: {
        id: companies.id,
        name: companies.name,
        code: companies.code,
      },
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .leftJoin(companies, eq(employees.companyId, companies.id))
    .where(eq(employees.id, employeeId));

  if (!emp) throw new AppError("Employee not found", 404);

  // ── Manager info ────────────────────────────────────────────────────────────
  let managerInfo = null;
  if (emp.managerId) {
    const [mgr] = await db
      .select({
        id: employees.id,
        employeeCode: employees.employeeCode,
        name: users.name,
        designation: employees.designation,
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, emp.managerId));
    managerInfo = mgr || null;
  }

  // ── Bank detail warnings ─────────────────────────────────────────────────────
  const warnings = [];
  if (!emp.bankAccountNo || !emp.bankName || !emp.ifscCode) {
    warnings.push("Bank details are incomplete. Please update your bank information to ensure timely salary payments.");
  }

  return {
    ...emp,
    manager: managerInfo,
    managerStatus: managerInfo ? "assigned" : "Employee without manager",
    warnings,
  };
};

/**
 * Updates an employee record.
 * Role-scoped: PAYROLL role can only update baseSalary.
 */
export const updateEmployee = async (employeeId, updateData, requestorRole) => {
  const [existing] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.id, employeeId));

  if (!existing) throw new AppError("Employee not found", 404);

  // PAYROLL role: only allow baseSalary changes
  let payload = { ...updateData };
  if (requestorRole === "PAYROLL") {
    if (payload.baseSalary === undefined) {
      throw new AppError("Payroll Officers can only update salary information.", 403);
    }
    // Strip all other fields
    payload = { baseSalary: payload.baseSalary };
  }

  // Normalize baseSalary
  if (payload.baseSalary !== undefined) {
    payload.baseSalary = String(payload.baseSalary);
  }

  // Set updatedAt
  payload.updatedAt = new Date();

  const [updated] = await db
    .update(employees)
    .set(payload)
    .where(eq(employees.id, employeeId))
    .returning();

  return updated;
};

/**
 * Get employee by userId — used internally after auth.
 */
export const getEmployeeByUserId = async (userId) => {
  const [result] = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId));
  return result || null;
};
