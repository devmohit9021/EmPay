# 🚀 EmPay — Modern HRMS & Payroll System

EmPay is a high-performance, premium Human Resource Management System (HRMS) built for speed, scalability, and visual excellence. It streamlines employee management, attendance tracking, leave processing, and payroll generation in one unified platform.

---

## 📺 Project Demo
Check out the project overview and walkthrough here:
[**Google Drive Video Link**](https://drive.google.com/drive/folders/1iOE-dAQ1zcdRHMCn6Yf8sZZNcpFi8d0O)

---

## ✨ Key Features

### 🏢 Employee Management
- **Universal Directory**: A high-speed searchable directory for all employees and staff.
- **Role-Based Profiles**: Detailed profiles with skills, certifications, and banking information.
- **Security**: Robust RBAC (Role-Based Access Control) for Admin, HR, Payroll, and Employees.

### ⏱️ Attendance & Tracking
- **Smart Check-In/Out**: Real-time attendance logging with status toggles.
- **Optimized Performance**: Scalable pagination for 10,000+ records (50 per page).
- **History View**: Filterable history for employees to track their working days.

### 🌴 Leave Management
- **Request Workflow**: Simple request system for employees.
- **Approval Engine**: Managers/HR can approve or reject leaves with one click.
- **Status Tracking**: Visual indicators for pending, approved, and rejected leaves.

### 💰 Payroll & Payslips
- **Automated Engine**: Calculates Gross Pay, PF (12%), and Professional Tax automatically.
- **Base Salary Config**: Flexible salary structure per employee.
- **Payslip Generation**: Generates clean, professional payslips for any selected month.

### 📊 Reports & Dashboard
- **Visual Analytics**: Real-time charts showing attendance trends and headcounts.
- **Overview Cards**: Quick glance at total employees, present today, and pending leaves.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite), Tailwind CSS, Lucide Icons, React Hot Toast.
- **Backend**: Node.js, Express.js, JWT Authentication.
- **Database**: PostgreSQL (hosted on Supabase).
- **ORM**: Drizzle ORM (Type-safe SQL).

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with DATABASE_URL and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic & DB queries
│   │   ├── db/            # Drizzle schema & connection
│   │   ├── routes/        # API endpoints
│   │   └── middleware/    # Auth & Error handling
│   └── seed_attendance.js # Large-scale data seeding script
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth state management
│   │   └── services/      # API integration
│   └── tailwind.config.js # Custom theme & colors
```

---

## 🧪 Data Seeding
To test the system with large datasets, run the seeding scripts:
- `node backend/seed_dummy_data.js`: Generates 500+ employees.
- `node backend/seed_attendance.js`: Generates 10,000+ attendance records.

---

## 📄 License
This project is for internal use at EmPay.

