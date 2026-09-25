import React, { useState, useEffect } from 'react';
import {
  CustomProfileField,
  AssetFieldConfig,
  CustomFieldType
} from '../../services/customFieldsService';
import { DynamicCustomFieldInput } from './DynamicCustomFieldInput';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Sparkles,
  Type,
  AlignLeft,
  Hash,
  DollarSign,
  ListFilter,
  Tags,
  Radio,
  ToggleLeft,
  Calendar,
  Clock,
  CalendarClock,
  UploadCloud,
  Mail,
  Phone,
  Globe,
  Star,
  Palette,
  Plus,
  Trash2,
  HelpCircle,
  Copy,
  Layers,
  Code2,
  ChevronDown,
  ChevronUp,
  FolderPlus
} from 'lucide-react';

export interface CustomFieldBuilderViewProps {
  initialField?: CustomProfileField | AssetFieldConfig | null;
  targetModule: 'employee' | 'assets';
  availableSections: string[];
  standardSections: string[];
  onSave: (fieldData: any, newSection?: string) => void;
  onCancel: () => void;
}

interface TypeDefinition {
  type: CustomFieldType;
  label: string;
  category: 'Text' | 'Choice' | 'Number' | 'Date & Time' | 'Media' | 'Advanced';
  description: string;
  icon: React.ElementType;
}

const FIELD_TYPES: TypeDefinition[] = [
  // Text & Content
  { type: 'text', label: 'Single Line Text', category: 'Text', description: 'Short text inputs, names, titles', icon: Type },
  { type: 'textarea', label: 'Multi-Line Text Area', category: 'Text', description: 'Long descriptions, bios, addresses', icon: AlignLeft },
  { type: 'email', label: 'Email Address', category: 'Text', description: 'Email address with validation', icon: Mail },
  { type: 'phone', label: 'Phone Number', category: 'Text', description: 'Contact phone with dialing format', icon: Phone },
  { type: 'url', label: 'Website Link (URL)', category: 'Text', description: 'Web addresses with protocol validation', icon: Globe },

  // Numbers & Currency
  { type: 'number', label: 'Numeric Counter', category: 'Number', description: 'Integers, decimals, quantities', icon: Hash },
  { type: 'currency', label: 'Monetary Currency', category: 'Number', description: 'Financial amounts with currency symbol', icon: DollarSign },

  // Choices & Lists
  { type: 'select', label: 'Dropdown Menu', category: 'Choice', description: 'Single select dropdown from options', icon: ListFilter },
  { type: 'multiselect', label: 'Multi-Select Tags', category: 'Choice', description: 'Select multiple tag chips', icon: Tags },
  { type: 'radio', label: 'Radio Choice Buttons', category: 'Choice', description: 'Mutually exclusive visual choices', icon: Radio },
  { type: 'boolean', label: 'Toggle Switch / Checkbox', category: 'Choice', description: 'Yes/No or True/False toggle switch', icon: ToggleLeft },

  // Dates & Calendars
  { type: 'date', label: 'Calendar Date', category: 'Date & Time', description: 'Date picker calendar selector', icon: Calendar },
  { type: 'time', label: 'Clock Time', category: 'Date & Time', description: 'Time of day clock picker', icon: Clock },
  { type: 'datetime', label: 'Date & Time Combo', category: 'Date & Time', description: 'Combined calendar and clock picker', icon: CalendarClock },

  // Media & Files
  { type: 'file', label: 'File & Document Upload', category: 'Media', description: 'PDFs, Word docs, spreadsheets', icon: UploadCloud },

  // Advanced & Special
  { type: 'rating', label: 'Star Rating', category: 'Advanced', description: 'Interactive 1 to 5 star rating', icon: Star },
  { type: 'color', label: 'Color Picker', category: 'Advanced', description: 'Hex color swatch palette', icon: Palette }
];

const PRESETS: Record<string, string[]> = {
  'T-Shirt Sizes': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  'Blood Groups': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'Work Models': ['Remote (Work From Home)', 'Hybrid (2-3 Days Office)', 'In-Office (Full-time)'],
  'Priority Levels': ['Low', 'Medium', 'High', 'Critical / Urgent'],
  'Yes / No / Maybe': ['Yes', 'No', 'Under Review'],
  'Dietary Preferences': ['None / Standard', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Nut Allergy']
};

export const CustomFieldBuilderView: React.FC<CustomFieldBuilderViewProps> = ({
  initialField,
  targetModule,
  availableSections,
  standardSections,
  onSave,
  onCancel
}) => {
  const isEditing = Boolean(initialField && initialField.id);

  // Core Fields State
  const [label, setLabel] = useState(initialField?.label || '');
  const [key, setKey] = useState(initialField?.key || '');
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(Boolean(initialField?.key));
  const [fieldType, setFieldType] = useState<CustomFieldType>(
    (initialField?.type as CustomFieldType) || 'text'
  );
  const [section, setSection] = useState(
    (initialField as any)?.step || (initialField as any)?.section || availableSections[0] || 'Personal Info'
  );
  const [isNewSection, setIsNewSection] = useState(false);
  const [newSectionInput, setNewSectionInput] = useState('');
  const [description, setDescription] = useState(initialField?.helpText || '');
  const [placeholder, setPlaceholder] = useState(initialField?.placeholder || '');
  const [required, setRequired] = useState(initialField?.required || false);
  const [enabled, setEnabled] = useState((initialField as any)?.enabled !== false);
  const [permission, setPermission] = useState((initialField as any)?.permission || 'Employee Editable');

  // Module Visibility Matrix
  const [showInAddEmployee, setShowInAddEmployee] = useState((initialField as any)?.showInAddEmployee !== false);
  const [showInOnboarding, setShowInOnboarding] = useState((initialField as any)?.showInOnboarding !== false);
  const [showInProfile, setShowInProfile] = useState((initialField as any)?.showInProfile !== false);

  // Type Specific Settings
  const [defaultValue, setDefaultValue] = useState<any>(initialField?.defaultValue ?? '');
  const [minLength, setMinLength] = useState<number | undefined>((initialField as any)?.minLength);
  const [maxLength, setMaxLength] = useState<number | undefined>((initialField as any)?.maxLength);
  const [rows, setRows] = useState<number>((initialField as any)?.rows || 3);
  const [minValue, setMinValue] = useState<number | undefined>((initialField as any)?.min);
  const [maxValue, setMaxValue] = useState<number | undefined>((initialField as any)?.max);
  const [stepValue, setStepValue] = useState<number | undefined>((initialField as any)?.stepValue || 1);
  const [unit, setUnit] = useState<string>((initialField as any)?.unit || '');
  const [currencySymbol, setCurrencySymbol] = useState<string>((initialField as any)?.currencySymbol || '$');
  const [allowedFormats, setAllowedFormats] = useState<string>((initialField as any)?.allowedFormats || 'PDF, DOCX, PNG, JPG');
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>((initialField as any)?.maxFileSizeMB || 10);
  const [multipleFiles, setMultipleFiles] = useState<boolean>(Boolean((initialField as any)?.multipleFiles));

  // Options for Select / Radio / Multiselect
  const [options, setOptions] = useState<string[]>(() => {
    if (initialField?.options && Array.isArray(initialField.options)) {
      return initialField.options;
    }
    return ['Option 1', 'Option 2', 'Option 3'];
  });
  const [newOptionInput, setNewOptionInput] = useState('');

  // Live Preview Test State
  const [testValue, setTestValue] = useState<any>('');
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Auto-slugify label to camelCase key
  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!isKeyManuallyEdited && !isEditing) {
      const slug = val
        .trim()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .filter(Boolean)
        .map((word, idx) => (idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
        .join('');
      setKey(slug);
    }
  };

  // Option list handlers
  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newOptionInput.trim();
    if (!trimmed || options.includes(trimmed)) return;
    setOptions([...options, trimmed]);
    setNewOptionInput('');
  };

  const handleRemoveOption = (optToRemove: string) => {
    setOptions(options.filter((o) => o !== optToRemove));
  };

  const handleApplyPreset = (presetName: string) => {
    if (PRESETS[presetName]) {
      setOptions([...PRESETS[presetName]]);
    }
  };

  // Copy database key helper
  const handleCopyKey = () => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Reset to Defaults
  const handleReset = () => {
    setLabel(initialField?.label || '');
    setKey(initialField?.key || '');
    setFieldType((initialField?.type as CustomFieldType) || 'text');
    setRequired(initialField?.required || false);
    setDescription(initialField?.helpText || '');
    setPlaceholder(initialField?.placeholder || '');
    setOptions(initialField?.options || ['Option 1', 'Option 2', 'Option 3']);
    setTestValue('');
  };

  // Construct current field specification object for preview & saving
  const currentFieldSpec = {
    id: initialField?.id || `cf-${Date.now()}`,
    label: label.trim() || 'Untitled Field',
    key: key.trim() || 'untitledField',
    type: fieldType,
    step: isNewSection ? newSectionInput.trim() || 'Custom Attributes' : section,
    section: isNewSection ? newSectionInput.trim() || 'Custom Attributes' : section,
    required,
    enabled,
    permission,
    placeholder: placeholder.trim() || undefined,
    helpText: description.trim() || undefined,
    defaultValue: defaultValue !== '' ? defaultValue : undefined,
    options: ['select', 'multiselect', 'radio'].includes(fieldType) ? options : undefined,
    min: minValue,
    max: maxValue,
    stepValue: stepValue,
    unit: unit.trim() || undefined,
    currencySymbol: currencySymbol.trim() || undefined,
    minLength: minLength,
    maxLength: maxLength,
    rows: fieldType === 'textarea' ? rows : undefined,
    allowedFormats: ['file', 'image'].includes(fieldType) ? allowedFormats : undefined,
    maxFileSizeMB: ['file', 'image'].includes(fieldType) ? maxFileSizeMB : undefined,
    multipleFiles: ['file', 'image'].includes(fieldType) ? multipleFiles : undefined,
    showInAddEmployee,
    showInOnboarding,
    showInProfile
  };

  // Final Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const finalSection = isNewSection
      ? newSectionInput.trim() || 'Custom Attributes'
      : section;

    onSave(currentFieldSpec, isNewSection ? finalSection : undefined);
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-20">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="-ml-1 mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Module Customizer
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isEditing ? `Edit Custom Field: ${initialField?.label}` : 'Enterprise Custom Field Builder'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure rich dynamic data types, real-time validation gates, and interactive live preview.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!label.trim()}
            leftIcon={<Check className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 px-4 cursor-pointer"
          >
            {isEditing ? 'Save & Deploy Changes' : 'Deploy Custom Field'}
          </Button>
        </div>
      </div>

      {/* Field Type Palette Picker (Visual Selector) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Select Input Data Type
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/50">
            Selected: {FIELD_TYPES.find((f) => f.type === fieldType)?.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {FIELD_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = fieldType === t.type;
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => {
                  setFieldType(t.type);
                  // Intelligently adapt placeholders
                  if (t.type === 'email') setPlaceholder('user@company.com');
                  else if (t.type === 'phone') setPlaceholder('+1 (555) 000-0000');
                  else if (t.type === 'url') setPlaceholder('https://company.org');
                  else if (t.type === 'currency') setPlaceholder('0.00');
                  else if (t.type === 'textarea') setPlaceholder('Enter multi-line description...');
                  else if (t.type === 'date') setPlaceholder('YYYY-MM-DD');
                  else if (t.type === 'number') setPlaceholder('0');
                  else if (t.type === 'select') setPlaceholder('Select an option...');
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
                )}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold leading-tight">{t.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Builder Form (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: BUILDER SETTINGS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Core Field Identity */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              2. Core Identity &amp; Placement
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field Label */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Field Label <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-400">User-facing title</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Workstation Preference, Security Clearance Tier, Dietary Restrictions"
                  value={label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Database Key */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Database Key</span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedKey ? 'Copied!' : 'Copy Key'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. workstationPreference"
                    value={key}
                    onChange={(e) => {
                      setKey(e.target.value);
                      setIsKeyManuallyEdited(true);
                    }}
                    className="w-full font-mono px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Section / Category Assignment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Form Section</span>
                  {!isNewSection && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewSection(true);
                        setNewSectionInput('');
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      <Plus className="w-3 h-3" /> New Section
                    </button>
                  )}
                </label>

                {!isNewSection ? (
                  <select
                    value={section}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsNewSection(true);
                        setNewSectionInput('');
                      } else {
                        setSection(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <optgroup label="Available Sections">
                      {availableSections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} {standardSections.includes(sec) ? '(Standard)' : '(Custom)'}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__NEW__">+ Create Custom Section...</option>
                  </select>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Enter new section name"
                      value={newSectionInput}
                      onChange={(e) => setNewSectionInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setIsNewSection(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Placeholder */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  placeholder="Placeholder example hint..."
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Description / Tooltip Help */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Helper / Description Text
                </label>
                <input
                  type="text"
                  placeholder="Guidance tooltip shown to users..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Dynamic Type-Specific Settings */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Dynamic {FIELD_TYPES.find((f) => f.type === fieldType)?.label} Configuration
              </span>
              <span className="text-[10px] text-slate-400">Contextual rules</span>
            </div>

            {/* DYNAMIC FOR: SELECT / MULTISELECT / RADIO */}
            {['select', 'multiselect', 'radio'].includes(fieldType) && (
              <div className="space-y-3.5">
                {/* Options List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Options List ({options.length})</span>
                    <span className="text-[11px] font-normal text-slate-400">Choices available for selection</span>
                  </label>

                  {/* Add option bar */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type choice and press enter or click Add..."
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddOption()}
                      disabled={!newOptionInput.trim()}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      className="text-xs font-semibold"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Options Chips */}
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 min-h-[50px]">
                    {options.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No options added yet. Type an option above.</span>
                    ) : (
                      options.map((opt, idx) => (
                        <span
                          key={opt}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-2xs"
                        >
                          <span className="text-[10px] text-slate-400 font-mono">{idx + 1}.</span>
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt)}
                            className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                            title="Remove option"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quick Option Presets:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(PRESETS).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-950 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        + {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC FOR: TEXTAREA */}
            {fieldType === 'textarea' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Visible Rows Height
                  </label>
                  <select
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value={2}>2 Rows (Compact)</option>
                    <option value={3}>3 Rows (Standard)</option>
                    <option value={4}>4 Rows (Spacious)</option>
                    <option value={6}>6 Rows (Large)</option>
                    <option value={8}>8 Rows (Extended Bio/Notes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Maximum Character Limit
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500 (Leave empty for no limit)"
                    value={maxLength || ''}
                    onChange={(e) => setMaxLength(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FOR: NUMBER */}
            {fieldType === 'number' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Minimum Allowed
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 0"
                    value={minValue ?? ''}
                    onChange={(e) => setMinValue(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Maximum Allowed
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={maxValue ?? ''}
                    onChange={(e) => setMaxValue(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Unit / Suffix Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. lbs, kg, %, hrs, pts"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FOR: CURRENCY */}
            {fieldType === 'currency' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Currency Symbol
                  </label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="$">$ (USD / CAD / AUD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="₹">₹ (INR)</option>
                    <option value="¥">¥ (JPY / CNY)</option>
                    <option value="AED">AED (Emirati Dirham)</option>
                    <option value="SGD">SGD (Singapore Dollar)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Maximum Budget Cap
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={maxValue ?? ''}
                    onChange={(e) => setMaxValue(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FOR: FILE UPLOAD */}
            {fieldType === 'file' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Allowed File Extensions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PDF, DOCX, PNG, JPG, XLSX"
                    value={allowedFormats}
                    onChange={(e) => setAllowedFormats(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Max File Size Limit (MB)
                  </label>
                  <select
                    value={maxFileSizeMB}
                    onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value={2}>2 MB (Small documents)</option>
                    <option value={5}>5 MB (Standard)</option>
                    <option value={10}>10 MB (Recommended)</option>
                    <option value={25}>25 MB (High resolution)</option>
                    <option value={50}>50 MB (Large portfolios)</option>
                  </select>
                </div>
              </div>
            )}

            {/* DYNAMIC FOR: TEXT / EMAIL / PHONE / URL */}
            {['text', 'email', 'phone', 'url'].includes(fieldType) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Min Characters
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={minLength ?? ''}
                    onChange={(e) => setMinLength(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Max Characters
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={maxLength ?? ''}
                    onChange={(e) => setMaxLength(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC FOR: DATE */}
            {fieldType === 'date' && (
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Renders an interactive browser-standard datepicker supporting date constraints and format parsing.</span>
              </div>
            )}
          </div>

          {/* Card 3: Validation, Rules & Module Visibility */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              4. Validation, Permissions &amp; Form Visibility
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mandatory Policy Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    Mandatory Policy
                    {required && <span className="text-[10px] text-rose-500 font-bold">(Required)</span>}
                  </span>
                  <p className="text-[11px] text-slate-400">Blocks submission if empty</p>
                </div>
                <Switch checked={required} onChange={setRequired} />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Field Status
                  </span>
                  <p className="text-[11px] text-slate-400">{enabled ? 'Active in forms' : 'Disabled / Hidden'}</p>
                </div>
                <Switch checked={enabled} onChange={setEnabled} />
              </div>

              {/* User Permission Tier */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Access &amp; Edit Permission
                </label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Employee Editable">Employee &amp; Candidate Editable (Standard)</option>
                  <option value="Admin Only">Super Admin &amp; HR Only (Restricted)</option>
                  <option value="Manager View & Edit">Line Manager &amp; HR (Team Leads)</option>
                  <option value="Read Only">Read Only (System Populated)</option>
                </select>
              </div>

              {/* Target Module Checkboxes (if Employee custom field) */}
              {targetModule === 'employee' && (
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Portal Module Placement Matrix:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showInAddEmployee}
                        onChange={(e) => setShowInAddEmployee(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                      />
                      <span>Add Employee Form</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showInOnboarding}
                        onChange={(e) => setShowInOnboarding(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                      />
                      <span>Onboarding Flow</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={showInProfile}
                        onChange={(e) => setShowInProfile(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                      />
                      <span>Profile &amp; Directory</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE LIVE PREVIEW (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Live Component Preview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden">
            {/* Preview Header */}
            <div className="px-5 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Live Interactive Component Preview
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                {fieldType}
              </span>
            </div>

            {/* Interactive Preview Container */}
            <div className="p-6 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
              {/* Form Card Simulation */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                    {isNewSection ? newSectionInput || 'New Section' : section}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {permission}
                  </span>
                </div>

                {/* THE DYNAMIC INPUT COMPONENT */}
                <DynamicCustomFieldInput
                  field={currentFieldSpec}
                  value={testValue}
                  onChange={(val) => setTestValue(val)}
                  showHelpText={true}
                  showLabel={true}
                />

                {/* Live Value Inspector */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Test Value: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{JSON.stringify(testValue) || '""'}</span>
                  </span>
                  {testValue !== '' && (
                    <button
                      type="button"
                      onClick={() => setTestValue('')}
                      className="text-slate-400 hover:text-slate-600 text-[10px] underline cursor-pointer"
                    >
                      Clear test value
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time Field Summary Badges */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-400 block text-[10px]">Database Key:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 truncate block">
                    {key || 'untitledKey'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-400 block text-[10px]">Policy Gate:</span>
                  <span className={`font-bold block ${required ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {required ? 'Mandatory Gate' : 'Optional Field'}
                  </span>
                </div>
              </div>
            </div>

            {/* JSON Schema Inspector Toggle */}
            <div className="px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Data Model &amp; JSON Specification</span>
                </div>
                {showJsonInspector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showJsonInspector && (
                <div className="mt-3 p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48 border border-slate-800">
                  <pre>{JSON.stringify(currentFieldSpec, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
