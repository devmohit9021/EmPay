import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://postgres:Admin%401234@localhost:5432/empay_db' });

async function run() {
  // Show all users with their roles and whether they have an employee profile
  const r = await pool.query(`
    SELECT u.id, u.name, u.email, u.role, e.id as emp_id, e.department, e.designation
    FROM users u
    LEFT JOIN employees e ON e.user_id = u.id
    ORDER BY u.role, u.email
  `);

  console.log('\n=== ALL USERS & ROLES ===');
  r.rows.forEach(row =>
    console.log(`  ${row.role.padEnd(10)} | ${row.email.padEnd(32)} | ${(row.name||'').padEnd(20)} | EmpProfile: ${row.emp_id ? 'YES ('+row.department+')' : 'NO'}`)
  );

  // Summary counts
  const counts = {};
  r.rows.forEach(row => { counts[row.role] = (counts[row.role] || 0) + 1; });
  console.log('\n=== ROLE SUMMARY ===');
  Object.entries(counts).forEach(([role, count]) => console.log(`  ${role}: ${count}`));

  await pool.end();
}

run().catch(e => { console.error(e.message); pool.end(); });
