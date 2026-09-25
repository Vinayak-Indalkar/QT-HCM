import { Candidate } from '../types/candidate';
import { OnboardingTask } from '../types/task';
import { UserProfile } from '../types/common';
import { RADIAN_PERSONA_AVATARS, getRadianAvatarUrl } from '../utils/radianAvatars';

export const CURRENT_USER: UserProfile = {
  id: 'usr-1',
  name: 'Eleanor Vance',
  email: 'e.vance@quantira.com',
  role: 'hr_admin',
  roleTitle: 'Senior HR Operations Director',
  department: 'People & Culture',
  avatar: RADIAN_PERSONA_AVATARS.eleanorVance
};

export const AVAILABLE_ROLES: UserProfile[] = [
  CURRENT_USER,
  {
    id: 'usr-2',
    name: 'Marcus Brody',
    email: 'm.brody@quantira.com',
    role: 'manager',
    roleTitle: 'VP of Engineering',
    department: 'Engineering',
    avatar: RADIAN_PERSONA_AVATARS.marcusBrody
  },
  {
    id: 'usr-3',
    name: 'Devin Thorne',
    email: 'd.thorne@quantira.com',
    role: 'it_specialist',
    roleTitle: 'Lead IT Infrastructure Specialist',
    department: 'IT Operations',
    avatar: RADIAN_PERSONA_AVATARS.devinThorne
  },
  {
    id: 'usr-4',
    name: 'Sophia Chen',
    email: 's.chen@quantira.com',
    role: 'employee',
    roleTitle: 'Senior Systems Architect',
    department: 'Engineering',
    avatar: RADIAN_PERSONA_AVATARS.sophiaChen
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'EMP-2024-0847',
    firstName: 'John',
    lastName: 'Doe',
    preferredName: 'Johnny',
    email: 'john.doe@quantira.com',
    phone: '+1 (415) 555-0192',
    avatarUrl: RADIAN_PERSONA_AVATARS.johnDoe,
    status: 'completed',
    progress: 100,
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    manager: 'Marcus Brody',
    managerEmail: 'manager@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Hybrid',
    startDate: '2026-09-15',
    officeLocation: 'San Francisco HQ',
    dateOfBirth: '1992-06-18',
    ssnLast4: '3942',
    address: {
      street: '555 California St, Suite 1200',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      country: 'United States'
    },
    emergencyContact: {
      name: 'Sarah Doe',
      relationship: 'Spouse',
      phone: '+1 (415) 555-0142'
    },
    compensation: {
      salary: 165000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'MacBook Pro 16" (M3 Max, 64GB)',
      monitors: 2,
      accessories: ['Ergonomic Keyboard', 'Precision Wireless Mouse', 'Dual 4K Displays'],
      softwareLicenses: ['GitHub Enterprise', 'AWS Console', '1Password', 'VS Code Suite'],
      emailAlias: 'john.doe@quantira.com',
      provisioningStatus: 'configured'
    },
    documents: [
      {
        id: 'doc-john-1',
        candidateId: 'EMP-2024-0847',
        type: 'government_id',
        title: 'Government Issued Driver License / Real ID',
        description: 'Verified federal real ID identification document.',
        status: 'verified',
        required: true,
        fileName: 'john_doe_id.pdf',
        fileSize: '2.4 MB',
        uploadedAt: '2026-09-15T09:00:00Z',
        verifiedAt: '2026-09-15T11:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-john-2',
        candidateId: 'EMP-2024-0847',
        type: 'degree_certificate',
        title: 'Bachelor of Science Degree in Computer Science',
        description: 'Certified university degree documentation.',
        status: 'verified',
        required: true,
        fileName: 'degree_certificate.pdf',
        fileSize: '1.8 MB',
        uploadedAt: '2026-09-15T09:30:00Z',
        verifiedAt: '2026-09-15T11:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-john-3',
        candidateId: 'EMP-2024-0847',
        type: 'direct_deposit',
        title: 'Form W-4 Federal Tax & Direct Deposit Verification',
        description: 'Signed statutory withholding and banking information.',
        status: 'verified',
        required: true,
        fileName: 'w4_tax_withholding_signed.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2026-09-16T10:00:00Z',
        verifiedAt: '2026-09-16T12:00:00Z',
        verifiedBy: 'Eleanor Vance'
      }
    ],
    tasks: [],
    auditLogs: [],
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'CND-1001',
    firstName: 'Sophia',
    lastName: 'Chen',
    preferredName: 'Soph',
    email: 's.chen@quantira.com',
    phone: '+1 (415) 890-2134',
    avatarUrl: RADIAN_PERSONA_AVATARS.sophiaChen,
    status: 'verification',
    progress: 75,
    jobTitle: 'Senior Systems Architect',
    department: 'Engineering',
    manager: 'Marcus Brody',
    managerEmail: 'm.brody@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Hybrid',
    startDate: '2026-10-01',
    officeLocation: 'San Francisco HQ',
    dateOfBirth: '1990-04-12',
    ssnLast4: '4821',
    address: {
      street: '420 Montgomery St, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      country: 'United States'
    },
    emergencyContact: {
      name: 'David Chen',
      relationship: 'Spouse',
      phone: '+1 (415) 771-9230'
    },
    compensation: {
      salary: 195000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'MacBook Pro 16" (M3 Max, 64GB)',
      monitors: 2,
      accessories: ['Magic Keyboard', 'Magic Trackpad', 'CalDigit TS4 Thunderbolt Dock', 'Jabra Speak 750'],
      softwareLicenses: ['GitHub Enterprise', 'AWS Console', 'Datadog', '1Password', 'JetBrains All Products'],
      emailAlias: 'sophia.chen@quantira.com',
      provisioningStatus: 'configured',
      trackingNumber: '1Z9999999999999999'
    },
    documents: [
      {
        id: 'doc-101',
        candidateId: 'CND-1001',
        type: 'government_id',
        title: 'Government Issued Passport / Real ID',
        description: 'Color copy of valid passport or state driver license.',
        status: 'verified',
        required: true,
        fileName: 'sophia_chen_passport_2026.pdf',
        fileSize: '3.4 MB',
        uploadedAt: '2026-09-10T14:20:00Z',
        verifiedAt: '2026-09-11T09:15:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-102',
        candidateId: 'CND-1001',
        type: 'signed_offer',
        title: 'Signed Official Offer Letter',
        description: 'Countersigned formal employment agreement.',
        status: 'verified',
        required: true,
        fileName: 'quantira_offer_signed_chen.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2026-09-08T11:00:00Z',
        verifiedAt: '2026-09-08T16:45:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-103',
        candidateId: 'CND-1001',
        type: 'i9_tax_form',
        title: 'USCIS Form I-9 & W-4 Withholding',
        description: 'Employment eligibility verification and federal withholding allowance.',
        status: 'submitted',
        required: true,
        fileName: 'chen_i9_w4_completed.pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2026-09-14T10:30:00Z'
      },
      {
        id: 'doc-104',
        candidateId: 'CND-1001',
        type: 'nda',
        title: 'Confidential Information & Invention Assignment',
        description: 'Standard proprietary rights and intellectual property agreement.',
        status: 'verified',
        required: true,
        fileName: 'quantira_proprietary_agmt_chen.pdf',
        fileSize: '980 KB',
        uploadedAt: '2026-09-09T08:15:00Z',
        verifiedAt: '2026-09-09T13:20:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-105',
        candidateId: 'CND-1001',
        type: 'direct_deposit',
        title: 'Direct Deposit Authorization Form',
        description: 'Voided check or official bank routing confirmation document.',
        status: 'submitted',
        required: true,
        fileName: 'chase_direct_deposit_chen.pdf',
        fileSize: '650 KB',
        uploadedAt: '2026-09-15T15:10:00Z'
      }
    ],
    tasks: [
      {
        id: 'tsk-101',
        candidateId: 'CND-1001',
        candidateName: 'Sophia Chen',
        title: 'Verify USCIS Form I-9 & Tax Withholdings',
        description: 'Inspect Section 2 documents within 3 business days of hire.',
        category: 'hr',
        priority: 'high',
        status: 'in_progress',
        assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
        dueDate: '2026-09-28'
      },
      {
        id: 'tsk-102',
        candidateId: 'CND-1001',
        candidateName: 'Sophia Chen',
        title: 'Provision Okta SSO, Slack, and AWS IAM Groups',
        description: 'Grant corporate and developer group access.',
        category: 'it',
        priority: 'urgent',
        status: 'completed',
        assignee: { name: 'Devin Thorne', avatar: AVAILABLE_ROLES[2].avatar, role: 'IT Specialist' },
        dueDate: '2026-09-25',
        completedAt: '2026-09-20T11:30:00Z'
      },
      {
        id: 'tsk-103',
        candidateId: 'CND-1001',
        candidateName: 'Sophia Chen',
        title: 'Schedule 30-Day Technical Onboarding & Mentorship Plan',
        description: 'Book introductory 1-on-1s with Principal Engineers and Team Leads.',
        category: 'manager',
        priority: 'medium',
        status: 'pending',
        assignee: { name: 'Marcus Brody', avatar: AVAILABLE_ROLES[1].avatar, role: 'VP Engineering' },
        dueDate: '2026-10-02'
      }
    ],
    auditLogs: [
      {
        id: 'aud-1',
        timestamp: '2026-09-08T16:45:00Z',
        action: 'Offer Letter Verified',
        user: 'Eleanor Vance',
        details: 'Verified candidate signed copy of offer letter.',
        type: 'success'
      },
      {
        id: 'aud-2',
        timestamp: '2026-09-10T14:20:00Z',
        action: 'Identification Uploaded',
        user: 'Sophia Chen',
        details: 'Submitted US Passport.',
        type: 'info'
      },
      {
        id: 'aud-3',
        timestamp: '2026-09-11T09:15:00Z',
        action: 'Identification Approved',
        user: 'Eleanor Vance',
        details: 'Passport validity confirmed against I-9 standards.',
        type: 'success'
      },
      {
        id: 'aud-4',
        timestamp: '2026-09-14T10:30:00Z',
        action: 'Tax Forms Submitted',
        user: 'Sophia Chen',
        details: 'Form W-4 and I-9 uploaded.',
        type: 'info'
      },
      {
        id: 'aud-5',
        timestamp: '2026-09-20T11:30:00Z',
        action: 'IT Provisioning Completed',
        user: 'Devin Thorne',
        details: 'Configured Okta SSO, Slack, and GitHub access.',
        type: 'success'
      }
    ],
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-20T11:30:00Z'
  },
  {
    id: 'CND-1002',
    firstName: 'Julian',
    lastName: 'Sterling',
    email: 'j.sterling@quantira.com',
    phone: '+1 (212) 555-0199',
    avatarUrl: getRadianAvatarUrl(27),
    status: 'equipment_provisioning',
    progress: 60,
    jobTitle: 'Principal Product Manager',
    department: 'Product',
    manager: 'Claire Delacroix',
    managerEmail: 'c.delacroix@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Remote',
    startDate: '2026-10-05',
    officeLocation: 'New York Hub',
    compensation: {
      salary: 195000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'MacBook Pro 14" (M3 Pro, 36GB)',
      monitors: 1,
      accessories: ['Apple Magic Keyboard', 'Apple Magic Trackpad', 'Dell 32" 4K Monitor'],
      softwareLicenses: ['Figma Organization', 'Notion Team', 'Jira Product Discovery', 'Miro Enterprise'],
      emailAlias: 'julian.sterling@quantira.com',
      provisioningStatus: 'ordered'
    },
    documents: [
      {
        id: 'doc-201',
        candidateId: 'CND-1002',
        type: 'signed_offer',
        title: 'Signed Official Offer Letter',
        description: 'Countersigned formal employment agreement.',
        status: 'verified',
        required: true,
        fileName: 'julian_sterling_offer.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2026-09-06T10:00:00Z',
        verifiedAt: '2026-09-07T09:30:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-202',
        candidateId: 'CND-1002',
        type: 'government_id',
        title: 'State Identification / Driver License',
        description: 'Valid government ID.',
        status: 'verified',
        required: true,
        fileName: 'ny_dl_sterling.pdf',
        fileSize: '2.8 MB',
        uploadedAt: '2026-09-08T13:40:00Z',
        verifiedAt: '2026-09-09T10:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-203',
        candidateId: 'CND-1002',
        type: 'nda',
        title: 'Non-Disclosure Agreement',
        description: 'Proprietary IP and non-solicitation agreement.',
        status: 'verified',
        required: true,
        fileName: 'sterling_nda.pdf',
        fileSize: '840 KB',
        uploadedAt: '2026-09-08T15:00:00Z',
        verifiedAt: '2026-09-09T10:15:00Z',
        verifiedBy: 'Eleanor Vance'
      }
    ],
    tasks: [
      {
        id: 'tsk-201',
        candidateId: 'CND-1002',
        candidateName: 'Julian Sterling',
        title: 'Order ThinkPad X1 Laptop & Accessories',
        description: 'Procure customized hardware from Lenovo corporate portal.',
        category: 'it',
        priority: 'high',
        status: 'in_progress',
        assignee: { name: 'Devin Thorne', avatar: AVAILABLE_ROLES[2].avatar, role: 'IT Specialist' },
        dueDate: '2026-09-27'
      }
    ],
    auditLogs: [
      {
        id: 'aud-201',
        timestamp: '2026-09-06T10:00:00Z',
        action: 'Candidate Accepted Offer',
        user: 'Julian Sterling',
        type: 'success'
      }
    ],
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-18T14:10:00Z'
  },
  {
    id: 'CND-1003',
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'a.okafor@quantira.com',
    phone: '+1 (312) 440-9821',
    avatarUrl: getRadianAvatarUrl(90),
    status: 'document_submission',
    progress: 40,
    jobTitle: 'Data Analytics Lead',
    department: 'Finance',
    manager: 'Victor Vance',
    managerEmail: 'v.vance@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Hybrid',
    startDate: '2026-10-12',
    officeLocation: 'Chicago Office',
    compensation: {
      salary: 165000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'MacBook Pro 14" (M3 Pro, 36GB)',
      monitors: 2,
      accessories: ['Ergonomic Mouse', '4K Display Adapter'],
      softwareLicenses: ['Snowflake', 'Tableau Desktop', 'dbt Cloud', 'Fivetran'],
      emailAlias: 'amara.okafor@quantira.com',
      provisioningStatus: 'pending'
    },
    documents: [
      {
        id: 'doc-301',
        candidateId: 'CND-1003',
        type: 'signed_offer',
        title: 'Signed Official Offer Letter',
        description: 'Countersigned formal employment agreement.',
        status: 'verified',
        required: true,
        fileName: 'amara_okafor_offer.pdf',
        fileSize: '1.4 MB',
        uploadedAt: '2026-09-12T11:20:00Z',
        verifiedAt: '2026-09-12T16:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-302',
        candidateId: 'CND-1003',
        type: 'government_id',
        title: 'Passport / Driver License',
        description: 'Government photo identification.',
        status: 'rejected',
        required: true,
        fileName: 'blurry_id_scan.jpg',
        fileSize: '450 KB',
        uploadedAt: '2026-09-14T09:10:00Z',
        rejectionReason: 'The provided scan is blurry and edges of the driver license are cut off. Please provide a clear color copy.'
      }
    ],
    tasks: [
      {
        id: 'tsk-301',
        candidateId: 'CND-1003',
        candidateName: 'Amara Okafor',
        title: 'Resubmit Clear Government ID',
        description: 'Candidate needs to upload high-res color ID photograph.',
        category: 'compliance',
        priority: 'urgent',
        status: 'in_progress',
        assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
        dueDate: '2026-09-24'
      }
    ],
    auditLogs: [
      {
        id: 'aud-301',
        timestamp: '2026-09-14T15:00:00Z',
        action: 'Document Rejected',
        user: 'Eleanor Vance',
        details: 'Requested re-upload of Government ID due to illegible scan.',
        type: 'warning'
      }
    ],
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-16T11:00:00Z'
  },
  {
    id: 'CND-1004',
    firstName: 'Liam',
    lastName: 'Fitzgerald',
    email: 'l.fitzgerald@quantira.com',
    phone: '+1 (617) 329-8472',
    avatarUrl: getRadianAvatarUrl(105),
    status: 'orientation_scheduled',
    progress: 90,
    jobTitle: 'Strategic Account Executive',
    department: 'Sales',
    manager: 'Rachel Green',
    managerEmail: 'r.green@quantira.com',
    employmentType: 'Full-time',
    workModel: 'On-site',
    startDate: '2026-09-28',
    officeLocation: 'Boston Center',
    compensation: {
      salary: 140000,
      currency: 'USD',
      payFrequency: 'Monthly'
    },
    equipment: {
      laptopModel: 'Dell XPS 15 (32GB RAM)',
      monitors: 1,
      accessories: ['Dell USB-C Hub', 'Wireless Headset'],
      softwareLicenses: ['Salesforce CRM', 'Gong.io', 'ZoomInfo', 'LinkedIn Sales Nav'],
      emailAlias: 'liam.fitzgerald@quantira.com',
      provisioningStatus: 'delivered',
      trackingNumber: '1Z8888888888888888'
    },
    documents: [
      {
        id: 'doc-401',
        candidateId: 'CND-1004',
        type: 'government_id',
        title: 'MA Driver License',
        description: 'Photo identification',
        status: 'verified',
        required: true,
        fileName: 'liam_fitz_ma_license.pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2026-09-02T10:00:00Z',
        verifiedAt: '2026-09-03T11:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-402',
        candidateId: 'CND-1004',
        type: 'signed_offer',
        title: 'Offer Letter',
        description: 'Executed employment terms',
        status: 'verified',
        required: true,
        fileName: 'fitzgerald_offer_signed.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2026-09-01T09:00:00Z',
        verifiedAt: '2026-09-02T10:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-403',
        candidateId: 'CND-1004',
        type: 'nda',
        title: 'Proprietary Inventions & NDA',
        description: 'Standard NDA',
        status: 'verified',
        required: true,
        fileName: 'fitz_nda.pdf',
        fileSize: '950 KB',
        uploadedAt: '2026-09-03T14:00:00Z',
        verifiedAt: '2026-09-04T09:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-404',
        candidateId: 'CND-1004',
        type: 'direct_deposit',
        title: 'Direct Deposit Form',
        description: 'Banking authorization',
        status: 'verified',
        required: true,
        fileName: 'bank_of_america_dd.pdf',
        fileSize: '800 KB',
        uploadedAt: '2026-09-05T16:00:00Z',
        verifiedAt: '2026-09-06T10:00:00Z',
        verifiedBy: 'Eleanor Vance'
      }
    ],
    tasks: [
      {
        id: 'tsk-401',
        candidateId: 'CND-1004',
        candidateName: 'Liam Fitzgerald',
        title: 'Prepare Day 1 Welcome Bag and Physical Building Badge',
        description: 'Encode RFID keycard for 5th floor sales suite and configure locker.',
        category: 'operations',
        priority: 'high',
        status: 'completed',
        assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
        dueDate: '2026-09-26',
        completedAt: '2026-09-22T14:00:00Z'
      }
    ],
    auditLogs: [
      {
        id: 'aud-401',
        timestamp: '2026-09-22T14:00:00Z',
        action: 'Orientation Confirmed',
        user: 'Eleanor Vance',
        details: 'Confirmed Day 1 Boston in-person orientation slot for 9:30 AM.',
        type: 'success'
      }
    ],
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-09-22T14:00:00Z'
  },
  {
    id: 'CND-1005',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'e.rostova@quantira.com',
    phone: '+1 (206) 881-4920',
    avatarUrl: getRadianAvatarUrl(133),
    status: 'completed',
    progress: 100,
    jobTitle: 'Senior Cloud Security Engineer',
    department: 'Engineering',
    manager: 'Marcus Brody',
    managerEmail: 'm.brody@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Remote',
    startDate: '2026-09-15',
    officeLocation: 'Seattle Hub',
    compensation: {
      salary: 190000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'MacBook Pro 16" (M3 Max, 64GB)',
      monitors: 2,
      accessories: ['Yubikey 5C NFC (2x)', 'Thunderbolt Dock', 'Bose 700 Headset'],
      softwareLicenses: ['AWS Organizations', 'Terraform Cloud', 'Snyk Enterprise', 'CrowdStrike Falcon'],
      emailAlias: 'elena.rostova@quantira.com',
      provisioningStatus: 'delivered'
    },
    documents: [
      {
        id: 'doc-501',
        candidateId: 'CND-1005',
        type: 'government_id',
        title: 'US Passport',
        description: 'Proof of citizenship',
        status: 'verified',
        required: true,
        fileName: 'rostova_passport.pdf',
        fileSize: '3.1 MB',
        uploadedAt: '2026-08-25T11:00:00Z',
        verifiedAt: '2026-08-26T10:00:00Z',
        verifiedBy: 'Eleanor Vance'
      },
      {
        id: 'doc-502',
        candidateId: 'CND-1005',
        type: 'signed_offer',
        title: 'Offer Letter',
        description: 'Executed agreement',
        status: 'verified',
        required: true,
        fileName: 'rostova_offer.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2026-08-24T09:00:00Z',
        verifiedAt: '2026-08-24T15:00:00Z',
        verifiedBy: 'Eleanor Vance'
      }
    ],
    tasks: [],
    auditLogs: [
      {
        id: 'aud-501',
        timestamp: '2026-09-15T09:00:00Z',
        action: 'Onboarding Completed',
        user: 'System Admin',
        details: 'Candidate successfully converted to Active Employee record.',
        type: 'success'
      }
    ],
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-09-15T09:00:00Z'
  },
  {
    id: 'CND-1006',
    firstName: 'Mateo',
    lastName: 'Hernandez',
    email: 'm.hernandez@quantira.com',
    phone: '+1 (512) 693-1102',
    avatarUrl: getRadianAvatarUrl(158),
    status: 'invited',
    progress: 15,
    jobTitle: 'Full-Stack Software Engineer',
    department: 'Engineering',
    manager: 'Marcus Brody',
    managerEmail: 'm.brody@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Hybrid',
    startDate: '2026-10-19',
    officeLocation: 'Austin Office',
    compensation: {
      salary: 155000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'MacBook Pro 14" (M3 Pro, 36GB)',
      monitors: 1,
      accessories: ['Keychron Wireless Keyboard', 'Logitech MX Master'],
      softwareLicenses: ['GitHub Copilot', 'Vercel Enterprise', 'Linear'],
      emailAlias: 'mateo.hernandez@quantira.com',
      provisioningStatus: 'pending'
    },
    documents: [],
    tasks: [
      {
        id: 'tsk-601',
        candidateId: 'CND-1006',
        candidateName: 'Mateo Hernandez',
        title: 'Send Portal Invitation and Welcome Package Link',
        description: 'Dispatch encrypted registration link with 7-day token expiration.',
        category: 'hr',
        priority: 'medium',
        status: 'completed',
        assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
        dueDate: '2026-09-20',
        completedAt: '2026-09-18T10:00:00Z'
      }
    ],
    auditLogs: [
      {
        id: 'aud-601',
        timestamp: '2026-09-18T10:00:00Z',
        action: 'Invitation Dispatched',
        user: 'Eleanor Vance',
        details: 'Candidate invite email sent to m.hernandez@quantira.com',
        type: 'info'
      }
    ],
    createdAt: '2026-09-18T09:00:00Z',
    updatedAt: '2026-09-18T10:00:00Z'
  },
  {
    id: 'CND-1007',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'p.sharma@quantira.com',
    phone: '+1 (408) 723-5819',
    avatarUrl: getRadianAvatarUrl(182),
    status: 'draft',
    progress: 5,
    jobTitle: 'Senior Talent Acquisition Partner',
    department: 'Human Resources',
    manager: 'Eleanor Vance',
    managerEmail: 'e.vance@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Hybrid',
    startDate: '2026-10-26',
    officeLocation: 'San Francisco HQ',
    compensation: {
      salary: 135000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'MacBook Air 15" (M3, 24GB)',
      monitors: 1,
      accessories: ['Apple Magic Mouse', 'Laptop Stand'],
      softwareLicenses: ['Greenhouse ATS', 'LinkedIn Recruiter', 'GoodTime AI'],
      emailAlias: 'priya.sharma@quantira.com',
      provisioningStatus: 'pending'
    },
    documents: [],
    tasks: [],
    auditLogs: [
      {
        id: 'aud-701',
        timestamp: '2026-09-19T11:00:00Z',
        action: 'Draft Profile Created',
        user: 'Eleanor Vance',
        details: 'Saved initial candidate requisition parameters.',
        type: 'info'
      }
    ],
    createdAt: '2026-09-19T11:00:00Z',
    updatedAt: '2026-09-19T11:00:00Z'
  },
  {
    id: 'CND-1008',
    firstName: 'Kareem',
    lastName: 'Al-Mansoor',
    email: 'k.almansoor@quantira.com',
    phone: '+1 (404) 932-8419',
    avatarUrl: getRadianAvatarUrl(196),
    status: 'rejected',
    progress: 30,
    jobTitle: 'Senior Legal Counsel',
    department: 'Legal',
    manager: 'Sarah Jenkins',
    managerEmail: 's.jenkins@quantira.com',
    employmentType: 'Full-time',
    workModel: 'Remote',
    startDate: '2026-10-15',
    officeLocation: 'Atlanta Hub',
    compensation: {
      salary: 195000,
      currency: 'USD',
      payFrequency: 'Bi-weekly'
    },
    equipment: {
      laptopModel: 'ThinkPad T14s (32GB)',
      monitors: 1,
      accessories: ['Secure encrypted flash drive', 'Headset'],
      softwareLicenses: ['DocuSign CLM', 'Westlaw Edge', 'Ironclad'],
      emailAlias: 'kareem.almansoor@quantira.com',
      provisioningStatus: 'pending'
    },
    documents: [
      {
        id: 'doc-801',
        candidateId: 'CND-1008',
        type: 'background_check',
        title: 'Background Verification Consent',
        description: 'Third-party screening disclosure',
        status: 'rejected',
        required: true,
        fileName: 'checkr_adverse_disclosure.pdf',
        fileSize: '1.8 MB',
        uploadedAt: '2026-09-12T10:00:00Z',
        rejectionReason: 'Candidate declined bar certification verification authorization.'
      }
    ],
    tasks: [],
    auditLogs: [
      {
        id: 'aud-801',
        timestamp: '2026-09-16T14:30:00Z',
        action: 'Onboarding Terminated / Rejected',
        user: 'Sarah Jenkins',
        details: 'Candidate rescinded acceptance following conflicting external board commitment.',
        type: 'error'
      }
    ],
    createdAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-16T14:30:00Z'
  }
];

export const ALL_ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: 'tsk-001',
    candidateId: 'CND-1001',
    candidateName: 'Sophia Chen',
    title: 'Review I-9 Verification & Photo ID',
    description: 'Verify Section 2 identity documents and confirm E-Verify eligibility confirmation.',
    category: 'hr',
    priority: 'urgent',
    status: 'in_progress',
    assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
    dueDate: '2026-09-28'
  },
  {
    id: 'tsk-002',
    candidateId: 'CND-1001',
    candidateName: 'Sophia Chen',
    title: 'Configure Hardware & Ship Thunderbolt Dock',
    description: 'Flash corporate OS image, install Jamf Pro profile, and ship via FedEx Priority.',
    category: 'it',
    priority: 'high',
    status: 'completed',
    assignee: { name: 'Devin Thorne', avatar: AVAILABLE_ROLES[2].avatar, role: 'IT Specialist' },
    dueDate: '2026-09-25',
    completedAt: '2026-09-20T14:00:00Z'
  },
  {
    id: 'tsk-003',
    candidateId: 'CND-1002',
    candidateName: 'Julian Sterling',
    title: 'Procure ThinkPad X1 Carbon Gen 12',
    description: 'Approve hardware PO and send tracking notification to candidate.',
    category: 'it',
    priority: 'high',
    status: 'in_progress',
    assignee: { name: 'Devin Thorne', avatar: AVAILABLE_ROLES[2].avatar, role: 'IT Specialist' },
    dueDate: '2026-09-27'
  },
  {
    id: 'tsk-004',
    candidateId: 'CND-1003',
    candidateName: 'Amara Okafor',
    title: 'Contact Candidate for High-Res Government ID Scan',
    description: 'Call and send secure upload link for unblurred ID photograph.',
    category: 'compliance',
    priority: 'urgent',
    status: 'pending',
    assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
    dueDate: '2026-09-24'
  },
  {
    id: 'tsk-005',
    candidateId: 'CND-1004',
    candidateName: 'Liam Fitzgerald',
    title: 'Prepare Day 1 Welcome Bag & Physical Building Badge',
    description: 'Print high-security RFID smartcard and organize welcome swag pack.',
    category: 'operations',
    priority: 'medium',
    status: 'completed',
    assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
    dueDate: '2026-09-26',
    completedAt: '2026-09-22T14:00:00Z'
  },
  {
    id: 'tsk-006',
    candidateId: 'CND-1004',
    candidateName: 'Liam Fitzgerald',
    title: 'Assign Sales Buddy & Schedule Product Immersion Session',
    description: 'Match with Senior Account Exec for 60-day shadowing program.',
    category: 'manager',
    priority: 'medium',
    status: 'in_progress',
    assignee: { name: 'Rachel Green', avatar: RADIAN_PERSONA_AVATARS.rachelGreen, role: 'Sales Director' },
    dueDate: '2026-09-27'
  },
  {
    id: 'tsk-007',
    candidateId: 'CND-1006',
    candidateName: 'Mateo Hernandez',
    title: 'Send Onboarding Registration Link',
    description: 'Ensure invitation email is received and track portal login.',
    category: 'hr',
    priority: 'low',
    status: 'completed',
    assignee: { name: 'Eleanor Vance', avatar: CURRENT_USER.avatar, role: 'HR Operations' },
    dueDate: '2026-09-20',
    completedAt: '2026-09-18T10:00:00Z'
  }
];

export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Legal',
  'Operations'
];

export const LOCATIONS = [
  'San Francisco HQ',
  'New York Hub',
  'Chicago Office',
  'Austin Office',
  'Seattle Hub',
  'Boston Center',
  'Remote (US)',
  'Remote (International)'
];
