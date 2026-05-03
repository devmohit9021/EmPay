/**
 * src/services/settings.service.js — NEW
 * Admin settings: company management, user role management.
 */

import { eq } from "drizzle-orm";
import db from "../db/connection.js";
import { companies, users } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";

/**
 * Get company details (settings panel).
 */
export const getCompanySettings = async () => {
  const allCompanies = await db.select().from(companies).orderBy(companies.createdAt);
  return allCompanies;
};

/**
 * Create a new company.
 */
export const createCompany = async ({ name, code }) => {
  const upperCode = code.toUpperCase();

  const [existing] = await db.select({ id: companies.id }).from(companies).where(eq(companies.code, upperCode));
  if (existing) throw new AppError(`Company code "${upperCode}" is already in use.`, 409);

  const [company] = await db.insert(companies).values({ name, code: upperCode }).returning();
  return company;
};

/**
 * Update company name.
 */
export const updateCompany = async (companyId, { name }) => {
  const [updated] = await db
    .update(companies)
    .set({ name })
    .where(eq(companies.id, companyId))
    .returning();

  if (!updated) throw new AppError("Company not found", 404);
  return updated;
};

/**
 * List all users for settings panel.
 */
export const listAllUsers = async () => {
  return await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
    .from(users)
    .orderBy(users.createdAt);
};

/**
 * Change a user's role.
 */
export const changeUserRole = async (targetUserId, newRole) => {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, targetUserId));
  if (!user) throw new AppError("User not found", 404);

  const [updated] = await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, targetUserId))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  return updated;
};
