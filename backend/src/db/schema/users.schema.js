/**
 * src/db/schema/users.schema.js
 * Drizzle schema for the `users` table.
 * Stores authentication credentials and role assignment.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Role enum - defines all valid system roles
export const roleEnum = pgEnum("role", [
  "ADMIN",
  "EMPLOYEE",
  "HR",
  "PAYROLL",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(), // bcrypt hashed
  role: roleEnum("role").notNull().default("EMPLOYEE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
