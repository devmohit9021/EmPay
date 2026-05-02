/**
 * src/services/employee.service.js
 * Business logic for employee management.
 */

import { eq } from "drizzle-orm";
import db from "../db/connection.js";
import { employees, users } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";

/**
 * Creates a new employee profile linked to an existing user.
 */
export const createEmployee = async ({ userId, department, designation, baseSalary }) => {
  // Verify the user exists
  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new AppError("User not found. Cannot create employee profile.", 404);
  }

  // Check if employee profile already exists for this user
  const [existing] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.userId, userId));

  if (existing) {
    throw new AppError("An employee profile already exists for this user.", 409);
  }

  const [employee] = await db
    .insert(employees)
    .values({ userId, department, designation, baseSalary: String(baseSalary) })
    .returning();

  return employee;
};

/**
 * Returns all employees with their linked user info.
 */
export const getAllEmployees = async () => {
  const result = await db
    .select({
      id: employees.id,
      department: employees.department,
      designation: employees.designation,
      baseSalary: employees.baseSalary,
      createdAt: employees.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id));

  return result;
};

/**
 * Updates an employee record (partial updates supported).
 */
export const updateEmployee = async (employeeId, updateData) => {
  // Check employee exists
  const [existing] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.id, employeeId));

  if (!existing) {
    throw new AppError("Employee not found", 404);
  }

  // Normalize baseSalary to string for numeric column
  const payload = { ...updateData };
  if (payload.baseSalary !== undefined) {
    payload.baseSalary = String(payload.baseSalary);
  }

  const [updated] = await db
    .update(employees)
    .set(payload)
    .where(eq(employees.id, employeeId))
    .returning();

  return updated;
};

/**
 * Get a single employee by their ID.
 */
export const getEmployeeById = async (employeeId) => {
  const [result] = await db
    .select({
      id: employees.id,
      department: employees.department,
      designation: employees.designation,
      baseSalary: employees.baseSalary,
      createdAt: employees.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .where(eq(employees.id, employeeId));

  if (!result) {
    throw new AppError("Employee not found", 404);
  }

  return result;
};

/**
 * Get employee profile by userId (used internally after auth).
 */
export const getEmployeeByUserId = async (userId) => {
  const [result] = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId));

  return result || null;
};
