# EmPay HRMS — Backend API

A production-grade **Human Resource Management System** backend built with Node.js, Express.js, PostgreSQL, and Drizzle ORM.

---

## 🏗️ Project Structure

```
src/
├── index.js                  ← App entry point, server bootstrap
├── db/
│   ├── connection.js         ← Drizzle + pg pool setup
│   ├── migrate.js            ← Migration runner script
│   └── schema/
│       ├── index.js          ← Barrel export for all schemas
│       ├── users.schema.js
│       ├── employees.schema.js
│       ├── attendance.schema.js
│       ├── leaves.schema.js
│       ├── payroll.schema.js
│       └── payslips.schema.js
├── controllers/              ← HTTP handlers (thin layer)
├── services/                 ← Business logic (thick layer)
├── routes/                   ← Express router definitions + middleware chains
├── middleware/
│   ├── auth.middleware.js    ← JWT verify + RBAC
│   ├── validate.middleware.js← Zod validation factory
│   └── error.middleware.js  ← Centralized error handler
├── validators/               ← Zod schemas for each module
└── utils/
    ├── AppError.js           ← Custom operational error class
    ├── jwt.utils.js          ← JWT sign helper
    └── payroll.utils.js      ← Pure salary calculation engine
```

---

## ⚙️ Setup & Running

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (local or remote)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
# Edit .env with your database credentials
```

Update `.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/empay_db
JWT_SECRET=your_super_secret_key
```

### 4. Create database
```sql
CREATE DATABASE empay_db;
```

### 5. Generate & run migrations
```bash
npm run db:generate   # Generate SQL migration files from schema
npm run db:migrate    # Apply migrations to the database
```

Or push schema directly (for development):
```bash
npm run db:push
```

### 6. Start the server
```bash
npm run dev    # Development with --watch
npm start      # Production
```

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📦 API Reference

### AUTH

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and get token |
| GET | `/auth/me` | Any Auth | Get current user profile |

**Register:**
```json
POST /auth/register
{
  "name": "Alice Johnson",
  "email": "alice@empay.com",
  "password": "securepassword123",
  "role": "EMPLOYEE"
}
```
Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "uuid", "name": "Alice Johnson", "email": "alice@empay.com", "role": "EMPLOYEE" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Login:**
```json
POST /auth/login
{
  "email": "alice@empay.com",
  "password": "securepassword123"
}
```

---

### EMPLOYEES

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/employees` | ADMIN, HR | Create employee profile |
| GET | `/employees` | ADMIN, HR, PAYROLL | List all employees |
| GET | `/employees/:id` | ADMIN, HR, PAYROLL | Get employee by ID |
| PATCH | `/employees/:id` | ADMIN, HR | Update employee |

**Create Employee:**
```json
POST /employees
{
  "userId": "user-uuid-here",
  "department": "Engineering",
  "designation": "Software Engineer",
  "baseSalary": 50000
}
```

---

### ATTENDANCE

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance/mark` | EMPLOYEE | Mark today's attendance |
| GET | `/attendance/my` | EMPLOYEE | View own attendance history |
| GET | `/attendance/all` | ADMIN, HR, PAYROLL | View all attendance |

**Mark Attendance:**
```json
POST /attendance/mark
{
  "status": "PRESENT",
  "checkInTime": "09:30"
}
```
> `date` is optional — defaults to today.

**Filter all attendance:**
```
GET /attendance/all?month=5&year=2024
```

---

### LEAVE

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/leave/apply` | EMPLOYEE | Apply for leave |
| GET | `/leave/my` | EMPLOYEE | View own leave history |
| GET | `/leave/all` | ADMIN, HR, PAYROLL | View all leaves |
| PATCH | `/leave/:id/approve` | PAYROLL, ADMIN | Approve a leave request |
| PATCH | `/leave/:id/reject` | PAYROLL, ADMIN | Reject a leave request |

**Apply for Leave:**
```json
POST /leave/apply
{
  "startDate": "2024-05-10",
  "endDate": "2024-05-12",
  "reason": "Family function"
}
```

---

### PAYROLL

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payroll/run` | ADMIN, PAYROLL | Run monthly payroll |

**Run Payroll:**
```json
POST /payroll/run
{
  "month": 5,
  "year": 2024,
  "totalWorkingDays": 26
}
```

Response:
```json
{
  "success": true,
  "message": "Payroll run completed for 5/2024",
  "data": {
    "summary": {
      "totalEmployees": 5,
      "processed": 5,
      "skipped": 0,
      "errors": 0
    },
    "results": {
      "processed": [
        {
          "employeeId": "uuid",
          "baseSalary": 50000,
          "daysPresent": 22,
          "leavesTaken": 2,
          "deductions": 6200,
          "netSalary": 43640
        }
      ]
    }
  }
}
```

---

### PAYSLIP

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/payslip/:employeeId` | All (own-only for EMPLOYEE) | Get payslips |

**Get Payslip:**
```
GET /payslip/employee-uuid-here
```

Response:
```json
{
  "success": true,
  "count": 1,
  "data": {
    "payslips": [
      {
        "payslipId": "uuid",
        "generatedAt": "2024-05-31T00:00:00Z",
        "payroll": {
          "month": 5,
          "year": 2024,
          "baseSalary": "50000.00",
          "daysPresent": 22,
          "leavesTaken": 2,
          "pfDeduction": "6000.00",
          "professionalTax": "200.00",
          "deductions": "6200.00",
          "netSalary": "43640.38"
        }
      }
    ]
  }
}
```

---

## 💡 Salary Calculation Formula

```
Per Day Salary = Base Salary / Total Working Days (default: 26)
Effective Days  = Days Present + Approved Leave Days
Gross Salary    = Per Day Salary × Effective Days

PF Deduction    = Base Salary × 12%
Professional Tax = ₹200 (fixed)
Total Deductions = PF + Professional Tax

Net Salary = Gross Salary - Total Deductions
```

---

## 👥 Role Permissions Matrix

| Action | ADMIN | HR | PAYROLL | EMPLOYEE |
|--------|-------|-----|---------|----------|
| Register users | ✅ | ❌ | ❌ | ❌ |
| Create employees | ✅ | ✅ | ❌ | ❌ |
| View all employees | ✅ | ✅ | ✅ | ❌ |
| Mark attendance | ❌ | ❌ | ❌ | ✅ |
| View all attendance | ✅ | ✅ | ✅ | ❌ |
| Apply leave | ❌ | ❌ | ❌ | ✅ |
| Approve/Reject leave | ✅ | ❌ | ✅ | ❌ |
| Run payroll | ✅ | ❌ | ✅ | ❌ |
| View own payslip | ❌ | ❌ | ❌ | ✅ |
| View any payslip | ✅ | ✅ | ✅ | ❌ |

---

## 🧪 Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Validation errors (422):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```
