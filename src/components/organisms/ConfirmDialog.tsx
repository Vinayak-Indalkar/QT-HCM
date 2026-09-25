import React from 'react';
import { Modal } from './Modal';
import { Button } from '../atoms/Button';
import { AlertTriangle, Info, AlertOctagon, CheckCircle2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  consequence?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  consequence,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  const iconConfig = {
    danger: {
      icon: AlertOctagon,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      buttonVariant: 'destructive' as const
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      buttonVariant: 'primary' as const
    },
    info: {
      icon: Info,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      buttonVariant: 'primary' as const
    },
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      buttonVariant: 'primary' as const
    }
  };

  const current = iconConfig[variant];
  const IconComponent = current.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={current.buttonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${current.bg}`}>
          <IconComponent className={`w-6 h-6 ${current.color}`} aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-700 dark:text-slate-200 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
          {consequence && (
            <div className="p-2.5 rounded-md bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 font-medium">
              ⚠️ <strong>Warning:</strong> {consequence}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
