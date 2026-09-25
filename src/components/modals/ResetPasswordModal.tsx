import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Candidate } from '../../types/candidate';
import { useOnboarding } from '../../context/OnboardingContext';
import { useToast } from '../../context/ToastContext';
import { KeyRound, ShieldCheck, RefreshCw, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  candidate
}) => {
  const { updateCandidate } = useOnboarding();
  const { success: showToastSuccess } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [requireChangeOnLogin, setRequireChangeOnLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [savedPassword, setSavedPassword] = useState('');

  if (!candidate) return null;

  const generateStrongPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 14; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setConfirmPassword(pwd);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError('Please enter or generate a new password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    updateCandidate(candidate.id, {
      password: newPassword
    });

    setSavedPassword(newPassword);
    setIsSuccessModalOpen(true);
    showToastSuccess('Password Reset', `Password successfully reset for ${candidate.firstName} ${candidate.lastName}.`);
  };

  const handleCloseAll = () => {
    setIsSuccessModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isSuccessModalOpen}
        onClose={onClose}
        title="Reset Employee Password"
        description={`Assign a new secure password or credentials for ${candidate.firstName} ${candidate.lastName} (${candidate.id}).`}
        size="md"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              leftIcon={<KeyRound className="w-4 h-4" />}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Reset Password
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Employee Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {candidate.firstName} {candidate.lastName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                <a
                  href={`mailto:${candidate.email}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                >
                  {candidate.email}
                </a>{' '}
                • {candidate.jobTitle}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              {candidate.id}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                New Temporary Password
              </label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Generate Secure Password
              </button>
            </div>

            <div className="relative">
              <TextInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter minimum 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block mb-1">
                Confirm Password
              </label>
              <TextInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-type password"
                required
              />
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>
                Send password reset notification email to{' '}
                <a
                  href={`mailto:${candidate.email}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {candidate.email}
                </a>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={requireChangeOnLogin}
                onChange={(e) => setRequireChangeOnLogin(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Force user to change password at next login</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseAll}
        title="Password Reset Confirmation"
        description="The employee authentication credentials have been successfully updated."
        size="md"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="primary" onClick={handleCloseAll} className="bg-emerald-600 hover:bg-emerald-700">
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Password Successfully Reset
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                The temporary password has been activated for <strong>{candidate.firstName} {candidate.lastName}</strong> ({candidate.id}).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs text-slate-500">Updated Credentials:</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Username / Email:</span>
              <a
                href={`mailto:${candidate.email}`}
                className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {candidate.email}
              </a>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Temporary Password:</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded">
                {savedPassword}
              </span>
            </div>
          </div>

          {sendEmailNotification && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Notification email dispatched to{' '}
              <a
                href={`mailto:${candidate.email}`}
                className="font-semibold underline hover:text-emerald-900 dark:hover:text-emerald-300"
              >
                {candidate.email}
              </a>.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};
