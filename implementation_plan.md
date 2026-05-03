# EmPay v2 – Full Implementation Plan

## Overview

This plan addresses 17+ reported issues and introduces a Company Hierarchy system.
It is a **significant schema refactor** requiring new tables, schema migrations, and service rewrites.

---

## User Review Required

> [!CAUTION]
> **Breaking DB Changes**: The schema changes below will require a new Drizzle migration (`npm run db:generate && npm run db:migrate`). Existing data in the `employees` table will need re-seeding as new required columns (`employee_code`, `company_id`, `joined_at`) are being added.

> [!IMPORTANT]
> **File Upload (Multer)**: Leave document upload requires `multer` to be installed and a local `uploads/` folder to be created. We will store file paths in the DB, not binary data.

> [!NOTE]
> **Attendance Check-in/Out**: The current model only has `check_in_time`. We'll add `check_out_time`. The status (`PRESENT`/`ABSENT`) will be derived automatically based on whether a check-in exists.

---

## Open Questions

> [!IMPORTANT]
> **Issue #17** ("If no manager then...") — the message is cut off. What should happen when there is no manager? Options:
> a) Leave requests auto-approve?
> b) Leave requests go directly to the Payroll Officer?
> c) Admin is the fallback approver?
> Please clarify before I implement manager-based workflow.

---

## Proposed Changes

### ─── NEW: Company Hierarchy ───

#### [NEW] `companies` table
Columns: `id`, `name`, `code` (2-letter uppercase prefix e.g. "OI"), `created_at`

#### [MODIFY] `employees` table — Add columns:
- `company_id` FK → companies
- `employee_code` (auto-generated, unique) — Format: `{companyCode}{firstName2}{lastName2}{year}{serial:04d}` e.g. `OIPRTR20240001`
- `joined_at` (date) — Year of joining for the code generation
- `manager_id` (nullable FK → employees.id) — Self-referencing for hierarchy
- `profile_photo` (text, nullable) — URL/path to profile image

#### [NEW] companies.schema.js
#### [MODIFY] employees.schema.js
#### [NEW] db migration

---

### ─── Issue #1: Employee Code Generation ───

#### [NEW] `src/utils/employeeCode.utils.js`
- Function: `generateEmployeeCode(companyCode, firstName, lastName, joinedAt)` 
- Queries DB for the current max serial number for that company+year to auto-increment.
- Example output: `OIPRTR20240001`

#### [MODIFY] employee.service.js → `createEmployee()`
- After creating the employee, auto-generate and store the `employee_code`.

---

### ─── Issue #2: Leave Document Upload ───

#### Install: `multer`
#### [NEW] `src/middleware/upload.middleware.js`
- Multer config: `dest = uploads/leaves/`, file types: PDF, JPG, PNG, max 5MB.

#### [MODIFY] leaves.schema.js
- Add column: `document_url` (text, nullable)

#### [MODIFY] leave.routes.js
- `POST /leave/apply` — Add `upload.single('document')` middleware before the controller.

#### [MODIFY] leave.service.js → `applyLeave()`
- Accept and save `documentUrl` from `req.file.path`.

---

### ─── Issue #5: Attendance Check-In / Check-Out Toggle ───

The current model forces status manually. We'll change to a time-tracking model.

#### [MODIFY] attendance.schema.js
- Add column: `check_out_time` (time, nullable)
- Remove manual `status` enum — derive it automatically: if `check_in_time` is set → PRESENT, else → ABSENT.

#### [NEW] `POST /attendance/checkout` endpoint (EMPLOYEE)
- Finds today's attendance record for the employee and sets `check_out_time`.

#### [MODIFY] attendance.service.js
- Refactor `markAttendance` to be the "Check-In" action.
- Add `checkOut` function.

---

### ─── Issues #6, #8: Employee Name in Leave Applications ───

#### [MODIFY] leave.service.js → `getAllLeaves()`
- JOIN with `employees` and `users` tables to include `employeeName`, `employeeCode`, and `department` in the response.

#### [MODIFY] leave.service.js → `getMyLeaves()`
- Also join to return full employee details.

---

### ─── Issue #7: Leave Balance Tracking ───

This is a major new feature. Leaves must be allocated a budget and deducted on approval.

#### [NEW] `leave_balances` table
Columns: `id`, `employee_id` FK, `year` (integer), `total_granted` (integer), `used` (integer), `remaining` (integer, computed)

#### [NEW] leave_balances.schema.js

#### [MODIFY] leave.service.js → `approveLeave()`
- After setting status to APPROVED:
  1. Calculate the number of leave days.
  2. Find the employee's `leave_balance` for the current year.
  3. Check if `remaining >= leaveDays`. If not, throw an error.
  4. Decrement `remaining` and increment `used`.

#### [NEW] `GET /leave/balance/:employeeId` (All authenticated)
- Returns the current year's leave balance for an employee.

#### [MODIFY] HR Allocation: `POST /leave/allocate` (HR, ADMIN)
- Allows HR to set or add to the `total_granted` for a specific employee for a year.

---

### ─── Issue #9: Admin Settings Page ───

#### [NEW] `GET /settings/company` (ADMIN)
- Returns company info (name, code, etc.)

#### [NEW] `PATCH /settings/company` (ADMIN)
- Updates company name.

#### [NEW] `GET /settings/users` (ADMIN)
- Lists all users with their roles.

#### [NEW] `PATCH /settings/users/:id/role` (ADMIN)
- Changes a user's role.

#### [NEW] analytics.routes.js & analytics.service.js (wraps existing stats)

---

### ─── Issues #10, #11: HR Permissions ───

#### [MODIFY] employee.routes.js
- `POST /employees`: Add `HR` to allowed roles.
- `PATCH /employees/:id`: Allow `HR` for all fields, `PAYROLL` for `baseSalary` only.

#### [MODIFY] employee.service.js → `updateEmployee()`
- Accept `requestorRole`. If `PAYROLL`, only allow `baseSalary` field change, silently drop others.

#### [MODIFY] leave.routes.js
- `POST /leave/allocate`: Restricted to `HR`, `ADMIN`.

---

### ─── Issues #12, #13, #14: Payroll Calculations ───

The payroll calculation utility exists but the payroll run service needs a full review and fix.

#### [MODIFY] payroll.service.js → `runPayroll()`
- Full fix to ensure:
  1. Fetches `attendance` correctly for the month.
  2. Counts `PRESENT` days only.
  3. Fetches `APPROVED` leaves in the month and adds them to effective days.
  4. Correctly calculates PF (12% of `baseSalary`) and Professional Tax (₹200 fixed).
  5. Handles edge case: no attendance records (treats all days as absent).

#### [MODIFY] payslip.service.js
- Ensure Payroll Officers can pull payslips for all employees.
- Employees only see their own.

#### [NEW] `GET /payroll/reports/monthly?month=5&year=2024` (PAYROLL, ADMIN)
- Returns a full monthly payroll summary with employee name, total deductions, net salary, etc.

---

### ─── Issue #15: Profile Editing ───

#### [MODIFY] auth.routes.js
- `PATCH /auth/profile`: All authenticated users. Updates `name` in users table.

#### [MODIFY] employee.routes.js
- `PATCH /employees/:id/profile`: Employee can edit their own non-sensitive fields (`department`, `designation` are HR-only; employee can edit their contact info if we add those fields).

---

### ─── Issue #16: Employee Only Sees Own Payroll ───

#### [MODIFY] payslip.routes.js & payslip.service.js
- Already partially implemented. Full enforcement: EMPLOYEE role must match their `employeeId` to the requested `employeeId`. *(Verify and fix).*

---

## New File List

| File | Action |
|------|--------|
| `src/db/schema/companies.schema.js` | NEW |
| `src/db/schema/leave_balances.schema.js` | NEW |
| `src/utils/employeeCode.utils.js` | NEW |
| `src/middleware/upload.middleware.js` | NEW |
| `src/services/analytics.service.js` | NEW |
| `src/services/settings.service.js` | NEW |
| `src/routes/analytics.routes.js` | NEW |
| `src/routes/settings.routes.js` | NEW |
| `uploads/leaves/` folder | NEW |

## Modified File List

| File | Changes |
|------|---------|
| `src/db/schema/employees.schema.js` | +company_id, +employee_code, +joined_at, +manager_id |
| `src/db/schema/attendance.schema.js` | +check_out_time |
| `src/db/schema/leaves.schema.js` | +document_url |
| `src/db/schema/index.js` | Export new schemas + relations |
| `src/services/auth.service.js` | +updateUserRole, +updateProfile |
| `src/services/employee.service.js` | +code generation, +role-scoped update |
| `src/services/attendance.service.js` | +checkOut function, refactored status |
| `src/services/leave.service.js` | +balance check, +allocate, +name in response |
| `src/services/payroll.service.js` | Full payrun logic fix |
| `src/services/payslip.service.js` | EMPLOYEE isolation fix |
| `src/routes/auth.routes.js` | +PATCH /profile, +PATCH /users/:id/role |
| `src/routes/employee.routes.js` | Allow HR create, PAYROLL salary update |
| `src/routes/attendance.routes.js` | +POST /checkout |
| `src/routes/leave.routes.js` | +POST /allocate, +GET /balance/:id |
| `src/index.js` | Register analytics and settings routes |

## Verification Plan

### After Implementation
1. Run `npm run db:generate` to create new migration.
2. Run `npm run db:migrate` to apply to DB.
3. Test via Postman:
   - Register admin → create company → create employee (verify auto-code).
   - Employee checks in → checks out (verify toggle).
   - Employee applies leave with document → HR approves (verify balance decrements).
   - Payroll Officer runs payroll (verify calculation formula).
   - Employee can only see own payslip.
   - Admin updates another user's role via settings.
