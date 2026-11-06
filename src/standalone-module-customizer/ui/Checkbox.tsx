import React, { forwardRef, useEffect, useRef, useId } from 'react';
import { cn } from './cn';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      indeterminate = false,
      checked = false,
      disabled = false,
      className,
      id: customId,
      onChange,
      ...props
    },
    ref
  ) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref || defaultRef) as React.RefObject<HTMLInputElement>;
    const generatedId = useId();
    const id = customId || generatedId;
    const descId = `${id}-desc`;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, resolvedRef]);

    return (
      <div className={cn('flex items-start gap-2.5 select-none text-left', className)}>
        <div className="relative flex items-center mt-0.5">
          <input
            ref={resolvedRef}
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            aria-describedby={description ? descId : undefined}
            className="sr-only peer"
            {...props}
          />
          <div
            onClick={() => !disabled && resolvedRef.current?.click()}
            className={cn(
              'w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer',
              'border-slate-300 dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-900',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2',
              checked || indeterminate
                ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-600'
                : 'hover:border-slate-400 dark:hover:border-slate-500',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
            )}
            aria-hidden="true"
          >
            {indeterminate ? (
              <Minus className="w-3 h-3 stroke-[3]" />
            ) : checked ? (
              <Check className="w-3 h-3 stroke-[3]" />
            ) : null}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'text-xs font-medium text-slate-800 dark:text-slate-100 dark:text-slate-200 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p id={descId} className="text-[11px] text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
