import React, { useState } from 'react';
import { CustomFieldDefinition } from '../types';
import { TextInput, TextArea, Select, DatePicker, Switch, Checkbox } from '../ui';
import {
  UploadCloud,
  FileText,
  Star,
  HelpCircle,
  Clock,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Hash,
  Palette,
  Check,
  X,
  Sparkles,
  Calculator,
  Code2
} from 'lucide-react';
import { evaluateCustomFieldQuery } from '../services/queryEngineService';

export interface DynamicCustomFieldInputProps {
  field: CustomFieldDefinition | any;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  showHelpText?: boolean;
  showLabel?: boolean;
}

export const DynamicCustomFieldInput: React.FC<DynamicCustomFieldInputProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  className = '',
  showHelpText = true,
  showLabel = true
}) => {
  const [dragActive, setDragActive] = useState(false);

  const rawType = (field.type || 'text').toString().toLowerCase();
  const label = field.label || field.key || 'Field';
  const isRequired = Boolean(field.required);
  const placeholder = field.placeholder || `Enter ${label.toLowerCase()}...`;
  const helpText = field.helpText || '';
  const options: string[] = Array.isArray(field.options) ? field.options : [];

  const isComputed = Boolean(field.isComputed && field.computedQuery);

  // Helper label wrapper
  const renderLabel = () => {
    if (!showLabel) return null;
    return (
      <div className="flex items-center justify-between gap-1.5 mb-1.5 text-left">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>{label}</span>
          {isRequired && <span className="text-rose-500 font-black">*</span>}
          {isComputed && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              ⚡ Computed Query
            </span>
          )}
        </label>
        {helpText && (
          <span className="inline-flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help" title={helpText}>
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    );
  };

  const renderHelpText = () => {
    if (!showHelpText || !helpText) return null;
    return <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-left">{helpText}</p>;
  };

  // 1. Text Area
  if (rawType === 'textarea') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <TextArea
          rows={field.rows || 3}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          required={isRequired}
          maxLength={field.maxLength}
          className="w-full text-xs"
        />
        {field.maxLength && (
          <div className="flex justify-end mt-0.5">
            <span className="text-[10px] text-slate-400">
              {((value ?? '') as string).length} / {field.maxLength}
            </span>
          </div>
        )}
        {renderHelpText()}
      </div>
    );
  }

  // 2. Select / Dropdown
  if (rawType === 'select') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <Select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || readOnly}
          required={isRequired}
          options={[
            { label: placeholder || 'Select an option...', value: '' },
            ...options.map((opt) => ({ label: opt, value: opt }))
          ]}
          className="w-full text-xs"
        />
        {renderHelpText()}
      </div>
    );
  }

  // 3. Multi-Select Tags
  if (rawType === 'multiselect' || rawType === 'tags') {
    const selectedValues: string[] = Array.isArray(value)
      ? value
      : typeof value === 'string' && value
      ? value.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const toggleOption = (opt: string) => {
      if (disabled || readOnly) return;
      const next = selectedValues.includes(opt)
        ? selectedValues.filter((v) => v !== opt)
        : [...selectedValues, opt];
      onChange(next);
    };

    return (
      <div className={`w-full text-left space-y-1.5 ${className}`}>
        {renderLabel()}
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 min-h-[42px]">
          {options.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No options configured</span>
          ) : (
            options.map((opt) => {
              const active = selectedValues.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled || readOnly}
                  onClick={() => toggleOption(opt)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  <span>{opt}</span>
                </button>
              );
            })
          )}
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 4. Radio Buttons
  if (rawType === 'radio') {
    return (
      <div className={`w-full text-left space-y-1.5 ${className}`}>
        {renderLabel()}
        <div className="flex flex-wrap gap-3 pt-1">
          {options.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                value === opt
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name={field.id || field.key}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                disabled={disabled || readOnly}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 5. Boolean Switch / Checkbox
  if (rawType === 'boolean' || rawType === 'checkbox') {
    const isChecked = Boolean(value);
    return (
      <div className={`w-full text-left ${className}`}>
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>{label}</span>
              {isRequired && <span className="text-rose-500">*</span>}
            </span>
            {helpText && <p className="text-[11px] text-slate-400">{helpText}</p>}
          </div>
          <Switch
            checked={isChecked}
            onChange={(checked) => onChange(checked)}
            disabled={disabled || readOnly}
          />
        </div>
      </div>
    );
  }

  // 6. Date Picker
  if (rawType === 'date') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <DatePicker
            value={value ?? ''}
            onChange={(val) => onChange(val)}
            disabled={disabled || readOnly}
            required={isRequired}
            className="w-full text-xs"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 7. Time Picker
  if (rawType === 'time') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="time"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={isRequired}
            step={field.stepValue ? field.stepValue * 60 : 300}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 8. Date-Time Picker
  if (rawType === 'datetime') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="datetime-local"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={isRequired}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 9. Number / Numeric
  if (rawType === 'number') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="number"
            min={field.min}
            max={field.max}
            step={field.stepValue || 1}
            placeholder={placeholder || '0'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={disabled || readOnly}
            required={isRequired}
            className="w-full pl-9 pr-12 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
          {field.unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 uppercase">
              {field.unit}
            </span>
          )}
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 10. Currency
  if (rawType === 'currency') {
    const symbol = field.currencySymbol || '$';
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <span className="font-bold text-xs text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            {symbol}
          </span>
          <input
            type="number"
            step="0.01"
            min={field.min || 0}
            max={field.max}
            placeholder={placeholder || '0.00'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={disabled || readOnly}
            required={isRequired}
            className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 11. Phone
  if (rawType === 'phone' || rawType === 'tel') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="tel"
            placeholder={placeholder || '+1 (555) 000-0000'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={isRequired}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 12. Email
  if (rawType === 'email') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            placeholder={placeholder || 'user@company.com'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={isRequired}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 13. Website URL
  if (rawType === 'url') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="relative">
          <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="url"
            placeholder={placeholder || 'https://example.com'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            required={isRequired}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 14. File / Document / Image Upload
  if (rawType === 'file' || rawType === 'upload' || rawType === 'image') {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const fileNames = Array.from(e.target.files).map((f) => f.name).join(', ');
        onChange(fileNames);
      }
    };

    return (
      <div className={`w-full text-left space-y-1.5 ${className}`}>
        {renderLabel()}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const fileNames = Array.from(e.dataTransfer.files).map((f) => f.name).join(', ');
              onChange(fileNames);
            }
          }}
          className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50'
          }`}
        >
          <input
            type="file"
            disabled={disabled || readOnly}
            onChange={handleFileChange}
            multiple={Boolean(field.multipleFiles)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            {value ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{String(value)}</span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click or drag file to upload
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Formats: {field.allowedFormats || 'PDF, DOCX, PNG, JPG'} (Max: {field.maxFileSizeMB || 10} MB)
                </p>
              </div>
            )}
          </div>
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 15. Rating / Stars
  if (rawType === 'rating') {
    const maxScore = field.max || 5;
    const currentScore = typeof value === 'number' ? value : 0;
    return (
      <div className={`w-full text-left space-y-1.5 ${className}`}>
        {renderLabel()}
        <div className="flex items-center gap-1.5 pt-1">
          {Array.from({ length: maxScore }).map((_, idx) => {
            const score = idx + 1;
            const isFilled = score <= currentScore;
            return (
              <button
                key={score}
                type="button"
                disabled={disabled || readOnly}
                onClick={() => onChange(score === currentScore ? 0 : score)}
                className={`p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                  isFilled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                }`}
              >
                <Star className={`w-5 h-5 ${isFilled ? 'fill-amber-400' : ''}`} />
              </button>
            );
          })}
          {currentScore > 0 && (
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
              {currentScore} / {maxScore}
            </span>
          )}
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // 16. Color Picker
  if (rawType === 'color') {
    return (
      <div className={`w-full text-left ${className}`}>
        {renderLabel()}
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value || '#3B82F6'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent p-0.5"
          />
          <input
            type="text"
            value={value || '#3B82F6'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || readOnly}
            placeholder="#3B82F6"
            className="w-28 px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        {renderHelpText()}
      </div>
    );
  }

  // Default: Standard Text Input
  return (
    <div className={`w-full text-left ${className}`}>
      {renderLabel()}
      <TextInput
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || readOnly}
        required={isRequired}
        maxLength={field.maxLength}
        pattern={field.pattern}
        className="w-full text-xs"
      />
      {renderHelpText()}
    </div>
  );
};
