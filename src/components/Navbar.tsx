import React from 'react';
import {
  Users,
  Building2,
  Clock,
  DollarSign,
  Terminal,
  Code2,
  RotateCcw,
  BarChart3,
  ShieldCheck,
  Database,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'analytics'
  | 'sql_studio'
  | 'code_architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onResetDatabase: () => void;
  employeeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onResetDatabase,
  employeeCount,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'employees' as ActiveTab, label: 'Employees (CRUD)', icon: Users },
    { id: 'attendance' as ActiveTab, label: 'Attendance & Overtime', icon: Clock },
    { id: 'payroll' as ActiveTab, label: 'Payroll & Payslips', icon: DollarSign },
    { id: 'analytics' as ActiveTab, label: 'Dept Analytics', icon: Building2 },
    { id: 'sql_studio' as ActiveTab, label: 'SQL Studio', icon: Terminal },
    { id: 'code_architecture' as ActiveTab, label: 'Python OOP Models', icon: Code2 },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  PayrollOS <span className="text-blue-600 italic font-medium text-sm sm:text-base">v2.4</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Employee Management &amp; Financial Analytics Engine (MySQL &bull; Python OOP)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* DB Connected Badge from Bento Grid design */}
            <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-slate-600">
                DB: <strong className="text-slate-800 font-mono">payroll_db</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono">{employeeCount} emps</span>
            </div>

            <button
              id="reset-database-btn"
              onClick={onResetDatabase}
              title="Reset sample database to default seed state"
              className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset DB</span>
            </button>
          </div>
        </div>

        {/* Bento Nav Tabs */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
