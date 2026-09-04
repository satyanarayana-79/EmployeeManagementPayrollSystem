import React, { useState } from 'react';
import {
  DollarSign,
  Calendar,
  Sparkles,
  FileText,
  Calculator,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PayrollRecord } from '../types';

interface PayrollManagerProps {
  payrollRecords: PayrollRecord[];
  onGeneratePayroll: (month_year: string) => Promise<{ processed: number; error?: string }>;
  onViewPayslip: (emp_id: number, month_year: string) => void;
}

export const PayrollManager: React.FC<PayrollManagerProps> = ({
  payrollRecords,
  onGeneratePayroll,
  onViewPayslip,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const months = [
    'September 2026',
    'August 2026',
    'July 2026',
    'June 2026',
  ];

  const handleRunPayroll = async () => {
    setIsProcessing(true);
    setFeedback(null);
    const res = await onGeneratePayroll(selectedMonth);
    setIsProcessing(false);

    if (res.processed !== undefined && !res.error) {
      setFeedback({
        type: 'success',
        message: `Successfully computed and recorded automated payroll for ${res.processed} employees for ${selectedMonth}!`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to process payroll.',
      });
    }
  };

  const currentRecords = payrollRecords.filter((p) => p.month_year === selectedMonth);
  const totalGross = currentRecords.reduce((sum, p) => sum + (p.gross_salary || 0), 0);
  const totalTaxes = currentRecords.reduce((sum, p) => sum + (p.tax_deductions || 0), 0);
  const totalNet = currentRecords.reduce((sum, p) => sum + (p.net_salary || 0), 0);

  return (
    <div className="space-y-6">
      {/* Automated Payroll Generator Header Bento Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/30">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Automated Payroll Engine (OOP Driven)
                </h2>
                <p className="text-xs text-slate-400">
                  Powered by <code>PayrollProcessor.calculate_pay(base_salary, overtime_hours)</code>
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Overtime Rate: <strong>$20.00 / hr</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Flat Statutory Tax: <strong>10.0%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Deduction Formula: <strong>Net = (Base + OT) * 0.90</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <select
                id="payroll-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="run-automated-payroll-btn"
              onClick={handleRunPayroll}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? 'Calculating...' : 'Run Automated Payroll'}
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl flex items-center gap-2 text-xs font-medium border ${
              feedback.type === 'success'
                ? 'bg-emerald-900/40 border-emerald-700 text-emerald-200'
                : 'bg-rose-900/40 border-rose-700 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Period Grand Totals - Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Gross Payroll ({selectedMonth})
          </p>
          <p className="text-2xl font-bold text-slate-800 font-mono mt-1">
            ${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Base Salaries + Overtime Bonuses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Withholding Tax (10%)
          </p>
          <p className="text-2xl font-bold text-rose-600 font-mono mt-1">
            -${totalTaxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-rose-600 font-medium mt-0.5">Automated tax computation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Net Disbursed Payout
          </p>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            ${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Net Disbursed to Employees</p>
        </div>
      </div>

      {/* Payroll Records Table - Bento Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Disbursement Registry — {selectedMonth}
            </h3>
            <p className="text-xs text-slate-500">
              Normalized records in <code>payroll</code> table linked to <code>employees</code>
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 font-mono">
            {currentRecords.length} Employee Slips
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Slip ID</th>
                <th className="py-3.5 px-5">Employee</th>
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-5">Base Salary</th>
                <th className="py-3.5 px-5">Overtime Pay</th>
                <th className="py-3.5 px-5">Gross Earnings</th>
                <th className="py-3.5 px-5">Tax (10%)</th>
                <th className="py-3.5 px-5">Net Salary</th>
                <th className="py-3.5 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRecords.map((record) => (
                <tr key={record.payroll_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-slate-500">
                    #PAY-{record.payroll_id}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900">{record.emp_name}</div>
                    <div className="text-[11px] text-slate-500">ID: EMP-00{record.emp_id}</div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700">{record.dept_name}</td>
                  <td className="py-3.5 px-5 font-mono text-slate-800">
                    ${(record.base_salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-emerald-600 font-medium">
                    +${(record.overtime_pay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <div className="text-[10px] text-slate-400">
                      ({record.overtime_hours || 0} hrs @ $20)
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-semibold text-slate-900">
                    ${(record.gross_salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-rose-600 font-medium">
                    -${record.tax_deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-900 text-sm">
                    ${record.net_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      id={`view-slip-btn-${record.emp_id}`}
                      onClick={() => onViewPayslip(record.emp_id, record.month_year)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}

              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No payroll records generated for {selectedMonth}. Click &ldquo;Run Automated Payroll&rdquo; above to calculate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
