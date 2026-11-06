import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import {
  PageHeader,
  StatusIndicator,
  Avatar,
  Button,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Tabs,
  ProgressBar,
  AuditTimeline,
  ConfirmDialog,
  Modal,
  TextArea
} from '../components';
import { formatDate, formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';
import { getEffectiveAvatar } from '../utils/radianAvatars';
import {
  CheckCircle2,
  FileCheck2,
  Laptop,
  AlertTriangle,
  Mail,
  User,
  Building2,
  Clock,
  ShieldCheck,
  Download,
  XCircle,
  FileText,
  History,
  LayoutDashboard
} from 'lucide-react';

export const CandidateDetailPage: React.FC = () => {
  const {
    selectedCandidate,
    navigateTo,
    updateCandidate,
    updateDocumentStatus,
    updateTaskStatus,
    addAuditLog
  } = useOnboarding();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Action Dialogs state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRejectionReason, setDocRejectionReason] = useState('');

  if (!selectedCandidate) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500 mb-4">No candidate selected.</p>
        <Button onClick={() => navigateTo('directory')}>Return to Directory</Button>
      </div>
    );
  }

  const handleMarkComplete = () => {
    updateCandidate(selectedCandidate.id, {
      status: 'completed',
      progress: 100
    });
    addAuditLog(selectedCandidate.id, 'Onboarding Completed', 'Candidate officially transitioned to active employee.', 'success');
    setShowCompleteDialog(false);

    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleRejectCandidate = () => {
    updateCandidate(selectedCandidate.id, {
      status: 'rejected'
    });
    addAuditLog(selectedCandidate.id, 'Onboarding Rescinded / Rejected', rejectionReason || 'No reason specified', 'error');
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  const handleRejectDocumentConfirm = () => {
    if (rejectingDocId) {
      updateDocumentStatus(selectedCandidate.id, rejectingDocId, 'rejected', docRejectionReason);
      setRejectingDocId(null);
      setDocRejectionReason('');
    }
  };

  const tabsList = [
    { id: 'dashboard', label: 'Employee Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'overview', label: 'Overview & Profile', icon: <User className="w-4 h-4" /> },
    {
      id: 'documents',
      label: 'Compliance Documents',
      icon: <FileCheck2 className="w-4 h-4" />,
      count: selectedCandidate.documents.length
    },
    { id: 'equipment', label: 'IT & Hardware', icon: <Laptop className="w-4 h-4" /> },
    {
      id: 'tasks',
      label: 'Onboarding Tasks',
      icon: <CheckCircle2 className="w-4 h-4" />,
      count: selectedCandidate.tasks.length
    },
    { id: 'audit', label: 'Audit Timeline', icon: <Clock className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Top Breadcrumb & PageHeader */}
      <PageHeader
        title={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
        description={`${selectedCandidate.jobTitle} • ${selectedCandidate.department} • Scheduled to start ${formatDate(selectedCandidate.startDate)}`}
        onBack={() => navigateTo('directory')}
        backLabel="Back to Directory"
        badge={<StatusIndicator status={selectedCandidate.status} />}
        actions={
          <div className="flex items-center gap-2">
            <IconButton
              variant="secondary"
              icon={<History className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              aria-label={`Profile History (${selectedCandidate.auditLogs?.length || 0})`}
              onClick={() => setActiveTab('audit')}
            />
            {selectedCandidate.status !== 'completed' && selectedCandidate.status !== 'rejected' && (
              <>
                <IconButton
                  variant="secondary"
                  icon={<Mail className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                  aria-label="Send Reminder Email"
                  onClick={() => {
                    addAuditLog(selectedCandidate.id, 'Reminder Sent', 'Sent email reminder regarding pending onboarding items.', 'info');
                  }}
                />

                <Button
                  variant="primary"
                  leftIcon={<CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
                  onClick={() => setShowCompleteDialog(true)}
                >
                  Complete Onboarding
                </Button>

                <IconButton
                  variant="destructive"
                  icon={<XCircle className="w-4 h-4" />}
                  aria-label="Rescind Offer"
                  onClick={() => setShowRejectDialog(true)}
                />
              </>
            )}
          </div>
        }
      />

      {/* Header Banner Card */}
      <Card className="p-6 bg-linear-to-r from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={getEffectiveAvatar(selectedCandidate, selectedCandidate.gender, `${selectedCandidate.firstName} ${selectedCandidate.lastName}`)}
              name={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
              size="xl"
            />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedCandidate.firstName} {selectedCandidate.lastName}{' '}
                {selectedCandidate.preferredName && (
                  <span className="text-sm font-normal text-slate-500">
                    ("{selectedCandidate.preferredName}")
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <a
                  href={`mailto:${selectedCandidate.email}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                >
                  {selectedCandidate.email}
                </a>{' '}
                • {selectedCandidate.phone}
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {selectedCandidate.onboardingType === 'contract' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300/60">
                    Direct Contract ({selectedCandidate.contractDuration || 'Fixed-term'})
                  </span>
                ) : selectedCandidate.onboardingType === 'contract_to_hire' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300/60">
                    Contract to Hire ({selectedCandidate.contractDuration || '6M'})
                  </span>
                ) : selectedCandidate.onboardingType === 'pre_onboarding' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                    Pre-onboarding ({selectedCandidate.preOnboardingStage || 'Pending'})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300/60">
                    General Onboarding
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedCandidate.employmentType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedCandidate.workModel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedCandidate.officeLocation}
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-[180px] self-end md:self-center">
            <ProgressBar progress={selectedCandidate.progress} label="Overall Progress" size="md" />
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <EmployeeDashboardPage
            employee={selectedCandidate}
            onViewProfile={() => setActiveTab('overview')}
          />
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employment details */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Employment Parameters
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Position Title</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">{selectedCandidate.jobTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">{selectedCandidate.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Manager</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">{selectedCandidate.manager} ({selectedCandidate.managerEmail})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Official Start Date</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{formatDate(selectedCandidate.startDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Office Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">{selectedCandidate.officeLocation}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Base Compensation</span>
                <span className="font-semibold font-mono text-slate-800 dark:text-slate-100 dark:text-slate-200">
                  {formatCurrency(selectedCandidate.compensation?.salary, selectedCandidate.compensation?.currency)} ({selectedCandidate.compensation?.payFrequency})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Personal & Emergency Info */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Personal Details & Emergency Contact
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Legal Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">{selectedCandidate.firstName} {selectedCandidate.lastName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">{formatDate(selectedCandidate.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">SSN / Tax ID (Masked)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                  ***-**-{selectedCandidate.ssnLast4 || 'XXXX'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Residential Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-right">
                  {selectedCandidate.address?.street || 'On file'}, {selectedCandidate.address?.city} {selectedCandidate.address?.state} {selectedCandidate.address?.zipCode}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Emergency Contact</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 text-right">
                  {selectedCandidate.emergencyContact?.name} ({selectedCandidate.emergencyContact?.relationship}) • {selectedCandidate.emergencyContact?.phone}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Compliance Documents */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Compliance Verification & Signed Paperwork
              </h3>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigateTo('compliance')}
              leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
            >
              Open Global Compliance Hub
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {selectedCandidate.documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No documents currently assigned.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedCandidate.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 shrink-0">
                        <FileText className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {doc.title}
                          </span>
                          {doc.required && (
                            <span className="text-[10px] text-rose-500 font-bold uppercase">
                              Required
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {doc.description}
                        </span>
                        {doc.fileName && (
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-mono">
                            📄 {doc.fileName} ({doc.fileSize})
                          </span>
                        )}
                        {doc.rejectionReason && (
                          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-1.5 rounded border border-rose-200 dark:border-rose-900">
                            <strong>Rejection Note:</strong> {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded uppercase ${
                          doc.status === 'verified'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : doc.status === 'rejected'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {doc.status}
                      </span>

                      {/* Action buttons */}
                      {doc.status !== 'verified' && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs px-2.5 py-1"
                          onClick={() => updateDocumentStatus(selectedCandidate.id, doc.id, 'verified')}
                        >
                          Approve
                        </Button>
                      )}

                      {doc.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="tertiary"
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs px-2.5 py-1"
                          onClick={() => setRejectingDocId(doc.id)}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: IT & Hardware Provisioning */}
      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-purple-600" /> Hardware Allocation
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                {selectedCandidate.equipment?.provisioningStatus || 'Pending'}
              </span>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Assigned Workstation</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedCandidate.equipment?.laptopModel || 'Standard corporate laptop'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Peripherals & Monitors</span>
                <span className="text-slate-800 dark:text-slate-100 dark:text-slate-200">
                  {selectedCandidate.equipment?.monitors || 1} external monitor(s)
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedCandidate.equipment?.accessories?.map((acc) => (
                    <span
                      key={acc}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 text-[11px]"
                    >
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
              {selectedCandidate.equipment?.trackingNumber && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800">
                  <span className="font-bold text-purple-900 dark:text-purple-200 block">
                    FedEx Priority Tracking
                  </span>
                  <span className="font-mono text-purple-700 dark:text-purple-300 text-xs">
                    {selectedCandidate.equipment.trackingNumber}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Digital Credentials & Licenses
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Corporate Email</span>
                <a
                  href={`mailto:${selectedCandidate.equipment?.emailAlias || selectedCandidate.email}`}
                  className="font-mono text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors"
                >
                  {selectedCandidate.equipment?.emailAlias || selectedCandidate.email}
                </a>
              </div>

              <div>
                <span className="text-slate-400 block mb-1.5">Enterprise Software Entitlements</span>
                <div className="space-y-1.5">
                  {selectedCandidate.equipment?.softwareLicenses?.map((lic) => (
                    <div
                      key={lic}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-100 dark:text-slate-200">{lic}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Provisioned
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Onboarding Tasks */}
      {activeTab === 'tasks' && (
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Candidate Checklist & Milestones
              </h3>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {selectedCandidate.tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No specific individual tasks assigned.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedCandidate.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={(e) => {
                          const newStatus = e.target.checked ? 'completed' : 'in_progress';
                          updateTaskStatus(task.id, newStatus);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        aria-label={`Mark task ${task.title} as completed`}
                      />
                      <div className="flex flex-col">
                        <span
                          className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white ${
                            task.status === 'completed' ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {task.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400">Due {formatDate(task.dueDate)}</span>
                      <span className="px-2 py-0.5 text-[10px] rounded uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {task.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Audit Timeline */}
      {activeTab === 'audit' && (
        <Card className="p-6">
          <CardHeader className="p-0 pb-2 mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Compliance & Action Audit Log
            </h3>
          </CardHeader>
          <AuditTimeline logs={selectedCandidate.auditLogs} />
        </Card>
      )}

      {/* Complete Onboarding Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={handleMarkComplete}
        title="Complete Employee Onboarding?"
        message={`This will mark ${selectedCandidate.firstName}'s onboarding as 100% complete and grant official Active Employee status in the directory.`}
        confirmLabel="Finalize & Activate"
        variant="success"
      />

      {/* Rescind / Reject Onboarding Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleRejectCandidate}
        title="Rescind Employment Offer?"
        message={`Are you sure you want to terminate onboarding for ${selectedCandidate.firstName} ${selectedCandidate.lastName}?`}
        consequence="All provisioning hardware requests will be flagged for return and credentials revoked."
        confirmLabel="Confirm Termination"
        variant="danger"
      />

      {/* Document Rejection Reason Modal */}
      {rejectingDocId && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingDocId(null)}
          title="Reject Submitted Document"
          description="Provide a clear reason for the candidate to review and resubmit."
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setRejectingDocId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectDocumentConfirm}
                disabled={!docRejectionReason.trim()}
              >
                Reject & Request Re-upload
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <TextArea
              label="Rejection Reason & Instructions"
              placeholder="e.g. Scan is blurry or government expiration date has lapsed..."
              value={docRejectionReason}
              onChange={(e) => setDocRejectionReason(e.target.value)}
              required
              rows={4}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
