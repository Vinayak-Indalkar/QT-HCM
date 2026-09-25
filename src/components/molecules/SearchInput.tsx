import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (debouncedValue: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onDebouncedChange,
      debounceMs = 300,
      isLoading = false,
      placeholder = 'Search by name, role, department...',
      className,
      ariaLabel = 'Search records',
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(value);
    const debouncedValue = useDebounce(localValue, debounceMs);

    // Sync external value changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Fire debounced callback
    useEffect(() => {
      if (onDebouncedChange) {
        onDebouncedChange(debouncedValue);
      }
    }, [debouncedValue, onDebouncedChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalValue(val);
      onChange(val);
    };

    const handleClear = () => {
      setLocalValue('');
      onChange('');
      if (onDebouncedChange) {
        onDebouncedChange('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && localValue) {
        e.preventDefault();
        handleClear();
      }
    };

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>

        <input
          ref={ref}
          type="search"
          role="searchbox"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full text-xs sm:text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-2 pl-9 pr-9 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          {...props}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" aria-label="Searching..." />
          ) : localValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
