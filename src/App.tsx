/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { EmployeeManager } from './components/EmployeeManager';
import { AttendanceManager } from './components/AttendanceManager';
import { PayrollManager } from './components/PayrollManager';
import { DepartmentAnalytics } from './components/DepartmentAnalytics';
import { SqlStudio } from './components/SqlStudio';
import { CodeInspector } from './components/CodeInspector';
import { PayslipModal } from './components/PayslipModal';
import { dbService } from './services/database';
import {
  Department,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  PayrollSummaryReport,
  DepartmentAnalytics as DeptAnalyticsType,
  PayslipDetails,
  SqlQueryResult,
} from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Core Relational Data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [reports, setReports] = useState<PayrollSummaryReport[]>([]);
  const [departmentAnalytics, setDepartmentAnalytics] = useState<DeptAnalyticsType[]>([]);

  // Payslip Modal
  const [activePayslip, setActivePayslip] = useState<PayslipDetails | null>(null);

  // Fetch all live relational data from the database
  const refreshAllData = useCallback(async () => {
    try {
      await dbService.init();
      const [depts, emps, atts, pays, sumReports, deptAnal] = await Promise.all([
        dbService.getDepartments(),
        dbService.getEmployees(),
        dbService.getAttendanceRecords(),
        dbService.getPayrollRecords(),
        dbService.getPayrollSummaryReport(),
        dbService.getDepartmentAnalytics(),
      ]);

      setDepartments(depts);
      setEmployees(emps);
      setAttendanceRecords(atts);
      setPayrollRecords(pays);
      setReports(sumReports);
      setDepartmentAnalytics(deptAnal);
    } catch (err) {
      console.error('Error refreshing data from relational database:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Employee CRUD handlers
  const handleAddEmployee = async (
    name: string,
    email: string,
    dept_id: number,
    salary: number
  ) => {
    const res = await dbService.addEmployee(name, email, dept_id, salary);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleUpdateEmployee = async (
    emp_id: number,
    name: string,
    email: string,
    dept_id: number,
    salary: number
  ) => {
    const res = await dbService.updateEmployee(emp_id, name, email, dept_id, salary);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleDeleteEmployee = async (emp_id: number) => {
    const res = await dbService.deleteEmployee(emp_id);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  // Attendance handlers
  const handleLogAttendance = async (
    emp_id: number,
    work_date: string,
    status: 'Present' | 'Absent',
    overtime_hours: number
  ) => {
    const res = await dbService.logAttendance(emp_id, work_date, status, overtime_hours);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  const handleDeleteAttendance = async (att_id: number) => {
    const res = await dbService.deleteAttendance(att_id);
    if (res.success) {
      await refreshAllData();
    }
    return res;
  };

  // Payroll handlers
  const handleGeneratePayroll = async (month_year: string) => {
    const res = await dbService.generatePayrollForMonth(month_year);
    if (!res.error) {
      await refreshAllData();
    }
    return res;
  };

  const handleGenerateSlip = async (emp_id: number, month_year = 'September 2026') => {
    const slip = await dbService.getPayslipDetails(emp_id, month_year);
    if (slip) {
      setActivePayslip(slip);
    }
  };

  // SQL Runner handler
  const handleRunSqlQuery = async (query: string): Promise<SqlQueryResult> => {
    const res = await dbService.runRawQuery(query);
    // If it was a mutation, refresh state
    const lower = query.toLowerCase();
    if (lower.includes('insert') || lower.includes('update') || lower.includes('delete') || lower.includes('drop')) {
      await refreshAllData();
    }
    return res;
  };

  // Reset database handler
  const handleResetDatabase = async () => {
    if (window.confirm('Reset database to default seed state? All custom edits will be restored to initial sample data.')) {
      setLoading(true);
      await dbService.resetDatabase();
      await refreshAllData();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onResetDatabase={handleResetDatabase}
        employeeCount={employees.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Connecting to relational database schema &amp; seeding records...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'dashboard' && (
              <Dashboard
                departments={departments}
                reports={reports}
                totalEmployees={employees.length}
                onAddEmployee={handleAddEmployee}
                onGenerateSlip={(emp_id) => handleGenerateSlip(emp_id)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeManager
                employees={employees}
                departments={departments}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceManager
                attendanceRecords={attendanceRecords}
                employees={employees}
                onLogAttendance={handleLogAttendance}
                onDeleteAttendance={handleDeleteAttendance}
              />
            )}

            {activeTab === 'payroll' && (
              <PayrollManager
                payrollRecords={payrollRecords}
                onGeneratePayroll={handleGeneratePayroll}
                onViewPayslip={(emp_id, month_year) => handleGenerateSlip(emp_id, month_year)}
              />
            )}

            {activeTab === 'analytics' && (
              <DepartmentAnalytics analytics={departmentAnalytics} />
            )}

            {activeTab === 'sql_studio' && (
              <SqlStudio onRunQuery={handleRunSqlQuery} />
            )}

            {activeTab === 'code_architecture' && (
              <CodeInspector />
            )}
          </div>
        )}
      </main>

      {/* Official Payslip Modal */}
      <PayslipModal
        payslip={activePayslip}
        onClose={() => setActivePayslip(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Employee Management &amp; Payroll System &bull; Normalized MySQL Schema &bull; Python OOP Architecture
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Database: <code>payroll_db</code> (4 Normalized Tables)
          </span>
        </div>
      </footer>
    </div>
  );
}
