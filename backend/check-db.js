import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

async function checkDb() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const c = await client.query("SELECT * FROM companies");
  console.log("COMPANIES:", c.rows);
  const u = await client.query("SELECT * FROM users");
  console.log("USERS:", u.rows);
  await client.end();
}

checkDb();
