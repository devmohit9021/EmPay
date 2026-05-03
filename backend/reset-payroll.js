import 'dotenv/config';
import db from './src/db/connection.js';
import { payroll, payslips } from './src/db/schema/index.js';

async function resetPayroll() {
  console.log("Cleaning up old bad payroll records...");
  try {
    await db.delete(payslips);
    await db.delete(payroll);
    console.log("Done! You can now re-run the payrun from the UI to see the correct calculations.");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}

resetPayroll();
