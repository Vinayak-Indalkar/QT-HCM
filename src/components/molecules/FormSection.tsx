import React from 'react';
import { cn } from '../../utils/cn';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <fieldset className={cn('pt-4 first:pt-0 text-left', className)}>
      {title && (
        <div className="mb-3">
          <legend className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </legend>
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
};
