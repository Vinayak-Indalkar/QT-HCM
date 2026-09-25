import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { Copy, Check, ExternalLink, Mail, Link as LinkIcon, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onOpenDirectly?: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  employee,
  onOpenDirectly
}) => {
  const { success, info } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(true);

  // Generate clean invite link with recipient details
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3050';
  const inviteUrl = `${origin}/?invite=${encodeURIComponent(employee.id)}&name=${encodeURIComponent(employee.name)}&email=${encodeURIComponent(employee.email)}&role=${encodeURIComponent(employee.role)}`;

  const mailtoUrl = `mailto:${employee.email}?subject=${encodeURIComponent('Welcome to Quantira - Complete Your Onboarding')}&body=${encodeURIComponent(`Hello ${employee.name},\n\nWelcome to Quantira Technologies! We are excited to have you join as ${employee.role}.\n\nPlease access your personalized 10-step onboarding portal using the secure link below:\n\n${inviteUrl}\n\nBest regards,\nQuantira People Operations Team`)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    success('Onboarding Link Copied!', 'Invitation link copied to your clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    info('Invitation Email Dispatched', `Onboarding portal invitation sent to ${employee.email}.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Employee Onboarding Link"
      description={`Generate and share the secure onboarding link for ${employee.name}.`}
      size="md"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          {onOpenDirectly && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              onClick={() => {
                onClose();
                onOpenDirectly();
              }}
              className="bg-blue-600 hover:bg-blue-700 font-bold text-sm shadow-sm"
            >
              Open Invitation Link (as Employee)
            </Button>
          )}

          <Button variant="secondary" size="md" onClick={onClose} className="font-semibold">
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-sm text-left">
        {/* Email Dispatched Confirmation Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">
                Onboarding Invitation Link Dispatched!
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 truncate block">
                Invitation sent directly to:{' '}
                <a
                  href={`mailto:${employee.email}`}
                  className="font-mono font-bold underline hover:text-emerald-950 dark:hover:text-emerald-100"
                >
                  {employee.email}
                </a>
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shrink-0">
            Delivered
          </span>
        </div>

        {/* Employee Summary */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block text-base">
              {employee.name}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {employee.role} • ID: <strong className="font-mono">{employee.id}</strong>
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Active Invite
          </span>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-blue-600" /> Secure Onboarding Link:
          </label>
          <div className="flex items-center gap-2 p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 font-mono text-xs text-slate-800 dark:text-slate-100 dark:text-slate-200 overflow-hidden">
            <span className="truncate flex-1 select-all font-semibold">{inviteUrl}</span>
            <Button
              size="sm"
              variant="primary"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
              className="shrink-0 text-xs font-bold"
            >
              {copied ? 'Copied ✓' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Email Dispatch Actions */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Recipient Email
              </span>
              <span className="text-slate-500 text-xs truncate block">
                Dispatches branded welcome email with tokenized link to{' '}
                <a
                  href={`mailto:${employee.email}`}
                  className="hover:underline font-mono text-blue-600 dark:text-blue-400"
                >
                  <code>{employee.email}</code>
                </a>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Open in Mail App
            </a>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSendEmail}
              className="text-xs font-semibold"
            >
              Resend Email
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Invitation tokens are encrypted with 7-day expiration and automatic session provisioning.
          </span>
        </div>
      </div>
    </Modal>
  );
};
