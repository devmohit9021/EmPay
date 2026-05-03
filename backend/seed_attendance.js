import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attendance, employees } from "./src/db/schema/index.js";

const { Pool } = pg;

async function seedAttendance() {
  console.log("Connecting to database...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  try {
    console.log("Fetching all employees...");
    const allEmployees = await db.select({ id: employees.id }).from(employees);
    
    if (allEmployees.length === 0) {
      console.log("No employees found. Run seed_dummy_data.js first.");
      return;
    }

    console.log(`Generating attendance for ${allEmployees.length} employees...`);

    const daysToSeed = 30; // Last 30 days
    const attendanceToInsert = [];
    
    const today = new Date();
    
    for (const employee of allEmployees) {
      for (let i = 1; i <= daysToSeed; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // Skip weekends
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const dateString = date.toISOString().split('T')[0];

        // Random check-in between 08:30 and 09:30
        let checkInHour = 8;
        let checkInMinute = Math.floor(Math.random() * 60) + 30;
        if (checkInMinute >= 60) {
          checkInHour = 9;
          checkInMinute -= 60;
        }
        const checkInTime = `${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}:00`;

        // Random check-out between 17:00 and 18:30
        let checkOutHour = 17;
        let checkOutMinute = Math.floor(Math.random() * 90); // 0 to 89 minutes
        if (checkOutMinute >= 60) {
          checkOutHour = 18;
          checkOutMinute -= 60;
        }
        const checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}:00`;

        attendanceToInsert.push({
          employeeId: employee.id,
          date: dateString,
          status: "PRESENT",
          checkInTime,
          checkOutTime,
        });
      }
    }

    console.log(`Inserting ${attendanceToInsert.length} attendance records...`);
    
    // Insert in batches
    const BATCH_SIZE = 200;
    for (let i = 0; i < attendanceToInsert.length; i += BATCH_SIZE) {
      const batch = attendanceToInsert.slice(i, i + BATCH_SIZE);
      await db.insert(attendance).values(batch).onConflictDoNothing();
      process.stdout.write(`\rInserted ${Math.min(i + BATCH_SIZE, attendanceToInsert.length)} / ${attendanceToInsert.length} records...`);
    }

    console.log("\n\n✅ Successfully added attendance history!");
    
  } catch (error) {
    console.error("\n❌ Error seeding attendance:", error);
  } finally {
    await pool.end();
  }
}

seedAttendance();
