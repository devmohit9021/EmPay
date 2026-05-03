# EmPay v2 – Task Tracker

## Phase 1: Database Schemas
- [x] companies.schema.js (NEW)
- [ ] employees.schema.js (MODIFY - +company_id, +employee_code, +joined_at, +manager_id, +bank fields)
- [ ] attendance.schema.js (MODIFY - +check_out_time)
- [ ] leaves.schema.js (MODIFY - +document_url, +applied_by_user_id)
- [ ] leave_balances.schema.js (NEW)
- [ ] schema/index.js (MODIFY)

## Phase 2: Utilities & Middleware
- [ ] employeeCode.utils.js (NEW)
- [ ] upload.middleware.js (NEW)
- [ ] install multer

## Phase 3: Services
- [ ] auth.service.js (MODIFY - +updateUserRole, +updateProfile)
- [ ] employee.service.js (MODIFY - +code gen, +profile warnings, +role-scoped update)
- [ ] attendance.service.js (MODIFY - +checkOut)
- [ ] leave.service.js (MODIFY - +balance deduction, +allocate, +names in response)
- [ ] payroll.service.js (MODIFY - full payrun fix)
- [ ] payslip.service.js (MODIFY - employee isolation fix)
- [ ] analytics.service.js (NEW)
- [ ] settings.service.js (NEW)

## Phase 4: Validators
- [ ] employee.validators.js (MODIFY - +bank fields, +company_id)
- [ ] leave.validators.js (MODIFY)
- [ ] attendance.validators.js (MODIFY - +checkout schema)
- [ ] settings.validators.js (NEW)

## Phase 5: Controllers
- [ ] auth.controller.js (MODIFY - +updateProfile, +updateRole)
- [ ] employee.controller.js (MODIFY)
- [ ] attendance.controller.js (MODIFY - +checkout)
- [ ] leave.controller.js (MODIFY - +allocate, +balance)
- [ ] analytics.controller.js (NEW)
- [ ] settings.controller.js (NEW)

## Phase 6: Routes
- [ ] auth.routes.js (MODIFY)
- [ ] employee.routes.js (MODIFY)
- [ ] attendance.routes.js (MODIFY)
- [ ] leave.routes.js (MODIFY)
- [ ] analytics.routes.js (NEW)
- [ ] settings.routes.js (NEW)
- [ ] src/index.js (MODIFY)

## Phase 7: DB Migration & Verification
- [ ] npm run db:generate
- [ ] npm run db:migrate
- [ ] Test all endpoints
