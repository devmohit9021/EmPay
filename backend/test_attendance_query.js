import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, between } from "drizzle-orm";
import { attendance, employees, users } from "./src/db/schema/index.js";

const { Pool } = pg;

async function testQuery() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  try {
    console.log("Testing attendance query...");
    const result = await db
      .select({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        employee: {
          id: employees.id,
          user: {
            name: users.name,
            email: users.email
          }
        }
      })
      .from(attendance)
      .innerJoin(employees, eq(attendance.employeeId, employees.id))
      .innerJoin(users, eq(employees.userId, users.id))
      .orderBy(attendance.date);

    console.log("Result count:", result.length);
  } catch (error) {
    console.error("Query failed:", error);
  } finally {
    await pool.end();
  }
}

testQuery();
