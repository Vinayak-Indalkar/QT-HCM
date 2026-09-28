import React, { useState, useEffect, useMemo } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useOnboardingFlow } from '../context/OnboardingFlowContext';
import { useRole } from '../context/RoleContext';
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Avatar,
  StatCard
} from '../components';
import {
  getDashletsForPersona,
  resetPersonaLayout,
  getColSpanClass,
  getHeightClass,
  DashletConfig
} from '../services/dashboardCustomizationService';
import { getAssignedAssetsForEmployee } from '../services/assetService';
import { DashletCardWrapper } from '../components/dashboard/DashletCardWrapper';
import { DynamicDashletChart } from '../components/dashboard/DynamicDashletChart';
import { Candidate } from '../types/candidate';
import {
  MOCK_EMPLOYEE_GOALS,
  MOCK_EMPLOYEE_PAYSLIPS,
  MOCK_EMPLOYEE_DOCS,
  MOCK_EMPLOYEE_TRAININGS,
  MOCK_COMPANY_HOLIDAYS,
  MOCK_RECOGNITIONS
} from '../services/mockData';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Laptop,
  FileCheck2,
  Users,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Mail,
  BarChart3,
  Layers,
  Sliders,
  RefreshCw,
  Eye,
  UserCheck,
  Award,
  Gauge
} from 'lucide-react';
import { cn } from '../utils/cn';

export interface EmployeeDashboardPageProps {
  employee?: Candidate | null;
  onBack?: () => void;
  onViewProfile?: (employee: Candidate) => void;
}

export const EmployeeDashboardPage: React.FC<EmployeeDashboardPageProps> = ({
  employee,
  onBack,
  onViewProfile
}) => {
  const { navigateTo } = useOnboarding();
  const { currentUser } = useRole();
  const { data: flowData } = useOnboardingFlow();

  const [isCustomizing, setIsCustomizing] = useState(false);
  const currentPersona = employee ? 'KPI_DASHBOARD' : 'EMPLOYEE';
  const [dashlets, setDashlets] = useState<DashletConfig[]>(() => {
    const list = getDashletsForPersona(currentPersona);
    return list.length > 0 ? list : getDashletsForPersona('EMPLOYEE');
  });

  const refreshDashlets = () => {
    const list = getDashletsForPersona(currentPersona);
    setDashlets(list.length > 0 ? list : getDashletsForPersona('EMPLOYEE'));
  };

  useEffect(() => {
    const handleUpdate = () => {
      refreshDashlets();
    };
    window.addEventListener('dashboard-config-updated', handleUpdate);
    return () => window.removeEventListener('dashboard-config-updated', handleUpdate);
  }, []);

  const empName = employee
    ? (employee.name || `${employee.firstName} ${employee.lastName}`.trim())
    : currentUser.name;
  const empRole = employee ? employee.jobTitle : currentUser.roleTitle;
  const empDept = employee ? employee.department : currentUser.department;
  const empEmail = employee ? employee.email : currentUser.email;
  const empManager = employee?.manager || 'Marcus Brody';
  const empManagerEmail = employee?.managerEmail || 'manager@quantira.com';

  const completedStepsCount = employee
    ? Math.round(((employee.progress || 0) / 100) * 10)
    : flowData.completedSteps?.length || 0;
  const progressPercent = employee
    ? (employee.progress || 0)
    : Math.min(100, Math.round((completedStepsCount / 10) * 100));

  // Employee documents count
  const uploadedDocs = employee
    ? (employee.documents?.filter((d) => d.status === 'submitted' || d.status === 'verified').length || Math.round((progressPercent / 100) * 8))
    : flowData.documents?.filter((d) => d.status === 'uploaded' || d.status === 'verified').length || 0;
  const totalDocs = employee ? (employee.documents?.length || 8) : flowData.documents?.length || 8;

  // Assigned Assets
  const assignedAssets = useMemo(() => {
    return getAssignedAssetsForEmployee(empName);
  }, [empName]);

  // Employee Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, title: 'Complete 10-Step Onboarding Wizard Profile', completed: progressPercent === 100 },
    { id: 2, title: 'Upload Government Photo ID & Verification Docs', completed: uploadedDocs >= 2 },
    { id: 3, title: 'Sign Enterprise Proprietary Information Agreement (NDA)', completed: employee ? progressPercent >= 90 : (flowData.nda?.accepted || false) },
    { id: 4, title: 'Review & Verify Assigned MacBook Pro M3 Setup', completed: assignedAssets.length > 0 || !!employee?.equipment?.laptopModel },
    { id: 5, title: `Schedule Day 1 Coffee Kickoff with Manager (${empManager})`, completed: false }
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  // Render individual dashlet content
  const renderDashletContent = (dashlet: DashletConfig) => {
    // 1. Chart Visualizations
    if (dashlet.type === 'chart' || dashlet.chartType) {
      const chartPoints = dashlet.chartData && dashlet.chartData.length > 0 ? dashlet.chartData : undefined;
      return (
        <Card className="h-full w-full flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {dashlet.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {dashlet.description}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {dashlet.chartType || 'bar'}
            </span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center p-4">
            <DynamicDashletChart
              chartType={dashlet.chartType || 'bar'}
              data={chartPoints}
              height={220}
            />
          </CardContent>
        </Card>
      );
    }

    // 2. Welcome Hero
    if (dashlet.id === 'emp_widget_welcome_hero') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {employee ? `Employee Workspace (ID: ${employee.id})` : 'Employee Onboarding Workspace'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome to Quantira, {empName}! 👋
              </h1>
              <p className="text-sm text-blue-100/90 max-w-xl">
                You're set up as <span className="font-semibold text-white">{empRole}</span> in the{' '}
                <span className="font-semibold text-white">{empDept}</span> team. Let's make your Day 1 smooth and complete your onboarding setup.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {employee ? (
                onViewProfile && (
                  <Button
                    variant="primary"
                    onClick={() => onViewProfile(employee)}
                    className="bg-white hover:bg-slate-100 text-blue-900 font-bold text-xs sm:text-sm shadow-md"
                    leftIcon={<Eye className="w-4 h-4 text-blue-700" />}
                  >
                    View &amp; Edit Profile
                  </Button>
                )
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={() => navigateTo('wizard')}
                    className="bg-white hover:bg-slate-100 text-blue-900 font-bold text-xs sm:text-sm shadow-md"
                    leftIcon={<Sparkles className="w-4 h-4 text-blue-700" />}
                  >
                    {progressPercent === 100 ? 'Review Wizard' : 'Resume Onboarding'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigateTo('profile')}
                    className="bg-white/15 hover:bg-white/25 text-white border-white/20 text-xs sm:text-sm font-semibold backdrop-blur-xs"
                  >
                    View My Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 3. Employee Specific Lists & Widgets
    if (dashlet.id === 'emp_todays_attendance') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Attendance &amp; Shift</h3>
              <p className="text-xs text-slate-500">Live time-card &amp; shift duration</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Checked In</span>
          </CardHeader>
          <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Check In</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">09:05 AM</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Logged</span>
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400">7h 42m</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Breaks</span>
                <span className="font-bold text-xs text-slate-900 dark:text-white">45 mins</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
              <span>Shift: Standard 09:00 - 18:00 (On-Premises HQ)</span>
              <span className="font-bold">On Schedule</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'emp_my_leave_balance') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Leave Balance</h3>
              <p className="text-xs text-slate-500">Annual statutory entitlements</p>
            </div>
            <button type="button" className="px-2.5 py-1 text-xs font-bold rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
              Apply Leave
            </button>
          </CardHeader>
          <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                <span className="text-[10px] text-slate-500 block">Casual (CL)</span>
                <span className="text-sm font-extrabold text-blue-600">6.5 Days</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] text-slate-500 block">Earned (EL)</span>
                <span className="text-sm font-extrabold text-emerald-600">8.0 Days</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900">
                <span className="text-[10px] text-slate-500 block">Sick (SL)</span>
                <span className="text-sm font-extrabold text-purple-600">2.0 Days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'emp_my_goals') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              My Quarterly OKRs &amp; Goals
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700">Q3 2026</span>
          </CardHeader>
          <CardContent className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5 flex-1">
              {MOCK_EMPLOYEE_GOALS.map((g) => (
                <div key={g.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{g.title}</span>
                    <span className="font-bold text-blue-600">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'emp_my_tasks' || dashlet.id === 'emp_widget_day1_checklist') {
      return (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xs h-full w-full flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              My Assigned Tasks
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {checklist.filter((c) => c.completed).length} of {checklist.length} Done
            </span>
          </CardHeader>
          <CardContent className="p-3 space-y-2 flex-1">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-300 cursor-pointer"
                />
                <span className={cn('text-xs font-medium leading-tight', item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200')}>
                  {item.title}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'emp_my_payslips') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              My Payslips &amp; Tax Documents
            </h3>
            <span className="text-[11px] text-slate-400">Direct Deposit</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_EMPLOYEE_PAYSLIPS.map((p) => (
                <div key={p.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{p.month}</span>
                    <span className="text-[11px] text-slate-500">Credited: {p.date} • {p.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.net}</span>
                    <button type="button" className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer">
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'emp_my_documents') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              My Documents &amp; Certifications
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">All Verified</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_EMPLOYEE_DOCS.map((d) => (
                <div key={d.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{d.name}</span>
                    <span className="text-[11px] text-slate-500">{d.date}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'emp_my_training' || dashlet.id === 'kpi_training_certifications') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Training &amp; Certifications
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">2 Complete</span>
          </CardHeader>
          <CardContent className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5 flex-1">
              {MOCK_EMPLOYEE_TRAININGS.map((t) => (
                <div key={t.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t.course}</span>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.2 rounded', t.progress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800')}>
                      {t.badge}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${t.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'emp_upcoming_holidays') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Upcoming Company Holidays
            </h3>
            <span className="text-[11px] text-slate-400">Q4 2026</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_COMPANY_HOLIDAYS.map((h) => (
                <div key={h.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{h.holiday}</span>
                    <span className="text-[11px] text-slate-500">{h.type}</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{h.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 4. Specific KPI Dashboard List Widgets
    if (dashlet.id === 'kpi_manager_feedback') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Manager Observations &amp; Feedback
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Rating: 4.9/5.0</span>
          </CardHeader>
          <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
            <blockquote className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border-l-3 border-blue-600">
              "Demonstrates outstanding architectural velocity and deep commitment to team standards. Led the core service migration ahead of deadline with 0 regressions."
            </blockquote>
            <span className="text-[11px] text-slate-400 text-right block">— Marcus Brody, VP Engineering</span>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'kpi_recognition_achievements') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recognition &amp; Accolades
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">3 Awards</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {MOCK_RECOGNITIONS.map((rec) => (
                <div key={rec.id} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{rec.title}</span>
                    <span className="text-[11px] text-slate-500">{rec.subtitle}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600">{rec.reward}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'kpi_development_plan' || dashlet.id === 'kpi_improvement_areas') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Development Plan &amp; Growth Roadmap
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Staff Track</span>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2 flex-1">
            <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-xs">
              <strong className="text-blue-900 dark:text-blue-200 block">1. Technical Leadership:</strong>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">Drive cross-functional RFC architecture reviews for Q4 platform release.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <strong className="text-slate-900 dark:text-white block">2. Mentorship Milestone:</strong>
              <p className="text-slate-500 text-[11px]">Lead bi-weekly technical brown-bag sessions on distributed caching.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // 5. Fallback List
    if (dashlet.type === 'list') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {dashlet.title}
            </h3>
            <p className="text-xs text-slate-500">{dashlet.description}</p>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex items-center justify-center text-center text-xs text-slate-400">
            Interactive view active for {dashlet.title}.
          </CardContent>
        </Card>
      );
    }

    // 6. Metric Dashlets
    return (
      <StatCard
        label={dashlet.title}
        value={dashlet.customData?.value || '98.5%'}
        change={dashlet.customData?.badge || 'On Track'}
        isPositive={dashlet.customData?.badgePositive ?? true}
        description={dashlet.customData?.subtitle || dashlet.description}
      />
    );
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12 flex-1 w-full">
      {!employee ? (
        <PageHeader
          title="My Dashboard"
          description="Onboarding progress"
          onBack={onBack}
          backLabel="Back to User List"
          actions={
            <div className="flex items-center gap-2">
              {isCustomizing && (
                <IconButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    resetPersonaLayout('EMPLOYEE');
                    refreshDashlets();
                  }}
                  icon={<RefreshCw className="w-4 h-4" />}
                  aria-label="Reset Layout"
                />
              )}
              <Button
                variant={isCustomizing ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIsCustomizing((prev) => !prev)}
                leftIcon={<Sliders className="w-3.5 h-3.5" />}
                className={cn(
                  'text-xs font-bold transition-all cursor-pointer shadow-2xs',
                  isCustomizing
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'text-slate-700 dark:text-slate-200'
                )}
              >
                {isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}
              </Button>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {empName}'s Dashboard View
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {dashlets.length} Active Dashlets
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customizable layout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCustomizing && (
              <IconButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPersonaLayout(currentPersona);
                  refreshDashlets();
                }}
                icon={<RefreshCw className="w-4 h-4" />}
                aria-label="Reset Layout"
              />
            )}
            <Button
              variant={isCustomizing ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsCustomizing((prev) => !prev)}
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
              className={cn(
                'text-xs font-bold transition-all cursor-pointer shadow-2xs',
                isCustomizing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'text-slate-700 dark:text-slate-200'
              )}
            >
              {isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}
            </Button>
          </div>
        </div>
      )}

      {/* Customize Mode Instruction Notice */}
      {isCustomizing && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Full Layout Movement Active:</strong> Use the <strong>Top, Bottom, Left, Right, Up,</strong> and <strong>Down</strong> controls on any dashlet to move it everywhere, or click <strong>Hide</strong> to remove it.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCustomizing(false)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-3 cursor-pointer"
          >
            Exit &amp; Save
          </button>
        </div>
      )}

      {/* Unified Movable 12-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-4 items-start">
        {dashlets.map((dashlet, idx) => {
          const colSpan = dashlet.colSpan || 3;
          const heightPreset = dashlet.heightPreset || 'normal';
          const customHeight = dashlet.customHeight;

          return (
            <DashletCardWrapper
              key={dashlet.id}
              id={dashlet.id}
              title={dashlet.title}
              role={currentPersona}
              index={idx}
              total={dashlets.length}
              isCustomizing={isCustomizing}
              colSpan={colSpan}
              heightPreset={heightPreset}
              customHeight={customHeight}
              onLayoutUpdated={refreshDashlets}
              className={cn(getColSpanClass(colSpan), getHeightClass(heightPreset, customHeight))}
            >
              {renderDashletContent(dashlet)}
            </DashletCardWrapper>
          );
        })}
      </div>
    </div>
  );
};
