/**
 * src/services/auth.service.js
 * Business logic for authentication.
 * Handles user registration, login, and profile retrieval.
 */

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "../db/connection.js";
import { users, employees } from "../db/schema/index.js";
import { signToken } from "../utils/jwt.utils.js";
import { AppError } from "../utils/AppError.js";

/**
 * Registers a new user.
 * - Checks for duplicate email
 * - Hashes the password with bcrypt
 * - Stores the user in the database
 * - Returns a signed JWT token
 */
export const registerUser = async ({ name, email, password, role, department, designation, baseSalary }) => {
  // Check if email already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  // Hash password with bcrypt (salt rounds = 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Use a transaction to ensure both user and employee profile are created
  return await db.transaction(async (tx) => {
    // 1. Insert user record
    const [newUser] = await tx
      .insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    // 2. Create an employee profile for the new user
    // Use provided values or defaults
    await tx.insert(employees).values({
      userId: newUser.id,
      department: department || "General",
      designation: designation || (role === "ADMIN" ? "Administrator" : "Associate"),
      baseSalary: baseSalary ? String(baseSalary) : "0",
    });

    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    return { user: newUser, token };
  });
};

/**
 * Authenticates a user with email and password.
 * Returns a JWT on success.
 */
export const loginUser = async ({ email, password }) => {
  // Fetch user including password for comparison
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  // Generic error to prevent user enumeration attacks
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  // Return user without password
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

/**
 * Returns the current authenticated user's profile.
 */
export const getMe = async (userId) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
