import React, { useState, useEffect, useMemo } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useOnboardingFlow } from '../context/OnboardingFlowContext';
import { useRole } from '../context/RoleContext';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { StatCard } from '../components/common/StatCard';
import {
  getDashletsForPersona,
  resetPersonaLayout,
  DashletConfig
} from '../services/dashboardCustomizationService';
import { getAssignedAssetsForEmployee } from '../services/assetService';
import { DashletCardWrapper } from '../components/dashboard/DashletCardWrapper';
import { DynamicDashletChart } from '../components/dashboard/DynamicDashletChart';
import { Candidate } from '../types/candidate';
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
  UserCheck
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
  const [dashlets, setDashlets] = useState<DashletConfig[]>(() =>
    getDashletsForPersona('EMPLOYEE')
  );

  const refreshDashlets = () => {
    setDashlets(getDashletsForPersona('EMPLOYEE'));
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
    switch (dashlet.id) {
      case 'emp_widget_welcome_hero':
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
      case 'kpi_doc_compliance':
      case 'emp_kpi_progress':
        return (
          <StatCard
            label="Onboarding Completion"
            value={`${progressPercent}%`}
            change={`${completedStepsCount} of 10 steps completed`}
            isPositive={progressPercent > 50}
            description="Wizard progression"
            icon={<Sparkles className="w-5 h-5" />}
            iconBg="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
            onClick={() => navigateTo('wizard')}
          />
        );
      case 'emp_kpi_tasks_done':
        return (
          <StatCard
            label="Day 1 Checklist Tasks"
            value={`${checklist.filter((c) => c.completed).length} / ${checklist.length}`}
            change={checklist.filter((c) => c.completed).length === checklist.length ? 'All tasks complete' : 'Action items pending'}
            isPositive={checklist.filter((c) => c.completed).length > 2}
            description="Readiness checklist"
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
          />
        );
      case 'emp_kpi_docs_verified':
        return (
          <StatCard
            label="Statutory Documents"
            value={`${uploadedDocs} / ${totalDocs}`}
            change={uploadedDocs >= totalDocs ? 'All documents ready' : 'Pending uploads'}
            isPositive={uploadedDocs >= 2}
            description="I-9 & Identification"
            icon={<FileCheck2 className="w-5 h-5" />}
            iconBg="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
            onClick={() => navigateTo('wizard')}
          />
        );
      case 'kpi_asset_pool':
      case 'emp_kpi_asset_status':
        return (
          <StatCard
            label="Hardware & Accounts"
            value={assignedAssets.length > 0 ? `${assignedAssets.length} Assets` : 'Active'}
            change="Okta SSO Enabled"
            isPositive={true}
            description="Apple MacBook Pro M3"
            icon={<Laptop className="w-5 h-5" />}
            iconBg="bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400"
            onClick={() => navigateTo('profile')}
          />
        );
      case 'emp_widget_journey_steps':
        return (
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Onboarding Journey Progression
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track the mandatory steps needed to finalize your employment dossier and day-1 badge.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigateTo('wizard')}
                className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Open Wizard
              </Button>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Overall Step Completion</span>
                <span>{progressPercent}% Complete ({completedStepsCount} of 10 Steps)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {[
                  { step: 1, name: 'Personal Info', completed: completedStepsCount >= 1 },
                  { step: 2, name: 'Documents', completed: completedStepsCount >= 2 },
                  { step: 3, name: 'Address', completed: completedStepsCount >= 3 },
                  { step: 4, name: 'Emergency', completed: completedStepsCount >= 4 },
                  { step: 5, name: 'Family', completed: completedStepsCount >= 5 },
                  { step: 6, name: 'Education', completed: completedStepsCount >= 6 },
                  { step: 7, name: 'Experience', completed: completedStepsCount >= 7 },
                  { step: 8, name: 'Bank & Tax', completed: completedStepsCount >= 8 },
                  { step: 9, name: 'NDA Sign', completed: completedStepsCount >= 9 },
                  { step: 10, name: 'Badge Photo', completed: completedStepsCount >= 10 }
                ].map((s) => (
                  <div
                    key={s.step}
                    className={cn(
                      'p-2.5 rounded-lg border text-center transition-all',
                      s.completed
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {s.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block text-[9px] leading-3 text-slate-400">
                          {s.step}
                        </span>
                      )}
                      <span className="text-[11px] font-bold">Step {s.step}</span>
                    </div>
                    <p className="text-[10px] truncate">{s.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'emp_widget_manager_buddy':
        return (
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs h-full">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Your Key Contacts &amp; Support Team
              </h2>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                <Avatar name="Marcus Brody" size="md" />
                <div className="space-y-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Reporting Manager
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    Marcus Brody
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">VP of Engineering</p>
                  <div className="pt-1 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <a href="mailto:manager@quantira.com" className="flex items-center gap-1 hover:text-blue-600 text-[11px]">
                      <Mail className="w-3.5 h-3.5" /> manager@quantira.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                <Avatar name="Eleanor Vance" size="md" />
                <div className="space-y-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    People Operations Lead
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    Eleanor Vance
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Head of People Operations</p>
                  <div className="pt-1 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <a href="mailto:hr@quantira.com" className="flex items-center gap-1 hover:text-purple-600 text-[11px]">
                      <Mail className="w-3.5 h-3.5" /> hr@quantira.com
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'emp_widget_hardware_card':
        return (
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs h-full">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Assigned IT Equipment
              </h2>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Apple MacBook Pro 16" M3 Max
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Asset Tag: <code className="font-mono text-teal-700 dark:text-teal-300">QNT-MBP-2026-089</code>
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Provisioned &amp; Encryption Active
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Enterprise Okta SSO</p>
                    <p className="text-[11px] text-slate-500">{empEmail}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        );
      case 'emp_widget_day1_checklist':
        return (
          <Card className="border border-slate-200 dark:border-slate-800 shadow-xs h-full">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Day-1 Action Checklist
              </h2>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300 cursor-pointer"
                  />
                  <span
                    className={cn(
                      'text-xs font-medium leading-relaxed select-none',
                      item.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-200'
                    )}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      default:
        // Render Dynamic Charts or Custom Metric Cards
        if (dashlet.type === 'chart' && dashlet.chartType) {
          return (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {dashlet.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dashlet.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DynamicDashletChart
                  chartType={dashlet.chartType}
                  data={dashlet.chartData}
                  height={180}
                />
              </CardContent>
            </Card>
          );
        }

        return (
          <StatCard
            label={dashlet.title}
            value={dashlet.customData?.value || 'Active'}
            change={dashlet.customData?.badge || 'Employee Metric'}
            isPositive={dashlet.customData?.badgePositive ?? true}
            description={dashlet.customData?.subtitle || dashlet.description}
            icon={<Sparkles className="w-5 h-5" />}
            iconBg="bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400"
          />
        );
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {!employee && (
        <PageHeader
          title="My Dashboard"
          description="Track your onboarding progress, complete Day-1 tasks, access company tools, and customize your workspace."
          onBack={onBack}
          backLabel="Back to User List"
          actions={
            <div className="flex items-center gap-2">
              {isCustomizing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    resetPersonaLayout('EMPLOYEE');
                    refreshDashlets();
                  }}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Reset Order
                </Button>
              )}
              <Button
                variant={isCustomizing ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIsCustomizing((prev) => !prev)}
                leftIcon={<Sliders className="w-3.5 h-3.5" />}
                className={cn(
                  'text-xs font-bold transition-all cursor-pointer',
                  isCustomizing
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-200'
                )}
              >
                {isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}
              </Button>
            </div>
          }
        />
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

      {/* Unified Movable Dashlets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashlets.map((dashlet, idx) => {
          const isHero = dashlet.id === 'emp_widget_welcome_hero';
          const isLarge =
            dashlet.type === 'chart' ||
            dashlet.type === 'list' ||
            dashlet.type === 'hero' ||
            dashlet.type === 'progress';

          return (
            <DashletCardWrapper
              key={dashlet.id}
              id={dashlet.id}
              title={dashlet.title}
              role="EMPLOYEE"
              index={idx}
              total={dashlets.length}
              isCustomizing={isCustomizing}
              onLayoutUpdated={refreshDashlets}
              className={
                isHero
                  ? 'col-span-1 sm:col-span-2 lg:col-span-4'
                  : isLarge
                  ? 'col-span-1 sm:col-span-2 lg:col-span-2'
                  : 'col-span-1'
              }
            >
              {renderDashletContent(dashlet)}
            </DashletCardWrapper>
          );
        })}
      </div>
    </div>
  );
};
