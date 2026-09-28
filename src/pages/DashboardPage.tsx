import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import {
  PageHeader,
  StatCard,
  Button,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  StatusIndicator,
  Avatar
} from '../components';
import { formatDate } from '../utils/formatters';
import { getAssets } from '../services/assetService';
import {
  getDashletsForPersona,
  resetPersonaLayout,
  getColSpanClass,
  getHeightClass,
  DashletConfig,
  resolveChartDataFromSource
} from '../services/dashboardCustomizationService';
import { cn } from '../utils/cn';
import { DashletCardWrapper } from '../components/dashboard/DashletCardWrapper';
import { DynamicDashletChart } from '../components/dashboard/DynamicDashletChart';
import { EmployeeProfileView } from '../components/employee/EmployeeProfileView';
import { Candidate } from '../types/candidate';
import { getEffectiveAvatar } from '../utils/radianAvatars';
import { MOCK_RECENT_EXITS, MOCK_SYSTEM_ALERTS } from '../services/mockData';
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
  RefreshCw,
  Layers
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
    // 1. Chart Visualization Dashlets
    if (dashlet.type === 'chart' || dashlet.chartType) {
      const resolvedChartData = dashlet.dataSource
        ? resolveChartDataFromSource(dashlet.dataSource, candidates, tasks, getAssets())
        : (dashlet.chartData && dashlet.chartData.length > 0 ? dashlet.chartData : undefined);

      return (
        <Card className="h-full w-full flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between w-full">
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
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center p-4">
            <DynamicDashletChart
              chartType={dashlet.chartType || 'bar'}
              data={resolvedChartData}
              height={220}
            />
          </CardContent>
        </Card>
      );
    }

    // 2. Specialized List Dashlets
    if (dashlet.id === 'sa_recent_joiners' || dashlet.id === 'list_recent_arrivals') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Joiners &amp; Pipeline Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Recent arrivals</p>
            </div>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => navigateTo('directory')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcomingHires.slice(0, 4).map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setViewingDashboardCandidate(candidate)}
                  className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={getEffectiveAvatar(candidate, candidate.gender, `${candidate.firstName} ${candidate.lastName}`)}
                      name={`${candidate.firstName} ${candidate.lastName}`}
                      size="sm"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {candidate.firstName} {candidate.lastName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {candidate.jobTitle} • {candidate.department}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusIndicator status={candidate.status} size="sm" />
                    <div className="w-20 hidden sm:block">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                        <span>{candidate.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            candidate.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          )}
                          style={{ width: `${candidate.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'sa_recent_exits') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Exits &amp; Offboarding</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Offboarding pipeline</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500">Last 30 Days</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_RECENT_EXITS.map((exit) => (
                <div key={exit.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{exit.name}</span>
                    <span className="text-[11px] text-slate-500">{exit.role} • {exit.dept}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 block mb-1">
                      {exit.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Exit: {exit.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'sa_pending_hr_actions' || dashlet.id === 'list_compliance_alerts') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending HR Actions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Action items</p>
            </div>
            <Button variant="tertiary" size="sm" onClick={() => navigateTo('tasks')}>
              All Tasks
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {urgentTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigateTo('tasks')}
                  className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {task.title}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 shrink-0">
                      {task.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{task.candidateName || 'Company-wide'}</span>
                    <span>Due {formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'sa_system_alerts') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">System &amp; Integration Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Infra status</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Health" />
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_SYSTEM_ALERTS.map((alert) => (
                <div key={alert.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      alert.level === 'warning' ? 'bg-amber-500' : alert.level === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                    )} />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 3. Fallback for any other custom list
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
            Active list stream configured for {dashlet.title}.
          </CardContent>
        </Card>
      );
    }

    // 4. Metric Dashlets
    return (
      <StatCard
        label={dashlet.title}
        value={dashlet.customData?.value || '248'}
        change={dashlet.customData?.badge || '+12% YoY'}
        isPositive={dashlet.customData?.badgePositive ?? true}
        description={dashlet.customData?.subtitle || dashlet.description}
      />
    );
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
    <div className="space-y-6 text-left animate-fade-in pb-12 w-full flex-1">
      <PageHeader
        title="Super Admin Dashboard"
        description="Live operational pipeline"
        actions={
          <div className="flex items-center gap-2">
            {isCustomizing && (
              <IconButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPersonaLayout('SUPER_ADMIN');
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

      {/* Unified Customizable 12-Column Responsive Grid */}
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
              role="SUPER_ADMIN"
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
