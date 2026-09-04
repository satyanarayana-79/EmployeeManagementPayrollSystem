# Employee Management & Payroll System

A full-featured, enterprise-grade Employee Management and Automated Payroll System built with a normalized relational database schema (MySQL / SQLite), Object-Oriented Domain Models, real-time CRUD operations, automated overtime and tax computation, department-wise analytics, and an interactive SQL Studio.

---

## 📌 Executive Overview

Manual payroll computation and fragmented attendance logs often lead to costly calculation errors, compliance gaps, and delays in disbursement. This system unifies **Personnel Administration**, **Daily Attendance & Overtime Tracking**, **Automated Payroll Generation**, and **Financial Department Analytics** into a single, cohesive, modern Bento-styled interface.

The application adheres strictly to standard relational database design (Third Normal Form - 3NF), implements clean OOP encapsulation principles (modeled after Python's `models.py` domain layer), and includes an in-browser WebAssembly SQL engine for live query execution.

---

## 🏗️ System Architecture

The application is architected around a clean **3-Tier Architecture**:

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│  React 19 + TypeScript + Tailwind CSS (Bento Grid UI)  │
│  • Executive Dashboard   • Employee CRUD Manager       │
│  • Attendance Registry   • Automated Payroll Engine    │
│  • Dept Analytics View   • Interactive SQL Studio      │
│  • Payslip Print Modal   • Python OOP Code Inspector   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  BUSINESS LOGIC LAYER                  │
│       Object-Oriented Domain Models & Processing       │
│  • DepartmentModel       • EmployeeModel (Validation)  │
│  • AttendanceModel       • PayrollProcessor (Rules)    │
│  • Formula: Net = (Base + (Overtime * $20)) * 0.90     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                RELATIONAL DATABASE LAYER               │
│       Normalized 3NF Schema (WebAssembly SQLite)       │
│  • departments (dept_id PK)                            │
│  • employees   (emp_id PK, dept_id FK)                 │
│  • attendance  (att_id PK, emp_id FK, CASCADE)         │
│  • payroll     (payroll_id PK, emp_id FK, UNIQUE)      │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Relational Integrity

The relational database is organized into four normalized tables with foreign keys and cascade rules:

### 1. `departments`
Stores organizational business units.
* `dept_id` `INTEGER PRIMARY KEY AUTOINCREMENT`: Unique department identifier.
* `dept_name` `VARCHAR(100) NOT NULL`: Name of the department (e.g., Engineering, Sales, HR).

### 2. `employees`
Core entity for employee personnel records.
* `emp_id` `INTEGER PRIMARY KEY AUTOINCREMENT`: Unique employee ID.
* `name` `VARCHAR(100) NOT NULL`: Full employee legal name.
* `email` `VARCHAR(100) UNIQUE NOT NULL`: Unique business email address.
* `dept_id` `INTEGER NOT NULL`: Foreign key referencing `departments(dept_id)` with `ON DELETE RESTRICT`.
* `base_salary` `DECIMAL(10, 2) NOT NULL`: Fixed monthly base compensation.

### 3. `attendance`
Daily work presence and overtime hours log.
* `att_id` `INTEGER PRIMARY KEY AUTOINCREMENT`: Unique log ID.
* `emp_id` `INTEGER NOT NULL`: Foreign key referencing `employees(emp_id)` with `ON DELETE CASCADE`.
* `work_date` `DATE NOT NULL`: Date of work record (`YYYY-MM-DD`).
* `status` `VARCHAR(10) CHECK(status IN ('Present', 'Absent'))`: Presence status flag.
* `overtime_hours` `INTEGER DEFAULT 0`: Overtime hours worked on this date.

### 4. `payroll`
Normalized disbursement slips generated per pay period.
* `payroll_id` `INTEGER PRIMARY KEY AUTOINCREMENT`: Unique disbursement slip ID.
* `emp_id` `INTEGER NOT NULL`: Foreign key referencing `employees(emp_id)` with `ON DELETE CASCADE`.
* `month_year` `VARCHAR(20) NOT NULL`: Pay period identifier (e.g., `2025-01`).
* `tax_deductions` `DECIMAL(10, 2) NOT NULL`: Calculated 10% statutory withholding tax.
* `net_salary` `DECIMAL(10, 2) NOT NULL`: Final net disbursement amount.
* **Constraints**: `UNIQUE(emp_id, month_year)` prevents duplicate payroll runs for the same period.

---

## 📐 Business Logic & Automated Calculations

All financial calculations are encapsulated within the `PayrollProcessor` class:

$$\text{Overtime Pay} = \text{Overtime Hours} \times \$20.00/\text{hr}$$

$$\text{Gross Pay} = \text{Base Salary} + \text{Overtime Pay}$$

$$\text{Tax Withholding} = \text{Gross Pay} \times 10\% \ (0.10)$$

$$\text{Net Disbursed Salary} = \text{Gross Pay} - \text{Tax Withholding}$$

### Features of the Processing Engine:
- **Zero-Error Automation**: Automatically sums overtime hours across the pay period from the `attendance` table for each employee.
- **Audited Precision**: All monetary values are rounded to 2 decimal places.
- **Absence Constraints**: Absence entries strictly enforce 0 overtime hours.
- **Idempotent Payroll Execution**: Running payroll updates existing period slips or inserts new ones safely using SQL upsert/transaction logic.

---

## 🚀 Key Modules & Capabilities

### 1. Executive Dashboard
- High-level KPIs: Total Headcount, Active Monthly Payroll, Logged Overtime Hours, and Average Employee Salary.
- Quick action shortcuts to register employees, log overtime, or trigger payroll runs.
- Visual salary allocation progress by department.
- Recent disbursements table showing individual net pay.

### 2. Employee Record Management (CRUD)
- **Create**: Add new employees with name, email, department selection, and base salary.
- **Read**: Search, filter by department, and paginate personnel.
- **Update**: Modal dialog to adjust salaries, department assignments, and contact details.
- **Delete**: Protected deletion modal with explicit warnings regarding cascading child records in attendance and payroll tables.

### 3. Attendance & Overtime Tracker
- Daily logging form with date picker, Present/Absent status toggle, and overtime hour counter.
- Overtime financial multiplier preview ($20.00/hr).
- Employee filter to view historical attendance logs per worker.
- Cascade deletion handling for individual log corrections.

### 4. Automated Payroll & Official Payslips
- Select pay period (e.g., `2025-01`, `2025-02`, `2025-03`).
- One-click **Run Automated Payroll** button to compute all slips across all staff.
- Disbursement registry with base pay, overtime pay, gross pay, taxes, and net compensation.
- **View Slip Modal**: Printable, beautifully designed official pay stub with complete breakdown of earnings, statutory deductions, employee info, and print/PDF support.

### 5. Department-Wise Analytics
- Real-time SQL aggregations using `GROUP BY departments.dept_name`.
- Metric cards showing Headcount, Total Salary Budget, Average Salary, and Logged Overtime.
- Share of total payroll budget visualization.
- Aggregate breakdown table showing `COUNT()`, `AVG()`, and `SUM()` SQL outputs.

### 6. Interactive SQL Studio
- Live, in-browser SQL console powered by WebAssembly SQLite.
- Run any custom `SELECT`, `INSERT`, `UPDATE`, or `DELETE` query with execution time benchmarks in milliseconds.
- Pre-loaded resume and production queries:
  - Multi-table `INNER JOIN` (Employees, Departments, Payroll).
  - Department salary breakdown via `GROUP BY`.
  - Top overtime earners query.
  - Subquery calculating employees earning above company average.
- Schema inspector panel detailing keys, column types, and cardinality.

### 7. Python OOP Architecture Inspector
- Built-in reference viewer showing standard Python OOP implementation (`models.py`, `database.py`, `main.py`).
- Demonstrates encapsulation, exception handling, type hints, and database connection pooling.

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS (Bento Grid design).
- **Icons**: Lucide React.
- **Database Engine**: WebAssembly SQLite (`sql.js`) with MySQL-compatible SQL syntax.
- **Animations & Layout**: Tailwind CSS Transitions & Bento Cards (`rounded-2xl`, high-contrast borders).
- **Tooling & Dev Server**: Vite 6, TypeScript 5.8.

---

## 🛠️ Installation & Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/your-username/employee-payroll-management.git
cd employee-payroll-management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the local development server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
```

### 5. Run static lint check
```bash
npm run lint
```

---

## 📊 Pre-Loaded Sample Data

The database initializes with representative corporate data:

| Employee Name | Department | Base Salary | Sample Overtime | Status |
|---|---|---|---|---|
| Alice Chen | Engineering | $8,200.00 | 10 hrs ($200.00) | Present |
| David Miller | Engineering | $7,600.00 | 6 hrs ($120.00) | Present |
| Sarah Jenkins | Sales & Business Dev | $5,400.00 | 12 hrs ($240.00) | Present |
| Michael Chang | Sales & Business Dev | $5,100.00 | 4 hrs ($80.00) | Present |
| Emily Rodriguez | Product & Design | $7,100.00 | 8 hrs ($160.00) | Present |
| Robert Taylor | Human Resources | $4,800.00 | 0 hrs ($0.00) | Present |
| Jessica Patel | Finance & Operations | $6,500.00 | 5 hrs ($100.00) | Present |

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
