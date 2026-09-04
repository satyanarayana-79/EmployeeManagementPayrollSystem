/**
 * OOP Domain Models representing the Python architecture:
 * models.py
 *
 * Encapsulates business logic, data validation, and automated payroll calculations.
 */

export class DepartmentModel {
  dept_id: number;
  dept_name: string;

  constructor(dept_id: number, dept_name: string) {
    this.dept_id = dept_id;
    this.dept_name = dept_name;
  }

  validate(): { valid: boolean; error?: string } {
    if (!this.dept_name || this.dept_name.trim().length === 0) {
      return { valid: false, error: "Department name cannot be empty." };
    }
    return { valid: true };
  }
}

export class EmployeeModel {
  emp_id: number;
  name: string;
  email: string;
  dept_id: number;
  base_salary: number;

  constructor(
    emp_id: number,
    name: string,
    email: string,
    dept_id: number,
    base_salary: number
  ) {
    this.emp_id = emp_id;
    this.name = name.trim();
    this.email = email.trim().toLowerCase();
    this.dept_id = Number(dept_id);
    this.base_salary = Math.round(Number(base_salary) * 100) / 100;
  }

  /**
   * Input validation with exception handling principles
   */
  validate(): { valid: boolean; error?: string } {
    if (!this.name || this.name.length < 2) {
      return { valid: false, error: "Employee name must be at least 2 characters long." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      return { valid: false, error: "Please enter a valid email address." };
    }
    if (isNaN(this.base_salary) || this.base_salary <= 0) {
      return { valid: false, error: "Base salary must be a positive number." };
    }
    if (!this.dept_id || this.dept_id <= 0) {
      return { valid: false, error: "Please select a valid department." };
    }
    return { valid: true };
  }

  toJSON() {
    return {
      emp_id: this.emp_id,
      name: this.name,
      email: this.email,
      dept_id: this.dept_id,
      base_salary: this.base_salary,
    };
  }
}

export class AttendanceModel {
  att_id: number;
  emp_id: number;
  work_date: string;
  status: 'Present' | 'Absent';
  overtime_hours: number;

  constructor(
    att_id: number,
    emp_id: number,
    work_date: string,
    status: 'Present' | 'Absent',
    overtime_hours: number = 0
  ) {
    this.att_id = att_id;
    this.emp_id = Number(emp_id);
    this.work_date = work_date;
    this.status = status;
    // If absent, overtime hours cannot exceed 0
    this.overtime_hours = status === 'Absent' ? 0 : Math.max(0, Number(overtime_hours));
  }

  validate(): { valid: boolean; error?: string } {
    if (!this.emp_id || this.emp_id <= 0) {
      return { valid: false, error: "Valid Employee ID is required." };
    }
    if (!this.work_date) {
      return { valid: false, error: "Work date is required." };
    }
    if (this.status !== 'Present' && this.status !== 'Absent') {
      return { valid: false, error: "Status must be 'Present' or 'Absent'." };
    }
    if (this.overtime_hours < 0 || this.overtime_hours > 24) {
      return { valid: false, error: "Overtime hours must be between 0 and 24." };
    }
    return { valid: true };
  }
}

export class PayrollModel {
  payroll_id: number;
  emp_id: number;
  month_year: string;
  tax_deductions: number;
  net_salary: number;

  constructor(
    payroll_id: number,
    emp_id: number,
    month_year: string,
    tax_deductions: number,
    net_salary: number
  ) {
    this.payroll_id = payroll_id;
    this.emp_id = Number(emp_id);
    this.month_year = month_year;
    this.tax_deductions = Math.round(Number(tax_deductions) * 100) / 100;
    this.net_salary = Math.round(Number(net_salary) * 100) / 100;
  }
}

/**
 * Encapsulated Business Logic as defined in models.py:
 * PayrollProcessor
 * Automated salary calculation including tax deductions and overtime pay.
 */
export class PayrollProcessor {
  public static readonly OVERTIME_RATE_PER_HOUR = 20.0; // $20/hr
  public static readonly TAX_RATE = 0.10; // 10% tax

  /**
   * Automated salary calculations including tax deductions and overtime pay,
   * reducing manual computation errors.
   */
  public static calculate_pay(
    base_salary: number,
    overtime_hours: number
  ): {
    overtime_pay: number;
    gross_pay: number;
    tax_deductions: number;
    net_salary: number;
  } {
    const safeSalary = Math.max(0, Number(base_salary) || 0);
    const safeOtHours = Math.max(0, Number(overtime_hours) || 0);

    const overtime_pay = safeOtHours * PayrollProcessor.OVERTIME_RATE_PER_HOUR;
    const gross_pay = safeSalary + overtime_pay;
    const tax_deductions = gross_pay * PayrollProcessor.TAX_RATE;
    const net_salary = gross_pay - tax_deductions;

    return {
      overtime_pay: Math.round(overtime_pay * 100) / 100,
      gross_pay: Math.round(gross_pay * 100) / 100,
      tax_deductions: Math.round(tax_deductions * 100) / 100,
      net_salary: Math.round(net_salary * 100) / 100,
    };
  }
}
