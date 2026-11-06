import React, { useState, useEffect } from 'react';
import { Modal } from '../organisms';
import { Button } from '../atoms';
import { Avatar } from '../atoms';
import { StatusIndicator } from '../atoms';
import { ProgressBar } from '../molecules';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { DocumentViewerModal, DocumentItem } from './DocumentViewerModal';
import {
  User,
  FileText,
  FileCheck2,
  ShieldCheck,
  Laptop,
  Building,
  CheckCircle2,
  XCircle,
  Car,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  MapPin,
  ExternalLink,
  Download,
  AlertTriangle,
  Eye,
  Clock,
  Briefcase,
  LogIn,
  LogOut
} from 'lucide-react';
import { getStoredPunchRecords, PunchRecord } from '../../services/attendanceService';

export interface EmployeeDossierData {
  id: string;
  name: string;
  gender?: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department: string;
  avatar?: string;
  startDate: string;
  workModel?: string;
  workLocation?: string;
  employmentType?: string;
  onboardingType?: 'general' | 'pre_onboarding' | 'contract' | 'contract_to_hire';
  contractDuration?: string;
  contractAgency?: string;
  contractEndDate?: string;
  contractRate?: string;
  contractTaxType?: string;
  preOnboardingStage?: string;
  targetOnboardDate?: string;
  conversionEligibilityDate?: string;
  status: string;
  progress: number;
  manager?: string;
  line1Manager?: string;
  line2Manager?: string;
  buddy?: string;
  // Step 2: Documents
  documents?: Array<{
    id: string;
    title: string;
    status: string;
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
    required?: boolean;
  }>;
  // Step 3: NDA
  nda?: {
    accepted: boolean;
    signedName?: string;
    acceptedAt?: string;
    agreementVersion?: string;
  };
  // Step 4: Corporate SSO
  corporateAccount?: {
    corporateEmail: string;
    accountStatus: string;
    ssoProvider?: string;
  };
  // Step 5 & 6: Photo & Email Signature
  photoUrl?: string;
  emailSignature?: {
    name: string;
    title: string;
    department: string;
    phone?: string;
    mobile?: string;
    tagline?: string;
  };
  // Step 7: Equipment
  equipment?: {
    laptopModel?: string;
    selectedItems?: string[];
    specialRequests?: string;
    provisioningStatus?: string;
  };
  // Step 9: Office Setup & Parking
  officeSetup?: {
    deskLocation?: string;
    accessLevel?: string;
    parkingRequired?: boolean;
    licensePlate?: string;
    permitType?: string;
  };
}

export interface EmployeeDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeDossierData;
  onApprove?: (id: string) => void;
  onRequestRevisions?: (id: string) => void;
}

export const EmployeeDossierModal: React.FC<EmployeeDossierModalProps> = ({
  isOpen,
  onClose,
  employee,
  onApprove,
  onRequestRevisions
}) => {
  const { success, warning } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'equipment' | 'compliance'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(employee.id);
    } else {
      success('Onboarding Approved', `${employee.name}'s onboarding records have been verified and finalized.`);
    }
    onClose();
  };

  const handleRequestRevisions = () => {
    if (onRequestRevisions) {
      onRequestRevisions(employee.id);
    } else {
      warning('Revisions Requested', `Notification sent to ${employee.name} to update submitted documentation.`);
    }
    onClose();
  };

  // Time & Attendance Punch Records for this specific employee
  const [attendanceRecords, setAttendanceRecords] = useState<PunchRecord[]>([]);

  useEffect(() => {
    const refreshRecords = () => {
      const all = getStoredPunchRecords();
      const matched = all.filter(
        r => r.employeeId === employee.id || r.employeeName.toLowerCase() === employee.name.toLowerCase()
      );
      if (matched.length > 0) {
        setAttendanceRecords(matched);
      } else {
        // Realistic default punches for demo employee
        setAttendanceRecords([
          {
            id: `punch-${employee.id}-1`,
            employeeId: employee.id,
            employeeName: employee.name,
            type: 'in',
            timestamp: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
            timeFormatted: '09:00 AM',
            dateFormatted: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
            location: employee.workLocation || 'San Francisco HQ - Kiosk #01',
            device: 'Enterprise Biometric Kiosk'
          },
          {
            id: `punch-${employee.id}-2`,
            employeeId: employee.id,
            employeeName: employee.name,
            type: 'out',
            timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
            timeFormatted: '12:30 PM',
            dateFormatted: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
            location: employee.workLocation || 'San Francisco HQ - Kiosk #01',
            device: 'Enterprise Biometric Kiosk'
          }
        ]);
      }
    };

    refreshRecords();
    window.addEventListener('hr-attendance-updated', refreshRecords);
    return () => window.removeEventListener('hr-attendance-updated', refreshRecords);
  }, [employee.id, employee.name, employee.workLocation]);

  const latestPunch = attendanceRecords.length > 0 ? attendanceRecords[attendanceRecords.length - 1] : null;
  const isClockedIn = latestPunch ? latestPunch.type === 'in' : false;

  // Fallback defaults for demo resilience
  const docs = employee.documents || [
    { id: '1', title: 'Government-issued Photo ID', status: 'verified', fileName: `${employee.name.toLowerCase().replace(/\s+/g, '_')}_id.pdf`, fileSize: '2.4 MB', uploadedAt: '2026-09-15', required: true },
    { id: '2', title: 'Educational Degree / Transcripts', status: 'verified', fileName: 'degree_certificate.pdf', fileSize: '1.8 MB', uploadedAt: '2026-09-15', required: true },
    { id: '3', title: 'Bank Account (Direct Deposit)', status: 'submitted', fileName: 'voided_check.pdf', fileSize: '850 KB', uploadedAt: '2026-09-16', required: true },
    { id: '4', title: 'Form W-4 Federal Tax Withholding', status: 'submitted', fileName: 'form_w4_signed.pdf', fileSize: '1.1 MB', uploadedAt: '2026-09-16', required: true }
  ];

  const ndaInfo = employee.nda || {
    accepted: true,
    signedName: employee.name,
    acceptedAt: '2026-09-16T14:32:00Z',
    agreementVersion: 'v2026.2 (Enterprise Proprietary Information Agreement)'
  };

  const equip = employee.equipment || {
    laptopModel: 'MacBook Pro 16" (M3 Max, 64GB)',
    selectedItems: ['Laptop Pro 16"', 'Ergonomic Keyboard', 'Precision Wireless Mouse', 'Dual 4K Displays'],
    specialRequests: 'Prefers ANSI US keyboard layout and dual Thunderbolt cables.',
    provisioningStatus: 'Configured'
  };

  const office = employee.officeSetup || {
    deskLocation: 'Building 2 - 4th Floor (Quiet Engineering Zone)',
    accessLevel: 'Tier 3 (Executive Floor + 24/7 Server Lab Clearance)',
    parkingRequired: true,
    licensePlate: '7XYZ890',
    permitType: 'Electric Vehicle Reserved Charging Bay'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Onboarding Dossier"
      description={`Review all submitted data, uploaded documents, signed agreements, and workplace preferences for ${employee.name}.`}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          <Button
            variant="secondary"
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
            onClick={handleRequestRevisions}
          >
            Request Revisions
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 font-bold px-5"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleApprove}
            >
              Approve & Finalize Onboarding
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-left">
        {/* Hero Employee Summary Card */}
        <div className="p-5 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/50 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar
              src={employee.avatar || employee.photoUrl}
              name={employee.name}
              size="lg"
              className="w-16 h-16 ring-4 ring-white dark:ring-slate-900 shadow-md"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  {employee.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300">
                  {employee.id}
                </span>
                {employee.onboardingType === 'contract' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-300/60">
                    <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Direct Contract
                  </span>
                ) : employee.onboardingType === 'contract_to_hire' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300/60">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Contract to Hire
                  </span>
                ) : employee.onboardingType === 'pre_onboarding' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Pre-onboarding
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> General Onboarding
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                {employee.jobTitle} • {employee.department}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${employee.email}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                  >
                    {employee.email}
                  </a>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Start: <strong>{formatDate(employee.startDate)}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {employee.workLocation || 'San Francisco HQ'} ({employee.workModel || 'Hybrid'})
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-[150px] self-end sm:self-center shrink-0">
            <ProgressBar progress={employee.progress} label="Progress" size="md" />
          </div>
        </div>

        {/* Engagement & Contract Parameters Banner (if applicable) */}
        {(employee.onboardingType === 'contract' || employee.onboardingType === 'contract_to_hire' || employee.onboardingType === 'pre_onboarding') && (
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Engagement &amp; Contract Parameters</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {employee.contractDuration && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Contract Duration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{employee.contractDuration}</span>
                </div>
              )}
              {employee.contractEndDate && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Contract Expiration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{formatDate(employee.contractEndDate)}</span>
                </div>
              )}
              {employee.contractRate && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Pay / Billing Rate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{employee.contractRate}</span>
                </div>
              )}
              {employee.contractTaxType && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Tax Classification</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{employee.contractTaxType}</span>
                </div>
              )}
              {employee.contractAgency && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Agency / Contracting Entity</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{employee.contractAgency}</span>
                </div>
              )}
              {employee.conversionEligibilityDate && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Conversion Evaluation Date</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 block">{formatDate(employee.conversionEligibilityDate)}</span>
                </div>
              )}
              {employee.preOnboardingStage && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Pre-boarding Stage</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">{employee.preOnboardingStage}</span>
                </div>
              )}
              {employee.targetOnboardDate && (
                <div>
                  <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Target Joining Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{formatDate(employee.targetOnboardDate)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personal & Contact Profile */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal &amp; Employment Information</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Legal Full Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 truncate block">{employee.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Gender</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 truncate block">{employee.gender || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Corporate Email</span>
              <a
                href={`mailto:${employee.email}`}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline truncate block transition-colors"
              >
                {employee.email}
              </a>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Employment Type</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 truncate block">{employee.employmentType || 'Full-time'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Onboarding Model</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">
                {employee.onboardingType === 'contract' ? 'Fixed-Term Contract' :
                 employee.onboardingType === 'contract_to_hire' ? 'Contract to Hire' :
                 employee.onboardingType === 'pre_onboarding' ? 'Pre-onboarding' : 'General Onboarding'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Reporting Manager</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 truncate block">{employee.line1Manager || employee.manager || 'Not assigned'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Secondary / Executive Manager</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 truncate block">{employee.line2Manager || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Time & Attendance / Punch Records (HR Oversight) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Shift Attendance & Punch Records</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isClockedIn
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Live Shift State</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                {isClockedIn ? 'Active On-Duty Shift' : 'Off Duty / Clocked Out'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Total Punches Today</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                {attendanceRecords.length} Event{attendanceRecords.length !== 1 ? 's' : ''} Logged
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold">Latest Punch Event</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                {latestPunch ? `${latestPunch.type === 'in' ? 'Punch In' : 'Punch Out'} (${latestPunch.timeFormatted})` : 'None'}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Recent Punch Audit Trail
            </span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
              {attendanceRecords.slice().reverse().map((record) => (
                <div key={record.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        record.type === 'in'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {record.type === 'in' ? (
                        <LogIn className="w-3.5 h-3.5" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                          {record.type === 'in' ? 'PUNCH IN' : 'PUNCH OUT'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {record.dateFormatted} • {record.timeFormatted}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">
                        {record.location} {record.device ? `• ${record.device}` : ''}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Required Statutory Documents</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              {docs.filter((d) => d.status === 'verified' || d.status === 'submitted' || d.status === 'uploaded').length}/{docs.length} Uploaded
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {docs.map((d) => {
              const isAvailable = d.status === 'verified' || d.status === 'submitted' || d.status === 'uploaded';
              return (
                <div key={d.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 truncate">
                        {d.title}
                      </span>
                      {d.fileName && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {d.fileName} ({d.fileSize})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase shrink-0 ${
                        d.status === 'verified'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : d.status === 'submitted' || d.status === 'uploaded'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {d.status}
                    </span>

                    {isAvailable && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedDoc({
                          id: d.id,
                          type: d.title.toLowerCase().includes('id') || d.title.toLowerCase().includes('photo') ? 'id' : d.title.toLowerCase().includes('degree') ? 'degree' : d.title.toLowerCase().includes('tax') || d.title.toLowerCase().includes('w-4') ? 'w4' : 'bank',
                          name: d.title,
                          fileName: d.fileName,
                          fileSize: d.fileSize,
                          uploadedAt: d.uploadedAt,
                          status: d.status
                        })}
                        className="text-xs font-bold py-1 px-2.5 h-auto text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NDA & Corporate Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Electronic NDA & Confidentiality</span>
              </div>
              <div className="text-xs sm:text-sm space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Signed Electronically
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Legal Signature: <strong>{ndaInfo.signedName}</strong>
                </p>
                <p className="text-slate-400 text-[11px]">
                  Agreement: {ndaInfo.agreementVersion}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedDoc({
                  type: 'nda',
                  name: 'Proprietary Information & Inventions Agreement (NDA)',
                  fileName: 'signed_nda_quantira_agreement.pdf',
                  fileSize: '2.4 MB',
                  uploadedAt: ndaInfo.acceptedAt,
                  status: 'verified'
                })}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                View Signed Agreement
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Corporate SSO & Email Signature</span>
            </div>
            <div className="text-xs sm:text-sm space-y-1">
              <p className="text-slate-700 dark:text-slate-300">
                <strong>SSO Account:</strong>{' '}
                <a
                  href={`mailto:${employee.corporateAccount?.corporateEmail || employee.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                >
                  {employee.corporateAccount?.corporateEmail || employee.email}
                </a>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Identity Provider:</strong> Okta Enterprise SSO (Active)
              </p>
              <p className="text-slate-500 text-[11px]">
                Tagline: &quot;{employee.emailSignature?.tagline || 'Building the next generation of enterprise systems'}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Hardware Selection & Office Facility Setup */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Laptop className="w-4 h-4 text-purple-600" />
            <span>IT Equipment & Office Facility Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                Selected Hardware:
              </span>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {equip.selectedItems ? equip.selectedItems.join(', ') : 'Laptop Pro 16", Ergonomic Keyboard, Precision Wireless Mouse'}
              </p>
              {equip.specialRequests && (
                <p className="text-slate-400 text-[11px] mt-1">
                  <strong>Notes:</strong> {equip.specialRequests}
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                Desk & Parking Facility:
              </span>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                <strong>Desk:</strong> {office.deskLocation}
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {office.parkingRequired
                    ? `Permit Issued: Plate ${office.licensePlate} (${office.permitType || 'Reserved'})`
                    : 'No parking permit requested'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal for HR Dossier Inspection */}
      <DocumentViewerModal
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        employeeName={employee.name}
        jobTitle={employee.jobTitle}
        department={employee.department}
        startDate={employee.startDate}
        employeeId={employee.id}
        signedName={ndaInfo.signedName || employee.name}
        acceptedAt={ndaInfo.acceptedAt}
        agreementVersion={ndaInfo.agreementVersion}
        photoUrl={employee.avatar || employee.photoUrl}
      />
    </Modal>
  );
};
