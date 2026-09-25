import React, { useState, useEffect, useMemo } from 'react';
import { useOnboarding, ProfileTabId } from '../../context/OnboardingContext';
import { useOnboardingFlow } from '../../context/OnboardingFlowContext';
import { useToast } from '../../context/ToastContext';
import { useRole } from '../../context/RoleContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { getCustomFields, CustomProfileField } from '../../services/customFieldsService';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { ProgressRing } from '../common/ProgressRing';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  RADIAN_PERSONA_AVATARS,
  getRadianAvatarByName,
  getRandomRadianAvatar
} from '../../utils/radianAvatars';
import { DocumentViewerModal, DocumentItem, downloadDocumentFile } from '../modals/DocumentViewerModal';
import { AddDocumentModal } from '../modals/AddDocumentModal';
import { EditDocumentModal } from '../modals/EditDocumentModal';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmployeeIdBadge } from '../organisms/EmployeeIdBadge';
import { ExecutiveBusinessCard } from '../organisms/ExecutiveBusinessCard';
import { Candidate } from '../../types/candidate';
import { ITAsset } from '../../types/asset';
import { EmployeeDashboardPage } from '../../pages/EmployeeDashboardPage';
import { cn } from '../../utils/cn';
import { getAssets, updateAsset, INITIAL_ENTERPRISE_ASSETS } from '../../services/assetService';
import { getOnboardingPolicyDocuments } from '../../services/corporateDocumentService';
import {
  getStoredAttendanceState,
  punchIn,
  punchOut,
  getStoredPunchRecords,
  PunchRecord,
  EmployeeAttendanceState
} from '../../services/attendanceService';
import {
  LayoutGrid,
  Search,
  User,
  MapPin,
  Laptop,
  Building,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  Car,
  BadgeCheck,
  FileText,
  KeyRound,
  AtSign,
  Printer,
  Download,
  Lock,
  Phone,
  PhoneCall,
  Mail,
  Briefcase,
  FileCheck,
  Eye,
  EyeOff,
  ChevronRight,
  Copy,
  Check,
  HardDrive,
  Cpu,
  Monitor,
  Radio,
  Key,
  Upload,
  PenTool,
  RotateCcw,
  Trash2,
  Type,
  Image as ImageIcon,
  Sparkles,
  Clock,
  LogIn,
  LogOut,
  History,
  Plus,
  Pencil,
  Save,
  CreditCard,
  QrCode,
  Globe,
  X,
  AlertCircle,
  AlertTriangle,
  HeartHandshake,
  ArrowLeft,
  ShieldAlert,
  Camera,
  UploadCloud,
  Filter,
  FileSpreadsheet,
  Tag,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export type { ProfileTabId };

interface ProfileTabConfig {
  id: ProfileTabId;
  label: string;
  icon: React.ElementType;
}

const PROFILE_TABS: ProfileTabConfig[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'basic', label: 'Basic Information', icon: User },
  { id: 'contact', label: 'Contact & Address', icon: MapPin },
  { id: 'emergency', label: 'Dependents & Emergency Contacts', icon: Users },
  { id: 'employment', label: 'Employment Information', icon: Briefcase },
  { id: 'reporting', label: 'Manager & Reporting', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'signature', label: 'Signature', icon: AtSign },
  { id: 'assets', label: 'Assets', icon: Laptop },
  { id: 'history', label: 'History & Activity', icon: History },
  { id: 'password', label: 'Change Password', icon: Lock }
];

export interface ProfileHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'Demographics' | 'Contact & Address' | 'Family & Dependents' | 'Documents & Compliance' | 'Assets & IT' | 'Security & SSO' | 'Attendance' | 'Role & Management' | 'General';
  user: string;
  details?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  email: string;
  isPrimary: boolean;
}

export interface DependentRecord {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
}

const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'emg-1',
    name: 'Sarah Doe',
    relationship: 'Spouse',
    phone: '+1 (415) 555-0142',
    altPhone: '+1 (415) 555-0199',
    email: 'sarah.doe@example.com',
    isPrimary: true
  },
  {
    id: 'emg-2',
    name: 'Michael Doe',
    relationship: 'Brother',
    phone: '+1 (415) 555-0188',
    altPhone: '+1 (415) 555-0189',
    email: 'michael.doe@example.com',
    isPrimary: false
  }
];

const INITIAL_DEPENDENTS: DependentRecord[] = [
  {
    id: 'dep-1',
    name: 'Emily Doe',
    relationship: 'Spouse',
    dateOfBirth: '1995-03-15',
    gender: 'Female',
    phone: '+1 (415) 555-0142',
    email: 'emily.doe@example.com'
  },
  {
    id: 'dep-2',
    name: 'Lucas Doe',
    relationship: 'Child',
    dateOfBirth: '2021-08-20',
    gender: 'Male',
    phone: '',
    email: ''
  }
];

const DEFAULT_SAMPLE_SIGNATURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80"><path d="M 30 55 C 50 20, 55 15, 65 35 C 75 55, 80 60, 95 40 C 110 20, 120 45, 140 45 C 160 45, 175 25, 190 35 C 205 45, 215 65, 230 45 C 245 25, 260 40, 290 30" fill="none" stroke="%231e3a8a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M 50 65 Q 160 58 280 68" fill="none" stroke="%231e3a8a" stroke-width="2" stroke-linecap="round"/></svg>`;

interface LiveClockProps {
  attendanceState: EmployeeAttendanceState;
}

const LiveHeaderClockAndElapsed: React.FC<LiveClockProps> = ({ attendanceState }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let seconds = attendanceState.todaySeconds;
  if (attendanceState.isClockedIn && attendanceState.clockInTime) {
    const live = Math.max(0, Math.floor((currentTime.getTime() - new Date(attendanceState.clockInTime).getTime()) / 1000));
    seconds += live;
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const elapsedString = `${hrs}h ${mins}m logged today`;

  // Determine Punch In and Punch Out times
  const records = getStoredPunchRecords().filter((r) => r.employeeId === attendanceState.employeeId);
  const todayStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(currentTime);
  const todayRecords = records.filter((r) => r.dateFormatted === todayStr);
  const targetRecords = todayRecords.length > 0 ? todayRecords : records;

  const inRecord = [...targetRecords].reverse().find((r) => r.type === 'in');
  const outRecord = [...targetRecords].reverse().find((r) => r.type === 'out');

  const punchInDisplay = attendanceState.isClockedIn && attendanceState.clockInTime
    ? new Date(attendanceState.clockInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : inRecord
    ? inRecord.timeFormatted
    : '--:--';

  const punchOutDisplay = attendanceState.isClockedIn
    ? '--:--'
    : outRecord
    ? outRecord.timeFormatted
    : '--:--';

  return (
    <>
      <div className="flex items-center gap-4 sm:gap-6 py-0.5">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Punch In
          </span>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {punchInDisplay}
          </span>
        </div>

        <div className="h-9 w-px bg-white/20 self-center" />

        <div className="flex flex-col text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Punch Out
          </span>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {punchOutDisplay}
          </span>
        </div>
      </div>
      <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
        <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span>•</span>
        <span className="text-emerald-300 font-bold">{elapsedString}</span>
      </div>
    </>
  );
};

const LiveCumulativeShiftBadge: React.FC<LiveClockProps> = ({ attendanceState }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (!attendanceState.isClockedIn) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [attendanceState.isClockedIn]);

  let seconds = attendanceState.todaySeconds;
  if (attendanceState.isClockedIn && attendanceState.clockInTime) {
    const live = Math.max(0, Math.floor((currentTime.getTime() - new Date(attendanceState.clockInTime).getTime()) / 1000));
    seconds += live;
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return <>{`${hrs}h ${mins}m logged today`}</>;
};

export interface EmployeeProfileViewProps {
  employee?: Candidate | null;
  readOnly?: boolean;
  onBack?: () => void;
  onEmployeeUpdated?: (updated: Candidate) => void;
  initialPrimaryTab?: 'dashboard' | 'details';
}

export const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({
  employee: initialEmployee,
  readOnly = false,
  onBack,
  onEmployeeUpdated,
  initialPrimaryTab = 'dashboard'
}) => {
  const { candidates } = useOnboarding();
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => initialEmployee?.id || '');

  useEffect(() => {
    if (initialEmployee?.id) {
      setSelectedEmpId(initialEmployee.id);
    }
  }, [initialEmployee?.id]);

  const employee = useMemo(() => {
    if (initialEmployee && candidates && candidates.length > 0 && selectedEmpId) {
      const found = candidates.find((c) => c.id === selectedEmpId);
      if (found) return found;
    }
    return initialEmployee;
  }, [initialEmployee, candidates, selectedEmpId]);

  const [primaryTab, setPrimaryTab] = useState<'dashboard' | 'details'>(initialPrimaryTab);
  const { data: flowData, updatePersonalInfo, updatePhoto } = useOnboardingFlow();
  const { success: showToastSuccess, error: showToastError } = useToast();
  const { currentRole } = useRole();
  const isManager = currentRole === 'MANAGER';
  const isManagingEmployee = Boolean(employee);
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isHrAdmin = currentRole === 'HR';
  const isHrOrSuperAdmin = isHrAdmin || isSuperAdmin;
  const canAccessDashboardTab = isHrOrSuperAdmin && Boolean(employee);
  const effectivePrimaryTab = canAccessDashboardTab ? primaryTab : 'details';

  // Profile Picture Edit State
  const avatarStorageKey = employee ? `quantira_avatar_${employee.id}` : `quantira_avatar_${currentRole}`;
  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    try {
      return localStorage.getItem(avatarStorageKey);
    } catch {
      return null;
    }
  });
  const [showEditAvatarModal, setShowEditAvatarModal] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(avatarStorageKey);
      setCustomAvatar(stored);
    } catch {
      setCustomAvatar(null);
    }
  }, [avatarStorageKey]);

  // IT Asset Assignment State for HR Admin & Super Admin
  const [enterpriseAssets, setEnterpriseAssets] = useState<ITAsset[]>(() => getAssets());
  const [showAssignAssetsModal, setShowAssignAssetsModal] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('all');

  // Generic Action Confirmation Popup
  const [actionConfirmation, setActionConfirmation] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'info' | 'warning' | 'danger' | 'success';
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const handleAssetsUpdate = () => {
      setEnterpriseAssets(getAssets());
    };
    window.addEventListener('quantira_assets_updated', handleAssetsUpdate);
    return () => window.removeEventListener('quantira_assets_updated', handleAssetsUpdate);
  }, []);



  // In "My Profile" menu, Employee, HR Admin, and Manager cannot edit employment details or reporting lines.
  // When managing an employee from the directory, HR Admin and Super Admin have full edit permissions across all sections.
  // Super Admin can also edit all sections in My Profile.
  const canEditEmploymentAndReporting = !readOnly && (
    (isManagingEmployee && (isHrAdmin || isSuperAdmin)) ||
    (!isManagingEmployee && isSuperAdmin)
  );

  // Employees cannot edit basic identity information (name, DOB, etc.).
  // Only HR Admin and Super Admin can edit basic info when managing an employee or super admin self.
  const canEditBasicInfo = canEditEmploymentAndReporting;

  // Dynamic Profile Configuration based on active persona
  const effectiveFlowData = React.useMemo(() => {
    if (employee) {
      try {
        const saved = localStorage.getItem('onboarding_flow_' + employee.id);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {}
      if (employee.onboardingData) {
        return employee.onboardingData;
      }
      return {
        ...flowData,
        personalInfo: {
          ...flowData.personalInfo,
          title: employee.title || flowData.personalInfo.title,
          firstName: employee.firstName,
          middleName: employee.middleName || flowData.personalInfo.middleName,
          lastName: employee.lastName,
          name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
          preferredName: employee.preferredName || employee.firstName,
          gender: employee.gender || flowData.personalInfo.gender || 'Prefer not to say',
          dateOfBirth: employee.dateOfBirth || flowData.personalInfo.dateOfBirth || '1994-08-14',
          maritalStatus: employee.maritalStatus || flowData.personalInfo.maritalStatus || 'Single',
          nationality: employee.nationality || flowData.personalInfo.nationality || 'United States',
          bloodGroup: employee.bloodGroup || flowData.personalInfo.bloodGroup || 'O+',
          corporateEmail: employee.corporateEmail || employee.email,
          email: employee.email,
          personalEmail: employee.personalEmail || employee.email || flowData.personalInfo.personalEmail,
          phone: employee.phone || employee.contactNumber1 || flowData.personalInfo.phone || '+1 (415) 555-0199',
          contactNumber1: employee.contactNumber1 || employee.phone || flowData.personalInfo.contactNumber1 || '+1 (415) 555-0199',
          contactNumber2: employee.contactNumber2 || flowData.personalInfo.contactNumber2 || '',
          githubUsername: employee.githubUsername || flowData.personalInfo.githubUsername || '',
          linkedinUrl: employee.linkedinUrl || flowData.personalInfo.linkedinUrl || '',
          emergencyContacts: employee.emergencyContacts || flowData.personalInfo.emergencyContacts,
          dependents: employee.dependents || flowData.personalInfo.dependents,
          jobTitle: employee.jobTitle,
          department: employee.department,
          employeeId: employee.id,
          startDate: employee.startDate,
          workLocation: employee.officeLocation || 'San Francisco HQ',
          workModel: employee.workModel || flowData.personalInfo.workModel || 'Hybrid',
          employmentType: employee.employmentType || 'Full-time Regular',
          line1Manager: employee.line1Manager || employee.manager || 'Marcus Brody',
          line2Manager: employee.line2Manager || 'Alexandra Wright',
          education: (employee as any).education || 'Bachelor of Science (Computer Science & Engineering)'
        },
        photo: {
          ...flowData.photo,
          photoUrl: employee.avatarUrl || flowData.photo.photoUrl
        },
        corporateAccount: {
          ...flowData.corporateAccount,
          corporateEmail: employee.email
        },
        emailSignature: {
          ...flowData.emailSignature,
          name: `${employee.firstName} ${employee.lastName}`,
          title: employee.jobTitle,
          department: employee.department,
          mobile: employee.phone || '+1 (415) 555-0199'
        },
        equipment: {
          ...flowData.equipment,
          selectedEquipment: employee.equipment?.laptopModel
            ? [employee.equipment.laptopModel, ...(employee.equipment.accessories || [])]
            : flowData.equipment.selectedEquipment,
          specialRequests: employee.equipment?.notes || flowData.equipment.specialRequests
        },
        team: {
          ...flowData.team,
          managerName: employee.line1Manager || employee.manager || 'Marcus Brody'
        },
        officeSetup: {
          ...flowData.officeSetup,
          deskLocation: 'Building 2 - 4th Floor (Quiet Engineering Zone)',
          accessCardLevel: 'Engineering Floor + 24/7 Data Lab Clearance',
          parkingRequired: true,
          licensePlate: '7XYZ890',
          permitType: 'Standard Vehicle Reserved Bay',
          lockerRequired: true,
          specialAccommodations: 'Standard ergonomic workstation configuration'
        }
      };
    }
    return flowData;
  }, [employee, flowData]);

  const effectiveProfile = React.useMemo(() => {
    if (employee) {
      return {
        title: employee.title || effectiveFlowData.personalInfo?.title || 'Mr.',
        firstName: employee.firstName,
        middleName: employee.middleName || effectiveFlowData.personalInfo?.middleName || '',
        lastName: employee.lastName,
        preferredName: employee.preferredName || employee.firstName,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.id,
        jobTitle: employee.jobTitle,
        department: employee.department,
        email: employee.corporateEmail || employee.email,
        corporateEmail: employee.corporateEmail || employee.email,
        personalEmail: employee.personalEmail || effectiveFlowData.personalInfo?.personalEmail || employee.email,
        phone: employee.phone || employee.contactNumber1 || effectiveFlowData.personalInfo?.phone || '+1 (415) 555-0199',
        contactNumber1: employee.contactNumber1 || employee.phone || effectiveFlowData.personalInfo?.contactNumber1 || '+1 (415) 555-0199',
        contactNumber2: employee.contactNumber2 || effectiveFlowData.personalInfo?.contactNumber2 || '',
        gender: employee.gender || effectiveFlowData.personalInfo?.gender || 'Prefer not to say',
        dateOfBirth: employee.dateOfBirth || effectiveFlowData.personalInfo?.dateOfBirth || '1994-08-14',
        maritalStatus: employee.maritalStatus || effectiveFlowData.personalInfo?.maritalStatus || 'Single',
        nationality: employee.nationality || effectiveFlowData.personalInfo?.nationality || 'United States',
        bloodGroup: employee.bloodGroup || effectiveFlowData.personalInfo?.bloodGroup || 'O+',
        githubUsername: employee.githubUsername || effectiveFlowData.personalInfo?.githubUsername || '',
        linkedinUrl: employee.linkedinUrl || effectiveFlowData.personalInfo?.linkedinUrl || '',
        workModel: employee.workModel || effectiveFlowData.personalInfo?.workModel || 'Hybrid',
        education: (employee as any).education || effectiveFlowData.personalInfo?.education || 'Bachelor of Science (Computer Science & Engineering)',
        avatar: customAvatar || employee.avatarUrl || getRadianAvatarByName(`${employee.firstName} ${employee.lastName}`),
        startDate: employee.startDate,
        workLocation: employee.officeLocation || 'San Francisco HQ',
        employmentType: employee.employmentType || 'Full-time Regular',
        manager: employee.line1Manager || employee.manager || 'Marcus Brody',
        managerTitle: 'VP of Engineering',
        managerEmail: employee.managerEmail || 'manager@quantira.com',
        line2Manager: employee.line2Manager || 'Alexandra Wright'
      };
    }
    if (isManager) {
      return {
        title: 'Mr.',
        firstName: 'Marcus',
        middleName: '',
        lastName: 'Brody',
        preferredName: 'Marcus',
        name: 'Marcus Brody',
        employeeId: 'EMP-2022-0104',
        jobTitle: 'VP of Engineering',
        department: 'Engineering',
        email: 'manager@quantira.com',
        corporateEmail: 'manager@quantira.com',
        personalEmail: 'marcus.brody.personal@gmail.com',
        phone: '+1 (415) 555-0104',
        contactNumber1: '+1 (415) 555-0104',
        contactNumber2: '+1 (415) 555-0105',
        gender: 'Male',
        dateOfBirth: '1985-06-12',
        maritalStatus: 'Married',
        nationality: 'United States',
        bloodGroup: 'A+',
        githubUsername: 'marcus-brody',
        linkedinUrl: 'https://linkedin.com/in/marcus-brody',
        workModel: 'Hybrid',
        education: 'Master of Science (Distributed Systems)',
        avatar: customAvatar || RADIAN_PERSONA_AVATARS.marcusBrody,
        startDate: '2022-03-15',
        workLocation: 'San Francisco HQ',
        employmentType: 'Executive Full-time Regular',
        manager: 'Alexandra Wright',
        managerTitle: 'Principal Enterprise Administrator',
        managerEmail: 'admin@quantira.com',
        line2Manager: 'Board of Directors'
      };
    }
    const defaultRoleAvatar = currentRole === 'SUPER_ADMIN'
      ? RADIAN_PERSONA_AVATARS.alexandraWright
      : currentRole === 'HR'
      ? RADIAN_PERSONA_AVATARS.eleanorVance
      : RADIAN_PERSONA_AVATARS.johnDoe;

    return {
      title: effectiveFlowData.personalInfo.title || 'Mr.',
      firstName: effectiveFlowData.personalInfo.firstName || 'John',
      middleName: effectiveFlowData.personalInfo.middleName || '',
      lastName: effectiveFlowData.personalInfo.lastName || 'Doe',
      preferredName: effectiveFlowData.personalInfo.preferredName || effectiveFlowData.personalInfo.firstName || 'John',
      name: `${effectiveFlowData.personalInfo.firstName} ${effectiveFlowData.personalInfo.lastName}`,
      employeeId: effectiveFlowData.personalInfo.employeeId || 'EMP-2024-0847',
      jobTitle: effectiveFlowData.personalInfo.jobTitle || 'Software Engineer',
      department: effectiveFlowData.personalInfo.department || 'Engineering',
      email: effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo.corporateEmail || effectiveFlowData.personalInfo.email || 'john.doe@quantira.com',
      corporateEmail: effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo.corporateEmail || effectiveFlowData.personalInfo.email || 'john.doe@quantira.com',
      personalEmail: effectiveFlowData.personalInfo.personalEmail || 'john.personal@example.com',
      phone: effectiveFlowData.personalInfo.phone || effectiveFlowData.personalInfo.contactNumber1 || '+1 (415) 555-0199',
      contactNumber1: effectiveFlowData.personalInfo.contactNumber1 || effectiveFlowData.personalInfo.phone || '+1 (415) 555-0199',
      contactNumber2: effectiveFlowData.personalInfo.contactNumber2 || '',
      gender: effectiveFlowData.personalInfo.gender || 'Prefer not to say',
      dateOfBirth: effectiveFlowData.personalInfo.dateOfBirth || '1994-08-14',
      maritalStatus: effectiveFlowData.personalInfo.maritalStatus || 'Single',
      nationality: effectiveFlowData.personalInfo.nationality || 'United States',
      bloodGroup: effectiveFlowData.personalInfo.bloodGroup || 'O+',
      githubUsername: effectiveFlowData.personalInfo.githubUsername || '',
      linkedinUrl: effectiveFlowData.personalInfo.linkedinUrl || '',
      workModel: effectiveFlowData.personalInfo.workModel || 'Hybrid',
      education: effectiveFlowData.personalInfo.education || 'Bachelor of Science (Computer Science & Engineering)',
      avatar: customAvatar || effectiveFlowData.photo.photoUrl || defaultRoleAvatar,
      startDate: effectiveFlowData.personalInfo.startDate || '2026-09-15',
      workLocation: effectiveFlowData.personalInfo.workLocation || 'San Francisco HQ',
      employmentType: effectiveFlowData.personalInfo.employmentType || 'Full-time Regular',
      manager: effectiveFlowData.personalInfo.line1Manager || 'Marcus Brody',
      managerTitle: 'VP of Engineering',
      managerEmail: 'manager@quantira.com',
      line2Manager: effectiveFlowData.personalInfo.line2Manager || 'Alexandra Wright'
    };
  }, [employee, isManager, currentRole, effectiveFlowData, customAvatar]);

  const assignedEmployeeAssets: ITAsset[] = React.useMemo(() => {
    const list = enterpriseAssets.filter(
      (a) =>
        (a.assignedTo?.id && (a.assignedTo.id === effectiveProfile.employeeId || (!employee && a.assignedTo.id === 'emp-1'))) ||
        (a.assignedTo?.email && a.assignedTo.email.toLowerCase() === effectiveProfile.email.toLowerCase()) ||
        (a.assignedTo?.name && a.assignedTo.name.toLowerCase() === effectiveProfile.name.toLowerCase())
    );

    if (list.length > 0) {
      return list;
    }

    if (!employee) {
      const found = enterpriseAssets.filter(
        (a) => a.id === 'AST-1001' || a.id === 'AST-1002' || a.assetTag === 'QTR-LAP-0101' || a.assetTag === 'QTR-MON-0204'
      );
      if (found.length > 0) {
        return found.map((a) => ({
          ...a,
          assignedTo: {
            id: effectiveProfile.employeeId,
            name: effectiveProfile.name,
            email: effectiveProfile.email,
            department: effectiveProfile.department,
            avatarUrl: effectiveProfile.avatar,
            assignedDate: effectiveProfile.startDate || '2026-09-15'
          }
        }));
      }
      return INITIAL_ENTERPRISE_ASSETS.slice(0, 2).map((a) => ({
        ...a,
        assignedTo: {
          id: effectiveProfile.employeeId,
          name: effectiveProfile.name,
          email: effectiveProfile.email,
          department: effectiveProfile.department,
          avatarUrl: effectiveProfile.avatar,
          assignedDate: effectiveProfile.startDate || '2026-09-15'
        }
      }));
    }

    return [];
  }, [enterpriseAssets, effectiveProfile, employee]);

  const handleAssignAssetToEmployee = (asset: ITAsset) => {
    setActionConfirmation({
      title: 'Confirm Asset Allocation',
      message: `Are you sure you want to assign ${asset.name} (${asset.assetTag}) to ${effectiveProfile.name}?`,
      confirmLabel: 'Assign Asset',
      variant: 'info',
      onConfirm: () => {
        updateAsset(asset.id, {
          status: 'Assigned',
          assignedTo: {
            id: effectiveProfile.employeeId,
            name: effectiveProfile.name,
            email: effectiveProfile.email,
            department: effectiveProfile.department,
            avatarUrl: effectiveProfile.avatar,
            assignedDate: new Date().toISOString().split('T')[0]
          }
        });
        setEnterpriseAssets(getAssets());
        addProfileHistoryLog(
          'IT Hardware Asset Assigned',
          'Assets & IT',
          `Allocated ${asset.name} (Asset Tag: ${asset.assetTag}, Category: ${asset.category}) to ${effectiveProfile.name}.`,
          'info'
        );
        showToastSuccess('Asset Assigned', `${asset.name} (${asset.assetTag}) has been assigned to ${effectiveProfile.name}.`);
      }
    });
  };

  const handleUnassignAssetFromEmployee = (asset: ITAsset) => {
    setActionConfirmation({
      title: 'Confirm Return Asset',
      message: `Return ${asset.name} (${asset.assetTag}) back to the available inventory pool?`,
      confirmLabel: 'Return Asset',
      variant: 'warning',
      onConfirm: () => {
        updateAsset(asset.id, {
          status: 'Available',
          assignedTo: null
        });
        setEnterpriseAssets(getAssets());
        addProfileHistoryLog(
          'IT Hardware Asset Returned',
          'Assets & IT',
          `Returned ${asset.name} (Asset Tag: ${asset.assetTag}) back to enterprise inventory pool.`,
          'warning'
        );
        showToastSuccess('Asset Returned', `${asset.name} (${asset.assetTag}) returned to inventory pool.`);
      }
    });
  };

  const { activeProfileTab, setActiveProfileTab: setGlobalActiveProfileTab, addAuditLog } = useOnboarding();
  const [localActiveTab, setLocalActiveTab] = useState<ProfileTabId>('overview');
  const activeTab = employee ? localActiveTab : activeProfileTab;
  const setActiveTab = employee ? setLocalActiveTab : setGlobalActiveProfileTab;
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Profile Lifecycle & Audit History State
  const historyStorageKey = `quantira_profile_history_${effectiveProfile.employeeId}`;
  const [profileHistoryList, setProfileHistoryList] = useState<ProfileHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(historyStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    const initialLogs: ProfileHistoryEntry[] = [
      {
        id: `hist-init-1-${effectiveProfile.employeeId}`,
        timestamp: effectiveProfile.startDate ? `${effectiveProfile.startDate}T09:00:00Z` : '2026-09-15T09:00:00Z',
        action: 'Enterprise Profile Provisioned',
        category: 'Security & SSO',
        user: 'Enterprise Identity System',
        details: `Profile and employee ID (${effectiveProfile.employeeId}) activated on Quantira HR Core.`,
        type: 'success'
      },
      {
        id: `hist-init-2-${effectiveProfile.employeeId}`,
        timestamp: effectiveProfile.startDate ? `${effectiveProfile.startDate}T09:15:00Z` : '2026-09-15T09:15:00Z',
        action: 'Google Workspace SSO Provisioned',
        category: 'Security & SSO',
        user: 'IT Cloud Admin',
        details: `Corporate email ${effectiveProfile.email} configured with SAML SSO and Multi-Factor Authentication.`,
        type: 'info'
      },
      {
        id: `hist-init-3-${effectiveProfile.employeeId}`,
        timestamp: effectiveProfile.startDate ? `${effectiveProfile.startDate}T09:30:00Z` : '2026-09-15T09:30:00Z',
        action: 'Offer Letter Executed',
        category: 'Documents & Compliance',
        user: effectiveProfile.name,
        details: 'Formal employment offer letter countersigned and sealed.',
        type: 'success'
      },
      {
        id: `hist-init-4-${effectiveProfile.employeeId}`,
        timestamp: effectiveProfile.startDate ? `${effectiveProfile.startDate}T10:00:00Z` : '2026-09-15T10:00:00Z',
        action: 'NDA & Corporate Governance Signed',
        category: 'Documents & Compliance',
        user: effectiveProfile.name,
        details: 'Proprietary Information & Inventions Agreement signed with ESIGN digital signature.',
        type: 'success'
      },
      {
        id: `hist-init-5-${effectiveProfile.employeeId}`,
        timestamp: effectiveProfile.startDate ? `${effectiveProfile.startDate}T10:30:00Z` : '2026-09-15T10:30:00Z',
        action: 'Form I-9 & Statutory Verification',
        category: 'Documents & Compliance',
        user: 'Eleanor Vance (HR)',
        details: 'Government photo identification and employment eligibility verified and archived.',
        type: 'info'
      },
      {
        id: `hist-init-6-${effectiveProfile.employeeId}`,
        timestamp: effectiveProfile.startDate ? `${effectiveProfile.startDate}T11:00:00Z` : '2026-09-15T11:00:00Z',
        action: 'IT Hardware & Workstation Allocated',
        category: 'Assets & IT',
        user: 'IT Logistics',
        details: 'Enterprise laptop, 4K monitor, and encrypted security key allocated.',
        type: 'info'
      },
      {
        id: `hist-init-7-${effectiveProfile.employeeId}`,
        timestamp: effectiveProfile.startDate ? `${effectiveProfile.startDate}T11:30:00Z` : '2026-09-15T11:30:00Z',
        action: 'Workplace Security & RFID Badge Issued',
        category: 'Role & Management',
        user: 'Facilities Security',
        details: 'Engineering floor badge clearance and parking permit granted.',
        type: 'success'
      }
    ];

    if (employee?.auditLogs && Array.isArray(employee.auditLogs) && employee.auditLogs.length > 0) {
      const convertedLogs: ProfileHistoryEntry[] = employee.auditLogs.map((l, i) => ({
        id: l.id || `hist-cand-${i}`,
        timestamp: l.timestamp,
        action: l.action,
        category: 'Documents & Compliance',
        user: l.user,
        details: l.details,
        type: l.type
      }));
      return [...convertedLogs, ...initialLogs];
    }

    return initialLogs;
  });

  const addProfileHistoryLog = (
    action: string,
    category: ProfileHistoryEntry['category'],
    details?: string,
    type: ProfileHistoryEntry['type'] = 'info'
  ) => {
    const actorName = currentRole === 'SUPER_ADMIN'
      ? 'Alexandra Wright (Super Admin)'
      : currentRole === 'HR'
      ? 'Eleanor Vance (HR Admin)'
      : currentRole === 'MANAGER'
      ? 'Marcus Brody (Manager)'
      : (effectiveProfile.name || 'Self');

    const newEntry: ProfileHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      user: actorName,
      details,
      type
    };

    setProfileHistoryList((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (employee?.id && addAuditLog) {
      try {
        addAuditLog(employee.id, action, details || '', type);
      } catch {}
    }
  };

  const [showProfileHistoryModal, setShowProfileHistoryModal] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('All');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('All');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newAuditNoteAction, setNewAuditNoteAction] = useState('');
  const [newAuditNoteCategory, setNewAuditNoteCategory] = useState<ProfileHistoryEntry['category']>('General');
  const [newAuditNoteDetails, setNewAuditNoteDetails] = useState('');
  const [newAuditNoteType, setNewAuditNoteType] = useState<ProfileHistoryEntry['type']>('info');

  const filteredHistoryList = useMemo(() => {
    return profileHistoryList.filter((item) => {
      const matchesSearch =
        historySearchQuery.trim() === '' ||
        item.action.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        item.user.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        (item.details && item.details.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(historySearchQuery.toLowerCase());

      const matchesCategory =
        historyCategoryFilter === 'All' || item.category === historyCategoryFilter;

      const matchesType =
        historyTypeFilter === 'All' || item.type === historyTypeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [profileHistoryList, historySearchQuery, historyCategoryFilter, historyTypeFilter]);

  const handleExportProfileHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileHistoryList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `profile_history_${effectiveProfile.employeeId}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToastSuccess('History Exported', 'Profile history logs exported as JSON.');
  };

  const handleAddManualAuditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditNoteAction.trim()) {
      showToastError('Validation Error', 'Activity / Audit title is required.');
      return;
    }
    addProfileHistoryLog(
      newAuditNoteAction.trim(),
      newAuditNoteCategory,
      newAuditNoteDetails.trim() || undefined,
      newAuditNoteType
    );
    setNewAuditNoteAction('');
    setNewAuditNoteDetails('');
    setShowAddNoteForm(false);
    showToastSuccess('Audit Entry Logged', 'Profile history timeline updated.');
  };

  // ID Card & Business Card Admin Edit State
  const canEditCards = Boolean(isManagingEmployee && (isHrAdmin || isSuperAdmin));
  const [showEditCardsModal, setShowEditCardsModal] = useState(false);
  const [cardEditPhotoUrl, setCardEditPhotoUrl] = useState('');
  const [cardEditJobTitle, setCardEditJobTitle] = useState('');
  const [cardEditDepartment, setCardEditDepartment] = useState('');
  const [cardEditPhone, setCardEditPhone] = useState('');
  const [cardEditLocation, setCardEditLocation] = useState('');
  const cardPhotoInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenEditCardsModal = () => {
    setCardEditPhotoUrl(effectiveProfile.avatar || effectiveFlowData.photo?.photoUrl || '');
    setCardEditJobTitle(profileForm.jobTitle || effectiveProfile.jobTitle || '');
    setCardEditDepartment(profileForm.department || effectiveProfile.department || '');
    setCardEditPhone(profileForm.phone || effectiveFlowData.personalInfo?.phone || '+1 (415) 555-0100');
    setCardEditLocation(profileForm.workLocation || effectiveProfile.workLocation || 'San Francisco HQ');
    setShowEditCardsModal(true);
  };

  const handleCardPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToastError('File Too Large', 'Please select an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCardEditPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCards = () => {
    if (cardEditPhotoUrl) {
      setCustomAvatar(cardEditPhotoUrl);
      try {
        localStorage.setItem(avatarStorageKey, cardEditPhotoUrl);
      } catch {}
      updatePhoto({ photoUrl: cardEditPhotoUrl, fileName: 'card_badge.jpg', fileSize: '1.2MB' });
    }
    const updatedForm = {
      ...profileForm,
      jobTitle: cardEditJobTitle.trim() || profileForm.jobTitle,
      department: cardEditDepartment.trim() || profileForm.department,
      phone: cardEditPhone.trim() || profileForm.phone,
      workLocation: cardEditLocation.trim() || profileForm.workLocation
    };
    setProfileForm(updatedForm);
    updatePersonalInfo({
      jobTitle: updatedForm.jobTitle,
      department: updatedForm.department,
      phone: updatedForm.phone,
      workLocation: updatedForm.workLocation
    });

    if (employee && onEmployeeUpdated) {
      onEmployeeUpdated({
        ...employee,
        jobTitle: updatedForm.jobTitle,
        department: updatedForm.department,
        phone: updatedForm.phone,
        officeLocation: updatedForm.workLocation || employee.officeLocation,
        avatarUrl: cardEditPhotoUrl || employee.avatarUrl
      });
    }

    addProfileHistoryLog(
      'Corporate ID Badge & Business Card Updated',
      'Role & Management',
      `Updated ID badge and business card credentials (Title: ${updatedForm.jobTitle}, Division: ${updatedForm.department}, Office: ${updatedForm.workLocation}).`,
      'info'
    );

    setShowEditCardsModal(false);
    showToastSuccess('Credentials Updated', 'Employee ID badge and business card details updated successfully.');
  };

  // Helper to determine if a document is an official HR policy / agreement
  const isHrPolicyDocument = (doc: any): boolean => {
    if (!doc) return false;
    const id = (doc.id || '').toLowerCase();
    const type = (doc.type || '').toLowerCase();
    const category = (doc.category || '').toLowerCase();
    const section = (doc.section || '').toLowerCase();

    return (
      type === 'nda' ||
      type === 'offer_letter' ||
      type === 'policy' ||
      id === 'doc-nda' ||
      id === 'doc-offer-letter' ||
      id === 'doc-policies' ||
      id.startsWith('pol-') ||
      category.includes('compliance') ||
      category.includes('policy') ||
      category.includes('governance') ||
      category.includes('ethics') ||
      category.includes('intellectual property') ||
      category.includes('legal & compliance') ||
      section === 'policy' ||
      Boolean(doc.isLocked && !id.startsWith('doc-custom-'))
    );
  };

  const mapStatutoryDocCategory = (doc: any): string => {
    if (doc.category) {
      const c = doc.category.toLowerCase();
      if (c.includes('gov') || c.includes('identity') || c.includes('id') || c.includes('photo proof')) return 'Government & Identity Documents';
      if (c.includes('edu') || c.includes('academic') || c.includes('degree')) return 'Education Documents';
      if (c.includes('last org') || c.includes('previous') || c.includes('prior') || c.includes('relieving') || c.includes('offer') || c.includes('experience')) return 'Last Organization Documents';
      if (c.includes('finan') || c.includes('bank') || c.includes('tax') || c.includes('salary') || c.includes('payroll')) return 'Financial & Tax Documents';
      if (c.includes('other')) return 'Other Documents';
      return doc.category;
    }
    const key = `${doc.id || ''} ${doc.type || ''} ${doc.name || ''}`.toLowerCase();
    if (key.includes('gov') || key.includes('passport') || key.includes('identity') || key.includes('badge') || key.includes('photo')) {
      return 'Government & Identity Documents';
    }
    if (key.includes('edu') || key.includes('degree') || key.includes('transcript') || key.includes('diploma')) {
      return 'Education Documents';
    }
    if (key.includes('offer') || key.includes('reliev') || key.includes('experience') || key.includes('salary') || key.includes('payslip')) {
      return 'Last Organization Documents';
    }
    if (key.includes('bank') || key.includes('deposit') || key.includes('tax') || key.includes('w-4') || key.includes('form 16')) {
      return 'Financial & Tax Documents';
    }
    return 'Other Documents';
  };

  // Initial standard and compliance documents
  const getInitialDocuments = (name: string, id: string, sDate?: string): DocumentItem[] => {
    // 1. HR Documents & Policies (NDA, Offer Letter, Master Policies, and all corporate policies from onboarding)
    const hrDocs: DocumentItem[] = [
      {
        id: 'doc-nda',
        type: 'nda',
        name: 'NDA & Confidentiality Agreement',
        category: 'Legal & Intellectual Property',
        fileName: 'signed_nda_quantira_agreement.pdf',
        fileSize: '2.4 MB',
        uploadedAt: sDate ? `${sDate}T10:14:00Z` : '2026-09-15T10:14:00Z',
        status: 'verified',
        isLocked: true,
        required: true,
        description: 'Proprietary Information & Inventions Agreement. Legally binding, countersigned & ESIGN compliant.'
      },
      {
        id: 'doc-offer-letter',
        type: 'offer_letter',
        name: 'Signed Employment Offer Letter',
        category: 'Employment Contract',
        fileName: 'signed_offer_letter_quantira.pdf',
        fileSize: '1.2 MB',
        uploadedAt: sDate ? `${sDate}T09:30:00Z` : '2026-09-12T09:30:00Z',
        status: 'verified',
        isLocked: true,
        required: true,
        description: 'Official compensation package, stock option grant, and role agreement.'
      },
      {
        id: 'doc-policies',
        type: 'policy',
        name: 'Corporate Policies & Employee Code of Conduct',
        category: 'Corporate Governance',
        fileName: 'quantira_corporate_policies_v2026.pdf',
        fileSize: '3.1 MB',
        uploadedAt: sDate ? `${sDate}T10:14:00Z` : '2026-09-15T10:14:00Z',
        status: 'verified',
        isLocked: true,
        required: true,
        description: 'Enterprise Code of Conduct, IT Security, Acceptable Use, and Anti-Harassment policies.'
      }
    ];

    try {
      const activePolicies = getOnboardingPolicyDocuments();
      if (activePolicies && activePolicies.length > 0) {
        activePolicies.forEach((pol) => {
          if (!hrDocs.some((d) => d.id === pol.id || d.name.toLowerCase() === pol.title.toLowerCase())) {
            hrDocs.push({
              id: pol.id,
              type: 'policy',
              name: pol.title,
              category: pol.folder || pol.category || 'Company Policy',
              fileName: `${pol.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${pol.version.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
              fileSize: pol.fileSize || '1.8 MB',
              uploadedAt: pol.lastUpdated ? `${pol.lastUpdated}T09:00:00Z` : (sDate ? `${sDate}T09:00:00Z` : '2026-09-01T09:00:00Z'),
              status: 'verified',
              isLocked: true,
              required: pol.mandatory ?? true,
              description: pol.description
            });
          }
        });
      }
    } catch (e) {
      console.error('Error fetching onboarding policies:', e);
    }

    return hrDocs;
  };

  const docStorageKey = `quantira_employee_documents_${effectiveProfile.employeeId}`;
  const [profileDocuments, setProfileDocuments] = useState<DocumentItem[]>(() => {
    const initial = getInitialDocuments(effectiveProfile.name, effectiveProfile.employeeId, effectiveProfile.startDate);
    try {
      const saved = localStorage.getItem(docStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out stale mock files for unuploaded statutory docs
          const dummyFileNames = new Set([
            'prior_org_relieving_letter.pdf',
            'prior_experience_certificate.pdf',
            'chase_direct_deposit_voided_check.pdf',
            'prior_org_offer_letter.pdf',
            'last_3_months_payslips_bundle.pdf'
          ]);
          const cleanedParsed = parsed.filter((d: any) => {
            if (isHrPolicyDocument(d)) return true;
            if (dummyFileNames.has(d.fileName)) {
              // Only keep if explicitly marked uploaded in effectiveFlowData
              const matchingOnbDoc = effectiveFlowData?.documents?.find((od: any) => od.id === d.id);
              return matchingOnbDoc?.status === 'uploaded';
            }
            return true;
          });
          const existingIds = new Set(cleanedParsed.map((d: any) => d.id));
          const missing = initial.filter((d: any) => !existingIds.has(d.id));
          return [...cleanedParsed, ...missing];
        }
      }
    } catch {}
    return initial;
  });

  const saveDocumentsList = (docs: DocumentItem[]) => {
    setProfileDocuments(docs);
    try {
      localStorage.setItem(docStorageKey, JSON.stringify(docs));
    } catch {}
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    const updated = [...profileDocuments, newDoc];
    saveDocumentsList(updated);
    showToastSuccess('Document Added', `${newDoc.name} has been added to repository.`);
  };

  const handleSaveEditedDocument = (updatedDoc: DocumentItem) => {
    const updated = profileDocuments.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
    saveDocumentsList(updated);
    showToastSuccess('Document Updated', `${updatedDoc.name} details have been saved.`);
    setEditingDoc(null);
  };

  const handleDeleteDocument = (docId: string) => {
    const docToDelete = profileDocuments.find((d) => d.id === docId);
    if (!docToDelete) return;
    if (docToDelete.isLocked) {
      showToastError('Action Restricted', 'Executed legal documents cannot be deleted.');
      return;
    }
    const updated = profileDocuments.filter((d) => d.id !== docId);
    saveDocumentsList(updated);
    showToastSuccess('Document Deleted', `${docToDelete.name} has been removed.`);
    setDeletingDoc(null);
  };

  const handleDirectDownload = (doc: DocumentItem) => {
    downloadDocumentFile(
      doc,
      effectiveProfile.name,
      effectiveProfile.employeeId,
      effectiveProfile.department,
      effectiveProfile.jobTitle,
      effectiveFlowData.nda?.signedName || flowData?.nda?.signedName || effectiveProfile.name,
      effectiveFlowData.nda?.acceptedAt || flowData?.nda?.acceptedAt || effectiveProfile.startDate
    );
    showToastSuccess('Download Started', `Preparing ${doc.fileName || doc.name} for download.`);
  };

  // Synchronize onboarding documents (standard uploads + custom added docs) to employee repository in real-time
  useEffect(() => {
    if (!effectiveFlowData?.documents || effectiveFlowData.documents.length === 0) return;

    setProfileDocuments((prevDocs) => {
      let changed = false;
      const updated = [...prevDocs];

      effectiveFlowData.documents.forEach((onbDoc: any) => {
        const existingIdx = updated.findIndex((d) => d.id === onbDoc.id || (d.name === onbDoc.name && !isHrPolicyDocument(d)));

        if (onbDoc.status === 'uploaded' && onbDoc.fileName) {
          if (existingIdx >= 0) {
            if (
              updated[existingIdx].fileName !== onbDoc.fileName ||
              updated[existingIdx].status !== 'verified'
            ) {
              updated[existingIdx] = {
                ...updated[existingIdx],
                fileName: onbDoc.fileName,
                fileSize: onbDoc.fileSize || updated[existingIdx].fileSize || '1.4 MB',
                uploadedAt: onbDoc.uploadedAt || new Date().toISOString(),
                status: 'verified'
              };
              changed = true;
            }
          } else {
            // New uploaded statutory or custom document
            const category = mapStatutoryDocCategory(onbDoc);

            updated.push({
              id: onbDoc.id,
              type: onbDoc.type || 'statutory_document',
              name: onbDoc.name,
              category,
              fileName: onbDoc.fileName,
              fileSize: onbDoc.fileSize || '1.4 MB',
              uploadedAt: onbDoc.uploadedAt || new Date().toISOString(),
              status: 'verified',
              isLocked: false,
              required: onbDoc.required || false,
              description: onbDoc.description || 'Uploaded by employee during onboarding verification.'
            });
            changed = true;
          }
        } else if (onbDoc.status === 'pending' || !onbDoc.fileName) {
          // If unuploaded in onboarding, make sure unuploaded statutory docs aren't listed as uploaded in repository
          if (existingIdx >= 0 && !isHrPolicyDocument(updated[existingIdx])) {
            updated.splice(existingIdx, 1);
            changed = true;
          }
        }
      });

      if (changed) {
        try {
          localStorage.setItem(docStorageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prevDocs;
    });
  }, [effectiveFlowData?.documents, docStorageKey]);

  const hrDocumentsList = useMemo(() => {
    return profileDocuments.filter(isHrPolicyDocument);
  }, [profileDocuments]);

  const uploadedByEmployeeList = useMemo(() => {
    const rawList = profileDocuments.filter(
      (d: any) => !isHrPolicyDocument(d) && (Boolean(d.fileName) || d.status === 'uploaded' || d.status === 'verified')
    );
    const seen = new Set<string>();
    return rawList.filter((d: any) => {
      const key = d.id || d.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [profileDocuments]);

  const [profileCustomFields, setProfileCustomFields] = useState<CustomProfileField[]>([]);
  const [employeeCustomValues, setEmployeeCustomValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const fields = getCustomFields().filter((f) => f.showInProfile !== false);
    setProfileCustomFields(fields);
    try {
      const saved = localStorage.getItem('quantira_employee_custom_values');
      if (saved) setEmployeeCustomValues(JSON.parse(saved));
    } catch {}

    const handleCustomUpdate = () => {
      setProfileCustomFields(getCustomFields().filter((f) => f.showInProfile !== false));
    };
    window.addEventListener('quantira_custom_fields_updated', handleCustomUpdate);
    return () => window.removeEventListener('quantira_custom_fields_updated', handleCustomUpdate);
  }, []);
  const [copiedSignature, setCopiedSignature] = useState(false);

  // Time & Attendance (Punch In / Punch Out) State
  const employeeId = effectiveProfile.employeeId;
  const employeeName = effectiveProfile.name;
  const [attendanceState, setAttendanceState] = useState<EmployeeAttendanceState>(() => {
    return getStoredAttendanceState(employeeId, employeeName);
  });
  const [showPunchHistoryModal, setShowPunchHistoryModal] = useState(false);

  const handlePunchIn = () => {
    const loc = flowData.personalInfo.workLocation || 'San Francisco HQ';
    const next = punchIn(employeeId, employeeName, loc);
    setAttendanceState(next);
    addProfileHistoryLog(
      'Shift Punch In Recorded',
      'Attendance',
      `Clocked in at ${next.lastPunch?.timeFormatted} (${loc}). Active shift timer started.`,
      'success'
    );
    showToastSuccess('Punched In Successfully', `Clocked in at ${next.lastPunch?.timeFormatted}. Have a productive shift!`);
  };

  const handlePunchOut = () => {
    const loc = flowData.personalInfo.workLocation || 'San Francisco HQ';
    const next = punchOut(employeeId, employeeName, loc);
    setAttendanceState(next);
    addProfileHistoryLog(
      'Shift Punch Out Recorded',
      'Attendance',
      `Clocked out at ${next.lastPunch?.timeFormatted} (${loc}). Shift hours saved to log.`,
      'info'
    );
    showToastSuccess('Punched Out Successfully', `Clocked out at ${next.lastPunch?.timeFormatted}. Rest well!`);
  };

  // Profile Information Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => {
    if (employee) {
      return {
        title: employee.title || 'Mr.',
        fullName: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
        firstName: employee.firstName || '',
        middleName: employee.middleName || '',
        lastName: employee.lastName || '',
        gender: employee.gender || 'Prefer not to say',
        preferredName: employee.preferredName || employee.firstName || '',
        dateOfBirth: employee.dateOfBirth || '1994-08-14',
        maritalStatus: employee.maritalStatus || 'Single',
        nationality: employee.nationality || 'United States',
        bloodGroup: employee.bloodGroup || 'O+',
        corporateEmail: employee.corporateEmail || employee.email || '',
        personalEmail: employee.personalEmail || employee.email || '',
        phone: employee.phone || employee.contactNumber1 || '+1 (415) 555-0199',
        contactNumber1: employee.contactNumber1 || employee.phone || '+1 (415) 555-0199',
        contactNumber2: employee.contactNumber2 || '',
        githubUsername: employee.githubUsername || '',
        linkedinUrl: employee.linkedinUrl || '',
        education: (employee as any).education || 'Bachelor of Science (Computer Science & Engineering)',
        workLocation: employee.officeLocation || 'San Francisco HQ',
        jobTitle: employee.jobTitle || 'Software Engineer',
        department: employee.department || 'Engineering',
        employeeId: employee.id || 'EMP-2024-0847',
        employmentType: employee.employmentType || 'Full-time Regular',
        workModel: employee.workModel || 'Hybrid',
        line1Manager: employee.line1Manager || employee.manager || 'Marcus Brody',
        line2Manager: employee.line2Manager || 'Alexandra Wright',
        startDate: employee.startDate || '2026-09-15',
        address: employee.address?.street || '101 California Street, Apt 14B',
        city: employee.address?.city || 'San Francisco',
        state: employee.address?.state || 'CA',
        zipCode: employee.address?.zipCode || '94111'
      };
    }
    const defaultData = {
      title: effectiveFlowData.personalInfo?.title || (isManager ? 'Mr.' : 'Mr.'),
      fullName: effectiveFlowData.personalInfo?.name || `${effectiveFlowData.personalInfo?.firstName || effectiveProfile.firstName} ${effectiveFlowData.personalInfo?.lastName || effectiveProfile.lastName}`.trim(),
      firstName: effectiveFlowData.personalInfo?.firstName || effectiveProfile.firstName,
      middleName: effectiveFlowData.personalInfo?.middleName || '',
      lastName: effectiveFlowData.personalInfo?.lastName || effectiveProfile.lastName,
      gender: effectiveFlowData.personalInfo?.gender || (isManager ? 'Male' : 'Prefer not to say'),
      preferredName: effectiveProfile.preferredName || effectiveFlowData.personalInfo?.preferredName || effectiveFlowData.personalInfo?.firstName || '',
      dateOfBirth: isManager ? '1985-08-22' : (effectiveFlowData.personalInfo?.dateOfBirth || '1994-08-14'),
      maritalStatus: effectiveFlowData.personalInfo?.maritalStatus || (isManager ? 'Married' : 'Single'),
      nationality: effectiveFlowData.personalInfo?.nationality || 'United States',
      bloodGroup: effectiveFlowData.personalInfo?.bloodGroup || 'O+',
      corporateEmail: isManager ? 'marcus.brody@quantira.com' : (effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || effectiveProfile.email),
      personalEmail: isManager ? 'marcus.brody@personalmail.com' : (effectiveFlowData.personalInfo?.personalEmail || ''),
      phone: isManager ? '+1 (415) 555-0100' : (effectiveFlowData.personalInfo?.phone || effectiveFlowData.personalInfo?.contactNumber1 || '+1 (415) 555-0199'),
      contactNumber1: isManager ? '+1 (415) 555-0100' : (effectiveFlowData.personalInfo?.contactNumber1 || effectiveFlowData.personalInfo?.phone || '+1 (415) 555-0199'),
      contactNumber2: isManager ? '+1 (415) 555-0105' : (effectiveFlowData.personalInfo?.contactNumber2 || ''),
      githubUsername: isManager ? 'marcus-brody' : (effectiveFlowData.personalInfo?.githubUsername || ''),
      linkedinUrl: isManager ? 'https://linkedin.com/in/marcus-brody' : (effectiveFlowData.personalInfo?.linkedinUrl || ''),
      education: isManager ? 'Master of Business Administration' : (effectiveFlowData.personalInfo?.education || 'Bachelor of Science (Computer Science & Engineering)'),
      workLocation: effectiveFlowData.personalInfo?.workLocation || effectiveProfile.workLocation || 'San Francisco HQ',
      jobTitle: effectiveFlowData.personalInfo?.jobTitle || effectiveProfile.jobTitle || 'Software Engineer',
      department: effectiveFlowData.personalInfo?.department || effectiveProfile.department || 'Engineering',
      employeeId: effectiveFlowData.personalInfo?.employeeId || effectiveProfile.employeeId || 'EMP-2024-0847',
      employmentType: effectiveFlowData.personalInfo?.employmentType || effectiveProfile.employmentType || 'Full-time Regular',
      workModel: effectiveFlowData.personalInfo?.workModel || 'Hybrid',
      line1Manager: effectiveFlowData.personalInfo?.line1Manager || effectiveProfile.manager || 'Marcus Brody',
      line2Manager: effectiveFlowData.personalInfo?.line2Manager || effectiveProfile.line2Manager || 'Alexandra Wright',
      startDate: effectiveFlowData.personalInfo?.startDate || effectiveProfile.startDate || '2026-09-15',
      address: isManager ? '780 Mission St, Penthouse 4' : (effectiveFlowData.personalInfo?.address || '101 California Street, Apt 14B'),
      city: effectiveFlowData.personalInfo?.city || 'San Francisco',
      state: effectiveFlowData.personalInfo?.state || 'CA',
      zipCode: effectiveFlowData.personalInfo?.zipCode || (isManager ? '94103' : '94111')
    };

    try {
      const storageKey = isManager ? 'manager_profile_custom' : 'employee_profile_custom';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultData,
          ...parsed,
          corporateEmail: defaultData.corporateEmail,
          personalEmail: parsed.personalEmail || defaultData.personalEmail,
          phone: parsed.phone || parsed.contactNumber1 || defaultData.phone,
          contactNumber1: parsed.contactNumber1 || parsed.phone || defaultData.contactNumber1,
          contactNumber2: parsed.contactNumber2 || defaultData.contactNumber2,
          githubUsername: parsed.githubUsername || defaultData.githubUsername,
          linkedinUrl: parsed.linkedinUrl || defaultData.linkedinUrl,
          education: parsed.education || defaultData.education
        };
      }
    } catch {}
    return defaultData;
  });

  // Sync profileForm when selected employee prop changes
  useEffect(() => {
    if (employee) {
      setProfileForm({
        title: employee.title || 'Mr.',
        fullName: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
        firstName: employee.firstName || '',
        middleName: employee.middleName || '',
        lastName: employee.lastName || '',
        gender: employee.gender || 'Prefer not to say',
        preferredName: employee.preferredName || employee.firstName || '',
        dateOfBirth: employee.dateOfBirth || '1994-08-14',
        maritalStatus: employee.maritalStatus || 'Single',
        nationality: employee.nationality || 'United States',
        bloodGroup: employee.bloodGroup || 'O+',
        corporateEmail: employee.corporateEmail || employee.email || '',
        personalEmail: employee.personalEmail || employee.email || '',
        phone: employee.phone || employee.contactNumber1 || '+1 (415) 555-0199',
        contactNumber1: employee.contactNumber1 || employee.phone || '+1 (415) 555-0199',
        contactNumber2: employee.contactNumber2 || '',
        githubUsername: employee.githubUsername || '',
        linkedinUrl: employee.linkedinUrl || '',
        education: (employee as any).education || 'Bachelor of Science (Computer Science & Engineering)',
        workLocation: employee.officeLocation || 'San Francisco HQ',
        jobTitle: employee.jobTitle || 'Software Engineer',
        department: employee.department || 'Engineering',
        employeeId: employee.id || 'EMP-2024-0847',
        employmentType: employee.employmentType || 'Full-time Regular',
        workModel: employee.workModel || 'Hybrid',
        line1Manager: employee.line1Manager || employee.manager || 'Marcus Brody',
        line2Manager: employee.line2Manager || 'Alexandra Wright',
        startDate: employee.startDate || '2026-09-15',
        address: employee.address?.street || '101 California Street, Apt 14B',
        city: employee.address?.city || 'San Francisco',
        state: employee.address?.state || 'CA',
        zipCode: employee.address?.zipCode || '94111'
      });
    }
  }, [employee]);

  // Keep profileForm synced with onboarding flow data when viewing self profile
  useEffect(() => {
    if (!employee && !isManager) {
      setProfileForm((prev: any) => ({
        ...prev,
        title: effectiveFlowData.personalInfo?.title || prev.title,
        fullName: effectiveFlowData.personalInfo?.name || prev.fullName,
        firstName: effectiveFlowData.personalInfo?.firstName || prev.firstName,
        middleName: effectiveFlowData.personalInfo?.middleName || prev.middleName,
        lastName: effectiveFlowData.personalInfo?.lastName || prev.lastName,
        preferredName: effectiveFlowData.personalInfo?.preferredName || prev.preferredName,
        gender: effectiveFlowData.personalInfo?.gender || prev.gender,
        dateOfBirth: effectiveFlowData.personalInfo?.dateOfBirth || prev.dateOfBirth,
        maritalStatus: effectiveFlowData.personalInfo?.maritalStatus || prev.maritalStatus,
        nationality: effectiveFlowData.personalInfo?.nationality || prev.nationality,
        bloodGroup: effectiveFlowData.personalInfo?.bloodGroup || prev.bloodGroup,
        corporateEmail: effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || prev.corporateEmail,
        personalEmail: effectiveFlowData.personalInfo?.personalEmail || prev.personalEmail,
        phone: effectiveFlowData.personalInfo?.phone || effectiveFlowData.personalInfo?.contactNumber1 || prev.phone,
        contactNumber1: effectiveFlowData.personalInfo?.contactNumber1 || effectiveFlowData.personalInfo?.phone || prev.contactNumber1,
        contactNumber2: effectiveFlowData.personalInfo?.contactNumber2 || prev.contactNumber2,
        githubUsername: effectiveFlowData.personalInfo?.githubUsername || prev.githubUsername,
        linkedinUrl: effectiveFlowData.personalInfo?.linkedinUrl || prev.linkedinUrl,
        education: effectiveFlowData.personalInfo?.education || prev.education,
        workLocation: effectiveFlowData.personalInfo?.workLocation || prev.workLocation,
        jobTitle: effectiveFlowData.personalInfo?.jobTitle || prev.jobTitle,
        department: effectiveFlowData.personalInfo?.department || prev.department,
        employeeId: effectiveFlowData.personalInfo?.employeeId || prev.employeeId,
        startDate: effectiveFlowData.personalInfo?.startDate || prev.startDate,
        employmentType: effectiveFlowData.personalInfo?.employmentType || prev.employmentType,
        workModel: effectiveFlowData.personalInfo?.workModel || prev.workModel,
        line1Manager: effectiveFlowData.personalInfo?.line1Manager || prev.line1Manager,
        line2Manager: effectiveFlowData.personalInfo?.line2Manager || prev.line2Manager
      }));
    }
  }, [effectiveFlowData, employee, isManager]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName?.trim() && (!profileForm.firstName.trim() || !profileForm.lastName.trim())) {
      showToastError('Validation Error', 'Full name is required.');
      return;
    }

    const currentForm = { ...profileForm };
    const parts = (currentForm.fullName || '').trim().split(/\s+/);
    const resolvedFirst = parts[0] || currentForm.firstName || '';
    const resolvedLast = parts.slice(1).join(' ') || currentForm.lastName || '';
    const resolvedFull = currentForm.fullName?.trim() || `${resolvedFirst} ${resolvedLast}`.trim();

    setActionConfirmation({
      title: 'Confirm Profile Changes',
      message: `Are you sure you want to save changes to the profile for ${resolvedFull}?`,
      confirmLabel: 'Save Profile',
      variant: 'info',
      onConfirm: () => {
        if (employee) {
          const updatedCandidate: Candidate = {
            ...employee,
            title: currentForm.title || 'Mr.',
            name: resolvedFull,
            firstName: resolvedFirst,
            middleName: currentForm.middleName?.trim() || '',
            lastName: resolvedLast,
            preferredName: currentForm.preferredName?.trim() || resolvedFirst,
            gender: currentForm.gender || 'Prefer not to say',
            dateOfBirth: currentForm.dateOfBirth,
            maritalStatus: currentForm.maritalStatus || 'Single',
            nationality: currentForm.nationality || 'United States',
            bloodGroup: currentForm.bloodGroup || 'O+',
            email: currentForm.personalEmail.trim() || employee.email,
            personalEmail: currentForm.personalEmail.trim(),
            corporateEmail: currentForm.corporateEmail.trim() || employee.corporateEmail || employee.email,
            phone: currentForm.phone.trim() || currentForm.contactNumber1.trim(),
            contactNumber1: currentForm.contactNumber1.trim() || currentForm.phone.trim(),
            contactNumber2: currentForm.contactNumber2.trim(),
            githubUsername: currentForm.githubUsername.trim(),
            linkedinUrl: currentForm.linkedinUrl.trim(),
            jobTitle: currentForm.jobTitle.trim(),
            department: currentForm.department.trim(),
            officeLocation: currentForm.workLocation,
            employmentType: currentForm.employmentType as any,
            workModel: currentForm.workModel as any,
            line1Manager: currentForm.line1Manager.trim(),
            manager: currentForm.line1Manager.trim(),
            line2Manager: currentForm.line2Manager.trim(),
            startDate: currentForm.startDate,
            address: {
              street: currentForm.address.trim(),
              city: currentForm.city.trim(),
              state: currentForm.state.trim(),
              zipCode: currentForm.zipCode.trim(),
              country: employee.address?.country || 'United States'
            }
          };

          if (onEmployeeUpdated) {
            onEmployeeUpdated(updatedCandidate);
          }
          addProfileHistoryLog(
            'Employee Profile & Employment Record Updated',
            'Role & Management',
            `Updated profile for ${resolvedFull} (Title: ${currentForm.jobTitle}, Department: ${currentForm.department}, Manager: ${currentForm.line1Manager}, Location: ${currentForm.workLocation}).`,
            'info'
          );
          showToastSuccess('Employee Record Updated', `${resolvedFull}'s corporate profile and reporting details have been saved.`);
        } else {
          if (!isManager) {
            updatePersonalInfo({
              title: currentForm.title || 'Mr.',
              name: resolvedFull,
              firstName: resolvedFirst,
              middleName: currentForm.middleName?.trim() || '',
              lastName: resolvedLast,
              preferredName: currentForm.preferredName?.trim() || resolvedFirst,
              gender: currentForm.gender || 'Prefer not to say',
              dateOfBirth: currentForm.dateOfBirth,
              maritalStatus: currentForm.maritalStatus || 'Single',
              nationality: currentForm.nationality || 'United States',
              bloodGroup: currentForm.bloodGroup || 'O+',
              personalEmail: currentForm.personalEmail.trim(),
              phone: currentForm.phone.trim() || currentForm.contactNumber1.trim(),
              contactNumber1: currentForm.contactNumber1.trim() || currentForm.phone.trim(),
              contactNumber2: currentForm.contactNumber2.trim(),
              githubUsername: currentForm.githubUsername.trim(),
              linkedinUrl: currentForm.linkedinUrl.trim(),
              education: currentForm.education?.trim() || effectiveFlowData.personalInfo.education,
              workLocation: currentForm.workLocation
            });
          }
          addProfileHistoryLog(
            'Personal Profile & Demographics Updated',
            'Demographics',
            `Updated profile details for ${resolvedFull} (Education: ${currentForm.education}, Blood Group: ${currentForm.bloodGroup}, Location: ${currentForm.workLocation}).`,
            'info'
          );
          showToastSuccess('Profile Updated', 'Your profile details and address records have been saved.');
        }

        const storageKey = employee ? `employee_profile_${employee.id}` : (isManager ? 'manager_profile_custom' : 'employee_profile_custom');
        localStorage.setItem(storageKey, JSON.stringify(currentForm));
        localStorage.setItem('quantira_employee_custom_values', JSON.stringify(employeeCustomValues));
        setIsEditingProfile(false);
      }
    });
  };

  // Contact & Residential Address Dedicated Editing State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    personalEmail: '',
    phone: '',
    contactNumber1: '',
    contactNumber2: '',
    githubUsername: '',
    linkedinUrl: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    setIsEditingContact(false);
  }, [activeTab]);

  const handleStartEditContact = () => {
    setContactForm({
      personalEmail: profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail || '',
      phone: profileForm.phone || profileForm.contactNumber1 || effectiveFlowData.personalInfo?.phone || '',
      contactNumber1: profileForm.contactNumber1 || profileForm.phone || effectiveFlowData.personalInfo?.contactNumber1 || '',
      contactNumber2: profileForm.contactNumber2 || effectiveFlowData.personalInfo?.contactNumber2 || '',
      githubUsername: profileForm.githubUsername || effectiveFlowData.personalInfo?.githubUsername || '',
      linkedinUrl: profileForm.linkedinUrl || effectiveFlowData.personalInfo?.linkedinUrl || '',
      address: profileForm.address || '',
      city: profileForm.city || '',
      state: profileForm.state || '',
      zipCode: profileForm.zipCode || ''
    });
    setIsEditingContact(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.personalEmail.trim()) {
      showToastError('Validation Error', 'Personal email is required.');
      return;
    }
    if (!contactForm.phone.trim() && !contactForm.contactNumber1.trim()) {
      showToastError('Validation Error', 'Primary contact phone number is required.');
      return;
    }
    if (!contactForm.address.trim()) {
      showToastError('Validation Error', 'Residential street address is required.');
      return;
    }

    const updatedProfileForm = {
      ...profileForm,
      personalEmail: contactForm.personalEmail.trim(),
      phone: contactForm.phone.trim() || contactForm.contactNumber1.trim(),
      contactNumber1: contactForm.contactNumber1.trim() || contactForm.phone.trim(),
      contactNumber2: contactForm.contactNumber2.trim(),
      githubUsername: contactForm.githubUsername.trim(),
      linkedinUrl: contactForm.linkedinUrl.trim(),
      address: contactForm.address.trim(),
      city: contactForm.city.trim(),
      state: contactForm.state.trim(),
      zipCode: contactForm.zipCode.trim()
    };
    setProfileForm(updatedProfileForm);

    if (employee) {
      const updatedCandidate: Candidate = {
        ...employee,
        email: contactForm.personalEmail.trim(),
        personalEmail: contactForm.personalEmail.trim(),
        phone: contactForm.phone.trim() || contactForm.contactNumber1.trim(),
        contactNumber1: contactForm.contactNumber1.trim() || contactForm.phone.trim(),
        contactNumber2: contactForm.contactNumber2.trim(),
        githubUsername: contactForm.githubUsername.trim(),
        linkedinUrl: contactForm.linkedinUrl.trim(),
        address: {
          street: contactForm.address.trim(),
          city: contactForm.city.trim(),
          state: contactForm.state.trim(),
          zipCode: contactForm.zipCode.trim(),
          country: employee.address?.country || 'United States'
        }
      };

      if (onEmployeeUpdated) {
        onEmployeeUpdated(updatedCandidate);
      }
      addProfileHistoryLog(
        'Employee Contact & Address Updated',
        'Contact & Address',
        `Updated contact information and residential address (${contactForm.address}, ${contactForm.city}, ${contactForm.state} ${contactForm.zipCode}).`,
        'info'
      );
      showToastSuccess('Contact & Address Saved', 'Employee contact details and residential address updated.');
    } else {
      if (!isManager) {
        updatePersonalInfo({
          personalEmail: contactForm.personalEmail.trim(),
          phone: contactForm.phone.trim() || contactForm.contactNumber1.trim(),
          contactNumber1: contactForm.contactNumber1.trim() || contactForm.phone.trim(),
          contactNumber2: contactForm.contactNumber2.trim(),
          githubUsername: contactForm.githubUsername.trim(),
          linkedinUrl: contactForm.linkedinUrl.trim(),
          address: contactForm.address.trim(),
          city: contactForm.city.trim(),
          state: contactForm.state.trim(),
          zipCode: contactForm.zipCode.trim()
        });
      }
      addProfileHistoryLog(
        'Contact Details & Residential Address Updated',
        'Contact & Address',
        `Updated personal contact information and residential address (${contactForm.address}, ${contactForm.city}, ${contactForm.state} ${contactForm.zipCode}).`,
        'info'
      );
      showToastSuccess('Contact & Address Saved', 'Your contact details and residential address have been saved.');
    }

    const storageKey = employee ? `employee_profile_${employee.id}` : (isManager ? 'manager_profile_custom' : 'employee_profile_custom');
    localStorage.setItem(storageKey, JSON.stringify(updatedProfileForm));

    try {
      const flowKey = employee ? `onboarding_flow_${employee.id}` : 'onboarding_flow_data';
      const flowRaw = localStorage.getItem(flowKey);
      if (flowRaw) {
        const parsedFlow = JSON.parse(flowRaw);
        if (parsedFlow.personalInfo) {
          parsedFlow.personalInfo.personalEmail = contactForm.personalEmail.trim();
          parsedFlow.personalInfo.phone = contactForm.phone.trim() || contactForm.contactNumber1.trim();
          parsedFlow.personalInfo.contactNumber1 = contactForm.contactNumber1.trim() || contactForm.phone.trim();
          parsedFlow.personalInfo.contactNumber2 = contactForm.contactNumber2.trim();
          parsedFlow.personalInfo.githubUsername = contactForm.githubUsername.trim();
          parsedFlow.personalInfo.linkedinUrl = contactForm.linkedinUrl.trim();
          parsedFlow.personalInfo.address = contactForm.address.trim();
          parsedFlow.personalInfo.city = contactForm.city.trim();
          parsedFlow.personalInfo.state = contactForm.state.trim();
          parsedFlow.personalInfo.zipCode = contactForm.zipCode.trim();
        }
        localStorage.setItem(flowKey, JSON.stringify(parsedFlow));
      }
    } catch {}

    setIsEditingContact(false);
  };

  // Multi-Emergency Contacts State
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    try {
      const raw = localStorage.getItem('employee_emergency_contacts');
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_EMERGENCY_CONTACTS;
  });

  useEffect(() => {
    if (employee) {
      try {
        const customKey = `employee_emergency_contacts_${employee.id}`;
        const savedCustom = localStorage.getItem(customKey);
        if (savedCustom) {
          setEmergencyContacts(JSON.parse(savedCustom));
          return;
        }
      } catch {}
      if (employee.emergencyContacts && Array.isArray(employee.emergencyContacts) && employee.emergencyContacts.length > 0) {
        setEmergencyContacts(
          employee.emergencyContacts.map((c: any, idx: number) => ({
            id: c.id || `emg-${idx}`,
            name: c.name || '',
            relationship: c.relationship || 'Spouse',
            phone: c.phone || '',
            altPhone: c.altPhone || '',
            email: c.email || '',
            isPrimary: c.isPrimary ?? (idx === 0)
          }))
        );
        return;
      }
      if (effectiveFlowData.personalInfo.emergencyContacts && Array.isArray(effectiveFlowData.personalInfo.emergencyContacts) && effectiveFlowData.personalInfo.emergencyContacts.length > 0) {
        setEmergencyContacts(
          effectiveFlowData.personalInfo.emergencyContacts.map((c: any, idx: number) => ({
            id: c.id || `emg-${idx}`,
            name: c.name || '',
            relationship: c.relationship || 'Spouse',
            phone: c.phone || '',
            altPhone: c.altPhone || '',
            email: c.email || '',
            isPrimary: c.isPrimary ?? (idx === 0)
          }))
        );
        return;
      }
    }
    try {
      const raw = localStorage.getItem('employee_emergency_contacts');
      if (raw) {
        setEmergencyContacts(JSON.parse(raw));
        return;
      }
    } catch {}
    setEmergencyContacts(INITIAL_EMERGENCY_CONTACTS);
  }, [employee?.id, employee?.emergencyContacts, effectiveFlowData.personalInfo.emergencyContacts]);

  const [showEmgModal, setShowEmgModal] = useState(false);
  const [editingEmgContactId, setEditingEmgContactId] = useState<string | null>(null);
  const [emgForm, setEmgForm] = useState<Omit<EmergencyContact, 'id'>>({
    name: '',
    relationship: 'Spouse',
    phone: '',
    altPhone: '',
    email: '',
    isPrimary: false
  });

  const handleOpenAddEmg = () => {
    setEditingEmgContactId(null);
    setEmgForm({
      name: '',
      relationship: 'Spouse',
      phone: '',
      altPhone: '',
      email: '',
      isPrimary: emergencyContacts.length === 0
    });
    setShowEmgModal(true);
  };

  const handleOpenEditEmg = (contact: EmergencyContact) => {
    setEditingEmgContactId(contact.id);
    setEmgForm({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      altPhone: contact.altPhone || '',
      email: contact.email,
      isPrimary: contact.isPrimary
    });
    setShowEmgModal(true);
  };

  const handleSaveEmgContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emgForm.name.trim() || !emgForm.phone.trim()) {
      showToastError('Required Fields Missing', 'Please provide a contact name and phone number.');
      return;
    }

    let updated: EmergencyContact[];
    if (editingEmgContactId) {
      updated = emergencyContacts.map((c) => {
        if (c.id === editingEmgContactId) {
          return { ...c, ...emgForm };
        }
        return emgForm.isPrimary ? { ...c, isPrimary: false } : c;
      });
      addProfileHistoryLog(
        'Emergency Contact Details Updated',
        'Family & Dependents',
        `Updated emergency contact for ${emgForm.name} (${emgForm.relationship}) - Phone: ${emgForm.phone}.`,
        'info'
      );
      showToastSuccess('Emergency Contact Updated', `${emgForm.name}'s contact details updated.`);
    } else {
      const newContact: EmergencyContact = {
        id: `emg-${Date.now()}`,
        ...emgForm
      };
      if (emgForm.isPrimary) {
        updated = emergencyContacts.map((c) => ({ ...c, isPrimary: false })).concat(newContact);
      } else {
        updated = [...emergencyContacts, newContact];
      }
      addProfileHistoryLog(
        'Emergency Contact Registered',
        'Family & Dependents',
        `Added emergency contact ${emgForm.name} (${emgForm.relationship}) - Phone: ${emgForm.phone}${emgForm.isPrimary ? ' [Primary Contact]' : ''}.`,
        'info'
      );
      showToastSuccess('Emergency Contact Added', `${emgForm.name} added to emergency records.`);
    }

    setEmergencyContacts(updated);
    if (employee?.id) {
      localStorage.setItem(`employee_emergency_contacts_${employee.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('employee_emergency_contacts', JSON.stringify(updated));
    setShowEmgModal(false);
  };

  const handleDeleteEmgContact = (id: string, name: string) => {
    if (emergencyContacts.length <= 1) {
      showToastError('Cannot Delete', 'You must maintain at least one emergency contact on file.');
      return;
    }
    setActionConfirmation({
      title: 'Delete Emergency Contact',
      message: `Are you sure you want to remove ${name} from emergency contacts?`,
      confirmLabel: 'Delete Contact',
      variant: 'danger',
      onConfirm: () => {
        const updated = emergencyContacts.filter((c) => c.id !== id);
        if (!updated.some((c) => c.isPrimary) && updated.length > 0) {
          updated[0].isPrimary = true;
        }
        setEmergencyContacts(updated);
        if (employee?.id) {
          localStorage.setItem(`employee_emergency_contacts_${employee.id}`, JSON.stringify(updated));
        }
        localStorage.setItem('employee_emergency_contacts', JSON.stringify(updated));
        addProfileHistoryLog(
          'Emergency Contact Removed',
          'Family & Dependents',
          `Removed ${name} from profile emergency contacts.`,
          'warning'
        );
        showToastSuccess('Contact Removed', `${name} has been removed from emergency contacts.`);
      }
    });
  };

  const handleSetPrimaryEmg = (id: string) => {
    const updated = emergencyContacts.map((c) => ({
      ...c,
      isPrimary: c.id === id
    }));
    setEmergencyContacts(updated);
    if (employee?.id) {
      localStorage.setItem(`employee_emergency_contacts_${employee.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('employee_emergency_contacts', JSON.stringify(updated));
    const targetContact = emergencyContacts.find((c) => c.id === id);
    addProfileHistoryLog(
      'Primary Emergency Contact Designated',
      'Family & Dependents',
      `Designated ${targetContact?.name || 'Contact'} as the primary emergency contact.`,
      'info'
    );
    showToastSuccess('Primary Contact Set', 'Primary designated emergency contact updated.');
  };

  // Family Dependents State
  const [dependentsList, setDependentsList] = useState<DependentRecord[]>(() => {
    try {
      const depKey = employee?.id ? `employee_dependents_${employee.id}` : `employee_dependents`;
      const saved = localStorage.getItem(depKey);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
      if (employee?.dependents && Array.isArray(employee.dependents) && employee.dependents.length > 0) {
        return employee.dependents;
      }
      if (effectiveFlowData.personalInfo.dependents && Array.isArray(effectiveFlowData.personalInfo.dependents) && effectiveFlowData.personalInfo.dependents.length > 0) {
        return effectiveFlowData.personalInfo.dependents;
      }
    } catch {}
    return INITIAL_DEPENDENTS;
  });

  useEffect(() => {
    if (employee) {
      try {
        const depKey = `employee_dependents_${employee.id}`;
        const saved = localStorage.getItem(depKey);
        if (saved) {
          setDependentsList(JSON.parse(saved));
          return;
        }
      } catch {}
      if (employee.dependents && Array.isArray(employee.dependents) && employee.dependents.length > 0) {
        setDependentsList(employee.dependents);
        return;
      }
      if (effectiveFlowData.personalInfo.dependents && Array.isArray(effectiveFlowData.personalInfo.dependents) && effectiveFlowData.personalInfo.dependents.length > 0) {
        setDependentsList(effectiveFlowData.personalInfo.dependents);
        return;
      }
    }
  }, [employee?.id, employee?.dependents, effectiveFlowData.personalInfo.dependents]);

  const [showDepModal, setShowDepModal] = useState(false);
  const [editingDepId, setEditingDepId] = useState<string | null>(null);
  const [depForm, setDepForm] = useState<Omit<DependentRecord, 'id'>>({
    name: '',
    relationship: 'Spouse',
    dateOfBirth: '',
    gender: 'Female',
    phone: '',
    email: ''
  });

  const handleOpenAddDep = () => {
    setEditingDepId(null);
    setDepForm({
      name: '',
      relationship: 'Spouse',
      dateOfBirth: '',
      gender: 'Female',
      phone: '',
      email: ''
    });
    setShowDepModal(true);
  };

  const handleOpenEditDep = (dep: DependentRecord) => {
    setEditingDepId(dep.id);
    setDepForm({
      name: dep.name,
      relationship: dep.relationship,
      dateOfBirth: dep.dateOfBirth || '',
      gender: dep.gender || 'Female',
      phone: dep.phone || '',
      email: dep.email || ''
    });
    setShowDepModal(true);
  };

  const handleSaveDep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depForm.name.trim()) {
      showToastError('Validation Error', 'Please provide the dependent name.');
      return;
    }
    let updated: DependentRecord[];
    if (editingDepId) {
      updated = dependentsList.map((d) => (d.id === editingDepId ? { ...d, ...depForm } : d));
      addProfileHistoryLog(
        'Family Dependent Record Updated',
        'Family & Dependents',
        `Updated dependent profile for ${depForm.name} (${depForm.relationship}).`,
        'info'
      );
      showToastSuccess('Dependent Updated', `${depForm.name}'s dependent records updated.`);
    } else {
      const newDep: DependentRecord = {
        id: `dep-${Date.now()}`,
        ...depForm
      };
      updated = [...dependentsList, newDep];
      addProfileHistoryLog(
        'Family Dependent Registered',
        'Family & Dependents',
        `Registered new dependent: ${depForm.name} (${depForm.relationship}${depForm.dateOfBirth ? `, DOB: ${depForm.dateOfBirth}` : ''}).`,
        'info'
      );
      showToastSuccess('Dependent Added', `${depForm.name} registered as dependent.`);
    }
    setDependentsList(updated);
    const depKey = employee?.id ? `employee_dependents_${employee.id}` : 'employee_dependents';
    localStorage.setItem(depKey, JSON.stringify(updated));
    localStorage.setItem('employee_dependents', JSON.stringify(updated));
    setShowDepModal(false);
  };

  const handleDeleteDep = (id: string, name: string) => {
    setActionConfirmation({
      title: 'Remove Family Dependent',
      message: `Are you sure you want to remove ${name} from your registered dependents?`,
      confirmLabel: 'Remove Dependent',
      variant: 'danger',
      onConfirm: () => {
        const updated = dependentsList.filter((d) => d.id !== id);
        setDependentsList(updated);
        const depKey = employee?.id ? `employee_dependents_${employee.id}` : 'employee_dependents';
        localStorage.setItem(depKey, JSON.stringify(updated));
        localStorage.setItem('employee_dependents', JSON.stringify(updated));
        addProfileHistoryLog(
          'Family Dependent Removed',
          'Family & Dependents',
          `Removed ${name} from registered family dependents.`,
          'warning'
        );
        showToastSuccess('Dependent Removed', `${name} has been removed from dependents.`);
      }
    });
  };

  // Digital Legal Signature State
  const [digitalSignatureUrl, setDigitalSignatureUrl] = useState<string | null>(() => {
    return (
      effectiveFlowData.emailSignature?.digitalSignatureUrl ||
      localStorage.getItem('employee_digital_sig') ||
      DEFAULT_SAMPLE_SIGNATURE
    );
  });
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw' | 'type'>('upload');
  const [penColor, setPenColor] = useState<string>('#1e3a8a');
  const [penWidth, setPenWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [typedName, setTypedName] = useState(
    flowData.personalInfo.firstName ? `${flowData.personalInfo.firstName} ${flowData.personalInfo.lastName}` : 'John Doe'
  );

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Upload Signature Handler
  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToastError('Invalid Format', 'Please upload a PNG, JPG, or SVG image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToastError('File Too Large', 'Signature image must be less than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedPreview(dataUrl);
      showToastSuccess('Signature Uploaded', 'Preview ready. Click "Save as Active Signature" to finalize.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      showToastError('Empty Canvas', 'Please draw your signature before saving.');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    setDigitalSignatureUrl(dataUrl);
    localStorage.setItem('employee_digital_sig', dataUrl);
    setIsEditingSignature(false);
    addProfileHistoryLog(
      'Digital Signature Created (Hand-Drawn)',
      'Documents & Compliance',
      'New cryptographic hand-drawn signature captured and sealed on profile.',
      'success'
    );
    showToastSuccess('Signature Saved', 'Your drawn digital signature is now active on all agreements.');
  };

  const handleSaveUploadedSignature = () => {
    if (!uploadedPreview) {
      showToastError('No File Selected', 'Please upload a signature file first.');
      return;
    }
    setDigitalSignatureUrl(uploadedPreview);
    localStorage.setItem('employee_digital_sig', uploadedPreview);
    setIsEditingSignature(false);
    addProfileHistoryLog(
      'Digital Signature Uploaded',
      'Documents & Compliance',
      'Scanned signature file uploaded and designated for corporate agreements.',
      'info'
    );
    showToastSuccess('Signature Saved', 'Your uploaded digital signature is now active on all agreements.');
  };

  const handleSaveTypedSignature = () => {
    if (!typedName.trim()) {
      showToastError('Name Required', 'Please enter your name for the signature.');
      return;
    }
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400;
    tempCanvas.height = 100;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.font = 'italic bold 38px "Brush Script MT", "Segoe Script", cursive';
      ctx.fillStyle = penColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName.trim(), 200, 50);
      const dataUrl = tempCanvas.toDataURL('image/png');
      setDigitalSignatureUrl(dataUrl);
      localStorage.setItem('employee_digital_sig', dataUrl);
      setIsEditingSignature(false);
      addProfileHistoryLog(
        'Digital Signature Created (Typed)',
        'Documents & Compliance',
        `Typed script signature generated and bound to profile for ${typedName.trim()}.`,
        'info'
      );
      showToastSuccess('Signature Saved', 'Your typed digital signature is now active on all agreements.');
    }
  };

  const handleDownloadSignature = () => {
    if (!digitalSignatureUrl) return;
    const a = document.createElement('a');
    a.href = digitalSignatureUrl;
    a.download = `digital_signature_${flowData.personalInfo.firstName || 'employee'}_${flowData.personalInfo.lastName || 'signature'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRemoveSignature = () => {
    setDigitalSignatureUrl(null);
    localStorage.removeItem('employee_digital_sig');
    setUploadedPreview(null);
    clearCanvas();
    setIsEditingSignature(true);
    addProfileHistoryLog(
      'Digital Signature Removed',
      'Documents & Compliance',
      'Active signature removed. Profile requires new digital signature configuration.',
      'warning'
    );
    showToastSuccess('Signature Removed', 'Digital signature removed. You can now upload or draw a new one.');
  };

  // Password Change Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);

  const isCompleted = flowData.status === 'Completed';
  const completedCount = flowData.completedSteps.length;
  const progressPercent = isCompleted ? 100 : Math.min(100, Math.round((completedCount / 10) * 100));

  const handleCopySignature = () => {
    const sigText = `${flowData.personalInfo.firstName} ${flowData.personalInfo.lastName}\n${flowData.personalInfo.jobTitle} • ${flowData.personalInfo.department}\nQuantira Technologies, Inc.\nDirect: ${flowData.emailSignature.phone || '+1 (415) 555-0192'} | Mobile: ${flowData.emailSignature.mobile || '+1 (415) 555-0199'}\nwww.quantiratechnologies.com`;
    navigator.clipboard.writeText(sigText);
    setCopiedSignature(true);
    showToastSuccess('Copied to Clipboard', 'Email signature copied.');
    setTimeout(() => setCopiedSignature(false), 2000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToastError('Password Too Short', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToastError('Passwords Do Not Match', 'Confirmation password does not match.');
      return;
    }
    setIsUpdatingPw(true);
    setTimeout(() => {
      setIsUpdatingPw(false);
      setNewPassword('');
      setConfirmPassword('');
      addProfileHistoryLog(
        'Account Password Updated',
        'Security & SSO',
        'User credentials and password updated with cryptographic hashing.',
        'success'
      );
      showToastSuccess('Password Updated', 'Your account password has been updated securely.');
    }, 600);
  };

  useEffect(() => {
    if (readOnly && (activeTab === 'documents' || activeTab === 'signature' || activeTab === 'password')) {
      setActiveTab('overview');
    }
  }, [readOnly, activeTab]);

  // Password strength calculation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-16">
      {/* Top Back Navigation (Placed above tabs container) */}
      {onBack && (
        <div className="flex items-center justify-start">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            {readOnly ? 'Back to My Team' : 'Back to Employee Directory'}
          </Button>
        </div>
      )}

      {/* Top Bar for HR & Super Admin: Dashboard vs. Employee Details Switcher + Employee Selector Dropdown */}
      {canAccessDashboardTab && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setPrimaryTab('dashboard')}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                effectivePrimaryTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setPrimaryTab('details')}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                effectivePrimaryTab === 'details'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              )}
            >
              <User className="w-4 h-4" />
              <span>Employee Details</span>
            </button>
          </div>

          {/* Employee Dropdown List */}
          {candidates && candidates.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <label htmlFor="employee-switcher" className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Select Employee:</span>
              </label>
              <div className="relative min-w-[220px] sm:min-w-[280px]">
                <select
                  id="employee-switcher"
                  value={selectedEmpId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedEmpId(newId);
                    const found = candidates.find((c) => c.id === newId);
                    if (found && onEmployeeUpdated) {
                      onEmployeeUpdated(found);
                    }
                  }}
                  className="w-full pl-3 pr-8 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-2xs appearance-none"
                >
                  {candidates.map((c) => {
                    const fullName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
                    return (
                      <option key={c.id} value={c.id}>
                        {fullName} ({c.jobTitle || 'Team Member'} - {c.id})
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {effectivePrimaryTab === 'dashboard' && canAccessDashboardTab ? (
        <EmployeeDashboardPage
          employee={employee}
          onViewProfile={() => setPrimaryTab('details')}
        />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* Hero Banner: Identity & Verified Record Status */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white p-7 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-blue-400 via-indigo-300 to-white shadow-2xl relative overflow-hidden">
                <img
                  src={effectiveProfile.avatar}
                  alt={effectiveProfile.name}
                  className="w-full h-full rounded-full object-cover shadow-inner"
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAvatarUrl(effectiveProfile.avatar);
                      setAvatarUploadError(null);
                      setShowEditAvatarModal(true);
                    }}
                    className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                    title="Change Profile Picture"
                    aria-label="Change Profile Picture"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                  </button>
                )}
              </div>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatarUrl(effectiveProfile.avatar);
                    setAvatarUploadError(null);
                    setShowEditAvatarModal(true);
                  }}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full ring-4 ring-slate-950 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  title="Change Profile Picture"
                  aria-label="Change Profile Picture"
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
                </button>
              ) : (
                <span
                  className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-slate-950 shadow-lg flex items-center justify-center"
                  title="Active Profile"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {effectiveProfile.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-blue-500/25 text-blue-200 border border-blue-400/40 shadow-xs">
                  <BadgeCheck className="w-4 h-4 text-blue-300" />
                  ID: {effectiveProfile.employeeId}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Verified &amp; Active
                </span>
                <button
                  type="button"
                  onClick={() => setShowProfileHistoryModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-white/15 hover:bg-white/25 text-blue-100 hover:text-white border border-white/25 shadow-xs transition-all cursor-pointer backdrop-blur-xs active:scale-95"
                  title="View Profile History & Audit Timeline"
                >
                  <History className="w-3.5 h-3.5 text-blue-300" />
                  Profile History ({profileHistoryList.length})
                </button>
              </div>

              <p className="text-lg font-bold text-slate-200">
                {effectiveProfile.jobTitle} • <span className="text-blue-300 font-semibold">{effectiveProfile.department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Start Date: <strong className="text-white">{formatDate(effectiveProfile.startDate)}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {effectiveProfile.workLocation} ({effectiveProfile.employmentType})
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero: Live Attendance & History & Activity Action */}
          <div className="flex flex-col gap-2.5 self-start lg:self-center w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shadow-2xl">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-300" />
                  <span className="text-xs text-blue-200 font-bold">Time &amp; Attendance</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    attendanceState.isClockedIn
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                      : 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${attendanceState.isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {attendanceState.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </div>

                <LiveHeaderClockAndElapsed attendanceState={attendanceState} />
              </div>

              <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                {!readOnly ? (
                  <>
                    {attendanceState.isClockedIn ? (
                      <button
                        type="button"
                        onClick={handlePunchOut}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-950/40 transition-all active:scale-95 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Punch Out
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePunchIn}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        Punch In
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPunchHistoryModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/20 transition-all cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-blue-300" />
                      View Punch Logs
                    </button>
                  </>
                ) : (
                  <div className="space-y-1.5 text-right sm:text-center">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold block">
                      ✓ On-Duty Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPunchHistoryModal(true)}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[10px] font-semibold border border-white/20 transition-all cursor-pointer w-full"
                    >
                      <History className="w-3 h-3 text-blue-200" />
                      Inspect Timesheet
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* History & Activity Button below attendance card */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  if (employee) {
                    setActiveTab('history');
                  }
                  setShowProfileHistoryModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black border border-white/20 hover:border-white/35 transition-all shadow-lg backdrop-blur-md cursor-pointer active:scale-95 group"
                title="View Profile History & Activity Timeline"
              >
                <History className="w-4 h-4 text-blue-300 group-hover:rotate-[-45deg] transition-transform" />
                <span>History &amp; Activity</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/30 text-blue-200 border border-blue-400/40 ml-0.5">
                  {profileHistoryList.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Main Profile Content Area */}
      {/* ========================================================================= */}
      <div className="w-full space-y-6">
        {employee && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
            {PROFILE_TABS.filter((t) => !readOnly ? true : (t.id !== 'password' && t.id !== 'documents' && t.id !== 'signature')).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
          {/* ========================================================================= */}
          {/* 1. OVERVIEW TAB */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Executive Profile Overview
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('history')}
                    leftIcon={<History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    className="text-xs font-bold"
                  >
                    View History Log ({profileHistoryList.length})
                  </Button>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    HRIS Synchronized
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Quick Stat Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Tile 1: Employment */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Employment Status</span>
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 block truncate">
                      {effectiveProfile.employmentType || 'Full-time Regular'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block truncate">
                      {effectiveProfile.jobTitle} • {effectiveProfile.department}
                    </span>
                  </div>

                  {/* Tile 2: Corporate SSO & Email */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Corporate Account</span>
                    <a
                      href={`mailto:${effectiveProfile.corporateEmail || effectiveProfile.email}`}
                      className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 block truncate hover:underline transition-colors"
                      title={effectiveProfile.corporateEmail || effectiveProfile.email}
                    >
                      {effectiveProfile.corporateEmail || effectiveProfile.email}
                    </a>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                      ✓ {effectiveFlowData.corporateAccount?.accountStatus || 'Provisioned & Active'}
                    </span>
                  </div>

                  {/* Tile 3: Statutory Documents */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Statutory Documents</span>
                    <span className="text-base font-extrabold text-purple-600 dark:text-purple-400 block">
                      {effectiveFlowData.documents?.filter((d: any) => d.status === 'uploaded' || d.status === 'verified').length || 0} / {effectiveFlowData.documents?.length || 15} Submitted
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block truncate">
                      {effectiveFlowData.documents?.filter((d: any) => d.status === 'uploaded' || d.status === 'verified').length === effectiveFlowData.documents?.length
                        ? '✓ All Documents Uploaded'
                        : `${(effectiveFlowData.documents?.length || 15) - (effectiveFlowData.documents?.filter((d: any) => d.status === 'uploaded' || d.status === 'verified').length || 0)} Pending Upload`}
                    </span>
                  </div>

                  {/* Tile 4: NDA & Compliance */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Policies &amp; NDA</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block truncate">
                      {effectiveFlowData.nda?.accepted ? 'Legally Executed' : 'Pending Signature'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block truncate">
                      {effectiveFlowData.nda?.accepted
                        ? `Signed by ${effectiveFlowData.nda?.signedName || effectiveProfile.name}`
                        : 'Action Required'}
                    </span>
                  </div>
                </div>

                {/* Summary Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Card 1: Personal & Legal Identity */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" /> Personal &amp; Legal Identity
                      </span>
                      <Button size="sm" variant="tertiary" onClick={() => setActiveTab('basic')} className="text-xs font-bold text-blue-600">
                        View Details &gt;
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Full Legal Name</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {effectiveProfile.title ? `${effectiveProfile.title} ` : ''}{effectiveProfile.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Employee ID</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {effectiveProfile.employeeId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Preferred Name</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {effectiveProfile.preferredName || effectiveProfile.firstName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Gender</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {effectiveProfile.gender}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Corporate Email</span>
                        <a
                          href={`mailto:${effectiveProfile.corporateEmail || effectiveProfile.email}`}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block transition-colors"
                        >
                          {effectiveProfile.corporateEmail || effectiveProfile.email}
                        </a>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[11px]">Personal Email</span>
                        {effectiveProfile.personalEmail ? (
                          <a
                            href={`mailto:${effectiveProfile.personalEmail}`}
                            className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate block transition-colors"
                          >
                            {effectiveProfile.personalEmail}
                          </a>
                        ) : (
                          <span className="font-semibold text-slate-500 truncate block">Not specified</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Contact Number 1</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                          {effectiveProfile.contactNumber1 || effectiveProfile.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Contact Number 2</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                          {effectiveProfile.contactNumber2 || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                          {formatDate(effectiveProfile.dateOfBirth)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Marital Status</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                          {effectiveProfile.maritalStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nationality</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                          {effectiveProfile.nationality}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Blood Group</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 block">
                          {effectiveProfile.bloodGroup}
                        </span>
                      </div>
                      {effectiveProfile.githubUsername && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">GitHub</span>
                          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            @{effectiveProfile.githubUsername.replace(/^@/, '')}
                          </span>
                        </div>
                      )}
                      {effectiveProfile.linkedinUrl && (
                        <div className={effectiveProfile.githubUsername ? "" : "col-span-2"}>
                          <span className="text-slate-400 block text-[11px]">LinkedIn</span>
                          <a
                            href={effectiveProfile.linkedinUrl.startsWith('http') ? effectiveProfile.linkedinUrl : `https://${effectiveProfile.linkedinUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline block truncate"
                          >
                            {effectiveProfile.linkedinUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Dependents & Emergency Contacts */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Dependents &amp; Emergency Contacts
                        </span>
                      </div>
                      <Button size="sm" variant="tertiary" onClick={() => setActiveTab('emergency')} className="text-xs font-bold text-blue-600">
                        View &amp; Manage &gt;
                      </Button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Emergency Contacts Block */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Emergency Contacts ({emergencyContacts.length})
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                            Priority Response
                          </span>
                        </div>
                        {emergencyContacts.length > 0 ? (
                          <div className="space-y-1.5">
                            {emergencyContacts.map((c) => (
                              <div key={c.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 dark:text-white truncate">{c.name}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">({c.relationship})</span>
                                    {c.isPrimary && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-mono">{c.phone}</span>
                                </div>
                                {c.email && (
                                  <span className="text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-[140px] hidden sm:block">
                                    {c.email}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">No emergency contacts registered.</p>
                        )}
                      </div>

                      {/* Family Dependents Block */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Family Dependents ({dependentsList.length})
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                            Benefits Eligible
                          </span>
                        </div>
                        {dependentsList.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {dependentsList.map((dep) => (
                              <span key={dep.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                                <span className="font-bold">{dep.name}</span>
                                <span className="text-slate-400 text-[10px]">({dep.relationship})</span>
                                {dep.dateOfBirth && <span className="text-slate-400 text-[10px]">• {dep.dateOfBirth}</span>}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">No family dependents registered.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Reporting Leadership & Placement */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" /> Reporting Leadership &amp; Placement
                      </span>
                      <Button size="sm" variant="tertiary" onClick={() => setActiveTab('reporting')} className="text-xs font-bold text-blue-600">
                        View Structure &gt;
                      </Button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Official Job Designation</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                          {effectiveProfile.jobTitle}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Department</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                            {effectiveProfile.department}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Work Location</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                            {effectiveProfile.workLocation}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Reporting Manager:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {effectiveProfile.manager || 'Marcus Brody'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Work Model:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                            {effectiveProfile.workModel || 'Hybrid'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Official Start Date:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                            {formatDate(effectiveProfile.startDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Corporate Policies & Legal Execution */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Corporate Policies &amp; Signature
                      </span>
                      <Button size="sm" variant="tertiary" onClick={() => setActiveTab('signature')} className="text-xs font-bold text-blue-600">
                        View Signature &gt;
                      </Button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">NDA &amp; Confidentiality Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          effectiveFlowData.nda?.accepted
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {effectiveFlowData.nda?.accepted ? '✓ Legally Executed' : 'Pending'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Agreement Version:</strong> {effectiveFlowData.nda?.agreementVersion || 'v2026.2'}
                        </p>
                        {effectiveFlowData.nda?.accepted ? (
                          <p className="text-slate-600 dark:text-slate-300">
                            <strong>Electronic Signature:</strong> {effectiveFlowData.nda?.signedName || effectiveProfile.name}
                            {effectiveFlowData.nda?.acceptedAt && ` on ${formatDateTime(effectiveFlowData.nda?.acceptedAt)}`}
                          </p>
                        ) : (
                          <p className="text-slate-400 italic">Signature pending completion during onboarding.</p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Official Digital Signature Stamp</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                            {digitalSignatureUrl ? '✓ Active Stamp On File' : 'Pending Upload'}
                          </span>
                        </div>
                        {digitalSignatureUrl && (
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shrink-0">
                            <img
                              src={digitalSignatureUrl}
                              alt="Signature Stamp"
                              className="max-h-6 max-w-[80px] object-contain filter dark:invert"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 5: IT Workstation & Campus Facilities */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-purple-600" /> IT Workstation &amp; Facilities
                      </span>
                      <Button size="sm" variant="tertiary" onClick={() => setActiveTab('assets')} className="text-xs font-bold text-blue-600">
                        View Assets &gt;
                      </Button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary Hardware</span>
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {effectiveFlowData.equipment?.selectedEquipment?.[0] || 'Enterprise Laptop Pro 16"'}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Allocated: {effectiveFlowData.equipment?.selectedEquipment?.length || 3} hardware items
                        </span>
                      </div>

                      {effectiveFlowData.equipment?.specialRequests && (
                        <p className="text-purple-600 dark:text-purple-400 font-medium text-[11px]">
                          Accommodations: <em>"{effectiveFlowData.equipment.specialRequests}"</em>
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Desk Location:</strong> {effectiveFlowData.officeSetup?.deskLocation || 'Building 2 - 4th Floor'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Access Clearance:</strong> {effectiveFlowData.officeSetup?.accessCardLevel || 'Standard Office Floor Access'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Parking &amp; Locker:</strong>{' '}
                          {effectiveFlowData.officeSetup?.parkingRequired
                            ? `Permit Active (${effectiveFlowData.officeSetup?.licensePlate || 'Permit Issued'})`
                            : 'No Parking Permit'}
                          {effectiveFlowData.officeSetup?.lockerRequired ? ' • Locker Allocated' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Statutory Employment Documents Status */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-amber-600" /> Statutory Employment Documents ({effectiveFlowData.documents?.filter((d: any) => d.status === 'uploaded' || d.status === 'verified').length || 0}/{effectiveFlowData.documents?.length || 15})
                      </span>
                      <Button size="sm" variant="tertiary" onClick={() => setActiveTab('documents')} className="text-xs font-bold text-blue-600">
                        View Documents &gt;
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {effectiveFlowData.documents?.map((doc: any) => {
                        const isDone = doc.status === 'uploaded' || doc.status === 'verified';
                        return (
                          <span
                            key={doc.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                              isDone
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isDone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[240px]">{doc.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 2. BASIC INFORMATION TAB */}
          {/* ========================================================================= */}
          {activeTab === 'basic' && (
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Basic &amp; Demographic Information
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Personal identity, statutory demographics, and online professional profiles.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    Identity Verified
                  </span>
                  {canEditBasicInfo && (
                    <Button
                      size="sm"
                      variant={isEditingProfile ? "secondary" : "primary"}
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      leftIcon={isEditingProfile ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      {isEditingProfile ? 'Cancel Edit' : 'Edit Basic Information'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {canEditBasicInfo && isEditingProfile ? (
                  /* Profile Edit Form */
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
                      <span>Update your profile details below. Changes are saved to your employee record in real-time.</span>
                    </div>

                    {/* Section 1: Personal & Legal Demographics */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-600" /> Personal &amp; Legal Identity
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Title</label>
                          <select
                            value={profileForm.title || 'Mr.'}
                            onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="Mr.">Mr.</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Dr.">Dr.</option>
                            <option value="Mx.">Mx.</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">First Name *</label>
                          <input
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProfileForm({
                                ...profileForm,
                                firstName: val,
                                fullName: `${val} ${profileForm.middleName ? profileForm.middleName + ' ' : ''}${profileForm.lastName}`.trim()
                              });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Middle Name</label>
                          <input
                            type="text"
                            value={profileForm.middleName || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProfileForm({
                                ...profileForm,
                                middleName: val,
                                fullName: `${profileForm.firstName} ${val ? val + ' ' : ''}${profileForm.lastName}`.trim()
                              });
                            }}
                            placeholder="Optional"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Last Name *</label>
                          <input
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProfileForm({
                                ...profileForm,
                                lastName: val,
                                fullName: `${profileForm.firstName} ${profileForm.middleName ? profileForm.middleName + ' ' : ''}${val}`.trim()
                              });
                            }}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Preferred / Display Name</label>
                          <input
                            type="text"
                            value={profileForm.preferredName || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, preferredName: e.target.value })}
                            placeholder="Preferred Name"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Gender</label>
                          <select
                            value={profileForm.gender || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">Select Gender...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-Binary">Non-Binary</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Date of Birth</label>
                          <input
                            type="date"
                            value={profileForm.dateOfBirth}
                            onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Marital Status</label>
                          <select
                            value={profileForm.maritalStatus || 'Single'}
                            onChange={(e) => setProfileForm({ ...profileForm, maritalStatus: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Nationality</label>
                          <select
                            value={profileForm.nationality || 'United States'}
                            onChange={(e) => setProfileForm({ ...profileForm, nationality: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="India">India</option>
                            <option value="Germany">Germany</option>
                            <option value="France">France</option>
                            <option value="Australia">Australia</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Blood Group</label>
                          <select
                            value={profileForm.bloodGroup || 'O+'}
                            onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Highest Level of Education</label>
                          <input
                            type="text"
                            value={profileForm.education || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                            placeholder="e.g. B.S. in Computer Science"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Primary Work Location</label>
                          <select
                            value={profileForm.workLocation}
                            onChange={(e) => setProfileForm({ ...profileForm, workLocation: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="San Francisco HQ">San Francisco HQ (101 California St, CA)</option>
                            <option value="New York Office">New York Office (125 W 55th St, NY)</option>
                            <option value="Austin Technology Center">Austin Technology Center (500 W 2nd St, TX)</option>
                            <option value="Remote USA">Remote USA (Distributed Engineering)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Contact Numbers & Professional Socials */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600" /> Contact Numbers &amp; Professional Links
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                            <span>Corporate Email</span>
                            <span className="text-[10px] text-slate-400 font-normal">HR Managed</span>
                          </label>
                          <input
                            type="email"
                            value={effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}
                            disabled
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-500 cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Personal Email *</label>
                          <input
                            type="email"
                            value={profileForm.personalEmail}
                            onChange={(e) => setProfileForm({ ...profileForm, personalEmail: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Contact Number 1 (Primary) *</label>
                          <input
                            type="tel"
                            value={profileForm.contactNumber1 || profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, contactNumber1: e.target.value, phone: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Contact Number 2 (Secondary)</label>
                          <input
                            type="tel"
                            value={profileForm.contactNumber2 || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, contactNumber2: e.target.value })}
                            placeholder="Optional alternate"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">GitHub Username</label>
                          <input
                            type="text"
                            value={profileForm.githubUsername || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, githubUsername: e.target.value })}
                            placeholder="e.g. john-doe-dev"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">LinkedIn Profile URL</label>
                          <input
                            type="url"
                            value={profileForm.linkedinUrl || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Administrative & Role Details Section */}
                    {canEditEmploymentAndReporting ? (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Employment, Classification & Reporting Lines
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Job Title / Designation *</label>
                            <input
                              type="text"
                              value={profileForm.jobTitle}
                              onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Department *</label>
                            <select
                              value={profileForm.department}
                              onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="Engineering">Engineering</option>
                              <option value="Product">Product</option>
                              <option value="Design">Design</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Sales">Sales</option>
                              <option value="Human Resources">Human Resources</option>
                              <option value="Finance">Finance</option>
                              <option value="Legal">Legal & Compliance</option>
                              <option value="Operations">Operations</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Employee ID</label>
                            <input
                              type="text"
                              value={profileForm.employeeId}
                              onChange={(e) => setProfileForm({ ...profileForm, employeeId: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Employment Type</label>
                            <select
                              value={profileForm.employmentType}
                              onChange={(e) => setProfileForm({ ...profileForm, employmentType: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="Full-time Regular">Full-time Regular</option>
                              <option value="Full-time">Full-time</option>
                              <option value="Contract">Contract</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Executive">Executive</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Work Model</label>
                            <select
                              value={profileForm.workModel}
                              onChange={(e) => setProfileForm({ ...profileForm, workModel: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="Hybrid">Hybrid</option>
                              <option value="Remote">Remote</option>
                              <option value="On-site">On-site</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Official Start Date</label>
                            <input
                              type="date"
                              value={profileForm.startDate}
                              onChange={(e) => setProfileForm({ ...profileForm, startDate: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Reporting Manager</label>
                            <input
                              type="text"
                              value={profileForm.line1Manager}
                              onChange={(e) => setProfileForm({ ...profileForm, line1Manager: e.target.value })}
                              placeholder="e.g. Marcus Brody"
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Secondary / Executive Manager</label>
                            <input
                              type="text"
                              value={profileForm.line2Manager}
                              onChange={(e) => setProfileForm({ ...profileForm, line2Manager: e.target.value })}
                              placeholder="e.g. Alexandra Wright"
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              Employment &amp; Reporting Details
                            </h3>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Lock className="w-3 h-3 text-slate-400" /> Corporate Controlled (HR &amp; Super Admin Directory Edit Only)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Designation</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.jobTitle}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Department</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.department}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Employee ID</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.employeeId}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Employment Type</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.employmentType}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Work Model</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.workModel}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Start Date</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.startDate}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Reporting Manager</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.line1Manager}</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Secondary / Executive Manager</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{profileForm.line2Manager}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Custom Fields in Edit Form */}
                    {profileCustomFields.length > 0 && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Custom Profile Attributes (Super Admin Configured)
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {profileCustomFields.map((f) => (
                            <div key={f.id} className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                {f.label} {f.required && '*'}
                              </label>
                              {f.type === 'select' && f.options ? (
                                <select
                                  value={employeeCustomValues[f.key] || ''}
                                  onChange={(e) =>
                                    setEmployeeCustomValues({
                                      ...employeeCustomValues,
                                      [f.key]: e.target.value
                                    })
                                  }
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                  <option value="">Select an option</option>
                                  {f.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={f.type === 'number' ? 'number' : 'text'}
                                  value={employeeCustomValues[f.key] || ''}
                                  placeholder={`Enter ${f.label.toLowerCase()}`}
                                  onChange={(e) =>
                                    setEmployeeCustomValues({
                                      ...employeeCustomValues,
                                      [f.key]: e.target.value
                                    })
                                  }
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Save className="w-4 h-4" />}
                        className="text-xs font-bold"
                      >
                        Save Profile Changes
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditingProfile(false)}
                        className="text-xs font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Display Cards */
                  <div className="space-y-6">
                    {/* Card 1: Personal & Demographic Identity */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <User className="w-4 h-4" /> Personal &amp; Demographic Details
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          Form I-9 &amp; HR Validated
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Title</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {profileForm.title || effectiveFlowData.personalInfo?.title || 'Mr.'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Legal Full Name</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {profileForm.fullName || `${profileForm.firstName} ${profileForm.lastName}`.trim()}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Middle Name</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {profileForm.middleName || effectiveFlowData.personalInfo?.middleName || '—'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Preferred / Display Name</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {profileForm.preferredName || profileForm.firstName}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Gender</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {profileForm.gender || 'Not specified'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Date of Birth</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {formatDate(profileForm.dateOfBirth)}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Marital Status</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {profileForm.maritalStatus || 'Single'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Nationality</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {profileForm.nationality || 'United States'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Blood Group</span>
                          <span className="text-sm font-bold text-rose-600 dark:text-rose-400 block">
                            {profileForm.bloodGroup || 'O+'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-1 sm:col-span-2 md:col-span-3">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Highest Level of Education</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {profileForm.education || 'Bachelor of Science (Computer Science & Engineering)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Contact & Online Presence */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <Phone className="w-4 h-4" /> Direct Contact &amp; Online Presence
                        </span>
                        <Button size="sm" variant="tertiary" onClick={() => setActiveTab('contact')} className="text-xs font-bold text-blue-600">
                          Manage Address &gt;
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Corporate Email</span>
                          <a
                            href={`mailto:${effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}`}
                            className="text-sm font-bold text-blue-600 dark:text-blue-400 block truncate hover:underline"
                            title={effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}
                          >
                            {effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}
                          </a>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Workspace SSO</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Personal Email</span>
                          <a
                            href={`mailto:${profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail}`}
                            className="text-sm font-bold text-slate-900 dark:text-white block truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                            title={profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail}
                          >
                            {profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail || 'Not provided'}
                          </a>
                          <span className="text-[11px] text-slate-500">Personal Notifications</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Contact Number 1 (Primary)</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {profileForm.contactNumber1 || profileForm.phone || '+1 (415) 555-0199'}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">✓ Mobile / SMS Verified</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Contact Number 2 (Secondary)</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {profileForm.contactNumber2 || '—'}
                          </span>
                          <span className="text-[11px] text-slate-400">Alternate Voice</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">GitHub Profile</span>
                          {profileForm.githubUsername ? (
                            <a
                              href={`https://github.com/${profileForm.githubUsername.replace(/^@/, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-bold text-blue-600 dark:text-blue-400 block truncate hover:underline"
                            >
                              @{profileForm.githubUsername.replace(/^@/, '')}
                            </a>
                          ) : (
                            <span className="text-sm font-bold text-slate-400 block">Not configured</span>
                          )}
                          <span className="text-[11px] text-slate-400">Developer Ecosystem</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">LinkedIn Profile</span>
                          {profileForm.linkedinUrl ? (
                            <a
                              href={profileForm.linkedinUrl.startsWith('http') ? profileForm.linkedinUrl : `https://${profileForm.linkedinUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-bold text-blue-600 dark:text-blue-400 block truncate hover:underline"
                            >
                              {profileForm.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                            </a>
                          ) : (
                            <span className="text-sm font-bold text-slate-400 block">Not configured</span>
                          )}
                          <span className="text-[11px] text-slate-400">Professional Network</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Corporate Position & Location */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" /> Corporate Position &amp; Facility Assignment
                        </span>
                        <Button size="sm" variant="tertiary" onClick={() => setActiveTab('employment')} className="text-xs font-bold text-blue-600">
                          View Workstation &gt;
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Corporate Employee ID</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {profileForm.employeeId}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Job Designation</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate" title={profileForm.jobTitle}>
                            {profileForm.jobTitle}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Department</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {profileForm.department}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Employment Type</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {profileForm.employmentType}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Work Model</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {profileForm.workModel}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Official Start Date</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {formatDate(profileForm.startDate)}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-1 sm:col-span-2">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Primary Work Location</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate" title={profileForm.workLocation}>
                            {profileForm.workLocation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Organization Custom Fields */}
                    {profileCustomFields.length > 0 && (
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" /> Administrator Configured Attributes
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {profileCustomFields.map((f) => (
                            <div key={f.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                {f.label}
                              </span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                                {employeeCustomValues[f.key] || (f.key === 'githubUsername' ? '@octocat-engineer' : f.key === 'tshirtSize' ? 'Large (L)' : f.key === 'dietaryRestrictions' ? 'Vegetarian' : f.key === 'clearanceTier' ? 'Tier 2 (Confidential)' : 'Verified')}
                              </span>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                {f.required ? 'Mandatory Policy Field' : 'Optional Enterprise Field'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 3. CONTACT & ADDRESS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'contact' && (
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Contact Information &amp; Residential Address
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Direct voice lines, personal communication inbox, and official residential residence.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    Address Verified
                  </span>
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant={isEditingContact ? "secondary" : "primary"}
                      onClick={() => {
                        if (isEditingContact) {
                          setIsEditingContact(false);
                        } else {
                          handleStartEditContact();
                        }
                      }}
                      leftIcon={isEditingContact ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      {isEditingContact ? 'Cancel Edit' : 'Edit Contact & Address'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isEditingContact ? (
                  <form onSubmit={handleSaveContact} className="space-y-6">
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
                      <span>Update your contact details and residential address below.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                          <span>Corporate Email</span>
                          <span className="text-[10px] text-slate-400 font-normal">HR Managed</span>
                        </label>
                        <input
                          type="email"
                          value={effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}
                          disabled
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Personal Email *</label>
                        <input
                          type="email"
                          value={contactForm.personalEmail}
                          onChange={(e) => setContactForm({ ...contactForm, personalEmail: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Contact Number 1 (Primary) *</label>
                        <input
                          type="tel"
                          value={contactForm.contactNumber1 || contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, contactNumber1: e.target.value, phone: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Contact Number 2 (Secondary)</label>
                        <input
                          type="tel"
                          value={contactForm.contactNumber2 || ''}
                          onChange={(e) => setContactForm({ ...contactForm, contactNumber2: e.target.value })}
                          placeholder="Optional alternate"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">GitHub Username</label>
                        <input
                          type="text"
                          value={contactForm.githubUsername || ''}
                          onChange={(e) => setContactForm({ ...contactForm, githubUsername: e.target.value })}
                          placeholder="e.g. john-doe-dev"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          value={contactForm.linkedinUrl || ''}
                          onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Residential Living Address
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5 sm:col-span-2 md:col-span-4">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Street Address *</label>
                          <input
                            type="text"
                            value={contactForm.address}
                            onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                            placeholder="e.g. 101 California Street, Apt 14B"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-1 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">City *</label>
                          <input
                            type="text"
                            value={contactForm.city}
                            onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                            placeholder="City"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">State *</label>
                          <input
                            type="text"
                            value={contactForm.state}
                            onChange={(e) => setContactForm({ ...contactForm, state: e.target.value })}
                            placeholder="State"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">ZIP Code *</label>
                          <input
                            type="text"
                            value={contactForm.zipCode}
                            onChange={(e) => setContactForm({ ...contactForm, zipCode: e.target.value })}
                            placeholder="ZIP Code"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Save className="w-4 h-4" />}
                        className="text-xs font-bold"
                      >
                        Save Contact &amp; Address
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditingContact(false)}
                        className="text-xs font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Corporate Email</span>
                        <a
                          href={`mailto:${effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}`}
                          className="text-base font-bold text-blue-600 dark:text-blue-400 block truncate hover:underline transition-colors"
                          title={effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}
                        >
                          {effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}
                        </a>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Google Workspace Active</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Personal Email</span>
                        {profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail ? (
                          <a
                            href={`mailto:${profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail}`}
                            className="text-base font-bold text-slate-900 dark:text-white block truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                            title={profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail}
                          >
                            {profileForm.personalEmail || effectiveFlowData.personalInfo?.personalEmail}
                          </a>
                        ) : (
                          <span className="text-base font-bold text-slate-400 block truncate">
                            Not provided
                          </span>
                        )}
                        <span className="text-xs text-slate-500">Verified Personal Inbox</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Contact Number 1 (Primary)</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white block truncate">
                          {profileForm.contactNumber1 || profileForm.phone || effectiveFlowData.personalInfo?.phone || 'Not provided'}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ SMS Capable Primary</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Contact Number 2 (Secondary)</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white block truncate">
                          {profileForm.contactNumber2 || '—'}
                        </span>
                        <span className="text-xs text-slate-400">Alternate Voice Line</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">GitHub Account</span>
                        {profileForm.githubUsername ? (
                          <a
                            href={`https://github.com/${profileForm.githubUsername.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-base font-bold text-blue-600 dark:text-blue-400 block truncate hover:underline"
                          >
                            @{profileForm.githubUsername.replace(/^@/, '')}
                          </a>
                        ) : (
                          <span className="text-base font-bold text-slate-400 block truncate">
                            Not configured
                          </span>
                        )}
                        <span className="text-xs text-slate-500">Version Control Link</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">LinkedIn Profile</span>
                        {profileForm.linkedinUrl ? (
                          <a
                            href={profileForm.linkedinUrl.startsWith('http') ? profileForm.linkedinUrl : `https://${profileForm.linkedinUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-base font-bold text-blue-600 dark:text-blue-400 block truncate hover:underline"
                          >
                            {profileForm.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                          </a>
                        ) : (
                          <span className="text-base font-bold text-slate-400 block truncate">
                            Not configured
                          </span>
                        )}
                        <span className="text-xs text-slate-500">Executive Directory</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Residential Living Address
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                        {profileForm.address}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {profileForm.city}, {profileForm.state} {profileForm.zipCode}, United States
                      </p>
                      <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-blue-600 dark:text-blue-400 border-t border-slate-100 dark:border-slate-800">
                        <span>Tax Jurisdiction: {profileForm.state} / {profileForm.city} County</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 4. DEPENDENTS & EMERGENCY CONTACTS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              {/* Card 1: Designated Emergency Contacts */}
              <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Designated Emergency Contacts ({emergencyContacts.length})
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Primary and secondary individuals notified during health or facility emergencies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!readOnly && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleOpenAddEmg}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="text-xs font-bold"
                      >
                        Add Emergency Contact
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {emergencyContacts.map((contact, idx) => (
                    <div
                      key={contact.id}
                      className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                        contact.isPrimary
                          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                              {contact.name}
                            </h3>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              • {contact.relationship}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            Emergency Contact #{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {contact.isPrimary ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              ★ Priority 1 (Primary Contact)
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetPrimaryEmg(contact.id)}
                              leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                              className="text-xs font-bold"
                            >
                              Set as Primary
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenEditEmg(contact)}
                            leftIcon={<Pencil className="w-3.5 h-3.5" />}
                            className="text-xs font-bold"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEmgContact(contact.id, contact.name)}
                            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            className="text-xs font-bold"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 font-semibold block">Primary Phone</span>
                          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 text-sm">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {contact.phone}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block">Alternate Mobile</span>
                          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 text-sm">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {contact.altPhone || '— None —'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block">Email Address</span>
                          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 text-sm truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {contact.email ? (
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                              >
                                {contact.email}
                              </a>
                            ) : (
                              '— None —'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Card 2: Family Dependents */}
              <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Family Dependents ({dependentsList.length})
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Spouse, children, and eligible family dependents covered under corporate health and benefits policies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!readOnly && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleOpenAddDep}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="text-xs font-bold"
                      >
                        Add Dependent
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {dependentsList.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Family Dependents Registered</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Add eligible dependents such as your spouse or children to associate them with your corporate benefits plan.
                      </p>
                    </div>
                  ) : (
                    dependentsList.map((dep, idx) => (
                      <div
                        key={dep.id}
                        className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                {dep.name}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {dep.relationship}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 block mt-0.5">
                              Dependent #{idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenEditDep(dep)}
                              leftIcon={<Pencil className="w-3.5 h-3.5" />}
                              className="text-xs font-bold"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDep(dep.id, dep.name)}
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                              className="text-xs font-bold"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold block">Date of Birth</span>
                            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dep.dateOfBirth ? formatDate(dep.dateOfBirth) : '— Not provided —'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold block">Gender</span>
                            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 text-sm">
                              <User className="w-3.5 h-3.5 text-slate-400" /> {dep.gender || '—'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold block">Phone</span>
                            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 text-sm">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> {dep.phone || '— None —'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-semibold block">Email Address</span>
                            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1 text-sm truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {dep.email || '— None —'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. EMPLOYMENT INFORMATION TAB */}
          {/* ========================================================================= */}
          {activeTab === 'employment' && (
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Employment &amp; Workplace Facility Setup
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    {profileForm.employmentType || 'Full-Time Regular'}
                  </span>
                  {canEditEmploymentAndReporting && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setActiveTab('basic');
                        setIsEditingProfile(true);
                      }}
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Edit Employment Details
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Corporate Division</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                      {effectiveFlowData.personalInfo.department || profileForm.department || 'Engineering & Product'}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{effectiveFlowData.personalInfo.jobTitle || profileForm.jobTitle || 'Core Platform'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Work Model</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                      {effectiveFlowData.personalInfo.workModel || profileForm.workModel || 'Hybrid (3 Days Office / 2 Days Remote)'}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Flexible Schedule Active</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">Primary Work Location</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                      {effectiveFlowData.personalInfo.workLocation || profileForm.workLocation || 'San Francisco Global HQ'}
                    </span>
                    <span className="text-xs text-slate-500">Corporate Work Location</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">
                      Assigned Workspace &amp; Desk Pod
                    </span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {effectiveFlowData.officeSetup.deskLocation || 'Building 2 - 4th Floor (Quiet Engineering Pod #402)'}
                    </p>
                    <span className="inline-block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Motorized Standing Desk Preset Active
                    </span>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <span>Physical Access Card Tier: </span>
                      <strong className="text-slate-800 dark:text-slate-100 dark:text-slate-200">{effectiveFlowData.officeSetup.accessCardLevel || 'Standard Office Floor Access'}</strong>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">
                      Campus Parking Bay &amp; Locker
                    </span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-blue-600" />
                      {effectiveFlowData.officeSetup.parkingRequired
                        ? `Plate: ${effectiveFlowData.officeSetup.licensePlate || '7XYZ890'}`
                        : 'No Parking Permit Requested'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {effectiveFlowData.officeSetup.parkingRequired
                        ? (effectiveFlowData.officeSetup.permitType || 'Standard Reserved Bay')
                        : 'Campus parking not requested'}{' '}
                      • {effectiveFlowData.officeSetup.lockerRequired ? 'Dedicated Day Locker Active' : 'No Locker'}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <span>Workplace Accommodations: </span>
                      <strong className="text-slate-800 dark:text-slate-100 dark:text-slate-200">
                        {effectiveFlowData.officeSetup.specialAccommodations || 'None specified'}
                      </strong>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 6. MANAGER & REPORTING TAB */}
          {/* ========================================================================= */}
          {activeTab === 'reporting' && (
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Manager, Team &amp; Mentorship Network
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    Team Active
                  </span>
                  {canEditEmploymentAndReporting && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setActiveTab('basic');
                        setIsEditingProfile(true);
                      }}
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Edit Reporting Lines
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className={`grid grid-cols-1 ${effectiveProfile.line2Manager && effectiveProfile.line2Manager !== 'None' ? 'sm:grid-cols-2' : 'max-w-xl'} gap-6`}>
                  {/* Line 1 Manager */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                    <Avatar
                      src={getRadianAvatarByName(effectiveProfile.manager) || RADIAN_PERSONA_AVATARS.marcusBrody}
                      name={effectiveProfile.manager}
                      size="lg"
                      className="shrink-0 ring-2 ring-blue-500/20"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block">
                        Reporting Manager
                      </span>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                        {effectiveProfile.manager}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold">
                        VP of Engineering • Executive Engineering Staff
                      </p>
                      <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                        <p>Email: <strong><a href={`mailto:${effectiveProfile.manager.toLowerCase().replace(/\s+/g, '.')}@quantira.com`} className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">{effectiveProfile.manager.toLowerCase().replace(/\s+/g, '.')}@quantira.com</a></strong></p>
                        <p>Slack: <strong>@{effectiveProfile.manager.toLowerCase().replace(/\s+/g, '.')}</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* Line 2 Manager */}
                  {effectiveProfile.line2Manager && effectiveProfile.line2Manager !== 'None' && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                      <Avatar
                        src={getRadianAvatarByName(effectiveProfile.line2Manager) || RADIAN_PERSONA_AVATARS.alexandraWright}
                        name={effectiveProfile.line2Manager}
                        size="lg"
                        className="shrink-0 ring-2 ring-indigo-500/20"
                      />
                      <div className="min-w-0 space-y-1">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block">
                          Secondary / Executive Manager
                        </span>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                          {effectiveProfile.line2Manager}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          Chief Technology Officer &amp; Principal Administrator
                        </p>
                        <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                          <p>Email: <strong><a href={`mailto:${effectiveProfile.line2Manager.toLowerCase().replace(/\s+/g, '.')}@quantira.com`} className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">{effectiveProfile.line2Manager.toLowerCase().replace(/\s+/g, '.')}@quantira.com</a></strong></p>
                          <p>Slack: <strong>@{effectiveProfile.line2Manager.toLowerCase().replace(/\s+/g, '.')}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-1">
                  <span className="font-bold text-blue-900 dark:text-blue-300 text-sm">Assigned Engineering Team:</span>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    Core Platform Infrastructure • Weekly Sync: Mondays 10:00 AM PST • Slack: #eng-core-platform
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 7. DOCUMENTS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* All Documents Repository Card */}
              <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Document Repository ({profileDocuments.filter((d: any) => d.status === 'verified' || d.status === 'uploaded').length}/{profileDocuments.length})
                      </h2>
                    </div>
                  </div>

                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShowAddDocModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0"
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Add Document
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Two-Column Document Repository Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column 1: HR Documents & Policies */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            HR Documents &amp; Policies
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            NDA, Offer Letter, and Corporate Policy Agreements
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {hrDocumentsList.length} Documents
                        </span>
                      </div>

                      <div className="max-h-[490px] overflow-y-auto pr-1.5 space-y-3">
                        {hrDocumentsList.map((doc: any) => {
                          const isDocVerified = doc.status === 'verified' || doc.status === 'uploaded';
                          const isDocLocked = true;

                          return (
                            <div
                              key={doc.id || doc.name}
                              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5 shadow-2xs"
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <div className="p-2 rounded-xl shrink-0 mt-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                                    <ShieldCheck className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate" title={doc.name}>
                                        {doc.name}
                                      </span>
                                      {doc.category && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                          {doc.category}
                                        </span>
                                      )}
                                      {isDocLocked && (
                                        <span
                                          title="Locked corporate document cannot be modified or deleted"
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                        >
                                          <Lock className="w-2.5 h-2.5" /> Locked
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap font-mono">
                                      {doc.fileName ? (
                                        <>
                                          <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[160px]">
                                            {doc.fileName}
                                          </span>
                                          <span>•</span>
                                          <span>{doc.fileSize || '1.8 MB'}</span>
                                          {doc.uploadedAt && (
                                            <>
                                              <span>•</span>
                                              <span>{formatDate(doc.uploadedAt)}</span>
                                            </>
                                          )}
                                        </>
                                      ) : (
                                        <span className="italic text-slate-400">Not uploaded</span>
                                      )}
                                    </div>
                                    {doc.description && (
                                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 line-clamp-1">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                    isDocVerified
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {isDocVerified ? 'Verified ✓' : 'Pending'}
                                </span>
                              </div>

                              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setSelectedDoc(doc)}
                                  className="text-xs h-7 px-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-semibold"
                                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleDirectDownload(doc)}
                                  className="text-xs h-7 px-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                                  leftIcon={<Download className="w-3.5 h-3.5" />}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column 2: Uploaded by Employee */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Uploaded by Employee
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Statutory, Identification, Banking, and Prior Employment Documents
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {uploadedByEmployeeList.length} Documents
                        </span>
                      </div>

                      <div className="max-h-[490px] overflow-y-auto pr-1.5 space-y-3">
                        {uploadedByEmployeeList.length === 0 ? (
                          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Documents Uploaded Yet</p>
                            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                              Statutory employment documents uploaded during onboarding or added here will appear in this list.
                            </p>
                          </div>
                        ) : (
                          uploadedByEmployeeList.map((doc: any) => {
                            const isDocVerified = doc.status === 'verified' || doc.status === 'uploaded';
                            const isDocLocked = doc.isLocked;

                            return (
                              <div
                                key={doc.id || doc.name}
                                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5 shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-2.5">
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <div className="p-2 rounded-xl shrink-0 mt-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                      <FileCheck className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate" title={doc.name}>
                                          {doc.name}
                                        </span>
                                        {doc.category && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {doc.category}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap font-mono">
                                        {doc.fileName ? (
                                          <>
                                            <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[160px]">
                                              {doc.fileName}
                                            </span>
                                            <span>•</span>
                                            <span>{doc.fileSize || '1.8 MB'}</span>
                                            {doc.uploadedAt && (
                                              <>
                                                <span>•</span>
                                                <span>{formatDate(doc.uploadedAt)}</span>
                                              </>
                                            )}
                                          </>
                                        ) : (
                                          <span className="italic text-slate-400">Not uploaded</span>
                                        )}
                                      </div>
                                      {doc.description && (
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 line-clamp-1">
                                          {doc.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                      isDocVerified
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                  >
                                    {isDocVerified ? 'Verified ✓' : 'Pending'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setSelectedDoc(doc)}
                                    className="text-xs h-7 px-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-semibold"
                                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleDirectDownload(doc)}
                                    className="text-xs h-7 px-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                                    leftIcon={<Download className="w-3.5 h-3.5" />}
                                  >
                                    Download
                                  </Button>
                                  {!readOnly && !isDocLocked && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setEditingDoc(doc)}
                                        className="text-xs h-7 px-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        title="Edit Document"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setDeletingDoc(doc)}
                                        className="text-xs h-7 px-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                        title="Delete Document"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. SIGNATURE TAB */}
          {/* ========================================================================= */}
          {activeTab === 'signature' && (
            <div className="space-y-6">
              {/* Employee ID Card & Corporate Business Card Showcase */}
              <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Employee ID Card &amp; Corporate Business Card
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Building access security badge and official executive business credentials.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80">
                      <ShieldCheck className="w-3.5 h-3.5" /> ID Badge (3:4)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80">
                      <Sparkles className="w-3.5 h-3.5" /> Business Card (3.5" × 2")
                    </span>
                    {canEditCards && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Pencil className="w-3.5 h-3.5" />}
                        onClick={handleOpenEditCardsModal}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800"
                      >
                        Edit Cards (Admin)
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-items-center pt-2">
                  <EmployeeIdBadge
                    photoUrl={effectiveProfile.avatar || effectiveFlowData.photo?.photoUrl}
                    fullName={effectiveProfile.name}
                    jobTitle={profileForm.jobTitle || effectiveProfile.jobTitle}
                    department={profileForm.department || effectiveProfile.department}
                    employeeId={effectiveProfile.employeeId}
                    accessLevel="Standard Floor Access"
                    className="w-full max-w-[300px]"
                  />
                  <ExecutiveBusinessCard
                    fullName={effectiveProfile.name}
                    jobTitle={profileForm.jobTitle || effectiveProfile.jobTitle}
                    department={profileForm.department || effectiveProfile.department}
                    email={effectiveFlowData.corporateAccount?.corporateEmail || effectiveFlowData.personalInfo?.corporateEmail || profileForm.corporateEmail || effectiveProfile.email}
                    phone={effectiveFlowData.emailSignature?.phone || profileForm.phone || '+1 (415) 555-0100'}
                    website="www.quantiratechnologies.com"
                    className="w-full max-w-[380px]"
                  />
                </div>
              </div>

              {/* Card 1: Official Digital Legal Signature */}
              <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Official Digital Legal Signature
                      </h2>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    digitalSignatureUrl
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                  }`}>
                    {digitalSignatureUrl ? '✓ Signature On File' : 'Signature Required'}
                  </span>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {digitalSignatureUrl && !isEditingSignature ? (
                    /* Active Signature Display */
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Active Legal Signature Record
                          </span>
                          <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner max-w-sm flex items-center justify-center min-h-[90px]">
                            <img
                              src={digitalSignatureUrl}
                              alt="Digital Signature"
                              className="max-h-16 max-w-full object-contain"
                            />
                          </div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Signer: <strong>{flowData.personalInfo.firstName} {flowData.personalInfo.lastName}</strong>
                          </p>
                        </div>

                        <div className="flex-1 space-y-3 text-xs text-slate-500 dark:text-slate-400">
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700 dark:text-slate-200">Legal Compliance</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">ESIGN &amp; UETA Act</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Security Hash</span>
                              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">SHA-256: 7f8a9e1c2b4d...992a</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Associated Agreements</span>
                              <span className="font-medium text-slate-700 dark:text-slate-200">NDA, W-4, Offer Letter</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handleDownloadSignature}
                              leftIcon={<Download className="w-3.5 h-3.5" />}
                              className="text-xs font-bold"
                            >
                              Download PNG
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setIsEditingSignature(true);
                                setUploadedPreview(null);
                              }}
                              leftIcon={<PenTool className="w-3.5 h-3.5" />}
                              className="text-xs font-bold"
                            >
                              Update / Replace Signature
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleRemoveSignature}
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                              className="text-xs font-bold"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Signature Creator / Uploader Interface */
                    <div className="space-y-5">
                      {/* Method Selector Tabs */}
                      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-md">
                        <button
                          type="button"
                          onClick={() => setSignatureMode('upload')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            signatureMode === 'upload'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode('draw')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            signatureMode === 'draw'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <PenTool className="w-4 h-4" />
                          Draw on Pad
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode('type')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            signatureMode === 'type'
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Type className="w-4 h-4" />
                          Type Name
                        </button>
                      </div>

                      {/* 1. UPLOAD MODE */}
                      {signatureMode === 'upload' && (
                        <div className="space-y-4">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={handleSignatureFileUpload}
                            className="hidden"
                          />

                          {!uploadedPreview ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
                            >
                              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-6 h-6" />
                              </div>
                              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                Click or Drag &amp; Drop to Upload Signature
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                Supports PNG (transparent background recommended), JPG, SVG, or WebP up to 5MB.
                              </p>
                              <Button
                                size="sm"
                                variant="secondary"
                                type="button"
                                className="mt-4 text-xs font-bold"
                                leftIcon={<Upload className="w-3.5 h-3.5" />}
                              >
                                Browse Local Files
                              </Button>
                            </div>
                          ) : (
                            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/50 dark:border-blue-500/30 space-y-4">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                                Uploaded Signature Preview
                              </span>
                              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[100px]">
                                <img
                                  src={uploadedPreview}
                                  alt="Uploaded Signature Preview"
                                  className="max-h-20 max-w-full object-contain"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="primary"
                                  onClick={handleSaveUploadedSignature}
                                  leftIcon={<Check className="w-4 h-4" />}
                                  className="text-xs font-bold"
                                >
                                  Save as Active Signature
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => fileInputRef.current?.click()}
                                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                                  className="text-xs font-bold"
                                >
                                  Upload Different File
                                </Button>
                                {digitalSignatureUrl && (
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      setIsEditingSignature(false);
                                      setUploadedPreview(null);
                                    }}
                                    className="text-xs font-bold"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. DRAW MODE */}
                      {signatureMode === 'draw' && (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500">Pen Color:</span>
                              <div className="flex items-center gap-1.5">
                                {[
                                  { color: '#1e3a8a', label: 'Navy' },
                                  { color: '#0f172a', label: 'Black' },
                                  { color: '#334155', label: 'Slate' }
                                ].map((c) => (
                                  <button
                                    key={c.color}
                                    type="button"
                                    onClick={() => setPenColor(c.color)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                                      penColor === c.color ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: c.color }}
                                    title={c.label}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500">Pen Width:</span>
                              <div className="flex items-center gap-1">
                                {[2, 3, 5].map((w) => (
                                  <button
                                    key={w}
                                    type="button"
                                    onClick={() => setPenWidth(w)}
                                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                                      penWidth === w
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {w}px
                                  </button>
                                ))}
                              </div>

                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={clearCanvas}
                                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                                className="text-xs font-bold ml-2"
                              >
                                Clear Pad
                              </Button>
                            </div>
                          </div>

                          <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden shadow-inner">
                            <canvas
                              ref={canvasRef}
                              width={640}
                              height={180}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-44 cursor-crosshair touch-none"
                            />
                            {!hasDrawn && (
                              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                                <PenTool className="w-7 h-7 mb-1 stroke-1" />
                                <span className="text-xs font-semibold">Draw your signature with stylus or mouse</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              variant="primary"
                              onClick={handleSaveDrawnSignature}
                              disabled={!hasDrawn}
                              leftIcon={<Check className="w-4 h-4" />}
                              className="text-xs font-bold"
                            >
                              Save Drawn Signature
                            </Button>
                            {digitalSignatureUrl && (
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setIsEditingSignature(false);
                                  clearCanvas();
                                }}
                                className="text-xs font-bold"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. TYPE MODE */}
                      {signatureMode === 'type' && (
                        <div className="space-y-4">
                          <div className="space-y-1.5 max-w-md">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                              Full Legal Signer Name
                            </label>
                            <input
                              type="text"
                              value={typedName}
                              onChange={(e) => setTypedName(e.target.value)}
                              placeholder="Enter your full name"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center min-h-[110px]">
                            <span
                              className="text-3xl sm:text-4xl italic font-bold tracking-wide select-none"
                              style={{
                                color: penColor,
                                fontFamily: '"Brush Script MT", "Segoe Script", cursive'
                              }}
                            >
                              {typedName.trim() || 'Your Signature Preview'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              variant="primary"
                              onClick={handleSaveTypedSignature}
                              disabled={!typedName.trim()}
                              leftIcon={<Check className="w-4 h-4" />}
                              className="text-xs font-bold"
                            >
                              Generate &amp; Save Signature
                            </Button>
                            {digitalSignatureUrl && (
                              <Button
                                variant="secondary"
                                onClick={() => setIsEditingSignature(false)}
                                className="text-xs font-bold"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Corporate Email Signature */}
              <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <AtSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Corporate Email Signature
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCopySignature}
                      leftIcon={copiedSignature ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      {copiedSignature ? 'Copied HTML' : 'Copy Signature'}
                    </Button>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                      Active in Gmail
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={effectiveProfile.avatar || flowData.photo.photoUrl || RADIAN_PERSONA_AVATARS.johnDoe}
                        alt={effectiveProfile.name}
                        className="w-16 h-20 rounded-xl object-cover ring-2 ring-blue-500/40 shadow-sm shrink-0"
                      />
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                          {effectiveFlowData.emailSignature?.name || effectiveProfile.name}
                        </h4>
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                          {effectiveFlowData.emailSignature?.title || effectiveProfile.jobTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {effectiveFlowData.emailSignature?.department || effectiveProfile.department} • Quantira Technologies, Inc.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1.5 flex-wrap">
                          <span>Email: <strong><a href={`mailto:${effectiveFlowData.corporateAccount?.corporateEmail || effectiveProfile.email}`} className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">{effectiveFlowData.corporateAccount?.corporateEmail || effectiveProfile.email}</a></strong></span>
                          <span>•</span>
                          <span>Direct: <strong>{effectiveFlowData.emailSignature?.phone || '+1 (415) 555-0192'}</strong></span>
                          <span>•</span>
                          <span>Mobile: <strong>{effectiveFlowData.emailSignature?.mobile || '+1 (415) 555-0199'}</strong></span>
                        </div>
                        {effectiveFlowData.emailSignature?.tagline && (
                          <p className="italic text-xs text-slate-400 pt-1">
                            "{effectiveFlowData.emailSignature.tagline}"
                          </p>
                        )}
                        <p className="text-xs text-blue-500 font-semibold pt-1">
                          www.quantiratechnologies.com • 101 California St, San Francisco, CA
                        </p>
                      </div>

                      {digitalSignatureUrl && (
                        <div className="hidden sm:flex flex-col items-end shrink-0 pl-3 border-l border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Official Signature
                          </span>
                          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <img
                              src={digitalSignatureUrl}
                              alt="Digital Signature Stamp"
                              className="max-h-8 max-w-[100px] object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                      Notice: This email transmission contains confidential information intended only for the use of the individual or entity named above. If you are not the intended recipient, any disclosure, copying, distribution or reliance upon this communication is strictly prohibited.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 9. ASSETS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'assets' && (
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Assigned IT Assets &amp; Hardware Workstation
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    {assignedEmployeeAssets.length > 0
                      ? `${assignedEmployeeAssets.length} Hardware Assigned`
                      : 'Inventory Pool Ready'}
                  </span>
                  {isHrOrSuperAdmin && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShowAssignAssetsModal(true)}
                      leftIcon={<Laptop className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Assign Assets
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {assignedEmployeeAssets.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Active Assigned Hardware ({assignedEmployeeAssets.length})
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <th className="py-3 px-4">Hardware Asset</th>
                            <th className="py-3 px-4">Asset Tag</th>
                            <th className="py-3 px-4">Serial Number</th>
                            <th className="py-3 px-4">Location</th>
                            <th className="py-3 px-4">Assigned Date</th>
                            <th className="py-3 px-4">Condition</th>
                            <th className="py-3 px-4">Key Specifications</th>
                            {isHrOrSuperAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-xs">
                          {assignedEmployeeAssets.map((asset: ITAsset) => (
                            <tr key={asset.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    {asset.category === 'Monitor' ? (
                                      <Monitor className="w-4.5 h-4.5" />
                                    ) : (
                                      <Laptop className="w-4.5 h-4.5" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-slate-900 dark:text-white block truncate max-w-xs" title={asset.name}>
                                      {asset.name}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      {asset.category}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                                  {asset.assetTag}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {asset.serialNumber}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {asset.location}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {asset.assignedTo?.assignedDate || effectiveProfile.startDate}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  {asset.condition}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={asset.specifications ? Object.entries(asset.specifications).map(([k, v]) => `${k}: ${v}`).join(' • ') : asset.notes || 'Enterprise provisioned'}>
                                {asset.specifications
                                  ? Object.entries(asset.specifications).slice(0, 2).map(([_, v]) => `${v}`).join(' • ')
                                  : asset.notes || 'Enterprise provisioned'}
                              </td>
                              {isHrOrSuperAdmin && (
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleUnassignAssetFromEmployee(asset)}
                                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                                  >
                                    Return
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500">
                    <span>No active hardware units assigned to this employee record.</span>
                    {isHrOrSuperAdmin && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setShowAssignAssetsModal(true)}
                        leftIcon={<Laptop className="w-3.5 h-3.5" />}
                        className="text-xs font-bold ml-3"
                      >
                        Assign Asset
                      </Button>
                    )}
                  </div>
                )}

                {/* Onboarding Provisioned Hardware Package */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Onboarding Hardware Package Provisioned ({effectiveFlowData.equipment.selectedEquipment?.length || 0} Items)
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Status: {effectiveFlowData.equipment.status || 'Provisioned'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(effectiveFlowData.equipment.selectedEquipment && effectiveFlowData.equipment.selectedEquipment.length > 0
                      ? effectiveFlowData.equipment.selectedEquipment
                      : ['Laptop Pro 16"', 'Ergonomic Keyboard', 'Precision Wireless Mouse', 'Dual 27" 4K UHD Monitors', 'Thunderbolt 4 Docking Station']
                    ).map((item: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3"
                      >
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs shrink-0">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {item}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            ✓ Standard Provisioned
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Hardware Accommodations or Adapter Requests */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Special Hardware Accommodations &amp; Adapter Requests
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        Step 7 Recorded
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {effectiveFlowData.equipment.specialRequests
                        ? effectiveFlowData.equipment.specialRequests
                        : 'No special hardware accommodations or adapter requests entered during onboarding.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* 10. CHANGE PASSWORD TAB (Requested Feature) */}
          {/* ========================================================================= */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Change Password
                      </h2>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    SSO Protected
                  </span>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <form onSubmit={handleUpdatePassword}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Input Fields */}
                      <div className="lg:col-span-7 space-y-5">
                        {/* New Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPw ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Password Strength Meter */}
                          {newPassword.length > 0 && (
                            <div className="pt-2 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Password Strength:</span>
                                <span className={`font-bold ${
                                  strengthScore <= 2 ? 'text-rose-500' : strengthScore <= 4 ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                  {strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Medium' : 'Strong'}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    strengthScore <= 2 ? 'bg-rose-500 w-1/3' : strengthScore <= 4 ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full'
                                  }`}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPw ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPw(!showConfirmPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isUpdatingPw}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-2.5 shadow-md"
                            leftIcon={<Key className="w-4 h-4" />}
                          >
                            {isUpdatingPw ? 'Updating Password...' : 'Update Password'}
                          </Button>
                        </div>
                      </div>

                      {/* Right: Password Requirements Section */}
                      <div className="lg:col-span-5">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block mb-1">
                            Password Requirements:
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>Minimum 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className={hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>Uppercase letter (A-Z)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${hasLower ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className={hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>Lowercase letter (a-z)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className={hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>At least one number (0-9)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className={hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>Special symbol (!@#$%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              
            </div>
          )}

          {/* ========================================================================= */}
          {/* 11. HISTORY & ACTIVITY TAB (Requested Feature) */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Profile Lifecycle &amp; Audit History
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {profileHistoryList.length} Events
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Immutable chronological record of identity provisioning, document compliance, asset allocations, and profile updates.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleExportProfileHistory}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Export Logs (JSON)
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddNoteForm(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add Audit Entry
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Category Pill Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
                    {[
                      'All',
                      'Demographics',
                      'Contact & Address',
                      'Family & Dependents',
                      'Documents & Compliance',
                      'Assets & IT',
                      'Security & SSO',
                      'Attendance',
                      'Role & Management',
                      'General'
                    ].map((cat) => {
                      const isSelected = historyCategoryFilter === cat;
                      const count =
                        cat === 'All'
                          ? profileHistoryList.length
                          : profileHistoryList.filter((item) => item.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setHistoryCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search and Type Filter Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder="Search audit history by action, actor, category, or detail notes..."
                        className="w-full pl-10 pr-9 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      {historySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setHistorySearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="sm:col-span-4 flex items-center gap-2">
                      <div className="relative w-full">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={historyTypeFilter}
                          onChange={(e) => setHistoryTypeFilter(e.target.value)}
                          className="w-full pl-8.5 pr-8 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                          <option value="All">All Event Types</option>
                          <option value="success">Success Events</option>
                          <option value="info">Info / Updates</option>
                          <option value="warning">Warnings / Removals</option>
                          <option value="error">Errors / Alerts</option>
                        </select>
                      </div>

                      {(historySearchQuery || historyCategoryFilter !== 'All' || historyTypeFilter !== 'All') && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setHistorySearchQuery('');
                            setHistoryCategoryFilter('All');
                            setHistoryTypeFilter('All');
                          }}
                          className="text-xs shrink-0"
                          title="Reset Filters"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Add Manual Audit Note Inline Drawer / Card */}
                  {showAddNoteForm && (
                    <form
                      onSubmit={handleAddManualAuditNote}
                      className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-4 animate-fade-in"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-blue-200/60 dark:border-blue-900/40">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Log Custom Profile Audit Note
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddNoteForm(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Activity / Audit Event Title *
                          </label>
                          <input
                            type="text"
                            value={newAuditNoteAction}
                            onChange={(e) => setNewAuditNoteAction(e.target.value)}
                            placeholder="e.g. Annual Compliance Review Completed"
                            required
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Category
                          </label>
                          <select
                            value={newAuditNoteCategory}
                            onChange={(e) => setNewAuditNoteCategory(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="General">General</option>
                            <option value="Demographics">Demographics</option>
                            <option value="Contact & Address">Contact & Address</option>
                            <option value="Family & Dependents">Family & Dependents</option>
                            <option value="Documents & Compliance">Documents & Compliance</option>
                            <option value="Assets & IT">Assets & IT</option>
                            <option value="Security & SSO">Security & SSO</option>
                            <option value="Attendance">Attendance</option>
                            <option value="Role & Management">Role & Management</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Detailed Description / Observations
                          </label>
                          <textarea
                            rows={2}
                            value={newAuditNoteDetails}
                            onChange={(e) => setNewAuditNoteDetails(e.target.value)}
                            placeholder="Provide supplementary details or references regarding this profile action..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Event Type / Severity
                          </label>
                          <select
                            value={newAuditNoteType}
                            onChange={(e) => setNewAuditNoteType(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="info">Info (Standard Event)</option>
                            <option value="success">Success (Approval / Verified)</option>
                            <option value="warning">Warning (Caution / Revoked)</option>
                            <option value="error">Error (Breach / Alert)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowAddNoteForm(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          leftIcon={<Save className="w-3.5 h-3.5" />}
                          className="text-xs font-bold bg-blue-600 text-white"
                        >
                          Record Audit Entry
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Results Count Summary */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span>
                      Showing <strong>{filteredHistoryList.length}</strong> of <strong>{profileHistoryList.length}</strong> recorded activities
                    </span>
                    {filteredHistoryList.length < profileHistoryList.length && (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        (Filtered view)
                      </span>
                    )}
                  </div>

                  {/* Timeline Listing */}
                  {filteredHistoryList.length > 0 ? (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {filteredHistoryList.map((entry) => {
                        const isSuccess = entry.type === 'success';
                        const isWarning = entry.type === 'warning';
                        const isError = entry.type === 'error';

                        const getCategoryBadgeClass = (category: string) => {
                          switch (category) {
                            case 'Security & SSO':
                              return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                            case 'Documents & Compliance':
                              return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                            case 'Assets & IT':
                              return 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
                            case 'Attendance':
                              return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                            case 'Family & Dependents':
                              return 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
                            case 'Contact & Address':
                              return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                            case 'Demographics':
                              return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                            default:
                              return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                          }
                        };

                        return (
                          <div key={entry.id} className="relative group">
                            {/* Dot Icon Indicator */}
                            <span
                              className={`absolute -left-6 top-1.5 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-xs ${
                                isSuccess
                                  ? 'bg-emerald-500 text-white'
                                  : isWarning
                                  ? 'bg-amber-500 text-white'
                                  : isError
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              {isSuccess ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : isWarning ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : isError ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                            </span>

                            {/* Card Content */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {entry.action}
                                  </h3>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getCategoryBadgeClass(
                                      entry.category
                                    )}`}
                                  >
                                    {entry.category}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{formatDateTime(entry.timestamp)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>Recorded by:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {entry.user}
                                </span>
                              </div>

                              {entry.details && (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                                  {entry.details}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <History className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                          No History Logs Found
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          No audit events matched the current search criteria or category filter.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setHistorySearchQuery('');
                          setHistoryCategoryFilter('All');
                          setHistoryTypeFilter('All');
                        }}
                        className="text-xs font-bold"
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* Full-Fidelity Document Viewer Modal */}
      {/* ========================================================================= */}
      <DocumentViewerModal
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        employeeName={effectiveProfile.name}
        jobTitle={effectiveProfile.jobTitle}
        department={effectiveProfile.department}
        startDate={effectiveProfile.startDate}
        employeeId={effectiveProfile.employeeId}
        signedName={flowData.nda.signedName || effectiveProfile.name}
        acceptedAt={flowData.nda.acceptedAt || effectiveProfile.startDate}
        agreementVersion={flowData.nda.agreementVersion || 'v2026.2 (Enterprise Proprietary Information Agreement)'}
        photoUrl={flowData.photo.photoUrl}
        digitalSignatureUrl={digitalSignatureUrl}
      />

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={showAddDocModal}
        onClose={() => setShowAddDocModal(false)}
        onAdd={handleAddDocument}
      />

      {/* Edit Document Modal */}
      <EditDocumentModal
        isOpen={Boolean(editingDoc)}
        onClose={() => setEditingDoc(null)}
        document={editingDoc}
        onSave={handleSaveEditedDocument}
      />

      {/* Delete Document Confirmation Modal */}
      {deletingDoc && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingDoc(null)}
          title="Delete Document"
          description="Remove official document record from repository."
          size="sm"
          topOffset="80px"
          height="auto"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deletingDoc.name}</strong> from your profile repository? This action will remove the archived file.
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setDeletingDoc(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => deletingDoc.id && handleDeleteDocument(deletingDoc.id)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Delete Document
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Punch In / Punch Out History Modal */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showPunchHistoryModal}
        onClose={() => setShowPunchHistoryModal(false)}
        title="Punch In / Punch Out History"
        description={`Verified electronic time-card audit log for ${employeeName} (${employeeId})`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-semibold">
              Live attendance synced with HR &amp; Payroll records.
            </span>
            <Button variant="secondary" onClick={() => setShowPunchHistoryModal(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold block">
                  Today's Cumulative Shift Time
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  <LiveCumulativeShiftBadge attendanceState={attendanceState} />
                </h3>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              attendanceState.isClockedIn
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {attendanceState.isClockedIn ? '● Active Shift (Clocked In)' : '○ Shift Inactive (Clocked Out)'}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Timestamp &amp; Event</span>
              <span>Location &amp; Device</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {getStoredPunchRecords()
                .filter((r) => r.employeeId === employeeId)
                .slice()
                .reverse()
                .map((record) => (
                  <div key={record.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
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
                          <span className={`font-black uppercase text-[11px] ${
                            record.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {record.type === 'in' ? 'Punch In' : 'Punch Out'}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {record.timeFormatted}
                          </span>
                        </div>
                        <span className="text-slate-400 block text-[11px]">
                          {record.dateFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block">
                        {record.location}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {record.device || 'Verified Device'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* Add / Edit Emergency Contact Modal */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showEmgModal}
        onClose={() => setShowEmgModal(false)}
        title={editingEmgContactId ? "Edit Emergency Contact" : "Add Emergency Contact"}
        description="Designate a trusted individual in the event of an urgent notice or health situation."
        size="md"
      >
        <form onSubmit={handleSaveEmgContact} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={emgForm.name}
              onChange={(e) => setEmgForm({ ...emgForm, name: e.target.value })}
              placeholder="e.g. Sarah Doe"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Relationship *
              </label>
              <select
                value={emgForm.relationship}
                onChange={(e) => setEmgForm({ ...emgForm, relationship: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Spouse">Spouse / Partner</option>
                <option value="Parent">Parent / Guardian</option>
                <option value="Brother">Brother / Sibling</option>
                <option value="Sister">Sister / Sibling</option>
                <option value="Child">Adult Child</option>
                <option value="Friend">Trusted Friend</option>
                <option value="Physician">Primary Care Physician</option>
                <option value="Other">Other Contact</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Primary Phone Number *
              </label>
              <input
                type="tel"
                required
                value={emgForm.phone}
                onChange={(e) => setEmgForm({ ...emgForm, phone: e.target.value })}
                placeholder="+1 (415) 555-0142"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Alternate Mobile (Optional)
              </label>
              <input
                type="tel"
                value={emgForm.altPhone}
                onChange={(e) => setEmgForm({ ...emgForm, altPhone: e.target.value })}
                placeholder="+1 (415) 555-0199"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Email Address
              </label>
              <input
                type="email"
                value={emgForm.email}
                onChange={(e) => setEmgForm({ ...emgForm, email: e.target.value })}
                placeholder="contact@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emgForm.isPrimary}
                onChange={(e) => setEmgForm({ ...emgForm, isPrimary: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                Designate as Primary Emergency Contact (Priority 1)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEmgModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Emergency Contact
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* Add / Edit Family Dependent Modal */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showDepModal}
        onClose={() => setShowDepModal(false)}
        title={editingDepId ? "Edit Family Dependent" : "Add Family Dependent"}
        description="Register a spouse, child, or eligible family dependent for corporate benefits coverage."
        size="md"
      >
        <form onSubmit={handleSaveDep} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={depForm.name}
              onChange={(e) => setDepForm({ ...depForm, name: e.target.value })}
              placeholder="e.g. Emily Doe"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Relationship *
              </label>
              <select
                value={depForm.relationship}
                onChange={(e) => setDepForm({ ...depForm, relationship: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Spouse">Spouse / Partner</option>
                <option value="Child">Child / Dependent</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Gender
              </label>
              <select
                value={depForm.gender}
                onChange={(e) => setDepForm({ ...depForm, gender: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={depForm.dateOfBirth}
                onChange={(e) => setDepForm({ ...depForm, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={depForm.phone}
                onChange={(e) => setDepForm({ ...depForm, phone: e.target.value })}
                placeholder="+1 (415) 555-0142"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={depForm.email}
              onChange={(e) => setDepForm({ ...depForm, email: e.target.value })}
              placeholder="dependent@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDepModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Dependent
            </Button>
          </div>
        </form>
      </Modal>
      {/* ========================================================================= */}
      {/* ASSIGN ASSETS MODAL FOR HR ADMIN & SUPER ADMIN */}
      {/* ========================================================================= */}
      {showAssignAssetsModal && (
        <Modal
          isOpen={showAssignAssetsModal}
          onClose={() => setShowAssignAssetsModal(false)}
          title={`Assign Corporate IT Assets — ${effectiveProfile.name}`}
          size="xl"
          topOffset="80px"
          height="auto"
        >
          <div className="space-y-4 p-1 text-left">
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Select available hardware units from enterprise stockrooms to assign to <strong>{effectiveProfile.name}</strong>.
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search assets by model, tag, serial number, location..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={assetCategoryFilter}
                onChange={(e) => setAssetCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="all">All Categories</option>
                <option value="Laptop">Laptops</option>
                <option value="Desktop">Desktops</option>
                <option value="Monitor">Monitors</option>
                <option value="Mobile Device">Mobile Devices</option>
                <option value="Peripheral">Peripherals</option>
                <option value="Audio/Video">Audio / Video</option>
              </select>
            </div>

            {/* Assets List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {enterpriseAssets
                .filter((asset) => {
                  const matchesSearch =
                    asset.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                    asset.assetTag.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                    asset.serialNumber.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
                    asset.location.toLowerCase().includes(assetSearchQuery.toLowerCase());
                  const matchesCat =
                    assetCategoryFilter === 'all' || asset.category === assetCategoryFilter;
                  return matchesSearch && matchesCat;
                })
                .map((asset) => {
                  const isAssignedToThisEmployee =
                    (asset.assignedTo?.id && asset.assignedTo.id === effectiveProfile.employeeId) ||
                    (asset.assignedTo?.email && asset.assignedTo.email.toLowerCase() === effectiveProfile.email.toLowerCase()) ||
                    (asset.assignedTo?.name && asset.assignedTo.name.toLowerCase() === effectiveProfile.name.toLowerCase());
                  const isAssignedToOther = asset.status === 'Assigned' && !isAssignedToThisEmployee;

                  return (
                    <div
                      key={asset.id}
                      className="pt-2.5 first:pt-0 pb-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {asset.category === 'Monitor' ? (
                            <Monitor className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Laptop className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {asset.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                              {asset.assetTag}
                            </span>
                            <span>•</span>
                            <span>S/N: {asset.serialNumber}</span>
                            <span>•</span>
                            <span>{asset.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isAssignedToThisEmployee ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              ✓ Currently Assigned
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleUnassignAssetFromEmployee(asset)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700"
                            >
                              Return
                            </Button>
                          </div>
                        ) : isAssignedToOther ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                              Assigned to {asset.assignedTo?.name}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAssignAssetToEmployee(asset)}
                              className="text-xs font-bold"
                            >
                              Reassign
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleAssignAssetToEmployee(asset)}
                            className="text-xs font-bold"
                          >
                            Assign Asset
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setShowAssignAssetsModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Profile Picture Modal */}
      {showEditAvatarModal && (
        <Modal
          isOpen={showEditAvatarModal}
          onClose={() => setShowEditAvatarModal(false)}
          title="Update Profile Picture"
          size="lg"
          footer={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowEditAvatarModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                  onClick={() => {
                    const rnd = getRandomRadianAvatar();
                    setSelectedAvatarUrl(rnd);
                    setAvatarUploadError(null);
                  }}
                >
                  Random Avatar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={() => {
                    if (!selectedAvatarUrl) return;
                    setCustomAvatar(selectedAvatarUrl);
                    try {
                      localStorage.setItem(avatarStorageKey, selectedAvatarUrl);
                    } catch {}

                    if (employee) {
                      const updated = { ...employee, avatarUrl: selectedAvatarUrl };
                      onEmployeeUpdated?.(updated);
                      try {
                        const savedCand = localStorage.getItem('quantira_onboarding_candidates');
                        if (savedCand) {
                          const cands = JSON.parse(savedCand);
                          const next = cands.map((c: any) =>
                            c.id === employee.id ? { ...c, avatarUrl: selectedAvatarUrl } : c
                          );
                          localStorage.setItem('quantira_onboarding_candidates', JSON.stringify(next));
                        }
                      } catch {}
                    } else if (currentRole === 'EMPLOYEE') {
                      updatePhoto({
                        photoUrl: selectedAvatarUrl,
                        fileName: 'profile_picture.png',
                        fileSize: '1.2 MB'
                      });
                      try {
                        const savedFlow = localStorage.getItem('onboarding_mvp_flow_data');
                        if (savedFlow) {
                          const parsed = JSON.parse(savedFlow);
                          parsed.photo = { ...(parsed.photo || {}), photoUrl: selectedAvatarUrl };
                          localStorage.setItem('onboarding_mvp_flow_data', JSON.stringify(parsed));
                        }
                      } catch {}
                    }

                    showToastSuccess('Profile Picture Updated', 'Your profile picture has been saved.');
                    setShowEditAvatarModal(false);
                  }}
                >
                  Save &amp; Apply Photo
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-left">
            {/* Top Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-indigo-500 shrink-0 shadow-lg">
                <img
                  src={selectedAvatarUrl || effectiveProfile.avatar}
                  alt="Avatar Preview"
                  className="w-full h-full rounded-full object-cover shadow-inner bg-white dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2 text-center sm:text-left min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Profile Photo Preview
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a profile photo from your computer (JPG, PNG, or WebP up to 5MB).
                </p>
                <div>
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      setAvatarUploadError(null);
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        setAvatarUploadError('Selected file is not an image. Please choose a JPG, PNG, or WebP file.');
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setAvatarUploadError('Image size exceeds 5MB limit. Please choose a smaller photo.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setSelectedAvatarUrl(event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    leftIcon={<UploadCloud className="w-4 h-4" />}
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="text-xs font-bold"
                  >
                    Upload from Computer
                  </Button>
                </div>
              </div>
            </div>

            {avatarUploadError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{avatarUploadError}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ID Badge & Business Card Admin Edit Modal */}
      {showEditCardsModal && (
        <Modal
          isOpen={showEditCardsModal}
          onClose={() => setShowEditCardsModal(false)}
          title="Edit ID Badge & Business Card (Admin)"
          description={`Update credentials, physical ID badge photo, and business card details for ${effectiveProfile.name}.`}
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditCardsModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                onClick={handleSaveCards}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Card Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-left">
            {/* Badge Photo Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                ID Badge Photo (3:4 Ratio)
              </span>
              <div className="flex items-center gap-4">
                <div className="w-20 h-26 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                  {cardEditPhotoUrl ? (
                    <img
                      src={cardEditPhotoUrl}
                      alt="Badge Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a high-resolution front-facing portrait. This photo will be rendered on the employee's RFID ID badge.
                  </p>
                  <input
                    ref={cardPhotoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleCardPhotoSelected}
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                      onClick={() => cardPhotoInputRef.current?.click()}
                      className="text-xs"
                    >
                      Choose Photo
                    </Button>
                    {cardEditPhotoUrl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => setCardEditPhotoUrl('')}
                        className="text-xs"
                      >
                        Reset Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Information Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Designation / Job Title
                </label>
                <input
                  type="text"
                  value={cardEditJobTitle}
                  onChange={(e) => setCardEditJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Lead Enterprise Architect"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Department / Division
                </label>
                <input
                  type="text"
                  value={cardEditDepartment}
                  onChange={(e) => setCardEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Enterprise Engineering"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Direct Phone / Mobile
                </label>
                <input
                  type="text"
                  value={cardEditPhone}
                  onChange={(e) => setCardEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. +1 (415) 555-0100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Work Location / Office
                </label>
                <input
                  type="text"
                  value={cardEditLocation}
                  onChange={(e) => setCardEditLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. San Francisco HQ, CA"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Profile Audit & Activity History Tracking Modal */}
      {showProfileHistoryModal && (
        <Modal
          isOpen={showProfileHistoryModal}
          onClose={() => setShowProfileHistoryModal(false)}
          title={`Profile History & Audit Trail — ${effectiveProfile.name}`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Employee ID: <strong>{effectiveProfile.employeeId}</strong> • Total Events: <strong>{profileHistoryList.length}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleExportProfileHistory}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Export JSON
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowProfileHistoryModal(false)}
                  className="text-xs bg-blue-600 text-white font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-left max-h-[70vh] overflow-y-auto pr-1">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
              {[
                'All',
                'Demographics',
                'Contact & Address',
                'Family & Dependents',
                'Documents & Compliance',
                'Assets & IT',
                'Security & SSO',
                'Attendance',
                'Role & Management',
                'General'
              ].map((cat) => {
                const isSelected = historyCategoryFilter === cat;
                const count =
                  cat === 'All'
                    ? profileHistoryList.length
                    : profileHistoryList.filter((item) => item.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setHistoryCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search audit history by action, actor, category, or notes..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                {historySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <div className="relative w-full">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={historyTypeFilter}
                    onChange={(e) => setHistoryTypeFilter(e.target.value)}
                    className="w-full pl-8.5 pr-8 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="All">All Event Types</option>
                    <option value="success">Success Events</option>
                    <option value="info">Info / Updates</option>
                    <option value="warning">Warnings / Removals</option>
                    <option value="error">Errors / Alerts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {filteredHistoryList.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {filteredHistoryList.map((entry) => {
                  const isSuccess = entry.type === 'success';
                  const isWarning = entry.type === 'warning';
                  const isError = entry.type === 'error';

                  return (
                    <div key={entry.id} className="relative group">
                      <span
                        className={`absolute -left-6 top-1.5 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white dark:ring-slate-900 shadow-xs ${
                          isSuccess
                            ? 'bg-emerald-500 text-white'
                            : isWarning
                            ? 'bg-amber-500 text-white'
                            : isError
                            ? 'bg-rose-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : isError ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                      </span>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {entry.action}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {entry.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          By <strong className="font-semibold text-slate-700 dark:text-slate-300">{entry.user}</strong>
                        </div>

                        {entry.details && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            {entry.details}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No history entries found matching your filter criteria.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Generic Action Confirmation Popup */}
      {actionConfirmation && (
        <ConfirmDialog
          isOpen={Boolean(actionConfirmation)}
          title={actionConfirmation.title}
          message={actionConfirmation.message}
          confirmLabel={actionConfirmation.confirmLabel || 'Confirm'}
          variant={actionConfirmation.variant || 'info'}
          onClose={() => setActionConfirmation(null)}
          onConfirm={() => {
            const cb = actionConfirmation.onConfirm;
            setActionConfirmation(null);
            cb();
          }}
        />
      )}
    </div>
  );
};
