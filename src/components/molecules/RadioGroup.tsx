import React, { useId } from 'react';
import { cn } from '../../utils/cn';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  name?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name: customName,
  options,
  value,
  onChange,
  direction = 'vertical',
  disabled = false,
  error,
  className
}) => {
  const generatedId = useId();
  const name = customName || `radiogroup-${generatedId}`;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex flex-col gap-2 text-left', className)}
    >
      {label && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}

      <div
        className={cn(
          'flex gap-3',
          direction === 'vertical' ? 'flex-col' : 'flex-wrap items-center'
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const optDisabled = disabled || option.disabled;
          const optId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optId}
              className={cn(
                'relative flex items-start gap-2.5 p-2 rounded-md border cursor-pointer select-none transition-colors',
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500'
                  : 'border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700',
                optDisabled && 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
              )}
            >
              <input
                type="radio"
                id={optId}
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={optDisabled}
                onChange={() => !optDisabled && onChange(option.value)}
                className="sr-only peer"
              />

              <div
                className={cn(
                  'w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center transition-all',
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500'
                    : 'border-slate-400 dark:border-slate-600',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2'
                )}
                aria-hidden="true"
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-100 dark:text-slate-200">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <span role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
