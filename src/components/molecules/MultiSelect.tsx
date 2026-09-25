import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '../../utils/cn';
import { X, ChevronDown, Check, AlertCircle } from 'lucide-react';

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  helperText,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  required = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const id = `multiselect-${generatedId}`;
  const listboxId = `${id}-listbox`;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
    triggerRef.current?.focus();
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className={cn('relative w-full flex flex-col gap-1.5 text-left', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen((prev) => !prev);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className={cn(
          'w-full min-h-10 text-sm rounded-md border bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:text-slate-100 p-1.5 flex flex-wrap items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
          error
            ? 'border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700',
          disabled && 'opacity-50 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'
        )}
      >
        {value.length === 0 ? (
          <span className="text-slate-400 dark:text-slate-500 px-2 select-none text-xs">
            {placeholder}
          </span>
        ) : (
          value.map((val) => {
            const opt = options.find((o) => o.value === val);
            const labelText = opt ? opt.label : val;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 select-none"
              >
                <span>{labelText}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveTag(e, val)}
                    className="p-0.5 hover:text-rose-600 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                    aria-label={`Remove ${labelText}`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </span>
            );
          })
        )}

        <ChevronDown
          className={cn(
            'ml-auto w-4 h-4 text-slate-400 mr-1.5 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-xl py-1 animate-fade-in max-h-60 overflow-y-auto"
        >
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                placeholder="Search choices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                aria-label="Filter available choices"
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 dark:text-slate-400 text-center">
              No options available.
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleToggleOption(opt.value)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-xs cursor-pointer select-none transition-colors',
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200 font-medium'
                      : 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
                </div>
              );
            })
          )}
        </div>
      )}

      {error ? (
        <div role="alert" className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
