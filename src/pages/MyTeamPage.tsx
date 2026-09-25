import React, { useState, useMemo, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Candidate } from '../types/candidate';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { EmployeeDossierModal, EmployeeDossierData } from '../components/modals/EmployeeDossierModal';
import { EmployeeProfileView } from '../components/employee/EmployeeProfileView';
import { formatDate } from '../utils/formatters';
import { getStoredPunchRecords, PunchRecord } from '../services/attendanceService';
import {
  Users,
  UserCheck,
  Eye,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Search
} from 'lucide-react';

export const MyTeamPage: React.FC = () => {
  const { candidates } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'ready'>('all');
  const [selectedDossier, setSelectedDossier] = useState<EmployeeDossierData | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Candidate | null>(null);
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>(() => getStoredPunchRecords());

  // Listen to live punches across the portal
  useEffect(() => {
    const handleUpdate = () => {
      setPunchRecords(getStoredPunchRecords());
    };
    window.addEventListener('hr-attendance-updated', handleUpdate);
    return () => window.removeEventListener('hr-attendance-updated', handleUpdate);
  }, []);

  // Filter team members assigned directly to Marcus Brody / Engineering management
  const assignedTeam = useMemo(() => {
    return candidates.filter((c) => {
      const isAssigned =
        c.manager?.toLowerCase().includes('marcus') ||
        c.managerEmail?.toLowerCase().includes('brody') ||
        c.department?.toLowerCase() === 'engineering';
      return isAssigned;
    });
  }, [candidates]);

  // Filtered by search & status
  const filteredTeam = useMemo(() => {
    return assignedTeam.filter((m) => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        m.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'in_progress') {
        return m.status !== 'completed';
      }
      if (statusFilter === 'ready') {
        return m.status === 'completed' || m.progress >= 80;
      }
      return true;
    });
  }, [assignedTeam, searchQuery, statusFilter]);

  const activeOnboardingCount = assignedTeam.filter((m) => m.status !== 'completed').length;
  const readyCount = assignedTeam.filter((m) => m.status === 'completed' || m.progress >= 80).length;

  // Check clock-in state for an employee
  const getEmployeeAttendance = (member: Candidate) => {
    const records = punchRecords.filter(
      (r) => r.employeeId === member.id || r.employeeName.toLowerCase() === `${member.firstName} ${member.lastName}`.toLowerCase()
    );
    if (records.length > 0) {
      const last = records[records.length - 1];
      return {
        isClockedIn: last.type === 'in',
        lastPunchTime: last.timeFormatted,
        lastPunchType: last.type === 'in' ? 'Clocked In' : 'Clocked Out'
      };
    }
    // Realistic default for demo team members
    const isMockClockedIn = member.progress >= 80;
    return {
      isClockedIn: isMockClockedIn,
      lastPunchTime: isMockClockedIn ? '09:00 AM' : 'Yesterday',
      lastPunchType: isMockClockedIn ? 'Clocked In' : 'Off Duty'
    };
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
        deskLocation: 'Building 2 - 4th Floor (Engineering Pod A)',
        accessLevel: 'Tier 3 Clearance',
        parkingRequired: true,
        licensePlate: '7XYZ890',
        permitType: 'Reserved Engineering Bay'
      }
    });
  };

  if (viewingEmployee) {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        <EmployeeProfileView
          employee={viewingEmployee}
          readOnly={true}
          onBack={() => setViewingEmployee(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-16">
      {/* Header */}
      <PageHeader
        title="My Team"
      />

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team members by name, title, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-bold mr-1">Status:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({assignedTeam.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Onboarding ({activeOnboardingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ready'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Completed ({readyCount})
          </button>
        </div>
      </div>

      {/* Team Members Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeam.map((member) => {
          const attendance = getEmployeeAttendance(member);

          return (
            <Card
              key={member.id}
              className="hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800 flex flex-col justify-between group"
            >
              <CardContent className="p-5 sm:p-6 space-y-4">
                {/* Header: Avatar, Name & Live Attendance */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar
                        src={member.avatarUrl}
                        name={`${member.firstName} ${member.lastName}`}
                        size="lg"
                        className="w-14 h-14 ring-2 ring-blue-500/20 group-hover:ring-blue-500 transition-all"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                          attendance.isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        title={attendance.isClockedIn ? 'Clocked In (Active)' : 'Clocked Out'}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {member.firstName} {member.lastName}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {member.jobTitle}
                      </span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                        {member.department}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {member.id}
                  </span>
                </div>

                {/* Shift & Onboarding Status Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Attendance badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      attendance.isClockedIn
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        attendance.isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    {attendance.isClockedIn ? `Clocked In (${attendance.lastPunchTime})` : 'Clocked Out'}
                  </span>

                  {/* Work Model */}
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    {member.workModel || 'Hybrid'}
                  </span>
                </div>

                {/* Details list */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Start Date
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                      {formatDate(member.startDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      Location
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {member.officeLocation || 'San Francisco HQ'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      Email
                    </span>
                    <a
                      href={`mailto:${member.email}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[150px] transition-colors"
                      title={`Send email to ${member.email}`}
                    >
                      {member.email}
                    </a>
                  </div>

                  {member.phone && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        Mobile
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {member.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Onboarding Progress */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Onboarding Completion</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {member.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        member.progress >= 100
                          ? 'bg-emerald-500'
                          : member.progress >= 60
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer: View Profile Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    onClick={() => setViewingEmployee(member)}
                    leftIcon={<UserCheck className="w-4 h-4" />}
                  >
                    View Employee Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredTeam.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
              No team members found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No direct reports match your current filter query. Try modifying your search or resetting filters.
            </p>
          </div>
        )}
      </div>

      {/* Employee Dossier Modal for Inspecting Team Member Profile */}
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
