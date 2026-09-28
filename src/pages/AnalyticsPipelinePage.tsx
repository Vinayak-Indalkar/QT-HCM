import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader, Card, CardHeader, CardContent } from '../components';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Building,
  Laptop
} from 'lucide-react';

export const AnalyticsPipelinePage: React.FC = () => {
  const { candidates } = useOnboarding();

  const total = candidates.length;
  const completed = candidates.filter((c) => c.status === 'completed').length;
  const inProgress = candidates.filter(
    (c) => c.status !== 'completed' && c.status !== 'rejected' && c.status !== 'draft'
  ).length;

  const avgProgress =
    total > 0
      ? Math.round(candidates.reduce((acc, c) => acc + c.progress, 0) / total)
      : 0;

  // Department counts
  const deptCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
  });

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12">
      <PageHeader
        title="Onboarding Pipeline Analytics"
        description="Real-time operational metrics on time-to-productivity, department velocity, and candidate satisfaction."
      />

      {/* High-level metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Employees</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{total}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">+24% YoY growth</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Average Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{avgProgress}%</p>
          <span className="text-[11px] text-slate-400">Across active pipeline</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Avg SLA Turnaround</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">4.2 Days</p>
          <span className="text-[11px] text-emerald-600 font-semibold">1.8 days faster than target</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{completed}</p>
          <span className="text-[11px] text-slate-400">100% Day-1 ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Funnel Stage Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Pipeline Funnel Stages
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>1. Invited & Form Initiated</span>
                <span>{candidates.length} candidates (100%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>2. Documents Submitted</span>
                <span>
                  {candidates.filter((c) => c.status !== 'draft' && c.status !== 'invited').length} candidates
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full w-4/5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>3. Compliance Verified & Hardware Staged</span>
                <span>
                  {candidates.filter((c) => c.status === 'verification' || c.status === 'equipment_provisioning' || c.status === 'orientation_scheduled' || c.status === 'completed').length} candidates
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full w-3/5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>4. Orientation Scheduled & Completed</span>
                <span>
                  {candidates.filter((c) => c.status === 'orientation_scheduled' || c.status === 'completed').length} candidates
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full w-2/5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Employees by Department
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">{dept}</span>
                    <span className="text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
