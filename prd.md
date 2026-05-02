🧠 1. Product Overview

Product Name: EmPay – Smart Human Resource Management System

Category: HRTech / ERP System

Objective:
To build a centralized system that manages employee data, attendance, leave workflows, and payroll processing in a seamless, automated, and role-based manner.

💡 Core Idea

EmPay is designed to replace manual HR processes (Excel sheets, fragmented tools) with a single integrated system.

👉 Key principle:

All HR operations are interconnected and should work as one system.

Core Flow:
Employee → Attendance → Leave → Payroll → Payslip → Dashboard

👉 This flow is the heart of the product.

🎯 2. Problem Statement

Organizations (especially startups, SMEs, institutions) face:

❌ Manual attendance tracking
❌ Disconnected payroll systems
❌ No clear leave approval workflow
❌ Errors in salary calculation
❌ Lack of transparency
🚀 3. Solution

EmPay provides:

Centralized employee management
Automated attendance tracking
Structured leave approval workflow
Payroll calculation based on real data
Data-driven dashboards

👉 Result:

Reduced errors
Improved transparency
Better decision-making
👥 4. Target Users
Startups
Small & Medium Enterprises (SMEs)
Educational institutions
HR teams
👤 5. User Roles & Permissions
👑 Admin (Super User)

Capabilities:

Full system access
Create, update, delete users
Assign roles
Manage all modules
View analytics

Restrictions: None

👨‍💼 Employee

Capabilities:

Mark attendance
Apply for leave
View personal records

Restrictions:

Cannot access payroll
Cannot modify other users
Cannot access system settings
🧑‍💻 HR Officer

Capabilities:

Create/update employee profiles
View all attendance records
Allocate leaves

Restrictions:

Cannot access payroll
Cannot modify system settings
💰 Payroll Officer

Capabilities:

Approve/reject leave requests
Run payroll
Generate payslips
Access attendance data

Restrictions:

Cannot modify employee data
Cannot access system settings
🧩 6. Core Modules
🔐 6.1 User & Role Management
Features:
User registration & login
JWT-based authentication
Role-based access control (RBAC)
Profile management
Functional Requirements:
Unique email per user
Secure password storage (hashed)
Role-based route protection
📅 6.2 Attendance Management
Features:
Daily attendance marking
Attendance history (daily/monthly)
Role-based visibility
Business Rules:
One attendance entry per employee per day
Cannot mark past/future attendance (optional constraint)
🏖️ 6.3 Leave Management
Features:
Apply for leave
Leave status tracking
Approval workflow
Workflow:
Employee → Apply → PENDING → APPROVED / REJECTED
Business Rules:
Only Payroll Officer can approve/reject
Leaves must be date-validated
💰 6.4 Payroll Management (CORE MODULE)
Features:
Salary calculation engine
Payrun (monthly processing)
Payslip generation
💡 Salary Calculation Logic
Per Day Salary = Base Salary / Total Working Days

Net Salary =
  (Per Day Salary × Days Present)
  - PF (12%)
  - Professional Tax
Payroll Inputs:
Attendance records
Approved leaves
Employee base salary
Outputs:
Salary breakdown
Deductions
Net salary
📄 6.5 Payslip
Features:
Monthly payslip generation
Salary breakdown view
Contents:
Earnings
Deductions
Net salary
📊 6.6 Dashboard & Analytics
Features:
Attendance summary
Leave statistics
Payroll insights
Employee count
Role-Based Views:
Employee → personal stats
Admin → system-wide overview
🔗 7. System Flow & Data Relationships
Users
  ↓
Employees
  ↓
Attendance + Leaves
  ↓
Payroll Processing (Payrun)
  ↓
Payslip Generation
  ↓
Dashboard Insights

👉 This integration is mandatory for a complete system.

⚙️ 8. Functional Requirements (Detailed)
User authentication (JWT)
Role-based authorization
Employee CRUD operations
Attendance tracking system
Leave workflow with status
Payroll calculation engine
Payslip generation
Dashboard data aggregation
🔒 9. Non-Functional Requirements
Secure authentication & authorization
Clean backend architecture
Scalable database schema
Input validation (Zod)
Error handling system
Performance optimization (basic level)
🗄️ 10. Data Model Overview
Core Entities:
Users
Employees
Attendance
Leaves
Payroll
Payslips

👉 Relationships:

User → Employee (1:1)
Employee → Attendance (1:N)
Employee → Leaves (1:N)
Employee → Payroll (1:N)
🧠 11. Business Logic Requirements (CRITICAL)
Attendance affects salary
Approved leaves affect payroll
Payroll must be calculated monthly (payrun)
Role restrictions must be strictly enforced
🎯 12. Success Metrics

The system is successful if:

All modules are interconnected
Role-based restrictions work correctly
Payroll is accurately calculated
APIs are structured and clean
System is usable end-to-end
⚠️ 13. Constraints (Hackathon Reality)
Limited time (24 hours)
Focus on functionality over UI
Backend logic is priority
🚀 14. Future Enhancements (Optional)
Real-time notifications
Multi-company support
Advanced analytics
Salary structures & bonuses
Mobile app