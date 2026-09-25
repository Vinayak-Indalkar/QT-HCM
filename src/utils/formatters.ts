import { OnboardingStatus } from '../types/candidate';

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount?: number, currency = 'USD'): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getStatusBadgeConfig(status: OnboardingStatus): {
  label: string;
  sentiment: 'neutral' | 'info' | 'success' | 'warning' | 'negative';
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'draft':
      return {
        label: 'Draft',
        sentiment: 'neutral',
        bgClass: 'bg-slate-100 dark:bg-slate-800/60',
        textClass: 'text-slate-700 dark:text-slate-300',
        borderClass: 'border-slate-300 dark:border-slate-700',
        dotClass: 'bg-slate-400'
      };
    case 'invited':
      return {
        label: 'Invited',
        sentiment: 'info',
        bgClass: 'bg-sky-50 dark:bg-sky-950/50',
        textClass: 'text-sky-700 dark:text-sky-300',
        borderClass: 'border-sky-300 dark:border-sky-800',
        dotClass: 'bg-sky-500'
      };
    case 'document_submission':
      return {
        label: 'Doc Submission',
        sentiment: 'warning',
        bgClass: 'bg-amber-50 dark:bg-amber-950/50',
        textClass: 'text-amber-700 dark:text-amber-300',
        borderClass: 'border-amber-300 dark:border-amber-800',
        dotClass: 'bg-amber-500 animate-pulse'
      };
    case 'verification':
      return {
        label: 'Verification',
        sentiment: 'info',
        bgClass: 'bg-indigo-50 dark:bg-indigo-950/50',
        textClass: 'text-indigo-700 dark:text-indigo-300',
        borderClass: 'border-indigo-300 dark:border-indigo-800',
        dotClass: 'bg-indigo-500'
      };
    case 'equipment_provisioning':
      return {
        label: 'IT Provisioning',
        sentiment: 'info',
        bgClass: 'bg-purple-50 dark:bg-purple-950/50',
        textClass: 'text-purple-700 dark:text-purple-300',
        borderClass: 'border-purple-300 dark:border-purple-800',
        dotClass: 'bg-purple-500'
      };
    case 'orientation_scheduled':
      return {
        label: 'Orientation Scheduled',
        sentiment: 'success',
        bgClass: 'bg-teal-50 dark:bg-teal-950/50',
        textClass: 'text-teal-700 dark:text-teal-300',
        borderClass: 'border-teal-300 dark:border-teal-800',
        dotClass: 'bg-teal-500'
      };
    case 'completed':
      return {
        label: 'Completed',
        sentiment: 'success',
        bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-300 dark:border-emerald-800',
        dotClass: 'bg-emerald-500'
      };
    case 'rejected':
      return {
        label: 'Rescinded / Terminated',
        sentiment: 'negative',
        bgClass: 'bg-rose-50 dark:bg-rose-950/50',
        textClass: 'text-rose-700 dark:text-rose-300',
        borderClass: 'border-rose-300 dark:border-rose-800',
        dotClass: 'bg-rose-500'
      };
    default:
      return {
        label: status,
        sentiment: 'neutral',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        borderClass: 'border-slate-300 dark:border-slate-700',
        dotClass: 'bg-slate-400'
      };
  }
}
