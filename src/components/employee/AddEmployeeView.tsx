import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Briefcase,
  Users,
  MapPin,
  Calendar,
  Building,
  AlertCircle,
  Laptop,
  Monitor,
  Headphones,
  Check,
  Search,
  Cpu,
  Layers,
  HardDrive,
  Clock,
  ChevronDown,
  Tag,
  FileText
} from 'lucide-react';
import { Button } from '../atoms';
import { Card, CardHeader, CardContent, Breadcrumbs } from '../molecules';
import { TextInput } from '../atoms';
import { Select } from '../atoms';
import { DatePicker } from '../atoms';
import { Modal } from '../organisms';
import { ConfirmDialog } from '../organisms';
import { useOnboarding } from '../../context/OnboardingContext';
import { useOnboardingFlow, INITIAL_ONBOARDING_DATA } from '../../context/OnboardingFlowContext';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';
import { Candidate, EmploymentType, WorkModel } from '../../types/candidate';
import { ITAsset } from '../../types/asset';
import { getAssets, updateAsset } from '../../services/assetService';
import { DEPARTMENTS, LOCATIONS } from '../../services/mockData';
import { OnboardingData, UploadedDocument } from '../../types/onboarding';
import { getRadianAvatarByName, getAvatarByGender } from '../../utils/radianAvatars';
import {
  getCustomFields,
  CustomProfileField,
  getStandardFieldConfigs,
  StandardFieldConfig,
  getEmployeeFieldOrder,
  getEmployeeSectionOrder
} from '../../services/customFieldsService';
import { getOnboardingStatutoryDocuments } from '../../services/corporateDocumentService';
import { DynamicCustomFieldInput } from '../customizer/DynamicCustomFieldInput';

const PREDEFINED_MANAGERS = [
  { name: 'Marcus Brody', title: 'VP of Engineering' },
  { name: 'Alexandra Wright', title: 'Director of Operations' },
  { name: 'Claire Delacroix', title: 'VP of Product' },
  { name: 'Victor Vance', title: 'VP of Design' },
  { name: 'Rachel Green', title: 'Head of Marketing' },
  { name: 'Eleanor Vance', title: 'HR Operations Lead' },
  { name: 'Sarah Jenkins', title: 'Engineering Manager' },
  { name: 'David Chen', title: 'Product Lead' },
  { name: 'Michael Chang', title: 'Head of Architecture' }
];

const STANDARD_ACCESSORIES = [
  'Ergonomic Mechanical Keyboard',
  'Precision Wireless Mouse',
  'Active Noise-Canceling Headset',
  '4K USB-C Video Webcam',
  'Dual DisplayPort Docking Station',
  'Aluminum Laptop Riser Stand'
];

export interface AddEmployeeViewProps {
  onBack: () => void;
  onEmployeeAdded?: (employee: { id: string; name: string; email: string; role: string }) => void;
}

export const AddEmployeeView: React.FC<AddEmployeeViewProps> = ({
  onBack,
  onEmployeeAdded
}) => {
  const { addCandidate, candidates, navigateTo } = useOnboarding();
  const { loadEmployee } = useOnboardingFlow();
  const { setRole } = useRole();
  const { success: showToastSuccess, error: showToastError } = useToast();

  // Onboarding Type State
  const [onboardingType, setOnboardingType] = useState<'general' | 'pre_onboarding' | 'contract' | 'contract_to_hire'>('general');
  const [targetOnboardDate, setTargetOnboardDate] = useState('');
  const [preOnboardingStage, setPreOnboardingStage] = useState('Offer Accepted');
  const [contractDuration, setContractDuration] = useState('6 Months');
  const [contractAgency, setContractAgency] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [contractRate, setContractRate] = useState('$85 / hr');
  const [contractTaxType, setContractTaxType] = useState('W-2 Contract');

  // Basic Information States
  const [employeeName, setEmployeeName] = useState('');
  const [title, setTitle] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [nationality, setNationality] = useState('United States');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [hireSource, setHireSource] = useState('Direct Application');
  const [offerReference, setOfferReference] = useState(() => `OFF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [email, setEmail] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);
  const [phone, setPhone] = useState('');
  const [contactNumber2, setContactNumber2] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [line1Manager, setLine1Manager] = useState('');
  const [line2Manager, setLine2Manager] = useState('None');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('Full-time');
  const [workModel, setWorkModel] = useState<string>('Hybrid');

  // Organization Custom Profile Fields & Section/Field Ordering (Configured by Super Admin)
  const [empSectionOrder, setEmpSectionOrder] = useState<string[]>(() => getEmployeeSectionOrder());
  const [empFieldOrder, setEmpFieldOrder] = useState<string[]>(() => getEmployeeFieldOrder());
  const [standardFields, setStandardFields] = useState<StandardFieldConfig[]>(() => getStandardFieldConfigs());
  const [customFields, setCustomFields] = useState<CustomProfileField[]>(() => {
    try {
      return getCustomFields().filter((f) => f.showInAddEmployee !== false);
    } catch {
      return [];
    }
  });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Asset Assignment States
  const [laptopModel, setLaptopModel] = useState('');
  const [monitors, setMonitors] = useState('0');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [inventoryAssets, setInventoryAssets] = useState<ITAsset[]>(() => getAssets());
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('all');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-screen Confirmation State
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [assignedAssetsSummary, setAssignedAssetsSummary] = useState<ITAsset[]>([]);

  // Refresh available inventory assets when view loads
  useEffect(() => {
    setInventoryAssets(getAssets());
  }, []);

  // Listen for Super Admin Configuration and Ordering changes in real time
  useEffect(() => {
    const handleFieldOrderUpdate = (e: any) => {
      setEmpFieldOrder(e.detail || getEmployeeFieldOrder());
    };
    const handleSectionOrderUpdate = (e: any) => {
      setEmpSectionOrder(e.detail || getEmployeeSectionOrder());
    };
    const handleFieldConfigsUpdate = (e: any) => {
      setStandardFields(e.detail || getStandardFieldConfigs());
    };
    const handleCustomFieldsUpdate = (e: any) => {
      setCustomFields(getCustomFields().filter((f) => f.showInAddEmployee !== false));
    };

    window.addEventListener('quantira_employee_field_order_updated', handleFieldOrderUpdate);
    window.addEventListener('quantira_employee_section_order_updated', handleSectionOrderUpdate);
    window.addEventListener('quantira_field_configs_updated', handleFieldConfigsUpdate);
    window.addEventListener('quantira_custom_fields_updated', handleCustomFieldsUpdate);

    return () => {
      window.removeEventListener('quantira_employee_field_order_updated', handleFieldOrderUpdate);
      window.removeEventListener('quantira_employee_section_order_updated', handleSectionOrderUpdate);
      window.removeEventListener('quantira_field_configs_updated', handleFieldConfigsUpdate);
      window.removeEventListener('quantira_custom_fields_updated', handleCustomFieldsUpdate);
    };
  }, []);

  // Filter all Laptop and Desktop machines from Central IT Inventory Hardware Catalog
  const catalogLaptops = useMemo(() => {
    return inventoryAssets.filter((a) => a.category === 'Laptop' || a.category === 'Desktop');
  }, [inventoryAssets]);

  // Dynamic dropdown options populated directly from Central IT Inventory Hardware Catalog
  const laptopOptions = useMemo(() => {
    const opts: { label: string; value: string }[] = [
      { label: 'Select Laptop / Workstation Model (Optional)...', value: '' }
    ];

    // 1. Central IT Inventory - Available in Stock (Highest Priority)
    const availableLaptops = catalogLaptops.filter((a) => a.status === 'Available');
    if (availableLaptops.length > 0) {
      availableLaptops.forEach((asset) => {
        opts.push({
          label: `[${asset.assetTag}] ${asset.name} — Available in Stock (${asset.location || 'HQ Stockroom'})`,
          value: asset.name
        });
      });
    }

    // 2. Central IT Inventory - Standard Hardware Catalog Assets
    const otherLaptops = catalogLaptops.filter((a) => a.status !== 'Available');
    otherLaptops.forEach((asset) => {
      opts.push({
        label: `[${asset.assetTag}] ${asset.name} — Catalog Standard (${asset.status})`,
        value: asset.name
      });
    });

    // 3. Fallback standard catalog models
    const fallbackModels = [
      'Apple MacBook Pro 16" (M3 Max, 36GB, 1TB SSD)',
      'Apple MacBook Pro 14" (M3 Pro, 18GB, 512GB SSD)',
      'Lenovo ThinkPad X1 Carbon Gen 11 (Core i7, 32GB)',
      'Dell Precision 5680 Workstation',
      'Dell XPS 15 (Core i9, 32GB)',
      'Custom Enterprise Workstation / BYOD'
    ];
    fallbackModels.forEach((m) => {
      if (!opts.some((o) => o.value === m)) {
        opts.push({
          label: `${m} (Enterprise Catalog)`,
          value: m
        });
      }
    });

    return opts;
  }, [catalogLaptops]);

  // Synchronize selecting a model with Central IT Inventory Catalog asset IDs
  const handleSelectLaptopModel = (modelName: string) => {
    setLaptopModel(modelName);
    if (!modelName) {
      setSelectedAssetIds((prev) => {
        return prev.filter((id) => {
          const item = inventoryAssets.find((a) => a.id === id);
          return item?.category !== 'Laptop' && item?.category !== 'Desktop';
        });
      });
      return;
    }
    const matched = catalogLaptops.find(
      (a) => a.name === modelName || modelName.includes(a.assetTag) || modelName.includes(a.name)
    );
    if (matched) {
      setSelectedAssetIds((prev) => {
        const withoutOtherLaptops = prev.filter((id) => {
          const item = inventoryAssets.find((a) => a.id === id);
          return item?.category !== 'Laptop' && item?.category !== 'Desktop';
        });
        return [...withoutOtherLaptops, matched.id];
      });
    }
  };

  // Find currently active hardware asset from Central IT Inventory Catalog
  const currentCatalogAsset = useMemo(() => {
    if (!laptopModel && selectedAssetIds.length === 0) return null;
    const fromSelected = catalogLaptops.find((a) => selectedAssetIds.includes(a.id));
    if (fromSelected) return fromSelected;
    if (!laptopModel) return null;
    return catalogLaptops.find(
      (a) => a.name === laptopModel || laptopModel.includes(a.assetTag) || a.assetTag === laptopModel
    );
  }, [catalogLaptops, selectedAssetIds, laptopModel]);

  // Dynamic list of managers for dropdowns
  const managerOptions = useMemo(() => {
    const list = [...PREDEFINED_MANAGERS];
    candidates.forEach((c) => {
      const name = `${c.firstName} ${c.lastName}`.trim();
      if (name && !list.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
        if (
          c.jobTitle?.toLowerCase().includes('manager') ||
          c.jobTitle?.toLowerCase().includes('lead') ||
          c.jobTitle?.toLowerCase().includes('director') ||
          c.jobTitle?.toLowerCase().includes('vp')
        ) {
          list.push({ name, title: c.jobTitle });
        }
      }
    });
    return [
      { label: 'Select Reporting Manager...', value: '' },
      ...list.map((m) => ({
        label: `${m.name} (${m.title})`,
        value: m.name
      }))
    ];
  }, [candidates]);

  const line2Options = useMemo(() => [
    { label: 'None / Direct Report', value: 'None' },
    ...managerOptions.filter((m) => m.value !== '')
  ], [managerOptions]);

  const handleFullNameChange = (val: string) => {
    setEmployeeName(val);
    const parts = val.trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    setFirstName(first);
    setLastName(last);
    if (!isEmailManuallyEdited) {
      const cleanFirst = first.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanLast = last.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanFirst && cleanLast) {
        setEmail(`${cleanFirst}.${cleanLast}@quantira.com`);
      } else if (cleanFirst) {
        setEmail(`${cleanFirst}@quantira.com`);
      } else {
        setEmail('');
      }
    }
  };

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const toggleSelectInventoryAsset = (asset: ITAsset) => {
    setSelectedAssetIds((prev) => {
      if (prev.includes(asset.id)) {
        return prev.filter((id) => id !== asset.id);
      } else {
        if (asset.category === 'Laptop' || asset.category === 'Desktop') {
          setLaptopModel(asset.name);
        }
        return [...prev, asset.id];
      }
    });
  };

  // Filter available inventory assets
  const availableInventory = useMemo(() => {
    return inventoryAssets.filter((a) => {
      const isAvailable = a.status === 'Available' || selectedAssetIds.includes(a.id);
      const matchesCategory =
        assetCategoryFilter === 'all' || a.category.toLowerCase() === assetCategoryFilter.toLowerCase();
      const matchesSearch =
        !assetSearchQuery ||
        a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        a.assetTag.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(assetSearchQuery.toLowerCase());
      return isAvailable && matchesCategory && matchesSearch;
    });
  }, [inventoryAssets, selectedAssetIds, assetCategoryFilter, assetSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !employeeName.trim() ||
      !email.trim() ||
      !jobTitle.trim() ||
      !line1Manager.trim() ||
      !employeeId.trim() ||
      !department.trim() ||
      !workLocation.trim() ||
      !startDate.trim()
    ) {
      setError('Please fill out all required fields: Full Name, Corporate Email, Employee ID, Department, Designation, Reporting Manager, Office Location, and Start Date.');
      showToastError('Missing Fields', 'Please complete all required fields.');
      return;
    }

    setError(null);
    setShowConfirmCreate(true);
  };

  const executeCreateEmployee = () => {
    setIsLoading(true);
    setError(null);

    const parts = employeeName.trim().split(/\s+/);
    const finalFirstName = parts[0] || 'Employee';
    const finalLastName = parts.slice(1).join(' ') || '';
    const finalName = employeeName.trim();
    const finalEmail =
      email.trim() ||
      (employeeName.trim()
        ? `${finalFirstName.toLowerCase()}.${finalLastName.toLowerCase().replace(/[^a-z0-9]/g, '')}@quantira.com`
        : 'employee@quantira.com');

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3050';
    const generatedUrl = `${origin}/?invite=${encodeURIComponent(employeeId)}&name=${encodeURIComponent(finalName)}&email=${encodeURIComponent(finalEmail)}&role=${encodeURIComponent(jobTitle.trim())}&dept=${encodeURIComponent(department)}&loc=${encodeURIComponent(workLocation)}&start=${encodeURIComponent(startDate)}&type=${encodeURIComponent(employmentType)}&l1=${encodeURIComponent(line1Manager)}&l2=${encodeURIComponent(line2Manager)}`;
    setInviteUrl(generatedUrl);

    // 1. Update selected assets in assetService to Assigned
    const assignedAssetsList: ITAsset[] = [];
    selectedAssetIds.forEach((assetId) => {
      const updated = updateAsset(assetId, {
        status: 'Assigned',
        assignedTo: {
          id: employeeId,
          name: finalName,
          email: finalEmail,
          department,
          avatarUrl: getRadianAvatarByName(finalName),
          assignedDate: startDate
        }
      });
      if (updated) {
        assignedAssetsList.push(updated);
      }
    });
    setAssignedAssetsSummary(assignedAssetsList);

    // 2. Build Candidate Record with Statutory Documents from Documents Menu
    const statutoryDocsList = getOnboardingStatutoryDocuments();
    const candidateDocs = statutoryDocsList.length > 0
      ? statutoryDocsList.map((doc) => ({
          id: `doc-${doc.id}-${employeeId}`,
          candidateId: employeeId,
          type: doc.code,
          title: doc.title,
          description: doc.description || doc.category,
          status: 'pending' as const,
          required: doc.mandatory
        }))
      : [
          {
            id: `doc-id-${Date.now()}`,
            candidateId: employeeId,
            type: 'government_id',
            title: 'Government-issued Photo ID',
            description: 'Valid passport or state driver license.',
            status: 'pending' as const,
            required: true
          },
          {
            id: `doc-offer-${Date.now()}`,
            candidateId: employeeId,
            type: 'signed_offer',
            title: 'Signed Employment Agreement',
            description: 'Countersigned official offer letter.',
            status: 'pending' as const,
            required: true
          },
          {
            id: `doc-i9-${Date.now()}`,
            candidateId: employeeId,
            type: 'i9_tax_form',
            title: 'Form I-9 & Tax Withholdings',
            description: 'Federal employment verification.',
            status: 'pending' as const,
            required: true
          }
        ];

    // 3. Pre-initialize complete Onboarding Flow Data
    const initialEquipmentList = [
      ...(laptopModel ? [laptopModel] : []),
      ...selectedAccessories,
      ...assignedAssetsList.map((a) => a.name)
    ];

    const onboardingStatutoryDocs: UploadedDocument[] = statutoryDocsList.length > 0
      ? statutoryDocsList.map((doc) => ({
          id: doc.id,
          type: doc.code,
          name: doc.title,
          required: doc.mandatory,
          status: 'pending' as const
        }))
      : INITIAL_ONBOARDING_DATA.documents;

    const initialFlow: OnboardingData = {
      ...INITIAL_ONBOARDING_DATA,
      personalInfo: {
        ...INITIAL_ONBOARDING_DATA.personalInfo,
        name: finalName,
        title,
        firstName: finalFirstName,
        middleName: middleName.trim(),
        lastName: finalLastName,
        preferredName: preferredName.trim(),
        dateOfBirth,
        gender: gender || 'Prefer not to say',
        maritalStatus,
        nationality,
        bloodGroup,
        hireSource,
        offerReference,
        email: finalEmail,
        corporateEmail: finalEmail,
        personalEmail: personalEmail.trim(),
        jobTitle: jobTitle.trim(),
        department,
        employeeId,
        startDate,
        workLocation,
        employmentType,
        workModel: (workModel as any) || (workLocation.includes('Remote') ? 'Remote' : 'Hybrid'),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        line1Manager: line1Manager.trim(),
        line2Manager: line2Manager.trim(),
        phone: phone.trim(),
        contactNumber1: phone.trim(),
        contactNumber2: contactNumber2.trim(),
        githubUsername: githubUsername.trim(),
        linkedinUrl: linkedinUrl.trim(),
        education: '',
        customFields: customFieldValues
      },
      documents: onboardingStatutoryDocs,
      corporateAccount: {
        ...INITIAL_ONBOARDING_DATA.corporateAccount,
        corporateEmail: finalEmail,
        instructions: `Your corporate Google Workspace and GitHub Enterprise accounts are provisioned under ${finalEmail}. On Day 1, you will authenticate via Okta SSO using your primary work laptop.`
      },
      emailSignature: {
        ...INITIAL_ONBOARDING_DATA.emailSignature,
        name: finalName,
        title: jobTitle.trim(),
        department,
        mobile: phone.trim()
      },
      team: {
        ...INITIAL_ONBOARDING_DATA.team,
        managerName: line1Manager.trim(),
        teamName: `${department} Team`
      },
      equipment: {
        selectedEquipment: Array.from(new Set(initialEquipmentList)),
        assignedAssets: assignedAssetsList,
        specialRequests: assignedAssetsList.length > 0
          ? `Assigned Inventory Tags: ${assignedAssetsList.map((a) => a.assetTag).join(', ')}`
          : '',
        status: 'Requested'
      },
      currentStepIndex: 0,
      completedSteps: [],
      status: 'In Progress'
    };

    const newCandidate: Candidate = {
      id: employeeId,
      name: finalName,
      title,
      firstName: finalFirstName,
      middleName: middleName.trim(),
      lastName: finalLastName,
      preferredName: preferredName.trim(),
      dateOfBirth,
      gender: gender || 'Prefer not to say',
      maritalStatus,
      nationality,
      bloodGroup,
      hireSource,
      offerReference,
      email: finalEmail,
      corporateEmail: finalEmail,
      personalEmail: personalEmail.trim(),
      phone: phone.trim(),
      contactNumber1: phone.trim(),
      contactNumber2: contactNumber2.trim(),
      githubUsername: githubUsername.trim(),
      linkedinUrl: linkedinUrl.trim(),
      address: address.trim() ? {
        street: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: nationality || 'United States'
      } : undefined,
      avatarUrl: getAvatarByGender(gender, finalName),
      status: 'invited',
      progress: 0,
      jobTitle: jobTitle.trim(),
      department,
      manager: line1Manager.trim(),
      managerEmail: `${line1Manager.trim().toLowerCase().replace(/\s+/g, '.')}@quantira.com`,
      line1Manager: line1Manager.trim(),
      line2Manager: line2Manager.trim(),
      employmentType: (employmentType || 'Full-time') as EmploymentType,
      workModel: (workModel as WorkModel) || (workLocation.includes('Remote') ? 'Remote' : 'Hybrid'),
      startDate,
      onboardingType,
      targetOnboardDate: (onboardingType === 'pre_onboarding' || onboardingType === 'contract_to_hire' || onboardingType === 'contract') ? targetOnboardDate : undefined,
      preOnboardingStage: onboardingType === 'pre_onboarding' ? preOnboardingStage : undefined,
      contractDuration: (onboardingType === 'contract_to_hire' || onboardingType === 'contract') ? contractDuration : undefined,
      contractAgency: (onboardingType === 'contract_to_hire' || onboardingType === 'contract') ? contractAgency.trim() : undefined,
      contractEndDate: onboardingType === 'contract' ? contractEndDate : undefined,
      contractRate: onboardingType === 'contract' ? contractRate : undefined,
      contractTaxType: onboardingType === 'contract' ? contractTaxType : undefined,
      conversionEligibilityDate: onboardingType === 'contract_to_hire' ? targetOnboardDate : undefined,
      isActive: true,
      isTerminated: false,
      customFields: customFieldValues,
      onboardingData: initialFlow,
      equipment: {
        laptopModel,
        monitors: parseInt(monitors, 10) || 1,
        accessories: selectedAccessories,
        softwareLicenses: ['Google Workspace', 'Okta SSO', 'Slack', 'GitHub Enterprise'],
        emailAlias: finalEmail,
        provisioningStatus: 'configured',
        notes: assignedAssetsList.length > 0
          ? `Allocated Assets: ${assignedAssetsList.map((a) => `${a.assetTag} (${a.name})`).join(', ')}`
          : undefined
      },
      documents: candidateDocs,
      tasks: [
        {
          id: `tsk-1-${Date.now()}`,
          candidateId: employeeId,
          candidateName: finalName,
          title: 'Send Welcome Packet & Invitation Link',
          description: 'Provide portal link for employee 10-step completion.',
          category: 'hr',
          priority: 'high',
          status: 'completed',
          assignee: { name: 'Eleanor Vance', avatar: '', role: 'HR Operations' },
          dueDate: startDate
        }
      ],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Candidate Profile & Assets Allocated',
          user: 'HR Operations',
          details: `Dispatched onboarding link to ${finalEmail}. Assigned ${assignedAssetsList.length} IT assets. Attached ${candidateDocs.length} statutory documents.`,
          type: 'success'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const initialAvatar = getAvatarByGender(gender, finalName);
      localStorage.setItem(`quantira_avatar_${employeeId}`, initialAvatar);
      localStorage.setItem(`quantira_profile_photo_${employeeId}`, initialAvatar);
      localStorage.setItem(`onboarding_flow_${employeeId}`, JSON.stringify(initialFlow));
      localStorage.setItem('onboarding_mvp_flow_data', JSON.stringify(initialFlow));
      localStorage.setItem('quantira_active_onboarding_id', employeeId);
      localStorage.setItem('quantira_employee_custom_values', JSON.stringify(customFieldValues));
      window.dispatchEvent(new CustomEvent('quantira_profile_photo_updated', { detail: { photoUrl: initialAvatar, candidateId: employeeId } }));
    } catch {}

    loadEmployee(employeeId, initialFlow.personalInfo);

    setTimeout(() => {
      addCandidate(newCandidate);
      setIsLoading(false);
      const created = {
        id: employeeId,
        name: finalName,
        email: finalEmail,
        role: jobTitle.trim()
      };
      setCreatedEmployee(created);
      setIsDispatched(true);
      showToastSuccess('Employee Added & Assets Assigned', `Onboarding link dispatched to ${finalEmail}.`);
      if (onEmployeeAdded) {
        onEmployeeAdded(created);
      }
    }, 400);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    showToastSuccess('Link Copied', 'Onboarding URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenAsEmployee = () => {
    if (!createdEmployee) return;
    loadEmployee(createdEmployee.id, {
      name: employeeName,
      firstName,
      lastName,
      gender: gender || 'Prefer not to say',
      email: createdEmployee.email,
      corporateEmail: createdEmployee.email,
      jobTitle,
      department,
      employeeId: createdEmployee.id,
      startDate,
      workLocation,
      employmentType,
      line1Manager,
      line2Manager
    });
    setRole('EMPLOYEE');
    navigateTo('wizard');
  };

  const handleResetForAnother = () => {
    setIsDispatched(false);
    setCreatedEmployee(null);
    setEmployeeName('');
    setFirstName('');
    setLastName('');
    setGender('');
    setEmail('');
    setIsEmailManuallyEdited(false);
    setPhone('');
    setEmployeeId('');
    setJobTitle('');
    setDepartment('');
    setWorkLocation('');
    setStartDate('');
    setEmploymentType('');
    setLine1Manager('');
    setLine2Manager('None');
    setLaptopModel('');
    setMonitors('0');
    setSelectedAccessories([]);
    setSelectedAssetIds([]);
    setAssignedAssetsSummary([]);
    setCustomFieldValues({});
    setError(null);
  };

  // =========================================================================
  // VIEW 1: IN-SCREEN CONFIRMATION STATE
  // =========================================================================
  if (isDispatched && createdEmployee) {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        {/* Success Card */}
        <Card className="shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-8 text-white text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Employee Registered &amp; Assets Assigned!
            </h2>
            <p className="text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
              The employee record has been created with assigned hardware. The personalized onboarding invitation link has been dispatched to{' '}
              <a
                href={`mailto:${createdEmployee.email}`}
                className="font-bold underline text-white hover:text-blue-200 transition-colors"
              >
                {createdEmployee.email}
              </a>.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Employee Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Employee Name</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">{createdEmployee.name}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Employee ID</span>
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 block mt-0.5">{createdEmployee.id}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Designation</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">{createdEmployee.role}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Reporting Line 1</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 block mt-0.5">{line1Manager}</span>
              </div>
            </div>

            {/* Assigned Assets Summary Box */}
            <div className="space-y-3 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                  <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Assigned Hardware &amp; IT Inventory ({assignedAssetsSummary.length + 1} items)</span>
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  Provisioned
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Laptop</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{laptopModel || 'Not assigned'}</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">External Displays</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{monitors === '0' ? 'None' : `${monitors} Monitor(s) Included`}</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accessories</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {selectedAccessories.length > 0 ? selectedAccessories.join(', ') : 'None selected'}
                  </div>
                </div>
              </div>

              {assignedAssetsSummary.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
                    Linked IT Inventory Assets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {assignedAssetsSummary.map((ast) => (
                      <span
                        key={ast.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-indigo-200 dark:border-slate-700 shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-indigo-500" />
                        <span>{ast.assetTag}</span>
                        <span className="text-slate-400 font-normal">({ast.name})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generated Invite Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Personalized Onboarding Link
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 select-all focus:outline-none"
                />
                <Button
                  type="button"
                  variant={copied ? 'secondary' : 'primary'}
                  onClick={handleCopyLink}
                  leftIcon={copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  className="text-xs font-bold shrink-0 w-full sm:w-auto"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={handleResetForAnother}
                className="text-xs font-bold w-full sm:w-auto"
              >
                Add Another Employee
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleOpenAsEmployee}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                className="bg-blue-600 hover:bg-blue-700 text-xs font-bold w-full sm:w-auto"
              >
                Open as Employee
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                className="text-xs font-bold w-full sm:w-auto"
              >
                Return to Directory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper: Section Display Metadata
  const getSectionMeta = (sectionName: string) => {
    switch (sectionName) {
      case 'Personal Info':
        return {
          icon: <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          bg: 'bg-blue-100 dark:bg-blue-950/60',
          title: 'Basic Employee Identity'
        };
      case 'Contact & Address':
        return {
          icon: <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          bg: 'bg-emerald-100 dark:bg-emerald-950/60',
          title: 'Contact Information & Residence'
        };
      case 'Role & Timeline':
        return {
          icon: <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          bg: 'bg-indigo-100 dark:bg-indigo-950/60',
          title: 'Role, Division & Timeline'
        };
      case 'Reporting Management':
        return {
          icon: <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
          bg: 'bg-purple-100 dark:bg-purple-950/60',
          title: 'Reporting Structure & Leadership'
        };
      case 'Custom Organization Profile Fields':
      default:
        return {
          icon: <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          bg: 'bg-amber-100 dark:bg-amber-950/60',
          title: sectionName
        };
    }
  };

  // Group and sort form sections and fields according to Super Admin customization & drag order
  const configuredFormSections = useMemo(() => {
    const fieldItems: any[] = [];

    // 1. Standard Fields configured in Customizer
    standardFields.forEach((sf) => {
      if (sf.enabled === false) return;
      if (sf.category === 'Onboarding') return;

      let section = 'Personal Info';
      if (['firstName', 'middleName', 'lastName', 'name', 'title', 'preferredName', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality', 'bloodGroup', 'education'].includes(sf.key)) {
        section = 'Personal Info';
      } else if (['personalEmail', 'phone', 'contactNumber1', 'contactNumber2', 'address', 'city', 'state', 'zipCode', 'emergencyContact'].includes(sf.key)) {
        section = 'Contact & Address';
      } else if (['corporateEmail', 'employeeId', 'designation', 'jobTitle', 'department', 'startDate', 'employmentType', 'workModel', 'workLocation', 'hireSource', 'offerReference'].includes(sf.key)) {
        section = 'Role & Timeline';
      } else if (['line1Manager', 'line2Manager', 'manager'].includes(sf.key)) {
        section = 'Reporting Management';
      }

      fieldItems.push({
        id: `std-${sf.key}`,
        key: sf.key,
        label: sf.label,
        section,
        required: sf.required,
        isCustom: false
      });
    });

    // 2. Custom Organization Profile Fields
    customFields.forEach((cf) => {
      if (cf.showInAddEmployee === false) return;
      const cleanSec = cf.step ? cf.step.replace(/^Step\s*\d+\s*:\s*/i, '').trim() : 'Custom Organization Profile Fields';
      fieldItems.push({
        ...cf,
        id: cf.id,
        key: cf.key,
        label: cf.label,
        section: cleanSec || 'Custom Organization Profile Fields',
        required: cf.required,
        isCustom: true
      });
    });

    // 3. Sort fields by configured employeeFieldOrder
    if (empFieldOrder.length > 0) {
      const orderMap = new Map(empFieldOrder.map((k, idx) => [k, idx]));
      fieldItems.sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : orderMap.has(a.key) ? orderMap.get(a.key)! : 9999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : orderMap.has(b.key) ? orderMap.get(b.key)! : 9999;
        return idxA - idxB;
      });
    }

    // 4. Group fields into Sections
    const sectionMap = new Map<string, any[]>();
    fieldItems.forEach((f) => {
      const sec = f.section;
      if (!sectionMap.has(sec)) {
        sectionMap.set(sec, []);
      }
      sectionMap.get(sec)!.push(f);
    });

    // 5. Sort sections by configured empSectionOrder
    const sortedSectionNames = Array.from(sectionMap.keys());
    if (empSectionOrder.length > 0) {
      const orderMap = new Map(empSectionOrder.map((name, idx) => [name, idx]));
      sortedSectionNames.sort((a, b) => {
        const idxA = orderMap.has(a) ? orderMap.get(a)! : 999;
        const idxB = orderMap.has(b) ? orderMap.get(b)! : 999;
        return idxA - idxB;
      });
    }

    return sortedSectionNames.map((secName) => ({
      name: secName,
      fields: sectionMap.get(secName)!
    }));
  }, [standardFields, customFields, empFieldOrder, empSectionOrder]);

  // Dynamic Input Component Renderer for each field
  const renderFieldInput = (field: any) => {
    const isRequired = field.required ?? false;
    const key = field.key;

    if (field.isCustom) {
      if (key === 'githubUsername') {
        return (
          <TextInput
            key={field.id || key}
            label={field.label || 'GitHub Username'}
            placeholder={field.placeholder || 'e.g. octocat'}
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            required={isRequired}
          />
        );
      }
      if (key === 'linkedInUrl' || key === 'linkedinUrl') {
        return (
          <TextInput
            key={field.id || key}
            label={field.label || 'LinkedIn Profile URL'}
            placeholder={field.placeholder || 'e.g. https://linkedin.com/in/username'}
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            required={isRequired}
          />
        );
      }
      return (
        <div key={field.id || key}>
          <DynamicCustomFieldInput
            field={field}
            value={customFieldValues[field.key] || ''}
            onChange={(val) =>
              setCustomFieldValues((prev) => ({
                ...prev,
                [field.key]: val
              }))
            }
          />
        </div>
      );
    }

    // Standard core fields
    switch (key) {
      case 'title':
        return (
          <Select
            key={key}
            label={field.label || 'Title'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            options={[
              { label: 'Mr.', value: 'Mr.' },
              { label: 'Ms.', value: 'Ms.' },
              { label: 'Mrs.', value: 'Mrs.' },
              { label: 'Dr.', value: 'Dr.' },
              { label: 'Prof.', value: 'Prof.' }
            ]}
            required={isRequired}
          />
        );

      case 'name':
        return (
          <React.Fragment key={key}>
            <TextInput
              label="First Name"
              placeholder="e.g. Vinayak"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                const newFullName = `${e.target.value} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
                setEmployeeName(newFullName);
                if (!isEmailManuallyEdited && e.target.value) {
                  const cleanFirst = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
                  setEmail(cleanLast ? `${cleanFirst}.${cleanLast}@quantira.com` : `${cleanFirst}@quantira.com`);
                  setCorporateEmail(cleanLast ? `${cleanFirst}.${cleanLast}@quantira.com` : `${cleanFirst}@quantira.com`);
                }
              }}
              required={isRequired}
            />
            <TextInput
              label="Middle Name"
              placeholder="Optional middle name"
              value={middleName}
              onChange={(e) => {
                setMiddleName(e.target.value);
                const newFullName = `${firstName} ${e.target.value ? e.target.value + ' ' : ''}${lastName}`.trim();
                setEmployeeName(newFullName);
              }}
            />
            <TextInput
              label="Last Name"
              placeholder="e.g. Sharma"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                const newFullName = `${firstName} ${middleName ? middleName + ' ' : ''}${e.target.value}`.trim();
                setEmployeeName(newFullName);
                if (!isEmailManuallyEdited && firstName) {
                  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cleanLast = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                  setEmail(cleanLast ? `${cleanFirst}.${cleanLast}@quantira.com` : `${cleanFirst}@quantira.com`);
                  setCorporateEmail(cleanLast ? `${cleanFirst}.${cleanLast}@quantira.com` : `${cleanFirst}@quantira.com`);
                }
              }}
              required={isRequired}
            />
          </React.Fragment>
        );

      case 'preferredName':
        return (
          <TextInput
            key={key}
            label={field.label || 'Preferred Name'}
            placeholder="e.g. Vinnie"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            required={isRequired}
          />
        );

      case 'dateOfBirth':
        return (
          <DatePicker
            key={key}
            label={field.label || 'Date of Birth'}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required={isRequired}
          />
        );

      case 'gender':
        return (
          <Select
            key={key}
            label={field.label || 'Gender'}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { label: 'Select Gender...', value: '' },
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Non-Binary', value: 'Non-Binary' },
              { label: 'Other', value: 'Other' },
              { label: 'Prefer not to say', value: 'Prefer not to say' }
            ]}
            required={isRequired}
          />
        );

      case 'maritalStatus':
        return (
          <Select
            key={key}
            label={field.label || 'Marital Status'}
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            options={[
              { label: 'Single', value: 'Single' },
              { label: 'Married', value: 'Married' },
              { label: 'Divorced', value: 'Divorced' },
              { label: 'Widowed', value: 'Widowed' },
              { label: 'Separated', value: 'Separated' }
            ]}
            required={isRequired}
          />
        );

      case 'nationality':
        return (
          <Select
            key={key}
            label={field.label || 'Nationality'}
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            options={[
              { label: 'United States', value: 'United States' },
              { label: 'India', value: 'India' },
              { label: 'United Kingdom', value: 'United Kingdom' },
              { label: 'Canada', value: 'Canada' },
              { label: 'Australia', value: 'Australia' },
              { label: 'Germany', value: 'Germany' },
              { label: 'Singapore', value: 'Singapore' },
              { label: 'France', value: 'France' },
              { label: 'Other', value: 'Other' }
            ]}
            required={isRequired}
          />
        );

      case 'bloodGroup':
        return (
          <Select
            key={key}
            label={field.label || 'Blood Group'}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
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
            required={isRequired}
          />
        );

      case 'corporateEmail':
      case 'email':
        return (
          <TextInput
            key={key}
            label={field.label || 'Corporate Email (SSO)'}
            type="email"
            placeholder="e.g. firstname.lastname@quantira.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setCorporateEmail(e.target.value);
              setIsEmailManuallyEdited(true);
            }}
            required={isRequired}
          />
        );

      case 'personalEmail':
        return (
          <TextInput
            key={key}
            label={field.label || 'Personal Email'}
            type="email"
            placeholder="e.g. personal.email@gmail.com"
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
            required={isRequired}
          />
        );

      case 'phone':
      case 'contactNumber1':
        return (
          <TextInput
            key={key}
            label={field.label || 'Primary Contact Phone'}
            placeholder="e.g. +1 (415) 555-0199"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required={isRequired}
          />
        );

      case 'contactNumber2':
        return (
          <TextInput
            key={key}
            label={field.label || 'Secondary Contact Phone'}
            placeholder="e.g. +1 (415) 555-0188"
            value={contactNumber2}
            onChange={(e) => setContactNumber2(e.target.value)}
            required={isRequired}
          />
        );

      case 'address':
        return (
          <TextInput
            key={key}
            label={field.label || 'Residential Street Address'}
            placeholder="e.g. 123 Tech Boulevard"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required={isRequired}
          />
        );

      case 'city':
        return (
          <TextInput
            key={key}
            label={field.label || 'Residential City'}
            placeholder="e.g. San Francisco"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required={isRequired}
          />
        );

      case 'state':
        return (
          <TextInput
            key={key}
            label={field.label || 'Residential State'}
            placeholder="e.g. California"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required={isRequired}
          />
        );

      case 'zipCode':
        return (
          <TextInput
            key={key}
            label={field.label || 'Residential Zip Code'}
            placeholder="e.g. 94105"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required={isRequired}
          />
        );

      case 'employeeId':
        return (
          <TextInput
            key={key}
            label={field.label || 'Employee ID'}
            placeholder="e.g. EMP-2026-1042"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required={isRequired}
          />
        );

      case 'department':
        return (
          <Select
            key={key}
            label={field.label || 'Department / Division'}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { label: 'Select Department...', value: '' },
              ...DEPARTMENTS.map((d) => ({ label: d, value: d }))
            ]}
            required={isRequired}
          />
        );

      case 'designation':
      case 'jobTitle':
        return (
          <TextInput
            key={key}
            label={field.label || 'Designation / Job Title'}
            placeholder="e.g. Senior Frontend Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required={isRequired}
          />
        );

      case 'workLocation':
        return (
          <Select
            key={key}
            label={field.label || 'Work Location / Office'}
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
            options={[
              { label: 'Select Office Location...', value: '' },
              ...LOCATIONS.map((l) => ({ label: l, value: l }))
            ]}
            required={isRequired}
          />
        );

      case 'employmentType':
        return (
          <Select
            key={key}
            label={field.label || 'Employment Type'}
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType | '')}
            options={[
              { label: 'Select Employment Type...', value: '' },
              { label: 'Full-time Regular', value: 'Full-time' },
              { label: 'Part-time', value: 'Part-time' },
              { label: 'Contractor', value: 'Contractor' },
              { label: 'Intern', value: 'Intern' }
            ]}
            required={isRequired}
          />
        );

      case 'workModel':
        return (
          <Select
            key={key}
            label={field.label || 'Work Model (Remote/Hybrid)'}
            value={workModel}
            onChange={(e) => setWorkModel(e.target.value)}
            options={[
              { label: 'Hybrid', value: 'Hybrid' },
              { label: 'Remote', value: 'Remote' },
              { label: 'On-site', value: 'On-site' }
            ]}
            required={isRequired}
          />
        );

      case 'startDate':
        return (
          <DatePicker
            key={key}
            label={field.label || 'Official Start Date'}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required={isRequired}
          />
        );

      case 'hireSource':
        return (
          <Select
            key={key}
            label={field.label || 'Hiring Source Channel'}
            value={hireSource}
            onChange={(e) => setHireSource(e.target.value)}
            options={[
              { label: 'Direct Application', value: 'Direct Application' },
              { label: 'LinkedIn Recruitment', value: 'LinkedIn Recruitment' },
              { label: 'Internal Referral', value: 'Internal Referral' },
              { label: 'Campus Placement', value: 'Campus Placement' },
              { label: 'Agency / Headhunter', value: 'Agency / Headhunter' }
            ]}
            required={isRequired}
          />
        );

      case 'offerReference':
        return (
          <TextInput
            key={key}
            label={field.label || 'Offer Letter Reference'}
            value={offerReference}
            onChange={(e) => setOfferReference(e.target.value)}
            required={isRequired}
          />
        );

      case 'line1Manager':
        return (
          <Select
            key={key}
            label={field.label || 'Primary Line 1 Manager'}
            value={line1Manager}
            onChange={(e) => setLine1Manager(e.target.value)}
            options={managerOptions}
            required={isRequired}
          />
        );

      case 'line2Manager':
        return (
          <Select
            key={key}
            label={field.label || 'Secondary Line 2 Manager'}
            value={line2Manager}
            onChange={(e) => setLine2Manager(e.target.value)}
            options={line2Options}
            required={isRequired}
          />
        );

      default:
        return null;
    }
  };

  // =========================================================================
  // VIEW 2: IN-SCREEN ADD EMPLOYEE FORM
  // =========================================================================
  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <Breadcrumbs
              items={[
                { label: 'Employee Directory', onClick: onBack },
                { label: 'Add New Employee', current: true }
              ]}
              onHome={onBack}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Add New Employee &amp; Assign Assets
          </h1>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300/60 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" /> HR &amp; Super Admin Authority
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Card 0: Onboarding Type Section */}
          <Card className="rounded-xl text-left overflow-hidden transition-all bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center font-bold shrink-0 text-blue-600 dark:text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Onboarding Type
                    </h3>
                  </div>
                </div>
                {onboardingType === 'contract' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-300/60 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Direct / Fixed-Term Contract
                  </span>
                ) : onboardingType === 'contract_to_hire' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300/60 shadow-2xs">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Contract to Hire
                  </span>
                ) : onboardingType === 'pre_onboarding' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/60 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Pre-onboarding Workflow
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300/60 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> General Onboarding
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Onboarding Type Select */}
                <div className="w-full flex flex-col gap-1.5 text-left">
                  <label htmlFor="onboarding_type_select" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                    <span>Onboarding Type <span className="text-rose-500 ml-0.5">*</span></span>
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="onboarding_type_select"
                      value={onboardingType}
                      onChange={(e) => {
                        const val = e.target.value as 'general' | 'pre_onboarding' | 'contract' | 'contract_to_hire';
                        setOnboardingType(val);
                        if (val === 'contract' || val === 'contract_to_hire') {
                          setEmploymentType('Contractor');
                        } else {
                          setEmploymentType('Full-time');
                        }
                        if (val === 'contract' && !contractEndDate) {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 6);
                          setContractEndDate(d.toISOString().split('T')[0]);
                        }
                        if ((val === 'pre_onboarding' || val === 'contract_to_hire' || val === 'contract') && !targetOnboardDate) {
                          const d = new Date();
                          d.setDate(d.getDate() + 14);
                          const str = d.toISOString().split('T')[0];
                          setTargetOnboardDate(str);
                          if (!startDate) setStartDate(str);
                        }
                      }}
                      className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2.5 pl-3.5 pr-10 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <option value="general">General Onboarding</option>
                      <option value="contract">Direct Contract / Fixed-Term</option>
                      <option value="contract_to_hire">Contract to Hire</option>
                      <option value="pre_onboarding">Pre-onboarding</option>
                    </select>
                    <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* If Direct Contract: Show Duration, End Date, Pay Rate, Tax Classification, Vendor/Agency */}
                {onboardingType === 'contract' && (
                  <>
                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="contract_duration" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Contract Duration <span className="text-rose-500 ml-0.5">*</span></span>
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="contract_duration"
                          value={contractDuration}
                          onChange={(e) => setContractDuration(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2.5 pl-3.5 pr-10 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                        >
                          <option value="3 Months">3 Months</option>
                          <option value="6 Months">6 Months</option>
                          <option value="9 Months">9 Months</option>
                          <option value="12 Months">12 Months</option>
                          <option value="Indefinite / SOW-based">Indefinite / SOW-based</option>
                        </select>
                        <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="contract_end_date" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Contract End Date <span className="text-rose-500 ml-0.5">*</span></span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="contract_end_date"
                          type="date"
                          value={contractEndDate}
                          onChange={(e) => setContractEndDate(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="contract_rate" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Bill / Hourly Pay Rate</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="contract_rate"
                          type="text"
                          placeholder="e.g. $85 / hr or $12,000 / mo"
                          value={contractRate}
                          onChange={(e) => setContractRate(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="contract_tax_type" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Tax Classification</span>
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="contract_tax_type"
                          value={contractTaxType}
                          onChange={(e) => setContractTaxType(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2.5 pl-3.5 pr-10 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                        >
                          <option value="W-2 Contract">W-2 Contract</option>
                          <option value="1099 Independent Contractor">1099 Independent Contractor</option>
                          <option value="Corp-to-Corp (C2C)">Corp-to-Corp (C2C)</option>
                        </select>
                        <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in sm:col-span-2">
                      <label htmlFor="contract_agency_direct" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Contracting Agency / Direct Entity Name</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="contract_agency_direct"
                          type="text"
                          placeholder="e.g. Apex Staffing, Insight Global, or Direct LLC"
                          value={contractAgency}
                          onChange={(e) => setContractAgency(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* If Pre-onboarding: Show Date to Onboard & Stage */}
                {onboardingType === 'pre_onboarding' && (
                  <>
                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="target_onboard_date" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Date to Onboard (Target Date) <span className="text-rose-500 ml-0.5">*</span></span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="target_onboard_date"
                          type="date"
                          value={targetOnboardDate}
                          onChange={(e) => {
                            setTargetOnboardDate(e.target.value);
                            setStartDate(e.target.value);
                          }}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="pre_onboarding_stage" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Pre-boarding Stage</span>
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="pre_onboarding_stage"
                          value={preOnboardingStage}
                          onChange={(e) => setPreOnboardingStage(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2.5 pl-3.5 pr-10 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                        >
                          <option value="Offer Accepted">Offer Accepted</option>
                          <option value="BGV & Document Verification">BGV &amp; Document Verification</option>
                          <option value="Hardware & Access Provisioning">Hardware &amp; Access Provisioning</option>
                          <option value="Day 1 Orientation Ready">Day 1 Orientation Ready</option>
                        </select>
                        <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </>
                )}

                {/* If Contract to Hire: Show Contract Duration, Staffing Agency, Target Conversion Date */}
                {onboardingType === 'contract_to_hire' && (
                  <>
                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="contract_duration" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Contract Duration <span className="text-rose-500 ml-0.5">*</span></span>
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="contract_duration"
                          value={contractDuration}
                          onChange={(e) => setContractDuration(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2.5 pl-3.5 pr-10 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer"
                        >
                          <option value="3 Months">3 Months</option>
                          <option value="6 Months">6 Months</option>
                          <option value="9 Months">9 Months</option>
                          <option value="12 Months">12 Months</option>
                        </select>
                        <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="contract_agency" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Staffing Agency / Vendor Partner</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="contract_agency"
                          type="text"
                          placeholder="e.g. Apex Systems, Insight Global"
                          value={contractAgency}
                          onChange={(e) => setContractAgency(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-1.5 text-left animate-fade-in">
                      <label htmlFor="target_conversion_date" className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>Target Conversion Date</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="target_conversion_date"
                          type="date"
                          value={targetOnboardDate}
                          onChange={(e) => setTargetOnboardDate(e.target.value)}
                          className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Form Sections configured from Super Admin Customizer */}
          {configuredFormSections.map((sec) => {
            const meta = getSectionMeta(sec.name);
            return (
              <Card key={sec.name} className="shadow-xs border border-slate-200 dark:border-slate-800">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center font-bold shrink-0`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {meta.title}
                      </h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sec.fields.map(renderFieldInput)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Card 4: Assign Assets & Equipment */}
        <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Assign Assets &amp; IT Equipment
                </h3>
              </div>
            </div>

            {selectedAssetIds.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                {selectedAssetIds.length} Inventory Item(s) Selected
              </span>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Quick Provisioning Package with Central IT Inventory Catalog Selection */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                    <span>
                      Primary Laptop / Workstation Model <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                    </span>
                  </label>
                  <select
                    value={laptopModel}
                    onChange={(e) => handleSelectLaptopModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  >
                    {laptopOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Select
                  label="External Displays Included"
                  value={monitors}
                  onChange={(e) => setMonitors(e.target.value)}
                  options={[
                    { label: 'None (Laptop screen only)', value: '0' },
                    { label: '1x 4K UHD UltraSharp Monitor', value: '1' },
                    { label: '2x Dual 4K Productivity Monitors', value: '2' },
                    { label: '3x Multi-display Engineering Setup', value: '3' }
                  ]}
                />
              </div>

              {/* Central IT Inventory Hardware Catalog Preview Card */}
              {currentCatalogAsset && (
                <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-linear-to-r from-indigo-50/80 via-blue-50/40 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 space-y-2.5 animate-fade-in shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.5 rounded-md border border-indigo-300 dark:border-indigo-700">
                        {currentCatalogAsset.assetTag}
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {currentCatalogAsset.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          currentCatalogAsset.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        }`}
                      >
                        {currentCatalogAsset.status === 'Available' ? '✓ Available in Stock' : currentCatalogAsset.status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {currentCatalogAsset.location}
                      </span>
                    </div>
                  </div>

                  {/* Hardware Specification Chips */}
                  {currentCatalogAsset.specifications && Object.keys(currentCatalogAsset.specifications).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {Object.entries(currentCatalogAsset.specifications).slice(0, 5).map(([specKey, specVal]) => (
                        <span
                          key={specKey}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                        >
                          <span className="text-slate-400">{specKey}:</span> <strong className="text-slate-800 dark:text-white">{specVal}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Serial Number: <strong className="font-mono text-slate-800 dark:text-slate-200">{currentCatalogAsset.serialNumber}</strong>
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Linked to Central IT Inventory Hardware Catalog
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Accessories Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Peripherals &amp; Day 1 Accessories Package
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
                {STANDARD_ACCESSORIES.map((acc) => {
                  const isChecked = selectedAccessories.includes(acc);
                  return (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{acc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Bottom Action Bar */}
        <div className="flex items-center justify-end gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            className="text-xs font-bold px-5 py-2.5 cursor-pointer"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            isLoading={isLoading}
            className="text-xs font-extrabold px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-md cursor-pointer"
          >
            Send Email &amp; Dispatch Onboarding
          </Button>
        </div>
      </form>

      {/* ======================================================== */}
      {/* MODAL: Central IT Inventory Hardware Catalog             */}
      {/* ======================================================== */}
      {showCatalogModal && (
        <Modal
          isOpen={showCatalogModal}
          onClose={() => setShowCatalogModal(false)}
          title="Central IT Inventory Hardware Catalog"
          topOffset="80px"
          size="xl"
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an available workstation or laptop from the Central IT Inventory to assign to this employee.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {catalogLaptops.map((asset) => {
                const isSelected = selectedAssetIds.includes(asset.id) || laptopModel === asset.name;
                const isAvailable = asset.status === 'Available';

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      handleSelectLaptopModel(asset.name);
                      setShowCatalogModal(false);
                      showToastSuccess('Workstation Selected', `${asset.name} (${asset.assetTag}) selected from Central IT Catalog.`);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          {asset.assetTag}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isAvailable ? '✓ In Stock' : asset.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {asset.name}
                      </h4>

                      {asset.specifications && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          {asset.specifications['Processor'] && (
                            <div><span className="text-slate-400">Processor:</span> <strong className="text-slate-700 dark:text-slate-200">{asset.specifications['Processor']}</strong></div>
                          )}
                          {asset.specifications['Memory'] && (
                            <div><span className="text-slate-400">RAM:</span> <strong className="text-slate-700 dark:text-slate-200">{asset.specifications['Memory']}</strong></div>
                          )}
                          {asset.specifications['Storage'] && (
                            <div><span className="text-slate-400">Storage:</span> <strong className="text-slate-700 dark:text-slate-200">{asset.specifications['Storage']}</strong></div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{asset.location}</span>
                      <Button
                        type="button"
                        size="xs"
                        variant={isSelected ? 'primary' : 'secondary'}
                        className={isSelected ? 'bg-indigo-600 text-white' : ''}
                      >
                        {isSelected ? '✓ Selected' : 'Select Workstation'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setShowCatalogModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog: Confirm Employee Creation */}
      {showConfirmCreate && (
        <ConfirmDialog
          isOpen={showConfirmCreate}
          onClose={() => setShowConfirmCreate(false)}
          onConfirm={() => {
            setShowConfirmCreate(false);
            executeCreateEmployee();
          }}
          title="Confirm Employee Registration"
          message={`Are you sure you want to register ${employeeName.trim()} as ${jobTitle.trim()} (${department}) with Employee ID ${employeeId}?`}
          consequence={
            selectedAssetIds.length > 0
              ? `${selectedAssetIds.length} IT hardware asset(s) will be allocated and marked as Assigned.`
              : undefined
          }
          confirmLabel="Confirm & Register"
          variant="info"
        />
      )}
    </div>
  );
};
