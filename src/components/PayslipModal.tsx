import React from 'react';
import { X, Printer, CheckCircle2, Building2, Calendar, FileText, DollarSign } from 'lucide-react';
import { PayslipDetails } from '../types';

interface PayslipModalProps {
  payslip: PayslipDetails | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, onClose }) => {
  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="payslip-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="payslip-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Payslip Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-sm shadow-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Official Salary Payslip</h3>
              <p className="text-xs text-slate-400">
                Automated Computation via Python PayrollProcessor OOP
              </p>
            </div>
          </div>
          <button
            id="close-payslip-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payslip Content Body */}
        <div className="p-6 space-y-6">
          {/* Company & Employee Identity Bento Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-sm">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Employee Information
              </div>
              <div className="font-bold text-slate-900 text-base">{payslip.name}</div>
              <div className="text-slate-600 text-xs mt-0.5">{payslip.email}</div>
              <div className="text-slate-500 text-xs mt-1">
                Employee ID: <span className="font-mono font-semibold text-slate-800">EMP-00{payslip.emp_id}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Payroll Details
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Department: <strong>{payslip.dept_name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800 text-xs mt-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Pay Period: <strong>{payslip.month_year}</strong></span>
              </div>
              <div className="text-slate-500 text-xs mt-1">
                Issue Date: {payslip.issue_date}
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Bento Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 flex justify-between items-center">
                <span>Earnings Breakdown</span>
                <span className="text-emerald-700 font-semibold text-[11px]">Credits</span>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 text-xs">Base Salary</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs">
                    ${payslip.base_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-600 block text-xs">Overtime Pay</span>
                    <span className="text-[11px] text-slate-400">
                      {payslip.overtime_hours} hrs @ ${payslip.overtime_rate}/hr
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-emerald-600 text-xs">
                    +${payslip.overtime_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="px-4 py-2.5 bg-slate-50/70 flex justify-between items-center font-semibold text-slate-800 text-xs">
                  <span>Gross Pay</span>
                  <span className="font-mono text-slate-900">
                    ${payslip.gross_pay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 flex justify-between items-center">
                <span>Deductions</span>
                <span className="text-rose-700 font-semibold text-[11px]">Withholdings</span>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <div>
                    <span className="text-slate-600 block text-xs">Income Tax (10%)</span>
                    <span className="text-[11px] text-slate-400">Automated flat statutory tax</span>
                  </div>
                  <span className="font-mono font-semibold text-rose-600 text-xs">
                    -${payslip.tax_deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Other Deductions</span>
                  <span className="font-mono text-xs text-slate-400">$0.00</span>
                </div>
                <div className="px-4 py-2.5 bg-slate-50/70 flex justify-between items-center font-semibold text-slate-800 text-xs">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-600">
                    -${payslip.tax_deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Grand Summary Bento Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Total Net Disbursed Salary
                </div>
                <div className="text-xs text-emerald-700">
                  Formula: (Base + Overtime Pay) - Tax Deductions
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-extrabold text-emerald-900">
                ${payslip.net_salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Validated &amp; Audited
              </div>
            </div>
          </div>

          {/* Verification Footnote */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 font-mono">
            <strong>System Audit:</strong> Computed via <code>PayrollProcessor.calculate_pay()</code> with base ${payslip.base_salary.toFixed(2)}, {payslip.overtime_hours} OT hours, $20/hr rate.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            id="print-payslip-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
          <button
            id="modal-close-action-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
