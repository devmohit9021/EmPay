/**
 * scratch/fix_missing_profiles.js
 * Run this to create missing employee profiles for existing users.
 */
import "dotenv/config";
import db from "./db/connection.js";
import { users, employees } from "./db/schema/index.js";
import { sql, eq, notExists } from "drizzle-orm";

async function fix() {
  console.log("Checking for users without employee profiles...");
  
  const usersWithoutProfile = await db
    .select()
    .from(users)
    .where(
      notExists(
        db.select().from(employees).where(eq(employees.userId, users.id))
      )
    );

  console.log(`Found ${usersWithoutProfile.length} users needing profiles.`);

  for (const user of usersWithoutProfile) {
    console.log(`Creating profile for: ${user.email} (${user.role})`);
    await db.insert(employees).values({
      userId: user.id,
      department: "General",
      designation: user.role === "ADMIN" ? "Administrator" : "Associate",
      baseSalary: "0",
    });
  }

  console.log("Done!");
  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
