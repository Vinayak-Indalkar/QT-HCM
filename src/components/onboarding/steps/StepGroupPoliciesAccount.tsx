import React, { useState, useEffect } from 'react';
import { useOnboardingFlow } from '../../../context/OnboardingFlowContext';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import { TextInput } from '../../ui/TextInput';
import { Card } from '../../ui/Card';
import { FileUpload } from '../../ui/FileUpload';
import { Modal } from '../../ui/Modal';
import { formatDateTime } from '../../../utils/formatters';
import {
  ArrowRight,
  ShieldCheck,
  Shield,
  CheckCircle2,
  Copy,
  AlertCircle,
  ExternalLink,
  FileText,
  Eye,
  EyeOff,
  Lock,
  BookOpen
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';
import {
  getOnboardingPolicyDocuments,
  CorporateDocument
} from '../../../services/corporateDocumentService';

interface PolicySection {
  title: string;
  paragraphs: string[];
}

interface PolicyDocument {
  id: string;
  code?: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string;
  icon: React.ElementType;
  bgClass: string;
  colorClass: string;
  sections: PolicySection[];
}

const PRESET_POLICY_SECTIONS: Record<string, PolicySection[]> = {
  nda: [
    {
      title: '1. Confidential Information & Trade Secrets',
      paragraphs: [
        'As an employee of Quantira Technologies Inc. ("Company"), you will have access to non-public, highly proprietary information. This includes source code repositories, mathematical algorithms, architectural schematics, customer contracts, financial projections, personnel records, and strategic roadmaps.',
        'You agree to hold all such Confidential Information in the strictest confidence and take all reasonable precautions to prevent unauthorized disclosure, leakage, reverse engineering, or dissemination.'
      ]
    },
    {
      title: '2. Intellectual Property & Inventions Assignment',
      paragraphs: [
        'Any and all inventions, computer software, design documents, patents, improvements, and copyrightable works conceived, developed, or reduced to practice during the term of employment that relate directly or indirectly to the business of the Company shall belong exclusively and perpetually to Quantira Technologies Inc.',
        'You hereby assign and transfer to the Company all right, title, and interest in and to such Intellectual Property worldwide without requirement of additional consideration.'
      ]
    },
    {
      title: '3. Return of Enterprise Materials & Hardware',
      paragraphs: [
        'Upon termination of employment or upon formal request by corporate leadership, you agree to promptly surrender all Company-issued laptops, access keycards, tokens, mobile devices, physical documents, and confidential digital archives without retaining copies in any format or medium.'
      ]
    },
    {
      title: '4. Non-Solicitation & Governing Law',
      paragraphs: [
        'During your employment and for a period of twelve (12) months following separation, you agree not to directly or indirectly solicit, recruit, or entice away any Company employee, contractor, or strategic client.',
        'This Agreement shall be construed and governed in accordance with the laws of the State of California, without regard to conflicts of law principles. In the event of a breach, the Company is entitled to seek injunctive relief in any court of competent jurisdiction.'
      ]
    }
  ],
  conduct: [
    {
      title: '1. Standard of Integrity & Ethical Leadership',
      paragraphs: [
        'All Quantira Technologies employees, directors, and contractors are held to the highest standard of honesty, personal integrity, and accountability in every business engagement, client communication, and peer interaction.'
      ]
    },
    {
      title: '2. Conflicts of Interest & External Engagements',
      paragraphs: [
        'Employees must promptly disclose any external commercial engagements, advisory positions, personal investments, or board memberships that could reasonably conflict with their duties to the Company.'
      ]
    },
    {
      title: '3. Anti-Bribery, Anti-Corruption & Financial Transparency',
      paragraphs: [
        'Quantira strictly complies with the Foreign Corrupt Practices Act (FCPA) and global anti-corruption laws. Bribes, kickbacks, unrecorded financial transactions, and improper corporate gifts are strictly prohibited.'
      ]
    }
  ],
  security: [
    {
      title: '1. Device Security & Access Control',
      paragraphs: [
        'Corporate data must only be accessed through Company-managed, encrypted endpoints with active endpoint detection and response (EDR) agents. Multi-Factor Authentication (MFA) with hardware FIDO2 keys is mandatory.'
      ]
    },
    {
      title: '2. Customer Data Confidentiality & Zero-Trust Protocol',
      paragraphs: [
        'Production customer data is strictly isolated and accessible solely through role-based access control (RBAC) with audited temporary tokens. Downloading customer databases to local developer machines is strictly forbidden.'
      ]
    },
    {
      title: '3. Security Incident Reporting',
      paragraphs: [
        'Any suspected compromise, lost device, credential theft, or unauthorized data access must be reported immediately (within 1 hour of discovery) to the IT Incident Response team at security@quantira.com.'
      ]
    }
  ],
  eeo: [
    {
      title: '1. Equal Employment Opportunity Commitment',
      paragraphs: [
        'Quantira Technologies provides equal employment opportunities to all candidates and employees regardless of race, color, religion, sex, national origin, ancestry, age, physical disability, medical condition, genetic information, marital status, sexual orientation, or gender identity.'
      ]
    },
    {
      title: '2. Prohibition of Harassment, Discrimination & Bullying',
      paragraphs: [
        'We strictly prohibit discriminatory conduct, microaggressions, sexual harassment, hostile workplace behavior, or intimidation in physical offices, remote meetings, and written communication channels (such as Slack and email).'
      ]
    },
    {
      title: '3. Investigation Procedures & Anti-Retaliation',
      paragraphs: [
        'All reported grievances are investigated promptly, impartially, and confidentially by People Operations. Disciplinary action for policy violations includes formal reprimand, demotion, or immediate termination. Retaliation against any participant in an investigation is strictly prohibited.'
      ]
    }
  ],
  safety: [
    {
      title: '1. Safe Working Conditions & Physical Environment',
      paragraphs: [
        'Quantira Technologies is committed to providing a safe, clean, and healthy workplace that complies with OSHA standards and international safety regulations. Employees must immediately report hazards, broken equipment, or spills to Facilities.'
      ]
    },
    {
      title: '2. Substance-Free Workplace Mandate',
      paragraphs: [
        'The unauthorized possession, use, distribution, or sale of narcotics, controlled substances, or alcohol on company premises or during working hours is strictly forbidden. Employees must be unimpaired while performing duties.'
      ]
    },
    {
      title: '3. Emergency Evacuation & First Aid Readiness',
      paragraphs: [
        'Employees are required to familiarize themselves with designated emergency evacuation routes, automated external defibrillator (AED) stations, fire extinguishers, and emergency rally points at their respective office campus.'
      ]
    }
  ]
};

const FALLBACK_POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    id: 'nda',
    code: 'POL-LEG-005',
    title: 'Confidential Information & Non-Disclosure Agreement (NDA)',
    category: 'Legal & Intellectual Property',
    version: 'v2026.2',
    effectiveDate: 'October 1, 2026',
    icon: Shield,
    bgClass: 'bg-purple-100 dark:bg-purple-950',
    colorClass: 'text-purple-600 dark:text-purple-400',
    sections: PRESET_POLICY_SECTIONS.nda
  },
  {
    id: 'conduct',
    code: 'POL-HR-001',
    title: 'Code of Business Conduct & Corporate Ethics',
    category: 'Corporate Governance',
    version: 'v2026.1',
    effectiveDate: 'January 1, 2026',
    icon: ShieldCheck,
    bgClass: 'bg-blue-100 dark:bg-blue-950',
    colorClass: 'text-blue-600 dark:text-blue-400',
    sections: PRESET_POLICY_SECTIONS.conduct
  },
  {
    id: 'security',
    code: 'POL-SEC-002',
    title: 'Information Security & Acceptable Use Policy',
    category: 'Information Security',
    version: 'v2026.1',
    effectiveDate: 'March 1, 2026',
    icon: Lock,
    bgClass: 'bg-emerald-100 dark:bg-emerald-950',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    sections: PRESET_POLICY_SECTIONS.security
  },
  {
    id: 'eeo',
    code: 'POL-HR-006',
    title: 'Equal Opportunity & Anti-Harassment Policy',
    category: 'People & Culture',
    version: 'v2026.1',
    effectiveDate: 'January 1, 2026',
    icon: ShieldCheck,
    bgClass: 'bg-rose-100 dark:bg-rose-950',
    colorClass: 'text-rose-600 dark:text-rose-400',
    sections: PRESET_POLICY_SECTIONS.eeo
  },
  {
    id: 'safety',
    code: 'POL-OPS-008',
    title: 'Health, Safety & Workplace Environment Policy',
    category: 'Workplace Operations',
    version: 'v2026.1',
    effectiveDate: 'January 1, 2026',
    icon: ShieldCheck,
    bgClass: 'bg-amber-100 dark:bg-amber-950',
    colorClass: 'text-amber-600 dark:text-amber-400',
    sections: PRESET_POLICY_SECTIONS.safety
  }
];

const loadDisplayPolicies = (): PolicyDocument[] => {
  try {
    const corporatePolicies = getOnboardingPolicyDocuments();
    if (!corporatePolicies || corporatePolicies.length === 0) {
      return FALLBACK_POLICY_DOCUMENTS;
    }

    return corporatePolicies.map((doc) => {
      let icon = BookOpen;
      let bgClass = 'bg-blue-100 dark:bg-blue-950';
      let colorClass = 'text-blue-600 dark:text-blue-400';

      const lowerTitle = doc.title.toLowerCase();
      const lowerCat = doc.category.toLowerCase();

      if (lowerTitle.includes('nda') || lowerTitle.includes('confidential') || lowerCat.includes('legal')) {
        icon = Shield;
        bgClass = 'bg-purple-100 dark:bg-purple-950';
        colorClass = 'text-purple-600 dark:text-purple-400';
      } else if (lowerTitle.includes('security') || lowerTitle.includes('data protection') || lowerCat.includes('security')) {
        icon = Lock;
        bgClass = 'bg-emerald-100 dark:bg-emerald-950';
        colorClass = 'text-emerald-600 dark:text-emerald-400';
      } else if (lowerTitle.includes('conduct') || lowerTitle.includes('ethics')) {
        icon = ShieldCheck;
        bgClass = 'bg-blue-100 dark:bg-blue-950';
        colorClass = 'text-blue-600 dark:text-blue-400';
      } else if (lowerTitle.includes('harassment') || lowerTitle.includes('diversity') || lowerTitle.includes('eeo')) {
        icon = ShieldCheck;
        bgClass = 'bg-rose-100 dark:bg-rose-950';
        colorClass = 'text-rose-600 dark:text-rose-400';
      } else if (lowerTitle.includes('safety') || lowerTitle.includes('health')) {
        icon = ShieldCheck;
        bgClass = 'bg-amber-100 dark:bg-amber-950';
        colorClass = 'text-amber-600 dark:text-amber-400';
      }

      let sections: PolicySection[] = [];
      if (lowerTitle.includes('nda') || lowerTitle.includes('confidential')) {
        sections = PRESET_POLICY_SECTIONS.nda;
      } else if (lowerTitle.includes('conduct') || lowerTitle.includes('ethics')) {
        sections = PRESET_POLICY_SECTIONS.conduct;
      } else if (lowerTitle.includes('security') || lowerTitle.includes('acceptable use') || lowerTitle.includes('data protection')) {
        sections = PRESET_POLICY_SECTIONS.security;
      } else if (lowerTitle.includes('harassment') || lowerTitle.includes('equal opportunity')) {
        sections = PRESET_POLICY_SECTIONS.eeo;
      } else if (lowerTitle.includes('safety') || lowerTitle.includes('health')) {
        sections = PRESET_POLICY_SECTIONS.safety;
      } else {
        sections = [
          {
            title: '1. Purpose & Scope',
            paragraphs: [
              doc.description || 'This document defines the formal operational rules and policies of Quantira Technologies Inc.'
            ]
          },
          {
            title: '2. Standard Operating Guidelines',
            paragraphs: [
              doc.contentSnippet || 'All employees, contractors, and partners are expected to adhere strictly to the highest ethical and professional standards defined herein.'
            ]
          },
          {
            title: '3. Compliance & Enforcement',
            paragraphs: [
              'Failure to comply with corporate policies may result in formal disciplinary procedures, up to and including termination of employment and legal recourse.'
            ]
          },
          {
            title: '4. Governance & Department Administration',
            paragraphs: [
              `This policy is cataloged under corporate directory "${doc.folder}" with classification ${doc.category}. Version ${doc.version}, designated for ${doc.targetAudience}.`
            ]
          }
        ];
      }

      return {
        id: doc.id,
        code: doc.code,
        title: doc.title,
        category: doc.category,
        version: doc.version,
        effectiveDate: doc.lastUpdated,
        icon,
        bgClass,
        colorClass,
        sections
      };
    });
  } catch {
    return FALLBACK_POLICY_DOCUMENTS;
  }
};

export const StepGroupPoliciesAccount: React.FC = () => {
  const { data, signNda, nextStep } = useOnboardingFlow();
  const { success } = useToast();

  const [policyDocs, setPolicyDocs] = useState<PolicyDocument[]>(() => loadDisplayPolicies());

  useEffect(() => {
    const handleUpdate = () => {
      setPolicyDocs(loadDisplayPolicies());
    };
    window.addEventListener('quantira_documents_updated', handleUpdate);
    return () => window.removeEventListener('quantira_documents_updated', handleUpdate);
  }, []);

  const [isChecked, setIsChecked] = useState(data.nda.accepted);
  const [signatureName, setSignatureName] = useState(data.nda.signedName || '');
  const [error, setError] = useState<string | null>(null);
  const [digitalSignature, setDigitalSignature] = useState<{ name: string; size: string } | null>(() => {
    try {
      const empId = data.personalInfo.employeeId;
      const saved = empId ? localStorage.getItem(`quantira_nda_digital_signature_${empId}`) : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Selected policy modal state
  const [activePolicy, setActivePolicy] = useState<PolicyDocument | null>(null);
  const [readPolicyIds, setReadPolicyIds] = useState<string[]>([]);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const account = data.corporateAccount;
  const tempPassword = account.temporaryPassword || 'TempPass#2026!Qtr';

  const copyEmail = () => {
    navigator.clipboard.writeText(account.corporateEmail);
    success('Email Copied', 'Corporate email copied to clipboard.');
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    success('Password Copied', 'Temporary password copied to clipboard.');
  };

  const handleOpenPolicy = (policy: PolicyDocument) => {
    setActivePolicy(policy);
  };

  const handleAcknowledgePolicyInModal = (policyId: string) => {
    if (!readPolicyIds.includes(policyId)) {
      setReadPolicyIds((prev) => [...prev, policyId]);
    }
    setActivePolicy(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChecked) {
      setError('You must check the agreement confirmation box to proceed.');
      return;
    }
    if (!signatureName.trim()) {
      setError('Please provide your full legal name to electronically sign.');
      return;
    }

    setError(null);
    signNda(signatureName.trim());
    nextStep();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 text-left animate-fade-in pb-8">
        {/* Header Banner */}
        <div className="flex items-center gap-3.5 pb-2">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Corporate Policies &amp; Account Setup
            </h1>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5 font-semibold shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: CORPORATE POLICIES LIST */}
        <div className="space-y-4">
          <div className="pb-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Corporate Policies
            </h2>
          </div>

          {/* Combined Corporate Policies & Electronic Signature in ONE Container */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
            {/* Top: Policy Document Cards List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700 dark:divide-slate-800">
              {policyDocs.map((policy) => {
                const hasRead = readPolicyIds.includes(policy.id);
                const IconComp = policy.icon;

                return (
                  <div
                    key={policy.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn('p-2.5 rounded-xl shrink-0', policy.bgClass, policy.colorClass)}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => handleOpenPolicy(policy)}
                          className="text-left group cursor-pointer"
                        >
                          <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 group-hover:underline inline-flex items-center gap-1.5 flex-wrap">
                            {policy.title}
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {policy.code && (
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                              {policy.code} •
                            </span>
                          )}
                          <span>{policy.version}</span>
                          <span>•</span>
                          <span>{policy.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {hasRead && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Read
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenPolicy(policy)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/70 dark:hover:text-blue-300 dark:hover:border-blue-700/60 border border-transparent transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Read Document</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: Electronic Acknowledgment & Signature (Inside the same div) */}
            <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-4">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Electronic Acknowledgment &amp; Signature
              </h4>

              <Checkbox
                checked={isChecked}
                onChange={(e) => {
                  setIsChecked(e.target.checked);
                  if (e.target.checked) setError(null);
                }}
                label="I have carefully read, understood, and agreed to the terms of the Confidential Information & Non-Disclosure Agreement and all corporate policies."
                description="Checking this box constitutes your binding legal signature under the ESIGN Act."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2 items-start">
                <TextInput
                  label="Full Legal Name (Electronic Signature)"
                  value={signatureName}
                  onChange={(e) => {
                    setSignatureName(e.target.value);
                    if (e.target.value.trim()) setError(null);
                  }}
                  placeholder="Type your full legal name"
                  required
                />
                <TextInput
                  label="Today's Date"
                  value={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  disabled
                />

                {/* Digital Signature Upload */}
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Upload Digital Signature <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Optional — PNG, JPG, or SVG)</span>
                  </label>
                  <FileUpload
                    value={
                      digitalSignature
                        ? { name: digitalSignature.name, size: digitalSignature.size, type: 'image/png' }
                        : null
                    }
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={(file) => {
                      if (file) {
                        const sig = { name: file.name, size: file.size };
                        setDigitalSignature(sig);
                        try {
                          const empId = data.personalInfo.employeeId;
                          if (empId) localStorage.setItem(`quantira_nda_digital_signature_${empId}`, JSON.stringify(sig));
                          localStorage.setItem('quantira_nda_digital_signature', JSON.stringify(sig));
                        } catch {}
                      } else {
                        setDigitalSignature(null);
                        try {
                          const empId = data.personalInfo.employeeId;
                          if (empId) localStorage.removeItem(`quantira_nda_digital_signature_${empId}`);
                          localStorage.removeItem('quantira_nda_digital_signature');
                        } catch {}
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACCOUNT & SSO */}
        <div className="space-y-4 pt-4">
          <div className="pb-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Corporate Account &amp; Single Sign-On (SSO) Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email & Credentials Card */}
            <Card className="p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Identity &amp; Provisioned Credentials
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {account.accountStatus}
                </span>
              </div>

              {/* Corporate Email */}
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Corporate Email
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-slate-900 dark:text-white">
                  <a
                    href={`mailto:${account.corporateEmail}`}
                    className="truncate mr-2 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                    title="Send email"
                  >
                    {account.corporateEmail}
                  </a>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Copy corporate email"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Password Field (Replaces Authentication Provider) */}
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Temporary Account Password
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-slate-900 dark:text-white">
                  <span className="truncate mr-2 tracking-wider">
                    {showPassword ? tempPassword : '••••••••••••••••'}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      aria-label="Copy temporary password"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  Use this initial password to authenticate on Day 1. You will be prompted to create your permanent password upon first login.
                </p>
              </div>
            </Card>

            {/* Security & Zero-Trust Notice */}
            <Card className="p-6 space-y-4 bg-linear-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30 border-blue-100 dark:border-blue-900 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5" aria-hidden="true" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Zero-Trust Security Credentials
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                In compliance with enterprise cybersecurity protocols, passwordless WebAuthn / FIDO2 security keys are utilized alongside your Okta SSO credential.
              </p>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                <p>
                  <strong>Day 1 Instructions:</strong> Turn on your company laptop and connect to the office Wi-Fi network.
                </p>
                <p>
                  At the Okta sign-in prompt, enter{' '}
                  <a
                    href={`mailto:${account.corporateEmail}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
                  >
                    <code>{account.corporateEmail}</code>
                  </a>{' '}
                  and your temporary password above to complete biometric pairing.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-md"
          >
            Save &amp; Proceed to Work Setup
          </Button>
        </div>
      </form>

      {/* POLICY VIEWER POPUP MODAL */}
      {activePolicy && (
        <Modal
          isOpen={!!activePolicy}
          onClose={() => setActivePolicy(null)}
          title={activePolicy.title}
          description={`${activePolicy.code ? `${activePolicy.code} • ` : ''}${activePolicy.version} • ${activePolicy.category} • Effective Date: ${activePolicy.effectiveDate}`}
          size="xl"
          topOffset="4vh"
          height="88vh"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                Quantira Technologies Enterprise Legal Document
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActivePolicy(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleAcknowledgePolicyInModal(activePolicy.id)}
                >
                  I Have Read &amp; Understood
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed pr-1">
            {/* Header Document Pill */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Quantira Technologies Inc. Legal Policy Archive</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                {activePolicy.version}
              </span>
            </div>

            {/* Sections */}
            {activePolicy.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {sec.title}
                </h4>
                {sec.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};

