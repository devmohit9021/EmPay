/**
 * src/services/auth.service.js — v2
 *
 * Key Rules:
 *  - registerUser: always assigns EMPLOYEE role (no role picking from outside)
 *  - setupCompany: one-time endpoint, creates company + ADMIN user, only if no companies exist
 *  - Admin assigns roles via Settings panel AFTER users are registered
 */

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "../db/connection.js";
import { users, companies } from "../db/schema/index.js";
import { signToken } from "../utils/jwt.utils.js";
import { AppError } from "../utils/AppError.js";

/**
 * Public registration — always creates an EMPLOYEE account.
 * Role CANNOT be set from the outside. Admin assigns roles via Settings.
 *
 * When called by Admin/HR internally (via the protected route),
 * an optional `role` field is accepted to directly create HR / PAYROLL users.
 */
export const registerUser = async ({ name, email, password, role }) => {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Only ADMIN can set a role other than EMPLOYEE — validated at route level
  const assignedRole = role || "EMPLOYEE";

  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword, role: assignedRole })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  return { user: newUser, token };
};

/**
 * ONE-TIME COMPANY SETUP — only runs if no companies exist yet.
 * Creates the company + an ADMIN user in one step.
 * This is the entry point for a brand-new EmPay installation.
 */
export const setupCompany = async ({ companyName, companyCode, adminName, adminEmail, adminPassword }) => {
  // Guard: only allowed if no companies exist
  const existingCompanies = await db.select({ id: companies.id }).from(companies);
  if (existingCompanies.length > 0) {
    throw new AppError(
      "Company already set up. Please log in as Admin or contact your system administrator.",
      403
    );
  }

  // Guard: email must not already exist
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail));
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  // Validate company code (must be exactly 2 uppercase letters)
  const code = companyCode.toUpperCase().trim();
  if (!/^[A-Z]{2}$/.test(code)) {
    throw new AppError("Company code must be exactly 2 letters (e.g. 'OI')", 400);
  }

  // Create the company
  const [company] = await db
    .insert(companies)
    .values({ name: companyName.trim(), code })
    .returning();

  // Create the ADMIN user
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  const [admin] = await db
    .insert(users)
    .values({ name: adminName.trim(), email: adminEmail.toLowerCase().trim(), password: hashedPassword, role: "ADMIN" })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
  return { company, user: admin, token };
};

/**
 * Check if the system has been set up (any companies exist).
 * Used by the frontend to redirect new users to the setup wizard.
 */
export const isSystemSetup = async () => {
  const [company] = await db.select({ id: companies.id }).from(companies);
  return !!company;
};

export const loginUser = async ({ email, password }) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) throw new AppError("Invalid email or password", 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError("Invalid email or password", 401);

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

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

  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const updateUserRole = async (targetUserId, newRole) => {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, targetUserId));
  if (!user) throw new AppError("User not found", 404);

  const [updated] = await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, targetUserId))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return updated;
};

export const updateProfile = async (userId, { name }) => {
  const [updated] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  if (!updated) throw new AppError("User not found", 404);
  return updated;
};

export const getAllUsers = async () => {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
};
