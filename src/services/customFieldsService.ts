export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'boolean'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'upload'
  | 'image'
  | 'tel'
  | 'phone'
  | 'email'
  | 'url'
  | 'rating'
  | 'color';

export interface CustomProfileField {
  id: string;
  label: string;
  key: string;
  type: CustomFieldType | string;
  step: string;
  required: boolean;
  permission: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: string[];
  // Number & Currency specific
  min?: number;
  max?: number;
  stepValue?: number;
  unit?: string;
  currencySymbol?: string;
  // Text & Textarea specific
  minLength?: number;
  maxLength?: number;
  rows?: number;
  pattern?: string;
  // File upload specific
  allowedFormats?: string;
  maxFileSizeMB?: number;
  multipleFiles?: boolean;
  // Date/Time specific
  dateFormat?: string;
  timeFormat?: string;
  // Visibility & Permissions
  showInAddEmployee?: boolean;
  showInOnboarding?: boolean;
  showInProfile?: boolean;
}

export interface StandardFieldConfig {
  key: string;
  label: string;
  category: 'Add Employee' | 'Onboarding' | 'Both';
  required: boolean;
  enabled: boolean;
}

const STORAGE_KEY_CUSTOM_FIELDS = 'quantira_custom_fields';
const STORAGE_KEY_FIELD_CONFIGS = 'quantira_standard_field_configs';

export const DEFAULT_CUSTOM_FIELDS: CustomProfileField[] = [
  {
    id: 'f1',
    label: 'GitHub Username',
    key: 'githubUsername',
    type: 'text',
    step: 'Corporate SSO',
    required: false,
    permission: 'Employee Editable',
    showInAddEmployee: true,
    showInOnboarding: true,
    showInProfile: true
  },
  {
    id: 'f2',
    label: 'T-Shirt Size',
    key: 'tshirtSize',
    type: 'select',
    options: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    step: 'Personal Info',
    required: false,
    permission: 'Employee Editable',
    showInAddEmployee: false,
    showInOnboarding: true,
    showInProfile: true
  },
  {
    id: 'f3',
    label: 'Dietary Restrictions',
    key: 'dietaryRestrictions',
    type: 'select',
    options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher'],
    step: 'Personal Info',
    required: false,
    permission: 'Employee Editable',
    showInAddEmployee: false,
    showInOnboarding: true,
    showInProfile: true
  },
  {
    id: 'f4',
    label: 'LinkedIn Profile URL',
    key: 'linkedInUrl',
    type: 'text',
    step: 'Email Signature',
    required: false,
    permission: 'Employee Editable',
    showInAddEmployee: true,
    showInOnboarding: true,
    showInProfile: true
  },
  {
    id: 'f5',
    label: 'Security Clearance Tier',
    key: 'clearanceTier',
    type: 'select',
    options: ['Tier 1 (Public)', 'Tier 2 (Confidential)', 'Tier 3 (Secret)'],
    step: 'Corporate SSO',
    required: true,
    permission: 'Admin Only',
    showInAddEmployee: true,
    showInOnboarding: false,
    showInProfile: true
  }
];

export const DEFAULT_STANDARD_FIELDS: StandardFieldConfig[] = [
  // Personal Info
  { key: 'title', label: 'Salutation / Title', category: 'Both', required: false, enabled: true },
  { key: 'name', label: 'Full Name', category: 'Both', required: true, enabled: true },
  { key: 'preferredName', label: 'Preferred / Display Name', category: 'Both', required: false, enabled: true },
  { key: 'gender', label: 'Gender', category: 'Both', required: false, enabled: true },
  { key: 'dateOfBirth', label: 'Date of Birth', category: 'Both', required: false, enabled: true },
  { key: 'maritalStatus', label: 'Marital Status', category: 'Both', required: false, enabled: true },
  { key: 'nationality', label: 'Nationality / Citizenship', category: 'Both', required: false, enabled: true },
  { key: 'bloodGroup', label: 'Blood Group', category: 'Both', required: false, enabled: true },

  // Contact & Address
  { key: 'personalEmail', label: 'Personal Email', category: 'Both', required: false, enabled: true },
  { key: 'phone', label: 'Primary Contact Phone', category: 'Both', required: true, enabled: true },
  { key: 'contactNumber2', label: 'Secondary Contact Phone', category: 'Both', required: false, enabled: true },
  { key: 'address', label: 'Residential Street Address', category: 'Onboarding', required: false, enabled: true },
  { key: 'city', label: 'Residential City', category: 'Onboarding', required: false, enabled: true },
  { key: 'state', label: 'Residential State', category: 'Onboarding', required: false, enabled: true },
  { key: 'zipCode', label: 'Residential Zip Code', category: 'Onboarding', required: false, enabled: true },

  // Role & Timeline
  { key: 'employeeId', label: 'Employee ID', category: 'Both', required: true, enabled: true },
  { key: 'designation', label: 'Designation / Job Title', category: 'Both', required: true, enabled: true },
  { key: 'department', label: 'Department / Division', category: 'Both', required: true, enabled: true },
  { key: 'corporateEmail', label: 'Corporate Email (SSO)', category: 'Both', required: true, enabled: true },
  { key: 'startDate', label: 'Official Start Date', category: 'Both', required: true, enabled: true },
  { key: 'employmentType', label: 'Employment Type', category: 'Both', required: true, enabled: true },
  { key: 'workModel', label: 'Work Model (Remote/Hybrid)', category: 'Both', required: false, enabled: true },
  { key: 'workLocation', label: 'Work Location / Office', category: 'Both', required: true, enabled: true },
  { key: 'hireSource', label: 'Hiring Source Channel', category: 'Add Employee', required: false, enabled: true },
  { key: 'offerReference', label: 'Offer Letter Reference', category: 'Add Employee', required: false, enabled: true },

  // Reporting Management
  { key: 'line1Manager', label: 'Primary Line 1 Manager', category: 'Both', required: true, enabled: true },
  { key: 'line2Manager', label: 'Secondary Line 2 Manager', category: 'Both', required: false, enabled: true }
];

export function getCustomFields(): CustomProfileField[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FIELDS);
    if (saved) {
      const parsed: CustomProfileField[] = JSON.parse(saved);
      return parsed.map((f) => ({
        ...f,
        step: f.step ? f.step.replace(/^Step\s*\d+\s*:\s*/i, '').trim() : 'Personal Info',
        required: f.key === 'githubUsername' || f.label?.toLowerCase().includes('github')
          ? false
          : f.required
      }));
    }
  } catch {
    // fallback
  }
  return DEFAULT_CUSTOM_FIELDS.map((f) => ({
    ...f,
    step: f.step ? f.step.replace(/^Step\s*\d+\s*:\s*/i, '').trim() : 'Personal Info',
    required: f.key === 'githubUsername' || f.label?.toLowerCase().includes('github')
      ? false
      : f.required
  }));
}

export function saveCustomFields(fields: CustomProfileField[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_FIELDS, JSON.stringify(fields));
    window.dispatchEvent(new CustomEvent('quantira_custom_fields_updated', { detail: fields }));
  } catch {
    // ignore
  }
}

export function getStandardFieldConfigs(): StandardFieldConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIELD_CONFIGS);
    if (saved) {
      const parsed: StandardFieldConfig[] = JSON.parse(saved);
      const normalized: StandardFieldConfig[] = [];
      const seenKeys = new Set<string>();

      for (const f of parsed) {
        let key = f.key;
        if (key === 'firstName' || key === 'lastName' || key === 'name') {
          key = 'name';
        } else if (key === 'email') {
          key = 'corporateEmail';
        }

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          const defaultDef = DEFAULT_STANDARD_FIELDS.find((d) => d.key === key);
          normalized.push({
            key,
            label: defaultDef ? defaultDef.label : f.label,
            category: defaultDef ? defaultDef.category : (f.category || 'Both'),
            required: f.required ?? (defaultDef ? defaultDef.required : false),
            enabled: f.enabled ?? (defaultDef ? defaultDef.enabled : true)
          });
        }
      }

      // Merge any new default standard fields not yet present in saved data
      for (const def of DEFAULT_STANDARD_FIELDS) {
        if (!seenKeys.has(def.key)) {
          seenKeys.add(def.key);
          normalized.push({ ...def });
        }
      }

      return normalized;
    }
  } catch {
    // fallback
  }
  return DEFAULT_STANDARD_FIELDS;
}

export function saveStandardFieldConfigs(configs: StandardFieldConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FIELD_CONFIGS, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent('quantira_field_configs_updated', { detail: configs }));
  } catch {
    // ignore
  }
}

export interface AssetFieldConfig {
  id: string;
  key: string;
  label: string;
  section: string;
  type: CustomFieldType | string;
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
  stepValue?: number;
  unit?: string;
  currencySymbol?: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  allowedFormats?: string;
  maxFileSizeMB?: number;
  multipleFiles?: boolean;
}

const STORAGE_KEY_ASSET_FIELDS = 'quantira_asset_field_configs';

export const DEFAULT_ASSET_FIELDS: AssetFieldConfig[] = [
  { id: 'ast-1', key: 'name', label: 'Hardware Model & Name', section: 'Hardware Identity', type: 'text', required: true, enabled: true },
  { id: 'ast-2', key: 'category', label: 'Hardware Category', section: 'Hardware Identity', type: 'select', required: true, enabled: true },
  { id: 'ast-3', key: 'assetTag', label: 'Asset Tag ID', section: 'Hardware Identity', type: 'text', required: true, enabled: true },
  { id: 'ast-4', key: 'serialNumber', label: 'Serial Number', section: 'Hardware Identity', type: 'text', required: true, enabled: true },
  { id: 'ast-5', key: 'status', label: 'Operational Inventory Status', section: 'Hardware Identity', type: 'select', required: true, enabled: true },
  { id: 'ast-6', key: 'condition', label: 'Physical Device Condition', section: 'Hardware Identity', type: 'select', required: true, enabled: true },
  { id: 'ast-7', key: 'processor', label: 'Processor / CPU Architecture', section: 'Technical Specs', type: 'text', required: false, enabled: true },
  { id: 'ast-8', key: 'ram', label: 'Installed Memory (RAM)', section: 'Technical Specs', type: 'text', required: false, enabled: true },
  { id: 'ast-9', key: 'storage', label: 'Internal Storage (SSD/NVMe)', section: 'Technical Specs', type: 'text', required: false, enabled: true },
  { id: 'ast-10', key: 'os', label: 'Operating System & Edition', section: 'Technical Specs', type: 'text', required: false, enabled: true },
  { id: 'ast-11', key: 'display', label: 'Display & Screen Resolution', section: 'Technical Specs', type: 'text', required: false, enabled: true },
  { id: 'ast-12', key: 'location', label: 'Storage / Facility Location', section: 'Procurement & Warranty', type: 'select', required: true, enabled: true },
  { id: 'ast-13', key: 'storageBay', label: 'Storage Bay / Shelf Rack', section: 'Procurement & Warranty', type: 'text', required: false, enabled: true },
  { id: 'ast-14', key: 'vendor', label: 'Procurement Vendor', section: 'Procurement & Warranty', type: 'text', required: false, enabled: true },
  { id: 'ast-15', key: 'purchaseCost', label: 'Purchase Cost (USD)', section: 'Procurement & Warranty', type: 'currency', required: false, enabled: true },
  { id: 'ast-16', key: 'purchaseDate', label: 'Purchase / Invoice Date', section: 'Procurement & Warranty', type: 'date', required: false, enabled: true },
  { id: 'ast-17', key: 'warrantyExpiry', label: 'Warranty Expiration Date', section: 'Procurement & Warranty', type: 'date', required: false, enabled: true },
  { id: 'ast-18', key: 'imageUrl', label: 'Hardware Photo / Thumbnail', section: 'Deployment & Notes', type: 'image', required: false, enabled: true },
  { id: 'ast-19', key: 'accessories', label: 'Included Peripherals / Accessories', section: 'Deployment & Notes', type: 'text', required: false, enabled: true },
  { id: 'ast-20', key: 'notes', label: 'Deployment & Maintenance Notes', section: 'Deployment & Notes', type: 'textarea', required: false, enabled: true }
];

export function getAssetFieldConfigs(): AssetFieldConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ASSET_FIELDS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return DEFAULT_ASSET_FIELDS;
}

export function saveAssetFieldConfigs(configs: AssetFieldConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ASSET_FIELDS, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent('quantira_asset_field_configs_updated', { detail: configs }));
  } catch {
    // ignore
  }
}

export const STORAGE_KEY_EMPLOYEE_FIELD_ORDER = 'quantira_employee_field_order';
export const STORAGE_KEY_EMPLOYEE_SECTION_ORDER = 'quantira_employee_section_order';
export const STORAGE_KEY_ASSET_SECTION_ORDER = 'quantira_asset_section_order';
export const STORAGE_KEY_WORKFLOW_SECTION_ORDER = 'quantira_workflow_section_order';
export const STORAGE_KEY_STEP_CONFIGS = 'quantira_step_configs';

export function getEmployeeFieldOrder(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEE_FIELD_ORDER);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveEmployeeFieldOrder(order: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEE_FIELD_ORDER, JSON.stringify(order));
    window.dispatchEvent(new CustomEvent('quantira_employee_field_order_updated', { detail: order }));
  } catch {}
}

export function getEmployeeSectionOrder(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEE_SECTION_ORDER);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveEmployeeSectionOrder(sections: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEE_SECTION_ORDER, JSON.stringify(sections));
    window.dispatchEvent(new CustomEvent('quantira_employee_section_order_updated', { detail: sections }));
  } catch {}
}

export function getAssetSectionOrder(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ASSET_SECTION_ORDER);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveAssetSectionOrder(sections: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ASSET_SECTION_ORDER, JSON.stringify(sections));
    window.dispatchEvent(new CustomEvent('quantira_asset_section_order_updated', { detail: sections }));
  } catch {}
}

export function getWorkflowSectionOrder(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WORKFLOW_SECTION_ORDER);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function saveWorkflowSectionOrder(sections: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WORKFLOW_SECTION_ORDER, JSON.stringify(sections));
    window.dispatchEvent(new CustomEvent('quantira_workflow_section_order_updated', { detail: sections }));
  } catch {}
}

