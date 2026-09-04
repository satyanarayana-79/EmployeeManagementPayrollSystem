export interface Department {
  dept_id: number;
  dept_name: string;
}

export interface Employee {
  emp_id: number;
  name: string;
  email: string;
  dept_id: number;
  dept_name?: string;
  base_salary: number;
}

export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceRecord {
  att_id: number;
  emp_id: number;
  work_date: string;
  status: AttendanceStatus;
  overtime_hours: number;
  emp_name?: string;
}

export interface PayrollRecord {
  payroll_id: number;
  emp_id: number;
  month_year: string;
  tax_deductions: number;
  net_salary: number;
  emp_name?: string;
  dept_name?: string;
  base_salary?: number;
  overtime_hours?: number;
  overtime_pay?: number;
  gross_salary?: number;
}

export interface PayrollSummaryReport {
  emp_id: number;
  name: string;
  email: string;
  dept_name: string;
  base_salary: number;
  total_ot: number;
  overtime_pay: number;
  tax_deductions: number;
  net_salary: number;
  attendance_count: number;
}

export interface DepartmentAnalytics {
  dept_name: string;
  employee_count: number;
  avg_salary: number;
  total_salary: number;
  total_overtime_hours: number;
}

export interface PayslipDetails {
  payroll_id: number;
  emp_id: number;
  name: string;
  email: string;
  dept_name: string;
  month_year: string;
  base_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_pay: number;
  gross_pay: number;
  tax_deductions: number;
  net_salary: number;
  issue_date: string;
}

export interface SqlQueryResult {
  columns: string[];
  values: (string | number | null)[][];
  rowCount: number;
  executionTimeMs: number;
  query: string;
  error?: string;
}
