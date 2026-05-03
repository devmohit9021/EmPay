import 'dotenv/config';
import { runPayroll } from './src/services/payroll.service.js';

async function testRun() {
  try {
    console.log("Running payroll engine directly...");
    const result = await runPayroll({ month: 5, year: 2026, totalWorkingDays: 26 });
    console.log("Success! Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Payroll Run Failed:", err.message);
  }
  process.exit();
}

testRun();
