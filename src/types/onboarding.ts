export type OnboardingStepId =
  | 'personal_documents'
  | 'policies_account'
  | 'work_setup'
  | 'review_submit';

export interface OnboardingStepMeta {
  id: OnboardingStepId;
  stepNumber: number;
  title: string;
  description: string;
  shortTitle: string;
  includes: string;
}

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  {
    id: 'personal_documents',
    stepNumber: 1,
    title: 'Personal Information & Statutory Documents',
    shortTitle: 'Personal & Documents',
    description: 'Verify your personal demographics, contact details, education, and upload statutory employment verification documents.',
    includes: 'Personal Information + Documents'
  },
  {
    id: 'policies_account',
    stepNumber: 2,
    title: 'Corporate Policies & Account Setup',
    shortTitle: 'Policies & Account',
    description: 'Review and electronically sign corporate NDA agreements and inspect provisioned Okta SSO credentials.',
    includes: 'NDA & Ethics + Account & SSO'
  },
  {
    id: 'work_setup',
    stepNumber: 3,
    title: 'Work Setup & Workplace Preferences',
    shortTitle: 'Work Setup',
    description: 'Configure your ID badge photo, email signature, workstation hardware, reporting lines, and campus facilities.',
    includes: 'Photo + Email Signature + Equipment/Assets + Team & Manager + Office Setup'
  },
  {
    id: 'review_submit',
    stepNumber: 4,
    title: 'Final Review & Onboarding Submission',
    shortTitle: 'Review & Submit',
    description: 'Verify all onboarding sections across all previous groups and submit your package for HR activation.',
    includes: 'Review everything + Submit'
  }
];

// Document Upload item
export interface UploadedDocument {
  id: string;
  type: string;
  name: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  rejectionReason?: string;
  category?: string;
}

// Complete 10-step Onboarding State
export interface OnboardingData {
  // Step 1: Personal Info
  personalInfo: {
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
    phone?: string;
    contactNumber1?: string;
    contactNumber2?: string;
    hireSource?: string;
    offerReference?: string;
    githubUsername?: string;
    linkedinUrl?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    jobTitle: string;
    department: string;
    employeeId: string;
    startDate: string;
    workLocation: string;
    officeLocation?: string;
    workModel?: string;
    employmentType: string;
    education: string;
    line1Manager?: string;
    line2Manager?: string;
    manager?: string;
    avatarUrl?: string;
    customFields?: Record<string, any>;
    dependents?: Array<{
      id: string;
      name: string;
      relationship: string;
      dateOfBirth?: string;
      gender?: string;
      phone?: string;
      email?: string;
    }>;
    emergencyContacts?: Array<{
      id: string;
      name: string;
      relationship: string;
      phone: string;
      altPhone?: string;
      email?: string;
      isPrimary?: boolean;
    }>;
  };

  // Step 2: Documents
  documents: UploadedDocument[];

  // Step 3: NDA / Agreement
  nda: {
    agreementVersion: string;
    accepted: boolean;
    acceptedAt?: string;
    signedName?: string;
  };

  // Step 4: Corporate Account Setup
  corporateAccount: {
    corporateEmail: string;
    accountStatus: 'Active' | 'Provisioned' | 'Pending Activation';
    ssoProvider: string;
    temporaryPassword?: string;
    instructions: string;
  };

  // Step 5: Employee Photo
  photo: {
    photoUrl?: string;
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
  };

  // Step 6: Email Signature
  emailSignature: {
    name: string;
    title: string;
    department: string;
    phone: string;
    mobile: string;
    tagline: string;
    digitalSignatureUrl?: string;
    digitalSignatureFileName?: string;
  };

  // Step 7: Equipment
  equipment: {
    selectedEquipment: string[];
    specialRequests: string;
    status: 'Requested' | 'Approved' | 'Shipped';
    assignedAssets?: any[];
  };

  // Step 8: Team & Manager
  team: {
    managerName: string;
    managerTitle: string;
    managerEmail: string;
    managerPhone: string;
    managerAvatar: string;
    teamName: string;
    teamDescription: string;
    firstWeekBuddy: string;
  };

  // Step 9: Office Setup
  officeSetup: {
    deskLocation: string;
    parkingRequired: boolean;
    licensePlate?: string;
    permitType?: string;
    accessCardLevel: string;
    lockerRequired: boolean;
    specialAccommodations: string;
  };

  // Step & Meta
  currentStepIndex: number; // 0 to 3
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Completed';
  completedSteps: OnboardingStepId[];
  submittedAt?: string;
  completedAt?: string;
}

// Future Dynamic Field Architecture
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'checkbox'
  | 'radio'
  | 'file';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  stepId: OnboardingStepId;
  placeholder?: string;
  helperText?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
  viewPermissions?: string[];
  editPermissions?: string[];
  conditionalOn?: {
    fieldId: string;
    equals: unknown;
  };
}
