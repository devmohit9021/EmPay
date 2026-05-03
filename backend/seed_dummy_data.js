import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { users, companies, employees } from "./src/db/schema/index.js";

const { Pool } = pg;

async function seedData() {
  console.log("Connecting to database...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  try {
    // 1. Ensure we have a company to assign them to
    let [company] = await db.select().from(companies).limit(1);
    
    if (!company) {
      console.log("No company found. Creating a default company...");
      [company] = await db.insert(companies).values({
        name: "Acme Corp",
        code: "ACME",
        timezone: "Asia/Kolkata",
        isActive: true,
      }).returning();
    }

    console.log(`Using company: ${company.name}`);

    // Pre-hash a default password for all dummy users ('password123')
    console.log("Hashing default password...");
    const defaultPassword = await bcrypt.hash("password123", 10);

    const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Mohit", "Prasad", "Teja", "Raj", "Anita", "Sunil", "Ravi", "Priya"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Sharma", "Verma", "Patil", "Deshmukh"];
    const departments = ["Engineering", "HR", "Sales", "Marketing", "Finance", "Support", "IT", "Operations"];
    const designations = ["Associate", "Senior Specialist", "Manager", "Director", "Coordinator", "Analyst", "Developer"];
    const locations = ["Mumbai, India", "Pune, India", "Bangalore, India", "New York, USA", "London, UK", "Remote"];

    console.log("Generating 500 dummy records...");
    
    // Process in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    let totalInserted = 0;

    for (let batch = 0; batch < 500 / BATCH_SIZE; batch++) {
      const usersToInsert = [];
      const employeesToInsert = [];
      
      for (let i = 0; i < BATCH_SIZE; i++) {
        const index = batch * BATCH_SIZE + i;
        
        // Generate random data
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        // Ensure email uniqueness with an index
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 1000}@dummy.com`;
        
        const userId = crypto.randomUUID();

        usersToInsert.push({
          id: userId,
          name: name,
          email: email,
          password: defaultPassword,
          role: "EMPLOYEE",
          isActive: true,
        });

        // Generate base salary between 30,000 and 150,000
        const randomSalary = Math.floor(Math.random() * 120000) + 30000;

        employeesToInsert.push({
          userId: userId,
          companyId: company.id,
          employeeCode: `EMP${1000 + index}`,
          department: departments[Math.floor(Math.random() * departments.length)],
          designation: designations[Math.floor(Math.random() * designations.length)],
          baseSalary: randomSalary,
          location: locations[Math.floor(Math.random() * locations.length)],
          mobile: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          about: "This is a dummy profile generated for testing purposes.",
          joinedAt: new Date(new Date().getTime() - Math.random() * 10000000000).toISOString().split('T')[0], // Random join date in the past
        });
      }

      // Insert users first
      await db.insert(users).values(usersToInsert);
      
      // Insert their employee records
      await db.insert(employees).values(employeesToInsert);
      
      totalInserted += BATCH_SIZE;
      process.stdout.write(`\rInserted ${totalInserted} / 500 records...`);
    }

    console.log("\n\n✅ Successfully added 500 dummy employees!");
    console.log("All dummy users can log in with:");
    console.log("Password: password123");
    
  } catch (error) {
    console.error("\n❌ Error seeding data:", error);
  } finally {
    await pool.end();
  }
}

seedData();
