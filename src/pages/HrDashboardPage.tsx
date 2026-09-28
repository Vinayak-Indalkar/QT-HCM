import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useOnboardingFlow } from '../context/OnboardingFlowContext';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
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
import { AddEmployeeView } from '../components/employee/AddEmployeeView';
import { ShareLinkModal } from '../components/modals/ShareLinkModal';
import { EmployeeDossierModal, EmployeeDossierData } from '../components/modals/EmployeeDossierModal';
import { EmployeeProfileView } from '../components/employee/EmployeeProfileView';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';
import { Candidate } from '../types/candidate';
import { formatDate } from '../utils/formatters';
import { getAssets } from '../services/assetService';
import { getStoredPunchRecords, PunchRecord } from '../services/attendanceService';
import { getEffectiveAvatar } from '../utils/radianAvatars';
import {
  MOCK_PROBATION_REVIEWS,
  MOCK_PENDING_DOCS,
  MOCK_UPCOMING_BIRTHDAYS,
  MOCK_WORK_ANNIVERSARIES,
  MOCK_HR_ACTIONS
} from '../services/mockData';
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
      avatar: (isLiveFlow && activeFlowData.photo?.photoUrl) || getEffectiveAvatar(cand, cand.gender, `${cand.firstName} ${cand.lastName}`),
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

    // 2. Attendance Stream
    if (dashlet.id === 'hr_widget_attendance_stream') {
      return (
        <Card className="overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700 dark:border-slate-800 h-full w-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Attendance &amp; Shift Stream
                </h2>
                <p className="text-xs text-slate-500">Real-time punch activity feed</p>
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
                  className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
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
    }

    // 3. Roster Table
    if (dashlet.id === 'hr_widget_roster_table' || dashlet.id === 'list_recent_arrivals') {
      return (
        <div className="space-y-4 h-full w-full flex flex-col justify-between">
          <Card className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees by name, role, department, ID..."
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Verification">Verification</option>
                <option value="IT Provisioning">IT Provisioning</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </Card>

          <Card className="overflow-hidden flex-1 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Employee Onboarding Pipeline ({filteredEmployees.length} Records)
                </h2>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.slice(0, 4).map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleOpenEmployeeDashboard(emp)}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={emp.avatar} name={emp.name} size="md" className="w-10 h-10 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {emp.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {emp.id}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {emp.role} • {emp.department}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-3 self-end sm:self-center shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          emp.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : emp.status === 'Verification'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {emp.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenEmployeeDashboard(emp)}
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
                        title="View Employee Workspace"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // 4. Specific HR Lists
    if (dashlet.id === 'hr_probation_review_due') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Probation Review Due</h3>
              <p className="text-xs text-slate-500">Appraisals queue</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">3 Due</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_PROBATION_REVIEWS.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                    <span className="text-[11px] text-slate-500">{item.role} • Mgr: {item.manager}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">Due: {item.dueDate}</span>
                    <button type="button" onClick={() => success('Appraisal Dispatched', `Sent probation review form for ${item.name}`)} className="text-[10px] text-blue-600 hover:underline cursor-pointer">
                      Send Review Form
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'hr_documents_pending') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Documents Pending</h3>
              <p className="text-xs text-slate-500">Missing proofs</p>
            </div>
            <button
              type="button"
              onClick={() => success('Reminders Dispatched', 'Sent bulk document upload reminder emails.')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Notify All
            </button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_PENDING_DOCS.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400">{item.missing}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                    {item.daysWaiting}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'hr_upcoming_birthdays') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Upcoming Birthdays
            </h3>
            <span className="text-[11px] text-slate-400">Next 30 Days</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_UPCOMING_BIRTHDAYS.map((b) => (
                <div key={b.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{b.name}</span>
                    <span className="text-[11px] text-slate-500">{b.dept}</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{b.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'hr_upcoming_work_anniversaries') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Upcoming Work Anniversaries
            </h3>
            <span className="text-[11px] text-slate-400">October 2026</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_WORK_ANNIVERSARIES.map((a) => (
                <div key={a.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{a.name}</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{a.milestone} • {a.dept}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{a.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dashlet.id === 'hr_hr_action_items') {
      return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              HR Operations Action Items
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700">3 Items</span>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_HR_ACTIONS.map((act) => (
                <div key={act.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">{act.task}</span>
                    <span className="text-[10px] text-slate-400">Deadline: {act.due}</span>
                  </div>
                  <span className={cn(
                    'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded',
                    act.priority === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  )}>
                    {act.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // 5. Fallback List Dashlet
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

    // 6. Metric Dashlets
    return (
      <StatCard
        label={dashlet.title}
        value={dashlet.customData?.value || '248'}
        change={dashlet.customData?.badge || '+5 this month'}
        isPositive={dashlet.customData?.badgePositive ?? true}
        description={dashlet.customData?.subtitle || dashlet.description}
      />
    );
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12 flex-1">
      <PageHeader
        title="HR Admin Dashboard"
        description="Workforce pipeline"
        actions={
          <div className="flex items-center gap-2">
            {isCustomizing && (
              <IconButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPersonaLayout('HR');
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
