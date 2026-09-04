import React, { useState } from 'react';
import {
  Users,
  Building2,
  Clock,
  DollarSign,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Department, PayrollSummaryReport } from '../types';

interface DashboardProps {
  departments: Department[];
  reports: PayrollSummaryReport[];
  totalEmployees: number;
  onAddEmployee: (name: string, email: string, dept_id: number, salary: number) => Promise<{ success: boolean; error?: string }>;
  onGenerateSlip: (emp_id: number) => void;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  departments,
  reports,
  totalEmployees,
  onAddEmployee,
  onGenerateSlip,
  onNavigateTab,
}) => {
  // Quick Add Form state (matching Phase 4 in prompt)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deptId, setDeptId] = useState<number>(departments[0]?.dept_id || 1);
  const [salary, setSalary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Totals calculations
  const totalPayrollExpense = reports.reduce((acc, r) => acc + r.net_salary, 0);
  const totalBaseSalary = reports.reduce((acc, r) => acc + r.base_salary, 0);
  const avgBaseSalary = totalEmployees > 0 ? totalBaseSalary / totalEmployees : 0;
  const totalOvertimeHours = reports.reduce((acc, r) => acc + r.total_ot, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);
    setIsSubmitting(true);

    const parsedSalary = parseFloat(salary);
    const result = await onAddEmployee(name, email, Number(deptId), parsedSalary);

    setIsSubmitting(false);
    if (result.success) {
      setFormFeedback({
        type: 'success',
        message: `Employee '${name}' added successfully to the relational database!`,
      });
      setName('');
      setEmail('');
      setSalary('');
    } else {
      setFormFeedback({
        type: 'error',
        message: result.error || 'Failed to add employee.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid: Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Workforce */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Workforce
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-3xl font-bold text-slate-800 font-mono">{totalEmployees}</h2>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Across {departments.length} depts
            </span>
          </div>
        </div>

        {/* Card 2: Monthly Net Payroll */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Monthly Net Payroll
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-3xl font-bold text-slate-800 font-mono">
              ${(totalPayrollExpense / 1000).toFixed(1)}k
            </h2>
            <span className="text-xs font-medium text-slate-400 font-mono">
              Avg ${(avgBaseSalary / 1000).toFixed(1)}k/ea
            </span>
          </div>
        </div>

        {/* Card 3: Total Overtime */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Overtime
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-3xl font-bold text-slate-800 font-mono">{totalOvertimeHours}h</h2>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              $20/hr OT Rate
            </span>
          </div>
        </div>

        {/* Card 4: Accent Blue Bento Tile */}
        <div className="bg-blue-600 p-4 rounded-2xl border border-blue-700 shadow-lg shadow-blue-500/20 text-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Next Run Date
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/50 flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-3xl font-bold tracking-tight">Sep 30</h2>
            <span className="text-xs font-medium text-blue-200">5 days remaining</span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Middle Section (Table + CRUD Entry Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Bento: Employee Directory / SQL Summary Report */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  Employee Directory
                  <span className="text-slate-400 font-normal text-xs ml-1 hidden sm:inline">
                    (Query Result: JOIN employees, depts, attendance)
                  </span>
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('sql_studio')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
              >
                Inspect in SQL Studio →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Base Salary</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Salary</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {reports.map((row) => (
                    <tr key={row.emp_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{row.name}</div>
                        <div className="text-[11px] text-slate-400">{row.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-slate-100 text-slate-700 font-medium text-[11px] px-2.5 py-1 rounded-full">
                          {row.dept_name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-mono font-medium">
                        ${row.base_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {row.total_ot > 0 ? (
                          <span className="bg-amber-50 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {row.total_ot}h (+${row.overtime_pay.toFixed(0)})
                          </span>
                        ) : (
                          <span className="text-slate-400">0.0h</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        ${row.net_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          id={`generate-slip-${row.emp_id}`}
                          onClick={() => onGenerateSlip(row.emp_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-xl text-[11px] transition-colors shadow-xs shadow-blue-500/20"
                        >
                          Generate Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No employee records found in payroll_db.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Summary Footer */}
          {reports.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono">
              <span>{reports.length} Total Records</span>
              <div className="flex items-center gap-4">
                <span>Total Base: <strong>${totalBaseSalary.toLocaleString()}</strong></span>
                <span>Total Disbursed: <strong className="text-blue-600">${totalPayrollExpense.toLocaleString()}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Right Bento: Add Employee CRUD Entry */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                Add Employee
                <span className="text-blue-600 text-xs font-normal ml-1">CRUD Entry</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Direct parameterized INSERT into <code>employees</code> with foreign key relation.
            </p>

            {formFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl flex items-start gap-2 text-xs font-medium border ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div>{formFeedback.message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="quick-add-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="quick-add-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.jenkins@company.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  id="quick-add-dept"
                  value={deptId}
                  onChange={(e) => setDeptId(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.dept_id} value={d.dept_id}>
                      {d.dept_name} (ID: {d.dept_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Base Salary ($) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  id="quick-add-salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="8500"
                  min="500"
                  step="50"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                id="quick-add-submit-btn"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-xs disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Committing...' : 'Execute SQL Commit'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bento Grid: Bottom Dark Analytics Bento Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden flex flex-col justify-between relative border border-slate-800 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-1">Departmental Salary Analytics</h3>
            <p className="text-slate-400 text-xs">
              Aggregated financial metrics calculated dynamically with SQL <code>GROUP BY dept_name</code>
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Departments</p>
              <p className="text-xl font-bold text-white font-mono">{departments.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Payroll</p>
              <p className="text-xl font-bold text-blue-400 font-mono">
                ${totalPayrollExpense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Bento Department Bars */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {departments.map((dept, idx) => {
              const deptEmps = reports.filter((r) => r.dept_name === dept.dept_name);
              const deptTotal = deptEmps.reduce((s, r) => s + r.net_salary, 0);
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
              const color = colors[idx % colors.length];

              return (
                <div key={dept.dept_id} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${color} mb-2`}></div>
                  <span className="text-[11px] font-bold text-slate-200 truncate w-full">{dept.dept_name}</span>
                  <span className="text-xs font-mono font-bold text-white mt-1">
                    ${deptTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{deptEmps.length} members</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
