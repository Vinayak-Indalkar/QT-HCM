import React, { useState, useMemo, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Candidate } from '../types/candidate';
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
import { getEffectiveAvatar } from '../utils/radianAvatars';
import {
  MOCK_PENDING_LEAVE_REQUESTS,
  MOCK_PENDING_TIMESHEETS,
  MOCK_PERFORMANCE_REVIEWS,
  MOCK_TEAM_BIRTHDAYS,
  MOCK_TEAM_ANNIVERSARIES
} from '../services/mockData';
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
      avatar: getEffectiveAvatar(candidate, candidate.gender, `${candidate.firstName} ${candidate.lastName}`),
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
    // 1. Chart Visualizations
    if (dashlet.type === 'chart' || dashlet.chartType) {
      const resolvedChartData = dashlet.dataSource
        ? resolveChartDataFromSource(dashlet.dataSource, candidates, tasks, getAssets())
        : (dashlet.chartData && dashlet.chartData.length > 0 ? dashlet.chartData : undefined);

      return (
        <Card className="h-full w-full flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {dashlet.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {dashlet.description}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
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

    // 2. Manager Team Checklist
    if (dashlet.id === 'mgr_widget_team_checklist' || dashlet.id === 'mgr_team_action_items') {
      return (
        <Card className="h-full w-full flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Manager Action &amp; Kickoff Checklist
                </h3>
                <p className="text-xs text-slate-500">Day-1 gates &amp; team readiness items</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              {checklist.filter((c) => c.completed).length} / {checklist.length} Done
            </span>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2 flex-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    item.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-teal-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-medium leading-tight">{item.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 3. Team Members Roster
    if (dashlet.id === 'mgr_widget_team_roster' || dashlet.id === 'mgr_team_members' || dashlet.id === 'list_recent_arrivals') {
      return (
        <Card className="h-full w-full flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Direct Reports &amp; Team Roster ({teamMembers.length} Members)
                </h2>
                <p className="text-xs text-slate-500">Live progress rings &amp; dossier inspections</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigateTo('directory')}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 shrink-0"
              >
                View Directory
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {teamMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleOpenDossier(member)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <Avatar
                      src={getEffectiveAvatar(member, member.gender, `${member.firstName} ${member.lastName}`)}
                      name={`${member.firstName} ${member.lastName}`}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                          {member.firstName} {member.lastName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 shrink-0">
                          {member.workModel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate">
                        {member.jobTitle} • {member.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="flex flex-col items-end gap-1 w-24">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {member.progress}% Done
                      </span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            member.progress >= 100 ? 'bg-emerald-500' : 'bg-teal-600'
                          )}
                          style={{ width: `${member.progress}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Eye className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDossier(member);
                      }}
                      className="text-xs text-teal-600 dark:text-teal-400 py-1 px-2.5 h-auto"
                    >
                      Dossier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 4. Pending Leave Requests
    if (dashlet.id === 'mgr_pending_leave_requests') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Leave Requests</h3>
              <p className="text-xs text-slate-500">Requires manager clearance</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">2 Requests</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_PENDING_LEAVE_REQUESTS.map((l) => (
                <div key={l.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{l.name}</span>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">{l.type}</span>
                    <span className="text-[10px] text-slate-400 block">{l.dates} • {l.reason}</span>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button type="button" className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
                      Approve
                    </button>
                    <button type="button" className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 5. Pending Timesheets
    if (dashlet.id === 'mgr_pending_timesheets') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Timesheets</h3>
              <p className="text-xs text-slate-500">Weekly project hours verification</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700">2 Submitted</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_PENDING_TIMESHEETS.map((ts) => (
                <div key={ts.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{ts.name}</span>
                    <span className="text-[11px] text-slate-500">{ts.project} • {ts.period}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{ts.hours}</span>
                    <button type="button" className="px-2 py-1 text-[10px] font-bold rounded bg-teal-600 text-white hover:bg-teal-700 cursor-pointer">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 6. Performance Reviews Due
    if (dashlet.id === 'mgr_performance_reviews_due') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance Reviews Due</h3>
              <p className="text-xs text-slate-500">1-on-1 appraisals &amp; scoring</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">2 Due</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_PERFORMANCE_REVIEWS.map((r) => (
                <div key={r.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{r.name}</span>
                    <span className="text-[11px] text-slate-500">{r.cycle} • {r.status}</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">Due {r.due}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 7. Team Birthdays & Anniversaries
    if (dashlet.id === 'mgr_upcoming_birthdays') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Team Birthdays
            </h3>
            <span className="text-[11px] text-slate-400">October 2026</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_TEAM_BIRTHDAYS.map((b) => (
                <div key={b.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{b.name}</span>
                    <span className="text-[11px] text-slate-500">{b.dept}</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-600">{b.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'mgr_upcoming_anniversaries') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Team Work Anniversaries
            </h3>
            <span className="text-[11px] text-slate-400">Next 60 Days</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_TEAM_ANNIVERSARIES.map((a) => (
                <div key={a.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{a.name}</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">{a.milestone}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{a.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 8. Fallback List
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
            Active stream configured for {dashlet.title}.
          </CardContent>
        </Card>
      );
    }

    // 9. Metric Dashlets
    return (
      <StatCard
        label={dashlet.title}
        value={dashlet.customData?.value || '14'}
        change={dashlet.customData?.badge || '100% Staffed'}
        isPositive={dashlet.customData?.badgePositive ?? true}
        description={dashlet.customData?.subtitle || dashlet.description}
      />
    );
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12 flex-1">
      <PageHeader
        title="Manager Dashboard"
        description="Team operations"
        actions={
          <div className="flex items-center gap-2">
            {isCustomizing && (
              <IconButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPersonaLayout('MANAGER');
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
