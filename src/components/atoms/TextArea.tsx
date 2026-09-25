import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  showCount?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      helperText,
      error,
      id: customId,
      value,
      maxLength,
      showCount = false,
      disabled,
      required,
      className,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
          >
            <span>
              {label}
              {required && (
                <span className="text-rose-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              )}
            </span>
            {showCount && maxLength && (
              <span className="text-[11px] font-normal text-slate-400">
                {charCount} / {maxLength}
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          value={value}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full text-sm rounded-md border bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed resize-y',
            error
              ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-300 dark:border-slate-700',
            className
          )}
          {...props}
        />

        {error ? (
          <div
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium animate-fade-in"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
