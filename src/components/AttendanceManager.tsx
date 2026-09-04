import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  UserCheck,
  UserX,
  PlusCircle,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { AttendanceRecord, Employee } from '../types';

interface AttendanceManagerProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
  onLogAttendance: (emp_id: number, work_date: string, status: 'Present' | 'Absent', overtime_hours: number) => Promise<{ success: boolean; error?: string }>;
  onDeleteAttendance: (att_id: number) => Promise<{ success: boolean; error?: string }>;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  attendanceRecords,
  employees,
  onLogAttendance,
  onDeleteAttendance,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<number>(employees[0]?.emp_id || 1);
  const [workDate, setWorkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const [overtimeHours, setOvertimeHours] = useState<number>(2);
  const [filterEmpId, setFilterEmpId] = useState<number | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const safeOt = status === 'Absent' ? 0 : Number(overtimeHours);
    const res = await onLogAttendance(Number(selectedEmpId), workDate, status, safeOt);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Logged ${status} record (${safeOt} hrs overtime) for date ${workDate}.`,
      });
      if (status === 'Present') {
        setOvertimeHours(0);
      }
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to log attendance.',
      });
    }
  };

  const filteredAttendance = attendanceRecords.filter((record) => {
    if (filterEmpId === 'all') return true;
    return record.emp_id === Number(filterEmpId);
  });

  const totalPresent = attendanceRecords.filter((a) => a.status === 'Present').length;
  const totalAbsent = attendanceRecords.filter((a) => a.status === 'Absent').length;
  const totalOvertime = attendanceRecords.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Attendance Stats Cards - Bento Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Present Days
            </p>
            <p className="text-3xl font-bold text-emerald-600 font-mono mt-1">{totalPresent}</p>
            <p className="text-xs text-slate-500 mt-0.5">Logs with status &apos;Present&apos;</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Absent Days
            </p>
            <p className="text-3xl font-bold text-rose-600 font-mono mt-1">{totalAbsent}</p>
            <p className="text-xs text-slate-500 mt-0.5">Logs with status &apos;Absent&apos;</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Logged Overtime Hours
            </p>
            <p className="text-3xl font-bold text-slate-800 font-mono mt-1">{totalOvertime} <span className="text-sm font-normal text-slate-400">hrs</span></p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              ${(totalOvertime * 20).toLocaleString()} @ $20.00 / hr
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Log Attendance Form - Bento Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Log Employee Attendance &amp; Overtime
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Table: <code>attendance</code>
          </span>
        </div>

        <div className="p-6">
          {feedback && (
            <div
              className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Select Employee <span className="text-rose-500">*</span>
              </label>
              <select
                id="attendance-emp-select"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {employees.map((emp) => (
                  <option key={emp.emp_id} value={emp.emp_id}>
                    EMP-00{emp.emp_id}: {emp.name} ({emp.dept_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Work Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  id="attendance-date-input"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="attendance-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Present' | 'Absent')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Overtime (Hours)
              </label>
              <input
                type="number"
                id="attendance-ot-input"
                min="0"
                max="16"
                step="0.5"
                disabled={status === 'Absent'}
                value={status === 'Absent' ? 0 : overtimeHours}
                onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <div className="lg:col-span-1">
              <button
                type="submit"
                id="log-attendance-btn"
                disabled={isSubmitting}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '...' : 'Log'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Attendance History Table - Bento Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Attendance &amp; Overtime Log Registry
            </h3>
            <p className="text-xs text-slate-500">
              Normalized records feeding into automated payroll overtime aggregation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterEmpId}
              onChange={(e) => setFilterEmpId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
            >
              <option value="all">All Employees ({attendanceRecords.length} logs)</option>
              {employees.map((e) => (
                <option key={e.emp_id} value={e.emp_id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Log ID</th>
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-5">Work Date</th>
                <th className="py-3 px-5">Attendance Status</th>
                <th className="py-3 px-5">Overtime Hours</th>
                <th className="py-3 px-5">Overtime Pay ($20/hr)</th>
                <th className="py-3 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.map((record) => (
                <tr key={record.att_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-5 font-mono text-slate-500">#ATT-{record.att_id}</td>
                  <td className="py-3 px-5 font-semibold text-slate-900">{record.emp_name}</td>
                  <td className="py-3 px-5 font-mono text-slate-700">{record.work_date}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        record.status === 'Present'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {record.status === 'Present' ? (
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <UserX className="w-3 h-3 text-rose-600" />
                      )}
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 font-mono font-medium text-slate-800">
                    {record.overtime_hours > 0 ? (
                      <span className="font-bold text-amber-700">{record.overtime_hours} hrs</span>
                    ) : (
                      <span className="text-slate-400">0 hrs</span>
                    )}
                  </td>
                  <td className="py-3 px-5 font-mono text-emerald-600 font-medium">
                    +${(record.overtime_hours * 20).toFixed(2)}
                  </td>
                  <td className="py-3 px-5 text-center">
                    <button
                      onClick={() => onDeleteAttendance(record.att_id)}
                      title="Delete Attendance Log"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No attendance records found for this selection.
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
