export interface OrganizationProfile {
  id: string;
  name: string;
  legalName: string;
  code: string;
  taxId: string; // EIN / GSTIN / VAT
  registrationNumber: string;
  corporateEmail: string;
  phone: string;
  website: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  fiscalYearStart: string; // 'January' | 'April'
  language: string;
  dateFormat: string;
  industry: string;
  employeeCountRange: string;
  foundedYear: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl?: string;
  subscriptionTier: 'Enterprise Unlimited' | 'Business Pro' | 'Growth Suite';
  licenseStatus: 'Active & Verified' | 'Trial' | 'Renewing Soon';
  maxAllowedUsers: number;
}

export interface BranchRecord {
  id: string;
  code: string;
  name: string;
  type: 'Headquarters' | 'Regional Office' | 'Tech Center' | 'Sales Hub' | 'Support Center';
  branchHead: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
  capacity: number;
  staffCount: number;
  status: 'Active' | 'Inactive' | 'Under Setup';
  establishedDate: string;
}

export interface ERPUserRecord {
  id: string;
  userCode: string;
  name: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'PAYROLL_ADMIN' | 'AUDITOR';
  roleLabel: string;
  department: string;
  branch: string;
  designation: string;
  ssoEnabled: boolean;
  status: 'Active' | 'Suspended' | 'Pending Invite';
  lastLogin: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface ModulePermission {
  module: string;
  moduleKey: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
}

export interface RolePermissionMatrix {
  id: string;
  roleKey: string;
  name: string;
  description: string;
  userCount: number;
  isSystemRole: boolean;
  permissions: ModulePermission[];
}

export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  parentDepartment?: string;
  costCenter: string;
  headcount: number;
  openPositions: number;
  budgetAnnualUSD: number;
  status: 'Active' | 'Inactive' | 'Restructuring';
  description?: string;
}

export interface DesignationRecord {
  id: string;
  code: string;
  title: string;
  level: string; // e.g. 'L1 - Junior', 'L2 - Mid', 'L3 - Senior', 'L4 - Lead', 'L5 - Staff', 'L6 - Principal', 'L7 - Director', 'Executive'
  department: string;
  minSalaryUSD: number;
  maxSalaryUSD: number;
  headcount: number;
  status: 'Active' | 'Inactive';
  description?: string;
}

export interface LocationRecord {
  id: string;
  code: string;
  siteName: string;
  type: 'Corporate Campus' | 'Technology Park' | 'Co-Working Hub' | 'Warehouse / Logistics' | 'Data Center' | 'Branch Facility';
  buildingFloor: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  capacity: number;
  workstations: number;
  emergencyContact: string;
  status: 'Operational' | 'Maintenance' | 'Planned';
}

export interface WorkflowStepDef {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  approverRole: 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'IT_ADMIN' | 'FINANCE_ADMIN' | 'AUTO';
  slaHours: number;
  required: boolean;
  allowSkip: boolean;
  notificationEmail: boolean;
}

export interface WorkflowDefinitionRecord {
  id: string;
  code: string;
  name: string;
  category: 'Onboarding' | 'Offboarding' | 'Approval' | 'Compliance' | 'Asset Management' | 'Performance';
  description: string;
  triggerEvent: string;
  targetDepartment: string;
  stepsCount: number;
  steps: WorkflowStepDef[];
  status: 'Active' | 'Draft' | 'Archived';
  version: string;
  lastUpdated: string;
  updatedBy: string;
}

const STORAGE_KEY_ORG_PROFILE = 'quantira_erp_org_profile';
const STORAGE_KEY_BRANCHES = 'quantira_erp_branches';
const STORAGE_KEY_USERS = 'quantira_erp_users';
const STORAGE_KEY_ROLES = 'quantira_erp_roles_matrix';
const STORAGE_KEY_DEPARTMENTS = 'quantira_erp_departments';
const STORAGE_KEY_DESIGNATIONS = 'quantira_erp_designations';
const STORAGE_KEY_LOCATIONS = 'quantira_erp_locations';
const STORAGE_KEY_WORKFLOWS = 'quantira_erp_workflows';

// Default Seed Data for Commercial Multi-Tenant ERP
export const DEFAULT_ORG_PROFILE: OrganizationProfile = {
  id: 'ORG-QUANTIRA-01',
  name: 'Quantira Technologies',
  legalName: 'Quantira Technologies Inc.',
  code: 'QT-HQ',
  taxId: 'US-EIN-894729104',
  registrationNumber: 'REG-2022-DEL-98214',
  corporateEmail: 'contact@quantiratechnologies.com',
  phone: '+1 (415) 555-0100',
  website: 'https://quantiratechnologies.com',
  currency: 'USD ($)',
  currencySymbol: '$',
  timezone: 'America/Los_Angeles (PST/PDT)',
  fiscalYearStart: 'January',
  language: 'English (US)',
  dateFormat: 'YYYY-MM-DD',
  industry: 'Enterprise Software & Cloud Infrastructure',
  employeeCountRange: '100 - 500 Employees',
  foundedYear: '2022',
  addressLine1: '500 Howard Street, Suite 400',
  addressLine2: 'Tech Corridor',
  city: 'San Francisco',
  state: 'California',
  country: 'United States',
  postalCode: '94105',
  logoUrl: '',
  subscriptionTier: 'Enterprise Unlimited',
  licenseStatus: 'Active & Verified',
  maxAllowedUsers: 1000
};

export const DEFAULT_BRANCHES: BranchRecord[] = [
  {
    id: 'br-1',
    code: 'BR-SF-HQ',
    name: 'San Francisco Global Headquarters',
    type: 'Headquarters',
    branchHead: 'Marcus Brody',
    email: 'sf-hq@quantiratechnologies.com',
    phone: '+1 (415) 555-0100',
    address: '500 Howard Street, Suite 400',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    postalCode: '94105',
    timezone: 'PST (UTC-8)',
    capacity: 250,
    staffCount: 142,
    status: 'Active',
    establishedDate: '2022-01-15'
  },
  {
    id: 'br-2',
    code: 'BR-ATX-02',
    name: 'Austin Cloud Innovation Lab',
    type: 'Tech Center',
    branchHead: 'Sarah Chen',
    email: 'austin-lab@quantiratechnologies.com',
    phone: '+1 (512) 555-0144',
    address: '100 Congress Avenue, Floor 12',
    city: 'Austin',
    state: 'Texas',
    country: 'United States',
    postalCode: '78701',
    timezone: 'CST (UTC-6)',
    capacity: 120,
    staffCount: 68,
    status: 'Active',
    establishedDate: '2022-09-01'
  },
  {
    id: 'br-3',
    code: 'BR-LON-03',
    name: 'London EMEA Operations Center',
    type: 'Regional Office',
    branchHead: 'Oliver Thorne',
    email: 'london-emea@quantiratechnologies.com',
    phone: '+44 20 7946 0912',
    address: '25 Bank Street, Canary Wharf',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    postalCode: 'E14 5JP',
    timezone: 'GMT (UTC+0)',
    capacity: 100,
    staffCount: 45,
    status: 'Active',
    establishedDate: '2023-04-10'
  },
  {
    id: 'br-4',
    code: 'BR-SGP-04',
    name: 'Singapore APAC Financial Hub',
    type: 'Regional Office',
    branchHead: 'Mei-Ling Tan',
    email: 'singapore-apac@quantiratechnologies.com',
    phone: '+65 6789 0123',
    address: '10 Marina Boulevard, Tower 2',
    city: 'Singapore',
    state: 'Central Region',
    country: 'Singapore',
    postalCode: '018983',
    timezone: 'SGT (UTC+8)',
    capacity: 80,
    staffCount: 34,
    status: 'Active',
    establishedDate: '2023-11-20'
  },
  {
    id: 'br-5',
    code: 'BR-BLR-05',
    name: 'Bangalore Engineering Center',
    type: 'Tech Center',
    branchHead: 'Rajesh Kumar',
    email: 'bangalore-dev@quantiratechnologies.com',
    phone: '+91 80 4123 4567',
    address: 'Embassy TechVillage, Outer Ring Road',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560103',
    timezone: 'IST (UTC+5:30)',
    capacity: 200,
    staffCount: 96,
    status: 'Active',
    establishedDate: '2024-02-01'
  }
];

export const DEFAULT_ERP_USERS: ERPUserRecord[] = [
  {
    id: 'usr-1',
    userCode: 'USR-ADM-001',
    name: 'Alexandra Wright',
    email: 'admin@quantira.com',
    phone: '+1 (415) 555-0101',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Administrator',
    department: 'Operations & IT',
    branch: 'San Francisco Global Headquarters',
    designation: 'Principal Enterprise Administrator',
    ssoEnabled: true,
    status: 'Active',
    lastLogin: '2026-09-25 12:45 PM',
    createdAt: '2022-01-15'
  },
  {
    id: 'usr-2',
    userCode: 'USR-HR-002',
    name: 'Eleanor Vance',
    email: 'hr@quantira.com',
    phone: '+1 (415) 555-0102',
    role: 'HR',
    roleLabel: 'HR Enterprise Lead',
    department: 'Human Resources',
    branch: 'San Francisco Global Headquarters',
    designation: 'Head of People Operations',
    ssoEnabled: true,
    status: 'Active',
    lastLogin: '2026-09-25 11:30 AM',
    createdAt: '2022-02-10'
  },
  {
    id: 'usr-3',
    userCode: 'USR-MGR-003',
    name: 'Marcus Brody',
    email: 'manager@quantira.com',
    phone: '+1 (415) 555-0104',
    role: 'MANAGER',
    roleLabel: 'Engineering Manager',
    department: 'Engineering',
    branch: 'San Francisco Global Headquarters',
    designation: 'VP of Engineering',
    ssoEnabled: true,
    status: 'Active',
    lastLogin: '2026-09-25 10:15 AM',
    createdAt: '2022-03-15'
  },
  {
    id: 'usr-4',
    userCode: 'USR-EMP-004',
    name: 'Sarah Chen',
    email: 'sarah.chen@quantira.com',
    phone: '+1 (512) 555-0144',
    role: 'EMPLOYEE',
    roleLabel: 'Team Member',
    department: 'Engineering',
    branch: 'Austin Cloud Innovation Lab',
    designation: 'Staff Cloud Infrastructure Architect',
    ssoEnabled: true,
    status: 'Active',
    lastLogin: '2026-09-24 05:20 PM',
    createdAt: '2022-09-01'
  },
  {
    id: 'usr-5',
    userCode: 'USR-PAY-005',
    name: 'David Miller',
    email: 'payroll@quantira.com',
    phone: '+1 (415) 555-0188',
    role: 'PAYROLL_ADMIN',
    roleLabel: 'Payroll & Benefits Administrator',
    department: 'Finance & Accounts',
    branch: 'San Francisco Global Headquarters',
    designation: 'Lead Payroll Officer',
    ssoEnabled: true,
    status: 'Active',
    lastLogin: '2026-09-25 09:00 AM',
    createdAt: '2023-01-20'
  },
  {
    id: 'usr-6',
    userCode: 'USR-AUD-006',
    name: 'Elena Rostova',
    email: 'auditor@quantira.com',
    phone: '+44 20 7946 0999',
    role: 'AUDITOR',
    roleLabel: 'Statutory Compliance Auditor',
    department: 'Legal & Compliance',
    branch: 'London EMEA Operations Center',
    designation: 'Chief Compliance Auditor',
    ssoEnabled: true,
    status: 'Active',
    lastLogin: '2026-09-23 03:40 PM',
    createdAt: '2023-05-15'
  }
];

export const DEFAULT_MODULE_PERMISSIONS: ModulePermission[] = [
  { module: 'Employee Directory & Profiles', moduleKey: 'employees', view: true, create: true, edit: true, delete: true, export: true, approve: true },
  { module: 'Onboarding Workflow & Tasks', moduleKey: 'onboarding', view: true, create: true, edit: true, delete: true, export: true, approve: true },
  { module: 'Compliance & Legal Documents', moduleKey: 'documents', view: true, create: true, edit: true, delete: true, export: true, approve: true },
  { module: 'IT Asset Management', moduleKey: 'assets', view: true, create: true, edit: true, delete: true, export: true, approve: true },
  { module: 'Time, Attendance & Punch Logs', moduleKey: 'attendance', view: true, create: true, edit: true, delete: true, export: true, approve: true },
  { module: 'Custom KPI Dashboards & Metrics', moduleKey: 'dashboards', view: true, create: true, edit: true, delete: true, export: true, approve: true },
  { module: 'System Configurations & Custom Fields', moduleKey: 'configurations', view: true, create: true, edit: true, delete: true, export: true, approve: true },
  { module: 'Organization Structure & Setup', moduleKey: 'setup', view: true, create: true, edit: true, delete: true, export: true, approve: true }
];

export const DEFAULT_ROLES_MATRIX: RolePermissionMatrix[] = [
  {
    id: 'role-super-admin',
    roleKey: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Unrestricted full enterprise access across all corporate entities, security, structure, and database operations.',
    userCount: 2,
    isSystemRole: true,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((p) => ({ ...p, view: true, create: true, edit: true, delete: true, export: true, approve: true }))
  },
  {
    id: 'role-hr-admin',
    roleKey: 'HR',
    name: 'HR Enterprise Admin',
    description: 'Manages employee lifecycles, hiring pipelines, onboarding verification, and statutory policy records.',
    userCount: 5,
    isSystemRole: true,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((p) => ({
      ...p,
      view: true,
      create: p.moduleKey !== 'setup',
      edit: p.moduleKey !== 'setup',
      delete: ['employees', 'onboarding', 'documents'].includes(p.moduleKey),
      export: true,
      approve: true
    }))
  },
  {
    id: 'role-manager',
    roleKey: 'MANAGER',
    name: 'Hiring & Line Manager',
    description: 'Oversees team member performance, task approvals, interview feedback, and department attendance.',
    userCount: 14,
    isSystemRole: true,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((p) => ({
      ...p,
      view: ['employees', 'onboarding', 'attendance', 'dashboards'].includes(p.moduleKey),
      create: p.moduleKey === 'onboarding',
      edit: ['employees', 'onboarding'].includes(p.moduleKey),
      delete: false,
      export: ['employees', 'attendance'].includes(p.moduleKey),
      approve: true
    }))
  },
  {
    id: 'role-employee',
    roleKey: 'EMPLOYEE',
    name: 'Standard Employee',
    description: 'Self-service access to personal profile, onboarding steps, attendance punching, and assigned assets.',
    userCount: 350,
    isSystemRole: true,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((p) => ({
      ...p,
      view: ['employees', 'onboarding', 'documents', 'assets', 'attendance'].includes(p.moduleKey),
      create: false,
      edit: p.moduleKey === 'employees', // personal profile
      delete: false,
      export: false,
      approve: false
    }))
  },
  {
    id: 'role-payroll',
    roleKey: 'PAYROLL_ADMIN',
    name: 'Payroll & Benefits Officer',
    description: 'Access to compensation structures, salary slips, bank credentials, and tax deductions.',
    userCount: 3,
    isSystemRole: false,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((p) => ({
      ...p,
      view: ['employees', 'documents', 'attendance'].includes(p.moduleKey),
      create: true,
      edit: true,
      delete: false,
      export: true,
      approve: true
    }))
  },
  {
    id: 'role-auditor',
    roleKey: 'AUDITOR',
    name: 'Statutory Compliance Auditor',
    description: 'Read-only access to all audit logs, employee legal documents, and verification trail records.',
    userCount: 2,
    isSystemRole: false,
    permissions: DEFAULT_MODULE_PERMISSIONS.map((p) => ({
      ...p,
      view: true,
      create: false,
      edit: false,
      delete: false,
      export: true,
      approve: false
    }))
  }
];

export const DEFAULT_DEPARTMENTS: DepartmentRecord[] = [
  {
    id: 'dept-1',
    code: 'DPT-ENG-01',
    name: 'Engineering & Technology',
    headOfDepartment: 'Marcus Brody',
    costCenter: 'CC-ENG-901',
    headcount: 120,
    openPositions: 8,
    budgetAnnualUSD: 8500000,
    status: 'Active',
    description: 'Core software development, cloud infrastructure, AI architecture, and engineering platforms.'
  },
  {
    id: 'dept-2',
    code: 'DPT-PROD-02',
    name: 'Product Design & UX',
    headOfDepartment: 'Elena Rostova',
    parentDepartment: 'Engineering & Technology',
    costCenter: 'CC-PRD-902',
    headcount: 24,
    openPositions: 3,
    budgetAnnualUSD: 2100000,
    status: 'Active',
    description: 'User research, interface design systems, product strategy, and feature ergonomics.'
  },
  {
    id: 'dept-3',
    code: 'DPT-HR-03',
    name: 'People Operations & HR',
    headOfDepartment: 'Eleanor Vance',
    costCenter: 'CC-HR-903',
    headcount: 18,
    openPositions: 2,
    budgetAnnualUSD: 1400000,
    status: 'Active',
    description: 'Talent acquisition, employee onboarding, culture, compensation benchmarking, and compliance.'
  },
  {
    id: 'dept-4',
    code: 'DPT-FIN-04',
    name: 'Finance & Accounts',
    headOfDepartment: 'David Miller',
    costCenter: 'CC-FIN-904',
    headcount: 14,
    openPositions: 1,
    budgetAnnualUSD: 1200000,
    status: 'Active',
    description: 'Financial forecasting, payroll distribution, corporate audit, tax filing, and treasury.'
  },
  {
    id: 'dept-5',
    code: 'DPT-SALES-05',
    name: 'Global Sales & Marketing',
    headOfDepartment: 'Oliver Thorne',
    costCenter: 'CC-SLS-905',
    headcount: 45,
    openPositions: 6,
    budgetAnnualUSD: 3800000,
    status: 'Active',
    description: 'Enterprise B2B client acquisition, account management, growth marketing, and branding.'
  },
  {
    id: 'dept-6',
    code: 'DPT-LEGAL-06',
    name: 'Legal & Corporate Governance',
    headOfDepartment: 'Sophia Sterling',
    costCenter: 'CC-LGL-906',
    headcount: 8,
    openPositions: 1,
    budgetAnnualUSD: 950000,
    status: 'Active',
    description: 'Contracts, IP protection, regulatory compliance, statutory audit, and GDPR/CCPA enforcement.'
  }
];

export const DEFAULT_DESIGNATIONS: DesignationRecord[] = [
  { id: 'des-1', code: 'DES-VP-ENG', title: 'VP of Engineering', level: 'Executive', department: 'Engineering & Technology', minSalaryUSD: 240000, maxSalaryUSD: 320000, headcount: 1, status: 'Active' },
  { id: 'des-2', code: 'DES-ARCH-01', title: 'Principal Enterprise Architect', level: 'L6 - Principal', department: 'Engineering & Technology', minSalaryUSD: 190000, maxSalaryUSD: 250000, headcount: 4, status: 'Active' },
  { id: 'des-3', code: 'DES-STF-02', title: 'Staff Cloud Solutions Architect', level: 'L5 - Staff', department: 'Engineering & Technology', minSalaryUSD: 160000, maxSalaryUSD: 210000, headcount: 12, status: 'Active' },
  { id: 'des-4', code: 'DES-SR-03', title: 'Senior Full Stack Engineer', level: 'L3 - Senior', department: 'Engineering & Technology', minSalaryUSD: 130000, maxSalaryUSD: 175000, headcount: 38, status: 'Active' },
  { id: 'des-5', code: 'DES-SWE-04', title: 'Software Engineer II', level: 'L2 - Mid', department: 'Engineering & Technology', minSalaryUSD: 95000, maxSalaryUSD: 130000, headcount: 45, status: 'Active' },
  { id: 'des-6', code: 'DES-HEAD-HR', title: 'Head of People Operations', level: 'L7 - Director', department: 'People Operations & HR', minSalaryUSD: 170000, maxSalaryUSD: 220000, headcount: 1, status: 'Active' },
  { id: 'des-7', code: 'DES-HRBP', title: 'Senior HR Business Partner', level: 'L4 - Lead', department: 'People Operations & HR', minSalaryUSD: 110000, maxSalaryUSD: 145000, headcount: 4, status: 'Active' },
  { id: 'des-8', code: 'DES-PRD-DIR', title: 'Director of Product Management', level: 'L7 - Director', department: 'Product Design & UX', minSalaryUSD: 195000, maxSalaryUSD: 260000, headcount: 1, status: 'Active' },
  { id: 'des-9', code: 'DES-UX-LEAD', title: 'Lead Product Designer', level: 'L4 - Lead', department: 'Product Design & UX', minSalaryUSD: 135000, maxSalaryUSD: 180000, headcount: 6, status: 'Active' },
  { id: 'des-10', code: 'DES-CFO', title: 'Chief Financial Officer', level: 'Executive', department: 'Finance & Accounts', minSalaryUSD: 260000, maxSalaryUSD: 350000, headcount: 1, status: 'Active' },
  { id: 'des-11', code: 'DES-PAY-MGR', title: 'Lead Payroll Specialist', level: 'L3 - Senior', department: 'Finance & Accounts', minSalaryUSD: 95000, maxSalaryUSD: 130000, headcount: 3, status: 'Active' }
];

export const DEFAULT_LOCATIONS: LocationRecord[] = [
  {
    id: 'loc-1',
    code: 'LOC-SFO-01',
    siteName: 'Howard Street Corporate Center',
    type: 'Corporate Campus',
    buildingFloor: 'Building A, Floors 4 & 5',
    address: '500 Howard Street',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    postalCode: '94105',
    capacity: 250,
    workstations: 210,
    emergencyContact: '+1 (415) 555-0911',
    status: 'Operational'
  },
  {
    id: 'loc-2',
    code: 'LOC-ATX-02',
    siteName: 'Congress Tech Tower',
    type: 'Technology Park',
    buildingFloor: 'Floor 12',
    address: '100 Congress Avenue',
    city: 'Austin',
    state: 'Texas',
    country: 'United States',
    postalCode: '78701',
    capacity: 120,
    workstations: 100,
    emergencyContact: '+1 (512) 555-0911',
    status: 'Operational'
  },
  {
    id: 'loc-3',
    code: 'LOC-LON-03',
    siteName: 'Canary Wharf Tower',
    type: 'Branch Facility',
    buildingFloor: 'Floor 18',
    address: '25 Bank Street',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    postalCode: 'E14 5JP',
    capacity: 100,
    workstations: 85,
    emergencyContact: '+44 20 7946 0999',
    status: 'Operational'
  },
  {
    id: 'loc-4',
    code: 'LOC-SGP-04',
    siteName: 'Marina Bay Financial Tower 2',
    type: 'Branch Facility',
    buildingFloor: 'Level 24',
    address: '10 Marina Boulevard',
    city: 'Singapore',
    state: 'Central Region',
    country: 'Singapore',
    postalCode: '018983',
    capacity: 80,
    workstations: 70,
    emergencyContact: '+65 6789 0999',
    status: 'Operational'
  },
  {
    id: 'loc-5',
    code: 'LOC-BLR-05',
    siteName: 'Embassy TechVillage Block C',
    type: 'Technology Park',
    buildingFloor: 'Ground + 1st Floor',
    address: 'Outer Ring Road, Devarabisanahalli',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560103',
    capacity: 200,
    workstations: 180,
    emergencyContact: '+91 80 4123 0999',
    status: 'Operational'
  }
];

// =========================================================================
// ORGANIZATION PROFILE STORAGE METHODS
// =========================================================================
export function getOrganizationProfile(): OrganizationProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ORG_PROFILE);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_ORG_PROFILE;
}

export function saveOrganizationProfile(profile: OrganizationProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORG_PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('quantira_org_profile_updated', { detail: profile }));
  } catch {}
}

// =========================================================================
// BRANCHES STORAGE METHODS
// =========================================================================
export function getBranches(): BranchRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BRANCHES);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_BRANCHES;
}

export function saveBranches(branches: BranchRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(branches));
    window.dispatchEvent(new CustomEvent('quantira_branches_updated', { detail: branches }));
  } catch {}
}

// =========================================================================
// ERP USERS STORAGE METHODS
// =========================================================================
export function getERPUsers(): ERPUserRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_ERP_USERS;
}

export function saveERPUsers(users: ERPUserRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('quantira_erp_users_updated', { detail: users }));
  } catch {}
}

// =========================================================================
// ROLES & PERMISSIONS MATRIX STORAGE METHODS
// =========================================================================
export function getRolesPermissionsMatrix(): RolePermissionMatrix[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ROLES);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_ROLES_MATRIX;
}

export function saveRolesPermissionsMatrix(roles: RolePermissionMatrix[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles));
    window.dispatchEvent(new CustomEvent('quantira_roles_updated', { detail: roles }));
  } catch {}
}

// =========================================================================
// DEPARTMENTS STORAGE METHODS
// =========================================================================
export function getDepartments(): DepartmentRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_DEPARTMENTS;
}

export function saveDepartments(depts: DepartmentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(depts));
    window.dispatchEvent(new CustomEvent('quantira_departments_updated', { detail: depts }));
  } catch {}
}

// =========================================================================
// DESIGNATIONS STORAGE METHODS
// =========================================================================
export function getDesignations(): DesignationRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DESIGNATIONS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_DESIGNATIONS;
}

export function saveDesignations(designations: DesignationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DESIGNATIONS, JSON.stringify(designations));
    window.dispatchEvent(new CustomEvent('quantira_designations_updated', { detail: designations }));
  } catch {}
}

// =========================================================================
// LOCATIONS STORAGE METHODS
// =========================================================================
export function getLocations(): LocationRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOCATIONS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_LOCATIONS;
}

export function saveLocations(locs: LocationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locs));
    window.dispatchEvent(new CustomEvent('quantira_locations_updated', { detail: locs }));
  } catch {}
}

// =========================================================================
// DEFAULT WORKFLOWS DEFINITIONS
// =========================================================================
export const DEFAULT_WORKFLOWS: WorkflowDefinitionRecord[] = [
  {
    id: 'WF-ONB-01',
    code: 'WF-EMP-ONBOARDING',
    name: 'Standard Employee Onboarding Pipeline',
    category: 'Onboarding',
    description: 'Mandatory 10-step digital onboarding journey covering personal info, statutory compliance, NDA sign-off, equipment provisioning, and day-1 orientation.',
    triggerEvent: 'New Candidate Offer Acceptance',
    targetDepartment: 'All Departments',
    stepsCount: 5,
    status: 'Active',
    version: 'v2.4',
    lastUpdated: '2026-03-15',
    updatedBy: 'Sarah Jenkins (Super Admin)',
    steps: [
      {
        id: 'wfs-1',
        stepNumber: 1,
        name: 'Digital Persona & Statutory ID Verification',
        description: 'Candidate submits government photo ID, tax identifier, and permanent address proof.',
        approverRole: 'HR',
        slaHours: 24,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-2',
        stepNumber: 2,
        name: 'Corporate Legal Agreements & NDA Signature',
        description: 'Digitally sign Proprietary Information Agreement, Non-Disclosure Contract, and Code of Conduct.',
        approverRole: 'SUPER_ADMIN',
        slaHours: 48,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-3',
        stepNumber: 3,
        name: 'IT Hardware & Cloud Credential Provisioning',
        description: 'Allocate laptop workstation, configure SSO, issue corporate email, and generate access badge.',
        approverRole: 'IT_ADMIN',
        slaHours: 48,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-4',
        stepNumber: 4,
        name: 'Manager 1-on-1 & Team Buddy Alignment',
        description: 'Reporting manager schedules 30-day KPI goals review and assigns senior onboarding mentor.',
        approverRole: 'MANAGER',
        slaHours: 72,
        required: true,
        allowSkip: true,
        notificationEmail: true
      },
      {
        id: 'wfs-5',
        stepNumber: 5,
        name: 'Final HR Dossier Verification & Payroll Handshake',
        description: 'HR Ops validates emergency contacts, direct deposit bank info, and transitions status to Active.',
        approverRole: 'FINANCE_ADMIN',
        slaHours: 24,
        required: true,
        allowSkip: false,
        notificationEmail: true
      }
    ]
  },
  {
    id: 'WF-DOC-02',
    code: 'WF-DOC-COMPLIANCE',
    name: 'Statutory Document Verification & Background Check',
    category: 'Compliance',
    description: 'Third-party criminal background check, degree verification, and Form I-9 federal employment verification audit.',
    triggerEvent: 'Document Upload Complete',
    targetDepartment: 'All Departments',
    stepsCount: 3,
    status: 'Active',
    version: 'v1.8',
    lastUpdated: '2026-03-01',
    updatedBy: 'David Vance (HR Ops)',
    steps: [
      {
        id: 'wfs-21',
        stepNumber: 1,
        name: 'Automated OCR & Integrity Scan',
        description: 'System automatically verifies PDF/Image file resolution and checks document expiry dates.',
        approverRole: 'AUTO',
        slaHours: 4,
        required: true,
        allowSkip: false,
        notificationEmail: false
      },
      {
        id: 'wfs-22',
        stepNumber: 2,
        name: 'HR Compliance Officer Manual Audit',
        description: 'HR Compliance officer cross-verifies government records against official tax and immigration databases.',
        approverRole: 'HR',
        slaHours: 48,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-23',
        stepNumber: 3,
        name: 'Legal & Risk Clearance Sign-Off',
        description: 'Final clearance issued and encrypted archival into employee corporate digital locker.',
        approverRole: 'SUPER_ADMIN',
        slaHours: 24,
        required: false,
        allowSkip: true,
        notificationEmail: true
      }
    ]
  },
  {
    id: 'WF-AST-03',
    code: 'WF-IT-ASSET-ALLOCATION',
    name: 'Hardware Asset Allocation & Return Lifecycle',
    category: 'Asset Management',
    description: 'End-to-end procurement, configuration, courier dispatch, and remote sign-off for developer laptops and peripherals.',
    triggerEvent: 'Work Setup Step Approved',
    targetDepartment: 'Engineering',
    stepsCount: 4,
    status: 'Active',
    version: 'v2.1',
    lastUpdated: '2026-02-20',
    updatedBy: 'Kevin Zhang (IT Director)',
    steps: [
      {
        id: 'wfs-31',
        stepNumber: 1,
        name: 'Inventory Allocation & Asset Tagging',
        description: 'Assign serial numbers and affix Quantira ERP barcode tags to MacBook Pro / Dell Workstation.',
        approverRole: 'IT_ADMIN',
        slaHours: 24,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-32',
        stepNumber: 2,
        name: 'MDM & Security Policy Enrollment',
        description: 'Enroll in Microsoft Intune / Jamf Pro MDM, enforce BitLocker / FileVault disk encryption.',
        approverRole: 'IT_ADMIN',
        slaHours: 12,
        required: true,
        allowSkip: false,
        notificationEmail: false
      },
      {
        id: 'wfs-33',
        stepNumber: 3,
        name: 'Courier Dispatch / Desk Provisioning',
        description: 'Generate shipping label with tracking code or deliver directly to branch workspace desk.',
        approverRole: 'HR',
        slaHours: 48,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-34',
        stepNumber: 4,
        name: 'Employee Receipt Acknowledgment',
        description: 'Employee uploads unboxing signature or scans QR code upon physical receipt.',
        approverRole: 'AUTO',
        slaHours: 72,
        required: true,
        allowSkip: true,
        notificationEmail: true
      }
    ]
  },
  {
    id: 'WF-EXIT-04',
    code: 'WF-EMP-OFFBOARDING',
    name: 'Employee Offboarding & Exit Clearance',
    category: 'Offboarding',
    description: 'Systematic resignation processing, knowledge transfer sign-off, asset recovery, and payroll settlement.',
    triggerEvent: 'Resignation Submitted or Termination Notice',
    targetDepartment: 'All Departments',
    stepsCount: 4,
    status: 'Active',
    version: 'v1.5',
    lastUpdated: '2026-01-18',
    updatedBy: 'Sarah Jenkins (Super Admin)',
    steps: [
      {
        id: 'wfs-41',
        stepNumber: 1,
        name: 'Manager Exit Interview & KT Sign-Off',
        description: 'Direct manager confirms handoff of active repositories, client accounts, and project deliverables.',
        approverRole: 'MANAGER',
        slaHours: 72,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-42',
        stepNumber: 2,
        name: 'IT Hardware Return & Access Revocation',
        description: 'Revoke SSO, Google Workspace, AWS tokens, and collect laptop / access badge.',
        approverRole: 'IT_ADMIN',
        slaHours: 24,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-43',
        stepNumber: 3,
        name: 'Finance & Full & Final (FnF) Settlement',
        description: 'Compute gratuity, leave encashment, pending reimbursements, and tax deductions.',
        approverRole: 'FINANCE_ADMIN',
        slaHours: 48,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-44',
        stepNumber: 4,
        name: 'Release Experience Letter & Relieving Order',
        description: 'Generate digitally signed service certificate and archive records into alumni database.',
        approverRole: 'HR',
        slaHours: 24,
        required: true,
        allowSkip: false,
        notificationEmail: true
      }
    ]
  },
  {
    id: 'WF-APPR-05',
    code: 'WF-PROMOTION-TRANSFER',
    name: 'Promotion, Band Increment & Branch Transfer',
    category: 'Approval',
    description: 'Multi-level executive approval pipeline for employee designation upgrades, salary revisions, and inter-branch relocations.',
    triggerEvent: 'Manager Promotion / Transfer Request',
    targetDepartment: 'All Departments',
    stepsCount: 3,
    status: 'Active',
    version: 'v1.2',
    lastUpdated: '2026-02-10',
    updatedBy: 'Sarah Jenkins (Super Admin)',
    steps: [
      {
        id: 'wfs-51',
        stepNumber: 1,
        name: 'Department Head Justification & Review',
        description: 'Head of Department reviews performance appraisal score and validates compensation revision band.',
        approverRole: 'MANAGER',
        slaHours: 48,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-52',
        stepNumber: 2,
        name: 'Finance Budgetary Impact Audit',
        description: 'Finance controller confirms department annual budget headroom.',
        approverRole: 'FINANCE_ADMIN',
        slaHours: 48,
        required: true,
        allowSkip: false,
        notificationEmail: true
      },
      {
        id: 'wfs-53',
        stepNumber: 3,
        name: 'Executive & HR Final Sanction',
        description: 'Super Admin or HR VP approves designation title change and triggers official revised appointment letter.',
        approverRole: 'SUPER_ADMIN',
        slaHours: 24,
        required: true,
        allowSkip: false,
        notificationEmail: true
      }
    ]
  }
];

// =========================================================================
// WORKFLOWS STORAGE METHODS
// =========================================================================
export function getWorkflows(): WorkflowDefinitionRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WORKFLOWS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_WORKFLOWS;
}

export function saveWorkflows(workflows: WorkflowDefinitionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WORKFLOWS, JSON.stringify(workflows));
    window.dispatchEvent(new CustomEvent('quantira_workflows_updated', { detail: workflows }));
  } catch {}
}

// =========================================================================
// RESET ALL SETUP TO INITIAL COMMERCIAL DEFAULTS
// =========================================================================
export function resetAllSetupDefaults(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ORG_PROFILE);
    localStorage.removeItem(STORAGE_KEY_BRANCHES);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_ROLES);
    localStorage.removeItem(STORAGE_KEY_DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEY_DESIGNATIONS);
    localStorage.removeItem(STORAGE_KEY_LOCATIONS);
    localStorage.removeItem(STORAGE_KEY_WORKFLOWS);
    window.dispatchEvent(new CustomEvent('quantira_org_profile_updated', { detail: DEFAULT_ORG_PROFILE }));
    window.dispatchEvent(new CustomEvent('quantira_branches_updated', { detail: DEFAULT_BRANCHES }));
    window.dispatchEvent(new CustomEvent('quantira_erp_users_updated', { detail: DEFAULT_ERP_USERS }));
    window.dispatchEvent(new CustomEvent('quantira_roles_updated', { detail: DEFAULT_ROLES_MATRIX }));
    window.dispatchEvent(new CustomEvent('quantira_departments_updated', { detail: DEFAULT_DEPARTMENTS }));
    window.dispatchEvent(new CustomEvent('quantira_designations_updated', { detail: DEFAULT_DESIGNATIONS }));
    window.dispatchEvent(new CustomEvent('quantira_locations_updated', { detail: DEFAULT_LOCATIONS }));
    window.dispatchEvent(new CustomEvent('quantira_workflows_updated', { detail: DEFAULT_WORKFLOWS }));
  } catch {}
}
