import React, { useState, useEffect, useRef } from 'react';
import { useOnboardingFlow } from '../../../context/OnboardingFlowContext';
import { TextInput } from '../../atoms';
import { Select } from '../../atoms';
import { FormSection } from '../../molecules';
import { Button } from '../../atoms';
import { FileUpload } from '../../organisms';
import {
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Building2,
  Landmark,
  FolderPlus,
  Users,
  Heart,
  Phone,
  Shield,
  Star,
  Briefcase,
  Camera,
  Globe,
  MapPin,
  Calendar,
  HeartHandshake,
  Award,
  Hash
} from 'lucide-react';
import { Modal } from '../../organisms';
import { getCustomFields, CustomProfileField } from '../../../services/customFieldsService';
import { getRadianAvatarByName, getAvatarByGender } from '../../../utils/radianAvatars';

export const DOCUMENT_CATEGORIES = [
  'Government & Identity Documents',
  'Education Documents',
  'Last Organization Documents',
  'Financial & Tax Documents',
  'Other Documents'
] as const;

export const DOCUMENT_SECTIONS = [
  {
    category: 'Government & Identity Documents',
    icon: ShieldCheck,
    description: 'Official national identity proof and photo identification for statutory verification.',
    badge: 'Mandatory / Identity'
  },
  {
    category: 'Education Documents',
    icon: GraduationCap,
    description: 'Degree certificates, transcripts, and academic records.',
    badge: 'Academic Records'
  },
  {
    category: 'Last Organization Documents',
    icon: Building2,
    description: 'Relieving letter, previous offer letter, experience certificate, or salary slips (Optional for freshers).',
    badge: 'Prior Experience'
  },
  {
    category: 'Financial & Tax Documents',
    icon: Landmark,
    description: 'Bank direct deposit details and statutory tax declaration documentation.',
    badge: 'Payroll & Taxes'
  },
  {
    category: 'Other Documents',
    icon: FolderPlus,
    description: 'Additional professional certifications, licenses, and custom employment records.',
    badge: 'Additional Records'
  }
];

export const getDocumentCategory = (doc: { category?: string; id?: string; type?: string; name?: string }): string => {
  if (doc.category) {
    const cat = doc.category.toLowerCase();
    if (cat.includes('gov') || cat.includes('identity') || cat.includes('id') || cat.includes('statutory identity')) {
      return 'Government & Identity Documents';
    }
    if (cat.includes('edu') || cat.includes('academic') || cat.includes('degree')) {
      return 'Education Documents';
    }
    if (cat.includes('last org') || cat.includes('previous') || cat.includes('prior') || cat.includes('relieving') || cat.includes('experience') || cat.includes('offer')) {
      return 'Last Organization Documents';
    }
    if (cat.includes('finan') || cat.includes('bank') || cat.includes('tax') || cat.includes('pay') || cat.includes('salary')) {
      return 'Financial & Tax Documents';
    }
    if (cat.includes('other')) {
      return 'Other Documents';
    }
    if ((DOCUMENT_CATEGORIES as readonly string[]).includes(doc.category)) {
      return doc.category;
    }
  }

  const key = `${doc.id || ''} ${doc.type || ''} ${doc.name || ''}`.toLowerCase();
  if (key.includes('gov') || key.includes('passport') || key.includes('identity') || key.includes('badge') || key.includes('photo') || key.includes('license') || key.includes('i-9') || key.includes('i9')) {
    return 'Government & Identity Documents';
  }
  if (key.includes('edu') || key.includes('degree') || key.includes('transcript') || key.includes('diploma') || key.includes('academic')) {
    return 'Education Documents';
  }
  if (key.includes('offer') || key.includes('reliev') || key.includes('relieving') || key.includes('experience') || key.includes('salary') || key.includes('payslip') || key.includes('prior') || key.includes('prev')) {
    return 'Last Organization Documents';
  }
  if (key.includes('bank') || key.includes('deposit') || key.includes('tax') || key.includes('w-4') || key.includes('form 16') || key.includes('financial')) {
    return 'Financial & Tax Documents';
  }
  return 'Other Documents';
};

export const StepGroupPersonalDocuments: React.FC = () => {
  const { data, updatePersonalInfo, uploadDocument, removeDocument, addCustomDocument, nextStep } = useOnboardingFlow();
  const info = data.personalInfo;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add Document Modal State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocCategory, setNewDocCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<{ name: string; size: string } | null>(null);
  const [addDocError, setAddDocError] = useState<string | null>(null);
  const customFileInputRef = useRef<HTMLInputElement>(null);

  // Multiple Emergency Contacts state (per-employee storage)
  const [emergencyContactsList, setEmergencyContactsList] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    altPhone?: string;
    email?: string;
    isPrimary?: boolean;
  }>>(() => {
    try {
      const saved = localStorage.getItem(`employee_emergency_contacts_${info.employeeId}`);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
      if (info.emergencyContacts && info.emergencyContacts.length > 0) {
        return info.emergencyContacts;
      }
    } catch {}
    return [
      {
        id: `ec-${info.employeeId}-1`,
        name: '',
        relationship: 'Spouse',
        phone: info.phone || '',
        altPhone: '',
        email: '',
        isPrimary: true
      }
    ];
  });

  const handleUpdateEmergencyContact = (id: string, field: string, value: any) => {
    setEmergencyContactsList((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
      try {
        localStorage.setItem(`employee_emergency_contacts_${info.employeeId}`, JSON.stringify(updated));
        localStorage.setItem('employee_emergency_contacts', JSON.stringify(updated));
      } catch {}
      updatePersonalInfo({ emergencyContacts: updated });
      return updated;
    });
  };

  const handleAddEmergencyContact = () => {
    const newContact = {
      id: `ec-${info.employeeId}-${Date.now()}`,
      name: '',
      relationship: 'Parent',
      phone: '',
      altPhone: '',
      email: '',
      isPrimary: emergencyContactsList.length === 0
    };
    setEmergencyContactsList((prev) => {
      const updated = [...prev, newContact];
      try {
        localStorage.setItem(`employee_emergency_contacts_${info.employeeId}`, JSON.stringify(updated));
      } catch {}
      updatePersonalInfo({ emergencyContacts: updated });
      return updated;
    });
  };

  const handleRemoveEmergencyContact = (id: string) => {
    if (emergencyContactsList.length <= 1) return;
    setEmergencyContactsList((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (!filtered.some((c) => c.isPrimary) && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      try {
        localStorage.setItem(`employee_emergency_contacts_${info.employeeId}`, JSON.stringify(filtered));
      } catch {}
      updatePersonalInfo({ emergencyContacts: filtered });
      return filtered;
    });
  };

  const handleSetPrimaryEmergency = (id: string) => {
    setEmergencyContactsList((prev) => {
      const updated = prev.map((c) => ({ ...c, isPrimary: c.id === id }));
      try {
        localStorage.setItem(`employee_emergency_contacts_${info.employeeId}`, JSON.stringify(updated));
      } catch {}
      updatePersonalInfo({ emergencyContacts: updated });
      return updated;
    });
  };

  // Multiple Dependents state (per-employee storage)
  const [dependentsList, setDependentsList] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem(`employee_dependents_${info.employeeId}`);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
      if (info.dependents && info.dependents.length > 0) {
        return info.dependents;
      }
    } catch {}
    return [];
  });

  const handleUpdateDependent = (id: string, field: string, value: any) => {
    setDependentsList((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, [field]: value } : d));
      try {
        localStorage.setItem(`employee_dependents_${info.employeeId}`, JSON.stringify(updated));
      } catch {}
      updatePersonalInfo({ dependents: updated });
      return updated;
    });
  };

  const handleAddDependent = () => {
    const newDep = {
      id: `dep-${info.employeeId}-${Date.now()}`,
      name: '',
      relationship: 'Spouse',
      dateOfBirth: '',
      gender: 'Female',
      phone: '',
      email: ''
    };
    setDependentsList((prev) => {
      const updated = [...prev, newDep];
      try {
        localStorage.setItem(`employee_dependents_${info.employeeId}`, JSON.stringify(updated));
      } catch {}
      updatePersonalInfo({ dependents: updated });
      return updated;
    });
  };

  const handleRemoveDependent = (id: string) => {
    setDependentsList((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem(`employee_dependents_${info.employeeId}`, JSON.stringify(filtered));
      } catch {}
      updatePersonalInfo({ dependents: filtered });
      return filtered;
    });
  };

  const [customFields, setCustomFields] = useState<CustomProfileField[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('quantira_employee_custom_values');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const fields = getCustomFields()
      .filter((f) => f.showInOnboarding !== false)
      .map((f) => (f.key === 'githubUsername' ? { ...f, required: false } : f));
    setCustomFields(fields);
  }, []);

  const handleCustomChange = (key: string, val: any) => {
    setCustomValues((prev) => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem('quantira_employee_custom_values', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleOpenAddDocModal = () => {
    setNewDocName('');
    setNewDocCategory(DOCUMENT_CATEGORIES[0]);
    setNewDocFile(null);
    setAddDocError(null);
    setShowAddDocModal(true);
  };

  const handleSimulateCustomFile = () => {
    const docTitle = newDocName.trim() || 'previous_employer_document';
    const cleanFileName = `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    setNewDocFile({
      name: cleanFileName,
      size: '1.4 MB'
    });
    setAddDocError(null);
  };

  const handleCustomFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setNewDocFile({
        name: file.name,
        size: `${sizeMb} MB`
      });
      if (!newDocName.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setNewDocName(cleanName);
      }
      setAddDocError(null);
    }
  };

  const handleSaveCustomDocument = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newDocName.trim()) {
      setAddDocError('Please enter a document name / title.');
      return;
    }
    if (!newDocFile) {
      setAddDocError('Please select or upload a document file.');
      return;
    }

    addCustomDocument({
      name: newDocName.trim(),
      type: newDocCategory.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      category: newDocCategory,
      fileName: newDocFile.name,
      fileSize: newDocFile.size,
      required: false
    });

    setShowAddDocModal(false);
    setErrorMsg(null);
  };

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updatePersonalInfo({ avatarUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    nextStep();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 text-left animate-fade-in pb-8">
      {/* Header Banner */}
      <div className="flex items-center gap-3.5 pb-2">
        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
          <User className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Personal Information &amp; Statutory Documents
          </h1>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5 font-semibold shadow-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: PERSONAL & EMPLOYMENT INFORMATION */}
      <div className="space-y-6">
        {/* Employment Details */}
        <FormSection
          title="Employment Details"
          description="Official company placement, corporate identity, and personal demographics."
        >
          {/* Photograph & Profile Header */}
          <div className="col-span-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={info.avatarUrl || getAvatarByGender(info.gender, `${info.firstName || ''} ${info.lastName || ''}`.trim() || info.name || 'Employee')}
                alt="Employee Photograph"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-md bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-semibold cursor-pointer"
                title="Change Photograph"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                Change
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {info.title ? `${info.title} ` : ''}{info.firstName || ''} {info.middleName ? `${info.middleName} ` : ''}{info.lastName || ''}
                  {info.preferredName && <span className="text-xs font-normal text-slate-500 ml-1.5">({info.preferredName})</span>}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {info.employeeId || 'ID Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {info.jobTitle || 'Designation'} &bull; {info.department || 'Department'}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Upload New Photograph
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Select
              label="Title / Salutation"
              value={info.title || 'Mr.'}
              onChange={(e) => updatePersonalInfo({ title: e.target.value })}
              options={[
                { label: 'Mr.', value: 'Mr.' },
                { label: 'Ms.', value: 'Ms.' },
                { label: 'Mrs.', value: 'Mrs.' },
                { label: 'Dr.', value: 'Dr.' },
                { label: 'Prof.', value: 'Prof.' }
              ]}
            />
            <TextInput
              label="First Name"
              value={info.firstName || ''}
              onChange={(e) => updatePersonalInfo({ firstName: e.target.value, name: `${e.target.value} ${info.lastName || ''}`.trim() })}
              required
            />
            <TextInput
              label="Middle Name"
              value={info.middleName || ''}
              onChange={(e) => updatePersonalInfo({ middleName: e.target.value })}
              placeholder="Optional middle name"
            />
            <TextInput
              label="Last Name"
              value={info.lastName || ''}
              onChange={(e) => updatePersonalInfo({ lastName: e.target.value, name: `${info.firstName || ''} ${e.target.value}`.trim() })}
              required
            />
            <TextInput
              label="Preferred Name"
              value={info.preferredName || ''}
              onChange={(e) => updatePersonalInfo({ preferredName: e.target.value })}
              placeholder="e.g. Alex, Sam"
            />
            <TextInput
              label="Date of Birth"
              type="date"
              value={info.dateOfBirth || ''}
              onChange={(e) => updatePersonalInfo({ dateOfBirth: e.target.value })}
            />
            <Select
              label="Gender"
              value={info.gender || ''}
              onChange={(e) => updatePersonalInfo({ gender: e.target.value })}
              options={[
                { label: 'Select Gender...', value: '' },
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Non-Binary', value: 'Non-Binary' },
                { label: 'Other', value: 'Other' },
                { label: 'Prefer not to say', value: 'Prefer not to say' }
              ]}
            />
            <Select
              label="Marital Status"
              value={info.maritalStatus || 'Single'}
              onChange={(e) => updatePersonalInfo({ maritalStatus: e.target.value })}
              options={[
                { label: 'Single', value: 'Single' },
                { label: 'Married', value: 'Married' },
                { label: 'Divorced', value: 'Divorced' },
                { label: 'Widowed', value: 'Widowed' },
                { label: 'Other', value: 'Other' }
              ]}
            />
            <TextInput
              label="Nationality"
              value={info.nationality || 'United States'}
              onChange={(e) => updatePersonalInfo({ nationality: e.target.value })}
              placeholder="e.g. United States, Indian, Canadian"
            />
            <Select
              label="Blood Group"
              value={info.bloodGroup || 'O+'}
              onChange={(e) => updatePersonalInfo({ bloodGroup: e.target.value })}
              options={[
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
                { label: 'Unknown', value: 'Unknown' }
              ]}
            />
            <TextInput
              label="Corporate Email"
              type="email"
              value={info.corporateEmail || info.email || data.corporateAccount?.corporateEmail || ''}
              disabled
              required
            />
            <TextInput
              label="Personal Email"
              type="email"
              value={info.personalEmail || ''}
              onChange={(e) => updatePersonalInfo({ personalEmail: e.target.value })}
              placeholder="e.g. personal.email@gmail.com"
              required
            />
            <TextInput label="Employee ID" value={info.employeeId} disabled required />
            <TextInput label="Department" value={info.department} disabled required />
            <TextInput label="Designation / Official Job Title" value={info.jobTitle} disabled required />
            <TextInput
              label="Contact Number 1 (Primary Phone)"
              value={info.contactNumber1 || info.phone || ''}
              onChange={(e) => updatePersonalInfo({ contactNumber1: e.target.value, phone: e.target.value } as any)}
              placeholder="e.g. +1 (415) 555-0199"
              required
            />
            <TextInput
              label="Contact Number 2 (Secondary Phone)"
              value={info.contactNumber2 || ''}
              onChange={(e) => updatePersonalInfo({ contactNumber2: e.target.value })}
              placeholder="e.g. +1 (415) 555-0200 (Optional)"
            />
          </div>
        </FormSection>

        {/* Reporting Structure & Terms */}
        <FormSection
          title="Reporting Structure & Terms"
          description="Assigned management reporting hierarchy, work location, and employment terms."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <TextInput
              label="Reporting Manager"
              value={info.line1Manager || info.manager || 'Not assigned'}
              disabled
              required
            />
            <TextInput
              label="Secondary / Executive Manager"
              value={info.line2Manager || 'None'}
              disabled
            />
            <TextInput
              label="Primary Office Location"
              value={info.workLocation || info.officeLocation || ''}
              disabled
              required
            />
            <TextInput
              label="Employment Type"
              value={info.employmentType || 'Full-time'}
              disabled
              required
            />
            <TextInput
              label="Official Start Date"
              value={info.startDate || ''}
              disabled
              required
            />
            <TextInput
              label="Work Model"
              value={info.workModel || 'Hybrid'}
              disabled
            />
            <TextInput
              label="Onboarding Model"
              value={
                info.onboardingType === 'contract' ? 'Fixed-Term Contract' :
                info.onboardingType === 'contract_to_hire' ? 'Contract to Hire' :
                info.onboardingType === 'pre_onboarding' ? 'Pre-onboarding' : 'General Full-Time'
              }
              disabled
            />
            {info.onboardingType === 'contract' && (
              <>
                <TextInput
                  label="Contract Duration"
                  value={info.contractDuration || '6 Months'}
                  disabled
                />
                <TextInput
                  label="Contract Expiration"
                  value={info.contractEndDate ? formatDate(info.contractEndDate) : 'End of Term'}
                  disabled
                />
                <TextInput
                  label="Contract Pay / Bill Rate"
                  value={info.contractRate || '$85 / hr'}
                  disabled
                />
                <TextInput
                  label="Tax Classification"
                  value={info.contractTaxType || 'W-2 Contract'}
                  disabled
                />
                {info.contractAgency && (
                  <TextInput
                    label="Contracting Entity"
                    value={info.contractAgency}
                    disabled
                  />
                )}
              </>
            )}
            {info.onboardingType === 'contract_to_hire' && (
              <>
                <TextInput
                  label="Contract Duration"
                  value={info.contractDuration || '6 Months'}
                  disabled
                />
                <TextInput
                  label="Staffing Agency"
                  value={info.contractAgency || 'Agency Partner'}
                  disabled
                />
                {info.conversionEligibilityDate && (
                  <TextInput
                    label="Target Conversion Date"
                    value={formatDate(info.conversionEligibilityDate)}
                    disabled
                  />
                )}
              </>
            )}
            {info.onboardingType === 'pre_onboarding' && (
              <>
                <TextInput
                  label="Pre-boarding Stage"
                  value={info.preOnboardingStage || 'Offer Accepted'}
                  disabled
                />
                {info.targetOnboardDate && (
                  <TextInput
                    label="Target Day 1 Date"
                    value={formatDate(info.targetOnboardDate)}
                    disabled
                  />
                )}
              </>
            )}
          </div>
        </FormSection>

        {/* Dependent and Emergency Contact */}
        <div className="space-y-6">
          {/* Multiple Emergency Contacts */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Emergency Contacts
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {emergencyContactsList.length} {emergencyContactsList.length === 1 ? 'Contact' : 'Contacts'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddEmergencyContact}
                leftIcon={<Plus className="w-4 h-4" />}
                className="self-start sm:self-auto shrink-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                Add Emergency Contact
              </Button>
            </div>

            <div className="space-y-4">
              {emergencyContactsList.map((contact, idx) => (
                <div
                  key={contact.id || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    contact.isPrimary
                      ? 'border-amber-300 bg-amber-50/40 dark:border-amber-800/80 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Contact #{idx + 1}
                      </span>
                      {contact.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Primary Emergency Contact
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryEmergency(contact.id)}
                          className="text-[11px] font-medium text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer underline"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>
                    {emergencyContactsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEmergencyContact(contact.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Remove Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <TextInput
                      label="Contact Full Name"
                      value={contact.name}
                      onChange={(e) => handleUpdateEmergencyContact(contact.id, 'name', e.target.value)}
                      placeholder="e.g. Jane Doe"
                      required
                    />
                    <Select
                      label="Relationship"
                      value={contact.relationship || 'Spouse'}
                      onChange={(e) => handleUpdateEmergencyContact(contact.id, 'relationship', e.target.value)}
                      options={[
                        { label: 'Spouse', value: 'Spouse' },
                        { label: 'Parent', value: 'Parent' },
                        { label: 'Sibling', value: 'Sibling' },
                        { label: 'Child', value: 'Child' },
                        { label: 'Relative', value: 'Relative' },
                        { label: 'Friend', value: 'Friend' },
                        { label: 'Other', value: 'Other' }
                      ]}
                    />
                    <TextInput
                      label="Primary Phone Number"
                      value={contact.phone}
                      onChange={(e) => handleUpdateEmergencyContact(contact.id, 'phone', e.target.value)}
                      placeholder="e.g. +1 (415) 555-0100"
                      required
                    />
                    <TextInput
                      label="Alternative Phone Number"
                      value={contact.altPhone || ''}
                      onChange={(e) => handleUpdateEmergencyContact(contact.id, 'altPhone', e.target.value)}
                      placeholder="e.g. +1 (415) 555-0101 (Optional)"
                    />
                    <TextInput
                      label="Email Address"
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => handleUpdateEmergencyContact(contact.id, 'email', e.target.value)}
                      placeholder="e.g. emergency.contact@example.com (Optional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multiple Dependents */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Family Dependents
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {dependentsList.length} {dependentsList.length === 1 ? 'Dependent' : 'Dependents'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddDependent}
                leftIcon={<Plus className="w-4 h-4" />}
                className="self-start sm:self-auto shrink-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                Add Dependent
              </Button>
            </div>

            {dependentsList.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 bg-slate-50/50 dark:bg-slate-850/40">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No family dependents listed yet
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  If you have a spouse, children, or dependent parents you would like enrolled in company medical benefits, click below to add them.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddDependent}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="mt-2 text-xs cursor-pointer"
                >
                  Add First Dependent
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dependentsList.map((dependent, idx) => (
                  <div
                    key={dependent.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50"
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Dependent #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDependent(dependent.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Remove Dependent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <TextInput
                        label="Dependent Full Name"
                        value={dependent.name}
                        onChange={(e) => handleUpdateDependent(dependent.id, 'name', e.target.value)}
                        placeholder="e.g. Emily Smith"
                        required
                      />
                      <Select
                        label="Relationship"
                        value={dependent.relationship || 'Spouse'}
                        onChange={(e) => handleUpdateDependent(dependent.id, 'relationship', e.target.value)}
                        options={[
                          { label: 'Spouse', value: 'Spouse' },
                          { label: 'Child / Dependent', value: 'Child' },
                          { label: 'Parent', value: 'Parent' },
                          { label: 'Sibling', value: 'Sibling' },
                          { label: 'Other', value: 'Other' }
                        ]}
                      />
                      <TextInput
                        label="Date of Birth"
                        type="date"
                        value={dependent.dateOfBirth || ''}
                        onChange={(e) => handleUpdateDependent(dependent.id, 'dateOfBirth', e.target.value)}
                      />
                      <Select
                        label="Gender"
                        value={dependent.gender || 'Female'}
                        onChange={(e) => handleUpdateDependent(dependent.id, 'gender', e.target.value)}
                        options={[
                          { label: 'Female', value: 'Female' },
                          { label: 'Male', value: 'Male' },
                          { label: 'Other', value: 'Other' },
                          { label: 'Prefer not to say', value: 'Prefer not to say' }
                        ]}
                      />
                      <TextInput
                        label="Contact Phone"
                        value={dependent.phone || ''}
                        onChange={(e) => handleUpdateDependent(dependent.id, 'phone', e.target.value)}
                        placeholder="e.g. +1 (415) 555-0188 (Optional)"
                      />
                      <TextInput
                        label="Contact Email"
                        type="email"
                        value={dependent.email || ''}
                        onChange={(e) => handleUpdateDependent(dependent.id, 'email', e.target.value)}
                        placeholder="e.g. dependent@example.com (Optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Part F: Custom Organization Fields & Profiles */}
        <FormSection
          title="Additional Organization Details"
          description="Company-specific profile attributes, technical portfolios, and custom organizational fields."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <TextInput
              label="GitHub Username"
              value={info.githubUsername || ''}
              onChange={(e) => updatePersonalInfo({ githubUsername: e.target.value })}
              placeholder="e.g. octocat"
            />
            <TextInput
              label="LinkedIn Profile URL"
              value={info.linkedinUrl || ''}
              onChange={(e) => updatePersonalInfo({ linkedinUrl: e.target.value })}
              placeholder="e.g. https://linkedin.com/in/username"
            />
            {customFields.map((field) => (
              <div key={field.id}>
                {field.type === 'select' ? (
                  <Select
                    label={field.label}
                    value={customValues[field.key] || ''}
                    onChange={(e) => handleCustomChange(field.key, e.target.value)}
                    options={(field.options || []).map((o) => ({ label: o, value: o }))}
                    required={field.required}
                  />
                ) : (
                  <TextInput
                    label={field.label}
                    value={customValues[field.key] || ''}
                    onChange={(e) => handleCustomChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </FormSection>
      </div>

      {/* SECTION 2: STATUTORY DOCUMENTS */}
      <div id="documents-section" className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Statutory Employment Documents
            </h2>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenAddDocModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="self-start sm:self-auto shrink-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
          >
            Add Document
          </Button>
        </div>

        <div className="space-y-6">
          {DOCUMENT_SECTIONS.map((section) => {
            const sectionDocs = data.documents.filter(
              (doc) => getDocumentCategory(doc) === section.category
            );

            // Don't render empty sections unless it's 'Other Documents'
            if (sectionDocs.length === 0 && section.category !== 'Other Documents') {
              return null;
            }

            const SectionIcon = section.icon;

            return (
              <div
                key={section.category}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {section.category}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {sectionDocs.length} {sectionDocs.length === 1 ? 'Document' : 'Documents'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionDocs.map((doc) => {
                      const isUploaded = doc.status === 'uploaded' && doc.fileName;
                      const isCustom = doc.id.startsWith('doc-custom-');

                      return (
                        <div
                          key={doc.id}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                {doc.name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isUploaded && (
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Uploaded
                                  </span>
                                )}
                                {isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => removeDocument(doc.id)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                                    title="Remove custom document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              {doc.category || section.category}
                            </p>
                          </div>

                          <FileUpload
                            value={
                              doc.fileName && doc.fileSize
                                ? {
                                    name: doc.fileName,
                                    size: doc.fileSize,
                                    type: 'application/pdf'
                                  }
                                : null
                            }
                            onChange={(file) => {
                              if (file) {
                                uploadDocument(doc.id, { name: file.name, size: file.size });
                                setErrorMsg(null);
                              } else {
                                removeDocument(doc.id);
                              }
                            }}
                          />
                        </div>
                      );
                    })}

                    {(section.category === 'Other Documents' || sectionDocs.length === 0) && (
                      <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center justify-center min-h-[170px]">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {sectionDocs.length === 0
                            ? `No additional documents uploaded under ${section.category}.`
                            : 'Add another document'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNewDocCategory(section.category);
                            handleOpenAddDocModal();
                          }}
                          className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Upload or attach a document
                        </button>
                      </div>
                    )}
                  </div>
                </div>
            );
          })}
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
          Save &amp; Proceed to Policies &amp; Account
        </Button>
      </div>
    </form>

      {/* Add Document Modal */}
      {showAddDocModal && (
        <Modal
          isOpen={showAddDocModal}
          onClose={() => setShowAddDocModal(false)}
          title="Add Employment / Statutory Document"
          size="md"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add any additional employment documentation (e.g., previous company offer letter, relieving letter, experience certificate, bonus letter, or certificates). This document will also be saved to your employee profile repository.
            </p>

            {addDocError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addDocError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Document Category / Type <span className="text-rose-500">*</span>
              </label>
              <Select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value)}
                options={DOCUMENT_CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
              />
            </div>

            <div>
              <TextInput
                label="Document Name / Title"
                value={newDocName}
                onChange={(e) => {
                  setNewDocName(e.target.value);
                  if (addDocError) setAddDocError(null);
                }}
                placeholder="e.g. Previous Company Relieving Letter"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Upload File (PDF, DOCX, JPG, PNG) <span className="text-rose-500">*</span>
              </label>
              <input
                ref={customFileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleCustomFileSelect}
                className="hidden"
              />

              {newDocFile ? (
                <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {newDocFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{newDocFile.size}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="tertiary"
                    size="sm"
                    onClick={() => setNewDocFile(null)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => customFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <Upload className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click to choose file or browse
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Supports PDF, PNG, JPG up to 10MB
                    </p>
                  </button>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSimulateCustomFile}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-generate sample file for demo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddDocModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleSaveCustomDocument}
              >
                Add Document
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
