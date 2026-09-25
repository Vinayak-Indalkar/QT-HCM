import React, { useState, useMemo, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Candidate } from '../types/candidate';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { ProgressRing } from '../components/common/ProgressRing';
import { StatCard } from '../components/common/StatCard';
import { EmployeeDossierModal, EmployeeDossierData } from '../components/modals/EmployeeDossierModal';
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
import {
  UserCheck,
  Eye,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  Search,
  Laptop,
  BarChart3,
  Layers,
  Sliders,
  RefreshCw
} from 'lucide-react';

export const ManagerDashboardPage: React.FC = () => {
  const { candidates, tasks, navigateTo } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<EmployeeDossierData | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dashlets, setDashlets] = useState<DashletConfig[]>(() =>
    getDashletsForPersona('MANAGER')
  );

  const refreshDashlets = () => {
    setDashlets(getDashletsForPersona('MANAGER'));
  };

  useEffect(() => {
    const handleDashboardUpdate = () => {
      refreshDashlets();
    };
    window.addEventListener('dashboard-config-updated', handleDashboardUpdate);
    return () => window.removeEventListener('dashboard-config-updated', handleDashboardUpdate);
  }, []);

  // Filter team members reporting to Marcus Brody / Engineering management
  const teamMembers = useMemo(() => {
    return candidates.filter((c) => {
      const isAssigned =
        c.manager?.toLowerCase().includes('marcus') ||
        c.managerEmail?.toLowerCase().includes('brody') ||
        c.department?.toLowerCase() === 'engineering';
      if (!isAssigned) return false;

      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [candidates, searchQuery]);

  // Manager Checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, title: 'Send Day 1 Welcome Email & Team Agenda', completed: true },
    { id: 2, title: 'Verify MacBook Pro M3 Max & Okta SSO setup', completed: true },
    { id: 3, title: 'Pair employee with designated First-Week Buddy', completed: true },
    { id: 4, title: 'Host 30-min Day 1 Kickoff & Coffee Chat', completed: false },
    { id: 5, title: 'Review 30-60-90 Day Engineering Expectations', completed: false }
  ]);

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleOpenDossier = (candidate: Candidate) => {
    setSelectedDossier({
      id: candidate.id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      phone: candidate.phone,
      jobTitle: candidate.jobTitle,
      department: candidate.department,
      avatar: candidate.avatarUrl,
      startDate: candidate.startDate,
      workLocation: candidate.officeLocation || 'San Francisco HQ',
      workModel: candidate.workModel || 'Hybrid',
      employmentType: candidate.employmentType || 'Full-time',
      status: candidate.status,
      progress: candidate.progress,
      manager: candidate.manager || 'Marcus Brody',
      documents: candidate.documents.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        fileName: d.fileName,
        fileSize: d.fileSize,
        uploadedAt: d.uploadedAt,
        required: d.required
      })),
      nda: {
        accepted: candidate.progress > 30,
        signedName: `${candidate.firstName} ${candidate.lastName}`,
        acceptedAt: candidate.createdAt,
        agreementVersion: 'v2026.2 (Enterprise Proprietary Information Agreement)'
      },
      corporateAccount: {
        corporateEmail: candidate.email,
        accountStatus: 'Provisioned & Active',
        ssoProvider: 'Okta Enterprise SSO'
      },
      equipment: {
        laptopModel: candidate.equipment?.laptopModel || 'Apple MacBook Pro 16"',
        selectedItems: candidate.equipment?.accessories || ['Laptop Pro 16"', 'Ergonomic Keyboard', 'Wireless Mouse'],
        specialRequests: candidate.equipment?.notes
      },
      officeSetup: {
        deskLocation: 'Building 2 - 4th Floor (Quiet Engineering Zone)',
        accessLevel: 'Tier 3 Clearance',
        parkingRequired: true,
        licensePlate: '7XYZ890',
        permitType: 'Reserved Bay'
      }
    });
  };

  // Render individual dashlet content
  const renderDashletContent = (dashlet: DashletConfig) => {
    switch (dashlet.id) {
      case 'kpi_total_employees':
      case 'mgr_kpi_team_count':
        return (
          <StatCard
            label="Total Team Members"
            value={String(teamMembers.length)}
            change="+2 this month"
            isPositive={true}
            description="Active Engineering Team"
            icon={<Users className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50 dark:bg-blue-950/80"
          />
        );
      case 'kpi_active_onboarding':
      case 'mgr_kpi_in_onboarding':
        return (
          <StatCard
            label="Onboarding In Progress"
            value={String(teamMembers.filter((m) => m.status !== 'completed').length)}
            change="Incoming arrivals"
            isPositive={true}
            description="Currently in pipeline"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50 dark:bg-amber-950/80"
          />
        );
      case 'kpi_doc_compliance':
      case 'mgr_kpi_day1_ready':
        return (
          <StatCard
            label="Day 1 Ready (100%)"
            value={String(teamMembers.filter((m) => m.progress >= 80).length)}
            change="Hardware & Access set"
            isPositive={true}
            description="Clearance Verified"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950/80"
          />
        );
      case 'kpi_asset_pool':
      case 'mgr_kpi_hardware_ok':
        return (
          <StatCard
            label="Manager Checklist"
            value={`${checklist.filter((c) => c.completed).length} / ${checklist.length}`}
            change="Tasks completed"
            isPositive={true}
            description="Day-1 readiness gates"
            icon={<Coffee className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-50 dark:bg-purple-950/80"
          />
        );
      case 'mgr_widget_team_checklist':
        return (
          <Card className="h-full w-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Manager Day-1 Kickoff Checklist
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2 flex-1 flex flex-col justify-between">
              <div className="space-y-2 pt-1 flex-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      item.completed
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-medium leading-tight">{item.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'mgr_widget_team_roster':
      case 'list_recent_arrivals':
        return (
          <Card className="h-full w-full flex flex-col justify-between">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Team Members &amp; Incoming Hires
                </h2>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigateTo('directory')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0"
                >
                  View in My Team
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleOpenDossier(member)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <Avatar
                        src={member.avatarUrl}
                        name={`${member.firstName} ${member.lastName}`}
                        size="lg"
                        className="shrink-0 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0">
                            {member.workModel}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {member.jobTitle} • <span className="text-blue-600 dark:text-blue-400">{member.department}</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Starts: <strong>{formatDate(member.startDate)}</strong>
                          </span>
                          <span>•</span>
                          <span>Manager: {member.manager}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="flex items-center gap-3 text-right">
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {member.progress}% Done
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {member.status.replace('_', ' ')}
                          </span>
                        </div>
                        <ProgressRing progress={member.progress} size={40} strokeWidth={4}>
                          <span className="text-[10px] font-bold">{member.progress}%</span>
                        </ProgressRing>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDossier(member);
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}

                {teamMembers.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No team members found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      default:
        // Render Dynamic Charts or Custom Metric Cards
        if (dashlet.type === 'chart' && dashlet.chartType) {
          const resolvedChartData = dashlet.dataSource
            ? resolveChartDataFromSource(dashlet.dataSource, candidates, tasks, getAssets())
            : dashlet.chartData;

          return (
            <Card className="h-full w-full flex flex-col justify-between">
              <CardHeader className="pb-2">
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
              <CardContent className="flex-1 flex flex-col justify-center p-4">
                <DynamicDashletChart
                  chartType={dashlet.chartType}
                  data={resolvedChartData}
                  height={220}
                />
              </CardContent>
            </Card>
          );
        }

        return (
          <StatCard
            label={dashlet.title}
            value={dashlet.customData?.value || 'Active'}
            change={dashlet.customData?.badge || 'Manager Metric'}
            isPositive={dashlet.customData?.badgePositive ?? true}
            description={dashlet.customData?.subtitle || dashlet.description}
            icon={<Sparkles className="w-5 h-5" />}
            iconBg="bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400"
          />
        );
    }
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12 flex-1">
      <PageHeader
        title="Manager Dashboard"
        description="Oversee incoming team members, review Day 1 readiness, track shift attendance, and customize your live operational dashlets."
        actions={
          <div className="flex items-center gap-2">
            {isCustomizing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPersonaLayout('MANAGER');
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
              role="MANAGER"
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

      {/* Manager Support Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-900/60 border-blue-100 dark:border-slate-800 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs text-slate-900 dark:text-white block">
              Manager Tip: First 1-on-1
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Focus your first meeting on psychological safety and introductions rather than heavy technical setup. The automated IT provisioning takes care of their environment.
            </p>
          </div>
        </div>
      </Card>

      {/* Employee Dossier Modal */}
      {selectedDossier && (
        <EmployeeDossierModal
          isOpen={true}
          onClose={() => setSelectedDossier(null)}
          employee={selectedDossier}
        />
      )}
    </div>
  );
};
