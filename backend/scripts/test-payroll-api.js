import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://postgres:Admin%401234@localhost:5432/empay_db' });

async function getAdminToken() {
  // Get admin user
  const r = await pool.query(`SELECT email FROM users WHERE role = 'ADMIN' LIMIT 1`);
  await pool.end();
  return r.rows[0]?.email;
}

async function testAPI() {
  const email = await getAdminToken();
  console.log('Admin email:', email);

  // Login to get token
  const loginRes = await fetch('http://localhost:5000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Mohit@123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.data?.token) {
    console.error('Login failed:', JSON.stringify(loginData));
    return;
  }
  const token = loginData.data.token;
  console.log('✅ Logged in, token obtained');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Test preview endpoint
  console.log('\n--- Testing GET /payroll/preview?month=5&year=2026 ---');
  const previewRes = await fetch('http://localhost:5000/payroll/preview?month=5&year=2026&totalWorkingDays=26', { headers });
  const previewData = await previewRes.json();
  console.log('Status:', previewRes.status);
  console.log('Response:', JSON.stringify(previewData, null, 2).slice(0, 1000));

  // Test payroll run
  console.log('\n--- Testing POST /payroll/run ---');
  const runRes = await fetch('http://localhost:5000/payroll/run', {
    method: 'POST',
    headers,
    body: JSON.stringify({ month: 5, year: 2026, totalWorkingDays: 26 })
  });
  const runData = await runRes.json();
  console.log('Status:', runRes.status);
  console.log('Response:', JSON.stringify(runData, null, 2).slice(0, 1000));
}

testAPI().catch(e => console.error('FATAL:', e.message));
