import React, { useState } from 'react';
import { useOnboardingFlow } from '../../../context/OnboardingFlowContext';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { formatDate, formatDateTime } from '../../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  KeyRound,
  Camera,
  AtSign,
  Laptop,
  Users,
  Building,
  Edit,
  Eye,
  Sparkles,
  User,
  Check,
  Car,
  Lock,
  Briefcase
} from 'lucide-react';

export interface StepReviewProps {
  onReturnToDashboard?: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({ onReturnToDashboard }) => {
  const { data, goToStep, completeOnboarding } = useOnboardingFlow();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFinalSubmit = () => {
    completeOnboarding();
    setShowConfirmModal(false);

    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (onReturnToDashboard) {
      setTimeout(() => {
        onReturnToDashboard();
      }, 700);
    }
  };

  const isCompleted = data.status === 'Completed';

  if (isCompleted) {
    return (
      <div className="p-8 sm:p-12 text-center max-w-3xl mx-auto rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 animate-fade-in space-y-6 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Onboarding Completed &amp; Submitted!
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-xl mx-auto">
            Your comprehensive onboarding package has been submitted to Human Resources and IT Operations. Welcome to Quantira Technologies, <strong>{data.personalInfo.firstName} {data.personalInfo.lastName}</strong>!
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 font-bold text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5" /> Status: Dossier Submitted &amp; Profile Active
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {onReturnToDashboard && (
            <Button
              variant="primary"
              size="lg"
              onClick={onReturnToDashboard}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-6 shadow-md"
            >
              View My Profile Dossier
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => goToStep(0)}
            className="text-base"
          >
            Review Submitted Answers
          </Button>
        </div>
      </div>
    );
  }

  const uploadedDocsCount = data.documents.filter((d) => d.status === 'uploaded').length;

  return (
    <div className="space-y-8 text-left animate-fade-in pb-8">
      {/* Header Banner */}
      <div className="pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Final Review &amp; Onboarding Submission
        </h1>
      </div>

      <div className="space-y-6">
        {/* ===================================================================== */}
        {/* GROUP 1: PERSONAL & DOCUMENTS */}
        {/* ===================================================================== */}
        <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Personal Information &amp; Statutory Documents
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Complete
                  </span>
                </h2>
              </div>
            </div>

            <Button
              size="sm"
              variant="tertiary"
              onClick={() => goToStep(0)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit Step 1
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Full Legal Name</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.title ? `${data.personalInfo.title} ` : ''}{data.personalInfo.firstName} {data.personalInfo.middleName ? `${data.personalInfo.middleName} ` : ''}{data.personalInfo.lastName}
                {data.personalInfo.preferredName && <span className="text-slate-500 font-normal ml-1">({data.personalInfo.preferredName})</span>}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Employee ID</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.employeeId}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Official Designation</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.jobTitle}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.department}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Demographics</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.gender || 'Not specified'} • {data.personalInfo.maritalStatus || 'Single'} • {data.personalInfo.bloodGroup || 'O+'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Work Location</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.workLocation || 'HQ'} ({data.personalInfo.employmentType || 'Full-time'})
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Official Start Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {formatDate(data.personalInfo.startDate)}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Reporting Managers</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.line1Manager || 'Not assigned'} {data.personalInfo.line2Manager && `• Exec: ${data.personalInfo.line2Manager}`}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Corporate Email</span>
              {data.personalInfo.corporateEmail || data.corporateAccount?.corporateEmail || data.personalInfo.email ? (
                <a
                  href={`mailto:${data.personalInfo.corporateEmail || data.corporateAccount?.corporateEmail || data.personalInfo.email}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm truncate block"
                  title="Send email"
                >
                  {data.personalInfo.corporateEmail || data.corporateAccount?.corporateEmail || data.personalInfo.email}
                </a>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm truncate block">
                  Not assigned
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Personal Email</span>
              {data.personalInfo.personalEmail ? (
                <a
                  href={`mailto:${data.personalInfo.personalEmail}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm truncate block"
                  title="Send email"
                >
                  {data.personalInfo.personalEmail}
                </a>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm truncate block">
                  Not provided
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Contact Numbers</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                {data.personalInfo.contactNumber1 || data.personalInfo.phone || 'Not provided'} {data.personalInfo.contactNumber2 ? ` / ${data.personalInfo.contactNumber2}` : ''}
              </span>
            </div>
            {data.personalInfo.emergencyContacts && data.personalInfo.emergencyContacts.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Emergency Contacts</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                  {data.personalInfo.emergencyContacts.length} {data.personalInfo.emergencyContacts.length === 1 ? 'Contact' : 'Contacts'} Registered
                </span>
              </div>
            )}
            {data.personalInfo.dependents && data.personalInfo.dependents.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block mb-1">Family Dependents</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm">
                  {data.personalInfo.dependents.length} {data.personalInfo.dependents.length === 1 ? 'Dependent' : 'Dependents'} Registered
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-purple-500" /> Statutory Documents Uploaded ({uploadedDocsCount}/{data.documents.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.documents.map((d) => (
                <span
                  key={d.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-medium"
                >
                  {d.status === 'uploaded' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                  ) : (
                    <span className="text-slate-400">○</span>
                  )}
                  {d.name.split('(')[0]}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* ===================================================================== */}
        {/* GROUP 2: POLICIES & ACCOUNT */}
        {/* ===================================================================== */}
        <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Corporate Policies &amp; Account Setup
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Complete
                  </span>
                </h2>
              </div>
            </div>

            <Button
              size="sm"
              variant="tertiary"
              onClick={() => goToStep(1)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit Step 2
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                NDA Electronic Agreement
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Signed as <strong>"{data.nda.signedName || `${data.personalInfo.firstName} ${data.personalInfo.lastName}`}"</strong>
              </p>
              {data.nda.acceptedAt && (
                <p className="text-xs text-slate-500">
                  Acknowledged on {formatDateTime(data.nda.acceptedAt)}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Okta SSO Corporate Account
              </span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-xs sm:text-sm truncate">
                <a
                  href={`mailto:${data.corporateAccount.corporateEmail}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                  title="Send email"
                >
                  {data.corporateAccount.corporateEmail}
                </a>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Status: {data.corporateAccount.accountStatus} • {data.corporateAccount.ssoProvider}
              </p>
            </div>
          </div>
        </Card>

        {/* ===================================================================== */}
        {/* GROUP 3: WORK SETUP */}
        {/* ===================================================================== */}
        <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Work Setup &amp; Workplace Preferences
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Complete
                  </span>
                </h2>
              </div>
            </div>

            <Button
              size="sm"
              variant="tertiary"
              onClick={() => goToStep(2)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit Step 3
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* ID Badge Photo & Email Signature */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                ID Badge Photo &amp; Digital Signature
              </span>

              <div className="flex items-center gap-3">
                {data.photo.photoUrl ? (
                  <div className="w-12 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-xs">
                    <img src={data.photo.photoUrl} alt="Badge Photo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-16 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block text-xs sm:text-sm">
                    {data.photo.photoUrl ? 'Portrait 3:4 Photo Attached' : 'Standard Badge Placeholder'}
                  </span>
                  <p className="text-xs text-slate-500">
                    {data.emailSignature.digitalSignatureUrl
                      ? '✓ Official digital signature image uploaded'
                      : 'No digital signature uploaded'}
                  </p>
                </div>
              </div>
            </div>

            {/* IT Hardware Package */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Laptop className="w-3.5 h-3.5 text-purple-500" /> IT Hardware Package ({data.equipment.selectedEquipment.length} Items)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.equipment.selectedEquipment.map((item) => {
                  const linkedAsset = (data.equipment.assignedAssets || []).find((a: any) => a.name === item);
                  return (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      {item}
                      {linkedAsset?.assetTag && (
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                          ({linkedAsset.assetTag})
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
              {data.equipment.specialRequests && (
                <p className="text-xs text-purple-600 dark:text-purple-400 italic pt-1">
                  Accommodations: "{data.equipment.specialRequests}"
                </p>
              )}
            </div>

            {/* Reporting Leadership */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-500" /> Reporting Leadership Hierarchy
              </span>
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="text-slate-800 dark:text-slate-100 dark:text-slate-200">
                  <span className="text-slate-400">Reporting Manager:</span>{' '}
                  <strong>{data.personalInfo.line1Manager || data.team.managerName || 'Not assigned'}</strong>
                </p>
                <p className="text-slate-800 dark:text-slate-100 dark:text-slate-200">
                  <span className="text-slate-400">Secondary / Executive Manager:</span>{' '}
                  <strong>{data.personalInfo.line2Manager || 'None'}</strong>
                </p>
              </div>
            </div>

            {/* Office & Campus Preferences */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-amber-500" /> Office &amp; Campus Preferences
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-snug text-xs sm:text-sm">
                Desk: {data.officeSetup.deskLocation || 'None specified'} • Clearance: {data.officeSetup.accessCardLevel || 'Standard Floor Access'}
              </p>
              <p className="text-slate-500 text-xs">
                Parking:{' '}
                {data.officeSetup.parkingRequired
                  ? `Permit Requested (${data.officeSetup.licensePlate || 'Plate pending'})`
                  : 'Not required'}{' '}
                • Locker: {data.officeSetup.lockerRequired ? 'Requested' : 'None'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end pt-4">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
          rightIcon={<CheckCircle2 className="w-5 h-5" />}
          onClick={() => setShowConfirmModal(true)}
        >
          Complete Onboarding &amp; Submit
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        title="Complete Onboarding & Submit?"
        message="You are about to submit your official onboarding dossier. Your account credentials, badge order, and equipment requisitions will be finalized."
        confirmLabel="Complete Onboarding"
        cancelLabel="Cancel"
        variant="success"
      />
    </div>
  );
};
