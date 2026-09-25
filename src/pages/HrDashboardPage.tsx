import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useOnboardingFlow } from '../context/OnboardingFlowContext';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { AddEmployeeView } from '../components/employee/AddEmployeeView';
import { ShareLinkModal } from '../components/modals/ShareLinkModal';
import { EmployeeDossierModal, EmployeeDossierData } from '../components/modals/EmployeeDossierModal';
import { EmployeeProfileView } from '../components/employee/EmployeeProfileView';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';
import { Candidate } from '../types/candidate';
import { formatDate } from '../utils/formatters';
import { getAssets } from '../services/assetService';
import { getStoredPunchRecords, PunchRecord } from '../services/attendanceService';
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
import { StatCard } from '../components/common/StatCard';
import {
  Users,
  Eye,
  Search,
  Filter,
  UserPlus,
  Share2,
  CheckCircle2,
  Clock,
  Laptop,
  LogIn,
  LogOut,
  Sparkles,
  BarChart3,
  Layers,
  Activity,
  Sliders,
  RefreshCw
} from 'lucide-react';

export const HrDashboardPage: React.FC = () => {
  const { candidates, tasks, updateCandidate, navigateTo } = useOnboarding();
  const { data: activeFlowData, loadEmployee } = useOnboardingFlow();
  const { success, warning } = useToast();
  const { setRole } = useRole();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddingEmployee, setIsAddingEmployee] = useState<boolean>(false);
  const [dossierEmployee, setDossierEmployee] = useState<EmployeeDossierData | null>(null);
  const [viewingDashboardCandidate, setViewingDashboardCandidate] = useState<Candidate | null>(null);
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>(() => getStoredPunchRecords());
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dashlets, setDashlets] = useState<DashletConfig[]>(() =>
    getDashletsForPersona('HR')
  );

  const refreshDashlets = () => {
    setDashlets(getDashletsForPersona('HR'));
  };

  useEffect(() => {
    const handleUpdate = () => {
      setPunchRecords(getStoredPunchRecords());
    };
    window.addEventListener('hr-attendance-updated', handleUpdate);
    return () => window.removeEventListener('hr-attendance-updated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleDashboardUpdate = () => {
      refreshDashlets();
    };
    window.addEventListener('dashboard-config-updated', handleDashboardUpdate);
    return () => window.removeEventListener('dashboard-config-updated', handleDashboardUpdate);
  }, []);

  const [sharingEmployee, setSharingEmployee] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Normalize candidate records merged with live active flow progress
  const employeeRecords = candidates.map((cand) => {
    const isLiveFlow =
      cand.id === activeFlowData.personalInfo.employeeId ||
      cand.email === activeFlowData.personalInfo.email;

    const progress = isLiveFlow
      ? Math.round((activeFlowData.completedSteps.length / 10) * 100)
      : cand.progress;

    const status = isLiveFlow
      ? activeFlowData.status === 'Completed'
        ? 'Completed'
        : 'In Progress'
      : cand.status === 'completed'
      ? 'Completed'
      : cand.status === 'verification'
      ? 'Verification'
      : cand.status === 'equipment_provisioning'
      ? 'IT Provisioning'
      : cand.status === 'document_submission'
      ? 'Doc Submission'
      : 'In Progress';

    return {
      id: cand.id,
      name: `${cand.firstName} ${cand.lastName}`,
      email: cand.email,
      role: cand.jobTitle,
      department: cand.department,
      status,
      progress,
      progressSteps: isLiveFlow
        ? `${activeFlowData.completedSteps.length} / 10`
        : `${Math.round((cand.progress / 100) * 10)} / 10`,
      avatar: cand.avatarUrl || activeFlowData.photo.photoUrl,
      startDate: cand.startDate,
      isLiveFlow,
      rawCandidate: cand
    };
  });

  const filteredEmployees = employeeRecords.filter((emp) => {
    if (filterStatus !== 'ALL' && emp.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open the comprehensive dossier modal with all employee submitted data
  const handleOpenDossier = (emp: (typeof employeeRecords)[0]) => {
    const isLive = emp.isLiveFlow;
    const cand = emp.rawCandidate;

    const dossier: EmployeeDossierData = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      jobTitle: emp.role,
      department: emp.department,
      avatar: emp.avatar,
      startDate: emp.startDate,
      workLocation: cand.officeLocation || 'San Francisco HQ',
      workModel: cand.workModel || 'Hybrid',
      employmentType: cand.employmentType || 'Full-time',
      status: emp.status,
      progress: emp.progress,
      manager: cand.manager || 'Marcus Brody',
      documents: isLive
        ? activeFlowData.documents.map((d) => ({
            id: d.id,
            title: d.name,
            status: d.status,
            fileName: d.fileName,
            fileSize: d.fileSize,
            uploadedAt: d.uploadedAt,
            required: d.required
          }))
        : cand.documents.map((d) => ({
            id: d.id,
            title: d.title,
            status: d.status,
            fileName: d.fileName,
            fileSize: d.fileSize,
            uploadedAt: d.uploadedAt,
            required: d.required
          })),
      nda: isLive
        ? activeFlowData.nda
        : {
            accepted: true,
            signedName: emp.name,
            acceptedAt: '2026-09-15T14:30:00Z',
            agreementVersion: 'v2026.2 (Enterprise Proprietary Information Agreement)'
          },
      corporateAccount: isLive
        ? activeFlowData.corporateAccount
        : {
            corporateEmail: emp.email,
            accountStatus: 'Provisioned',
            ssoProvider: 'Okta Enterprise SSO'
          },
      photoUrl: emp.avatar,
      emailSignature: isLive
        ? activeFlowData.emailSignature
        : {
            name: emp.name,
            title: emp.role,
            department: emp.department,
            tagline: 'Building the next generation of enterprise systems'
          },
      equipment: isLive
        ? {
            laptopModel: 'MacBook Pro 16" (M3 Max, 64GB)',
            selectedItems: activeFlowData.equipment.selectedEquipment,
            specialRequests: activeFlowData.equipment.specialRequests
          }
        : {
            laptopModel: cand.equipment?.laptopModel || 'MacBook Pro 16"',
            selectedItems: cand.equipment?.accessories || ['Laptop Pro 16"', 'Ergonomic Keyboard', 'Wireless Mouse'],
            specialRequests: cand.equipment?.notes
          },
      officeSetup: isLive
        ? activeFlowData.officeSetup
        : {
            deskLocation: 'Building 2 - 4th Floor (Quiet Engineering Zone)',
            accessLevel: 'Tier 3 Clearance',
            parkingRequired: true,
            licensePlate: '7XYZ890',
            permitType: 'Electric Vehicle Reserved Charging Bay'
          }
    };

    setDossierEmployee(dossier);
  };

  const handleOpenEmployeeDashboard = (emp: (typeof employeeRecords)[0]) => {
    const matched = candidates.find((c) => c.id === emp.id);
    if (matched) {
      setViewingDashboardCandidate(matched);
    } else {
      const parts = emp.name.split(' ');
      setViewingDashboardCandidate({
        id: emp.id,
        firstName: parts[0],
        lastName: parts.slice(1).join(' ') || '',
        name: emp.name,
        email: emp.email,
        jobTitle: emp.role,
        department: emp.department,
        status: emp.status === 'Completed' ? 'completed' : 'verification',
        progress: emp.progress,
        startDate: emp.startDate,
        avatarUrl: emp.avatar,
        documents: [],
        tasks: []
      } as unknown as Candidate);
    }
  };

  const handleApproveDossier = (employeeId: string) => {
    updateCandidate(employeeId, { status: 'completed', progress: 100 });
    success('Onboarding Approved', `Employee onboarding records have been verified and marked completed.`);
  };

  const handleRequestRevisions = (employeeId: string) => {
    updateCandidate(employeeId, { status: 'document_submission' });
    warning('Revision Dispatched', `Notification sent to employee requesting updated documents.`);
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

  if (isAddingEmployee) {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        <AddEmployeeView
          onBack={() => setIsAddingEmployee(false)}
          onEmployeeAdded={() => setIsAddingEmployee(false)}
        />
      </div>
    );
  }

  // Render individual dashlet content based on config ID
  const renderDashletContent = (dashlet: DashletConfig) => {
    switch (dashlet.id) {
      case 'kpi_total_employees':
      case 'hr_kpi_active_pipeline':
        return (
          <StatCard
            label="Active In Pipeline"
            value={employeeRecords.length}
            change="+3 this month"
            isPositive={true}
            description="Total enrolled employees"
            icon={<Users className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
            onClick={() => navigateTo('candidates')}
          />
        );
      case 'kpi_doc_compliance':
      case 'hr_kpi_pending_docs':
        return (
          <StatCard
            label="Pending Verification"
            value={employeeRecords.filter((e) => e.status !== 'Completed').length}
            change="Action required"
            isPositive={false}
            description="Requires candidate/HR action"
            icon={<Clock className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
            onClick={() => navigateTo('compliance')}
          />
        );
      case 'kpi_active_onboarding':
      case 'hr_kpi_day1_ready':
        return (
          <StatCard
            label="Ready for Day 1"
            value={employeeRecords.filter((e) => e.status === 'Completed').length}
            change="100% Onboarding verified"
            isPositive={true}
            description="Day 1 Orientation ready"
            icon={<CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
            onClick={() => navigateTo('candidates')}
          />
        );
      case 'kpi_asset_pool':
      case 'hr_kpi_it_staging':
        return (
          <StatCard
            label="Live Attendance"
            value={punchRecords.length > 0 && punchRecords[punchRecords.length - 1].type === 'in' ? '1 On Clock' : 'Active'}
            change={punchRecords.length > 0 ? `Latest: ${punchRecords[punchRecords.length - 1].employeeName}` : 'Time-card tracking active'}
            isPositive={true}
            description="Shift & Punch Status"
            icon={<Activity className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
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
            icon={<Clock className="w-5 h-5" aria-hidden="true" />}
            iconBg="bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400"
          />
        );
      case 'hr_widget_attendance_stream':
        return (
          <Card className="overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700 dark:border-slate-800 h-full w-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Employee Attendance &amp; Shift Logs
                  </h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                {punchRecords.slice().reverse().map((record) => (
                  <div
                    key={record.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        record.type === 'in'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {record.type === 'in' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {record.employeeName}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {record.employeeId}
                          </span>
                          <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                            record.type === 'in'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {record.type === 'in' ? 'Punch In' : 'Punch Out'}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                          {record.dateFormatted} at <strong>{record.timeFormatted}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block">
                        {record.location}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {record.device || 'Web Session'} • Verified Time-Card
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'hr_widget_roster_table':
      case 'list_recent_arrivals':
        return (
          <div className="space-y-4 h-full w-full flex flex-col justify-between">
            {/* Filter and Search Bar */}
            <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employees by name, role, department, ID..."
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Verification">Verification</option>
                  <option value="IT Provisioning">IT Provisioning</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </Card>

            {/* Employees Table Card */}
            <Card className="overflow-hidden flex-1 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Employee Onboarding Pipeline ({filteredEmployees.length} Records)
                  </h2>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleOpenEmployeeDashboard(emp)}
                      className="p-4 sm:p-5 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar src={emp.avatar} name={emp.name} size="md" className="w-11 h-11 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {emp.name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {emp.id}
                            </span>
                            {emp.isLiveFlow && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                Active Demo
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {emp.role} • {emp.department}
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-4 sm:gap-6 self-end sm:self-center shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col items-end text-xs sm:text-sm">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Start: {formatDate(emp.startDate)}
                          </span>
                          <span className="text-xs text-slate-400">
                            Progress: <strong>{emp.progressSteps}</strong> Steps ({emp.progress}%)
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                            emp.status === 'Completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : emp.status === 'Verification'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {emp.status}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSharingEmployee({
                                id: emp.id,
                                name: emp.name,
                                email: emp.email,
                                role: emp.role
                              })
                            }
                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                            title="Share Onboarding Link"
                            aria-label="Share Onboarding Link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEmployeeDashboard(emp)}
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
                            title="View Employee Dashboard"
                            aria-label="View Employee Dashboard"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
            change={dashlet.customData?.badge || 'HR Metric'}
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
        title="HR Admin Dashboard"
        description="Monitor candidates across the 10-step onboarding pipeline, inspect submitted paperwork, verify compliance, and customize your live operational dashlets."
        actions={
          <div className="flex items-center gap-2">
            {isCustomizing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPersonaLayout('HR');
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
              role="HR"
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

      {/* Employee Dossier Modal */}
      {dossierEmployee && (
        <EmployeeDossierModal
          isOpen={!!dossierEmployee}
          onClose={() => setDossierEmployee(null)}
          employee={dossierEmployee}
          onApprove={handleApproveDossier}
          onRequestRevisions={handleRequestRevisions}
        />
      )}

      {/* Share Onboarding Link Modal */}
      {sharingEmployee && (
        <ShareLinkModal
          isOpen={!!sharingEmployee}
          onClose={() => setSharingEmployee(null)}
          employee={sharingEmployee}
          onOpenDirectly={() => {
            loadEmployee(sharingEmployee.id, {
              firstName: sharingEmployee.name.split(' ')[0],
              lastName: sharingEmployee.name.split(' ').slice(1).join(' ') || 'Candidate',
              email: sharingEmployee.email,
              corporateEmail: sharingEmployee.email,
              jobTitle: sharingEmployee.role
            });
            setRole('EMPLOYEE');
            navigateTo('wizard');
            setSharingEmployee(null);
          }}
        />
      )}
    </div>
  );
};
