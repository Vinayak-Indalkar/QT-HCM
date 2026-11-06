import React, { forwardRef, useId } from 'react';
import { cn } from './cn';
import { X, AlertCircle } from 'lucide-react';

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      helperText,
      error,
      id: customId,
      leftIcon,
      rightIcon,
      onClear,
      value,
      disabled,
      required,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasValue = value !== undefined && value !== '';

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between"
          >
            <span>
              {label}
              {required && (
                <span className="text-rose-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              )}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            value={value}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full text-base rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightIcon || (onClear && hasValue) ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-300 dark:border-slate-700',
              className
            )}
            {...props}
          />

          {onClear && hasValue && !disabled ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={`Clear ${label || 'input'}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
              {rightIcon}
            </div>
          ) : null}
        </div>

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

TextInput.displayName = 'TextInput';
