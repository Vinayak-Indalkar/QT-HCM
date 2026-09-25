import { OnboardingDocument } from './document';
import { OnboardingTask } from './task';

export type OnboardingStatus =
  | 'draft'
  | 'invited'
  | 'document_submission'
  | 'verification'
  | 'equipment_provisioning'
  | 'orientation_scheduled'
  | 'completed'
  | 'rejected';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contractor' | 'Intern';
export type WorkModel = 'Remote' | 'Hybrid' | 'On-site';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface EquipmentDetails {
  laptopModel: string;
  monitors: number;
  accessories: string[];
  softwareLicenses: string[];
  emailAlias: string;
  provisioningStatus: 'pending' | 'ordered' | 'configured' | 'shipped' | 'delivered';
  trackingNumber?: string;
  notes?: string;
}

export interface Dependent {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
}

export interface EmergencyContactItem {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  email?: string;
  isPrimary?: boolean;
}

export interface Candidate {
  id: string;
  name?: string;
  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodGroup?: string;
  email: string;
  corporateEmail?: string;
  personalEmail?: string;
  phone: string;
  contactNumber1?: string;
  contactNumber2?: string;
  hireSource?: string;
  offerReference?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  avatarUrl: string;
  status: OnboardingStatus;
  progress: number; // 0 - 100
  jobTitle: string;
  department: string;
  manager: string;
  managerEmail: string;
  employmentType: EmploymentType;
  workModel: WorkModel;
  startDate: string;
  officeLocation: string;
  line1Manager?: string;
  line2Manager?: string;
  isActive?: boolean;
  isTerminated?: boolean;
  terminationReason?: string;
  terminationDate?: string;
  password?: string;
  customFields?: Record<string, any>;
  dependents?: Dependent[];
  emergencyContacts?: EmergencyContactItem[];
  ssnLast4?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  compensation?: {
    salary: number;
    currency: string;
    payFrequency: 'Bi-weekly' | 'Monthly' | 'Semi-monthly';
  };
  equipment: EquipmentDetails;
  documents: OnboardingDocument[];
  tasks: OnboardingTask[];
  auditLogs: AuditLogEntry[];
  onboardingData?: any;
  createdAt: string;
  updatedAt: string;
}

