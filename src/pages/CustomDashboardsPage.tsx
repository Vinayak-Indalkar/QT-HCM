import React, { useState, useMemo, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types/auth';
import { getAssets, ITAsset } from '../services/assetService';
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  Button,
  StatCard,
  ConfirmDialog
} from '../components';
import { DynamicDashletChart } from '../components/dashboard/DynamicDashletChart';
import {
  getMasterDashlets,
  saveMasterDashlets,
  updateDashlet,
  toggleDashletEnabled,
  toggleDashletRole,
  addCustomDashlet,
  deleteDashlet,
  resetMasterDashlets,
  DashletConfig,
  DashboardPersona,
  ChartVisualizationType,
  ChartDataPoint,
  DashletColSpan,
  DashletHeightPreset,
  getColSpanClass,
  getHeightClass,
  DATA_SOURCE_OPTIONS,
  resolveChartDataFromSource,
  DataSourceDefinition
} from '../services/dashboardCustomizationService';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Building,
  Laptop,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  SlidersHorizontal,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Check,
  Plus,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  HardDrive,
  UserCheck,
  Lock,
  Mail,
  Edit,
  Sliders,
  Power,
  Info,
  Briefcase,
  Zap,
  Award,
  HeartHandshake,
  X,
  Activity,
  Gauge,
  CircleDot,
  ArrowLeft,
  Database,
  Table,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import { cn } from '../utils/cn';

const ALL_ROLES: Array<{ role: DashboardPersona; label: string; shortLabel: string; color: string; icon: string }> = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', shortLabel: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: '👑' },
  { role: 'HR', label: 'HR Operations', shortLabel: 'HR', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: '👥' },
  { role: 'MANAGER', label: 'Manager', shortLabel: 'Manager', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800', icon: '👔' },
  { role: 'EMPLOYEE', label: 'Employee', shortLabel: 'Employee', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: '💼' },
  { role: 'KPI_DASHBOARD', label: 'KPI Dashboard', shortLabel: 'KPI Dashboard', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800', icon: '🎯' }
];

const AVAILABLE_ICONS = [
  { id: 'Sparkles', label: 'Sparkles', Icon: Sparkles },
  { id: 'BarChart3', label: 'Chart', Icon: BarChart3 },
  { id: 'TrendingUp', label: 'Trend', Icon: TrendingUp },
  { id: 'Users', label: 'Users', Icon: Users },
  { id: 'Laptop', label: 'Hardware', Icon: Laptop },
  { id: 'ShieldCheck', label: 'Shield', Icon: ShieldCheck },
  { id: 'FileCheck2', label: 'Document', Icon: FileCheck2 },
  { id: 'Clock', label: 'Clock', Icon: Clock },
  { id: 'CheckCircle2', label: 'Checkmark', Icon: CheckCircle2 },
  { id: 'Building', label: 'Building', Icon: Building },
  { id: 'Briefcase', label: 'Briefcase', Icon: Briefcase },
  { id: 'Zap', label: 'Zap', Icon: Zap },
  { id: 'Award', label: 'Award', Icon: Award },
  { id: 'HeartHandshake', label: 'Welcome', Icon: HeartHandshake }
];

const ALL_CHART_TYPES: Array<{
  type: ChartVisualizationType;
  label: string;
  badge: string;
  icon: string;
  description: string;
}> = [
  { type: 'bar', label: 'Vertical Bar', badge: 'Column Chart', icon: '📊', description: 'Compare categories like department headcounts & monthly throughput' },
  { type: 'horizontal_bar', label: 'Horizontal Bar', badge: 'Ranking & Capacity', icon: '📈', description: 'Asset pool, hardware allocation & ranking metrics' },
  { type: 'line', label: 'Line Trend', badge: 'Time-Series', icon: '📉', description: 'Progression over time, turnaround SLA, and weekly velocity' },
  { type: 'area', label: 'Area Curve', badge: 'Volume & Growth', icon: '🌊', description: 'Cumulative onboarding volume & hiring pipeline momentum' },
  { type: 'pie', label: 'Pie Chart', badge: 'Slices & Shares', icon: '🥧', description: 'Proportional breakdown of verification status and gates' },
  { type: 'donut', label: 'Donut Ring', badge: 'Total & Ratio', icon: '🍩', description: 'Document compliance distribution with center total summary' },
  { type: 'funnel', label: 'Funnel Pipeline', badge: 'Conversion Gates', icon: '🔻', description: 'Step-by-step gate conversion from Offer to Day-1 Ready' },
  { type: 'radial_gauge', label: 'Radial SLA Gauge', badge: 'Speedometer Target', icon: '🎯', description: 'Real-time performance vs SLA benchmark target' },
  { type: 'gantt', label: 'Gantt Timeline', badge: 'SLA Schedule & Phases', icon: '⏱️', description: 'Interactive project timeline, milestone phases, and start/finish gate deadlines' }
];

export const CustomDashboardsPage: React.FC = () => {
  const { candidates, tasks } = useOnboarding();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'KPI_DASHBOARD'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [previewCandidateId, setPreviewCandidateId] = useState<string>(() => candidates[0]?.id || '');
  const selectedPreviewCandidate = useMemo(() => {
    return candidates.find((c) => c.id === previewCandidateId) || candidates[0];
  }, [candidates, previewCandidateId]);

  // On-Screen Creation / Edit Form State
  const [isAddDashletOpen, setIsAddDashletOpen] = useState(false);
  const [editingDashlet, setEditingDashlet] = useState<DashletConfig | null>(null);
  const [deletingDashlet, setDeletingDashlet] = useState<DashletConfig | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'onboarding' | 'it' | 'compliance' | 'team' | 'custom'>('onboarding');
  const [newType, setNewType] = useState<'metric' | 'chart' | 'list' | 'progress' | 'hero' | 'custom'>('chart');
  const [newChartType, setNewChartType] = useState<ChartVisualizationType>('bar');
  const [newRoles, setNewRoles] = useState<DashboardPersona[]>(['SUPER_ADMIN', 'HR', 'KPI_DASHBOARD']);
  const [newEnabled, setNewEnabled] = useState(true);
  const [newColSpan, setNewColSpan] = useState<DashletColSpan>(6);
  const [newHeightPreset, setNewHeightPreset] = useState<DashletHeightPreset>('normal');
  const [newValue, setNewValue] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('+15% vs Target');
  const [newBadgePositive, setNewBadgePositive] = useState(true);
  const [newIcon, setNewIcon] = useState('Sparkles');

  // Application Data Binding State
  const [selectedDataSource, setSelectedDataSource] = useState<string>('candidate_status');
  const [customDataPoints, setCustomDataPoints] = useState<ChartDataPoint[]>([
    { label: 'Engineering', value: 24, color: '#3b82f6' },
    { label: 'Product', value: 16, color: '#6366f1' },
    { label: 'Marketing', value: 12, color: '#ec4899' },
    { label: 'Sales', value: 19, color: '#f59e0b' },
    { label: 'Operations', value: 9, color: '#10b981' }
  ]);

  // Master Dashlets state
  const [dashlets, setDashlets] = useState<DashletConfig[]>(() => getMasterDashlets());

  useEffect(() => {
    const handleUpdate = () => {
      setDashlets(getMasterDashlets());
    };
    window.addEventListener('dashboard-config-updated', handleUpdate);
    return () => window.removeEventListener('dashboard-config-updated', handleUpdate);
  }, []);

  const [assets, setAssets] = useState<ITAsset[]>(() => getAssets());
  useEffect(() => {
    setAssets(getAssets());
  }, []);

  const handleToggleDashlet = (dashletId: string) => {
    const target = dashlets.find((d) => d.id === dashletId);
    if (!target) return;
    const newStatus = !target.enabled;
    toggleDashletEnabled(dashletId, newStatus);
    setDashlets(getMasterDashlets());
    info(
      newStatus ? 'Dashlet Activated' : 'Dashlet Deactivated',
      `"${target.title}" is now ${newStatus ? 'ON (Active)' : 'OFF (Hidden across all dashboards)'}.`
    );
  };

  const handleToggleRoleAssignment = (dashletId: string, role: DashboardPersona) => {
    toggleDashletRole(dashletId, role);
    setDashlets(getMasterDashlets());
    const target = dashlets.find((d) => d.id === dashletId);
    const wasAssigned = target?.assignedRoles.includes(role);
    success(
      'Persona Assignment Updated',
      `"${target?.title}" ${wasAssigned ? 'unassigned from' : 'assigned to'} ${role}.`
    );
  };

  const handleMoveDashlet = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dashlets.length) return;
    const updated = [...dashlets];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    const ordered = updated.map((d, i) => ({ ...d, order: i + 1 }));
    saveMasterDashlets(ordered);
    setDashlets(ordered);
  };

  const handleAddCustomRow = () => {
    setCustomDataPoints((prev) => [
      ...prev,
      {
        label: `Item ${prev.length + 1}`,
        value: 10,
        startValue: newChartType === 'gantt' ? prev.length * 3 : undefined,
        color: ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][prev.length % 6],
        sublabel: ''
      }
    ]);
  };

  const handleUpdateCustomRow = (index: number, field: keyof ChartDataPoint, val: any) => {
    setCustomDataPoints((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleDeleteCustomRow = (index: number) => {
    setCustomDataPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLoadCustomTemplate = (templateType: 'gantt' | 'dept' | 'funnel' | 'status') => {
    if (templateType === 'gantt') {
      setNewChartType('gantt');
      setCustomDataPoints([
        { label: 'Offer Letter Acceptance', startValue: 1, value: 4, color: '#3b82f6', sublabel: 'Days 1-4' },
        { label: 'Background & Identity Check', startValue: 3, value: 8, color: '#6366f1', sublabel: 'Days 3-8' },
        { label: 'IT Provisioning & Laptop Stage', startValue: 7, value: 14, color: '#8b5cf6', sublabel: 'Days 7-14' },
        { label: 'Compliance Documents & NDA', startValue: 12, value: 18, color: '#ec4899', sublabel: 'Days 12-18' },
        { label: 'Day-1 Induction & Ready', startValue: 17, value: 22, color: '#10b981', sublabel: 'Days 17-22' }
      ]);
    } else if (templateType === 'dept') {
      setCustomDataPoints([
        { label: 'Engineering', value: 32, color: '#3b82f6', sublabel: '32 Hires' },
        { label: 'Product & Design', value: 18, color: '#6366f1', sublabel: '18 Hires' },
        { label: 'Sales & Growth', value: 24, color: '#f59e0b', sublabel: '24 Hires' },
        { label: 'Operations & HR', value: 14, color: '#10b981', sublabel: '14 Hires' }
      ]);
    } else if (templateType === 'funnel') {
      setNewChartType('funnel');
      setCustomDataPoints([
        { label: 'Invited Candidates', value: 100, color: '#3b82f6', sublabel: 'Top of funnel' },
        { label: 'Documents Submitted', value: 78, color: '#6366f1', sublabel: 'Stage 2' },
        { label: 'IT Hardware Assigned', value: 65, color: '#8b5cf6', sublabel: 'Stage 3' },
        { label: 'Day-1 Clearance', value: 52, color: '#10b981', sublabel: 'Final gate' }
      ]);
    } else {
      setCustomDataPoints([
        { label: 'Completed', value: 45, color: '#10b981', sublabel: 'Cleared' },
        { label: 'In Progress', value: 30, color: '#3b82f6', sublabel: 'Active' },
        { label: 'Action Required', value: 15, color: '#f59e0b', sublabel: 'Pending' },
        { label: 'Rejected', value: 5, color: '#ef4444', sublabel: 'Failed' }
      ]);
    }
  };

  const handleSelectDataSource = (sourceId: string) => {
    setSelectedDataSource(sourceId);
    const sourceDef = DATA_SOURCE_OPTIONS.find((s) => s.id === sourceId);
    if (sourceDef) {
      if (newType === 'chart' && sourceDef.recommendedCharts && sourceDef.recommendedCharts.length > 0) {
        if (!sourceDef.recommendedCharts.includes(newChartType)) {
          setNewChartType(sourceDef.recommendedCharts[0]);
        }
      }
      if (sourceDef.sampleMetric && newType === 'metric') {
        if (!newValue || newValue === '100%' || newValue === 'Active') {
          setNewValue(sourceDef.sampleMetric.value);
          setNewBadge(sourceDef.sampleMetric.badge);
          setNewSubtitle(sourceDef.sampleMetric.subtitle);
        }
      }
    }
  };

  const computedPreviewChartData = useMemo(() => {
    if (selectedDataSource === 'custom_static') {
      return customDataPoints;
    }
    return resolveChartDataFromSource(selectedDataSource, candidates, tasks, assets);
  }, [selectedDataSource, customDataPoints, candidates, tasks, assets]);

  const handleOpenCreateDashlet = () => {
    setEditingDashlet(null);
    setNewTitle('');
    setNewDesc('');
    setNewCategory('onboarding');
    setNewType('chart');
    setNewChartType('bar');
    setNewRoles(['SUPER_ADMIN', 'HR', 'KPI_DASHBOARD']);
    setNewEnabled(true);
    setNewColSpan(6);
    setNewHeightPreset('normal');
    setNewValue('');
    setNewSubtitle('');
    setNewBadge('+15% vs Target');
    setNewBadgePositive(true);
    setNewIcon('Sparkles');
    setSelectedDataSource('candidate_status');
    setCustomDataPoints([
      { label: 'Engineering', value: 24, color: '#3b82f6' },
      { label: 'Product', value: 16, color: '#6366f1' },
      { label: 'Marketing', value: 12, color: '#ec4899' },
      { label: 'Sales', value: 19, color: '#f59e0b' },
      { label: 'Operations', value: 9, color: '#10b981' }
    ]);
    setIsAddDashletOpen(true);
  };

  const handleOpenEditDashlet = (dashlet: DashletConfig) => {
    setEditingDashlet(dashlet);
    setNewTitle(dashlet.title);
    setNewDesc(dashlet.description);
    setNewCategory(dashlet.category);
    setNewType(dashlet.type);
    setNewChartType(dashlet.chartType || 'bar');
    setNewRoles([...dashlet.assignedRoles]);
    setNewEnabled(dashlet.enabled);
    setNewColSpan(dashlet.colSpan || (dashlet.type === 'metric' ? 3 : dashlet.type === 'chart' ? 6 : 12));
    setNewHeightPreset(dashlet.heightPreset || (dashlet.type === 'metric' ? 'compact' : 'normal'));
    setNewValue(dashlet.customData?.value || '');
    setNewSubtitle(dashlet.customData?.subtitle || '');
    setNewBadge(dashlet.customData?.badge || '+15% vs Target');
    setNewBadgePositive(dashlet.customData?.badgePositive !== false);
    setNewIcon(dashlet.customData?.icon || 'Sparkles');
    setSelectedDataSource(dashlet.dataSource || (dashlet.chartData && dashlet.chartData.length > 0 ? 'custom_static' : 'candidate_status'));
    if (dashlet.chartData && dashlet.chartData.length > 0) {
      setCustomDataPoints([...dashlet.chartData]);
    } else {
      setCustomDataPoints([
        { label: 'Engineering', value: 24, color: '#3b82f6' },
        { label: 'Product', value: 16, color: '#6366f1' },
        { label: 'Marketing', value: 12, color: '#ec4899' },
        { label: 'Sales', value: 19, color: '#f59e0b' },
        { label: 'Operations', value: 9, color: '#10b981' }
      ]);
    }
    setIsAddDashletOpen(true);
  };

  const handleDeleteDashlet = () => {
    if (!deletingDashlet) return;
    deleteDashlet(deletingDashlet.id);
    setDashlets(getMasterDashlets());
    info('Dashlet Removed', `"${deletingDashlet.title}" removed from system.`);
    setDeletingDashlet(null);
  };

  const handleResetToDefaults = () => {
    const defaults = resetMasterDashlets();
    setDashlets(defaults);
    success('Reset Complete', 'Restored master dashlet catalog and persona assignments to factory defaults.');
  };

  const handleSaveDashlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const resolvedChartData = selectedDataSource === 'custom_static'
      ? customDataPoints
      : resolveChartDataFromSource(selectedDataSource, candidates, tasks, assets);

    if (editingDashlet) {
      updateDashlet(editingDashlet.id, {
        title: newTitle.trim(),
        description: newDesc.trim() || (newType === 'chart' ? `${newChartType.toUpperCase()} Chart Visualization` : 'Enterprise Dashlet'),
        category: newCategory,
        type: newType,
        chartType: newType === 'chart' ? newChartType : undefined,
        chartData: resolvedChartData,
        dataSource: selectedDataSource,
        enabled: newEnabled,
        assignedRoles: newRoles.length > 0 ? newRoles : ['SUPER_ADMIN'],
        colSpan: newColSpan,
        heightPreset: newHeightPreset,
        customData: {
          value: newValue.trim() || (newType === 'chart' ? 'Active Chart' : '100%'),
          subtitle: newSubtitle.trim() || 'Configured Enterprise Metric',
          badge: newBadge.trim() || 'Active',
          badgePositive: newBadgePositive,
          icon: newIcon
        }
      });
      setDashlets(getMasterDashlets());
      setIsAddDashletOpen(false);
      setEditingDashlet(null);
      success('Dashlet Updated', `"${newTitle}" configuration has been updated successfully.`);
    } else {
      addCustomDashlet({
        title: newTitle.trim(),
        description: newDesc.trim() || (newType === 'chart' ? `${newChartType.toUpperCase()} Chart Visualization` : 'Custom Enterprise Dashlet'),
        category: newCategory,
        type: newType,
        chartType: newType === 'chart' ? newChartType : undefined,
        chartData: resolvedChartData,
        dataSource: selectedDataSource,
        enabled: newEnabled,
        assignedRoles: newRoles.length > 0 ? newRoles : ['SUPER_ADMIN'],
        colSpan: newColSpan,
        heightPreset: newHeightPreset,
        customData: {
          value: newValue.trim() || (newType === 'chart' ? 'Active Chart' : '100%'),
          subtitle: newSubtitle.trim() || 'Custom Enterprise Metric',
          badge: newBadge.trim() || 'Active',
          badgePositive: newBadgePositive,
          icon: newIcon
        }
      });
      setDashlets(getMasterDashlets());
      setIsAddDashletOpen(false);
      success('Dashlet Created', `"${newTitle}" (${newType === 'chart' ? `${newChartType} chart` : newType}) has been created & assigned.`);
    }
  };

  // Filtered Dashlets for Catalog View
  const filteredDashlets = useMemo(() => {
    return dashlets.filter((d) => {
      if (statusFilter === 'enabled' && !d.enabled) return false;
      if (statusFilter === 'disabled' && d.enabled) return false;
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      if (roleFilter !== 'all' && !d.assignedRoles.includes(roleFilter as UserRole)) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          (d.chartType && d.chartType.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [dashlets, statusFilter, categoryFilter, roleFilter, searchTerm]);

  // Counts & metrics
  const availableAssets = assets.filter((a) => a.status === 'Available').length;
  const activeCandidates = candidates.filter((c) => c.status !== 'completed' && c.status !== 'rejected').length;

  const previewDashletsForRole = (role: DashboardPersona) => {
    return dashlets.filter((d) => d.enabled && d.assignedRoles.includes(role));
  };

  // If in Create or Edit Custom Dashlet mode, render as a dedicated separate screen
  if (isAddDashletOpen) {
    return (
      <div className="space-y-6 text-left animate-fade-in pb-16">
        <PageHeader
          title={editingDashlet ? `Edit Dashlet: ${editingDashlet.title}` : 'Create Custom Dashlet'}
          description={
            editingDashlet
              ? 'Modify dashlet configuration, chart visualization type, metric thresholds, and persona assignments.'
              : 'Configure your custom dashlet, select from 8 amCharts 5 visualization types, and assign it to Super Admin, HR, Manager, or Employee personas.'
          }
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsAddDashletOpen(false);
                setEditingDashlet(null);
              }}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-xs font-semibold cursor-pointer"
            >
              Back to Custom Dashboards
            </Button>
          }
        />

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingDashlet ? `Edit Dashlet Configuration (${editingDashlet.id})` : 'Custom Dashlet Configuration & Visualization'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update the dashlet properties below. Your chart or KPI preview will update interactively in real-time.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSaveDashlet} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Dashlet Details & Chart Type Selector */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dashlet Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Department Onboarding Distribution or Hiring SLA Gauge"
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                      >
                        <option value="onboarding">Onboarding &amp; Pipeline</option>
                        <option value="it">IT &amp; Hardware Assets</option>
                        <option value="compliance">Statutory Compliance</option>
                        <option value="team">Team &amp; People</option>
                        <option value="custom">Custom Operations</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Dashlet Description
                    </label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="e.g. Real-time visual comparison of team headcount and funnel gates"
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Dashlet Base Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer font-semibold text-blue-600 dark:text-blue-400"
                    >
                      <option value="chart">📊 Chart &amp; Visuals (amCharts 5 interactive visualizations)</option>
                      <option value="metric">🔢 KPI Metric Card</option>
                      <option value="list">📋 Summary Action Queue</option>
                      <option value="progress">⚡ Progress Tracker</option>
                      <option value="hero">👋 Welcome Hero Banner</option>
                    </select>
                  </div>

                  {/* ALL CHART TYPES SELECTION (WHEN TYPE IS CHART) - AMCHARTS.COM */}
                  {newType === 'chart' && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-blue-200 dark:border-blue-900/60 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Select Chart Visualization Type (amCharts 5):
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            ⚡ Powered by amCharts 5
                          </span>
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            {ALL_CHART_TYPES.find((c) => c.type === newChartType)?.badge}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {ALL_CHART_TYPES.map((chartItem) => {
                          const isSelected = newChartType === chartItem.type;
                          return (
                            <button
                              key={chartItem.type}
                              type="button"
                              onClick={() => setNewChartType(chartItem.type)}
                              className={cn(
                                'p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer select-none',
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/30 font-bold'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-200'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-base">{chartItem.icon}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div>
                                <span className="text-xs font-bold block">{chartItem.label}</span>
                                <span className={cn('text-[10px] block line-clamp-1', isSelected ? 'text-blue-100' : 'text-slate-400')}>
                                  {chartItem.badge}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        {ALL_CHART_TYPES.find((c) => c.type === newChartType)?.description} &bull; Interactive amCharts 5 rendering with animated transitions.
                      </p>
                    </div>
                  )}

                  {/* DATA SOURCE BINDING SELECTOR */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-blue-200 dark:border-blue-900/60 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Select Application Data to Bind:
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          ⚡ 10 Presets &amp; Custom Editor
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          {DATA_SOURCE_OPTIONS.find((d) => d.id === selectedDataSource)?.badge}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bind this dashlet to real-time application data (candidates, departments, IT hardware, statutory documents, task SLA, or custom editable rows).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {DATA_SOURCE_OPTIONS.map((sourceOpt) => {
                        const isSelected = selectedDataSource === sourceOpt.id;
                        return (
                          <button
                            key={sourceOpt.id}
                            type="button"
                            onClick={() => handleSelectDataSource(sourceOpt.id)}
                            className={cn(
                              'p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer select-none',
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-400/30'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-200'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{sourceOpt.icon}</span>
                                <span className="text-xs font-bold">{sourceOpt.name}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <p className={cn('text-[11px] line-clamp-2', isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400')}>
                              {sourceOpt.description}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className={cn('text-[10px] font-bold uppercase tracking-wider', isSelected ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400')}>
                                {sourceOpt.category}
                              </span>
                              {sourceOpt.sampleMetric && (
                                <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-mono', isSelected ? 'bg-blue-500/40 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')}>
                                  {sourceOpt.sampleMetric.value}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick KPI auto-fill button if metric */}
                    {newType === 'metric' && selectedDataSource !== 'custom_static' && (
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Selected Source: <strong className="text-slate-800 dark:text-slate-200">{DATA_SOURCE_OPTIONS.find((d) => d.id === selectedDataSource)?.name}</strong>
                        </span>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const opt = DATA_SOURCE_OPTIONS.find((d) => d.id === selectedDataSource);
                            if (opt?.sampleMetric) {
                              setNewValue(opt.sampleMetric.value);
                              setNewBadge(opt.sampleMetric.badge);
                              setNewSubtitle(opt.sampleMetric.subtitle);
                              success('Metric Auto-filled', `Populated metric fields from ${opt.name}.`);
                            }
                          }}
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-[11px] py-1 px-2.5 h-auto font-semibold cursor-pointer"
                        >
                          Auto-populate KPI Fields
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* IF CUSTOM DATASET: RENDER INTERACTIVE CUSTOM DATA TABLE EDITOR */}
                  {selectedDataSource === 'custom_static' && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Custom Data Points &amp; Values Editor ({customDataPoints.length} Rows):
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadCustomTemplate('gantt')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
                          >
                            ⏱️ Gantt Template
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCustomTemplate('dept')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
                          >
                            🏢 Dept Template
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCustomTemplate('funnel')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                          >
                            🔻 Funnel Template
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadCustomTemplate('status')}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                          >
                            📊 Status Template
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="py-2 px-2.5">Label / Category</th>
                              <th className="py-2 px-2.5 w-24">Value</th>
                              {newChartType === 'gantt' && <th className="py-2 px-2.5 w-24">Start Day</th>}
                              <th className="py-2 px-2.5 w-24">Color</th>
                              <th className="py-2 px-2.5">Sublabel / Note</th>
                              <th className="py-2 px-2.5 w-10 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {customDataPoints.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.label}
                                    onChange={(e) => handleUpdateCustomRow(idx, 'label', e.target.value)}
                                    placeholder="e.g. Engineering"
                                    className="w-full text-xs rounded border border-slate-200 dark:border-slate-700 p-1.5 bg-transparent text-slate-900 dark:text-white"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="number"
                                    value={row.value}
                                    onChange={(e) => handleUpdateCustomRow(idx, 'value', parseFloat(e.target.value) || 0)}
                                    className="w-full text-xs rounded border border-slate-200 dark:border-slate-700 p-1.5 bg-transparent text-slate-900 dark:text-white font-mono"
                                  />
                                </td>
                                {newChartType === 'gantt' && (
                                  <td className="p-1.5">
                                    <input
                                      type="number"
                                      value={row.startValue ?? 0}
                                      onChange={(e) => handleUpdateCustomRow(idx, 'startValue', parseFloat(e.target.value) || 0)}
                                      className="w-full text-xs rounded border border-slate-200 dark:border-slate-700 p-1.5 bg-transparent text-slate-900 dark:text-white font-mono"
                                    />
                                  </td>
                                )}
                                <td className="p-1.5">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="color"
                                      value={row.color || '#3b82f6'}
                                      onChange={(e) => handleUpdateCustomRow(idx, 'color', e.target.value)}
                                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400 truncate">{row.color || '#3b82f6'}</span>
                                  </div>
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.sublabel || ''}
                                    onChange={(e) => handleUpdateCustomRow(idx, 'sublabel', e.target.value)}
                                    placeholder="e.g. 24 Hires"
                                    className="w-full text-xs rounded border border-slate-200 dark:border-slate-700 p-1.5 bg-transparent text-slate-900 dark:text-white"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <button
                                    type="button"
                                    disabled={customDataPoints.length <= 1}
                                    onClick={() => handleDeleteCustomRow(idx)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded disabled:opacity-20 cursor-pointer"
                                    title="Delete Row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleAddCustomRow}
                          leftIcon={<PlusCircle className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-xs font-semibold cursor-pointer"
                        >
                          Add Data Row
                        </Button>
                        <span className="text-[11px] text-slate-400">
                          {customDataPoints.length} custom data items will be saved directly with this dashlet.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Metric inputs if type is metric */}
                  {newType === 'metric' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Display Value / Metric
                        </label>
                        <input
                          type="text"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="e.g. 98.4% or 45 Hires"
                          className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Subtitle / SLA Note
                        </label>
                        <input
                          type="text"
                          value={newSubtitle}
                          onChange={(e) => setNewSubtitle(e.target.value)}
                          placeholder="e.g. On track vs SLA"
                          className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Trend Badge Text
                        </label>
                        <input
                          type="text"
                          value={newBadge}
                          onChange={(e) => setNewBadge(e.target.value)}
                          placeholder="e.g. +18% vs Target"
                          className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Icon Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Icon
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {AVAILABLE_ICONS.map(({ id, label, Icon }) => {
                        const isSelected = newIcon === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setNewIcon(id)}
                            className={cn(
                              'p-2 rounded-lg border flex items-center gap-1.5 text-xs transition-all cursor-pointer',
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                            )}
                            title={label}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid Width (12-Col Span) & Height Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Card Width (12-Column Grid)
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { span: 3 as DashletColSpan, label: '1/4', sub: '3 cols' },
                          { span: 4 as DashletColSpan, label: '1/3', sub: '4 cols' },
                          { span: 6 as DashletColSpan, label: '1/2', sub: '6 cols' },
                          { span: 8 as DashletColSpan, label: '2/3', sub: '8 cols' },
                          { span: 12 as DashletColSpan, label: 'Full', sub: '12 cols' }
                        ].map((w) => (
                          <button
                            key={w.span}
                            type="button"
                            onClick={() => setNewColSpan(w.span)}
                            className={cn(
                              'py-1.5 px-1 rounded-lg text-center text-xs border transition-all cursor-pointer select-none',
                              newColSpan === w.span
                                ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                            )}
                          >
                            <span className="block font-bold">{w.label}</span>
                            <span className={cn('block text-[9px]', newColSpan === w.span ? 'text-blue-100' : 'text-slate-400')}>{w.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Card Height Preset
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { preset: 'compact' as DashletHeightPreset, label: 'Compact', sub: 'Single row / KPI' },
                          { preset: 'normal' as DashletHeightPreset, label: 'Normal', sub: 'Standard chart' },
                          { preset: 'tall' as DashletHeightPreset, label: 'Tall', sub: 'Extended list / view' }
                        ].map((h) => (
                          <button
                            key={h.preset}
                            type="button"
                            onClick={() => setNewHeightPreset(h.preset)}
                            className={cn(
                              'py-1.5 px-1.5 rounded-lg text-center text-xs border transition-all cursor-pointer select-none',
                              newHeightPreset === h.preset
                                ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                            )}
                          >
                            <span className="block font-bold">{h.label}</span>
                            <span className={cn('block text-[9px]', newHeightPreset === h.preset ? 'text-blue-100' : 'text-slate-400')}>{h.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Persona Assignments */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Assign Dashlet to Personas *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {ALL_ROLES.map((r) => {
                        const isSelected = newRoles.includes(r.role);
                        return (
                          <button
                            key={r.role}
                            type="button"
                            onClick={() => {
                              setNewRoles((prev) =>
                                isSelected ? prev.filter((item) => item !== r.role) : [...prev, r.role]
                              );
                            }}
                            className={cn(
                              'p-3 rounded-xl border text-left flex items-center justify-between text-xs font-semibold cursor-pointer transition-all',
                              isSelected
                                ? `${r.color} font-bold shadow-xs`
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                            )}
                          >
                            <span>{r.icon} {r.shortLabel}</span>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right 1 Column: Live Real-time Card Preview */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                    Live Real-time Preview:
                  </span>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 shadow-xs space-y-4">
                    {newType === 'chart' ? (
                      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            {newTitle.trim() || 'Custom Chart Visualization'}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {newChartType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{newDesc.trim() || 'Visual metric distribution'}</p>
                        
                        {/* Live Data Binding Indicator Pill */}
                        <div className="flex items-center justify-between px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/60 text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
                          <span className="flex items-center gap-1 truncate">
                            <Database className="w-3 h-3 text-blue-600" />
                            {DATA_SOURCE_OPTIONS.find((d) => d.id === selectedDataSource)?.name || 'Custom Data'}
                          </span>
                          <span className="font-mono font-bold shrink-0">{computedPreviewChartData.length} records</span>
                        </div>

                        <div className="pt-2">
                          <DynamicDashletChart chartType={newChartType} data={computedPreviewChartData} height={200} />
                        </div>
                      </div>
                    ) : (
                      <StatCard
                        label={newTitle.trim() || 'Custom Dashlet Title'}
                        value={newValue.trim() || '100%'}
                        change={newBadge.trim() || '+15% vs Target'}
                        isPositive={newBadgePositive}
                        description={newSubtitle.trim() || newDesc.trim() || 'Enterprise configured metric'}
                        icon={<Sparkles className="w-5 h-5" />}
                        iconBg="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
                      />
                    )}

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p><strong>Category:</strong> <span className="capitalize">{newCategory}</span></p>
                      <p><strong>Type:</strong> <span className="capitalize">{newType === 'chart' ? `${newChartType} Chart (amCharts 5)` : newType}</span></p>
                      <p><strong>Bound Data:</strong> <span className="font-semibold text-blue-600 dark:text-blue-400">{DATA_SOURCE_OPTIONS.find((d) => d.id === selectedDataSource)?.name}</span></p>
                      <p><strong>Target Personas:</strong> {newRoles.length > 0 ? newRoles.map((r) => r.replace('_', ' ')).join(', ') : 'None'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <Button
                      variant="secondary"
                      size="md"
                      type="button"
                      onClick={() => {
                        setIsAddDashletOpen(false);
                        setEditingDashlet(null);
                      }}
                      className="w-1/2 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      {editingDashlet ? 'Save Changes' : 'Save & Deploy Dashlet'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-16">
      <PageHeader
        title="Custom Dashboards"
        description="Manage all enterprise dashlets, toggle dashlet visibility ON/OFF, and assign specific dashlets to Super Admin, HR, Manager, and Employee personas."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetToDefaults}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reset to Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateDashlet}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
            >
              Create Custom Dashlet
            </Button>
          </div>
        }
      />

      {/* Main Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer select-none',
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Sliders className="w-4 h-4" />
          Dashlets Catalog &amp; Persona Assignment ({dashlets.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SUPER_ADMIN')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none',
            activeTab === 'SUPER_ADMIN'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-extrabold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <span>👑</span> Super Admin Preview ({previewDashletsForRole('SUPER_ADMIN').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HR')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none',
            activeTab === 'HR'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <span>👥</span> HR Preview ({previewDashletsForRole('HR').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MANAGER')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none',
            activeTab === 'MANAGER'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-extrabold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <span>👔</span> Manager Preview ({previewDashletsForRole('MANAGER').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EMPLOYEE')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none',
            activeTab === 'EMPLOYEE'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <span>💼</span> Employee Preview ({previewDashletsForRole('EMPLOYEE').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('KPI_DASHBOARD')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none',
            activeTab === 'KPI_DASHBOARD'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-extrabold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <span>🎯</span> KPI Dashboard ({previewDashletsForRole('KPI_DASHBOARD').length})
        </button>
      </div>

      {/* TAB 1: DASHLET MANAGEMENT CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dashlets by title, description, chart type, or category..."
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Statuses ({dashlets.length})</option>
                <option value="enabled">Active (ON) Only ({dashlets.filter((d) => d.enabled).length})</option>
                <option value="disabled">Inactive (OFF) Only ({dashlets.filter((d) => !d.enabled).length})</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="onboarding">Onboarding</option>
                <option value="it">IT &amp; Hardware</option>
                <option value="compliance">Compliance</option>
                <option value="team">Team &amp; Culture</option>
                <option value="custom">Custom</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">All Assigned Roles</option>
                <option value="SUPER_ADMIN">👑 Super Admin Assigned</option>
                <option value="HR">👥 HR Assigned</option>
                <option value="MANAGER">👔 Manager Assigned</option>
                <option value="EMPLOYEE">💼 Employee Assigned</option>
                <option value="KPI_DASHBOARD">🎯 KPI Dashboard Assigned</option>
              </select>
            </div>
          </Card>

          {/* Dashlets List */}
          <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  Dashlet Registry &amp; Persona Assignment Table ({filteredDashlets.length} Dashlets)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle the <span className="font-semibold text-emerald-600 dark:text-emerald-400">ON / OFF</span> switch to enable/disable any dashlet. Click any persona badge to assign or unassign the dashlet.
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200/70 dark:border-slate-800 tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="py-3 px-4 min-w-[90px] text-center whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 min-w-[320px] whitespace-nowrap">Dashlet &amp; Details</th>
                      <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">Type &amp; Category</th>
                      <th className="py-3 px-4 min-w-[360px] whitespace-nowrap">Persona Assignments</th>
                      <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-slate-850 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.4)] border-l border-slate-200/70 dark:border-slate-800">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                    {filteredDashlets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                          No dashlets match your search/filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredDashlets.map((dashlet, index) => (
                        <tr
                          key={dashlet.id}
                          className={cn(
                            'group transition-colors',
                            dashlet.enabled
                              ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                              : 'bg-slate-50/40 dark:bg-slate-900/30 opacity-75 hover:opacity-100'
                          )}
                        >
                          {/* 1. Status Toggle */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleDashlet(dashlet.id)}
                              className={cn(
                                'shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 cursor-pointer',
                                dashlet.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                              )}
                              title={dashlet.enabled ? 'Click to Turn OFF' : 'Click to Turn ON'}
                            >
                              <span
                                className={cn(
                                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs',
                                  dashlet.enabled ? 'translate-x-6' : 'translate-x-1'
                                )}
                              />
                            </button>
                          </td>

                          {/* 2. Dashlet Title & Description */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col min-w-0 max-w-md">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                  {dashlet.title}
                                </span>
                                {!dashlet.enabled && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                    Inactive (OFF)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                {dashlet.description}
                              </p>
                            </div>
                          </td>

                          {/* 3. Type & Category */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {dashlet.type === 'chart' && dashlet.chartType ? `${dashlet.chartType} chart` : dashlet.type}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                {dashlet.category}
                              </span>
                            </div>
                          </td>

                          {/* 4. Persona Assignments */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {ALL_ROLES.map((roleObj) => {
                                const isAssigned = dashlet.assignedRoles.includes(roleObj.role);
                                return (
                                  <button
                                    key={roleObj.role}
                                    type="button"
                                    onClick={() => handleToggleRoleAssignment(dashlet.id, roleObj.role)}
                                    className={cn(
                                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none',
                                      isAssigned
                                        ? `${roleObj.color} shadow-2xs font-bold`
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-60'
                                    )}
                                    title={
                                      isAssigned
                                        ? `Assigned to ${roleObj.label}. Click to unassign.`
                                        : `Click to assign to ${roleObj.label}.`
                                    }
                                  >
                                    <span>{roleObj.icon}</span>
                                    <span>{roleObj.shortLabel}</span>
                                    {isAssigned ? (
                                      <Check className="w-3 h-3 ml-0.5 text-current" />
                                    ) : (
                                      <Plus className="w-3 h-3 ml-0.5 text-slate-400" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* 5. Fixed / Pinned Actions Column */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50/90 dark:group-hover:bg-slate-800/80 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.4)] border-l border-slate-200/50 dark:border-slate-800/80 transition-colors">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditDashlet(dashlet)}
                                className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer transition-colors"
                                title="Edit Dashlet Configuration"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveDashlet(index, 'up')}
                                className="p-1.5 rounded text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                                title="Move Up in Sequence"
                              >
                                <MoveUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={index === filteredDashlets.length - 1}
                                onClick={() => handleMoveDashlet(index, 'down')}
                                className="p-1.5 rounded text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                                title="Move Down in Sequence"
                              >
                                <MoveDown className="w-4 h-4" />
                              </button>
                              {dashlet.id.startsWith('dashlet_custom_') && (
                                <button
                                  type="button"
                                  onClick={() => setDeletingDashlet(dashlet)}
                                  className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                                  title="Delete Custom Dashlet"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2-6: PERSONA LIVE DASHBOARD PREVIEWS */}
      {activeTab !== 'catalog' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  {activeTab === 'KPI_DASHBOARD'
                    ? 'Live Preview: KPI Dashboard (Employee Performance & Milestones)'
                    : activeTab === 'EMPLOYEE'
                    ? 'Live Preview: Employee Workspace Dashboard'
                    : `Live Preview: ${activeTab.replace('_', ' ')} Dashboard`}
                </h3>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  {activeTab === 'KPI_DASHBOARD'
                    ? 'This configured KPI Dashboard data directly appears when Super Admin & HR Admin click on an employee from the user list to check performance, KPI index, milestone progression, and clearance status.'
                    : activeTab === 'EMPLOYEE'
                    ? 'This dashboard is displayed when employees log into their personal portal.'
                    : `Showing ${previewDashletsForRole(activeTab as DashboardPersona).length} active dashlets assigned to ${activeTab.replace('_', ' ')}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(activeTab === 'KPI_DASHBOARD' || activeTab === 'EMPLOYEE') && candidates.length > 0 && (
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Inspect User:</span>
                  <select
                    value={previewCandidateId}
                    onChange={(e) => setPreviewCandidateId(e.target.value)}
                    className="text-xs font-semibold text-slate-900 dark:text-white bg-transparent focus:outline-none cursor-pointer"
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || `${c.firstName} ${c.lastName}`.trim()} ({c.id}) - {c.progress || 0}%
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('catalog')}
                className="text-xs font-semibold"
              >
                &larr; Back to Catalog &amp; Assignments
              </Button>
            </div>
          </div>

          {/* RENDER ACTIVE DASHLETS FOR THIS ROLE */}
          <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-4 items-start">
              {previewDashletsForRole(activeTab as DashboardPersona).map((d) => {
                const colSpan: DashletColSpan = d.colSpan || (d.type === 'metric' ? 3 : d.type === 'chart' || d.chartType ? 6 : 12);
                const heightPreset: DashletHeightPreset = d.heightPreset || (d.type === 'metric' ? 'compact' : 'normal');

                if (d.type === 'metric' || (d.type === 'custom' && !d.chartType)) {
                  let metricValue = d.customData?.value || 'Active';
                  let metricBadge = d.customData?.badge || 'On track';
                  let isPositive = d.customData?.badgePositive ?? true;

                  if ((activeTab === 'KPI_DASHBOARD' || activeTab === 'EMPLOYEE') && selectedPreviewCandidate) {
                    const empProgress = selectedPreviewCandidate.progress || 0;
                    const empDocs = selectedPreviewCandidate.documents?.filter((doc) => doc.status === 'verified' || doc.status === 'submitted').length || Math.round((empProgress / 100) * 8);

                    if (d.id === 'kpi_doc_compliance') {
                      metricValue = `${empDocs} / 8 Docs`;
                      metricBadge = empDocs >= 8 ? 'Fully Verified' : 'In Progress';
                    } else if (d.id === 'emp_kpi_performance_score') {
                      const score = Math.min(100, Math.round(empProgress * 0.9 + 10));
                      metricValue = `${score} / 100`;
                      metricBadge = score >= 85 ? 'High Performer' : 'On Track';
                    } else if (d.id === 'kpi_active_onboarding' || d.id === 'emp_kpi_progress') {
                      metricValue = `${empProgress}%`;
                      metricBadge = `${Math.round((empProgress / 100) * 10)} of 10 Steps`;
                    } else if (d.id === 'kpi_asset_pool' || d.id === 'emp_kpi_asset_status') {
                      metricValue = '1 Unit';
                      metricBadge = 'MacBook Pro M3';
                    } else if (d.id === 'emp_kpi_tasks_done') {
                      metricValue = empProgress === 100 ? '5 / 5 Tasks' : '4 / 5 Tasks';
                      metricBadge = 'Ready for Day 1';
                    }
                  } else {
                    if (d.id === 'kpi_total_employees') metricValue = String(candidates.length);
                    else if (d.id === 'kpi_active_onboarding') metricValue = String(activeCandidates);
                    else if (d.id === 'kpi_avg_sla') metricValue = '4.2 Days';
                    else if (d.id === 'kpi_doc_compliance') metricValue = '94%';
                    else if (d.id === 'kpi_asset_pool') metricValue = `${availableAssets} Units`;
                  }

                  return (
                    <div
                      key={d.id}
                      style={d.customHeight ? { minHeight: `${d.customHeight}px` } : undefined}
                      className={cn(getColSpanClass(colSpan), getHeightClass(heightPreset, d.customHeight))}
                    >
                      <StatCard
                        label={d.title}
                        value={metricValue}
                        change={metricBadge}
                        isPositive={isPositive}
                        description={d.description}
                        className="h-full"
                      />
                    </div>
                  );
                }

                if (d.type === 'chart' || (d.type === 'custom' && d.chartType)) {
                  let chartDataToRender = d.dataSource
                    ? resolveChartDataFromSource(d.dataSource, candidates, tasks, assets)
                    : d.chartData;

                  if ((activeTab === 'KPI_DASHBOARD' || activeTab === 'EMPLOYEE') && selectedPreviewCandidate) {
                    const empProgress = selectedPreviewCandidate.progress || 0;
                    const empDocs = selectedPreviewCandidate.documents?.filter((doc) => doc.status === 'verified' || doc.status === 'submitted').length || Math.round((empProgress / 100) * 8);

                    if (d.id === 'chart_emp_readiness') {
                      const score = Math.min(100, Math.round(empProgress * 0.9 + 10));
                      chartDataToRender = [
                        { label: 'Clearance Score', value: score, color: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444', sublabel: 'Target: 100%' }
                      ];
                    } else if (d.id === 'chart_emp_milestones') {
                      chartDataToRender = [
                        { label: 'Profile', value: Math.min(100, Math.round((empProgress / 10) * 100)), color: '#10b981' },
                        { label: 'Docs', value: Math.min(100, Math.round((empDocs / 8) * 100)), color: '#3b82f6' },
                        { label: 'NDA', value: empProgress >= 90 ? 100 : Math.round(empProgress * 0.8), color: '#10b981' },
                        { label: 'Hardware', value: 100, color: '#10b981' },
                        { label: 'Day 1 Prep', value: empProgress >= 75 ? 100 : 75, color: '#6366f1' }
                      ];
                    } else if (d.id === 'chart_emp_sla_velocity') {
                      chartDataToRender = [
                        { label: 'Week 1', value: Math.min(100, Math.round(empProgress * 0.35)), color: '#3b82f6' },
                        { label: 'Week 2', value: Math.min(100, Math.round(empProgress * 0.65)), color: '#3b82f6' },
                        { label: 'Week 3', value: Math.min(100, Math.round(empProgress * 0.85)), color: '#3b82f6' },
                        { label: 'Week 4', value: empProgress, color: '#10b981' }
                      ];
                    } else if (d.id === 'chart_emp_compliance_breakdown') {
                      chartDataToRender = [
                        { label: 'Verified & Approved', value: empDocs, color: '#10b981' },
                        { label: 'Pending Submission', value: Math.max(0, 8 - empDocs), color: '#f59e0b' }
                      ];
                    }
                  }

                  return (
                    <div
                      key={d.id}
                      style={d.customHeight ? { minHeight: `${d.customHeight}px` } : undefined}
                      className={cn(getColSpanClass(colSpan), getHeightClass(heightPreset, d.customHeight))}
                    >
                      <Card className="border border-slate-200 dark:border-slate-800 h-full w-full flex flex-col justify-between">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                            {d.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {d.chartType || 'bar'}
                          </span>
                        </CardHeader>
                        <CardContent className="pt-3 flex-1 flex flex-col justify-center p-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{d.description}</p>
                          <DynamicDashletChart chartType={d.chartType || 'bar'} data={chartDataToRender} height={220} />
                        </CardContent>
                      </Card>
                    </div>
                  );
                }

                return (
                  <div
                    key={d.id}
                    style={d.customHeight ? { minHeight: `${d.customHeight}px` } : undefined}
                    className={cn(getColSpanClass(colSpan), getHeightClass(heightPreset, d.customHeight))}
                  >
                    <Card className="border border-slate-200 dark:border-slate-800 h-full w-full flex flex-col justify-between">
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {d.title}
                        </h3>
                      </CardHeader>
                      <CardContent className="pt-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{d.description}</p>
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 flex-1 flex items-center justify-center">
                          {(activeTab === 'KPI_DASHBOARD' || activeTab === 'EMPLOYEE') && selectedPreviewCandidate
                            ? `Interactive ${d.type} dashlet configured for employee: ${selectedPreviewCandidate.name || selectedPreviewCandidate.firstName}.`
                            : `Interactive ${d.type} dashlet actively rendered in ${activeTab} view.`}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Dashlet Confirmation Dialog */}
      {deletingDashlet && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Custom Dashlet?"
          message={`Are you sure you want to remove dashlet "${deletingDashlet.title}" (${deletingDashlet.id})? It will be removed from all assigned persona dashboards.`}
          confirmLabel="Delete Dashlet"
          variant="danger"
          onConfirm={handleDeleteDashlet}
          onClose={() => setDeletingDashlet(null)}
        />
      )}
    </div>
  );
};
