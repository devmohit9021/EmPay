import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

async function checkUsers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT id, name, email, role, created_at FROM users");
  console.log("USERS:", res.rows);
  await client.end();
}

checkUsers();
