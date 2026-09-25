import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useOnboardingFlow } from '../../../context/OnboardingFlowContext';
import { RADIAN_PERSONA_AVATARS, getRadianAvatarByName, getAvatarByGender } from '../../../utils/radianAvatars';
import { TextInput } from '../../ui/TextInput';
import { TextArea } from '../../ui/TextArea';
import { Select } from '../../ui/Select';
import { Switch } from '../../ui/Switch';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { FormSection } from '../../ui/FormSection';
import { EmployeeIdBadge } from '../../organisms/EmployeeIdBadge';
import { ExecutiveBusinessCard } from '../../organisms/ExecutiveBusinessCard';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';
import {
  ArrowRight,
  Briefcase,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cpu,
  User,
  Sparkles,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  Car,
  Lock,
  Check,
  FileCheck,
  Tag,
  Monitor,
  Headphones,
  Laptop,
  CreditCard,
  QrCode,
  Globe
} from 'lucide-react';
import {
  getAssets,
  getAssignedAssetsForEmployee,
  ITAsset
} from '../../../services/assetService';

interface HardwareOption {
  name: string;
  category: 'laptop' | 'peripherals' | 'display' | 'audio';
  description: string;
}

const AVAILABLE_EQUIPMENT: HardwareOption[] = [
  {
    name: 'Laptop Pro 16"',
    category: 'laptop',
    description: 'Apple M3 Pro (36GB Unified RAM, 1TB SSD) or ThinkPad X1 Extreme'
  },
  {
    name: 'Laptop Pro 14"',
    category: 'laptop',
    description: 'Apple M3 Pro (18GB Unified RAM, 512GB SSD) lightweight portable'
  },
  {
    name: 'Ergonomic Keyboard',
    category: 'peripherals',
    description: 'Logitech MX Keys or Microsoft Sculpt Ergonomic split keyboard'
  },
  {
    name: 'Precision Wireless Mouse',
    category: 'peripherals',
    description: 'Logitech MX Master 3S darkfield sensor with ultra-fast scroll wheel'
  },
  {
    name: 'Dual 27" 4K UHD Monitors',
    category: 'display',
    description: 'Dell UltraSharp 4K USB-C Hub displays with daisy-chaining support'
  },
  {
    name: 'Thunderbolt 4 Docking Station',
    category: 'peripherals',
    description: 'CalDigit TS4 or Dell WD22TB4 with single cable power and multi-display'
  },
  {
    name: 'Noise-Cancelling Wireless Headset',
    category: 'audio',
    description: 'Bose QuietComfort 45 or Jabra Evolve2 75 with noise cancellation'
  }
];

export const StepGroupWorkSetup: React.FC = () => {
  const {
    data,
    updatePhoto,
    updateSignature,
    setEquipmentRequests,
    updateOfficeSetup,
    nextStep,
    prevStep
  } = useOnboardingFlow();

  const { success: showToastSuccess, error: showToastError } = useToast();

  // Photo state
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Digital Signature state
  const digitalSigInputRef = useRef<HTMLInputElement>(null);

  // Equipment state
  const [accommodationsText, setAccommodationsText] = useState(data.equipment.specialRequests || '');

  // Derived employee details
  const fullName = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim() || 'Alex Mercer';
  const employeeId = data.personalInfo.employeeId || 'EMP-2024-8902';
  const jobTitle = data.personalInfo.jobTitle || 'Software Engineer';
  const department = data.personalInfo.department || 'Engineering';

  // Dynamic Assets & Inventory Integration from Assets Menu
  const [inventoryAssets, setInventoryAssets] = useState<ITAsset[]>(() => getAssets());

  useEffect(() => {
    const handleAssetsUpdate = () => {
      setInventoryAssets(getAssets());
    };
    window.addEventListener('quantira_assets_updated', handleAssetsUpdate);
    return () => window.removeEventListener('quantira_assets_updated', handleAssetsUpdate);
  }, []);

  const directlyAssignedAssets = useMemo(() => {
    const fromInventory = getAssignedAssetsForEmployee(
      employeeId,
      fullName,
      data.personalInfo.corporateEmail || data.personalInfo.email
    );
    const fromContext = Array.isArray(data.equipment.assignedAssets) ? data.equipment.assignedAssets : [];
    const combined = [...fromInventory];
    fromContext.forEach((ca: any) => {
      if (!combined.some((item) => item.id === ca.id || (item.assetTag && ca.assetTag && item.assetTag === ca.assetTag))) {
        combined.push(ca);
      }
    });
    return combined;
  }, [employeeId, fullName, data.personalInfo, data.equipment.assignedAssets, inventoryAssets]);

  const displayEquipmentList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      category: string;
      description: string;
      assetTag?: string;
      serialNumber?: string;
      isAssigned: boolean;
    }> = [];

    // 1. First add all directly assigned IT assets from Central Assets Menu
    directlyAssignedAssets.forEach((ast) => {
      const specsSummary = ast.specifications
        ? Object.entries(ast.specifications).map(([k, v]) => `${k}: ${v}`).join(' • ')
        : ast.notes || 'Enterprise configured engineering asset';

      list.push({
        id: ast.id,
        name: ast.name,
        category: ast.category.toLowerCase(),
        description: specsSummary,
        assetTag: ast.assetTag,
        serialNumber: ast.serialNumber,
        isAssigned: true
      });
    });

    // 2. Add any items from selectedEquipment not yet covered
    const selectedNames = data.equipment.selectedEquipment || [];
    selectedNames.forEach((name, idx) => {
      const alreadyInList = list.some((item) =>
        item.name.toLowerCase() === name.toLowerCase() ||
        item.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(item.name.toLowerCase())
      );
      if (!alreadyInList) {
        const catalogMatch = inventoryAssets.find((a) =>
          a.name.toLowerCase() === name.toLowerCase() || a.name.toLowerCase().includes(name.toLowerCase())
        );
        if (catalogMatch) {
          const specsSummary = catalogMatch.specifications
            ? Object.entries(catalogMatch.specifications).map(([k, v]) => `${k}: ${v}`).join(' • ')
            : catalogMatch.notes || 'Enterprise catalog hardware asset';
          list.push({
            id: catalogMatch.id,
            name: catalogMatch.name,
            category: catalogMatch.category.toLowerCase(),
            description: specsSummary,
            assetTag: catalogMatch.assetTag,
            serialNumber: catalogMatch.serialNumber,
            isAssigned: true
          });
        } else {
          const fallback = AVAILABLE_EQUIPMENT.find((f) => f.name.toLowerCase() === name.toLowerCase());
          list.push({
            id: `equip-sel-${idx}`,
            name,
            category: fallback ? fallback.category : 'peripherals',
            description: fallback ? fallback.description : 'Allocated corporate workstation peripheral',
            isAssigned: true
          });
        }
      }
    });

    return list;
  }, [directlyAssignedAssets, data.equipment.selectedEquipment, inventoryAssets]);

  // Photo processing
  const processPhotoFile = (file: File) => {
    setPhotoError(null);

    if (!file.type.startsWith('image/')) {
      setPhotoError('Selected file is not an image. Please upload a high-resolution JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB limit. Please upload a file smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultUrl = event.target?.result as string;
      updatePhoto({
        photoUrl: resultUrl,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
      showToastSuccess('Photo Uploaded', 'ID badge photo uploaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  // Digital Signature processing
  const handleDigitalSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToastError('Invalid File Type', 'Please upload an image file (PNG, JPG, SVG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToastError('File Too Large', 'Signature file must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateSignature({
        digitalSignatureUrl: dataUrl,
        digitalSignatureFileName: file.name
      });
      try {
        localStorage.setItem('employee_digital_sig', dataUrl);
      } catch {}
      showToastSuccess('Signature Uploaded', `${file.name} uploaded as official digital signature.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDigitalSig = () => {
    updateSignature({
      digitalSignatureUrl: undefined,
      digitalSignatureFileName: undefined
    });
    try {
      localStorage.removeItem('employee_digital_sig');
    } catch {}
    if (digitalSigInputRef.current) digitalSigInputRef.current.value = '';
    showToastSuccess('Signature Removed', 'Digital signature removed.');
  };

  const handleAccommodationsChange = (val: string) => {
    setAccommodationsText(val);
    setEquipmentRequests(val);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  // Selected hardware list - only items assigned by HR Admin or inventory
  const selectedEquipment = data.equipment.selectedEquipment || [];

  // Leadership details
  const activeLine1Name = data.personalInfo.line1Manager || data.team.managerName || 'Not assigned';
  const activeLine1Email = activeLine1Name && activeLine1Name !== 'Not assigned'
    ? `${activeLine1Name.toLowerCase().replace(/\s+/g, '.')}@quantira.com`
    : '';
  const activeLine2Name = data.personalInfo.line2Manager || 'None';
  const activeLine2Email = activeLine2Name && activeLine2Name !== 'None'
    ? `${activeLine2Name.toLowerCase().replace(/\s+/g, '.')}@quantira.com`
    : '';

  const sig = data.emailSignature;
  const office = data.officeSetup;

  return (
    <form onSubmit={handleSubmit} className="space-y-10 text-left animate-fade-in pb-8">
      {/* Header Banner */}
      <div className="flex items-center gap-3.5 pb-2">
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
          <Briefcase className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Work Setup &amp; Workplace Preferences
          </h1>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* PHOTO BADGE & BUSINESS CARD SHOWCASE SECTION */}
      {/* ========================================================================= */}
      <div id="section-photo" className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Employee ID Card &amp; Corporate Business Card
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80">
              <ShieldCheck className="w-3.5 h-3.5" /> ID Card (3:4)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80">
              <Sparkles className="w-3.5 h-3.5" /> Business Card (3.5" × 2")
            </span>
          </div>
        </div>

        {photoError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5 font-medium"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{photoError}</span>
          </div>
        )}

        {/* SIDE BY SIDE: ID CARD & BUSINESS CARD SHOWCASE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processPhotoFile(e.target.files[0]);
              }
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-items-center">
            {/* Column 1: ID Badge & Photo Specifications Below It */}
            <div className="w-full max-w-[320px] flex flex-col items-center space-y-4">
              <EmployeeIdBadge
                photoUrl={data.photo.photoUrl || data.personalInfo.avatarUrl || getAvatarByGender(data.personalInfo.gender, fullName)}
                fullName={fullName}
                jobTitle={jobTitle}
                department={department}
                employeeId={employeeId}
                accessLevel={data.officeSetup.accessCardLevel || 'Standard Floor Access'}
                onPhotoClick={() => photoInputRef.current?.click()}
                className="w-full"
              />

              {/* Photo Actions if photo uploaded */}
              {data.photo.photoUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                    onClick={() => photoInputRef.current?.click()}
                    className="text-xs"
                  >
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      updatePhoto({ photoUrl: '', fileName: '', fileSize: '' });
                      if (photoInputRef.current) photoInputRef.current.value = '';
                    }}
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {/* ID Card Photo Specifications directly below ID card */}
              <div className="w-full p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 shadow-2xs">
                <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block uppercase tracking-wider text-xs">
                  ID Card Photo Specifications
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Vertical portrait (3:4 ratio)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Plain solid background</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Direct front-facing view</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>No sunglasses, caps, masks</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 2: Executive Business Card */}
            <div className="w-full max-w-[380px] flex flex-col items-center space-y-4">
              <ExecutiveBusinessCard
                fullName={fullName}
                jobTitle={jobTitle}
                department={department}
                email={data.corporateAccount.corporateEmail || data.personalInfo.corporateEmail || data.personalInfo.email}
                phone={sig.phone || sig.mobile || data.personalInfo.phone || ''}
                website="www.quantiratechnologies.com"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CORPORATE EMAIL & DIGITAL SIGNATURE SECTION */}
      {/* ========================================================================= */}
      <div id="section-signature" className="space-y-4 pt-4">
        <div className="pb-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Corporate Email &amp; Digital Signature Configuration
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5 content-start">
            <TextInput
              label="Full Display Name"
              value={sig.name}
              onChange={(e) => updateSignature({ name: e.target.value })}
              required
            />
            <TextInput
              label="Official Position Title"
              value={sig.title}
              onChange={(e) => updateSignature({ title: e.target.value })}
              required
            />
            <TextInput
              label="Department"
              value={sig.department}
              onChange={(e) => updateSignature({ department: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextInput
                label="Direct Desk Phone"
                value={sig.phone}
                onChange={(e) => updateSignature({ phone: e.target.value })}
                placeholder="+1 (415) 555-0100"
              />
              <TextInput
                label="Mobile Phone"
                value={sig.mobile}
                onChange={(e) => updateSignature({ mobile: e.target.value })}
                placeholder="+1 (415) 555-0199"
              />
            </div>
            <TextInput
              label="Company / Department Tagline"
              value={sig.tagline}
              onChange={(e) => updateSignature({ tagline: e.target.value })}
              placeholder="e.g. Innovating Enterprise Software Systems"
            />
          </div>

          {/* Right: Live Preview Card + Digital Signature Upload */}
          <div className="space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Live Signature Preview
              </span>
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm">
                    {sig.name ? sig.name.charAt(0) : 'Q'}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {sig.name || 'Alex Mercer'}
                    </h4>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                      {sig.title || 'Senior Software Engineer'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {sig.department || 'Enterprise Systems'} • Quantira Technologies Inc.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${data.corporateAccount.corporateEmail}`}
                      className="truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                      title="Send email"
                    >
                      {data.corporateAccount.corporateEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sig.phone || sig.mobile || data.personalInfo.phone || 'Phone not set'}</span>
                  </div>
                </div>

                {sig.tagline && (
                  <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
                    "{sig.tagline}"
                  </p>
                )}

                {sig.digitalSignatureUrl && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Attached Official Signature:
                    </span>
                    <img
                      src={sig.digitalSignatureUrl}
                      alt="Official Signature"
                      className="h-10 object-contain filter dark:invert"
                    />
                  </div>
                )}
              </Card>
            </div>

            {/* Digital Signature Upload Box (Below Live Preview) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Upload Digital Signature (Image)
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    PNG transparent or JPG scan. Used on official onboarding employment contracts.
                  </p>
                </div>
                {sig.digitalSignatureUrl && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                    <Check className="w-3 h-3" /> Uploaded
                  </span>
                )}
              </div>

              <input
                type="file"
                ref={digitalSigInputRef}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleDigitalSigUpload}
                className="hidden"
              />

              {!sig.digitalSignatureUrl ? (
                <button
                  type="button"
                  onClick={() => digitalSigInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">Click to upload signature image</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 flex items-center justify-center">
                    <img
                      src={sig.digitalSignatureUrl}
                      alt="Digital Signature"
                      className="max-h-full max-w-full object-contain filter dark:invert"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate text-[11px]">
                      {sig.digitalSignatureFileName || 'signature.png'}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveDigitalSig}
                      className="text-rose-600 hover:text-rose-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. IT HARDWARE & WORKSTATION EQUIPMENT SECTION */}
      {/* ========================================================================= */}
      <div id="section-equipment" className="space-y-4 pt-4">

        {/* Equipment Display (Read-Only) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Assigned Hardware Package ({displayEquipmentList.filter((i) => i.isAssigned).length} Items Allocated)
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Direct Delivery Scheduled
            </span>
          </div>

          {displayEquipmentList.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              No hardware equipment packages have been allocated for this employee yet. Workstation assets assigned by HR Administration or Central IT Inventory will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {displayEquipmentList.map((item) => {
                const isAssigned = item.isAssigned;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 rounded-xl border transition-all flex flex-col justify-between select-none',
                      isAssigned
                        ? 'border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs'
                        : 'border-slate-200/70 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/40 opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                            {item.name}
                          </span>
                          {isAssigned && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              <Lock className="w-2.5 h-2.5" /> Allocated
                            </span>
                          )}
                          {item.assetTag && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              <Tag className="w-2.5 h-2.5" /> {item.assetTag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div
                        className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors mt-0.5',
                          isAssigned
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                        )}
                      >
                        {isAssigned && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Special Requests & Accommodations */}
        <div className="space-y-2 pt-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
            Special Hardware Accommodations or Adapter Requests (Optional)
          </label>
          <TextArea
            value={accommodationsText}
            onChange={(e) => handleAccommodationsChange(e.target.value)}
            placeholder="e.g. Need USB-C to Ethernet adapter, vertical ergonomic mouse, monitor riser arm, or international plug converter..."
            rows={3}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TEAM & LEADERSHIP INFORMATION SECTION */}
      {/* ========================================================================= */}
      <div id="section-leadership" className="space-y-4 pt-4">
        <div className="pb-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Team &amp; Reporting Leadership Information
            </h2>
          </div>
        </div>

        <div>
          {/* Reporting Manager Card */}
          <Card className="p-6 space-y-4 border border-blue-100 dark:border-blue-900/60 bg-linear-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 shadow-2xs max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Reporting Manager
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Daily Operational
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Avatar
                src={getRadianAvatarByName(activeLine1Name) || data.team.managerAvatar}
                name={activeLine1Name}
                size="lg"
                status="online"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                  {activeLine1Name}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 truncate">
                  {data.team.managerTitle || 'VP of Engineering & Team Lead'}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {data.personalInfo.department || 'Engineering'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Primary supervisor for day-to-day operations, sprint assignments, code reviews, and initial 30-60-90 day goal settings.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${activeLine1Email}`}
                  className="truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                  title="Send email"
                >
                  {activeLine1Email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{data.team.managerPhone || '+1 (415) 555-0100'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Day 1 Intro 1-on-1 scheduled for 10:00 AM PST</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. OFFICE SETUP & CAMPUS PREFERENCES SECTION */}
      {/* ========================================================================= */}
      <div id="section-office" className="space-y-4 pt-4">
        <div className="pb-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Office Setup &amp; Campus Facility Preferences
            </h2>
          </div>
        </div>

        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Desk Location Preference (Optional)"
              value={office.deskLocation}
              onChange={(e) => updateOfficeSetup({ deskLocation: e.target.value })}
              options={[
                { label: 'Select desk location...', value: '' },
                { label: 'Building 2 - 4th Floor (Quiet Engineering Zone)', value: 'Building 2 - 4th Floor (Quiet Engineering Zone)' },
                { label: 'Building 2 - 3rd Floor (Open Collaborative Space)', value: 'Building 2 - 3rd Floor (Open Collaborative Space)' },
                { label: 'Building 1 - 2nd Floor (Near Atrium & Cafeteria)', value: 'Building 1 - 2nd Floor (Near Atrium & Cafeteria)' },
                { label: 'Fully Remote / Hot-desk Reservation Only', value: 'Fully Remote / Hot-desk Reservation Only' }
              ]}
            />

            <Select
              label="Physical Access Card Level (Optional)"
              value={office.accessCardLevel}
              onChange={(e) => updateOfficeSetup({ accessCardLevel: e.target.value })}
              options={[
                { label: 'Select access level...', value: '' },
                { label: 'Standard Office Floor Access (8 AM - 7 PM)', value: 'Standard Office Floor Access (8 AM - 7 PM)' },
                { label: 'Engineering Floor + 24/7 Data Lab Clearance', value: 'Engineering Floor + 24/7 Data Lab Clearance' },
                { label: 'All-Building 24/7 Executive Clearance', value: 'All-Building 24/7 Executive Clearance' }
              ]}
            />
          </div>
        </FormSection>

        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
              <Switch
                checked={office.parkingRequired}
                onChange={(checked) => updateOfficeSetup({ parkingRequired: checked })}
                label="On-Site Campus Parking Permit Required?"
              />

              {office.parkingRequired && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  <TextInput
                    label="Vehicle License Plate (Optional)"
                    value={office.licensePlate || ''}
                    onChange={(e) => updateOfficeSetup({ licensePlate: e.target.value })}
                    placeholder="e.g. 7XYZ890"
                    leftIcon={<Car className="w-4 h-4 text-slate-400" />}
                  />

                  <Select
                    label="Permit Category (Optional)"
                    value={office.permitType || 'Standard Vehicle Reserved Bay'}
                    onChange={(e) => updateOfficeSetup({ permitType: e.target.value })}
                    options={[
                      { label: 'Standard Vehicle Reserved Bay', value: 'Standard Vehicle Reserved Bay' },
                      { label: 'Electric Vehicle Charging Reserved Bay', value: 'Electric Vehicle Charging Reserved Bay' },
                      { label: 'Motorcycle / Scooter Bay', value: 'Motorcycle / Scooter Bay' },
                      { label: 'Carpool Priority Bay', value: 'Carpool Priority Bay' }
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              <Switch
                checked={office.lockerRequired}
                onChange={(checked) => updateOfficeSetup({ lockerRequired: checked })}
                label="Personal Security Day Locker"
                description="Dedicated electronic keypad locker near your engineering team pod."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <TextArea
                label="Special Workplace Accommodations or Accessibility Requests (Optional)"
                value={office.specialAccommodations}
                onChange={(e) => updateOfficeSetup({ specialAccommodations: e.target.value })}
                placeholder="e.g. Ergonomic chair adjustments, screen magnification, service animal, quiet space preferences..."
                rows={3}
              />
            </div>
          </div>
        </FormSection>
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
          Save &amp; Proceed to Review &amp; Submit
        </Button>
      </div>
    </form>
  );
};
