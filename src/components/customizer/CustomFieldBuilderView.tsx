import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CustomProfileField,
  AssetFieldConfig,
  CustomFieldType
} from '../../services/customFieldsService';
import {
  SCHEMA_VARIABLES,
  QUERY_PRESETS,
  QueryPreset,
  SchemaVariable,
  evaluateCustomFieldQuery,
  QueryEvaluationResult,
  buildEvaluationContext
} from '../../services/queryEngineService';
import { useOnboarding } from '../../context/OnboardingContext';
import { getAssets } from '../../services/assetService';
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
  FolderPlus,
  Play,
  Database,
  Terminal,
  Calculator,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Braces,
  Filter,
  BookOpen,
  Zap,
  Info,
  SlidersHorizontal,
  Search,
  Users
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
  const { candidates } = useOnboarding();
  const assetsList = useMemo(() => getAssets(), []);

  // Top Tabs: 'visual' (Form Customizer) vs 'query' (Query & Formula Workbench)
  const [activeTab, setActiveTab] = useState<'visual' | 'query'>(
    initialField?.isComputed ? 'query' : 'visual'
  );

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

  // =========================================================================
  // QUERY & COMPUTED FORMULA ENGINE STATE
  // =========================================================================
  const [isComputed, setIsComputed] = useState<boolean>(Boolean(initialField?.isComputed));
  const [queryType, setQueryType] = useState<'formula' | 'sql' | 'jql' | 'jsonpath'>(
    initialField?.queryType || 'formula'
  );
  const [computedQuery, setComputedQuery] = useState<string>(initialField?.computedQuery || '');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [selectedSampleCandidateId, setSelectedSampleCandidateId] = useState<string>(() => {
    return candidates && candidates.length > 0 ? candidates[0].id : 'EMP-2024-8904';
  });
  const [searchTokenQuery, setSearchTokenQuery] = useState<string>('');
  const [selectedTokenCategory, setSelectedTokenCategory] = useState<string>('All');
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryExecutionResult, setQueryExecutionResult] = useState<QueryEvaluationResult | null>(null);

  const queryTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Live Preview Test State
  const [testValue, setTestValue] = useState<any>('');
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  // Active sample candidate for live testing
  const sampleCandidate = useMemo(() => {
    if (candidates && candidates.length > 0) {
      const found = candidates.find((c) => c.id === selectedSampleCandidateId);
      if (found) return found;
    }
    return {
      id: 'EMP-2024-8904',
      firstName: 'Eleanor',
      lastName: 'Vance',
      name: 'Eleanor Vance',
      department: 'Engineering',
      jobTitle: 'Staff Cloud Architect',
      email: 'eleanor.vance@quantira.com',
      corporateEmail: 'eleanor.vance@quantira.com',
      salary: 165000,
      startDate: '2024-03-01',
      workModel: 'Hybrid',
      clearanceTier: 'Tier 3 (Secret)',
      progress: 100,
      status: 'completed'
    };
  }, [candidates, selectedSampleCandidateId]);

  // Run query evaluator when query or candidate changes
  useEffect(() => {
    if (isComputed && computedQuery.trim()) {
      const res = evaluateCustomFieldQuery(
        computedQuery,
        queryType,
        sampleCandidate,
        candidates || [],
        assetsList || []
      );
      setQueryExecutionResult(res);
      if (!res.error && res.result !== undefined && res.result !== null) {
        if (typeof res.result === 'object' && Array.isArray(res.result)) {
          setTestValue(`[${res.result.length} Records Matched]`);
        } else {
          setTestValue(res.result);
        }
      }
    }
  }, [isComputed, computedQuery, queryType, sampleCandidate, candidates, assetsList]);

  // Execute Query Manually
  const handleExecuteQuery = () => {
    setIsExecutingQuery(true);
    setTimeout(() => {
      const res = evaluateCustomFieldQuery(
        computedQuery,
        queryType,
        sampleCandidate,
        candidates || [],
        assetsList || []
      );
      setQueryExecutionResult(res);
      if (!res.error && res.result !== undefined && res.result !== null) {
        if (typeof res.result === 'object' && Array.isArray(res.result)) {
          setTestValue(`[${res.result.length} Records Matched]`);
        } else {
          setTestValue(res.result);
        }
      }
      setIsExecutingQuery(false);
    }, 120);
  };

  // Load a Query Preset
  const handleApplyPresetQuery = (preset: QueryPreset) => {
    setSelectedPresetId(preset.id);
    setQueryType(preset.queryType);
    setComputedQuery(preset.query);
    setIsComputed(true);

    if (!label.trim() || label === 'Untitled Field') {
      const cleanName = preset.name.replace(/^[^\w]+/, '').trim();
      setLabel(cleanName);
      handleLabelChange(cleanName);
    }
    if (preset.suggestedFieldType) {
      setFieldType(preset.suggestedFieldType);
    }
  };

  // Insert Schema Token at cursor
  const handleInsertToken = (token: string) => {
    if (queryTextareaRef.current) {
      const textarea = queryTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + token + after;
      setComputedQuery(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    } else {
      setComputedQuery((prev) => prev + (prev ? ' ' : '') + token);
    }
  };

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

  // Copy query helper
  const handleCopyQuery = () => {
    if (!computedQuery) return;
    navigator.clipboard.writeText(computedQuery);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
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
    setIsComputed(Boolean(initialField?.isComputed));
    setComputedQuery(initialField?.computedQuery || '');
    setQueryType(initialField?.queryType || 'formula');
    setTestValue('');
  };

  // Filtered Schema Variables
  const filteredTokens = useMemo(() => {
    return SCHEMA_VARIABLES.filter((item) => {
      const matchCategory = selectedTokenCategory === 'All' || item.category === selectedTokenCategory;
      const matchSearch =
        !searchTokenQuery.trim() ||
        item.label.toLowerCase().includes(searchTokenQuery.toLowerCase()) ||
        item.token.toLowerCase().includes(searchTokenQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTokenQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedTokenCategory, searchTokenQuery]);

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
    showInProfile,
    // Computed & Query Engine
    isComputed,
    queryType: isComputed ? queryType : undefined,
    computedQuery: isComputed ? computedQuery.trim() : undefined
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
                Configure rich dynamic data types, real-time validation gates, query formula engine, and interactive live preview.
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

      {/* Main Mode Tabs Switcher */}
      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'visual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Visual Form Builder</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('query');
              setIsComputed(true);
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'query'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <div className="flex items-center gap-1.5">
              <span>SQL &amp; Formula Query Editor</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-100 font-mono">
                Engine
              </span>
            </div>
          </button>
        </div>

        {/* Query Engine Active Indicator */}
        <div className="hidden sm:flex items-center gap-2 pr-3">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Field Mode:</span>
          {isComputed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Zap className="w-3 h-3 text-amber-600 animate-pulse" />
              ⚡ Query-Driven Computed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Standard User Input
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Split: Builder Form (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: BUILDER SETTINGS / QUERY EDITOR (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: VISUAL FORM BUILDER */}
          {activeTab === 'visual' && (
            <>
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

              {/* Card 2: Core Field Identity */}
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

                    {isNewSection ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Enter new section name..."
                          value={newSectionInput}
                          onChange={(e) => setNewSectionInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setIsNewSection(false)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
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
                    )}
                  </div>

                  {/* Placeholder Text */}
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

                  {/* Description / Helper Tooltip */}
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

              {/* Banner to Switch to Query Editor */}
              <div className="p-4 bg-gradient-to-r from-indigo-900/40 via-blue-900/30 to-slate-900/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Need Dynamic Formulas or SQL Data Extraction?
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Switch to the Query Editor to calculate values from employee metrics, attendance, or SQL queries.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('query');
                    setIsComputed(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Open Query Editor
                </button>
              </div>

              {/* Type-Specific Settings */}
              {['select', 'multiselect', 'radio'].includes(fieldType) && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      3. Option Choices Configuration
                    </span>
                    <span className="text-[10px] text-slate-400">{options.length} options defined</span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Quick Load Presets:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(PRESETS).map((presetKey) => (
                        <button
                          key={presetKey}
                          type="button"
                          onClick={() => handleApplyPreset(presetKey)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          {presetKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add option input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add an option choice and hit Enter..."
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddOption()}
                      className="text-xs font-bold shrink-0"
                    >
                      Add Option
                    </Button>
                  </div>

                  {/* Option pills list */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {options.map((opt, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <span>{opt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt)}
                          className="text-slate-400 hover:text-rose-500 transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Number / Currency Settings */}
              {['number', 'currency'].includes(fieldType) && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                    3. Numeric &amp; Range Constraints
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Minimum</label>
                      <input
                        type="number"
                        placeholder="e.g. 0"
                        value={minValue ?? ''}
                        onChange={(e) => setMinValue(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Maximum</label>
                      <input
                        type="number"
                        placeholder="e.g. 1000000"
                        value={maxValue ?? ''}
                        onChange={(e) => setMaxValue(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {fieldType === 'currency' ? 'Currency Symbol' : 'Unit / Suffix'}
                      </label>
                      <input
                        type="text"
                        placeholder={fieldType === 'currency' ? '$' : 'e.g. hrs, kg, %'}
                        value={fieldType === 'currency' ? currencySymbol : unit}
                        onChange={(e) => (fieldType === 'currency' ? setCurrencySymbol(e.target.value) : setUnit(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Card 4: Validation, Rules & Module Visibility */}
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

                  {/* Target Module Checkboxes */}
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
            </>
          )}

          {/* TAB 2: SQL & FORMULA QUERY WORKBENCH */}
          {activeTab === 'query' && (
            <div className="space-y-6">
              {/* Query Mode Card & Switch */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                      <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      1. Dynamic Query &amp; Calculated Field Mode
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      When enabled, this field is computed automatically via SQL or logical formula expressions.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isComputed ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={isComputed}
                      onChange={(checked) => {
                        setIsComputed(checked);
                        if (checked && !computedQuery.trim()) {
                          // Load default template
                          handleApplyPresetQuery(QUERY_PRESETS[0]);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Query Language / Engine Selector */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setQueryType('formula')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      queryType === 'formula'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Calculator className="w-4 h-4 mb-1 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold">Calculated Formula</span>
                    <span className="text-[10px] text-slate-400">IF / CONCAT / DATEDIF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQueryType('sql')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      queryType === 'sql'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Database className="w-4 h-4 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold">SQL Data Query</span>
                    <span className="text-[10px] text-slate-400">SELECT ... FROM ...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQueryType('jql')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      queryType === 'jql'
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Filter className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold">JQL Filter Rule</span>
                    <span className="text-[10px] text-slate-400">status = 'ACTIVE' ...</span>
                  </button>
                </div>
              </div>

              {/* Ready-to-use Query Templates */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    2. Ready-to-Use Enterprise Query Templates
                  </span>
                  <span className="text-[10px] text-slate-400">Click to load instantly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUERY_PRESETS.filter((p) => p.queryType === queryType || (queryType === 'formula' && p.category === 'Formula')).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPresetQuery(preset)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedPresetId === preset.id
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {preset.name}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Schema Tokens Palette */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Braces className="w-4 h-4 text-indigo-600" />
                    3. Schema Tokens &amp; Functions Palette
                  </span>

                  {/* Token Category Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {['All', 'Employee', 'Metrics', 'Assets', 'Function'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedTokenCategory(cat)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          selectedTokenCategory === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Token Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {filteredTokens.map((tokenObj) => (
                    <button
                      key={tokenObj.token}
                      type="button"
                      onClick={() => handleInsertToken(tokenObj.token)}
                      title={`${tokenObj.description}\nExample: ${tokenObj.example}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-2.5 h-2.5 text-indigo-500" />
                      <span>{tokenObj.token}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* IDE Code / Query Editor Box */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden space-y-0">
                {/* Editor Top Toolbar */}
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2 font-bold">
                      {queryType.toUpperCase()}_EDITOR.sql
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyQuery}
                      className="text-[10px] font-mono font-semibold text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedQuery ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setComputedQuery('')}
                      className="text-[10px] font-mono font-semibold text-slate-400 hover:text-rose-400 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Textarea Editor Area */}
                <div className="p-4 relative">
                  <textarea
                    ref={queryTextareaRef}
                    rows={6}
                    value={computedQuery}
                    onChange={(e) => setComputedQuery(e.target.value)}
                    placeholder={
                      queryType === 'sql'
                        ? 'SELECT id, name, department, rating FROM candidates WHERE department = "Engineering"...'
                        : 'IF({onboarding.progress} >= 100, "Completed", "In Progress")...'
                    }
                    className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-y leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Editor Bottom Status Bar & Run Button */}
                <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span>Lines: {computedQuery.split('\n').length}</span>
                    <span>Length: {computedQuery.length} chars</span>
                    {queryExecutionResult && !queryExecutionResult.error && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid Syntax ({queryExecutionResult.executionTimeMs}ms)
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleExecuteQuery}
                    isLoading={isExecutingQuery}
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4"
                  >
                    Run Query / Test Expression
                  </Button>
                </div>
              </div>

              {/* Execution Results Console */}
              {queryExecutionResult && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      Query Execution Console Output
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Duration: {queryExecutionResult.executionTimeMs} ms
                    </span>
                  </div>

                  {queryExecutionResult.error ? (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Execution Error
                      </div>
                      <p className="font-mono text-[11px]">{queryExecutionResult.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Scalar Result (Formula / Expression) */}
                      {queryType === 'formula' && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Evaluated Output Value:
                          </span>
                          <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 break-all">
                            {JSON.stringify(queryExecutionResult.result)}
                          </span>
                        </div>
                      )}

                      {/* Tabular Result (SQL / JQL) */}
                      {(queryType === 'sql' || queryType === 'jql') && queryExecutionResult.rows && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Matched Records: <strong>{queryExecutionResult.matchedCount}</strong></span>
                          </div>

                          <div className="max-h-56 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                  {queryExecutionResult.columns?.map((col) => (
                                    <th key={col} className="px-3 py-2 font-bold whitespace-nowrap">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {queryExecutionResult.rows.slice(0, 10).map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    {queryExecutionResult.columns?.map((col) => (
                                      <td key={col} className="px-3 py-2 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                        {String(row[col] ?? '-')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE LIVE PREVIEW (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Live Component Preview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg overflow-hidden">
            {/* Preview Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Live Interactive Component Preview
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">
                {isComputed ? '⚡ QUERY_ENGINE' : fieldType}
              </span>
            </div>

            {/* Interactive Preview Container */}
            <div className="p-6 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
              {/* Candidate Test Switcher */}
              {candidates && candidates.length > 0 && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <label htmlFor="sample-candidate-selector" className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>Test Against Sample Employee:</span>
                  </label>
                  <select
                    id="sample-candidate-selector"
                    value={selectedSampleCandidateId}
                    onChange={(e) => setSelectedSampleCandidateId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()} ({c.jobTitle} - {c.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                    Active Output: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{JSON.stringify(testValue) || '""'}</span>
                  </span>
                  {testValue !== '' && (
                    <button
                      type="button"
                      onClick={() => setTestValue('')}
                      className="text-slate-400 hover:text-slate-600 text-[10px] underline cursor-pointer"
                    >
                      Clear
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
                  <span className="text-slate-400 block text-[10px]">Field Engine:</span>
                  <span className={`font-bold block ${isComputed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {isComputed ? `Computed (${queryType.toUpperCase()})` : 'Standard Static'}
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
