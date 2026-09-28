import React, { useState, useMemo } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Candidate, OnboardingStatus } from '../types/candidate';
import { ColumnDef } from '../types/common';
import { PageHeader } from '../components/shell/PageHeader';
import { DataTable } from '../components/table/DataTable';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { ProgressBar } from '../components/common/ProgressBar';
import { formatDate, formatCurrency } from '../utils/formatters';
import { DEPARTMENTS } from '../services/mockData';
import { AddEmployeeView } from '../components/employee/AddEmployeeView';
import { ShareLinkModal } from '../components/modals/ShareLinkModal';
import { EmployeeDossierModal, EmployeeDossierData } from '../components/modals/EmployeeDossierModal';
import { EditEmployeeModal } from '../components/modals/EditEmployeeModal';
import { EmployeeProfileView } from '../components/employee/EmployeeProfileView';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';
import { ResetPasswordModal } from '../components/modals/ResetPasswordModal';
import { AssignAssetsManagerModal } from '../components/modals/AssignAssetsManagerModal';
import { useOnboardingFlow } from '../context/OnboardingFlowContext';
import { useRole } from '../context/RoleContext';
import { getEffectiveAvatar } from '../utils/radianAvatars';
import {
  UserPlus,
  Eye,
  Trash2,
  Share2,
  FileCheck2,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Edit,
  UserX,
  UserMinus,
  KeyRound
} from 'lucide-react';

export const CandidatesDirectoryPage: React.FC = () => {
  const {
    candidates,
    navigateTo,
    deleteCandidate,
    bulkDeleteCandidates,
    bulkUpdateStatus,
    updateCandidate
  } = useOnboarding();
  const { setRole } = useRole();
  const { loadEmployee } = useOnboardingFlow();

  // Dialog states
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [candidateToTerminate, setCandidateToTerminate] = useState<Candidate | null>(null);
  const [candidateToDeactivate, setCandidateToDeactivate] = useState<Candidate | null>(null);
  const [candidateToResetPassword, setCandidateToResetPassword] = useState<Candidate | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [bulkStatusIds, setBulkStatusIds] = useState<string[] | null>(null);
  const [selectedBulkStatus, setSelectedBulkStatus] = useState<OnboardingStatus>('verification');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [dossierEmployee, setDossierEmployee] = useState<EmployeeDossierData | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [assigningCandidate, setAssigningCandidate] = useState<Candidate | null>(null);
  const [sharingEmployee, setSharingEmployee] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const handleOpenDossier = (candidate: Candidate) => {
    // Open employee profile view (with Dashboard tab as default)
    setEditingCandidate(candidate);
  };

  // Columns definition
  const columns: ColumnDef<Candidate>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Employee Name',
        accessorFn: (c: Candidate) => c.name || `${c.firstName} ${c.lastName}`.trim(),
        sortable: true,
        hideable: false, // Locked mandatory column
        defaultVisible: true,
        minWidth: '250px',
        cell: (candidate) => {
          const displayName = candidate.name || `${candidate.firstName} ${candidate.lastName}`.trim();
          return (
            <div className="flex items-center gap-3">
              <Avatar
                src={getEffectiveAvatar(candidate, candidate.gender, displayName)}
                name={displayName}
                size="sm"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </span>
                <a
                  href={`mailto:${candidate.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate transition-colors"
                  title={`Send email to ${candidate.email}`}
                >
                  {candidate.email}
                </a>
              </div>
            </div>
          );
        }
      },
      {
        id: 'jobTitle',
        header: 'Role & Department',
        accessorKey: 'jobTitle',
        sortable: true,
        defaultVisible: true,
        minWidth: '210px',
        cell: (candidate) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 dark:text-slate-100 dark:text-slate-200">
              {candidate.jobTitle}
            </span>
            <span className="text-[11px] text-slate-400">{candidate.department}</span>
          </div>
        )
      },
      {
        id: 'status',
        header: 'Onboarding Stage',
        accessorKey: 'status',
        sortable: true,
        defaultVisible: true,
        minWidth: '170px',
        cell: (candidate) => {
          if (candidate.isTerminated) {
            return (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900 flex items-center gap-1 w-fit">
                <UserX className="w-3 h-3" /> Terminated
              </span>
            );
          }
          if (candidate.isActive === false) {
            return (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1 w-fit">
                <UserMinus className="w-3 h-3" /> Inactive
              </span>
            );
          }
          return <StatusIndicator status={candidate.status} size="sm" />;
        }
      },
      {
        id: 'progress',
        header: 'Progress',
        accessorKey: 'progress',
        sortable: true,
        defaultVisible: true,
        minWidth: '140px',
        cell: (candidate) => (
          <div className="w-full max-w-[130px]">
            <ProgressBar progress={candidate.progress} showLabel={false} showPercentage={true} size="md" />
          </div>
        )
      },
      {
        id: 'startDate',
        header: 'Start Date',
        accessorKey: 'startDate',
        sortable: true,
        defaultVisible: true,
        minWidth: '130px',
        cell: (candidate) => (
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatDate(candidate.startDate)}
          </span>
        )
      },
      {
        id: 'workModel',
        header: 'Work Model',
        accessorKey: 'workModel',
        sortable: true,
        defaultVisible: true,
        minWidth: '120px',
        cell: (candidate) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {candidate.workModel}
          </span>
        )
      },
      {
        id: 'manager',
        header: 'Manager',
        accessorKey: 'manager',
        sortable: true,
        defaultVisible: false,
        minWidth: '160px',
        cell: (candidate) => (
          <span className="text-slate-600 dark:text-slate-400">
            {candidate.manager}
          </span>
        )
      },
      {
        id: 'salary',
        header: 'Compensation',
        accessorKey: 'compensation',
        sortable: false,
        defaultVisible: false,
        minWidth: '150px',
        cell: (candidate) => (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {formatCurrency(candidate.compensation?.salary, candidate.compensation?.currency)}
          </span>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        sortable: false,
        hideable: false,
        defaultVisible: true,
        minWidth: '180px',
        align: 'right',
        cell: (candidate) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dossier */}
            <button
              type="button"
              onClick={() => handleOpenDossier(candidate)}
              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
              title={`View & Edit Profile (${candidate.firstName} ${candidate.lastName})`}
              aria-label="View & Edit Profile"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Deactivate / Activate */}
            <button
              type="button"
              onClick={() => setCandidateToDeactivate(candidate)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                candidate.isActive === false
                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50'
              }`}
              title={candidate.isActive === false ? 'Activate Employee Account' : 'Deactivate Employee Account'}
              aria-label={candidate.isActive === false ? 'Activate Employee' : 'Deactivate Employee'}
            >
              {candidate.isActive === false ? <CheckCircle2 className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
            </button>

            {/* Terminate */}
            <button
              type="button"
              onClick={() => setCandidateToTerminate(candidate)}
              disabled={candidate.isTerminated}
              className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title={candidate.isTerminated ? 'Employee Terminated' : 'Terminate Employee Employment'}
              aria-label="Terminate Employee"
            >
              <UserX className="w-4 h-4" />
            </button>

            {/* Share Onboarding Link */}
            <button
              type="button"
              onClick={() =>
                setSharingEmployee({
                  id: candidate.id,
                  name: candidate.name || `${candidate.firstName} ${candidate.lastName}`.trim(),
                  email: candidate.email,
                  role: candidate.jobTitle
                })
              }
              className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
              title="Share Onboarding Link"
              aria-label="Share Onboarding Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    ],
    []
  );

  // Filter groups
  const filterGroups = useMemo(
    () => [
      {
        id: 'department',
        label: 'Department',
        options: DEPARTMENTS.map((d) => ({
          label: d,
          value: d,
          count: candidates.filter((c) => c.department === d).length
        }))
      },
      {
        id: 'status',
        label: 'Stage',
        options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Invited', value: 'invited' },
          { label: 'Doc Submission', value: 'document_submission' },
          { label: 'Verification', value: 'verification' },
          { label: 'IT Provisioning', value: 'equipment_provisioning' },
          { label: 'Orientation Scheduled', value: 'orientation_scheduled' },
          { label: 'Completed', value: 'completed' },
          { label: 'Rescinded', value: 'rejected' }
        ]
      },
      {
        id: 'workModel',
        label: 'Work Model',
        options: [
          { label: 'Remote', value: 'Remote' },
          { label: 'Hybrid', value: 'Hybrid' },
          { label: 'On-site', value: 'On-site' }
        ]
      }
    ],
    [candidates]
  );

  // Export to CSV function
  const handleExportCSV = (selectedCandidates: Candidate[]) => {
    const items = selectedCandidates.length > 0 ? selectedCandidates : candidates;
    const headers = ['ID,Full Name,Email,Gender,Role,Department,Manager,Start Date,Status,Progress'];
    const rows = items.map(
      (c) =>
        `"${c.id}","${c.name || `${c.firstName} ${c.lastName}`.trim()}","${c.email}","${c.gender || 'Not specified'}","${c.jobTitle}","${c.department}","${c.manager}","${c.startDate}","${c.status}","${c.progress}%"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quantira_onboarding_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Expandable row rendering
  const renderExpandedRow = (candidate: Candidate) => {
    const verifiedDocs = candidate.documents.filter((d) => d.status === 'verified').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Documents snapshot */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800">
          <div className="flex items-center justify-between pb-1 mb-2">
            <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-500" /> Compliance Docs ({verifiedDocs}/{candidate.documents.length})
            </span>
            <button
              type="button"
              onClick={() => navigateTo('compliance')}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Verify <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          {candidate.documents.length === 0 ? (
            <span className="text-slate-400">No documents uploaded yet.</span>
          ) : (
            <div className="space-y-1.5">
              {candidate.documents.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <span className="truncate max-w-[160px] text-slate-600 dark:text-slate-300 dark:text-slate-400">{d.title}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded font-bold uppercase ${
                      d.status === 'verified'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : d.status === 'rejected'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* IT Equipment snapshot */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800">
          <div className="flex items-center justify-between pb-1 mb-2">
            <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-purple-500" /> IT Provisioning
            </span>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 capitalize">
              {candidate.equipment?.provisioningStatus || 'pending'}
            </span>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-300 dark:text-slate-400">
            <div>
              <strong>Hardware:</strong> {candidate.equipment?.laptopModel || 'Not assigned'}
            </div>
            <div>
              <strong>Monitors:</strong> {candidate.equipment?.monitors || 0} external display(s)
            </div>
            <div>
              <strong>Email Alias:</strong>{' '}
              <a
                href={`mailto:${candidate.equipment?.emailAlias || candidate.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              >
                {candidate.equipment?.emailAlias || candidate.email}
              </a>
            </div>
          </div>
        </div>

        {/* Assigned Manager & Action */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block mb-1">
              Onboarding Coordinator
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              Manager: {candidate.manager} ({candidate.managerEmail})
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Location: {candidate.officeLocation}
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigateTo('detail', candidate.id)}
            className="mt-3 w-full"
            rightIcon={<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            Open Full Candidate File
          </Button>
        </div>
      </div>
    );
  };


  if (isAddingEmployee) {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        <AddEmployeeView
          onBack={() => setIsAddingEmployee(false)}
          onEmployeeAdded={() => setIsAddingEmployee(false)}
        />
      </div>
    );
  }

  if (editingCandidate) {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        <EmployeeProfileView
          employee={editingCandidate}
          readOnly={false}
          initialPrimaryTab="dashboard"
          onBack={() => setEditingCandidate(null)}
          onEmployeeUpdated={(updated) => {
            updateCandidate(updated.id, updated);
            setEditingCandidate(updated);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <PageHeader
        title="Employee Directory"
        description="Comprehensive employee onboarding records. Search, multi-column sort, filter, customize columns, and execute batch operations."
        descriptionClassName="whitespace-nowrap overflow-hidden text-ellipsis"
        actions={
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" aria-hidden="true" />}
            onClick={() => setIsAddingEmployee(true)}
          >
            Add Employee
          </Button>
        }
      />

      {/* Enterprise Data Table */}
      <DataTable
        data={candidates}
        columns={columns}
        filterGroups={filterGroups}
        searchPlaceholder="Search by candidate name, email, department, role, or ID..."
        enableSelection={false}
        enableExpanding={false}
        onRowClick={(c) => handleOpenDossier(c)}
        extraHeaderActions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExportCSV([])}
            className="text-xs"
          >
            Export All CSV
          </Button>
        }
      />

      {/* Confirmation Dialog: Single Delete */}
      <ConfirmDialog
        isOpen={Boolean(candidateToDelete)}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={() => {
          if (candidateToDelete) {
            deleteCandidate(candidateToDelete.id);
            setCandidateToDelete(null);
          }
        }}
        title="Delete Candidate Record?"
        message={`Are you sure you want to remove ${candidateToDelete?.firstName} ${candidateToDelete?.lastName} from the onboarding portal?`}
        consequence="All associated checklists, document reviews, and IT requisitions will be permanently deleted."
        confirmLabel="Delete Record"
        variant="danger"
      />

      {/* Confirmation Dialog: Bulk Delete */}
      <ConfirmDialog
        isOpen={Boolean(bulkDeleteIds)}
        onClose={() => setBulkDeleteIds(null)}
        onConfirm={() => {
          if (bulkDeleteIds) {
            bulkDeleteCandidates(bulkDeleteIds);
            setBulkDeleteIds(null);
          }
        }}
        title={`Delete ${bulkDeleteIds?.length} Selected Candidates?`}
        message="This action will permanently delete all selected candidate onboarding files and active checklist tasks."
        consequence="This operation cannot be undone."
        confirmLabel="Delete All Selected"
        variant="danger"
      />

      {/* Bulk Status Update Modal */}
      {bulkStatusIds && (
        <Modal
          isOpen={true}
          onClose={() => setBulkStatusIds(null)}
          title={`Update Status for ${bulkStatusIds.length} Candidate(s)`}
          description="Select the new onboarding stage to apply to all selected records."
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setBulkStatusIds(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  bulkUpdateStatus(bulkStatusIds, selectedBulkStatus);
                  setBulkStatusIds(null);
                }}
              >
                Apply New Status
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select
              label="New Onboarding Stage"
              value={selectedBulkStatus}
              onChange={(e) => setSelectedBulkStatus(e.target.value as OnboardingStatus)}
              options={[
                { label: 'Invited', value: 'invited' },
                { label: 'Document Submission', value: 'document_submission' },
                { label: 'Verification', value: 'verification' },
                { label: 'IT Provisioning', value: 'equipment_provisioning' },
                { label: 'Orientation Scheduled', value: 'orientation_scheduled' },
                { label: 'Completed', value: 'completed' },
                { label: 'Rescinded / Terminated', value: 'rejected' }
              ]}
            />
          </div>
        </Modal>
      )}



      {/* Share Onboarding Link Modal */}
      {sharingEmployee && (
        <ShareLinkModal
          isOpen={true}
          onClose={() => setSharingEmployee(null)}
          employee={sharingEmployee}
          onOpenDirectly={() => {
            loadEmployee(sharingEmployee.id, {
              firstName: sharingEmployee.name.split(' ')[0],
              lastName: sharingEmployee.name.split(' ').slice(1).join(' ') || 'Candidate',
              email: sharingEmployee.email,
              corporateEmail: sharingEmployee.email,
              jobTitle: sharingEmployee.role
            });
            setRole('EMPLOYEE');
            navigateTo('wizard');
          }}
        />
      )}

      {/* Full 10-Step Submitted Employee Dossier Modal */}
      {dossierEmployee && (
        <EmployeeDossierModal
          isOpen={true}
          onClose={() => setDossierEmployee(null)}
          employee={dossierEmployee}
        />
      )}

      {/* Terminate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(candidateToTerminate)}
        onClose={() => setCandidateToTerminate(null)}
        onConfirm={() => {
          if (candidateToTerminate) {
            updateCandidate(candidateToTerminate.id, {
              isTerminated: true,
              isActive: false,
              status: 'rejected',
              terminationDate: new Date().toISOString()
            });
            setCandidateToTerminate(null);
          }
        }}
        title="Confirm Employee Termination"
        message={`Are you sure you want to terminate employment for ${candidateToTerminate?.firstName} ${candidateToTerminate?.lastName} (${candidateToTerminate?.id})?`}
        consequence="This will revoke all corporate access, archive the candidate record, and mark the status as Terminated."
        variant="danger"
        confirmLabel="Terminate Employee"
        cancelLabel="Cancel"
      />

      {/* Deactivate / Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(candidateToDeactivate)}
        onClose={() => setCandidateToDeactivate(null)}
        onConfirm={() => {
          if (candidateToDeactivate) {
            const nextActive = candidateToDeactivate.isActive === false;
            updateCandidate(candidateToDeactivate.id, {
              isActive: nextActive
            });
            setCandidateToDeactivate(null);
          }
        }}
        title={candidateToDeactivate?.isActive === false ? "Confirm Account Reactivation" : "Confirm Account Deactivation"}
        message={`Are you sure you want to ${candidateToDeactivate?.isActive === false ? 'reactivate' : 'deactivate'} access for ${candidateToDeactivate?.firstName} ${candidateToDeactivate?.lastName} (${candidateToDeactivate?.id})?`}
        consequence={candidateToDeactivate?.isActive === false ? "The user will regain login access to the portal." : "The employee will be temporarily blocked from signing in until reactivated."}
        variant={candidateToDeactivate?.isActive === false ? "info" : "warning"}
        confirmLabel={candidateToDeactivate?.isActive === false ? "Activate Account" : "Deactivate Account"}
        cancelLabel="Cancel"
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={Boolean(candidateToResetPassword)}
        onClose={() => setCandidateToResetPassword(null)}
        candidate={candidateToResetPassword}
      />

      {/* Edit Employee Information Modal */}
      <EditEmployeeModal
        isOpen={Boolean(editingCandidate)}
        onClose={() => setEditingCandidate(null)}
        candidate={editingCandidate}
      />

      {/* Assign IT Assets & Manager Modal */}
      <AssignAssetsManagerModal
        isOpen={Boolean(assigningCandidate)}
        onClose={() => setAssigningCandidate(null)}
        candidate={assigningCandidate}
      />
    </div>
  );
};
