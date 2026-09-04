import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Database,
  Clock,
  Layers,
  Key,
  Link,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { SqlQueryResult } from '../types';

interface SqlStudioProps {
  onRunQuery: (query: string) => Promise<SqlQueryResult>;
}

const PRESET_QUERIES = [
  {
    name: '1. Resume Summary Query (JOIN + GROUP BY + SUM)',
    description: 'Complex SQL joining employees, departments, and attendance to aggregate overtime hours.',
    sql: `SELECT e.name, d.dept_name, e.base_salary, 
       COALESCE(SUM(a.overtime_hours), 0) as total_ot
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
LEFT JOIN attendance a ON e.emp_id = a.emp_id
GROUP BY e.emp_id
ORDER BY e.emp_id ASC;`,
  },
  {
    name: '2. Department-Wise Salary Analytics (AVG + SUM + COUNT)',
    description: 'Department aggregation with headcount, average base pay, and total salary expenditure.',
    sql: `SELECT d.dept_name,
       COUNT(e.emp_id) as employee_count,
       ROUND(AVG(e.base_salary), 2) as avg_salary,
       SUM(e.base_salary) as total_salary,
       COALESCE(SUM(a.overtime_hours), 0) as total_overtime_hours
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
LEFT JOIN attendance a ON e.emp_id = a.emp_id
GROUP BY d.dept_id
ORDER BY total_salary DESC;`,
  },
  {
    name: '3. Overtime Pay Calculation Breakdown ($20/hr)',
    description: 'Calculates overtime hours and automated bonus payment per employee.',
    sql: `SELECT e.name,
       d.dept_name,
       COALESCE(SUM(a.overtime_hours), 0) as ot_hours,
       COALESCE(SUM(a.overtime_hours), 0) * 20.0 as overtime_bonus
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
LEFT JOIN attendance a ON e.emp_id = a.emp_id
GROUP BY e.emp_id
ORDER BY ot_hours DESC;`,
  },
  {
    name: '4. Relational Integrity & Foreign Keys (JOIN)',
    description: 'Verifies employee foreign key linking to departments table.',
    sql: `SELECT e.emp_id, e.name, e.email, e.dept_id, d.dept_name, e.base_salary
FROM employees e
INNER JOIN departments d ON e.dept_id = d.dept_id;`,
  },
  {
    name: '5. Payroll Monthly Aggregates',
    description: 'Summarizes tax collections and total net pay disbursed by pay period.',
    sql: `SELECT month_year,
       COUNT(payroll_id) as total_disbursed,
       SUM(tax_deductions) as total_tax_withheld,
       SUM(net_salary) as total_net_disbursed
FROM payroll
GROUP BY month_year;`,
  },
];

export const SqlStudio: React.FC<SqlStudioProps> = ({ onRunQuery }) => {
  const [queryInput, setQueryInput] = useState<string>(PRESET_QUERIES[0].sql);
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleExecute = async (queryToRun = queryInput) => {
    setIsRunning(true);
    const res = await onRunQuery(queryToRun);
    setResult(res);
    setIsRunning(false);
  };

  const loadPreset = (sql: string) => {
    setQueryInput(sql);
    handleExecute(sql);
  };

  return (
    <div className="space-y-6">
      {/* Schema Structure Bento Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Normalized MySQL Database Schema Structure
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* departments table */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono">
            <div className="font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
              <span className="text-blue-600">departments</span>
              <span className="text-[10px] text-slate-400 font-sans font-semibold">1 : M</span>
            </div>
            <div className="mt-2.5 space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center gap-1 text-blue-700 font-semibold">
                <Key className="w-3 h-3 text-amber-500" /> dept_id (PK, AUTO_INC)
              </div>
              <div className="text-slate-600 pl-4">dept_name VARCHAR(100)</div>
            </div>
          </div>

          {/* employees table */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono">
            <div className="font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
              <span className="text-blue-600">employees</span>
              <span className="text-[10px] text-slate-400 font-sans font-semibold">Main Entity</span>
            </div>
            <div className="mt-2.5 space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center gap-1 text-blue-700 font-semibold">
                <Key className="w-3 h-3 text-amber-500" /> emp_id (PK, AUTO_INC)
              </div>
              <div className="text-slate-600 pl-4">name VARCHAR(100)</div>
              <div className="text-slate-600 pl-4">email VARCHAR(100) UNIQUE</div>
              <div className="flex items-center gap-1 text-slate-800 pl-4">
                <Link className="w-3 h-3 text-blue-500" /> dept_id (FK)
              </div>
              <div className="text-slate-600 pl-4">base_salary DECIMAL(10,2)</div>
            </div>
          </div>

          {/* attendance table */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono">
            <div className="font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
              <span className="text-blue-600">attendance</span>
              <span className="text-[10px] text-slate-400 font-sans font-semibold">Logs</span>
            </div>
            <div className="mt-2.5 space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center gap-1 text-blue-700 font-semibold">
                <Key className="w-3 h-3 text-amber-500" /> att_id (PK, AUTO_INC)
              </div>
              <div className="flex items-center gap-1 text-slate-800 pl-4">
                <Link className="w-3 h-3 text-blue-500" /> emp_id (FK)
              </div>
              <div className="text-slate-600 pl-4">work_date DATE</div>
              <div className="text-slate-600 pl-4">status ENUM</div>
              <div className="text-slate-600 pl-4">overtime_hours INT</div>
            </div>
          </div>

          {/* payroll table */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono">
            <div className="font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
              <span className="text-blue-600">payroll</span>
              <span className="text-[10px] text-slate-400 font-sans font-semibold">Slips</span>
            </div>
            <div className="mt-2.5 space-y-1 text-[11px] text-slate-700">
              <div className="flex items-center gap-1 text-blue-700 font-semibold">
                <Key className="w-3 h-3 text-amber-500" /> payroll_id (PK)
              </div>
              <div className="flex items-center gap-1 text-slate-800 pl-4">
                <Link className="w-3 h-3 text-blue-500" /> emp_id (FK)
              </div>
              <div className="text-slate-600 pl-4">month_year VARCHAR</div>
              <div className="text-slate-600 pl-4">tax_deductions DECIMAL</div>
              <div className="text-slate-600 pl-4">net_salary DECIMAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Editor & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preset Queries Sidebar - Bento Cards */}
        <div className="lg:col-span-4 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Preset Queries (Resume Highlights)
          </h3>
          {PRESET_QUERIES.map((preset, index) => (
            <button
              key={index}
              onClick={() => loadPreset(preset.sql)}
              className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all text-xs group"
            >
              <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {preset.name}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {preset.description}
              </p>
            </button>
          ))}
        </div>

        {/* Editor and Results */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-950 px-5 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>payroll_db SQL Console</span>
              </div>

              <button
                id="run-sql-btn"
                onClick={() => handleExecute()}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRunning ? 'Running...' : 'Execute Query'}
              </button>
            </div>

            <textarea
              id="sql-query-textarea"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows={6}
              className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              placeholder="Enter any SQL query (e.g. SELECT * FROM employees;)"
            />
          </div>

          {/* Results Bento Box */}
          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600">
                    Execution Time: <strong className="text-slate-900 font-mono">{result.executionTimeMs}ms</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">
                    Rows: <strong className="text-slate-900 font-mono">{result.rowCount}</strong>
                  </span>
                </div>

                {result.error ? (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> Syntax Error
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Query Succeeded
                  </span>
                )}
              </div>

              {result.error ? (
                <div className="p-4 bg-rose-50 text-rose-800 text-xs font-mono">
                  {result.error}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase tracking-wider sticky top-0">
                      <tr>
                        {result.columns.map((col, idx) => (
                          <th key={idx} className="py-3 px-5 font-mono">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                      {result.values.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="py-3 px-5">
                              {val === null || val === undefined ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {result.values.length === 0 && (
                        <tr>
                          <td colSpan={result.columns.length} className="py-6 text-center text-slate-400 italic">
                            Empty set (0 rows returned)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
