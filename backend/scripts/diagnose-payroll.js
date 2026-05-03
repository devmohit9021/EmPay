import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://postgres:Admin%401234@localhost:5432/empay_db' });

async function diagnose() {
  console.log('\n=== PAYROLL DIAGNOSTIC ===\n');

  // 1. Check employees table
  const emps = await pool.query(`SELECT e.id, e.employee_code, e.base_salary, u.name, u.email FROM employees e LEFT JOIN users u ON e.user_id = u.id`);
  console.log('Employees in DB:', emps.rows.length);
  emps.rows.forEach(e => console.log(`  - ${e.name} | salary: ${e.base_salary} | empId: ${e.id}`));

  // 2. Check existing payroll records
  const pr = await pool.query(`SELECT p.id, p.month, p.year, p.net_salary, u.name FROM payroll p LEFT JOIN employees e ON p.employee_id = e.id LEFT JOIN users u ON e.user_id = u.id`);
  console.log('\nExisting payroll records:', pr.rows.length);
  pr.rows.forEach(p => console.log(`  - ${p.name} | ${p.month}/${p.year} | net: ${p.net_salary}`));

  // 3. Check payslips table
  const ps = await pool.query(`SELECT COUNT(*) as count FROM payslips`);
  console.log('\nPayslips in DB:', ps.rows[0].count);

  // 4. Check leave_balances
  const lb = await pool.query(`SELECT * FROM leave_balances LIMIT 5`);
  console.log('\nLeave balances:', lb.rows.length);

  // 5. Check attendance for current month
  const now = new Date();
  const att = await pool.query(`
    SELECT a.employee_id, a.date, a.status, u.name 
    FROM attendance a 
    LEFT JOIN employees e ON a.employee_id = e.id 
    LEFT JOIN users u ON e.user_id = u.id
    WHERE EXTRACT(MONTH FROM a.date::date) = $1 AND EXTRACT(YEAR FROM a.date::date) = $2
  `, [now.getMonth() + 1, now.getFullYear()]);
  console.log(`\nAttendance this month (${now.getMonth()+1}/${now.getFullYear()}):`, att.rows.length, 'records');
  att.rows.forEach(a => console.log(`  - ${a.name} | ${a.date} | ${a.status}`));

  await pool.end();
}

diagnose().catch(e => { console.error('ERROR:', e.message); pool.end(); });
