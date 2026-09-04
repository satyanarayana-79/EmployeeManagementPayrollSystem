import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import {
  Department,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  PayrollSummaryReport,
  DepartmentAnalytics,
  SqlQueryResult,
  PayslipDetails,
} from '../types';
import { PayrollProcessor, EmployeeModel } from './oopModels';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS departments (
    dept_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    emp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    dept_id INTEGER NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS attendance (
    att_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER NOT NULL,
    work_date DATE NOT NULL,
    status VARCHAR(10) CHECK(status IN ('Present', 'Absent')),
    overtime_hours INTEGER DEFAULT 0,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll (
    payroll_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER NOT NULL,
    month_year VARCHAR(20) NOT NULL,
    tax_deductions DECIMAL(10, 2) NOT NULL,
    net_salary DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
    UNIQUE(emp_id, month_year)
);
`;

const INITIAL_DEPARTMENTS = [
  { dept_id: 1, dept_name: 'Engineering' },
  { dept_id: 2, dept_name: 'Sales & Business Dev' },
  { dept_id: 3, dept_name: 'Product & Design' },
  { dept_id: 4, dept_name: 'Human Resources' },
  { dept_id: 5, dept_name: 'Finance & Operations' },
];

const INITIAL_EMPLOYEES = [
  { emp_id: 1, name: 'Alice Chen', email: 'alice.chen@company.com', dept_id: 1, base_salary: 8200 },
  { emp_id: 2, name: 'David Miller', email: 'david.miller@company.com', dept_id: 1, base_salary: 7600 },
  { emp_id: 3, name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', dept_id: 2, base_salary: 5400 },
  { emp_id: 4, name: 'Michael Roberts', email: 'michael.roberts@company.com', dept_id: 3, base_salary: 6900 },
  { emp_id: 5, name: 'Elena Rostova', email: 'elena.rostova@company.com', dept_id: 4, base_salary: 5100 },
  { emp_id: 6, name: 'James Wilson', email: 'james.wilson@company.com', dept_id: 5, base_salary: 6400 },
  { emp_id: 7, name: 'Priya Sharma', email: 'priya.sharma@company.com', dept_id: 2, base_salary: 5800 },
];

const INITIAL_ATTENDANCE = [
  { att_id: 1, emp_id: 1, work_date: '2026-09-01', status: 'Present', overtime_hours: 3 },
  { att_id: 2, emp_id: 1, work_date: '2026-09-02', status: 'Present', overtime_hours: 2 },
  { att_id: 3, emp_id: 2, work_date: '2026-09-01', status: 'Present', overtime_hours: 4 },
  { att_id: 4, emp_id: 2, work_date: '2026-09-02', status: 'Present', overtime_hours: 1 },
  { att_id: 5, emp_id: 3, work_date: '2026-09-01', status: 'Present', overtime_hours: 6 },
  { att_id: 6, emp_id: 3, work_date: '2026-09-02', status: 'Absent', overtime_hours: 0 },
  { att_id: 7, emp_id: 4, work_date: '2026-09-01', status: 'Present', overtime_hours: 2 },
  { att_id: 8, emp_id: 5, work_date: '2026-09-01', status: 'Present', overtime_hours: 0 },
  { att_id: 9, emp_id: 6, work_date: '2026-09-01', status: 'Present', overtime_hours: 5 },
  { att_id: 10, emp_id: 7, work_date: '2026-09-01', status: 'Present', overtime_hours: 2 },
];

class DatabaseService {
  private db: SqlJsDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  // In-memory fallback if sql.js wasm cannot load in sandboxed offline browser
  private fallbackDepartments = [...INITIAL_DEPARTMENTS];
  private fallbackEmployees = [...INITIAL_EMPLOYEES];
  private fallbackAttendance = [...INITIAL_ATTENDANCE];
  private fallbackPayroll: {
    payroll_id: number;
    emp_id: number;
    month_year: string;
    tax_deductions: number;
    net_salary: number;
  }[] = [];

  constructor() {
    this.seedFallbackPayroll();
  }

  private seedFallbackPayroll() {
    this.fallbackPayroll = [];
    let pid = 1;
    for (const emp of this.fallbackEmployees) {
      const otHours = this.fallbackAttendance
        .filter((a) => a.emp_id === emp.emp_id)
        .reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
      const pay = PayrollProcessor.calculate_pay(emp.base_salary, otHours);
      this.fallbackPayroll.push({
        payroll_id: pid++,
        emp_id: emp.emp_id,
        month_year: 'September 2026',
        tax_deductions: pay.tax_deductions,
        net_salary: pay.net_salary,
      });
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });
        this.db = new SQL.Database();
        this.db.run('PRAGMA foreign_keys = ON;');
        this.db.run(SCHEMA_SQL);
        this.seedInitialData();
        this.isInitialized = true;
      } catch (err) {
        console.warn('sql.js wasm initialization fell back to in-memory relational engine:', err);
        this.isInitialized = true;
      }
    })();

    return this.initPromise;
  }

  private seedInitialData() {
    if (!this.db) return;

    for (const d of INITIAL_DEPARTMENTS) {
      this.db.run('INSERT INTO departments (dept_id, dept_name) VALUES (?, ?);', [
        d.dept_id,
        d.dept_name,
      ]);
    }

    for (const e of INITIAL_EMPLOYEES) {
      this.db.run(
        'INSERT INTO employees (emp_id, name, email, dept_id, base_salary) VALUES (?, ?, ?, ?, ?);',
        [e.emp_id, e.name, e.email, e.dept_id, e.base_salary]
      );
    }

    for (const a of INITIAL_ATTENDANCE) {
      this.db.run(
        'INSERT INTO attendance (att_id, emp_id, work_date, status, overtime_hours) VALUES (?, ?, ?, ?, ?);',
        [a.att_id, a.emp_id, a.work_date, a.status, a.overtime_hours]
      );
    }

    // Seed initial payroll using PayrollProcessor logic
    let pid = 1;
    for (const e of INITIAL_EMPLOYEES) {
      const otHours = INITIAL_ATTENDANCE
        .filter((a) => a.emp_id === e.emp_id)
        .reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
      const pay = PayrollProcessor.calculate_pay(e.base_salary, otHours);
      this.db.run(
        'INSERT INTO payroll (payroll_id, emp_id, month_year, tax_deductions, net_salary) VALUES (?, ?, ?, ?, ?);',
        [pid++, e.emp_id, 'September 2026', pay.tax_deductions, pay.net_salary]
      );
    }
  }

  // --- CRUD Operations with OOP Validation ---

  async getDepartments(): Promise<Department[]> {
    await this.init();
    if (this.db) {
      const res = this.db.exec('SELECT dept_id, dept_name FROM departments ORDER BY dept_id ASC;');
      if (res.length > 0) {
        return res[0].values.map(([dept_id, dept_name]) => ({
          dept_id: Number(dept_id),
          dept_name: String(dept_name),
        }));
      }
    }
    return [...this.fallbackDepartments];
  }

  async getEmployees(): Promise<Employee[]> {
    await this.init();
    if (this.db) {
      const query = `
        SELECT e.emp_id, e.name, e.email, e.dept_id, d.dept_name, e.base_salary
        FROM employees e
        JOIN departments d ON e.dept_id = d.dept_id
        ORDER BY e.emp_id ASC;
      `;
      const res = this.db.exec(query);
      if (res.length > 0) {
        return res[0].values.map(([emp_id, name, email, dept_id, dept_name, base_salary]) => ({
          emp_id: Number(emp_id),
          name: String(name),
          email: String(email),
          dept_id: Number(dept_id),
          dept_name: String(dept_name),
          base_salary: Number(base_salary),
        }));
      }
    }

    return this.fallbackEmployees.map((e) => {
      const dept = this.fallbackDepartments.find((d) => d.dept_id === e.dept_id);
      return {
        ...e,
        dept_name: dept ? dept.dept_name : 'Unknown',
      };
    });
  }

  /**
   * Add Employee with Input Validation and Duplicate Entry Prevention
   */
  async addEmployee(
    name: string,
    email: string,
    dept_id: number,
    base_salary: number
  ): Promise<{ success: boolean; emp_id?: number; error?: string }> {
    await this.init();

    // 1. OOP Validation
    const model = new EmployeeModel(0, name, email, dept_id, base_salary);
    const validation = model.validate();
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 2. Check for duplicate email
    if (this.db) {
      try {
        const check = this.db.exec('SELECT emp_id FROM employees WHERE email = ?;', [model.email]);
        if (check.length > 0 && check[0].values.length > 0) {
          return { success: false, error: `Employee with email '${model.email}' already exists.` };
        }

        this.db.run(
          'INSERT INTO employees (name, email, dept_id, base_salary) VALUES (?, ?, ?, ?);',
          [model.name, model.email, model.dept_id, model.base_salary]
        );

        const lastIdRes = this.db.exec('SELECT last_insert_rowid();');
        const newId = Number(lastIdRes[0].values[0][0]);
        return { success: true, emp_id: newId };
      } catch (err: any) {
        return { success: false, error: err.message || 'Database error occurred.' };
      }
    }

    // Fallback in-memory
    const existing = this.fallbackEmployees.find(
      (e) => e.email.toLowerCase() === model.email.toLowerCase()
    );
    if (existing) {
      return { success: false, error: `Employee with email '${model.email}' already exists.` };
    }
    const newId = (this.fallbackEmployees[this.fallbackEmployees.length - 1]?.emp_id || 0) + 1;
    this.fallbackEmployees.push({
      emp_id: newId,
      name: model.name,
      email: model.email,
      dept_id: model.dept_id,
      base_salary: model.base_salary,
    });
    return { success: true, emp_id: newId };
  }

  /**
   * Update Employee
   */
  async updateEmployee(
    emp_id: number,
    name: string,
    email: string,
    dept_id: number,
    base_salary: number
  ): Promise<{ success: boolean; error?: string }> {
    await this.init();

    const model = new EmployeeModel(emp_id, name, email, dept_id, base_salary);
    const validation = model.validate();
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (this.db) {
      try {
        // Ensure email uniqueness excluding this employee
        const check = this.db.exec(
          'SELECT emp_id FROM employees WHERE email = ? AND emp_id != ?;',
          [model.email, emp_id]
        );
        if (check.length > 0 && check[0].values.length > 0) {
          return { success: false, error: `Email '${model.email}' is already in use by another employee.` };
        }

        this.db.run(
          'UPDATE employees SET name = ?, email = ?, dept_id = ?, base_salary = ? WHERE emp_id = ?;',
          [model.name, model.email, model.dept_id, model.base_salary, emp_id]
        );
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const idx = this.fallbackEmployees.findIndex((e) => e.emp_id === emp_id);
    if (idx === -1) return { success: false, error: 'Employee not found.' };

    const emailInUse = this.fallbackEmployees.find(
      (e) => e.email.toLowerCase() === model.email.toLowerCase() && e.emp_id !== emp_id
    );
    if (emailInUse) {
      return { success: false, error: `Email '${model.email}' is already in use.` };
    }

    this.fallbackEmployees[idx] = {
      emp_id,
      name: model.name,
      email: model.email,
      dept_id: model.dept_id,
      base_salary: model.base_salary,
    };
    return { success: true };
  }

  /**
   * Delete Employee (Handles foreign key relations)
   */
  async deleteEmployee(emp_id: number): Promise<{ success: boolean; error?: string }> {
    await this.init();

    if (this.db) {
      try {
        // Cascade delete attendance and payroll first to uphold integrity
        this.db.run('DELETE FROM attendance WHERE emp_id = ?;', [emp_id]);
        this.db.run('DELETE FROM payroll WHERE emp_id = ?;', [emp_id]);
        this.db.run('DELETE FROM employees WHERE emp_id = ?;', [emp_id]);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    this.fallbackAttendance = this.fallbackAttendance.filter((a) => a.emp_id !== emp_id);
    this.fallbackPayroll = this.fallbackPayroll.filter((p) => p.emp_id !== emp_id);
    this.fallbackEmployees = this.fallbackEmployees.filter((e) => e.emp_id !== emp_id);
    return { success: true };
  }

  // --- Attendance Management ---

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    await this.init();
    if (this.db) {
      const query = `
        SELECT a.att_id, a.emp_id, e.name, a.work_date, a.status, a.overtime_hours
        FROM attendance a
        JOIN employees e ON a.emp_id = e.emp_id
        ORDER BY a.work_date DESC, a.att_id DESC;
      `;
      const res = this.db.exec(query);
      if (res.length > 0) {
        return res[0].values.map(([att_id, emp_id, name, work_date, status, overtime_hours]) => ({
          att_id: Number(att_id),
          emp_id: Number(emp_id),
          emp_name: String(name),
          work_date: String(work_date),
          status: status as 'Present' | 'Absent',
          overtime_hours: Number(overtime_hours),
        }));
      }
    }

    return this.fallbackAttendance.map((a) => {
      const emp = this.fallbackEmployees.find((e) => e.emp_id === a.emp_id);
      return {
        ...a,
        status: a.status as 'Present' | 'Absent',
        emp_name: emp ? emp.name : 'Unknown',
      };
    });
  }

  async logAttendance(
    emp_id: number,
    work_date: string,
    status: 'Present' | 'Absent',
    overtime_hours: number
  ): Promise<{ success: boolean; error?: string }> {
    await this.init();
    const ot = status === 'Absent' ? 0 : Math.max(0, Number(overtime_hours) || 0);

    if (this.db) {
      try {
        this.db.run(
          'INSERT INTO attendance (emp_id, work_date, status, overtime_hours) VALUES (?, ?, ?, ?);',
          [emp_id, work_date, status, ot]
        );
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const newId = (this.fallbackAttendance[this.fallbackAttendance.length - 1]?.att_id || 0) + 1;
    this.fallbackAttendance.push({
      att_id: newId,
      emp_id,
      work_date,
      status,
      overtime_hours: ot,
    });
    return { success: true };
  }

  async deleteAttendance(att_id: number): Promise<{ success: boolean; error?: string }> {
    await this.init();
    if (this.db) {
      try {
        this.db.run('DELETE FROM attendance WHERE att_id = ?;', [att_id]);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    this.fallbackAttendance = this.fallbackAttendance.filter((a) => a.att_id !== att_id);
    return { success: true };
  }

  // --- Complex SQL Queries matching Resume ---

  /**
   * COMPLEX SQL QUERY (Resume bullet 3):
   * Joining tables for a summary report:
   * SELECT e.name, d.dept_name, e.base_salary, SUM(a.overtime_hours) as total_ot
   * FROM employees e
   * JOIN departments d ON e.dept_id = d.dept_id
   * LEFT JOIN attendance a ON e.emp_id = a.emp_id
   * GROUP BY e.emp_id
   */
  async getPayrollSummaryReport(): Promise<PayrollSummaryReport[]> {
    await this.init();

    if (this.db) {
      const query = `
        SELECT e.emp_id, e.name, e.email, d.dept_name, e.base_salary, 
               COALESCE(SUM(a.overtime_hours), 0) as total_ot,
               COUNT(a.att_id) as attendance_count
        FROM employees e
        JOIN departments d ON e.dept_id = d.dept_id
        LEFT JOIN attendance a ON e.emp_id = a.emp_id
        GROUP BY e.emp_id
        ORDER BY e.emp_id ASC;
      `;
      const res = this.db.exec(query);
      if (res.length > 0) {
        return res[0].values.map(
          ([emp_id, name, email, dept_name, base_salary, total_ot, att_count]) => {
            const salary = Number(base_salary);
            const ot = Number(total_ot);
            const calc = PayrollProcessor.calculate_pay(salary, ot);
            return {
              emp_id: Number(emp_id),
              name: String(name),
              email: String(email),
              dept_name: String(dept_name),
              base_salary: salary,
              total_ot: ot,
              overtime_pay: calc.overtime_pay,
              tax_deductions: calc.tax_deductions,
              net_salary: calc.net_salary,
              attendance_count: Number(att_count),
            };
          }
        );
      }
    }

    // Fallback computation
    return this.fallbackEmployees.map((emp) => {
      const dept = this.fallbackDepartments.find((d) => d.dept_id === emp.dept_id);
      const employeeAttendance = this.fallbackAttendance.filter((a) => a.emp_id === emp.emp_id);
      const total_ot = employeeAttendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
      const calc = PayrollProcessor.calculate_pay(emp.base_salary, total_ot);

      return {
        emp_id: emp.emp_id,
        name: emp.name,
        email: emp.email,
        dept_name: dept ? dept.dept_name : 'Unknown',
        base_salary: emp.base_salary,
        total_ot,
        overtime_pay: calc.overtime_pay,
        tax_deductions: calc.tax_deductions,
        net_salary: calc.net_salary,
        attendance_count: employeeAttendance.length,
      };
    });
  }

  /**
   * COMPLEX SQL QUERY: Department-wise salary analytics
   * GROUP BY dept_name and AVG(base_salary)
   */
  async getDepartmentAnalytics(): Promise<DepartmentAnalytics[]> {
    await this.init();

    if (this.db) {
      const query = `
        SELECT d.dept_name,
               COUNT(e.emp_id) as employee_count,
               COALESCE(ROUND(AVG(e.base_salary), 2), 0) as avg_salary,
               COALESCE(SUM(e.base_salary), 0) as total_salary,
               COALESCE(SUM(a.overtime_hours), 0) as total_overtime_hours
        FROM departments d
        LEFT JOIN employees e ON d.dept_id = e.dept_id
        LEFT JOIN attendance a ON e.emp_id = a.emp_id
        GROUP BY d.dept_id
        ORDER BY total_salary DESC;
      `;
      const res = this.db.exec(query);
      if (res.length > 0) {
        return res[0].values.map(([dept_name, emp_count, avg_sal, tot_sal, tot_ot]) => ({
          dept_name: String(dept_name),
          employee_count: Number(emp_count),
          avg_salary: Number(avg_sal),
          total_salary: Number(tot_sal),
          total_overtime_hours: Number(tot_ot),
        }));
      }
    }

    return this.fallbackDepartments.map((dept) => {
      const deptEmployees = this.fallbackEmployees.filter((e) => e.dept_id === dept.dept_id);
      const employee_count = deptEmployees.length;
      const total_salary = deptEmployees.reduce((sum, e) => sum + e.base_salary, 0);
      const avg_salary = employee_count > 0 ? Math.round((total_salary / employee_count) * 100) / 100 : 0;
      const deptEmpIds = deptEmployees.map((e) => e.emp_id);
      const total_overtime_hours = this.fallbackAttendance
        .filter((a) => deptEmpIds.includes(a.emp_id))
        .reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

      return {
        dept_name: dept.dept_name,
        employee_count,
        avg_salary,
        total_salary,
        total_overtime_hours,
      };
    });
  }

  // --- Payroll System & Payslips ---

  async getPayrollRecords(monthYear?: string): Promise<PayrollRecord[]> {
    await this.init();

    if (this.db) {
      let query = `
        SELECT p.payroll_id, p.emp_id, e.name, d.dept_name, p.month_year,
               e.base_salary, p.tax_deductions, p.net_salary,
               COALESCE(SUM(a.overtime_hours), 0) as overtime_hours
        FROM payroll p
        JOIN employees e ON p.emp_id = e.emp_id
        JOIN departments d ON e.dept_id = d.dept_id
        LEFT JOIN attendance a ON e.emp_id = a.emp_id
      `;
      if (monthYear) {
        query += ` WHERE p.month_year = '${monthYear.replace(/'/g, "''")}'`;
      }
      query += ` GROUP BY p.payroll_id ORDER BY p.payroll_id DESC;`;

      const res = this.db.exec(query);
      if (res.length > 0) {
        return res[0].values.map(
          ([pid, eid, name, dept, mYear, base_sal, tax, net, otHours]) => {
            const base = Number(base_sal);
            const ot = Number(otHours);
            const calc = PayrollProcessor.calculate_pay(base, ot);
            return {
              payroll_id: Number(pid),
              emp_id: Number(eid),
              emp_name: String(name),
              dept_name: String(dept),
              month_year: String(mYear),
              base_salary: base,
              overtime_hours: ot,
              overtime_pay: calc.overtime_pay,
              gross_salary: calc.gross_pay,
              tax_deductions: Number(tax),
              net_salary: Number(net),
            };
          }
        );
      }
    }

    const filtered = monthYear
      ? this.fallbackPayroll.filter((p) => p.month_year === monthYear)
      : this.fallbackPayroll;

    return filtered.map((p) => {
      const emp = this.fallbackEmployees.find((e) => e.emp_id === p.emp_id);
      const dept = emp ? this.fallbackDepartments.find((d) => d.dept_id === emp.dept_id) : null;
      const otHours = this.fallbackAttendance
        .filter((a) => a.emp_id === p.emp_id)
        .reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
      const calc = PayrollProcessor.calculate_pay(emp?.base_salary || 0, otHours);

      return {
        ...p,
        emp_name: emp ? emp.name : 'Unknown',
        dept_name: dept ? dept.dept_name : 'Unknown',
        base_salary: emp ? emp.base_salary : 0,
        overtime_hours: otHours,
        overtime_pay: calc.overtime_pay,
        gross_salary: calc.gross_pay,
      };
    });
  }

  /**
   * Automated salary calculations using PayrollProcessor OOP business logic
   */
  async generatePayrollForMonth(month_year: string): Promise<{ processed: number; error?: string }> {
    await this.init();
    const employees = await this.getEmployees();
    let processed = 0;

    for (const emp of employees) {
      // Calculate total overtime hours from attendance
      let otHours = 0;
      if (this.db) {
        const otRes = this.db.exec(
          'SELECT COALESCE(SUM(overtime_hours), 0) FROM attendance WHERE emp_id = ?;',
          [emp.emp_id]
        );
        if (otRes.length > 0 && otRes[0].values.length > 0) {
          otHours = Number(otRes[0].values[0][0]);
        }
      } else {
        otHours = this.fallbackAttendance
          .filter((a) => a.emp_id === emp.emp_id)
          .reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
      }

      // Encapsulated OOP calculation
      const pay = PayrollProcessor.calculate_pay(emp.base_salary, otHours);

      if (this.db) {
        // Upsert payroll record
        this.db.run(
          `INSERT INTO payroll (emp_id, month_year, tax_deductions, net_salary)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(emp_id, month_year) 
           DO UPDATE SET tax_deductions = excluded.tax_deductions, net_salary = excluded.net_salary;`,
          [emp.emp_id, month_year, pay.tax_deductions, pay.net_salary]
        );
        processed++;
      } else {
        const existingIdx = this.fallbackPayroll.findIndex(
          (p) => p.emp_id === emp.emp_id && p.month_year === month_year
        );
        if (existingIdx >= 0) {
          this.fallbackPayroll[existingIdx].tax_deductions = pay.tax_deductions;
          this.fallbackPayroll[existingIdx].net_salary = pay.net_salary;
        } else {
          const newId = (this.fallbackPayroll[this.fallbackPayroll.length - 1]?.payroll_id || 0) + 1;
          this.fallbackPayroll.push({
            payroll_id: newId,
            emp_id: emp.emp_id,
            month_year,
            tax_deductions: pay.tax_deductions,
            net_salary: pay.net_salary,
          });
        }
        processed++;
      }
    }

    return { processed };
  }

  async getPayslipDetails(emp_id: number, month_year: string): Promise<PayslipDetails | null> {
    await this.init();
    const employees = await this.getEmployees();
    const emp = employees.find((e) => e.emp_id === emp_id);
    if (!emp) return null;

    let otHours = 0;
    if (this.db) {
      const otRes = this.db.exec(
        'SELECT COALESCE(SUM(overtime_hours), 0) FROM attendance WHERE emp_id = ?;',
        [emp_id]
      );
      if (otRes.length > 0 && otRes[0].values.length > 0) {
        otHours = Number(otRes[0].values[0][0]);
      }
    } else {
      otHours = this.fallbackAttendance
        .filter((a) => a.emp_id === emp_id)
        .reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
    }

    const pay = PayrollProcessor.calculate_pay(emp.base_salary, otHours);

    return {
      payroll_id: Math.floor(Math.random() * 90000) + 10000,
      emp_id: emp.emp_id,
      name: emp.name,
      email: emp.email,
      dept_name: emp.dept_name || 'General',
      month_year,
      base_salary: emp.base_salary,
      overtime_hours: otHours,
      overtime_rate: PayrollProcessor.OVERTIME_RATE_PER_HOUR,
      overtime_pay: pay.overtime_pay,
      gross_pay: pay.gross_pay,
      tax_deductions: pay.tax_deductions,
      net_salary: pay.net_salary,
      issue_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
  }

  // --- Interactive Live SQL Query Studio ---

  async runRawQuery(sqlQuery: string): Promise<SqlQueryResult> {
    await this.init();
    const startTime = performance.now();
    const trimmed = sqlQuery.trim();

    if (!trimmed) {
      return {
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs: 0,
        query: sqlQuery,
        error: 'Query string is empty.',
      };
    }

    if (this.db) {
      try {
        const results = this.db.exec(trimmed);
        const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

        if (results.length === 0) {
          // INSERT, UPDATE, DELETE or non-returning statement
          return {
            columns: ['Status'],
            values: [['Statement executed successfully.']],
            rowCount: 0,
            executionTimeMs,
            query: sqlQuery,
          };
        }

        const firstResult = results[0];
        return {
          columns: firstResult.columns,
          values: firstResult.values as (string | number | null)[][],
          rowCount: firstResult.values.length,
          executionTimeMs,
          query: sqlQuery,
        };
      } catch (err: any) {
        return {
          columns: [],
          values: [],
          rowCount: 0,
          executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
          query: sqlQuery,
          error: err.message || 'SQL Execution Error',
        };
      }
    }

    // Fallback simulation for common SELECT queries
    const lower = trimmed.toLowerCase();
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    if (lower.includes('from departments')) {
      const depts = await this.getDepartments();
      return {
        columns: ['dept_id', 'dept_name'],
        values: depts.map((d) => [d.dept_id, d.dept_name]),
        rowCount: depts.length,
        executionTimeMs,
        query: sqlQuery,
      };
    }

    if (lower.includes('from employees') && !lower.includes('join')) {
      const emps = await this.getEmployees();
      return {
        columns: ['emp_id', 'name', 'email', 'dept_id', 'base_salary'],
        values: emps.map((e) => [e.emp_id, e.name, e.email, e.dept_id, e.base_salary]),
        rowCount: emps.length,
        executionTimeMs,
        query: sqlQuery,
      };
    }

    // Default to summary report query output
    const report = await this.getPayrollSummaryReport();
    return {
      columns: ['name', 'dept_name', 'base_salary', 'total_ot'],
      values: report.map((r) => [r.name, r.dept_name, r.base_salary, r.total_ot]),
      rowCount: report.length,
      executionTimeMs,
      query: sqlQuery,
    };
  }

  async resetDatabase(): Promise<void> {
    if (this.db) {
      try {
        this.db.run('DROP TABLE IF EXISTS payroll;');
        this.db.run('DROP TABLE IF EXISTS attendance;');
        this.db.run('DROP TABLE IF EXISTS employees;');
        this.db.run('DROP TABLE IF EXISTS departments;');
        this.db.run(SCHEMA_SQL);
        this.seedInitialData();
        return;
      } catch (e) {
        console.error('Reset error:', e);
      }
    }

    this.fallbackDepartments = [...INITIAL_DEPARTMENTS];
    this.fallbackEmployees = [...INITIAL_EMPLOYEES];
    this.fallbackAttendance = [...INITIAL_ATTENDANCE];
    this.seedFallbackPayroll();
  }
}

export const dbService = new DatabaseService();
