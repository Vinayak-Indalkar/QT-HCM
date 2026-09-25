import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/shell/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Avatar } from '../components/ui/Avatar';
import { ProgressRing } from '../components/common/ProgressRing';
import { formatDate } from '../utils/formatters';
import {
  getDashletsForPersona,
  resetPersonaLayout,
  DashletConfig
} from '../services/dashboardCustomizationService';
import { cn } from '../utils/cn';
import { DashletCardWrapper } from '../components/dashboard/DashletCardWrapper';
import { DynamicDashletChart } from '../components/dashboard/DynamicDashletChart';
import { EmployeeProfileView } from '../components/employee/EmployeeProfileView';
import { Candidate } from '../types/candidate';
import {
  Users,
  Clock,
  Laptop,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Sparkles,
  BarChart3,
  Activity,
  Sliders,
  RefreshCw
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { candidates, tasks, updateCandidate, navigateTo } = useOnboarding();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [viewingDashboardCandidate, setViewingDashboardCandidate] = useState<Candidate | null>(null);
  const [dashlets, setDashlets] = useState<DashletConfig[]>(() =>
    getDashletsForPersona('SUPER_ADMIN')
  );

  const refreshDashlets = () => {
    setDashlets(getDashletsForPersona('SUPER_ADMIN'));
  };

  useEffect(() => {
    const handleDashboardUpdate = () => {
      refreshDashlets();
    };
    window.addEventListener('dashboard-config-updated', handleDashboardUpdate);
    return () => window.removeEventListener('dashboard-config-updated', handleDashboardUpdate);
  }, []);

  // Metrics
  const totalActive = candidates.filter(
    (c) => c.status !== 'completed' && c.status !== 'rejected'
  ).length;

  const pendingVerification = candidates.filter((c) => c.status === 'verification').length;
  const inITProvisioning = candidates.filter((c) => c.status === 'equipment_provisioning').length;
  const orientationReady = candidates.filter((c) => c.status === 'orientation_scheduled').length;
  const completed = candidates.filter((c) => c.status === 'completed').length;

  const upcomingHires = [...candidates]
    .filter((c) => c.status !== 'completed' && c.status !== 'rejected')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const urgentTasks = tasks
    .filter((t) => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high'))
    .slice(0, 4);

  // Render individual dashlet content based on its config
  const renderDashletContent = (dashlet: DashletConfig) => {
    switch (dashlet.id) {
      case 'kpi_active_onboarding':
        return (
          <StatCard
            label="Active In Pipeline"
            value={totalActive}
            change="+3 this month"
            isPositive={true}
            description="In-progress onboarding"
            icon={<Users className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
            onClick={() => navigateTo('candidates')}
          />
        );
      case 'kpi_doc_compliance':
        return (
          <StatCard
            label="Pending Verification"
            value={pendingVerification}
            change="Action required"
            isPositive={false}
            description="I-9 & Identification"
            icon={<Clock className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
            onClick={() => navigateTo('compliance')}
          />
        );
      case 'kpi_asset_pool':
        return (
          <StatCard
            label="IT Hardware Staging"
            value={inITProvisioning}
            change="On track"
            isPositive={true}
            description="Laptops & Credentials"
            icon={<Laptop className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400"
            onClick={() => navigateTo('tasks')}
          />
        );
      case 'kpi_total_employees':
        return (
          <StatCard
            label="Orientation Ready"
            value={orientationReady}
            change={`${completed} onboarded YTD`}
            isPositive={true}
            description="Ready for Day 1"
            icon={<CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
            onClick={() => navigateTo('candidates')}
          />
        );
      case 'kpi_avg_sla':
        return (
          <StatCard
            label="Average SLA Turnaround"
            value="3.2 Days"
            change="18% Faster"
            isPositive={true}
            description="Target: Under 5 Days"
            icon={<Activity className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400"
          />
        );
      case 'list_recent_arrivals':
        return (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Upcoming Start Dates &amp; Pipeline Status
                  </h2>
                </div>
              </div>

              <Button
                variant="tertiary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
                onClick={() => navigateTo('directory')}
              >
                View All
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingHires.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => setViewingDashboardCandidate(candidate)}
                    className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={candidate.avatarUrl}
                        name={`${candidate.firstName} ${candidate.lastName}`}
                        size="md"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {candidate.firstName} {candidate.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400">({candidate.workModel})</span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {candidate.jobTitle} • {candidate.department}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          Start: {formatDate(candidate.startDate)}
                        </span>
                        <StatusIndicator status={candidate.status} size="sm" />
                      </div>

                      <ProgressRing progress={candidate.progress} size={42} strokeWidth={4} />

                      <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'list_compliance_alerts':
        return (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Urgent Action Items
                </h2>
              </div>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => navigateTo('tasks')}
              >
                All Tasks
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigateTo('tasks')}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                        {task.title}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0">
                        {task.priority}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Candidate: {task.candidateName || 'Company-wide'}</span>
                      <span>Due {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                  height={190}
                />
              </CardContent>
            </Card>
          );
        }

        return (
          <StatCard
            label={dashlet.title}
            value={dashlet.customData?.value || 'Active'}
            change={dashlet.customData?.badge || 'Custom Dashlet'}
            isPositive={dashlet.customData?.badgePositive ?? true}
            description={dashlet.customData?.subtitle || dashlet.description}
            icon={<Sparkles className="w-5 h-5" />}
            iconBg="bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400"
          />
        );
    }
  };

  if (viewingDashboardCandidate) {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        <EmployeeProfileView
          employee={viewingDashboardCandidate}
          readOnly={false}
          initialPrimaryTab="dashboard"
          onBack={() => setViewingDashboardCandidate(null)}
          onEmployeeUpdated={(updated) => updateCandidate(updated.id, updated)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      <PageHeader
        title="Super Admin Dashboard"
        description="Monitor end-to-end employee onboarding progression, verify compliance documents, and customize your live operational dashlets."
        actions={
          <div className="flex items-center gap-2">
            {isCustomizing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPersonaLayout('SUPER_ADMIN');
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

      {/* Unified Customizable Dashlet Grid: Move Top, Bottom, Left, Right Everywhere */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashlets.map((dashlet, idx) => {
          const isFullWidth = dashlet.id === 'list_recent_arrivals';
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
              role="SUPER_ADMIN"
              index={idx}
              total={dashlets.length}
              isCustomizing={isCustomizing}
              onLayoutUpdated={refreshDashlets}
              className={
                isFullWidth
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

      {/* Quick Onboarding Tip Banner */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-left">
        <h3 className="text-xs font-bold text-blue-900 dark:text-blue-200">
          💡 Did you know?
        </h3>
        <p className="text-xs text-blue-800/90 dark:text-blue-300 mt-1 leading-relaxed">
          Employees whose equipment is delivered at least 3 business days before Day 1 report a 94% higher Day-1 satisfaction score.
        </p>
      </div>
    </div>
  );
};
