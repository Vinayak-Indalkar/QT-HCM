import React, { useState, useEffect, useMemo } from 'react';
import {
  WorkflowDefinitionRecord,
  WorkflowStepDef,
  getWorkflows,
  saveWorkflows,
  getDepartments
} from '../../services/organizationSetupService';
import {
  GitBranch,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Sliders,
  Bell,
  Check,
  X,
  AlertTriangle,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Building2,
  Laptop
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { Modal } from '../organisms/Modal';
import { ConfirmDialog } from '../organisms/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const WorkflowSetupView: React.FC = () => {
  const { success, info } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowDefinitionRecord[]>(() => getWorkflows());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departments, setDepartments] = useState<string[]>(() =>
    getDepartments().map((d) => d.name)
  );

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDefinitionRecord | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<WorkflowDefinitionRecord | null>(null);
  const [simulatingWorkflow, setSimulatingWorkflow] = useState<WorkflowDefinitionRecord | null>(null);
  const [simulationStepIndex, setSimulationStepIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: WorkflowDefinitionRecord['category'];
    description: string;
    triggerEvent: string;
    targetDepartment: string;
    status: WorkflowDefinitionRecord['status'];
    steps: WorkflowStepDef[];
  }>({
    code: '',
    name: '',
    category: 'Onboarding',
    description: '',
    triggerEvent: 'New Candidate Offer Acceptance',
    targetDepartment: 'All Departments',
    status: 'Active',
    steps: []
  });

  // Sync with storage events
  useEffect(() => {
    const handleUpdate = () => {
      setWorkflows(getWorkflows());
      setDepartments(getDepartments().map((d) => d.name));
    };
    window.addEventListener('quantira_workflows_updated', handleUpdate);
    window.addEventListener('quantira_departments_updated', handleUpdate);
    return () => {
      window.removeEventListener('quantira_workflows_updated', handleUpdate);
      window.removeEventListener('quantira_departments_updated', handleUpdate);
    };
  }, []);

  // Filtered list
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || w.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || w.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [workflows, searchQuery, categoryFilter, statusFilter]);

  // High-level Stats
  const activeCount = workflows.filter((w) => w.status === 'Active').length;
  const totalSteps = workflows.reduce((acc, w) => acc + w.steps.length, 0);
  const avgSla = Math.round(
    workflows.reduce((acc, w) => acc + w.steps.reduce((sAcc, s) => sAcc + s.slaHours, 0), 0) /
      Math.max(1, totalSteps)
  );

  const openCreateModal = () => {
    setEditingWorkflow(null);
    setFormData({
      code: `WF-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Onboarding',
      description: '',
      triggerEvent: 'New Candidate Offer Acceptance',
      targetDepartment: 'All Departments',
      status: 'Active',
      steps: [
        {
          id: `wfs-${Date.now()}-1`,
          stepNumber: 1,
          name: 'Initial Review & Form Verification',
          description: 'Review initial employee submission and check mandatory credentials.',
          approverRole: 'HR',
          slaHours: 24,
          required: true,
          allowSkip: false,
          notificationEmail: true
        }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (wf: WorkflowDefinitionRecord) => {
    setEditingWorkflow(wf);
    setFormData({
      code: wf.code,
      name: wf.name,
      category: wf.category,
      description: wf.description,
      triggerEvent: wf.triggerEvent,
      targetDepartment: wf.targetDepartment,
      status: wf.status,
      steps: JSON.parse(JSON.stringify(wf.steps))
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = (wf: WorkflowDefinitionRecord) => {
    const cloned: WorkflowDefinitionRecord = {
      ...JSON.parse(JSON.stringify(wf)),
      id: `WF-${Date.now()}`,
      code: `${wf.code}-COPY`,
      name: `${wf.name} (Copy)`,
      status: 'Draft',
      lastUpdated: new Date().toISOString().split('T')[0],
      updatedBy: 'Sarah Jenkins (Super Admin)'
    };
    const updated = [cloned, ...workflows];
    saveWorkflows(updated);
    setWorkflows(updated);
    success('Workflow Duplicated', `Created draft clone of "${wf.name}".`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingWorkflow) {
      const updated = workflows.map((w) =>
        w.id === editingWorkflow.id
          ? {
              ...w,
              ...formData,
              stepsCount: formData.steps.length,
              lastUpdated: new Date().toISOString().split('T')[0],
              updatedBy: 'Sarah Jenkins (Super Admin)'
            }
          : w
      );
      saveWorkflows(updated);
      setWorkflows(updated);
      success('Workflow Updated', `Workflow "${formData.name}" has been updated.`);
    } else {
      const newWf: WorkflowDefinitionRecord = {
        id: `WF-${Date.now()}`,
        ...formData,
        stepsCount: formData.steps.length,
        version: 'v1.0',
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedBy: 'Sarah Jenkins (Super Admin)'
      };
      const updated = [newWf, ...workflows];
      saveWorkflows(updated);
      setWorkflows(updated);
      success('Workflow Created', `Workflow "${newWf.name}" has been registered.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingWorkflow) return;
    const updated = workflows.filter((w) => w.id !== deletingWorkflow.id);
    saveWorkflows(updated);
    setWorkflows(updated);
    info('Workflow Deleted', `Workflow "${deletingWorkflow.name}" has been removed.`);
    setDeletingWorkflow(null);
  };

  // Step Management inside Modal
  const handleAddStep = () => {
    const newStep: WorkflowStepDef = {
      id: `wfs-${Date.now()}`,
      stepNumber: formData.steps.length + 1,
      name: `Approval Step ${formData.steps.length + 1}`,
      description: 'Define execution requirements for this step.',
      approverRole: 'HR',
      slaHours: 24,
      required: true,
      allowSkip: false,
      notificationEmail: true
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleRemoveStep = (index: number) => {
    if (formData.steps.length <= 1) return;
    setFormData((prev) => {
      const updated = prev.steps.filter((_, i) => i !== index).map((s, i) => ({
        ...s,
        stepNumber: i + 1
      }));
      return { ...prev, steps: updated };
    });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.steps.length - 1)
    )
      return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const steps = [...formData.steps];
    const temp = steps[index];
    steps[index] = steps[targetIndex];
    steps[targetIndex] = temp;
    const reindexed = steps.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setFormData((prev) => ({ ...prev, steps: reindexed }));
  };

  const getRoleBadgeColor = (role: WorkflowStepDef['approverRole']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'HR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'MANAGER':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      case 'IT_ADMIN':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'FINANCE_ADMIN':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'AUTO':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in">
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Enterprise Workflow Automation &amp; Approval Engine
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Create Workflow
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Pipelines</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{activeCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Of {workflows.length} total defined</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Approval Gates</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalSteps}</p>
          <span className="text-[11px] text-slate-400">Total configured steps</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Avg SLA Turnaround</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{avgSla} Hours</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Per execution milestone</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Event Triggers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">100%</p>
          <span className="text-[11px] text-slate-400">Real-time webhooks enabled</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workflows by name, trigger code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter workflows by category"
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Categories</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Offboarding">Offboarding</option>
            <option value="Approval">Approval</option>
            <option value="Compliance">Compliance</option>
            <option value="Asset Management">Asset Management</option>
            <option value="Performance">Performance</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter workflows by status"
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Workflows Visual Pipeline Cards */}
      <div className="space-y-4">
        {filteredWorkflows.map((wf) => (
          <div
            key={wf.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {wf.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {wf.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        wf.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                          : wf.status === 'Draft'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {wf.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {wf.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {wf.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatingWorkflow(wf);
                    setSimulationStepIndex(0);
                  }}
                  className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                  title="Simulate Workflow"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(wf)}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Duplicate Workflow"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(wf)}
                  className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                  title="Edit Workflow"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingWorkflow(wf)}
                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Delete Workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Trigger Event</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  {wf.triggerEvent}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Scope</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  {wf.targetDepartment}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total SLA</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {wf.steps.reduce((acc, s) => acc + s.slaHours, 0)} Hours Max
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Updated</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {wf.lastUpdated} ({wf.version})
                </span>
              </div>
            </div>

            {/* Interactive Step Timeline */}
            <div className="pt-4 overflow-x-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Execution Sequence ({wf.steps.length} Steps)
              </span>
              <div className="flex items-center gap-3 min-w-max pb-2">
                {wf.steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-xs shrink-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {step.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRoleBadgeColor(
                              step.approverRole
                            )}`}
                          >
                            {step.approverRole.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {step.slaHours}h
                          </span>
                          {step.required && (
                            <span className="text-[10px] font-bold text-rose-600">Req</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {idx < wf.steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filteredWorkflows.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No workflows found</h4>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or create a new pipeline.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Workflow Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkflow ? `Edit Workflow: ${formData.name}` : 'Create Enterprise Workflow'}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Workflow Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Executive Promotion & Transfer Pipeline"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Workflow Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="WF-EMP-CUSTOM"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Workflow Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as WorkflowDefinitionRecord['category']
                  }))
                }
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="Onboarding">Onboarding</option>
                <option value="Offboarding">Offboarding</option>
                <option value="Approval">Approval</option>
                <option value="Compliance">Compliance</option>
                <option value="Asset Management">Asset Management</option>
                <option value="Performance">Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trigger Event
              </label>
              <input
                type="text"
                value={formData.triggerEvent}
                onChange={(e) => setFormData((prev) => ({ ...prev, triggerEvent: e.target.value }))}
                placeholder="e.g. On Candidate Acceptance, On Form Submission"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Scope / Department
              </label>
              <select
                value={formData.targetDepartment}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetDepartment: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="All Departments">All Departments (Enterprise Wide)</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Workflow Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as WorkflowDefinitionRecord['status']
                  }))
                }
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed explanation of the process lifecycle and business governance rules..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Dynamic Step Builder */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Workflow Steps &amp; Approver Sequence ({formData.steps.length})
                </h4>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddStep}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Add Step
              </Button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {formData.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s, i) => (i === idx ? { ...s, name: val } : s))
                          }));
                        }}
                        placeholder="Step Title"
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStep(idx, 'up')}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === formData.steps.length - 1}
                        onClick={() => handleMoveStep(idx, 'down')}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={formData.steps.length <= 1}
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 disabled:opacity-30"
                        title="Remove Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                        Approver Role
                      </label>
                      <select
                        value={step.approverRole}
                        onChange={(e) => {
                          const val = e.target.value as WorkflowStepDef['approverRole'];
                          setFormData((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s, i) => (i === idx ? { ...s, approverRole: val } : s))
                          }));
                        }}
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="HR">HR Admin</option>
                        <option value="MANAGER">Reporting Manager</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="IT_ADMIN">IT Ops Admin</option>
                        <option value="FINANCE_ADMIN">Finance Admin</option>
                        <option value="AUTO">Auto Approval</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                        SLA (Hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={step.slaHours}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s, i) => (i === idx ? { ...s, slaHours: val } : s))
                          }));
                        }}
                        className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id={`req-${step.id}`}
                        checked={step.required}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s, i) => (i === idx ? { ...s, required: val } : s))
                          }));
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`req-${step.id}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Mandatory Gate
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id={`email-${step.id}`}
                        checked={step.notificationEmail}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            steps: prev.steps.map((s, i) => (i === idx ? { ...s, notificationEmail: val } : s))
                          }));
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`email-${step.id}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Alerts
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-blue-600 text-white font-bold">
              {editingWorkflow ? 'Save Changes' : 'Create Workflow'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Workflow Simulation Sandbox Drawer / Modal */}
      {simulatingWorkflow && (
        <Modal
          isOpen={true}
          onClose={() => setSimulatingWorkflow(null)}
          title={`Workflow Simulator: ${simulatingWorkflow.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4" /> Live Execution Simulation
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Triggered event: <strong>"{simulatingWorkflow.triggerEvent}"</strong> for target scope <strong>"{simulatingWorkflow.targetDepartment}"</strong>.
              </p>
            </div>

            <div className="space-y-3">
              {simulatingWorkflow.steps.map((step, idx) => {
                const isPassed = idx < simulationStepIndex;
                const isCurrent = idx === simulationStepIndex;
                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isPassed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isPassed
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isPassed ? <Check className="w-4 h-4" /> : step.stepNumber}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {step.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Approver: <strong>{step.approverRole}</strong> • SLA Target: {step.slaHours}h
                          </p>
                        </div>
                      </div>

                      {isPassed && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Approved
                        </span>
                      )}

                      {isCurrent && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSimulationStepIndex((prev) => prev + 1)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Approve Gate
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {simulationStepIndex >= simulatingWorkflow.steps.length && (
              <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-center border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  Workflow Execution Complete!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  All {simulatingWorkflow.steps.length} approval gates cleared within SLA targets. Final notifications dispatched.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSimulationStepIndex(0)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Simulation
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSimulatingWorkflow(null)}>
                Close Simulator
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingWorkflow && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Workflow Pipeline?"
          message={`Are you sure you want to delete "${deletingWorkflow.name}" (${deletingWorkflow.code})? Any in-flight tasks tied to this workflow will require manual resolution.`}
          confirmLabel="Delete Workflow"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeletingWorkflow(null)}
        />
      )}
    </div>
  );
};
