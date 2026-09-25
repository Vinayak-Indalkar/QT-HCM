import React from 'react';
import { useOnboardingFlow } from '../context/OnboardingFlowContext';
import { useOnboarding } from '../context/OnboardingContext';
import { OnboardingStepper } from '../components/onboarding/OnboardingStepper';
import { StepGroupPersonalDocuments } from '../components/onboarding/steps/StepGroupPersonalDocuments';
import { StepGroupPoliciesAccount } from '../components/onboarding/steps/StepGroupPoliciesAccount';
import { StepGroupWorkSetup } from '../components/onboarding/steps/StepGroupWorkSetup';
import { StepReview } from '../components/onboarding/steps/StepReview';
import { Button } from '../components/ui/Button';
import { CheckCircle2, RotateCcw, UserCheck } from 'lucide-react';

export interface EmployeeOnboardingPageProps {
  onReturnToDashboard?: () => void;
}

export const EmployeeOnboardingPage: React.FC<EmployeeOnboardingPageProps> = ({
  onReturnToDashboard
}) => {
  const {
    data,
    activeEmployeeId,
    loadEmployee,
    currentStepIndex,
    goToStep,
    resetOnboarding
  } = useOnboardingFlow();
  const { candidates } = useOnboarding();

  const renderCurrentStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <StepGroupPersonalDocuments />;
      case 1:
        return <StepGroupPoliciesAccount />;
      case 2:
        return <StepGroupWorkSetup />;
      case 3:
        return <StepReview onReturnToDashboard={onReturnToDashboard} />;
      default:
        return <StepGroupPersonalDocuments />;
    }
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12">
      {/* Top Banner: Employee Name & Autosave status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Employee Onboarding Wizard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Candidate Profile Selector */}
          {candidates.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Profile:
              </span>
              <select
                aria-label="Select Enrolled Employee Onboarding Record"
                value={activeEmployeeId}
                onChange={(e) => {
                  const selected = candidates.find((c) => c.id === e.target.value);
                  if (selected) {
                    loadEmployee(selected.id, {
                      firstName: selected.firstName,
                      lastName: selected.lastName,
                      email: selected.email,
                      corporateEmail: selected.email,
                      jobTitle: selected.jobTitle,
                      department: selected.department,
                      startDate: selected.startDate,
                      workLocation: selected.officeLocation,
                      employmentType: selected.employmentType,
                      line1Manager: selected.line1Manager || selected.manager,
                      line2Manager: selected.line2Manager,
                      phone: selected.phone,
                      customFields: selected.customFields
                    });
                  }
                }}
                className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 cursor-pointer"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.firstName} {c.lastName} ({c.jobTitle} - {c.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Progress Autosaved
          </span>
          <Button
            size="sm"
            variant="tertiary"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetOnboarding}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Reset Demo
          </Button>
        </div>
      </div>

      {/* One-Time Onboarding Completion Notice */}
      {data.status === 'Completed' && (
        <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                One-Time Onboarding Completed & Submitted
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Your onboarding package is finalized. All 10 sections of your employee profile data are active and accessible anytime in <strong>My Profile</strong>.
              </p>
            </div>
          </div>
          {onReturnToDashboard && (
            <Button
              variant="primary"
              onClick={onReturnToDashboard}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 shadow-sm"
            >
              Go to My Profile
            </Button>
          )}
        </div>
      )}

      {/* 10-Step Interactive Stepper */}
      <OnboardingStepper
        currentStepIndex={currentStepIndex}
        completedSteps={data.completedSteps}
        onSelectStep={goToStep}
      />

      {/* Current Step Content Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        {renderCurrentStep()}
      </div>
    </div>
  );
};
