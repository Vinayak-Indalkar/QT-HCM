import { storageService } from './storageService';

export interface CorporateDocument {
  id: string;
  title: string;
  code: string;
  section: 'policy' | 'other';
  folder: string;
  category: string;
  description: string;
  format: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP';
  fileSize: string;
  version: string;
  lastUpdated: string;
  status: 'Active' | 'Under Review' | 'Draft' | 'Archived';
  mandatory: boolean;
  targetAudience: string;
  contentSnippet?: string;
}

export const DEFAULT_POLICY_FOLDERS = [
  'HR & Ethics',
  'IT & Security',
  'Workplace Operations',
  'Legal & Compliance',
  'Finance & Expenses',
  'Benefits & Leave',
  'Governance & Risk'
];

export const DEFAULT_OTHER_FOLDERS = [
  'Legal & IP',
  'Payroll & Banking',
  'Health & Safety',
  'IT & Hardware',
  'Benefits & Perks',
  'Statutory & Tax'
];

export const INITIAL_CORPORATE_DOCUMENTS: CorporateDocument[] = [
  // SECTION 1: Company Policies
  {
    id: 'pol-1',
    title: 'Employee Code of Conduct & Professional Ethics',
    code: 'POL-HR-001',
    section: 'policy',
    folder: 'HR & Ethics',
    category: 'Human Resources & Ethics',
    description: 'Foundational corporate ethics, anti-bribery standards, integrity guidelines, and workplace professional conduct rules.',
    format: 'PDF',
    fileSize: '1.8 MB',
    version: 'v3.2',
    lastUpdated: '2026-09-01',
    status: 'Active',
    mandatory: true,
    targetAudience: 'All Employees',
    contentSnippet: 'This Code of Conduct outlines the core values and expectations of Quantira Technologies. Every team member must act with uncompromising honesty, avoid conflicts of interest, and treat colleagues, clients, and partners with dignity and respect.'
  },
  {
    id: 'pol-2',
    title: 'Information Security, Data Protection & Acceptable Use Policy',
    code: 'POL-SEC-002',
    section: 'policy',
    folder: 'IT & Security',
    category: 'IT & Information Security',
    description: 'SOC 2 and ISO 27001 compliant standards for endpoint security, encryption, credential rotation, and data classification.',
    format: 'PDF',
    fileSize: '3.4 MB',
    version: 'v4.0',
    lastUpdated: '2026-08-15',
    status: 'Active',
    mandatory: true,
    targetAudience: 'All Employees & Contractors',
    contentSnippet: 'Governs corporate device management, mandatory multi-factor authentication (MFA), password complexity, data loss prevention, and protocol for immediate reporting of suspected security incidents.'
  },
  {
    id: 'pol-3',
    title: 'Remote & Hybrid Workplace Operations Guidelines',
    code: 'POL-OPS-003',
    section: 'policy',
    folder: 'Workplace Operations',
    category: 'Workplace Operations',
    description: 'Protocols for remote engineering pods, core collaboration overlap hours, ergonomics, and home office stipends.',
    format: 'PDF',
    fileSize: '2.1 MB',
    version: 'v2.1',
    lastUpdated: '2026-07-20',
    status: 'Active',
    mandatory: true,
    targetAudience: 'Hybrid & Remote Staff',
    contentSnippet: 'Defines the flexible 3/2 hybrid model, expectations for asynchronous communication via Slack, home workspace safety criteria, and internet stipend claim eligibility.'
  },
  {
    id: 'pol-4',
    title: 'Equal Employment Opportunity & Anti-Harassment Policy',
    code: 'POL-HR-004',
    section: 'policy',
    folder: 'Legal & Compliance',
    category: 'Legal & Compliance',
    description: 'Zero-tolerance policy against discrimination, harassment, and retaliation, with clear incident escalation channels.',
    format: 'PDF',
    fileSize: '1.5 MB',
    version: 'v3.0',
    lastUpdated: '2026-09-10',
    status: 'Active',
    mandatory: true,
    targetAudience: 'All Personnel',
    contentSnippet: 'Quantira maintains an inclusive, equitable work environment free from harassment, discrimination, or intimidation based on race, gender, religion, sexual orientation, disability, or veteran status.'
  },
  {
    id: 'pol-5',
    title: 'Business Travel, Lodging & Expense Reimbursement Policy',
    code: 'POL-FIN-005',
    section: 'policy',
    folder: 'Finance & Expenses',
    category: 'Finance & Expenses',
    description: 'Rules for corporate per diems, flight and hotel bookings via Navan, and expense submission deadlines.',
    format: 'PDF',
    fileSize: '1.9 MB',
    version: 'v2.5',
    lastUpdated: '2026-06-30',
    status: 'Active',
    mandatory: false,
    targetAudience: 'All Staff Traveling for Business',
    contentSnippet: 'Sets explicit per diem caps ($85/day domestic, $115/day international), pre-approval limits for executive trips, and receipt upload requirements through Concur Expense.'
  },
  {
    id: 'pol-6',
    title: 'Paid Time Off (PTO), Family Leave & Parental Bonding Policy',
    code: 'POL-HR-006',
    section: 'policy',
    folder: 'Benefits & Leave',
    category: 'Benefits & Leave',
    description: 'Accrual rates for flexible PTO, standard sick leave, bereavement, and 16 weeks of fully paid parental bonding leave.',
    format: 'PDF',
    fileSize: '2.0 MB',
    version: 'v2.2',
    lastUpdated: '2026-08-01',
    status: 'Active',
    mandatory: true,
    targetAudience: 'Full-Time Regular Employees',
    contentSnippet: 'All full-time regular employees accrue 20 PTO days annually, plus 12 company holidays and 16 weeks of paid parental leave for birthing and non-birthing parents with at least 90 days tenure.'
  },
  {
    id: 'pol-7',
    title: 'Whistleblower Protection & Anonymous Compliance Reporting',
    code: 'POL-GOV-007',
    section: 'policy',
    folder: 'Governance & Risk',
    category: 'Governance & Legal',
    description: 'Third-party anonymous hotline reporting procedures for accounting irregularities or statutory violations.',
    format: 'PDF',
    fileSize: '1.2 MB',
    version: 'v1.8',
    lastUpdated: '2026-09-05',
    status: 'Active',
    mandatory: true,
    targetAudience: 'All Employees',
    contentSnippet: 'Provides 24/7 confidential reporting via EthicsPoint, guaranteeing absolute anonymity and strict anti-retaliation protections for any employee who reports suspected wrongdoing in good faith.'
  },

  // SECTION 2: Other Documents
  {
    id: 'doc-1',
    title: 'Proprietary Information & Inventions Assignment NDA',
    code: 'DOC-LEGAL-101',
    section: 'other',
    folder: 'Legal & IP',
    category: 'Intellectual Property & Legal',
    description: 'Comprehensive intellectual property deed, non-solicitation covenants, and proprietary trade secret protections.',
    format: 'PDF',
    fileSize: '2.6 MB',
    version: 'v4.1',
    lastUpdated: '2026-09-15',
    status: 'Active',
    mandatory: true,
    targetAudience: 'All New Hires & Contractors',
    contentSnippet: 'Assigns all patents, copyrightable material, algorithms, source code, and design assets developed during employment to Quantira Technologies, maintaining non-disclosure obligations in perpetuity.'
  },
  {
    id: 'doc-2',
    title: 'Direct Deposit & Electronic Payroll Authorization Agreement',
    code: 'DOC-FIN-102',
    section: 'other',
    folder: 'Payroll & Banking',
    category: 'Payroll & Banking',
    description: 'ACH electronic fund transfer authorization for monthly payroll, expense stipends, and bonuses.',
    format: 'PDF',
    fileSize: '980 KB',
    version: 'v2.0',
    lastUpdated: '2026-08-10',
    status: 'Active',
    mandatory: true,
    targetAudience: 'All Employees',
    contentSnippet: 'Authorizes Quantira Technologies and ADP Workforce Now to initiate recurring direct deposit salary credits and occasional debit adjustments for erroneous transactions into designated financial accounts.'
  },
  {
    id: 'doc-3',
    title: 'Emergency Medical & Family Contact Designation Form',
    code: 'DOC-OPS-103',
    section: 'other',
    folder: 'Health & Safety',
    category: 'Health & Safety',
    description: 'Official record of primary next-of-kin, emergency contact telephone numbers, and voluntary medical disclosures.',
    format: 'DOCX',
    fileSize: '750 KB',
    version: 'v1.5',
    lastUpdated: '2026-07-15',
    status: 'Active',
    mandatory: true,
    targetAudience: 'All Personnel',
    contentSnippet: 'Standardized record used exclusively by HR Emergency Response officers during facility evacuations or severe health incidents to contact designated family members and first responders.'
  },
  {
    id: 'doc-4',
    title: 'Corporate IT Hardware Custody & Mobile Device Agreement',
    code: 'DOC-IT-104',
    section: 'other',
    folder: 'IT & Hardware',
    category: 'IT Assets',
    description: 'Equipment allocation deed tracking custody of company MacBook Pro, monitors, YubiKeys, and docking stations.',
    format: 'PDF',
    fileSize: '1.5 MB',
    version: 'v2.3',
    lastUpdated: '2026-09-01',
    status: 'Active',
    mandatory: true,
    targetAudience: 'Hardware Recipients',
    contentSnippet: 'Confirms recipient receipt of corporate hardware assets, outlines duty of care, prohibition against personal modification, and obligations for immediate return upon separation.'
  },
  {
    id: 'doc-5',
    title: 'Comprehensive Health & Group Dental Benefits Guide',
    code: 'DOC-BEN-105',
    section: 'other',
    folder: 'Benefits & Perks',
    category: 'Benefits & Perks',
    description: 'Summary of Benefits and Coverage (SBC) for Anthem Blue Cross PPO, Kaiser HMO, and Delta Dental tiers.',
    format: 'PDF',
    fileSize: '4.8 MB',
    version: 'v2026.1',
    lastUpdated: '2026-09-01',
    status: 'Active',
    mandatory: false,
    targetAudience: 'Eligible Employees & Dependents',
    contentSnippet: 'Detailed coverage schedule detailing preventative care, tier 1-3 prescription drug deductibles, vision allowances, health savings account (HSA) employer match contributions, and wellness perks.'
  },
  {
    id: 'doc-6',
    title: 'Form I-9 Employment Eligibility Verification Reference Guide',
    code: 'DOC-GOV-106',
    section: 'other',
    folder: 'Statutory & Tax',
    category: 'Statutory Compliance',
    description: 'Federal statutory guidance on accepted List A, B, and C identification documents and E-Verify processing.',
    format: 'PDF',
    fileSize: '1.2 MB',
    version: 'v2026',
    lastUpdated: '2026-08-01',
    status: 'Active',
    mandatory: true,
    targetAudience: 'US Employees',
    contentSnippet: 'USCIS statutory instructions informing new employees of legal identification requirements to demonstrate identity and employment authorization within three business days of commencing hire.'
  }
];

const STORAGE_KEY = 'quantira_corporate_documents';
const FOLDERS_STORAGE_KEY = 'quantira_corporate_folders';

export const getCorporateDocuments = (): CorporateDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((doc: any) => ({
          ...doc,
          folder: doc.folder || (doc.section === 'policy' ? 'HR & Ethics' : 'General Documents')
        }));
      }
    }
  } catch (err) {
    console.error('Failed to read corporate documents from storage', err);
  }
  return INITIAL_CORPORATE_DOCUMENTS;
};

export const saveCorporateDocuments = (documents: CorporateDocument[]): void => {
  storageService.setItem(STORAGE_KEY, documents);
  try {
    window.dispatchEvent(new CustomEvent('quantira_documents_updated'));
  } catch {}
};

export const addCorporateDocument = (
  doc: Omit<CorporateDocument, 'id' | 'lastUpdated'>
): CorporateDocument => {
  const current = getCorporateDocuments();
  const newDoc: CorporateDocument = {
    ...doc,
    folder: doc.folder?.trim() || (doc.section === 'policy' ? 'HR & Ethics' : 'General Documents'),
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  const updated = [newDoc, ...current];
  saveCorporateDocuments(updated);
  return newDoc;
};

export const updateCorporateDocument = (
  id: string,
  updates: Partial<CorporateDocument>
): CorporateDocument | null => {
  const current = getCorporateDocuments();
  let updatedDoc: CorporateDocument | null = null;
  const updated = current.map((d) => {
    if (d.id === id) {
      updatedDoc = {
        ...d,
        ...updates,
        folder: updates.folder !== undefined ? updates.folder.trim() : d.folder,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      return updatedDoc;
    }
    return d;
  });
  if (updatedDoc) {
    saveCorporateDocuments(updated);
  }
  return updatedDoc;
};

export const deleteCorporateDocument = (id: string): boolean => {
  const current = getCorporateDocuments();
  const filtered = current.filter((d) => d.id !== id);
  if (filtered.length !== current.length) {
    saveCorporateDocuments(filtered);
    return true;
  }
  return false;
};

export const resetCorporateDocuments = (): CorporateDocument[] => {
  saveCorporateDocuments(INITIAL_CORPORATE_DOCUMENTS);
  localStorage.removeItem(FOLDERS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('quantira_folders_updated'));
  return INITIAL_CORPORATE_DOCUMENTS;
};

// =========================================================================
// Folder Management Service
// =========================================================================

interface StoredFolders {
  policy: string[];
  other: string[];
}

export const getSectionFolders = (section: 'policy' | 'other'): string[] => {
  const defaults = section === 'policy' ? DEFAULT_POLICY_FOLDERS : DEFAULT_OTHER_FOLDERS;
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    const customFolders: StoredFolders = raw ? JSON.parse(raw) : { policy: [], other: [] };
    const sectionCustom = customFolders[section] || [];

    // Also collect folders currently used by documents in this section
    const currentDocs = getCorporateDocuments().filter((d) => d.section === section);
    const docFolders = currentDocs.map((d) => d.folder).filter(Boolean);

    // Merge and deduplicate preserving order
    const merged = Array.from(new Set([...defaults, ...sectionCustom, ...docFolders]));
    return merged;
  } catch (err) {
    console.error('Failed to read folders from storage', err);
    return defaults;
  }
};

export const createSectionFolder = (section: 'policy' | 'other', folderName: string): boolean => {
  const trimmed = folderName.trim();
  if (!trimmed) return false;

  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    const current: StoredFolders = raw ? JSON.parse(raw) : { policy: [], other: [] };
    if (!current[section]) current[section] = [];

    if (!current[section].includes(trimmed)) {
      current[section].push(trimmed);
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('quantira_folders_updated'));
      return true;
    }
  } catch (err) {
    console.error('Failed to save new folder', err);
  }
  return false;
};

export const deleteSectionFolder = (section: 'policy' | 'other', folderName: string): boolean => {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (!raw) return false;
    const current: StoredFolders = JSON.parse(raw);
    if (current[section]) {
      current[section] = current[section].filter((f) => f !== folderName);
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('quantira_folders_updated'));
      return true;
    }
  } catch (err) {
    console.error('Failed to delete folder', err);
  }
  return false;
};

/**
 * Retrieves all active policy documents for onboarding review (from Documents Menu).
 */
export const getOnboardingPolicyDocuments = (): CorporateDocument[] => {
  const all = getCorporateDocuments();
  return all.filter((d) => d.status === 'Active' && d.section === 'policy');
};

/**
 * Retrieves all statutory compliance and onboarding submission documents (from Documents Menu).
 */
export const getOnboardingStatutoryDocuments = (): CorporateDocument[] => {
  const all = getCorporateDocuments();
  return all.filter((d) => d.status === 'Active' && d.section === 'other');
};
