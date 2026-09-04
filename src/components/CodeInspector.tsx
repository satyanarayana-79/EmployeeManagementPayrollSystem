import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Layers, ShieldCheck, Database } from 'lucide-react';

const CODE_FILES = {
  'models.py': {
    language: 'Python',
    title: 'Phase 2: Python OOP Modeling (models.py)',
    description: 'Object-Oriented Programming domain models encapsulating payroll calculations, tax deduction business logic, and class definitions.',
    code: `"""
Employee Management & Payroll System
OOP Modeling Architecture - models.py
"""

class Department:
    def __init__(self, dept_id, dept_name):
        self.dept_id = dept_id
        self.dept_name = dept_name

class Employee:
    """Models employee identity, contact, department relation, and compensation."""
    def __init__(self, emp_id, name, email, dept_id, base_salary):
        self.emp_id = emp_id
        self.name = name
        self.email = email
        self.dept_id = dept_id
        self.base_salary = float(base_salary)

    def validate(self):
        """Input validation and exception prevention."""
        if not self.name or len(self.name) < 2:
            raise ValueError("Employee name must have at least 2 characters.")
        if "@" not in self.email:
            raise ValueError("Invalid email format.")
        if self.base_salary <= 0:
            raise ValueError("Base salary must be positive.")
        return True

class AttendanceRecord:
    """Models daily attendance and overtime tracking."""
    def __init__(self, att_id, emp_id, work_date, status, overtime_hours=0):
        self.att_id = att_id
        self.emp_id = emp_id
        self.work_date = work_date
        self.status = status # 'Present' or 'Absent'
        self.overtime_hours = overtime_hours if status == 'Present' else 0

class PayrollProcessor:
    """
    Automated salary calculations including tax deductions and overtime pay.
    Encapsulates core business logic away from database transport layers.
    """
    OVERTIME_HOURLY_RATE = 20.0 # $20 per overtime hour
    FLAT_TAX_RATE = 0.10        # 10% statutory tax

    @staticmethod
    def calculate_pay(base_salary: float, overtime_hours: int):
        # Business Logic: $20 per overtime hour, 10% tax
        overtime_pay = overtime_hours * PayrollProcessor.OVERTIME_HOURLY_RATE
        gross_pay = base_salary + overtime_pay
        tax = gross_pay * PayrollProcessor.FLAT_TAX_RATE
        net_pay = gross_pay - tax
        return round(tax, 2), round(net_pay, 2)
`,
  },
  'app.py': {
    language: 'Python / Flask',
    title: 'Phase 3: Flask Backend & Complex SQL Queries (app.py)',
    description: 'REST and controller endpoints performing normalized MySQL queries with JOINs, GROUP BY, input sanitization, and exception handling.',
    code: `from flask import Flask, render_template, request, redirect, jsonify
import mysql.connector
from models import Employee, PayrollProcessor

app = Flask(__name__)

# Database Connection Helper
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="yourpassword",
        database="payroll_db"
    )

@app.route('/')
def index():
    """
    COMPLEX SQL QUERY:
    Joining tables for a comprehensive payroll summary report
    Combines employees, departments, and dynamic overtime sums from attendance.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT e.name, d.dept_name, e.base_salary, 
           COALESCE(SUM(a.overtime_hours), 0) as total_ot
    FROM employees e
    JOIN departments d ON e.dept_id = d.dept_id
    LEFT JOIN attendance a ON e.emp_id = a.emp_id
    GROUP BY e.emp_id
    """
    cursor.execute(query)
    reports = cursor.fetchall()
    conn.close()
    return render_template('index.html', reports=reports)

@app.route('/add_employee', methods=['POST'])
def add_employee():
    """
    CRUD Operation: Create employee with duplicate email validation
    and input exception handling.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        name = request.form['name'].strip()
        email = request.form['email'].strip()
        dept_id = int(request.form['dept_id'])
        salary = float(request.form['salary'])
        
        # Instantiate OOP Model for validation
        emp = Employee(0, name, email, dept_id, salary)
        emp.validate()
        
        # Execute parameterized SQL to prevent SQL Injection
        cursor.execute(
            "INSERT INTO employees (name, email, dept_id, base_salary) VALUES (%s, %s, %s, %s)",
            (emp.name, emp.email, emp.dept_id, emp.base_salary)
        )
        conn.commit()
        return redirect('/')
    except mysql.connector.Error as db_err:
        return f"Database Error: {db_err}", 400
    except Exception as e:
        return f"Validation Error: {e}", 400
    finally:
        cursor.close()
        conn.close()

@app.route('/analytics/departments')
def department_analytics():
    """
    Aggregate SQL Query: GROUP BY dept_name and AVG(base_salary)
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
    SELECT d.dept_name,
           COUNT(e.emp_id) as employee_count,
           ROUND(AVG(e.base_salary), 2) as avg_salary,
           SUM(e.base_salary) as total_salary
    FROM departments d
    LEFT JOIN employees e ON d.dept_id = e.dept_id
    GROUP BY d.dept_id
    """
    cursor.execute(query)
    analytics = cursor.fetchall()
    conn.close()
    return jsonify(analytics)

if __name__ == '__main__':
    app.run(debug=True)
`,
  },
  'schema.sql': {
    language: 'SQL (MySQL)',
    title: 'Phase 1: Normalized Database Schema (schema.sql)',
    description: '3rd Normal Form (3NF) relational tables with Primary Keys, Foreign Keys, Unique constraints, and Cascade behaviors.',
    code: `CREATE DATABASE IF NOT EXISTS payroll_db;
USE payroll_db;

-- 1. Departments Table
CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL
);

-- 2. Employees Table (FK to departments)
CREATE TABLE employees (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    dept_id INT NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE RESTRICT
);

-- 3. Attendance & Overtime Log Table (FK to employees)
CREATE TABLE attendance (
    att_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    work_date DATE NOT NULL,
    status ENUM('Present', 'Absent') DEFAULT 'Present',
    overtime_hours INT DEFAULT 0,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
);

-- 4. Payroll Records Table (FK to employees)
CREATE TABLE payroll (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    month_year VARCHAR(20) NOT NULL,
    tax_deductions DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    UNIQUE(emp_id, month_year)
);
`,
  },
};

type FileKey = keyof typeof CODE_FILES;

export const CodeInspector: React.FC = () => {
  const [activeFile, setActiveFile] = useState<FileKey>('models.py');
  const [copied, setCopied] = useState(false);

  const fileData = CODE_FILES[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(fileData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Resume Highlights Architecture Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            System Architecture &amp; OOP Design Principles
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          This system bridges Python Object-Oriented Programming with a normalized MySQL database, fulfilling all requirements outlined in the project specification:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> 1. OOP Encapsulation
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Business rules (such as <code>$20/hr</code> overtime and <code>10%</code> statutory tax) live cleanly inside <code>PayrollProcessor</code>, eliminating logic leaks into UI or raw queries.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" /> 2. Database Normalization
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Normalized schema across 4 tables prevents redundancy: employees reference departments via FK, attendance records link via <code>emp_id</code>, guaranteeing referential integrity.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> 3. Exception Handling
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              CRUD actions validate unique emails, non-negative salaries, and non-empty employee names before committing transactions, preventing data corruption.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
        {/* File Tabs */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-1">
            {(Object.keys(CODE_FILES) as FileKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveFile(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  activeFile === key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-md transition-colors border border-slate-700 font-mono"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Code
              </>
            )}
          </button>
        </div>

        {/* File Meta Header */}
        <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 text-xs">
          <div className="font-bold text-slate-200">{fileData.title}</div>
          <p className="text-slate-400 text-[11px] mt-0.5">{fileData.description}</p>
        </div>

        {/* Code Content */}
        <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
          <code>{fileData.code}</code>
        </pre>
      </div>
    </div>
  );
};
