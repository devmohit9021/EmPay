import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://postgres:Admin%401234@localhost:5432/empay_db' });

async function run() {
  // Find EMPLOYEE users with NO employee profile (orphaned)
  const orphans = await pool.query(`
    SELECT u.id, u.name, u.email, u.role
    FROM users u
    LEFT JOIN employees e ON e.user_id = u.id
    WHERE u.role = 'EMPLOYEE' AND e.id IS NULL
  `);

  console.log('\n=== ORPHANED EMPLOYEE USERS (no profile) ===');
  if (orphans.rows.length === 0) {
    console.log('  None found ✅');
  } else {
    orphans.rows.forEach(u => console.log(`  ${u.email} (${u.name})`));
    console.log('\nDeleting orphaned users...');
    await pool.query(`
      DELETE FROM users
      WHERE role = 'EMPLOYEE'
      AND id NOT IN (SELECT user_id FROM employees)
    `);
    console.log(`  Deleted ${orphans.rows.length} orphaned user(s) ✅`);
  }

  // Final state
  const final = await pool.query(`SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role`);
  console.log('\n=== FINAL USER COUNTS ===');
  final.rows.forEach(r => console.log(`  ${r.role}: ${r.count}`));

  await pool.end();
}

run().catch(e => { console.error(e.message); pool.end(); });
