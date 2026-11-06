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

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: CustomFieldType | string;
  section: string;
  required: boolean;
  enabled?: boolean;
  permission?: string;
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

  // Date / Time specific
  dateFormat?: string;
  timeFormat?: string;

  // Computed & Query Engine
  isComputed?: boolean;
  queryType?: 'formula' | 'sql' | 'jql' | 'jsonpath';
  computedQuery?: string;
  fallbackValue?: any;

  // Module specific visibility flags
  showInCreate?: boolean;
  showInDetails?: boolean;
  showInTable?: boolean;
  isStandard?: boolean;
}

export type CustomProfileField = CustomFieldDefinition;
export type AssetFieldConfig = CustomFieldDefinition;

export interface CustomizerSection {
  name: string;
  module: string;
  order: number;
  isStandard?: boolean;
}

export interface CustomizerModule {
  id: string;
  label: string;
  description?: string;
  defaultSections: string[];
}

export interface SchemaVariable {
  token: string;
  label: string;
  category: string;
  description: string;
  example: string;
}

export interface QueryPreset {
  id: string;
  name: string;
  category: 'Formula' | 'SQL' | 'JQL' | 'JSONPath';
  queryType: 'formula' | 'sql' | 'jql' | 'jsonpath';
  description: string;
  query: string;
  suggestedFieldType: 'text' | 'number' | 'currency' | 'select' | 'boolean';
}

export interface QueryEvaluationResult {
  success: boolean;
  result: any;
  error?: string;
  executionTimeMs?: number;
  resolvedQuery?: string;
}

