import React, { useState, useMemo, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types/auth';
import { getAssets, ITAsset } from '../services/assetService';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/atoms/Button';
import { StatCard } from '../components/common/StatCard';
import { DynamicDashletChart } from '../components/dashboard/DynamicDashletChart';
import {
  getMasterDashlets,
  saveMasterDashlets,
  toggleDashletEnabled,
  toggleDashletRole,
  addCustomDashlet,
  deleteDashlet,
  resetMasterDashlets,
  DashletConfig,
  ChartVisualizationType,
  ChartDataPoint
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
  ArrowLeft
} from 'lucide-react';
import { cn } from '../utils/cn';

const ALL_ROLES: Array<{ role: UserRole; label: string; shortLabel: string; color: string; icon: string }> = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', shortLabel: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: '👑' },
  { role: 'HR', label: 'HR Operations', shortLabel: 'HR', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: '👥' },
  { role: 'MANAGER', label: 'Manager', shortLabel: 'Manager', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800', icon: '👔' },
  { role: 'EMPLOYEE', label: 'Employee', shortLabel: 'Employee', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: '💼' }
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
  { type: 'radial_gauge', label: 'Radial SLA Gauge', badge: 'Speedometer Target', icon: '🎯', description: 'Real-time performance vs SLA benchmark target' }
];

export const CustomDashboardsPage: React.FC = () => {
  const { candidates } = useOnboarding();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // On-Screen Creation Form State
  const [isAddDashletOpen, setIsAddDashletOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'onboarding' | 'it' | 'compliance' | 'team' | 'custom'>('onboarding');
  const [newType, setNewType] = useState<'metric' | 'chart' | 'list' | 'progress' | 'hero' | 'custom'>('metric');
  const [newChartType, setNewChartType] = useState<ChartVisualizationType>('bar');
  const [newRoles, setNewRoles] = useState<UserRole[]>(['SUPER_ADMIN', 'HR']);
  const [newEnabled, setNewEnabled] = useState(true);
  const [newValue, setNewValue] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('+15% vs Target');
  const [newBadgePositive, setNewBadgePositive] = useState(true);
  const [newIcon, setNewIcon] = useState('Sparkles');

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

  const handleToggleRoleAssignment = (dashletId: string, role: UserRole) => {
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

  const handleDeleteDashlet = (dashletId: string) => {
    deleteDashlet(dashletId);
    setDashlets(getMasterDashlets());
    info('Dashlet Removed', 'Custom dashlet removed from system.');
  };

  const handleResetToDefaults = () => {
    const defaults = resetMasterDashlets();
    setDashlets(defaults);
    success('Reset Complete', 'Restored master dashlet catalog and persona assignments to factory defaults.');
  };

  const handleCreateDashlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCustomDashlet({
      title: newTitle.trim(),
      description: newDesc.trim() || (newType === 'chart' ? `${newChartType.toUpperCase()} Chart Visualization` : 'Custom Enterprise Dashlet'),
      category: newCategory,
      type: newType,
      chartType: newType === 'chart' ? newChartType : undefined,
      enabled: newEnabled,
      assignedRoles: newRoles.length > 0 ? newRoles : ['SUPER_ADMIN'],
      customData: {
        value: newValue.trim() || (newType === 'chart' ? 'Active Chart' : '100%'),
        subtitle: newSubtitle.trim() || 'Custom Enterprise Metric',
        badge: newBadge.trim() || 'Active',
        badgePositive: newBadgePositive,
        icon: newIcon
      }
    });

    setDashlets(getMasterDashlets());
    setNewTitle('');
    setNewDesc('');
    setNewValue('');
    setNewSubtitle('');
    setIsAddDashletOpen(false);
    success('Dashlet Created', `"${newTitle}" (${newType === 'chart' ? `${newChartType} chart` : newType}) has been created & assigned.`);
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

  const previewDashletsForRole = (role: UserRole) => {
    return dashlets.filter((d) => d.enabled && d.assignedRoles.includes(role));
  };

  // If in Create Custom Dashlet mode, render as a dedicated separate screen
  if (isAddDashletOpen) {
    return (
      <div className="space-y-6 text-left animate-fade-in pb-16">
        <PageHeader
          title="Create Custom Dashlet"
          description="Configure your custom dashlet, select from 8 amCharts 5 visualization types, and assign it to Super Admin, HR, Manager, or Employee personas."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddDashletOpen(false)}
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
                  Custom Dashlet Configuration &amp; Visualization
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in the dashlet details below. Your chart or KPI preview will update interactively in real-time.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleCreateDashlet} className="space-y-6">
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
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          Select Chart Visualization Type (amCharts):
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

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                        <div className="pt-2">
                          <DynamicDashletChart chartType={newChartType} height={200} />
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
                      <p><strong>Target Personas:</strong> {newRoles.length > 0 ? newRoles.map((r) => r.replace('_', ' ')).join(', ') : 'None'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <Button
                      variant="secondary"
                      size="md"
                      type="button"
                      onClick={() => setIsAddDashletOpen(false)}
                      className="w-1/2 text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                    >
                      Save &amp; Deploy Dashlet
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
              onClick={() => setIsAddDashletOpen(true)}
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
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDashlets.map((dashlet, index) => (
                  <div
                    key={dashlet.id}
                    className={cn(
                      'p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4',
                      dashlet.enabled
                        ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        : 'bg-slate-50/70 dark:bg-slate-900/40 opacity-70 hover:opacity-100'
                    )}
                  >
                    {/* Left: ON/OFF Switch + Dashlet Name + Info */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      {/* Interactive ON / OFF Toggle Switch */}
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

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {dashlet.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {dashlet.type === 'chart' && dashlet.chartType ? `${dashlet.chartType} chart` : dashlet.type}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {dashlet.category}
                          </span>
                          {!dashlet.enabled && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Inactive (OFF)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {dashlet.description}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Persona Assignment Toggles */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Assigned To:
                      </span>
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
                    </div>

                    {/* Right: Sequence & Delete Actions */}
                    <div className="flex items-center gap-1 self-end lg:self-center shrink-0">
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
                          onClick={() => handleDeleteDashlet(dashlet.id)}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                          title="Delete Custom Dashlet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2-5: PERSONA LIVE DASHBOARD PREVIEWS */}
      {activeTab !== 'catalog' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  Live Preview: {activeTab} Dashboard
                </h3>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  Showing {previewDashletsForRole(activeTab as UserRole).length} active dashlets assigned to {activeTab}.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('catalog')}
              className="text-xs font-semibold"
            >
              &larr; Back to Catalog &amp; Assignments
            </Button>
          </div>

          {/* RENDER ACTIVE DASHLETS FOR THIS ROLE */}
          <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-xs">
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {previewDashletsForRole(activeTab as UserRole)
                .filter((d) => d.type === 'metric' || (d.type === 'custom' && !d.chartType))
                .map((d) => (
                  <StatCard
                    key={d.id}
                    label={d.title}
                    value={
                      d.id === 'kpi_total_employees'
                        ? String(candidates.length)
                        : d.id === 'kpi_active_onboarding'
                        ? String(activeCandidates)
                        : d.id === 'kpi_avg_sla'
                        ? '4.2 Days'
                        : d.id === 'kpi_doc_compliance'
                        ? '94%'
                        : d.id === 'kpi_asset_pool'
                        ? `${availableAssets} Units`
                        : d.customData?.value || 'Active'
                    }
                    change={d.customData?.badge || 'On track'}
                    isPositive={d.customData?.badgePositive ?? true}
                    description={d.description}
                    icon={<Sparkles className="w-5 h-5" />}
                    iconBg="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400"
                  />
                ))}
            </div>

            {/* Visual Charts & Specialized Dashlets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {previewDashletsForRole(activeTab as UserRole)
                .filter((d) => d.type === 'chart' || (d.type === 'custom' && d.chartType))
                .map((d) => (
                  <Card key={d.id} className="border border-slate-200 dark:border-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {d.title}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {d.chartType || 'bar'}
                      </span>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{d.description}</p>
                      <DynamicDashletChart chartType={d.chartType || 'bar'} data={d.chartData} />
                    </CardContent>
                  </Card>
                ))}

              {/* Other list / progress / hero dashlets */}
              {previewDashletsForRole(activeTab as UserRole)
                .filter((d) => d.type !== 'metric' && d.type !== 'chart' && (!d.chartType))
                .map((d) => (
                  <Card key={d.id} className="border border-slate-200 dark:border-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        {d.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{d.description}</p>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                        Interactive {d.type} dashlet actively rendered in {activeTab} view.
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
