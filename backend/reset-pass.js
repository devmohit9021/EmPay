import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';
const { Client } = pg;

async function resetPassword() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const email = 'mohit1@gmail.com';
  const newPassword = '11111111';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await client.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);
  console.log(`Password for ${email} reset to: ${newPassword}`);
  await client.end();
}

resetPassword();
