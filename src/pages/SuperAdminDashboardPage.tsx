import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/shell/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  getCustomFields,
  saveCustomFields,
  getStandardFieldConfigs,
  saveStandardFieldConfigs,
  StandardFieldConfig,
  CustomProfileField,
  getAssetFieldConfigs,
  saveAssetFieldConfigs,
  AssetFieldConfig,
  getEmployeeFieldOrder,
  saveEmployeeFieldOrder,
  getEmployeeSectionOrder,
  saveEmployeeSectionOrder,
  getAssetSectionOrder,
  saveAssetSectionOrder,
  getWorkflowSectionOrder,
  saveWorkflowSectionOrder
} from '../services/customFieldsService';
import { CustomFieldBuilderView } from '../components/customizer/CustomFieldBuilderView';
import {
  Users,
  Laptop,
  CheckSquare,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  X,
  Copy,
  Check,
  Lock,
  ShieldCheck,
  Layers,
  Sparkles,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';

export type ConfigModuleTab = 'employee' | 'assets' | 'steps';

export interface SuperAdminDashboardPageProps {
  initialTab?: ConfigModuleTab | 'customizer' | 'employees' | 'modules';
}

// 1. Unified Employee Field Record
interface UnifiedEmployeeField {
  id: string;
  key: string;
  label: string;
  section: string;
  type: string;
  required: boolean;
  enabled: boolean;
  isCustom: boolean;
  permission?: string;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  showInAddEmployee?: boolean;
  showInOnboarding?: boolean;
  showInProfile?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  currencySymbol?: string;
  allowedFormats?: string;
  maxFileSizeMB?: number;
  maxLength?: number;
}

// 2. Onboarding Step Record
interface OnboardingStepRecord {
  id: string;
  stepNumber: number;
  name: string;
  category: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

// Helper to strip any "Step X:" or "Step X :" prefix
const cleanStepPrefix = (str: string): string => {
  return str ? str.replace(/^Step\s*\d+\s*:\s*/i, '').trim() : '';
};

export const SuperAdminDashboardPage: React.FC<SuperAdminDashboardPageProps> = ({
  initialTab = 'employee'
}) => {
  const { success, info } = useToast();

  // Normalize initial tab
  const getResolvedTab = (tab?: string): ConfigModuleTab => {
    if (['employee', 'assets', 'steps'].includes(tab || '')) {
      return tab as ConfigModuleTab;
    }
    return 'employee';
  };

  const [activeTab, setActiveTab] = useState<ConfigModuleTab>(() => getResolvedTab(initialTab));

  useEffect(() => {
    setActiveTab(getResolvedTab(initialTab));
  }, [initialTab]);

  // ==========================================
  // STATE: Custom Sections per Module
  // ==========================================
  const standardEmpSections = useMemo(() => ['Personal Info', 'Contact & Address', 'Role & Timeline', 'Reporting Management'], []);
  const [customEmpSections, setCustomEmpSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quantira_employee_custom_sections');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        // Clean out any Step prefixes and filter
        const cleaned = Array.from(
          new Set(
            parsed
              .map((s) => cleanStepPrefix(s))
              .filter((s) => s && !['Personal Info', 'Contact & Address', 'Role & Timeline', 'Reporting Management'].includes(s))
          )
        );
        return cleaned.length > 0 ? cleaned : ['Corporate SSO', 'Email Signature', 'Custom Attributes'];
      }
    } catch {}
    return ['Corporate SSO', 'Email Signature', 'Custom Attributes'];
  });

  const standardAssetSections = useMemo(() => [
    'Hardware Identity',
    'Technical Specs',
    'Procurement & Warranty',
    'Deployment & Notes'
  ], []);
  const [customAssetSections, setCustomAssetSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quantira_asset_custom_sections');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const standardWorkflowSections = useMemo(() => [
    'Identity',
    'Compliance',
    'Legal',
    'IT & Security',
    'Facilities',
    'Communication',
    'IT & Hardware',
    'Culture',
    'Governance'
  ], []);
  const [customWorkflowSections, setCustomWorkflowSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quantira_workflow_custom_sections');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Ordering States
  const [empSectionOrder, setEmpSectionOrder] = useState<string[]>(() => getEmployeeSectionOrder());
  const [assetSectionOrder, setAssetSectionOrder] = useState<string[]>(() => getAssetSectionOrder());
  const [workflowSectionOrder, setWorkflowSectionOrder] = useState<string[]>(() => getWorkflowSectionOrder());
  const [employeeFieldOrder, setEmployeeFieldOrder] = useState<string[]>(() => getEmployeeFieldOrder());

  // Modal: Add Section
  const [showAddSectionModal, setShowAddSectionModal] = useState<ConfigModuleTab | null>(null);
  const [addSectionModalTab, setAddSectionModalTab] = useState<ConfigModuleTab>('employee');
  const [newSectionModalName, setNewSectionModalName] = useState('');

  // Section deletion confirmation
  const [sectionToDelete, setSectionToDelete] = useState<{ tab: ConfigModuleTab; name: string; count: number } | null>(null);

  // Section collapse states
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleCollapseSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ==========================================
  // STATE: Add Employee Fields & Custom Fields
  // ==========================================
  const [standardFields, setStandardFields] = useState<StandardFieldConfig[]>(() => getStandardFieldConfigs());
  const [customFields, setCustomFields] = useState<CustomProfileField[]>(() => {
    const fields = getCustomFields();
    // Clean any step prefixes on initial load
    return fields.map((f) => ({
      ...f,
      step: cleanStepPrefix(f.step) || 'Personal Info'
    }));
  });

  // Custom Field Builder Page State (Full Page View)
  const [builderState, setBuilderState] = useState<{
    isOpen: boolean;
    targetTab: 'employee' | 'assets';
    initialField?: CustomProfileField | AssetFieldConfig | null;
    defaultSection?: string;
  } | null>(null);

  // Quick Copy Feedback State for Database Keys
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const handleCopyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1800);
  };

  // Helper: Render Data Type Badges
  const renderDataTypeBadge = (type: string) => {
    const t = (type || 'text').toLowerCase();
    if (['select', 'multiselect', 'radio'].includes(t)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
          {t === 'multiselect' ? 'Multi-Select' : t === 'radio' ? 'Radio Choice' : 'Dropdown'}
        </span>
      );
    }
    if (['date', 'time', 'datetime'].includes(t)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          {t === 'datetime' ? 'Date & Time' : t === 'time' ? 'Time' : 'Date'}
        </span>
      );
    }
    if (['number', 'currency'].includes(t)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          {t === 'currency' ? 'Currency' : 'Numeric'}
        </span>
      );
    }
    if (['file', 'upload', 'image'].includes(t)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          {t === 'image' ? 'Image' : 'File Upload'}
        </span>
      );
    }
    if (['email', 'phone', 'tel', 'url'].includes(t)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
          {t === 'email' ? 'Email' : t === 'url' ? 'URL Link' : 'Phone'}
        </span>
      );
    }
    if (['boolean', 'checkbox'].includes(t)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
          Boolean Switch
        </span>
      );
    }
    if (t === 'textarea') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Multi-Line
        </span>
      );
    }
    if (t === 'rating') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/60">
          Star Rating
        </span>
      );
    }
    if (t === 'color') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/60">
          Color Picker
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        Single Text
      </span>
    );
  };

  // Helper: Render Access Level Badges
  const renderPermissionBadge = (permission?: string) => {
    const p = permission || 'Employee Editable';
    if (p.includes('Admin')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
          <Lock className="w-2.5 h-2.5" /> Admin Only
        </span>
      );
    }
    if (p.includes('Manager')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
          Manager View
        </span>
      );
    }
    if (p.includes('Read')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Read Only
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
        <ShieldCheck className="w-2.5 h-2.5" /> Employee Editable
      </span>
    );
  };

  // Helper: Render Field Constraints Summary
  const renderFieldConstraints = (field: UnifiedEmployeeField | AssetFieldConfig) => {
    const f = field as any;
    if (f.options && Array.isArray(f.options) && f.options.length > 0) {
      return (
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
          {f.options.length} options ({f.options.slice(0, 2).join(', ')}{f.options.length > 2 ? '...' : ''})
        </span>
      );
    }
    if (f.currencySymbol) {
      return <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{f.currencySymbol} Currency</span>;
    }
    if (f.unit) {
      return <span className="text-[11px] text-slate-500 font-medium">Unit: {f.unit}</span>;
    }
    if (f.allowedFormats) {
      return <span className="text-[11px] text-slate-500 font-medium">{f.allowedFormats} ({f.maxFileSizeMB || 10}MB)</span>;
    }
    if (f.maxLength) {
      return <span className="text-[11px] text-slate-500 font-medium">Max {f.maxLength} chars</span>;
    }
    return <span className="text-[11px] text-slate-400 italic">—</span>;
  };

  // Unified Add Field Modal with Tab Switching
  const [showUnifiedAddFieldModal, setShowUnifiedAddFieldModal] = useState(false);
  const [addFieldModalTab, setAddFieldModalTab] = useState<ConfigModuleTab>('employee');

  // Employee Add Field states
  const [newEmpFieldLabel, setNewEmpFieldLabel] = useState('');
  const [newEmpFieldKey, setNewEmpFieldKey] = useState('');
  const [newEmpFieldType, setNewEmpFieldType] = useState<'text' | 'select' | 'boolean' | 'number'>('text');
  const [newEmpFieldStep, setNewEmpFieldStep] = useState('Personal Info');
  const [isNewEmpCustomSection, setIsNewEmpCustomSection] = useState(false);
  const [newEmpCustomSectionInput, setNewEmpCustomSectionInput] = useState('');
  const [newEmpFieldRequired, setNewEmpFieldRequired] = useState(false);

  // Employee Edit Field states
  const [editingEmployeeField, setEditingEmployeeField] = useState<CustomProfileField | null>(null);
  const [editEmpLabel, setEditEmpLabel] = useState('');
  const [editEmpType, setEditEmpType] = useState<'text' | 'select' | 'boolean' | 'number'>('text');
  const [editEmpStep, setEditEmpStep] = useState('Personal Info');
  const [isEditEmpCustomSection, setIsEditEmpCustomSection] = useState(false);
  const [editEmpCustomSectionInput, setEditEmpCustomSectionInput] = useState('');
  const [editEmpRequired, setEditEmpRequired] = useState(false);

  // Search & Filter state for Employee tab
  const [empSearch, setEmpSearch] = useState('');
  const [empFilterPolicy, setEmpFilterPolicy] = useState<'all' | 'mandatory' | 'optional'>('all');
  const [empFilterSection, setEmpFilterSection] = useState<string>('all');

  // ==========================================
  // STATE: Add Assets Fields
  // ==========================================
  const [assetFields, setAssetFields] = useState<AssetFieldConfig[]>(() => getAssetFieldConfigs());

  // Asset Add Field states
  const [newAssetFieldLabel, setNewAssetFieldLabel] = useState('');
  const [newAssetFieldKey, setNewAssetFieldKey] = useState('');
  const [newAssetFieldSection, setNewAssetFieldSection] = useState<string>('Hardware Identity');
  const [isNewAssetCustomSection, setIsNewAssetCustomSection] = useState(false);
  const [newAssetCustomSectionInput, setNewAssetCustomSectionInput] = useState('');
  const [newAssetFieldType, setNewAssetFieldType] = useState<'text' | 'select' | 'date' | 'currency' | 'image' | 'textarea'>('text');
  const [newAssetFieldRequired, setNewAssetFieldRequired] = useState(false);

  // Asset Edit Field states
  const [editingAssetField, setEditingAssetField] = useState<AssetFieldConfig | null>(null);
  const [editAssetLabel, setEditAssetLabel] = useState('');
  const [editAssetSection, setEditAssetSection] = useState<string>('Hardware Identity');
  const [isEditAssetCustomSection, setIsEditAssetCustomSection] = useState(false);
  const [editAssetCustomSectionInput, setEditAssetCustomSectionInput] = useState('');
  const [editAssetType, setEditAssetType] = useState<'text' | 'select' | 'date' | 'currency' | 'image' | 'textarea'>('text');
  const [editAssetRequired, setEditAssetRequired] = useState(false);

  // Search & Filter state for Assets tab
  const [assetSearch, setAssetSearch] = useState('');
  const [assetFilterPolicy, setAssetFilterPolicy] = useState<'all' | 'mandatory' | 'optional'>('all');
  const [assetFilterSection, setAssetFilterSection] = useState<string>('all');

  // Delete Dialog (Employee & Asset fields)
  const [fieldToDelete, setFieldToDelete] = useState<{ id: string; label: string; isAsset?: boolean } | null>(null);

  // Generic Action Confirmation Popup
  const [actionConfirmation, setActionConfirmation] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'info' | 'warning' | 'danger' | 'success';
    onConfirm: () => void;
  } | null>(null);

  // ==========================================
  // STATE: Onboarding Steps
  // ==========================================
  const [stepConfigs, setStepConfigs] = useState<OnboardingStepRecord[]>(() => {
    const saved = localStorage.getItem('quantira_step_configs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: { id: number; name: string; description: string; enabled: boolean; required: boolean; category: string }) => ({
          id: `step-${s.id}`,
          stepNumber: s.id,
          name: s.name,
          category: cleanStepPrefix(s.category),
          description: s.description,
          required: s.required,
          enabled: s.enabled
        }));
      } catch {}
    }
    return [
      { id: 'step-1', stepNumber: 1, name: 'Personal Information', description: 'Legal identity, contacts, permanent address, and emergency kin contacts', category: 'Identity', enabled: true, required: true },
      { id: 'step-2', stepNumber: 2, name: 'Government ID & Documents', description: 'Passport, Driver License, I-9 verification, degree credentials', category: 'Compliance', enabled: true, required: true },
      { id: 'step-3', stepNumber: 3, name: 'Proprietary NDA & Codes of Conduct', description: 'Intellectual property, confidentiality, enterprise handbook acknowledgment', category: 'Legal', enabled: true, required: true },
      { id: 'step-4', stepNumber: 4, name: 'Corporate SSO & Credentials', description: 'Okta Enterprise SSO credentials, password creation, email setup', category: 'IT & Security', enabled: true, required: true },
      { id: 'step-5', stepNumber: 5, name: 'Employee Badge Photo', description: 'Campus badge issuance, photo verification, building access tier', category: 'Facilities', enabled: true, required: false },
      { id: 'step-6', stepNumber: 6, name: 'Email Signature & Brand Profile', description: 'Corporate email signature generation and communication pronouns', category: 'Communication', enabled: true, required: false },
      { id: 'step-7', stepNumber: 7, name: 'Hardware & IT Equipment', description: 'Workstation laptop, 4K displays, ergonomic accessories allocation', category: 'IT & Hardware', enabled: true, required: true },
      { id: 'step-8', stepNumber: 8, name: 'Team & First-Week Buddy', description: 'Meet manager, 1-on-1 scheduling, buddy pairing and introductions', category: 'Culture', enabled: true, required: false },
      { id: 'step-9', stepNumber: 9, name: 'Desk Allocation & Parking', description: 'Building floor desk reservation, parking permit registration', category: 'Facilities', enabled: true, required: false },
      { id: 'step-10', stepNumber: 10, name: 'Final Review & Electronic Signature', description: 'Legal attestation, formal attestation review, and onboarding sign-off', category: 'Governance', enabled: true, required: true }
    ];
  });

  // Step Add Field states
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepCategory, setNewStepCategory] = useState('Identity');
  const [isNewStepCustomCategory, setIsNewStepCustomCategory] = useState(false);
  const [newStepCustomCategoryInput, setNewStepCustomCategoryInput] = useState('');
  const [newStepRequired, setNewStepRequired] = useState(true);

  // Step Edit Field states
  const [editingStep, setEditingStep] = useState<OnboardingStepRecord | null>(null);
  const [editStepName, setEditStepName] = useState('');
  const [editStepDesc, setEditStepDesc] = useState('');
  const [editStepCategory, setEditStepCategory] = useState('Identity');
  const [isEditStepCustomCategory, setIsEditStepCustomCategory] = useState(false);
  const [editStepCustomCategoryInput, setEditStepCustomCategoryInput] = useState('');
  const [editStepRequired, setEditStepRequired] = useState(true);

  // Delete Step Dialog
  const [stepToDelete, setStepToDelete] = useState<OnboardingStepRecord | null>(null);

  // Search & Filter state for Steps tab
  const [stepSearch, setStepSearch] = useState('');
  const [stepFilterPolicy, setStepFilterPolicy] = useState<'all' | 'mandatory' | 'optional'>('all');
  const [stepFilterSection, setStepFilterSection] = useState<string>('all');

  // Combine standard and custom employee fields into a single dataset
  const unifiedEmployeeFields: UnifiedEmployeeField[] = useMemo(() => {
    const list: UnifiedEmployeeField[] = [];

    // Standard fields
    standardFields.forEach((sf) => {
      let section = 'Personal Info';
      let type = 'text';

      if (['firstName', 'middleName', 'lastName', 'name', 'title', 'preferredName', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality', 'bloodGroup', 'education'].includes(sf.key)) {
        section = 'Personal Info';
      } else if (['personalEmail', 'phone', 'contactNumber1', 'contactNumber2', 'address', 'city', 'state', 'zipCode', 'emergencyContact'].includes(sf.key)) {
        section = 'Contact & Address';
      } else if (['corporateEmail', 'employeeId', 'designation', 'jobTitle', 'department', 'startDate', 'employmentType', 'workModel', 'workLocation', 'hireSource', 'offerReference'].includes(sf.key)) {
        section = 'Role & Timeline';
      } else if (['line1Manager', 'line2Manager', 'manager'].includes(sf.key)) {
        section = 'Reporting Management';
      }

      if (['gender', 'maritalStatus', 'bloodGroup', 'workModel', 'title', 'employmentType', 'hireSource'].includes(sf.key)) {
        type = 'select';
      } else if (sf.key.toLowerCase().includes('email')) {
        type = 'email';
      } else if (sf.key.toLowerCase().includes('date') || sf.key === 'dateOfBirth' || sf.key === 'startDate') {
        type = 'date';
      } else if (['phone', 'contactNumber1', 'contactNumber2'].includes(sf.key)) {
        type = 'tel';
      }

      const label = sf.label;
      const permission = ['corporateEmail', 'employeeId', 'designation', 'department', 'offerReference', 'hireSource'].includes(sf.key)
        ? 'Admin Only'
        : 'Employee Editable';

      list.push({
        id: `std-${sf.key}`,
        key: sf.key,
        label,
        section,
        type,
        required: sf.required,
        enabled: sf.enabled,
        isCustom: false,
        permission,
        showInAddEmployee: true,
        showInOnboarding: !['hireSource', 'offerReference'].includes(sf.key),
        showInProfile: true
      });
    });

    // Custom fields - strip any Step prefixes
    customFields.forEach((cf) => {
      const cleanSec = cleanStepPrefix(cf.step) || 'Custom Attributes';
      list.push({
        id: cf.id,
        key: cf.key,
        label: cf.label,
        section: cleanSec,
        type: cf.type,
        required: cf.required,
        enabled: true,
        isCustom: true,
        permission: cf.permission || 'Employee Editable',
        placeholder: cf.placeholder,
        helpText: cf.helpText,
        options: cf.options,
        showInAddEmployee: cf.showInAddEmployee !== false,
        showInOnboarding: cf.showInOnboarding !== false,
        showInProfile: cf.showInProfile !== false,
        min: cf.min,
        max: cf.max,
        unit: cf.unit,
        currencySymbol: cf.currencySymbol,
        allowedFormats: cf.allowedFormats,
        maxFileSizeMB: cf.maxFileSizeMB,
        maxLength: cf.maxLength
      });
    });

    if (employeeFieldOrder.length > 0) {
      const orderMap = new Map(employeeFieldOrder.map((keyOrId, idx) => [keyOrId, idx]));
      list.sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : orderMap.has(a.key) ? orderMap.get(a.key)! : 9999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : orderMap.has(b.key) ? orderMap.get(b.key)! : 9999;
        return idxA - idxB;
      });
    }

    return list;
  }, [standardFields, customFields, employeeFieldOrder]);

  // ==========================================
  // ALL SECTIONS COMPUTATIONS
  // ==========================================
  const allEmpSections = useMemo(() => {
    const set = new Set<string>(standardEmpSections);
    customEmpSections.forEach((s) => set.add(cleanStepPrefix(s)));
    unifiedEmployeeFields.forEach((f) => set.add(cleanStepPrefix(f.section)));
    const all = Array.from(set).filter(Boolean);
    if (empSectionOrder.length > 0) {
      const orderMap = new Map(empSectionOrder.map((name, idx) => [name, idx]));
      all.sort((a, b) => {
        const idxA = orderMap.has(a) ? orderMap.get(a)! : 999;
        const idxB = orderMap.has(b) ? orderMap.get(b)! : 999;
        return idxA - idxB;
      });
    }
    return all;
  }, [standardEmpSections, customEmpSections, unifiedEmployeeFields, empSectionOrder]);

  const allAssetSections = useMemo(() => {
    const set = new Set<string>(standardAssetSections);
    customAssetSections.forEach((s) => set.add(s));
    assetFields.forEach((f) => set.add(f.section));
    const all = Array.from(set).filter(Boolean);
    if (assetSectionOrder.length > 0) {
      const orderMap = new Map(assetSectionOrder.map((name, idx) => [name, idx]));
      all.sort((a, b) => {
        const idxA = orderMap.has(a) ? orderMap.get(a)! : 999;
        const idxB = orderMap.has(b) ? orderMap.get(b)! : 999;
        return idxA - idxB;
      });
    }
    return all;
  }, [standardAssetSections, customAssetSections, assetFields, assetSectionOrder]);

  const allWorkflowSections = useMemo(() => {
    const set = new Set<string>(standardWorkflowSections);
    customWorkflowSections.forEach((s) => set.add(s));
    stepConfigs.forEach((s) => set.add(s.category));
    const all = Array.from(set).filter(Boolean);
    if (workflowSectionOrder.length > 0) {
      const orderMap = new Map(workflowSectionOrder.map((name, idx) => [name, idx]));
      all.sort((a, b) => {
        const idxA = orderMap.has(a) ? orderMap.get(a)! : 999;
        const idxB = orderMap.has(b) ? orderMap.get(b)! : 999;
        return idxA - idxB;
      });
    }
    return all;
  }, [standardWorkflowSections, customWorkflowSections, stepConfigs, workflowSectionOrder]);

  // ==========================================
  // FILTERED SECTION-GROUPED DATA
  // ==========================================
  const filteredEmpSections = useMemo(() => {
    return allEmpSections
      .map((sec) => {
        const fields = unifiedEmployeeFields.filter((f) => {
          if (f.section !== sec) return false;
          if (empFilterPolicy === 'mandatory' && !f.required) return false;
          if (empFilterPolicy === 'optional' && f.required) return false;
          if (empSearch.trim()) {
            const q = empSearch.toLowerCase().trim();
            const match =
              f.label.toLowerCase().includes(q) ||
              f.key.toLowerCase().includes(q) ||
              f.type.toLowerCase().includes(q);
            if (!match) return false;
          }
          return true;
        });

        return {
          name: sec,
          isCustom: !standardEmpSections.includes(sec),
          fields,
          totalCount: unifiedEmployeeFields.filter((f) => f.section === sec).length
        };
      })
      .filter((sec) => {
        if (empFilterSection !== 'all' && sec.name !== empFilterSection) return false;
        if (empSearch.trim() && sec.fields.length === 0) return false;
        return true;
      });
  }, [allEmpSections, unifiedEmployeeFields, empSearch, empFilterPolicy, empFilterSection, standardEmpSections]);

  const filteredAssetSections = useMemo(() => {
    return allAssetSections
      .map((sec) => {
        const fields = assetFields.filter((f) => {
          if (f.section !== sec) return false;
          if (assetFilterPolicy === 'mandatory' && !f.required) return false;
          if (assetFilterPolicy === 'optional' && f.required) return false;
          if (assetSearch.trim()) {
            const q = assetSearch.toLowerCase().trim();
            const match =
              f.label.toLowerCase().includes(q) ||
              f.key.toLowerCase().includes(q) ||
              f.type.toLowerCase().includes(q);
            if (!match) return false;
          }
          return true;
        });

        return {
          name: sec,
          isCustom: !standardAssetSections.includes(sec),
          fields,
          totalCount: assetFields.filter((f) => f.section === sec).length
        };
      })
      .filter((sec) => {
        if (assetFilterSection !== 'all' && sec.name !== assetFilterSection) return false;
        if (assetSearch.trim() && sec.fields.length === 0) return false;
        return true;
      });
  }, [allAssetSections, assetFields, assetSearch, assetFilterPolicy, assetFilterSection, standardAssetSections]);

  const filteredWorkflowSections = useMemo(() => {
    return allWorkflowSections
      .map((sec) => {
        const steps = stepConfigs.filter((s) => {
          if (s.category !== sec) return false;
          if (stepFilterPolicy === 'mandatory' && !s.required) return false;
          if (stepFilterPolicy === 'optional' && s.required) return false;
          if (stepSearch.trim()) {
            const q = stepSearch.toLowerCase().trim();
            const match =
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q);
            if (!match) return false;
          }
          return true;
        });

        return {
          name: sec,
          isCustom: !standardWorkflowSections.includes(sec),
          steps,
          totalCount: stepConfigs.filter((s) => s.category === sec).length
        };
      })
      .filter((sec) => {
        if (stepFilterSection !== 'all' && sec.name !== stepFilterSection) return false;
        if (stepSearch.trim() && sec.steps.length === 0) return false;
        return true;
      });
  }, [allWorkflowSections, stepConfigs, stepSearch, stepFilterPolicy, stepFilterSection, standardWorkflowSections]);

  // ==========================================
  // HANDLERS: Section Management
  // ==========================================
  const handleOpenAddSectionModal = (targetTab?: ConfigModuleTab) => {
    const tab = targetTab || activeTab;
    setAddSectionModalTab(tab);
    setNewSectionModalName('');
    setShowAddSectionModal(tab);
  };

  const handleSaveNewSectionModal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = cleanStepPrefix(newSectionModalName.trim());
    if (!trimmed || !addSectionModalTab) return;

    const moduleLabel =
      addSectionModalTab === 'employee'
        ? 'Add Employee'
        : addSectionModalTab === 'assets'
        ? 'Add Assets'
        : 'Onboarding Workflow';

    if (addSectionModalTab === 'employee' && allEmpSections.includes(trimmed)) {
      info('Section Exists', `Section "${trimmed}" already exists.`);
      return;
    }
    if (addSectionModalTab === 'assets' && allAssetSections.includes(trimmed)) {
      info('Section Exists', `Section "${trimmed}" already exists.`);
      return;
    }
    if (addSectionModalTab === 'steps' && allWorkflowSections.includes(trimmed)) {
      info('Category Exists', `Category "${trimmed}" already exists.`);
      return;
    }

    setActionConfirmation({
      title: 'Create New Section',
      message: `Are you sure you want to add the section "${trimmed}" under ${moduleLabel}?`,
      confirmLabel: 'Create Section',
      variant: 'info',
      onConfirm: () => {
        if (addSectionModalTab === 'employee') {
          const updated = [...customEmpSections, trimmed];
          setCustomEmpSections(updated);
          localStorage.setItem('quantira_employee_custom_sections', JSON.stringify(updated));
        } else if (addSectionModalTab === 'assets') {
          const updated = [...customAssetSections, trimmed];
          setCustomAssetSections(updated);
          localStorage.setItem('quantira_asset_custom_sections', JSON.stringify(updated));
        } else if (addSectionModalTab === 'steps') {
          const updated = [...customWorkflowSections, trimmed];
          setCustomWorkflowSections(updated);
          localStorage.setItem('quantira_workflow_custom_sections', JSON.stringify(updated));
        }

        success('Section Created', `Section "${trimmed}" created successfully.`);
        setShowAddSectionModal(null);
        setNewSectionModalName('');
      }
    });
  };

  const handleDeleteSection = (tab: ConfigModuleTab, sectionName: string) => {
    let count = 0;
    if (tab === 'employee') {
      count = unifiedEmployeeFields.filter((f) => f.section === sectionName).length;
    } else if (tab === 'assets') {
      count = assetFields.filter((f) => f.section === sectionName).length;
    } else if (tab === 'steps') {
      count = stepConfigs.filter((s) => s.category === sectionName).length;
    }
    setSectionToDelete({ tab, name: sectionName, count });
  };

  const confirmDeleteSection = () => {
    if (!sectionToDelete) return;
    const { tab, name } = sectionToDelete;

    if (tab === 'employee') {
      const updatedSections = customEmpSections.filter((s) => s !== name);
      setCustomEmpSections(updatedSections);
      localStorage.setItem('quantira_employee_custom_sections', JSON.stringify(updatedSections));
      const updatedCustom = customFields.filter((f) => f.step !== name);
      setCustomFields(updatedCustom);
      saveCustomFields(updatedCustom);
    } else if (tab === 'assets') {
      const updatedSections = customAssetSections.filter((s) => s !== name);
      setCustomAssetSections(updatedSections);
      localStorage.setItem('quantira_asset_custom_sections', JSON.stringify(updatedSections));
      const updatedFields = assetFields.filter((f) => f.section !== name);
      setAssetFields(updatedFields);
      saveAssetFieldConfigs(updatedFields);
    } else if (tab === 'steps') {
      const updatedSections = customWorkflowSections.filter((s) => s !== name);
      setCustomWorkflowSections(updatedSections);
      localStorage.setItem('quantira_workflow_custom_sections', JSON.stringify(updatedSections));
      const updatedSteps = stepConfigs.filter((s) => s.category !== name).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
      setStepConfigs(updatedSteps);
      localStorage.setItem(
        'quantira_step_configs',
        JSON.stringify(updatedSteps.map((s) => ({ id: s.stepNumber, name: s.name, description: s.description, enabled: s.enabled, required: s.required, category: s.category })))
      );
    }

    success('Section Removed', `Section "${name}" and its custom items were removed.`);
    setSectionToDelete(null);
  };

  // Collapse / Expand All Helpers
  const toggleCollapseAll = (tab: ConfigModuleTab) => {
    if (tab === 'employee') {
      const allCollapsed = allEmpSections.every((sec) => collapsedSections[`emp_${sec}`]);
      const next: Record<string, boolean> = { ...collapsedSections };
      allEmpSections.forEach((sec) => {
        next[`emp_${sec}`] = !allCollapsed;
      });
      setCollapsedSections(next);
    } else if (tab === 'assets') {
      const allCollapsed = allAssetSections.every((sec) => collapsedSections[`ast_${sec}`]);
      const next: Record<string, boolean> = { ...collapsedSections };
      allAssetSections.forEach((sec) => {
        next[`ast_${sec}`] = !allCollapsed;
      });
      setCollapsedSections(next);
    } else if (tab === 'steps') {
      const allCollapsed = allWorkflowSections.every((sec) => collapsedSections[`step_${sec}`]);
      const next: Record<string, boolean> = { ...collapsedSections };
      allWorkflowSections.forEach((sec) => {
        next[`step_${sec}`] = !allCollapsed;
      });
      setCollapsedSections(next);
    }
  };

  // ==========================================
  // DRAG AND DROP & MOVE ANYWHERE STATE
  // ==========================================
  const [draggedItem, setDraggedItem] = useState<{
    type: 'empField' | 'assetField' | 'step' | 'empSection' | 'assetSection' | 'workflowSection';
    id: string;
    section?: string;
  } | null>(null);

  const [dragOverTarget, setDragOverTarget] = useState<{
    type: 'empField' | 'assetField' | 'step' | 'empSection' | 'assetSection' | 'workflowSection';
    id: string;
    section?: string;
  } | null>(null);

  // 1. Move Employee Field Anywhere (within section, across sections, or to exact index)
  const handleMoveEmployeeFieldAnywhere = (
    fieldId: string,
    fromSection: string,
    toSection: string,
    targetIndex: number
  ) => {
    const field = unifiedEmployeeFields.find((f) => f.id === fieldId);
    if (!field) return;

    if (fromSection !== toSection && field.isCustom) {
      const updatedCustom = customFields.map((cf) =>
        cf.id === fieldId ? { ...cf, step: toSection } : cf
      );
      setCustomFields(updatedCustom);
      saveCustomFields(updatedCustom);
    }

    const newFullOrder: string[] = [];
    allEmpSections.forEach((secName) => {
      if (secName === toSection) {
        const targetSecFields = unifiedEmployeeFields
          .filter((f) => (f.id === fieldId ? fromSection === toSection : f.section === secName && f.id !== fieldId))
          .map((f) => f.id);
        const clampedIdx = Math.max(0, Math.min(targetIndex, targetSecFields.length));
        targetSecFields.splice(clampedIdx, 0, fieldId);
        targetSecFields.forEach((id) => newFullOrder.push(id));
      } else if (secName === fromSection && fromSection !== toSection) {
        const srcSecFields = unifiedEmployeeFields
          .filter((f) => f.section === secName && f.id !== fieldId)
          .map((f) => f.id);
        srcSecFields.forEach((id) => newFullOrder.push(id));
      } else {
        const otherFields = unifiedEmployeeFields
          .filter((f) => f.section === secName && f.id !== fieldId)
          .map((f) => f.id);
        otherFields.forEach((id) => newFullOrder.push(id));
      }
    });

    setEmployeeFieldOrder(newFullOrder);
    saveEmployeeFieldOrder(newFullOrder);
    success(
      'Field Sequence Updated',
      `Moved "${field.label}" to position #${targetIndex + 1}${fromSection !== toSection ? ` in section "${toSection}"` : ''}. Form layout updated.`
    );
  };

  // Step Move Up / Down relative
  const handleMoveEmployeeField = (field: UnifiedEmployeeField, direction: 'up' | 'down', sectionFields: UnifiedEmployeeField[]) => {
    const currentIdx = sectionFields.findIndex((f) => f.id === field.id);
    if (currentIdx === -1) return;
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= sectionFields.length) return;
    handleMoveEmployeeFieldAnywhere(field.id, field.section, field.section, targetIdx);
  };

  const handleMoveEmployeeFieldToTop = (field: UnifiedEmployeeField) => {
    handleMoveEmployeeFieldAnywhere(field.id, field.section, field.section, 0);
  };

  const handleMoveEmployeeFieldToBottom = (field: UnifiedEmployeeField, sectionFields: UnifiedEmployeeField[]) => {
    handleMoveEmployeeFieldAnywhere(field.id, field.section, field.section, sectionFields.length - 1);
  };

  // 2. Move Asset Field Anywhere
  const handleMoveAssetFieldAnywhere = (
    fieldId: string,
    fromSection: string,
    toSection: string,
    targetIndex: number
  ) => {
    const field = assetFields.find((f) => f.id === fieldId);
    if (!field) return;

    const updatedAssetFields: AssetFieldConfig[] = [];
    allAssetSections.forEach((secName) => {
      if (secName === toSection) {
        const targetSecFields = assetFields.filter((f) => f.section === secName && f.id !== fieldId);
        const movedField: AssetFieldConfig = { ...field, section: toSection };
        const clampedIdx = Math.max(0, Math.min(targetIndex, targetSecFields.length));
        targetSecFields.splice(clampedIdx, 0, movedField);
        targetSecFields.forEach((f) => updatedAssetFields.push(f));
      } else if (secName === fromSection && fromSection !== toSection) {
        const srcSecFields = assetFields.filter((f) => f.section === secName && f.id !== fieldId);
        srcSecFields.forEach((f) => updatedAssetFields.push(f));
      } else {
        const otherFields = assetFields.filter((f) => f.section === secName && f.id !== fieldId);
        otherFields.forEach((f) => updatedAssetFields.push(f));
      }
    });

    setAssetFields(updatedAssetFields);
    saveAssetFieldConfigs(updatedAssetFields);
    success(
      'Specification Reordered',
      `Moved "${field.label}" to position #${targetIndex + 1}${fromSection !== toSection ? ` in category "${toSection}"` : ''}. Form layout updated.`
    );
  };

  const handleMoveAssetField = (field: AssetFieldConfig, direction: 'up' | 'down', sectionFields: AssetFieldConfig[]) => {
    const currentIdx = sectionFields.findIndex((f) => f.id === field.id);
    if (currentIdx === -1) return;
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= sectionFields.length) return;
    handleMoveAssetFieldAnywhere(field.id, field.section, field.section, targetIdx);
  };

  const handleMoveAssetFieldToTop = (field: AssetFieldConfig) => {
    handleMoveAssetFieldAnywhere(field.id, field.section, field.section, 0);
  };

  const handleMoveAssetFieldToBottom = (field: AssetFieldConfig, sectionFields: AssetFieldConfig[]) => {
    handleMoveAssetFieldAnywhere(field.id, field.section, field.section, sectionFields.length - 1);
  };

  // 3. Move Step Anywhere (to exact index or category)
  const handleMoveStepAnywhere = (
    stepId: string,
    targetIndex: number,
    toCategory?: string
  ) => {
    const step = stepConfigs.find((s) => s.id === stepId);
    if (!step) return;

    const remaining = stepConfigs.filter((s) => s.id !== stepId);
    const clampedIdx = Math.max(0, Math.min(targetIndex, remaining.length));
    const movedStep = toCategory ? { ...step, category: toCategory } : step;
    remaining.splice(clampedIdx, 0, movedStep);

    const reNumbered = remaining.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setStepConfigs(reNumbered);
    localStorage.setItem(
      'quantira_step_configs',
      JSON.stringify(reNumbered.map((s) => ({ id: s.stepNumber, name: s.name, description: s.description, enabled: s.enabled, required: s.required, category: s.category })))
    );
    window.dispatchEvent(new CustomEvent('quantira_step_configs_updated', { detail: reNumbered }));
    success(
      'Step Sequence Updated',
      `Moved "${step.name}" to Step #${clampedIdx + 1}${toCategory && toCategory !== step.category ? ` in category "${toCategory}"` : ''}.`
    );
  };

  const handleMoveStep = (step: OnboardingStepRecord, direction: 'up' | 'down') => {
    const currentIdx = stepConfigs.findIndex((s) => s.id === step.id);
    if (currentIdx === -1) return;
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= stepConfigs.length) return;
    handleMoveStepAnywhere(step.id, targetIdx);
  };

  const handleMoveStepToTop = (step: OnboardingStepRecord) => {
    handleMoveStepAnywhere(step.id, 0);
  };

  const handleMoveStepToBottom = (step: OnboardingStepRecord) => {
    handleMoveStepAnywhere(step.id, stepConfigs.length - 1);
  };

  // 4. Move Section Anywhere
  const handleMoveSectionAnywhere = (tab: ConfigModuleTab, sectionName: string, targetIndex: number) => {
    if (tab === 'employee') {
      const remaining = allEmpSections.filter((s) => s !== sectionName);
      const clamped = Math.max(0, Math.min(targetIndex, remaining.length));
      remaining.splice(clamped, 0, sectionName);
      setEmpSectionOrder(remaining);
      saveEmployeeSectionOrder(remaining);
      success('Section Reordered', `Moved section "${sectionName}" to position #${clamped + 1}.`);
    } else if (tab === 'assets') {
      const remaining = allAssetSections.filter((s) => s !== sectionName);
      const clamped = Math.max(0, Math.min(targetIndex, remaining.length));
      remaining.splice(clamped, 0, sectionName);
      setAssetSectionOrder(remaining);
      saveAssetSectionOrder(remaining);
      success('Section Reordered', `Moved section "${sectionName}" to position #${clamped + 1}.`);
    } else if (tab === 'steps') {
      const remaining = allWorkflowSections.filter((s) => s !== sectionName);
      const clamped = Math.max(0, Math.min(targetIndex, remaining.length));
      remaining.splice(clamped, 0, sectionName);
      setWorkflowSectionOrder(remaining);
      saveWorkflowSectionOrder(remaining);
      success('Category Reordered', `Moved category "${sectionName}" to position #${clamped + 1}.`);
    }
  };

  const handleMoveSection = (tab: ConfigModuleTab, sectionName: string, direction: 'up' | 'down') => {
    if (tab === 'employee') {
      const idx = allEmpSections.indexOf(sectionName);
      if (idx === -1) return;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= allEmpSections.length) return;
      handleMoveSectionAnywhere('employee', sectionName, targetIdx);
    } else if (tab === 'assets') {
      const idx = allAssetSections.indexOf(sectionName);
      if (idx === -1) return;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= allAssetSections.length) return;
      handleMoveSectionAnywhere('assets', sectionName, targetIdx);
    } else if (tab === 'steps') {
      const idx = allWorkflowSections.indexOf(sectionName);
      if (idx === -1) return;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= allWorkflowSections.length) return;
      handleMoveSectionAnywhere('steps', sectionName, targetIdx);
    }
  };

  // ==========================================
  // UNIFIED ADD MODAL / BUILDER OPENERS
  // ==========================================
  const handleOpenUnifiedAddModal = (targetTab?: ConfigModuleTab, defaultSection?: string) => {
    const tab = targetTab || activeTab;

    if (tab === 'employee') {
      setBuilderState({
        isOpen: true,
        targetTab: 'employee',
        initialField: null,
        defaultSection: defaultSection || allEmpSections[0] || 'Personal Info'
      });
      return;
    }

    if (tab === 'assets') {
      setBuilderState({
        isOpen: true,
        targetTab: 'assets',
        initialField: null,
        defaultSection: defaultSection || allAssetSections[0] || 'Hardware Identity'
      });
      return;
    }

    if (tab === 'steps') {
      setAddFieldModalTab('steps');
      setNewStepName('');
      setNewStepDesc('');
      setNewStepCategory(defaultSection || allWorkflowSections[0] || 'Identity');
      setIsNewStepCustomCategory(false);
      setNewStepCustomCategoryInput('');
      setNewStepRequired(true);
      setShowUnifiedAddFieldModal(true);
    }
  };

  // ==========================================
  // HANDLERS: Employee Fields
  // ==========================================
  const toggleEmployeeFieldRequired = (field: UnifiedEmployeeField) => {
    setActionConfirmation({
      title: 'Update Requirement Policy',
      message: `Are you sure you want to change "${field.label}" to ${!field.required ? 'Mandatory (Required)' : 'Optional'}?`,
      confirmLabel: 'Update Policy',
      variant: 'warning',
      onConfirm: () => {
        if (field.isCustom) {
          const updated = customFields.map((cf) =>
            cf.id === field.id ? { ...cf, required: !cf.required } : cf
          );
          setCustomFields(updated);
          saveCustomFields(updated);
        } else {
          const updated = standardFields.map((sf) =>
            sf.key === field.key ? { ...sf, required: !sf.required } : sf
          );
          setStandardFields(updated);
          saveStandardFieldConfigs(updated);
        }
        success('Requirement Updated', `Updated policy for ${field.label}.`);
      }
    });
  };

  const toggleEmployeeFieldEnabled = (field: UnifiedEmployeeField) => {
    if (field.isCustom) return;
    setActionConfirmation({
      title: 'Update Field Visibility',
      message: `Are you sure you want to ${field.enabled ? 'disable' : 'enable'} the field "${field.label}"?`,
      confirmLabel: field.enabled ? 'Disable Field' : 'Enable Field',
      variant: 'warning',
      onConfirm: () => {
        const updated = standardFields.map((sf) =>
          sf.key === field.key ? { ...sf, enabled: !sf.enabled } : sf
        );
        setStandardFields(updated);
        saveStandardFieldConfigs(updated);
        success('Visibility Updated', `${field.label} is now ${!field.enabled ? 'Enabled' : 'Disabled'}.`);
      }
    });
  };

  const handleAddCustomEmployeeField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpFieldLabel.trim()) return;

    let targetSection = cleanStepPrefix(newEmpFieldStep);
    if (isNewEmpCustomSection || newEmpFieldStep === '__NEW__') {
      const customSec = cleanStepPrefix(newEmpCustomSectionInput.trim());
      if (!customSec) return;
      targetSection = customSec;
    }

    const fieldLabel = newEmpFieldLabel.trim();
    const fieldKey = newEmpFieldKey.trim() || fieldLabel.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const isCustomSec = isNewEmpCustomSection || newEmpFieldStep === '__NEW__';
    const customSecInput = cleanStepPrefix(newEmpCustomSectionInput.trim());

    setActionConfirmation({
      title: 'Confirm Add Custom Field',
      message: `Add new custom field "${fieldLabel}" to section "${targetSection}"?`,
      confirmLabel: 'Add Field',
      variant: 'info',
      onConfirm: () => {
        if (isCustomSec && customSecInput && !customEmpSections.includes(customSecInput)) {
          const updatedSecs = [...customEmpSections, customSecInput];
          setCustomEmpSections(updatedSecs);
          localStorage.setItem('quantira_employee_custom_sections', JSON.stringify(updatedSecs));
        }

        const newField: CustomProfileField = {
          id: `cf-${Date.now()}`,
          label: fieldLabel,
          key: fieldKey,
          type: newEmpFieldType,
          step: targetSection,
          required: newEmpFieldRequired,
          permission: 'Employee Editable',
          showInAddEmployee: true,
          showInOnboarding: true,
          showInProfile: true
        };

        const updated = [...customFields, newField];
        setCustomFields(updated);
        saveCustomFields(updated);

        setNewEmpFieldLabel('');
        setNewEmpFieldKey('');
        setIsNewEmpCustomSection(false);
        setNewEmpCustomSectionInput('');
        setShowUnifiedAddFieldModal(false);
        success('Custom Field Added', `Added ${newField.label} under section "${targetSection}".`);
      }
    });
  };

  const handleOpenEditEmployeeField = (field: UnifiedEmployeeField) => {
    const cf = customFields.find((f) => f.id === field.id);
    if (!cf) return;
    setBuilderState({
      isOpen: true,
      targetTab: 'employee',
      initialField: cf
    });
  };

  const handleSaveEditEmployeeField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployeeField || !editEmpLabel.trim()) return;

    let targetSection = cleanStepPrefix(editEmpStep);
    const isCustomSec = isEditEmpCustomSection || editEmpStep === '__NEW__';
    const customSecInput = cleanStepPrefix(editEmpCustomSectionInput.trim());
    if (isCustomSec) {
      if (!customSecInput) return;
      targetSection = customSecInput;
    }

    const fieldLabel = editEmpLabel.trim();
    const fieldType = editEmpType;
    const fieldReq = editEmpRequired;
    const editingId = editingEmployeeField.id;

    setActionConfirmation({
      title: 'Confirm Save Changes',
      message: `Save updates to custom field "${fieldLabel}" in section "${targetSection}"?`,
      confirmLabel: 'Save Changes',
      variant: 'info',
      onConfirm: () => {
        if (isCustomSec && customSecInput && !customEmpSections.includes(customSecInput)) {
          const updatedSecs = [...customEmpSections, customSecInput];
          setCustomEmpSections(updatedSecs);
          localStorage.setItem('quantira_employee_custom_sections', JSON.stringify(updatedSecs));
        }

        const updated = customFields.map((cf) =>
          cf.id === editingId
            ? {
                ...cf,
                label: fieldLabel,
                type: fieldType,
                step: targetSection,
                required: fieldReq
              }
            : cf
        );
        setCustomFields(updated);
        saveCustomFields(updated);
        setEditingEmployeeField(null);
        success('Custom Field Updated', `Saved changes to "${fieldLabel}".`);
      }
    });
  };

  // ==========================================
  // HANDLERS: Asset Fields
  // ==========================================
  const toggleAssetFieldRequired = (field: AssetFieldConfig) => {
    setActionConfirmation({
      title: 'Update Requirement Policy',
      message: `Are you sure you want to mark "${field.label}" as ${!field.required ? 'Mandatory' : 'Optional'}?`,
      confirmLabel: 'Update Policy',
      variant: 'warning',
      onConfirm: () => {
        const updated = assetFields.map((af) =>
          af.id === field.id ? { ...af, required: !af.required } : af
        );
        setAssetFields(updated);
        saveAssetFieldConfigs(updated);
        success('Requirement Updated', `Updated policy for ${field.label}.`);
      }
    });
  };

  const toggleAssetFieldEnabled = (field: AssetFieldConfig) => {
    setActionConfirmation({
      title: 'Update Field Visibility',
      message: `Are you sure you want to ${field.enabled ? 'disable' : 'enable'} the asset field "${field.label}"?`,
      confirmLabel: field.enabled ? 'Disable Field' : 'Enable Field',
      variant: 'warning',
      onConfirm: () => {
        const updated = assetFields.map((af) =>
          af.id === field.id ? { ...af, enabled: !af.enabled } : af
        );
        setAssetFields(updated);
        saveAssetFieldConfigs(updated);
        success('Visibility Updated', `${field.label} is now ${!field.enabled ? 'Enabled' : 'Disabled'}.`);
      }
    });
  };

  const handleAddCustomAssetField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetFieldLabel.trim()) return;

    let targetSection = newAssetFieldSection;
    const isCustomSec = isNewAssetCustomSection || newAssetFieldSection === '__NEW__';
    const customSecInput = newAssetCustomSectionInput.trim();
    if (isCustomSec) {
      if (!customSecInput) return;
      targetSection = customSecInput;
    }

    const fieldLabel = newAssetFieldLabel.trim();
    const fieldKey = newAssetFieldKey.trim() || fieldLabel.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    setActionConfirmation({
      title: 'Confirm Add Asset Attribute',
      message: `Add new asset field "${fieldLabel}" under section "${targetSection}"?`,
      confirmLabel: 'Add Field',
      variant: 'info',
      onConfirm: () => {
        if (isCustomSec && customSecInput && !customAssetSections.includes(customSecInput)) {
          const updatedSecs = [...customAssetSections, customSecInput];
          setCustomAssetSections(updatedSecs);
          localStorage.setItem('quantira_asset_custom_sections', JSON.stringify(updatedSecs));
        }

        const newField: AssetFieldConfig = {
          id: `ast-c-${Date.now()}`,
          label: fieldLabel,
          key: fieldKey,
          section: targetSection,
          type: newAssetFieldType,
          required: newAssetFieldRequired,
          enabled: true
        };

        const updated = [...assetFields, newField];
        setAssetFields(updated);
        saveAssetFieldConfigs(updated);

        setNewAssetFieldLabel('');
        setNewAssetFieldKey('');
        setIsNewAssetCustomSection(false);
        setNewAssetCustomSectionInput('');
        setShowUnifiedAddFieldModal(false);
        success('Asset Field Added', `Added ${newField.label} under section "${targetSection}".`);
      }
    });
  };

  const handleOpenEditAssetField = (field: AssetFieldConfig) => {
    setBuilderState({
      isOpen: true,
      targetTab: 'assets',
      initialField: field
    });
  };

  const handleSaveFromBuilder = (fieldData: any, newSection?: string) => {
    if (!builderState) return;

    if (builderState.targetTab === 'employee') {
      if (newSection && !customEmpSections.includes(newSection) && !standardEmpSections.includes(newSection)) {
        const updatedSecs = [...customEmpSections, newSection];
        setCustomEmpSections(updatedSecs);
        localStorage.setItem('quantira_employee_custom_sections', JSON.stringify(updatedSecs));
      }

      const isEdit = Boolean(builderState.initialField && builderState.initialField.id);
      let updated: CustomProfileField[];

      if (isEdit) {
        updated = customFields.map((cf) =>
          cf.id === builderState.initialField?.id ? { ...cf, ...fieldData } : cf
        );
        success('Custom Field Updated', `"${fieldData.label}" has been updated.`);
      } else {
        updated = [...customFields, fieldData as CustomProfileField];
        success('Custom Field Created', `"${fieldData.label}" deployed under "${fieldData.step}".`);
      }

      setCustomFields(updated);
      saveCustomFields(updated);
    } else if (builderState.targetTab === 'assets') {
      if (newSection && !customAssetSections.includes(newSection) && !standardAssetSections.includes(newSection)) {
        const updatedSecs = [...customAssetSections, newSection];
        setCustomAssetSections(updatedSecs);
        localStorage.setItem('quantira_asset_custom_sections', JSON.stringify(updatedSecs));
      }

      const isEdit = Boolean(builderState.initialField && builderState.initialField.id);
      let updated: AssetFieldConfig[];

      if (isEdit) {
        updated = assetFields.map((af) =>
          af.id === builderState.initialField?.id ? { ...af, ...fieldData } : af
        );
        success('Asset Field Updated', `"${fieldData.label}" has been updated.`);
      } else {
        updated = [...assetFields, fieldData as AssetFieldConfig];
        success('Asset Field Created', `"${fieldData.label}" deployed under "${fieldData.section}".`);
      }

      setAssetFields(updated);
      saveAssetFieldConfigs(updated);
    }

    setBuilderState(null);
  };

  const handleSaveEditAssetField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssetField || !editAssetLabel.trim()) return;

    let targetSection = editAssetSection;
    const isCustomSec = isEditAssetCustomSection || editAssetSection === '__NEW__';
    const customSecInput = editAssetCustomSectionInput.trim();
    if (isCustomSec) {
      if (!customSecInput) return;
      targetSection = customSecInput;
    }

    const fieldLabel = editAssetLabel.trim();
    const fieldType = editAssetType;
    const fieldReq = editAssetRequired;
    const editingId = editingAssetField.id;

    setActionConfirmation({
      title: 'Confirm Save Changes',
      message: `Save updates to asset field "${fieldLabel}" in section "${targetSection}"?`,
      confirmLabel: 'Save Changes',
      variant: 'info',
      onConfirm: () => {
        if (isCustomSec && customSecInput && !customAssetSections.includes(customSecInput)) {
          const updatedSecs = [...customAssetSections, customSecInput];
          setCustomAssetSections(updatedSecs);
          localStorage.setItem('quantira_asset_custom_sections', JSON.stringify(updatedSecs));
        }

        const updated = assetFields.map((af) =>
          af.id === editingId
            ? {
                ...af,
                label: fieldLabel,
                section: targetSection,
                type: fieldType,
                required: fieldReq
              }
            : af
        );
        setAssetFields(updated);
        saveAssetFieldConfigs(updated);
        setEditingAssetField(null);
        success('Asset Field Updated', `Saved changes to "${fieldLabel}".`);
      }
    });
  };

  // ==========================================
  // HANDLERS: Steps
  // ==========================================
  const toggleStepRequired = (stepId: string) => {
    const target = stepConfigs.find((s) => s.id === stepId);
    setActionConfirmation({
      title: 'Update Gatekeeper Policy',
      message: `Are you sure you want to make "${target?.name || 'this step'}" ${!target?.required ? 'Mandatory' : 'Optional'}?`,
      confirmLabel: 'Update Policy',
      variant: 'warning',
      onConfirm: () => {
        const updated = stepConfigs.map((s) => (s.id === stepId ? { ...s, required: !s.required } : s));
        setStepConfigs(updated);
        localStorage.setItem(
          'quantira_step_configs',
          JSON.stringify(updated.map((s) => ({ id: s.stepNumber, name: s.name, description: s.description, enabled: s.enabled, required: s.required, category: s.category })))
        );
        success('Step Requirement Updated', 'Mandatory step policy saved.');
      }
    });
  };

  const toggleStepEnabled = (stepId: string) => {
    const target = stepConfigs.find((s) => s.id === stepId);
    setActionConfirmation({
      title: 'Update Step Status',
      message: `Are you sure you want to ${target?.enabled ? 'disable' : 'enable'} onboarding step "${target?.name || ''}"?`,
      confirmLabel: target?.enabled ? 'Disable Step' : 'Enable Step',
      variant: 'warning',
      onConfirm: () => {
        const updated = stepConfigs.map((s) => (s.id === stepId ? { ...s, enabled: !s.enabled } : s));
        setStepConfigs(updated);
        localStorage.setItem(
          'quantira_step_configs',
          JSON.stringify(updated.map((s) => ({ id: s.stepNumber, name: s.name, description: s.description, enabled: s.enabled, required: s.required, category: s.category })))
        );
        success('Step Workflow Updated', 'Onboarding step workflow updated.');
      }
    });
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName.trim()) return;

    let targetCategory = newStepCategory;
    const isCustomCat = isNewStepCustomCategory || newStepCategory === '__NEW__';
    const customCatInput = newStepCustomCategoryInput.trim();
    if (isCustomCat) {
      if (!customCatInput) return;
      targetCategory = customCatInput;
    }

    const stepName = newStepName.trim();
    const stepDesc = newStepDesc.trim() || 'Custom onboarding workflow step gate';
    const stepReq = newStepRequired;

    setActionConfirmation({
      title: 'Confirm Add Workflow Step',
      message: `Add onboarding step "${stepName}" under category "${targetCategory}"?`,
      confirmLabel: 'Add Step',
      variant: 'info',
      onConfirm: () => {
        if (isCustomCat && customCatInput && !customWorkflowSections.includes(customCatInput)) {
          const updatedSecs = [...customWorkflowSections, customCatInput];
          setCustomWorkflowSections(updatedSecs);
          localStorage.setItem('quantira_workflow_custom_sections', JSON.stringify(updatedSecs));
        }

        const newStep: OnboardingStepRecord = {
          id: `step-${Date.now()}`,
          stepNumber: stepConfigs.length + 1,
          name: stepName,
          category: targetCategory,
          description: stepDesc,
          required: stepReq,
          enabled: true
        };

        const updated = [...stepConfigs, newStep];
        setStepConfigs(updated);
        localStorage.setItem(
          'quantira_step_configs',
          JSON.stringify(updated.map((s) => ({ id: s.stepNumber, name: s.name, description: s.description, enabled: s.enabled, required: s.required, category: s.category })))
        );
        setShowUnifiedAddFieldModal(false);
        success('Step Added', `"${newStep.name}" added to section "${targetCategory}".`);
      }
    });
  };

  const handleOpenEditStep = (step: OnboardingStepRecord) => {
    setEditingStep(step);
    setEditStepName(step.name);
    setEditStepDesc(step.description);
    setEditStepCategory(step.category);
    setIsEditStepCustomCategory(false);
    setEditStepCustomCategoryInput('');
    setEditStepRequired(step.required);
  };

  const handleSaveEditStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep || !editStepName.trim()) return;

    let targetCategory = editStepCategory;
    const isCustomCat = isEditStepCustomCategory || editStepCategory === '__NEW__';
    const customCatInput = editStepCustomCategoryInput.trim();
    if (isCustomCat) {
      if (!customCatInput) return;
      targetCategory = customCatInput;
    }

    const stepName = editStepName.trim();
    const stepDesc = editStepDesc.trim();
    const stepReq = editStepRequired;
    const editingId = editingStep.id;

    setActionConfirmation({
      title: 'Confirm Update Workflow Step',
      message: `Save changes to onboarding step "${stepName}" in category "${targetCategory}"?`,
      confirmLabel: 'Save Step',
      variant: 'info',
      onConfirm: () => {
        if (isCustomCat && customCatInput && !customWorkflowSections.includes(customCatInput)) {
          const updatedSecs = [...customWorkflowSections, customCatInput];
          setCustomWorkflowSections(updatedSecs);
          localStorage.setItem('quantira_workflow_custom_sections', JSON.stringify(updatedSecs));
        }

        const updated = stepConfigs.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: stepName,
                description: stepDesc,
                category: targetCategory,
                required: stepReq
              }
            : s
        );

        setStepConfigs(updated);
        localStorage.setItem(
          'quantira_step_configs',
          JSON.stringify(updated.map((s) => ({ id: s.stepNumber, name: s.name, description: s.description, enabled: s.enabled, required: s.required, category: s.category })))
        );
        setEditingStep(null);
        success('Step Updated', `Saved changes to "${stepName}".`);
      }
    });
  };

  const confirmDeleteStep = () => {
    if (!stepToDelete) return;
    const updated = stepConfigs
      .filter((s) => s.id !== stepToDelete.id)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setStepConfigs(updated);
    localStorage.setItem(
      'quantira_step_configs',
      JSON.stringify(updated.map((s) => ({ id: s.stepNumber, name: s.name, description: s.description, enabled: s.enabled, required: s.required, category: s.category })))
    );
    setStepToDelete(null);
    info('Step Removed', 'Onboarding step deleted from workflow.');
  };

  // Delete Custom Field handler
  const confirmDeleteField = () => {
    if (!fieldToDelete) return;
    if (fieldToDelete.isAsset) {
      const updated = assetFields.filter((f) => f.id !== fieldToDelete.id);
      setAssetFields(updated);
      saveAssetFieldConfigs(updated);
    } else {
      const updated = customFields.filter((f) => f.id !== fieldToDelete.id);
      setCustomFields(updated);
      saveCustomFields(updated);
    }
    setFieldToDelete(null);
    info('Field Removed', 'Custom configuration field was deleted.');
  };

  // Dedicated Full-Page Custom Field Builder View
  if (builderState?.isOpen) {
    return (
      <CustomFieldBuilderView
        initialField={builderState.initialField}
        targetModule={builderState.targetTab}
        availableSections={builderState.targetTab === 'employee' ? allEmpSections : allAssetSections}
        standardSections={builderState.targetTab === 'employee' ? standardEmpSections : standardAssetSections}
        onSave={handleSaveFromBuilder}
        onCancel={() => setBuilderState(null)}
      />
    );
  }

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-16">
      {/* Top Header */}
      <PageHeader
        title="Enterprise System Configurations & Module Customizer"
        description="Configure form specifications, operational requirements, mandatory policies, and dynamic attributes across all enterprise modules."
      />

      {/* Top Executive KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {activeTab === 'employee' ? 'Configured Fields' : activeTab === 'assets' ? 'Hardware Specs' : 'Workflow Steps'}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'employee' ? unifiedEmployeeFields.length : activeTab === 'assets' ? assetFields.length : stepConfigs.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            {activeTab === 'employee' ? <Users className="w-5 h-5" /> : activeTab === 'assets' ? <Laptop className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Mandatory Gates
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {activeTab === 'employee'
                ? unifiedEmployeeFields.filter((f) => f.required).length
                : activeTab === 'assets'
                ? assetFields.filter((f) => f.required).length
                : stepConfigs.filter((s) => s.required).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {activeTab === 'steps' ? 'Active in Flow' : 'Dynamic Custom'}
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {activeTab === 'employee'
                ? customFields.length
                : activeTab === 'assets'
                ? assetFields.filter((f) => f.id.startsWith('ast-c-')).length
                : stepConfigs.filter((s) => s.enabled).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Form Sections
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {activeTab === 'employee' ? allEmpSections.length : activeTab === 'assets' ? allAssetSections.length : allWorkflowSections.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Module Selector Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('employee')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'employee'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Add Employee</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'employee' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {unifiedEmployeeFields.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Add Assets</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'assets' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {assetFields.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'steps'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Onboarding Workflow</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'steps' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {stepConfigs.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. ADD EMPLOYEE FIELDS CONFIGURATION                     */}
      {/* ======================================================== */}
      {activeTab === 'employee' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search fields across sections..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {empSearch && (
                  <button
                    type="button"
                    onClick={() => setEmpSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={empFilterPolicy}
                onChange={(e) => setEmpFilterPolicy(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Policies</option>
                <option value="mandatory">Mandatory Only</option>
                <option value="optional">Optional Only</option>
              </select>

              <select
                value={empFilterSection}
                onChange={(e) => setEmpFilterSection(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Sections ({allEmpSections.length})</option>
                {allEmpSections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => toggleCollapseAll('employee')}
                className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
              >
                Toggle Sections
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenAddSectionModal('employee')}
                leftIcon={<FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                className="font-semibold text-xs border-slate-300 dark:border-slate-700"
              >
                Add Section
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenUnifiedAddModal('employee')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                Add Custom Field
              </Button>
            </div>
          </div>

          {/* Section Grouped Tables (No Icons in Table) */}
          {filteredEmpSections.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">No matching sections or fields</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search query or filter options.</p>
              {(empSearch || empFilterPolicy !== 'all' || empFilterSection !== 'all') && (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => { setEmpSearch(''); setEmpFilterPolicy('all'); setEmpFilterSection('all'); }}
                  className="mt-3 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredEmpSections.map((sec) => {
                const isCollapsed = Boolean(collapsedSections[`emp_${sec.name}`]);
                return (
                  <div
                    key={sec.name}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                      <div
                        className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0"
                        onClick={() => toggleCollapseSection(`emp_${sec.name}`)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform"
                          title={isCollapsed ? 'Expand section' : 'Collapse section'}
                        >
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {sec.name}
                            </h4>
                            {sec.isCustom ? (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                Custom Section
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200/80 text-slate-700 dark:bg-slate-700/80 dark:text-slate-300">
                                Standard Section
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {sec.fields.length} {sec.fields.length === 1 ? 'field' : 'fields'} configured
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* Move Section Controls */}
                        <div className="flex items-center gap-0.5 mr-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <button
                            type="button"
                            disabled={allEmpSections.indexOf(sec.name) === 0}
                            onClick={() => handleMoveSection('employee', sec.name, 'up')}
                            className={`p-1 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors ${
                              allEmpSections.indexOf(sec.name) === 0 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Move Section Up (Changes Form Layout Sequence)"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={allEmpSections.indexOf(sec.name) === allEmpSections.length - 1}
                            onClick={() => handleMoveSection('employee', sec.name, 'down')}
                            className={`p-1 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors ${
                              allEmpSections.indexOf(sec.name) === allEmpSections.length - 1 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Move Section Down (Changes Form Layout Sequence)"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenUnifiedAddModal('employee', sec.name)}
                          leftIcon={<Plus className="w-3 h-3" />}
                          className="text-xs font-semibold hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Add Field
                        </Button>
                        {sec.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSection('employee', sec.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Delete Custom Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fields Table (No icons in cells) */}
                    {!isCollapsed && (
                      <div>
                        {sec.fields.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                            No fields in this section yet.{' '}
                            <button
                              type="button"
                              onClick={() => handleOpenUnifiedAddModal('employee', sec.name)}
                              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-1 cursor-pointer"
                            >
                              + Add a field now
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200/70 dark:border-slate-800 tracking-wider whitespace-nowrap">
                                <tr>
                                  <th className="py-3 px-3 min-w-[110px] text-center whitespace-nowrap">Order</th>
                                  <th className="py-3 px-4 min-w-[280px] whitespace-nowrap">Field Label &amp; Attribute</th>
                                  <th className="py-3 px-4 min-w-[220px] whitespace-nowrap">System Database Key</th>
                                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Data Type</th>
                                  <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">Module Scope</th>
                                  <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">Access Permission</th>
                                  <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Rules / Constraints</th>
                                  <th className="py-3 px-4 min-w-[140px] text-center whitespace-nowrap">Requirement</th>
                                  <th className="py-3 px-4 min-w-[130px] text-center whitespace-nowrap">Visibility</th>
                                  <th className="py-3 px-4 min-w-[120px] text-right whitespace-nowrap">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                                {sec.fields.map((field, fIdx) => (
                                  <tr
                                    key={field.id}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.dataTransfer.dropEffect = 'move';
                                      if (draggedItem && draggedItem.id !== field.id) {
                                        setDragOverTarget({ type: 'empField', id: field.id, section: sec.name });
                                      }
                                    }}
                                    onDragLeave={() => {
                                      if (dragOverTarget?.id === field.id) {
                                        setDragOverTarget(null);
                                      }
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (draggedItem && draggedItem.type === 'empField' && draggedItem.id !== field.id) {
                                        handleMoveEmployeeFieldAnywhere(draggedItem.id, draggedItem.section || sec.name, sec.name, fIdx);
                                      }
                                      setDraggedItem(null);
                                      setDragOverTarget(null);
                                    }}
                                    className={`transition-colors ${
                                      dragOverTarget?.id === field.id
                                        ? 'bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500 ring-inset'
                                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                                    }`}
                                  >
                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                      <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                        {/* Drag Handle */}
                                        <div
                                          draggable
                                          onDragStart={(e) => {
                                            e.dataTransfer.setData('text/plain', field.id);
                                            setDraggedItem({ type: 'empField', id: field.id, section: sec.name });
                                          }}
                                          onDragEnd={() => {
                                            setDraggedItem(null);
                                            setDragOverTarget(null);
                                          }}
                                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                          title="Drag & Drop anywhere to reorder"
                                        >
                                          <GripVertical className="w-3.5 h-3.5" />
                                        </div>

                                        <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                                          #{fIdx + 1}
                                        </span>
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-slate-900 dark:text-white truncate text-sm">
                                            {field.label}
                                          </span>
                                          {field.isCustom ? (
                                            <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                              Custom
                                            </span>
                                          ) : (
                                            <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                              Core
                                            </span>
                                          )}
                                        </div>
                                        {field.helpText ? (
                                          <span className="text-[11px] text-slate-400 truncate max-w-xs" title={field.helpText}>
                                            {field.helpText}
                                          </span>
                                        ) : (
                                          <span className="text-[11px] text-slate-400">
                                            {field.isCustom ? 'Runtime dynamic attribute' : 'Standard enterprise profile field'}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleCopyKey(field.id, field.key)}
                                        className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer"
                                        title="Click to copy database key"
                                      >
                                        <span>{field.key}</span>
                                        {copiedKeyId === field.id ? (
                                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3 text-blue-400 group-hover:text-blue-600 opacity-60 group-hover:opacity-100" />
                                        )}
                                      </button>
                                    </td>

                                    <td className="py-3 px-4 whitespace-nowrap">
                                      {renderDataTypeBadge(field.type)}
                                    </td>

                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {field.showInAddEmployee !== false && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50" title="Visible in HR Add Employee form">
                                            Add Emp
                                          </span>
                                        )}
                                        {field.showInOnboarding !== false && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50" title="Visible in Candidate Onboarding portal">
                                            Onboard
                                          </span>
                                        )}
                                        {field.showInProfile !== false && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50" title="Visible in Employee Profile & Directory">
                                            Profile
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    <td className="py-3 px-4 whitespace-nowrap">
                                      {renderPermissionBadge(field.permission)}
                                    </td>

                                    <td className="py-3 px-4 whitespace-nowrap">
                                      {renderFieldConstraints(field)}
                                    </td>

                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => toggleEmployeeFieldRequired(field)}
                                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                          field.required
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-200'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                      >
                                        {field.required ? 'Mandatory' : 'Optional'}
                                      </button>
                                    </td>

                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                      <button
                                        type="button"
                                        disabled={field.isCustom}
                                        onClick={() => toggleEmployeeFieldEnabled(field)}
                                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                          field.isCustom ? 'opacity-80 cursor-default' : 'cursor-pointer'
                                        } ${
                                          field.enabled
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200'
                                        }`}
                                      >
                                        {field.enabled ? 'Enabled' : 'Disabled'}
                                      </button>
                                    </td>

                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                      {!field.isCustom ? (
                                        <span className="text-xs text-slate-400 italic">
                                          System Core
                                        </span>
                                      ) : (
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditEmployeeField(field)}
                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                            title="Edit in Custom Field Builder"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setFieldToDelete({ id: field.id, label: field.label, isAsset: false })}
                                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Delete Custom Field"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ADD ASSETS / IT INVENTORY MODULE                      */}
      {/* ======================================================== */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search asset specs across sections..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {assetSearch && (
                  <button
                    type="button"
                    onClick={() => setAssetSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={assetFilterPolicy}
                onChange={(e) => setAssetFilterPolicy(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Policies</option>
                <option value="mandatory">Mandatory Only</option>
                <option value="optional">Optional Only</option>
              </select>

              <select
                value={assetFilterSection}
                onChange={(e) => setAssetFilterSection(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Sections ({allAssetSections.length})</option>
                {allAssetSections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => toggleCollapseAll('assets')}
                className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
              >
                Toggle Sections
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenAddSectionModal('assets')}
                leftIcon={<FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                className="font-semibold text-xs border-slate-300 dark:border-slate-700"
              >
                Add Section
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenUnifiedAddModal('assets')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                Add Asset Field
              </Button>
            </div>
          </div>

          {/* Section Grouped Tables (No Icons in Table) */}
          {filteredAssetSections.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">No matching asset specifications</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search query or filter options.</p>
              {(assetSearch || assetFilterPolicy !== 'all' || assetFilterSection !== 'all') && (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => { setAssetSearch(''); setAssetFilterPolicy('all'); setAssetFilterSection('all'); }}
                  className="mt-3 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredAssetSections.map((sec) => {
                const isCollapsed = Boolean(collapsedSections[`ast_${sec.name}`]);
                return (
                  <div
                    key={sec.name}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                      <div
                        className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0"
                        onClick={() => toggleCollapseSection(`ast_${sec.name}`)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform"
                          title={isCollapsed ? 'Expand section' : 'Collapse section'}
                        >
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {sec.name}
                            </h4>
                            {sec.isCustom ? (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                Custom Section
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200/80 text-slate-700 dark:bg-slate-700/80 dark:text-slate-300">
                                Standard Section
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {sec.fields.length} {sec.fields.length === 1 ? 'specification' : 'specifications'} configured
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* Move Section Controls */}
                        <div className="flex items-center gap-0.5 mr-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <button
                            type="button"
                            disabled={allAssetSections.indexOf(sec.name) === 0}
                            onClick={() => handleMoveSection('assets', sec.name, 'up')}
                            className={`p-1 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors ${
                              allAssetSections.indexOf(sec.name) === 0 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Move Section Up (Changes Asset Form Layout)"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={allAssetSections.indexOf(sec.name) === allAssetSections.length - 1}
                            onClick={() => handleMoveSection('assets', sec.name, 'down')}
                            className={`p-1 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors ${
                              allAssetSections.indexOf(sec.name) === allAssetSections.length - 1 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Move Section Down (Changes Asset Form Layout)"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenUnifiedAddModal('assets', sec.name)}
                          leftIcon={<Plus className="w-3 h-3" />}
                          className="text-xs font-semibold hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Add Field
                        </Button>
                        {sec.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSection('assets', sec.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Delete Custom Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fields Table (No icons in cells) */}
                    {!isCollapsed && (
                      <div>
                        {sec.fields.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                            No specifications in this section yet.{' '}
                            <button
                              type="button"
                              onClick={() => handleOpenUnifiedAddModal('assets', sec.name)}
                              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-1 cursor-pointer"
                            >
                              + Add a specification now
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200/70 dark:border-slate-800 tracking-wider whitespace-nowrap">
                                <tr>
                                  <th className="py-3 px-3 min-w-[110px] text-center whitespace-nowrap">Order</th>
                                  <th className="py-3 px-4 min-w-[280px] whitespace-nowrap">Specification &amp; Attribute</th>
                                  <th className="py-3 px-4 min-w-[220px] whitespace-nowrap">System Database Key</th>
                                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Data Type</th>
                                  <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Rules / Constraints</th>
                                  <th className="py-3 px-4 min-w-[140px] text-center whitespace-nowrap">Requirement</th>
                                  <th className="py-3 px-4 min-w-[130px] text-center whitespace-nowrap">Visibility</th>
                                  <th className="py-3 px-4 min-w-[120px] text-right whitespace-nowrap">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                                {sec.fields.map((field, fIdx) => {
                                  const isCustom = field.id.startsWith('ast-c-') || field.id.startsWith('cf-');
                                  return (
                                    <tr
                                      key={field.id}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        if (draggedItem && draggedItem.id !== field.id) {
                                          setDragOverTarget({ type: 'assetField', id: field.id, section: sec.name });
                                        }
                                      }}
                                      onDragLeave={() => {
                                        if (dragOverTarget?.id === field.id) {
                                          setDragOverTarget(null);
                                        }
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggedItem && draggedItem.type === 'assetField' && draggedItem.id !== field.id) {
                                          handleMoveAssetFieldAnywhere(draggedItem.id, draggedItem.section || sec.name, sec.name, fIdx);
                                        }
                                        setDraggedItem(null);
                                        setDragOverTarget(null);
                                      }}
                                      className={`transition-colors ${
                                        dragOverTarget?.id === field.id
                                          ? 'bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500 ring-inset'
                                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                                      }`}
                                    >
                                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                          {/* Drag Handle */}
                                          <div
                                            draggable
                                            onDragStart={(e) => {
                                              e.dataTransfer.setData('text/plain', field.id);
                                              setDraggedItem({ type: 'assetField', id: field.id, section: sec.name });
                                            }}
                                            onDragEnd={() => {
                                              setDraggedItem(null);
                                              setDragOverTarget(null);
                                            }}
                                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                            title="Drag & Drop anywhere to reorder"
                                          >
                                            <GripVertical className="w-3.5 h-3.5" />
                                          </div>

                                          <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                                            #{fIdx + 1}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex flex-col min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-900 dark:text-white truncate text-sm">
                                              {field.label}
                                            </span>
                                            {isCustom ? (
                                              <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                                Custom
                                              </span>
                                            ) : (
                                              <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                Core
                                              </span>
                                            )}
                                          </div>
                                          {field.helpText ? (
                                            <span className="text-[11px] text-slate-400 truncate max-w-xs" title={field.helpText}>
                                              {field.helpText}
                                            </span>
                                          ) : (
                                            <span className="text-[11px] text-slate-400">
                                              {isCustom ? 'Runtime dynamic IT asset specification' : 'Standard enterprise hardware attribute'}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <button
                                          type="button"
                                          onClick={() => handleCopyKey(field.id, field.key)}
                                          className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer"
                                          title="Click to copy database key"
                                        >
                                          <span>{field.key}</span>
                                          {copiedKeyId === field.id ? (
                                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3 h-3 text-blue-400 group-hover:text-blue-600 opacity-60 group-hover:opacity-100" />
                                          )}
                                        </button>
                                      </td>

                                      <td className="py-3 px-4 whitespace-nowrap">
                                        {renderDataTypeBadge(field.type)}
                                      </td>

                                      <td className="py-3 px-4 whitespace-nowrap">
                                        {renderFieldConstraints(field)}
                                      </td>

                                      <td className="py-3 px-4 text-center whitespace-nowrap">
                                        <button
                                          type="button"
                                          onClick={() => toggleAssetFieldRequired(field)}
                                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                            field.required
                                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-200'
                                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                          }`}
                                        >
                                          {field.required ? 'Mandatory' : 'Optional'}
                                        </button>
                                      </td>

                                      <td className="py-3 px-4 text-center whitespace-nowrap">
                                        <button
                                          type="button"
                                          onClick={() => toggleAssetFieldEnabled(field)}
                                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                            field.enabled
                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200'
                                          }`}
                                        >
                                          {field.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                      </td>

                                      <td className="py-3 px-4 text-right whitespace-nowrap">
                                        {!isCustom ? (
                                          <span className="text-xs text-slate-400 italic">
                                            System Core
                                          </span>
                                        ) : (
                                          <div className="flex items-center justify-end gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditAssetField(field)}
                                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                              title="Edit in Custom Field Builder"
                                            >
                                              <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setFieldToDelete({ id: field.id, label: field.label, isAsset: true })}
                                              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                              title="Delete Custom Asset Field"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ONBOARDING WORKFLOW STEPS                             */}
      {/* ======================================================== */}
      {activeTab === 'steps' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search workflow steps across categories..."
                  value={stepSearch}
                  onChange={(e) => setStepSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {stepSearch && (
                  <button
                    type="button"
                    onClick={() => setStepSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={stepFilterPolicy}
                onChange={(e) => setStepFilterPolicy(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Gate Policies</option>
                <option value="mandatory">Mandatory Gates</option>
                <option value="optional">Optional Steps</option>
              </select>

              <select
                value={stepFilterSection}
                onChange={(e) => setStepFilterSection(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Categories ({allWorkflowSections.length})</option>
                {allWorkflowSections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => toggleCollapseAll('steps')}
                className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
              >
                Toggle Sections
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenAddSectionModal('steps')}
                leftIcon={<FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                className="font-semibold text-xs border-slate-300 dark:border-slate-700"
              >
                Add Category
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenUnifiedAddModal('steps')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
              >
                Add Step
              </Button>
            </div>
          </div>

          {/* Section Grouped Tables (No Icons in Table) */}
          {filteredWorkflowSections.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">No matching onboarding steps</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search query or gate filter options.</p>
              {(stepSearch || stepFilterPolicy !== 'all' || stepFilterSection !== 'all') && (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => { setStepSearch(''); setStepFilterPolicy('all'); setStepFilterSection('all'); }}
                  className="mt-3 text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredWorkflowSections.map((sec) => {
                const isCollapsed = Boolean(collapsedSections[`step_${sec.name}`]);
                return (
                  <div
                    key={sec.name}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                      <div
                        className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0"
                        onClick={() => toggleCollapseSection(`step_${sec.name}`)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform"
                          title={isCollapsed ? 'Expand section' : 'Collapse section'}
                        >
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {sec.name}
                            </h4>
                            {sec.isCustom ? (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                Custom Category
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200/80 text-slate-700 dark:bg-slate-700/80 dark:text-slate-300">
                                Standard Category
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {sec.steps.length} {sec.steps.length === 1 ? 'step' : 'steps'} configured
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* Move Category Controls */}
                        <div className="flex items-center gap-0.5 mr-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <button
                            type="button"
                            disabled={allWorkflowSections.indexOf(sec.name) === 0}
                            onClick={() => handleMoveSection('steps', sec.name, 'up')}
                            className={`p-1 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors ${
                              allWorkflowSections.indexOf(sec.name) === 0 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Move Category Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={allWorkflowSections.indexOf(sec.name) === allWorkflowSections.length - 1}
                            onClick={() => handleMoveSection('steps', sec.name, 'down')}
                            className={`p-1 rounded text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors ${
                              allWorkflowSections.indexOf(sec.name) === allWorkflowSections.length - 1 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Move Category Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => handleOpenUnifiedAddModal('steps', sec.name)}
                          leftIcon={<Plus className="w-3 h-3" />}
                          className="text-xs font-semibold hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          Add Step
                        </Button>
                        {sec.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSection('steps', sec.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Delete Custom Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Steps Table (No icons in cells) */}
                    {!isCollapsed && (
                      <div>
                        {sec.steps.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                            No workflow steps in this category yet.{' '}
                            <button
                              type="button"
                              onClick={() => handleOpenUnifiedAddModal('steps', sec.name)}
                              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-1 cursor-pointer"
                            >
                              + Add a step now
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200/70 dark:border-slate-800 tracking-wider whitespace-nowrap">
                                <tr>
                                  <th className="py-3 px-3 min-w-[110px] text-center whitespace-nowrap">Order</th>
                                  <th className="py-3 px-4 min-w-[320px] whitespace-nowrap">Step Name &amp; Description</th>
                                  <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Workflow Category</th>
                                  <th className="py-3 px-4 min-w-[160px] text-center whitespace-nowrap">Gate Requirement</th>
                                  <th className="py-3 px-4 min-w-[150px] text-center whitespace-nowrap">Workflow Status</th>
                                  <th className="py-3 px-4 min-w-[120px] text-right whitespace-nowrap">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                                {sec.steps.map((step) => {
                                  const isCustom = step.id.startsWith('step-custom-');
                                  const stepIndex = stepConfigs.findIndex((s) => s.id === step.id);
                                  return (
                                    <tr
                                      key={step.id}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        if (draggedItem && draggedItem.id !== step.id) {
                                          setDragOverTarget({ type: 'step', id: step.id, section: sec.name });
                                        }
                                      }}
                                      onDragLeave={() => {
                                        if (dragOverTarget?.id === step.id) {
                                          setDragOverTarget(null);
                                        }
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggedItem && draggedItem.type === 'step' && draggedItem.id !== step.id) {
                                          handleMoveStepAnywhere(draggedItem.id, stepIndex, sec.name);
                                        }
                                        setDraggedItem(null);
                                        setDragOverTarget(null);
                                      }}
                                      className={`transition-colors ${
                                        dragOverTarget?.id === step.id
                                          ? 'bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500 ring-inset'
                                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                                      }`}
                                    >
                                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
                                          {/* Drag Handle */}
                                          <div
                                            draggable
                                            onDragStart={(e) => {
                                              e.dataTransfer.setData('text/plain', step.id);
                                              setDraggedItem({ type: 'step', id: step.id, section: sec.name });
                                            }}
                                            onDragEnd={() => {
                                              setDraggedItem(null);
                                              setDragOverTarget(null);
                                            }}
                                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                            title="Drag & Drop anywhere to reorder"
                                          >
                                            <GripVertical className="w-3.5 h-3.5" />
                                          </div>

                                          <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                                            #{step.stepNumber}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <div className="flex flex-col min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                                              Step {step.stepNumber}
                                            </span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                              {step.name}
                                            </span>
                                            {isCustom ? (
                                              <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                                Custom
                                              </span>
                                            ) : (
                                              <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                Core
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {step.description}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                          {step.category}
                                        </span>
                                      </td>

                                      <td className="py-3 px-4 text-center whitespace-nowrap">
                                        <button
                                          type="button"
                                          onClick={() => toggleStepRequired(step.id)}
                                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                            step.required
                                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-200'
                                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                          }`}
                                        >
                                          {step.required ? 'Mandatory Gate' : 'Optional Step'}
                                        </button>
                                      </td>

                                      <td className="py-3 px-4 text-center whitespace-nowrap">
                                        <button
                                          type="button"
                                          onClick={() => toggleStepEnabled(step.id)}
                                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                            step.enabled
                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200'
                                          }`}
                                        >
                                          {step.enabled ? 'Active in Flow' : 'Bypassed'}
                                        </button>
                                      </td>

                                      <td className="py-3 px-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditStep(step)}
                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                            title="Edit Workflow Step"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setStepToDelete(step)}
                                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Delete Workflow Step"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Add New Section / Category                        */}
      {/* ======================================================== */}
      {showAddSectionModal && (
        <Modal
          isOpen={Boolean(showAddSectionModal)}
          onClose={() => {
            setShowAddSectionModal(null);
            setNewSectionModalName('');
          }}
          title={
            addSectionModalTab === 'employee'
              ? 'Create New Employee Section'
              : addSectionModalTab === 'assets'
              ? 'Create New Asset Section'
              : 'Create New Workflow Category'
          }
          topOffset="80px"
        >
          <form onSubmit={handleSaveNewSectionModal} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {addSectionModalTab === 'steps' ? 'Category Name' : 'Section Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                required
                autoComplete="off"
                placeholder={
                  addSectionModalTab === 'employee'
                    ? 'e.g. Benefits & Perks or Emergency Contacts'
                    : addSectionModalTab === 'assets'
                    ? 'e.g. Network Configuration or Maintenance Records'
                    : 'e.g. Training & Certifications or Department Onboarding'
                }
                value={newSectionModalName}
                onChange={(e) => setNewSectionModalName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Once created, you can organize fields or steps directly under this {addSectionModalTab === 'steps' ? 'category' : 'section'}.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddSectionModal(null);
                  setNewSectionModalName('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Create {addSectionModalTab === 'steps' ? 'Category' : 'Section'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: Unified Add Field Modal                           */}
      {/* ======================================================== */}
      {showUnifiedAddFieldModal && (
        <Modal
          isOpen={showUnifiedAddFieldModal}
          onClose={() => setShowUnifiedAddFieldModal(false)}
          title={
            addFieldModalTab === 'employee'
              ? 'Add Custom Employee Field'
              : addFieldModalTab === 'assets'
              ? 'Add Custom Asset Specification'
              : 'Add Onboarding Workflow Step'
          }
          topOffset="80px"
        >
          {/* TAB 1: ADD EMPLOYEE FIELD */}
          {addFieldModalTab === 'employee' && (
            <form onSubmit={handleAddCustomEmployeeField} className="space-y-4 text-left">
              {/* Form Section Dropdown First & Prominent */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Form Section <span className="text-rose-500">*</span></span>
                  {!isNewEmpCustomSection && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewEmpCustomSection(true);
                        setNewEmpCustomSectionInput('');
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      + Add New Section
                    </button>
                  )}
                </label>

                {!isNewEmpCustomSection ? (
                  <select
                    value={newEmpFieldStep}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsNewEmpCustomSection(true);
                        setNewEmpCustomSectionInput('');
                      } else {
                        setNewEmpFieldStep(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <optgroup label="Available Sections">
                      {allEmpSections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} {standardEmpSections.includes(sec) ? '(Standard)' : '(Custom)'}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__NEW__">+ Add Custom Section...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        required
                        placeholder="Enter new section name (e.g. Benefits & Perks)"
                        value={newEmpCustomSectionInput}
                        onChange={(e) => setNewEmpCustomSectionInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setIsNewEmpCustomSection(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Field Label <span className="text-rose-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Workstation Preference or T-Shirt Size"
                  value={newEmpFieldLabel}
                  onChange={(e) => {
                    setNewEmpFieldLabel(e.target.value);
                    if (!newEmpFieldKey) {
                      setNewEmpFieldKey(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  System Database Key
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. workstationPreference"
                  value={newEmpFieldKey}
                  onChange={(e) => setNewEmpFieldKey(e.target.value)}
                  className="w-full font-mono px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Input Data Type
                </label>
                <select
                  value={newEmpFieldType}
                  onChange={(e) => setNewEmpFieldType(e.target.value as 'text' | 'select' | 'boolean' | 'number')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="text">Text (Single Line)</option>
                  <option value="select">Dropdown Select</option>
                  <option value="boolean">Yes / No Switch</option>
                  <option value="number">Numeric</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newEmpFieldRequired"
                  checked={newEmpFieldRequired}
                  onChange={(e) => setNewEmpFieldRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="newEmpFieldRequired" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Make this field mandatory (blocks submission if empty)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowUnifiedAddFieldModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Save Employee Field
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: ADD ASSET FIELD */}
          {addFieldModalTab === 'assets' && (
            <form onSubmit={handleAddCustomAssetField} className="space-y-4 text-left">
              {/* Asset Section Dropdown First & Prominent */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Hardware Section <span className="text-rose-500">*</span></span>
                  {!isNewAssetCustomSection && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewAssetCustomSection(true);
                        setNewAssetCustomSectionInput('');
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      + Add New Section
                    </button>
                  )}
                </label>

                {!isNewAssetCustomSection ? (
                  <select
                    value={newAssetFieldSection}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsNewAssetCustomSection(true);
                        setNewAssetCustomSectionInput('');
                      } else {
                        setNewAssetFieldSection(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <optgroup label="Available Sections">
                      {allAssetSections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} {standardAssetSections.includes(sec) ? '(Standard)' : '(Custom)'}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__NEW__">+ Add Custom Section...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        required
                        placeholder="Enter new section name (e.g. Network Specs)"
                        value={newAssetCustomSectionInput}
                        onChange={(e) => setNewAssetCustomSectionInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setIsNewAssetCustomSection(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Specification Label <span className="text-rose-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Battery Cycle Count or SIM Card Slot"
                  value={newAssetFieldLabel}
                  onChange={(e) => {
                    setNewAssetFieldLabel(e.target.value);
                    if (!newAssetFieldKey) {
                      setNewAssetFieldKey(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  System Identifier Key
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. batteryCycleCount"
                  value={newAssetFieldKey}
                  onChange={(e) => setNewAssetFieldKey(e.target.value)}
                  className="w-full font-mono px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Data Format
                </label>
                <select
                  value={newAssetFieldType}
                  onChange={(e) => setNewAssetFieldType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="text">Text (Single Line)</option>
                  <option value="select">Dropdown Selection</option>
                  <option value="date">Date</option>
                  <option value="currency">Currency / Number</option>
                  <option value="textarea">Textarea / Multi-line</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newAssetFieldRequired"
                  checked={newAssetFieldRequired}
                  onChange={(e) => setNewAssetFieldRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="newAssetFieldRequired" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Make this specification mandatory for asset registration
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowUnifiedAddFieldModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Save Asset Field
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: ADD WORKFLOW STEP */}
          {addFieldModalTab === 'steps' && (
            <form onSubmit={handleAddStep} className="space-y-4 text-left">
              {/* Workflow Category Dropdown First & Prominent */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Workflow Category / Section <span className="text-rose-500">*</span></span>
                  {!isNewStepCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewStepCustomCategory(true);
                        setNewStepCustomCategoryInput('');
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      + Add New Category
                    </button>
                  )}
                </label>

                {!isNewStepCustomCategory ? (
                  <select
                    value={newStepCategory}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsNewStepCustomCategory(true);
                        setNewStepCustomCategoryInput('');
                      } else {
                        setNewStepCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <optgroup label="Available Categories">
                      {allWorkflowSections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} {standardWorkflowSections.includes(sec) ? '(Standard)' : '(Custom)'}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__NEW__">+ Add Custom Category...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        required
                        placeholder="Enter new category name (e.g. Training & Certifications)"
                        value={newStepCustomCategoryInput}
                        onChange={(e) => setNewStepCustomCategoryInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setIsNewStepCustomCategory(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Step Name <span className="text-rose-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Benefits Enrollment & 401k Setup"
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of requirements and tasks for this step..."
                  value={newStepDesc}
                  onChange={(e) => setNewStepDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newStepRequired"
                  checked={newStepRequired}
                  onChange={(e) => setNewStepRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="newStepRequired" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mandatory gatekeeper (blocks candidate onboarding progression if uncompleted)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowUnifiedAddFieldModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Save Workflow Step
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: Edit Custom Employee Field                        */}
      {/* ======================================================== */}
      {editingEmployeeField && (
        <Modal
          isOpen={Boolean(editingEmployeeField)}
          onClose={() => setEditingEmployeeField(null)}
          title={`Edit Custom Field: ${editingEmployeeField.label}`}
          topOffset="80px"
        >
          <form onSubmit={handleSaveEditEmployeeField} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Form Section</span>
                {!isEditEmpCustomSection && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditEmpCustomSection(true);
                      setEditEmpCustomSectionInput('');
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    + New Section
                  </button>
                )}
              </label>

              {!isEditEmpCustomSection ? (
                <select
                  value={editEmpStep}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsEditEmpCustomSection(true);
                      setEditEmpCustomSectionInput('');
                    } else {
                      setEditEmpStep(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <optgroup label="Available Sections">
                    {allEmpSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec} {standardEmpSections.includes(sec) ? '(Standard)' : '(Custom)'}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__NEW__">+ Add Custom Section...</option>
                </select>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      autoFocus
                      type="text"
                      required
                      placeholder="Enter new section name"
                      value={editEmpCustomSectionInput}
                      onChange={(e) => setEditEmpCustomSectionInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditEmpCustomSection(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Field Label <span className="text-rose-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                required
                autoComplete="off"
                value={editEmpLabel}
                onChange={(e) => setEditEmpLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                System Database Key (Locked)
              </label>
              <input
                type="text"
                disabled
                value={editingEmployeeField.key}
                className="w-full font-mono px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Input Data Type
              </label>
              <select
                value={editEmpType}
                onChange={(e) => setEditEmpType(e.target.value as 'text' | 'select' | 'boolean' | 'number')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="text">Text (Single Line)</option>
                <option value="select">Dropdown Select</option>
                <option value="boolean">Yes / No Switch</option>
                <option value="number">Numeric</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editEmpFieldRequired"
                checked={editEmpRequired}
                onChange={(e) => setEditEmpRequired(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="editEmpFieldRequired" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Make this field mandatory
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingEmployeeField(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Update Field
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: Edit Custom Asset Field                           */}
      {/* ======================================================== */}
      {editingAssetField && (
        <Modal
          isOpen={Boolean(editingAssetField)}
          onClose={() => setEditingAssetField(null)}
          title={`Edit Asset Specification: ${editingAssetField.label}`}
          topOffset="80px"
        >
          <form onSubmit={handleSaveEditAssetField} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Hardware Section</span>
                {!isEditAssetCustomSection && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditAssetCustomSection(true);
                      setEditAssetCustomSectionInput('');
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    + New Section
                  </button>
                )}
              </label>

              {!isEditAssetCustomSection ? (
                <select
                  value={editAssetSection}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsEditAssetCustomSection(true);
                      setEditAssetCustomSectionInput('');
                    } else {
                      setEditAssetSection(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <optgroup label="Available Sections">
                    {allAssetSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec} {standardAssetSections.includes(sec) ? '(Standard)' : '(Custom)'}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__NEW__">+ Add Custom Section...</option>
                </select>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      autoFocus
                      type="text"
                      required
                      placeholder="Enter new section name"
                      value={editAssetCustomSectionInput}
                      onChange={(e) => setEditAssetCustomSectionInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditAssetCustomSection(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Specification Label <span className="text-rose-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                required
                autoComplete="off"
                value={editAssetLabel}
                onChange={(e) => setEditAssetLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                System Identifier Key (Locked)
              </label>
              <input
                type="text"
                disabled
                value={editingAssetField.key}
                className="w-full font-mono px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Data Format
              </label>
              <select
                value={editAssetType}
                onChange={(e) => setEditAssetType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="text">Text (Single Line)</option>
                <option value="select">Dropdown Selection</option>
                <option value="date">Date</option>
                <option value="currency">Currency / Number</option>
                <option value="textarea">Textarea / Multi-line</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editAssetFieldRequired"
                checked={editAssetRequired}
                onChange={(e) => setEditAssetRequired(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="editAssetFieldRequired" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Make this specification mandatory
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingAssetField(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Update Specification
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: Edit Onboarding Step                              */}
      {/* ======================================================== */}
      {editingStep && (
        <Modal
          isOpen={Boolean(editingStep)}
          onClose={() => setEditingStep(null)}
          title={`Edit Workflow Step: ${editingStep.name}`}
          topOffset="80px"
        >
          <form onSubmit={handleSaveEditStep} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Category / Section</span>
                {!isEditStepCustomCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditStepCustomCategory(true);
                      setEditStepCustomCategoryInput('');
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    + New Category
                  </button>
                )}
              </label>

              {!isEditStepCustomCategory ? (
                <select
                  value={editStepCategory}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsEditStepCustomCategory(true);
                      setEditStepCustomCategoryInput('');
                    } else {
                      setEditStepCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <optgroup label="Available Categories">
                    {allWorkflowSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec} {standardWorkflowSections.includes(sec) ? '(Standard)' : '(Custom)'}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__NEW__">+ Add Custom Category...</option>
                </select>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      autoFocus
                      type="text"
                      required
                      placeholder="Enter new category name"
                      value={editStepCustomCategoryInput}
                      onChange={(e) => setEditStepCustomCategoryInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditStepCustomCategory(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Step Name <span className="text-rose-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                required
                autoComplete="off"
                value={editStepName}
                onChange={(e) => setEditStepName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={2}
                value={editStepDesc}
                onChange={(e) => setEditStepDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editStepRequired"
                checked={editStepRequired}
                onChange={(e) => setEditStepRequired(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="editStepRequired" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Mandatory gatekeeper
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingStep(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Update Step
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* CONFIRM DIALOG: Delete Section                           */}
      {/* ======================================================== */}
      {sectionToDelete && (
        <ConfirmDialog
          isOpen={Boolean(sectionToDelete)}
          title={`Delete Custom Section: ${sectionToDelete.name}`}
          message={`Are you sure you want to delete custom section "${sectionToDelete.name}"? ${
            sectionToDelete.count > 0
              ? `This section currently contains ${sectionToDelete.count} item(s) which will also be permanently removed.`
              : 'This section contains no items.'
          }`}
          confirmLabel="Delete Section"
          variant="danger"
          onClose={() => setSectionToDelete(null)}
          onConfirm={confirmDeleteSection}
        />
      )}

      {/* ======================================================== */}
      {/* CONFIRM DIALOG: Delete Onboarding Step                   */}
      {/* ======================================================== */}
      {stepToDelete && (
        <ConfirmDialog
          isOpen={Boolean(stepToDelete)}
          title="Delete Onboarding Step"
          message={`Are you sure you want to remove "${stepToDelete.name}" from the onboarding workflow?`}
          confirmLabel="Delete Step"
          variant="danger"
          onClose={() => setStepToDelete(null)}
          onConfirm={confirmDeleteStep}
        />
      )}

      {/* ======================================================== */}
      {/* CONFIRM DIALOG: Delete Custom Field                      */}
      {/* ======================================================== */}
      {fieldToDelete && (
        <ConfirmDialog
          isOpen={Boolean(fieldToDelete)}
          title="Delete Custom Field"
          message={`Are you sure you want to delete "${fieldToDelete.label}"? This will remove the attribute from active forms and reports.`}
          confirmLabel="Delete Field"
          variant="danger"
          onClose={() => setFieldToDelete(null)}
          onConfirm={confirmDeleteField}
        />
      )}

      {/* ======================================================== */}
      {/* CONFIRM DIALOG: Action Confirmation (Add / Edit / Policy)*/}
      {/* ======================================================== */}
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
