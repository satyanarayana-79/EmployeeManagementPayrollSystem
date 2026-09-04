import React from 'react';
import { Building2, Users, DollarSign, TrendingUp, BarChart2, PieChart } from 'lucide-react';
import { DepartmentAnalytics as DeptAnalyticsType } from '../types';

interface DepartmentAnalyticsProps {
  analytics: DeptAnalyticsType[];
}

export const DepartmentAnalytics: React.FC<DepartmentAnalyticsProps> = ({ analytics }) => {
  const companyTotalSalary = analytics.reduce((acc, curr) => acc + curr.total_salary, 0);
  const totalEmployees = analytics.reduce((acc, curr) => acc + curr.employee_count, 0);
  const overallAvg = totalEmployees > 0 ? companyTotalSalary / totalEmployees : 0;

  return (
    <div className="space-y-6">
      {/* Header Overview Bento Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Department-Wise Salary &amp; Headcount Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            SELECT d.dept_name, COUNT(e.emp_id), AVG(e.base_salary), SUM(e.base_salary), SUM(a.overtime_hours) FROM departments d LEFT JOIN employees e ON d.dept_id = e.dept_id GROUP BY d.dept_id
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Departments</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{analytics.length}</span>
          </div>
          <div className="w-px h-6 bg-slate-300"></div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Company-Wide Avg</span>
            <span className="font-bold text-blue-600 font-mono text-sm">
              ${overallAvg.toFixed(0)}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Department Cards - Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {analytics.map((dept, index) => {
          const budgetPercentage =
            companyTotalSalary > 0
              ? Math.round((dept.total_salary / companyTotalSalary) * 100)
              : 0;

          return (
            <div
              key={dept.dept_name}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                      #{index + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{dept.dept_name}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {dept.employee_count} {dept.employee_count === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Average Salary:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ${dept.avg_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Monthly Expenditure:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ${dept.total_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Overtime Logged:</span>
                    <span className="font-mono font-medium text-amber-700">
                      {dept.total_overtime_hours} hrs (${(dept.total_overtime_hours * 20).toFixed(0)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                  <span>Share of Total Payroll</span>
                  <span className="font-bold text-blue-600 font-mono">{budgetPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, budgetPercentage))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregate Department Table View - Bento Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              SQL Aggregate Functions Breakdown (GROUP BY dept_name)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Department Name</th>
                <th className="py-3.5 px-5">COUNT(emp_id)</th>
                <th className="py-3.5 px-5">AVG(base_salary)</th>
                <th className="py-3.5 px-5">SUM(base_salary)</th>
                <th className="py-3.5 px-5">SUM(overtime_hours)</th>
                <th className="py-3.5 px-5">% of Total Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.map((row) => {
                const percent = companyTotalSalary > 0
                  ? ((row.total_salary / companyTotalSalary) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={row.dept_name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.dept_name}</td>
                    <td className="py-3.5 px-5 font-mono">{row.employee_count}</td>
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-800">
                      ${row.avg_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      ${row.total_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-amber-700 font-medium">
                      {row.total_overtime_hours} hrs
                    </td>
                    <td className="py-3.5 px-5 font-mono text-blue-600 font-semibold">
                      {percent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="py-3.5 px-5">All Departments Combined</td>
                <td className="py-3.5 px-5 font-mono">{totalEmployees}</td>
                <td className="py-3.5 px-5 font-mono">${overallAvg.toFixed(2)}</td>
                <td className="py-3.5 px-5 font-mono">${companyTotalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="py-3.5 px-5 font-mono">
                  {analytics.reduce((s, a) => s + a.total_overtime_hours, 0)} hrs
                </td>
                <td className="py-3.5 px-5 font-mono">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
