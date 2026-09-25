import { UserRole } from '../types/auth';

export type DashboardPersona = UserRole | 'KPI_DASHBOARD';

export type ChartVisualizationType =
  | 'bar'
  | 'horizontal_bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'funnel'
  | 'radial_gauge'
  | 'gantt';

export interface ChartDataPoint {
  label: string;
  value: number;
  startValue?: number;
  color?: string;
  sublabel?: string;
}

export type DashletColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type DashletHeightPreset = 'compact' | 'normal' | 'tall' | 'custom';

export interface DashletConfig {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'it' | 'compliance' | 'team' | 'custom';
  type: 'metric' | 'chart' | 'list' | 'progress' | 'hero' | 'custom';
  chartType?: ChartVisualizationType;
  chartData?: ChartDataPoint[];
  dataSource?: string; // Key of the bound live application data source
  enabled: boolean; // Global ON / OFF switch for this dashlet
  assignedRoles: DashboardPersona[]; // Which personas will have this dashlet on their dashboard
  order: number;
  colSpan?: DashletColSpan; // 1 to 12 columns in responsive 12-col grid
  heightPreset?: DashletHeightPreset; // 'compact' | 'normal' | 'tall' | 'custom'
  customHeight?: number; // Custom height in pixels (e.g. 140 to 800)
  customData?: {
    value?: string;
    subtitle?: string;
    badge?: string;
    badgePositive?: boolean;
    icon?: string;
  };
}

export interface CustomWidgetConfig {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'custom' | 'hero';
  category: 'onboarding' | 'it' | 'compliance' | 'team' | 'custom';
  chartType?: ChartVisualizationType;
  chartData?: ChartDataPoint[];
  dataSource?: string;
  visible: boolean;
  order: number;
  customData?: {
    value?: string;
    subtitle?: string;
    badge?: string;
    badgePositive?: boolean;
    icon?: string;
  };
}

export const DEFAULT_MASTER_DASHLETS: DashletConfig[] = [
  {
    id: 'kpi_total_employees',
    title: 'Enterprise Headcount',
    description: 'Active employee headcount across all global departments and branches',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 1
  },
  {
    id: 'kpi_active_onboarding',
    title: 'Active In Onboarding',
    description: 'Number of candidates currently progressing through the onboarding pipeline',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR', 'MANAGER'],
    order: 2
  },
  {
    id: 'kpi_avg_sla',
    title: 'Average SLA Turnaround',
    description: 'Average turnaround duration from candidate invitation to Day-1 clearance',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 3
  },
  {
    id: 'kpi_doc_compliance',
    title: 'Mandatory Compliance Rate',
    description: 'Statutory identity, I-9, and NDA document verification rate',
    category: 'compliance',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR', 'EMPLOYEE', 'KPI_DASHBOARD'],
    order: 4
  },
  {
    id: 'kpi_asset_pool',
    title: 'IT Hardware Availability',
    description: 'Stock availability of provisioned MacBooks, peripherals, and software seats',
    category: 'it',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'KPI_DASHBOARD'],
    order: 5
  },
  {
    id: 'chart_pipeline_funnel',
    title: 'Pipeline Funnel Gates',
    description: 'Stage-by-stage progression across document submission, IT staging, and Day 1',
    category: 'onboarding',
    type: 'chart',
    chartType: 'funnel',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 6
  },
  {
    id: 'chart_dept_distribution',
    title: 'Department Distribution',
    description: 'Distribution of active onboarding hires by department org units',
    category: 'onboarding',
    type: 'chart',
    chartType: 'bar',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 7
  },
  {
    id: 'chart_asset_breakdown',
    title: 'IT Asset Hardware Health',
    description: 'Overview of deployed hardware, warranty status, and asset health pool',
    category: 'it',
    type: 'chart',
    chartType: 'horizontal_bar',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'MANAGER'],
    order: 8
  },
  {
    id: 'chart_sla_gauge',
    title: 'SLA Quality Radial Gauge',
    description: 'Real-time onboarding SLA clearance rate vs 85% quarterly benchmark',
    category: 'onboarding',
    type: 'chart',
    chartType: 'radial_gauge',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 9
  },
  {
    id: 'chart_hr_verification_breakdown',
    title: 'HR Compliance Verification Breakdown',
    description: 'Proportional distribution of verified, pending, and revision-flagged documentation',
    category: 'compliance',
    type: 'chart',
    chartType: 'donut',
    enabled: true,
    assignedRoles: ['HR'],
    order: 10,
    chartData: [
      { label: 'Verified & Clear', value: 65, color: '#10b981' },
      { label: 'Pending Review', value: 25, color: '#f59e0b' },
      { label: 'Revisions Dispatched', value: 10, color: '#ef4444' }
    ]
  },
  {
    id: 'chart_onboarding_timeline',
    title: 'Onboarding Milestone Gantt Timeline',
    description: 'Interactive Gantt schedule showing milestone phases, SLA gates, and Day-1 delivery timelines',
    category: 'onboarding',
    type: 'chart',
    chartType: 'gantt',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR', 'MANAGER'],
    order: 11,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Offer & Contract Signing', startValue: 1, value: 4, color: '#3b82f6', sublabel: 'Days 1-4' },
      { label: 'Document & Identity Clearance', startValue: 3, value: 9, color: '#6366f1', sublabel: 'Days 3-9' },
      { label: 'IT Hardware & Cloud Provisioning', startValue: 7, value: 14, color: '#8b5cf6', sublabel: 'Days 7-14' },
      { label: 'Compliance & NDA Certification', startValue: 12, value: 18, color: '#ec4899', sublabel: 'Days 12-18' },
      { label: 'Team Intro & Welcome Day-1', startValue: 17, value: 22, color: '#10b981', sublabel: 'Days 17-22' }
    ]
  },
  {
    id: 'chart_manager_velocity',
    title: 'Team Onboarding Velocity',
    description: 'Quarterly intake and Day-1 team milestone achievement trajectory',
    category: 'team',
    type: 'chart',
    chartType: 'area',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 12,
    chartData: [
      { label: 'Month 1', value: 6, color: '#6366f1' },
      { label: 'Month 2', value: 14, color: '#6366f1' },
      { label: 'Month 3', value: 24, color: '#6366f1' },
      { label: 'Month 4', value: 38, color: '#6366f1' }
    ]
  },
  {
    id: 'chart_emp_readiness',
    title: 'Personal Day-1 Clearance Gauge',
    description: 'Real-time personal compliance, badge provisioning, and Day-1 readiness rate',
    category: 'onboarding',
    type: 'chart',
    chartType: 'radial_gauge',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 12,
    chartData: [
      { label: 'Clearance Score', value: 95, color: '#10b981', sublabel: 'Target: 100%' }
    ]
  },
  {
    id: 'chart_emp_milestones',
    title: 'Onboarding Milestones Progression',
    description: 'Stage-by-stage completion breakdown across all onboarding requirements',
    category: 'onboarding',
    type: 'chart',
    chartType: 'bar',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 13,
    chartData: [
      { label: 'Profile', value: 100, color: '#10b981' },
      { label: 'Docs', value: 85, color: '#3b82f6' },
      { label: 'NDA', value: 100, color: '#10b981' },
      { label: 'Hardware', value: 100, color: '#10b981' },
      { label: 'Day 1 Prep', value: 75, color: '#6366f1' }
    ]
  },
  {
    id: 'emp_kpi_performance_score',
    title: 'Employee Performance & KPI Index',
    description: 'Calculated performance and Day-1 readiness index evaluating milestone pace, documentation, and compliance',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 14,
    customData: {
      value: '96 / 100',
      subtitle: 'High Velocity Performer',
      badge: 'Top Tier 96%',
      badgePositive: true,
      icon: 'Award'
    }
  },
  {
    id: 'chart_emp_sla_velocity',
    title: 'Milestone Velocity & Completion Pace',
    description: 'Weekly onboarding progression and task submission velocity curve',
    category: 'onboarding',
    type: 'chart',
    chartType: 'line',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 15,
    chartData: [
      { label: 'Week 1', value: 35, color: '#3b82f6' },
      { label: 'Week 2', value: 65, color: '#3b82f6' },
      { label: 'Week 3', value: 85, color: '#3b82f6' },
      { label: 'Week 4', value: 98, color: '#10b981' }
    ]
  },
  {
    id: 'chart_emp_compliance_breakdown',
    title: 'Personal Compliance Clearance Ratio',
    description: 'Verified statutory paperwork, identity checks, and pending gate submissions',
    category: 'compliance',
    type: 'chart',
    chartType: 'donut',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 16,
    chartData: [
      { label: 'Verified & Approved', value: 75, color: '#10b981' },
      { label: 'Under Review', value: 15, color: '#f59e0b' },
      { label: 'Pending Upload', value: 10, color: '#ef4444' }
    ]
  },
  {
    id: 'list_recent_arrivals',
    title: 'Upcoming Arrivals Queue',
    description: 'Queue of new team arrivals scheduled to join within the next 14 days',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 17
  },
  {
    id: 'list_compliance_alerts',
    title: 'Compliance Risk Alerts',
    description: 'Action items for expired documents, missing proofs, and unsigned NDAs',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 18
  },
  {
    id: 'hr_widget_attendance_stream',
    title: 'Live Attendance Stream',
    description: 'Real-time punch-in and punch-out attendance activity feed',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 19
  },
  {
    id: 'hr_widget_roster_table',
    title: 'Employee Action Roster',
    description: 'Roster queue with fast dossier inspections and document approval actions',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 20
  },
  {
    id: 'mgr_widget_team_checklist',
    title: 'Manager Day-1 Kickoff Checklist',
    description: 'Manager onboarding checklist: welcome email, buddy pairing, and kickoff',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 21
  },
  {
    id: 'mgr_widget_team_roster',
    title: 'Direct Reports Roster',
    description: 'List of team members reporting directly with live progress rings',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 22
  },
  {
    id: 'emp_widget_welcome_hero',
    title: 'Personal Welcome Hero Banner',
    description: 'Personalized greeting, employee title, department, and Day-1 guidance',
    category: 'onboarding',
    type: 'hero',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 23
  },
  {
    id: 'emp_widget_journey_steps',
    title: '10-Step Journey Progress',
    description: 'Interactive tracker showing completion status for all 10 onboarding steps',
    category: 'onboarding',
    type: 'progress',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 24
  },
  {
    id: 'emp_widget_manager_buddy',
    title: 'Manager & Support Team Info',
    description: 'Direct contact info for reporting manager and HR people partner',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 25
  },
  {
    id: 'emp_widget_hardware_card',
    title: 'Assigned Workstation & SSO Access',
    description: 'Hardware model, asset tag, and corporate Okta SSO single sign-on access',
    category: 'it',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 26
  },
  {
    id: 'emp_widget_day1_checklist',
    title: 'Day-1 Action Checklist',
    description: 'Personal onboarding task list and mandatory readiness checkpoints',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE', 'KPI_DASHBOARD'],
    order: 27
  }
];

const MASTER_STORAGE_KEY = 'quantira_master_dashlets_catalog';
const PERSONA_ORDER_PREFIX = 'quantira_persona_order_';
const PERSONA_SIZE_PREFIX = 'quantira_persona_sizes_';

export const getDashletColSpan = (dashlet: DashletConfig): DashletColSpan => {
  if (dashlet.colSpan && [3, 4, 6, 8, 12].includes(dashlet.colSpan)) {
    return dashlet.colSpan;
  }
  if (
    dashlet.id === 'hr_widget_roster_table' ||
    dashlet.id === 'list_recent_arrivals' ||
    dashlet.id === 'emp_widget_welcome_hero' ||
    dashlet.id === 'mgr_widget_team_roster' ||
    dashlet.id === 'hr_widget_attendance_stream'
  ) {
    return 12;
  }
  if (dashlet.type === 'chart' || dashlet.type === 'list' || dashlet.type === 'progress') {
    return 6;
  }
  return 3;
};

export const getDashletHeightPreset = (dashlet: DashletConfig): DashletHeightPreset => {
  if (dashlet.heightPreset && ['compact', 'normal', 'tall'].includes(dashlet.heightPreset)) {
    return dashlet.heightPreset;
  }
  if (
    dashlet.id === 'hr_widget_roster_table' ||
    dashlet.id === 'list_recent_arrivals' ||
    dashlet.id === 'mgr_widget_team_roster' ||
    dashlet.id === 'hr_widget_attendance_stream'
  ) {
    return 'tall';
  }
  if (dashlet.type === 'chart') {
    return 'normal';
  }
  return 'compact';
};

export const getColSpanClass = (colSpan: DashletColSpan): string => {
  switch (colSpan) {
    case 1:
      return 'col-span-12 sm:col-span-3 lg:col-span-1';
    case 2:
      return 'col-span-12 sm:col-span-4 lg:col-span-2';
    case 3:
      return 'col-span-12 sm:col-span-6 lg:col-span-3';
    case 4:
      return 'col-span-12 sm:col-span-6 lg:col-span-4';
    case 5:
      return 'col-span-12 sm:col-span-6 lg:col-span-5';
    case 6:
      return 'col-span-12 sm:col-span-6 lg:col-span-6';
    case 7:
      return 'col-span-12 sm:col-span-12 lg:col-span-7';
    case 8:
      return 'col-span-12 sm:col-span-12 lg:col-span-8';
    case 9:
      return 'col-span-12 sm:col-span-12 lg:col-span-9';
    case 10:
      return 'col-span-12 sm:col-span-12 lg:col-span-10';
    case 11:
      return 'col-span-12 sm:col-span-12 lg:col-span-11';
    case 12:
    default:
      return 'col-span-12 sm:col-span-12 lg:col-span-12';
  }
};

export const getHeightClass = (heightPreset?: DashletHeightPreset, customHeight?: number): string => {
  if (customHeight) return '';
  switch (heightPreset) {
    case 'compact':
      return 'min-h-[140px]';
    case 'tall':
      return 'min-h-[420px]';
    case 'custom':
      return '';
    case 'normal':
    default:
      return 'min-h-[260px]';
  }
};

export const setDashletSizeForPersona = (
  role: DashboardPersona,
  dashletId: string,
  colSpan: DashletColSpan,
  heightPreset?: DashletHeightPreset,
  customHeight?: number
): void => {
  try {
    const key = `${PERSONA_SIZE_PREFIX}${role}`;
    const raw = localStorage.getItem(key);
    const sizeMap: Record<
      string,
      { colSpan: DashletColSpan; heightPreset?: DashletHeightPreset; customHeight?: number }
    > = raw ? JSON.parse(raw) : {};

    sizeMap[dashletId] = {
      colSpan,
      heightPreset: heightPreset || sizeMap[dashletId]?.heightPreset || 'normal',
      customHeight: customHeight !== undefined ? customHeight : sizeMap[dashletId]?.customHeight
    };

    localStorage.setItem(key, JSON.stringify(sizeMap));
    window.dispatchEvent(
      new CustomEvent('dashboard-config-updated', {
        detail: { role, dashletId, colSpan, heightPreset, customHeight }
      })
    );
  } catch (err) {
    console.error('Error saving dashlet size:', err);
  }
};

export const getMasterDashlets = (): DashletConfig[] => {
  try {
    const saved = localStorage.getItem(MASTER_STORAGE_KEY);
    if (saved) {
      const parsed: DashletConfig[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedMap = new Map<string, DashletConfig>();
        parsed.forEach((d) => savedMap.set(d.id, d));

        const mergedDefaults = DEFAULT_MASTER_DASHLETS.map((def) => {
          if (savedMap.has(def.id)) {
            const s = savedMap.get(def.id)!;
            return {
              ...def,
              title: s.title || def.title,
              description: s.description !== undefined ? s.description : def.description,
              category: s.category || def.category,
              type: s.type || def.type,
              enabled: s.enabled !== undefined ? s.enabled : def.enabled,
              assignedRoles: s.assignedRoles && s.assignedRoles.length > 0 ? s.assignedRoles : def.assignedRoles,
              order: s.order !== undefined ? s.order : def.order,
              colSpan: s.colSpan || def.colSpan,
              heightPreset: s.heightPreset || def.heightPreset,
              chartType: s.chartType || def.chartType,
              chartData: s.chartData || def.chartData,
              customData: s.customData || def.customData
            };
          }
          return def;
        });

        const customItems = parsed.filter(
          (d) => d.id.startsWith('dashlet_custom_') || !DEFAULT_MASTER_DASHLETS.some((def) => def.id === d.id)
        );

        const combined = [...mergedDefaults, ...customItems];
        return combined.sort((a, b) => a.order - b.order);
      }
    }
  } catch (err) {
    console.error('Error loading master dashlets catalog:', err);
  }
  return [...DEFAULT_MASTER_DASHLETS];
};

export const saveMasterDashlets = (dashlets: DashletConfig[]): void => {
  try {
    localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(dashlets));
    window.dispatchEvent(new CustomEvent('dashboard-config-updated', { detail: { dashlets } }));
  } catch (err) {
    console.error('Error saving master dashlets catalog:', err);
  }
};

export const updateDashlet = (dashletId: string, updatedConfig: Partial<DashletConfig>): DashletConfig[] => {
  const current = getMasterDashlets();
  const updated = current.map((d) => (d.id === dashletId ? { ...d, ...updatedConfig } : d));
  saveMasterDashlets(updated);
  return updated;
};

export const toggleDashletEnabled = (dashletId: string, enabled: boolean): void => {
  const current = getMasterDashlets();
  const updated = current.map((d) => (d.id === dashletId ? { ...d, enabled } : d));
  saveMasterDashlets(updated);
};

export const toggleDashletRole = (dashletId: string, role: DashboardPersona): void => {
  const current = getMasterDashlets();
  const updated = current.map((d) => {
    if (d.id !== dashletId) return d;
    const exists = d.assignedRoles.includes(role);
    const assignedRoles = exists
      ? d.assignedRoles.filter((r) => r !== role)
      : [...d.assignedRoles, role];
    return { ...d, assignedRoles };
  });
  saveMasterDashlets(updated);
};

export const addCustomDashlet = (dashlet: Omit<DashletConfig, 'id' | 'order'>): DashletConfig => {
  const current = getMasterDashlets();
  const newDashlet: DashletConfig = {
    ...dashlet,
    id: `dashlet_custom_${Date.now()}`,
    order: current.length + 1
  };
  const updated = [...current, newDashlet];
  saveMasterDashlets(updated);
  return newDashlet;
};

export const deleteDashlet = (dashletId: string): void => {
  const current = getMasterDashlets();
  const updated = current.filter((d) => d.id !== dashletId).map((d, i) => ({ ...d, order: i + 1 }));
  saveMasterDashlets(updated);
};

export const resetMasterDashlets = (): DashletConfig[] => {
  const defaults = [...DEFAULT_MASTER_DASHLETS];
  saveMasterDashlets(defaults);
  return defaults;
};

// ================= PERSONA DASHBOARD CUSTOMIZATION & MOVE API ================= //

export const getDashletsForPersona = (role: DashboardPersona): DashletConfig[] => {
  const master = getMasterDashlets();
  const filtered = master.filter((d) => d.enabled && d.assignedRoles.includes(role));

  let sizeMap: Record<
    string,
    { colSpan: DashletColSpan; heightPreset?: DashletHeightPreset; customHeight?: number }
  > = {};
  try {
    const rawSizes = localStorage.getItem(`${PERSONA_SIZE_PREFIX}${role}`);
    if (rawSizes) {
      sizeMap = JSON.parse(rawSizes);
    }
  } catch {}

  const enriched = filtered.map((d) => {
    const customSize = sizeMap[d.id];
    const colSpan = customSize?.colSpan || getDashletColSpan(d);
    const heightPreset = customSize?.heightPreset || getDashletHeightPreset(d);
    const customHeight = customSize?.customHeight || d.customHeight;
    return {
      ...d,
      colSpan,
      heightPreset,
      customHeight
    };
  });

  try {
    const savedOrder = localStorage.getItem(`${PERSONA_ORDER_PREFIX}${role}`);
    if (savedOrder) {
      const orderIds: string[] = JSON.parse(savedOrder);
      const idMap = new Map<string, number>();
      orderIds.forEach((id, idx) => idMap.set(id, idx));

      return [...enriched].sort((a, b) => {
        const orderA = idMap.has(a.id) ? (idMap.get(a.id) as number) : a.order + 100;
        const orderB = idMap.has(b.id) ? (idMap.get(b.id) as number) : b.order + 100;
        return orderA - orderB;
      });
    }
  } catch {}

  return enriched.sort((a, b) => a.order - b.order);
};

export const moveDashletForPersona = (
  role: DashboardPersona,
  dashletId: string,
  direction: 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom'
): DashletConfig[] => {
  const current = getDashletsForPersona(role);
  const index = current.findIndex((d) => d.id === dashletId);
  if (index === -1) return current;

  let targetIndex = index;
  if (direction === 'top') {
    targetIndex = 0;
  } else if (direction === 'bottom') {
    targetIndex = current.length - 1;
  } else if (direction === 'left') {
    targetIndex = index - 1;
  } else if (direction === 'right') {
    targetIndex = index + 1;
  } else if (direction === 'up') {
    targetIndex = Math.max(0, index - 2);
  } else if (direction === 'down') {
    targetIndex = Math.min(current.length - 1, index + 2);
  }

  if (targetIndex < 0 || targetIndex >= current.length || targetIndex === index) return current;

  const reordered = [...current];
  const [removed] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, removed);

  const orderIds = reordered.map((d) => d.id);
  localStorage.setItem(`${PERSONA_ORDER_PREFIX}${role}`, JSON.stringify(orderIds));
  window.dispatchEvent(new CustomEvent('dashboard-config-updated', { detail: { role, orderIds } }));

  return reordered;
};

export const removeDashletFromPersona = (role: DashboardPersona, dashletId: string): void => {
  toggleDashletRole(dashletId, role);
};

export const addDashletToPersona = (role: DashboardPersona, dashletId: string): void => {
  const master = getMasterDashlets();
  const target = master.find((d) => d.id === dashletId);
  if (target && !target.assignedRoles.includes(role)) {
    toggleDashletRole(dashletId, role);
  }
};

export const resetPersonaLayout = (role: DashboardPersona): DashletConfig[] => {
  localStorage.removeItem(`${PERSONA_ORDER_PREFIX}${role}`);
  localStorage.removeItem(`${PERSONA_SIZE_PREFIX}${role}`);
  window.dispatchEvent(new CustomEvent('dashboard-config-updated', { detail: { role } }));
  return getDashletsForPersona(role);
};

// Returns widgets for role (backward compatibility)
export const getWidgetsForRole = (role: UserRole): CustomWidgetConfig[] => {
  const personaDashlets = getDashletsForPersona(role);
  return personaDashlets.map((d, i) => ({
    id: d.id,
    title: d.title,
    type: d.type,
    category: d.category,
    chartType: d.chartType,
    chartData: d.chartData,
    visible: true,
    order: i + 1,
    customData: d.customData
  }));
};

export const saveWidgetsForRole = (role: UserRole, widgets: CustomWidgetConfig[]): void => {
  const orderIds = widgets.map((w) => w.id);
  localStorage.setItem(`${PERSONA_ORDER_PREFIX}${role}`, JSON.stringify(orderIds));
  window.dispatchEvent(new CustomEvent('dashboard-config-updated', { detail: { role, orderIds } }));
};

export const resetWidgetsForRole = (role: UserRole): CustomWidgetConfig[] => {
  return resetPersonaLayout(role).map((d, i) => ({
    id: d.id,
    title: d.title,
    type: d.type,
    category: d.category,
    chartType: d.chartType,
    chartData: d.chartData,
    visible: true,
    order: i + 1,
    customData: d.customData
  }));
};

// ================= LIVE APPLICATION DATA BINDING REGISTRY ================= //

export interface DataSourceDefinition {
  id: string;
  name: string;
  category: string;
  badge: string;
  icon: string;
  description: string;
  recommendedCharts: ChartVisualizationType[];
  sampleMetric: { value: string; badge: string; subtitle: string };
}

export const DATA_SOURCE_OPTIONS: DataSourceDefinition[] = [
  {
    id: 'candidate_status',
    name: 'Onboarding Pipeline Status',
    category: 'Onboarding',
    badge: 'Live Candidates',
    icon: '👥',
    description: 'Distribution of candidates across pipeline stages (Verification, Equipment Staging, Orientation Scheduled, Completed, Rejected)',
    recommendedCharts: ['funnel', 'pie', 'donut', 'bar', 'horizontal_bar'],
    sampleMetric: { value: '12 Active', badge: '+4 this week', subtitle: 'Live in Onboarding Flow' }
  },
  {
    id: 'candidate_department',
    name: 'Department Headcount & Allocation',
    category: 'Organization',
    badge: 'Org Structure',
    icon: '🏢',
    description: 'Headcount and active onboarding throughput categorized by department (Engineering, Product, Sales, Marketing, HR, Operations, Finance)',
    recommendedCharts: ['bar', 'horizontal_bar', 'donut', 'pie'],
    sampleMetric: { value: '8 Depts', badge: 'Engineering (45%)', subtitle: 'Global Department Reach' }
  },
  {
    id: 'candidate_progress',
    name: 'Milestone Completion & Velocity',
    category: 'Onboarding',
    badge: 'Stage Progress',
    icon: '⚡',
    description: 'Step-by-step progress percentages across all active candidate onboarding gates (0-25%, 26-50%, 51-75%, 76-100%)',
    recommendedCharts: ['bar', 'line', 'area', 'radial_gauge'],
    sampleMetric: { value: '88% Avg', badge: 'On Target', subtitle: 'Overall Milestone Pace' }
  },
  {
    id: 'candidate_timeline_gantt',
    name: 'Onboarding Milestone Gantt Schedule',
    category: 'Timeline',
    badge: 'Project & SLA',
    icon: '⏱️',
    description: 'Day-by-day phase durations: Offer Contract Signing (Days 1-4), Document Clearance (Days 3-9), IT Staging (Days 7-14), Compliance & NDA (Days 12-18), Day-1 Welcome (Days 17-22)',
    recommendedCharts: ['gantt', 'horizontal_bar', 'line'],
    sampleMetric: { value: '22 Days', badge: '5 Phases', subtitle: 'Day-1 Clearance Gate' }
  },
  {
    id: 'it_asset_status',
    name: 'IT Hardware Allocation & Pool',
    category: 'IT & Hardware',
    badge: 'Hardware Inventory',
    icon: '💻',
    description: 'IT equipment status breakdown (Assigned, In Stock, In Staging, In Repair)',
    recommendedCharts: ['donut', 'pie', 'horizontal_bar', 'bar'],
    sampleMetric: { value: '42 Units', badge: '18 Available', subtitle: 'Staged for Day-1 Hires' }
  },
  {
    id: 'it_asset_types',
    name: 'IT Hardware Model Breakdown',
    category: 'IT & Hardware',
    badge: 'Device Models',
    icon: '🖥️',
    description: 'Inventory count across MacBook Pro 16", Dell XPS 15, 4K Monitors, and Ergonomic Hardware',
    recommendedCharts: ['horizontal_bar', 'bar', 'pie'],
    sampleMetric: { value: 'MacBook M3', badge: 'Tier 1 Standard', subtitle: 'Primary Engineering Fleet' }
  },
  {
    id: 'compliance_doc_status',
    name: 'Statutory Document Compliance',
    category: 'Compliance',
    badge: 'Legal & I-9',
    icon: '🛡️',
    description: 'Verification status across statutory I-9, government ID, NDA, and offer agreements',
    recommendedCharts: ['donut', 'radial_gauge', 'pie', 'bar'],
    sampleMetric: { value: '94.2%', badge: 'Compliant', subtitle: 'Verified Statutory Records' }
  },
  {
    id: 'task_priority',
    name: 'Task Priority & Urgent Actions',
    category: 'Tasks & SLA',
    badge: 'Action Items',
    icon: '📋',
    description: 'Distribution of onboarding tasks across Urgent, High, Medium, and Low priorities',
    recommendedCharts: ['donut', 'bar', 'funnel', 'horizontal_bar'],
    sampleMetric: { value: '4 Urgent', badge: 'Immediate Action', subtitle: 'Priority Action Items' }
  },
  {
    id: 'branch_headcount',
    name: 'Branch & Location Distribution',
    category: 'Organization',
    badge: 'Global Branches',
    icon: '🌍',
    description: 'Employee headcount across New York HQ, London Office, Singapore Hub, Sydney, and Remote Global',
    recommendedCharts: ['bar', 'pie', 'donut', 'horizontal_bar'],
    sampleMetric: { value: '5 Offices', badge: 'Global', subtitle: 'HQ & Remote Sites' }
  },
  {
    id: 'custom_static',
    name: 'Custom Dataset (Interactive Table Editor)',
    category: 'Custom Data',
    badge: 'User Defined',
    icon: '✏️',
    description: 'Directly define and edit custom data rows with labels, values, start values (for Gantt), and color pickers',
    recommendedCharts: ['bar', 'horizontal_bar', 'line', 'area', 'pie', 'donut', 'funnel', 'radial_gauge', 'gantt'],
    sampleMetric: { value: 'Custom', badge: 'Static', subtitle: 'Manually Configured' }
  }
];

export const resolveChartDataFromSource = (
  sourceId: string,
  candidates: Array<{ status?: string; department?: string; location?: string; progress?: number; documents?: Array<{ status?: string }> }> = [],
  tasks: Array<{ priority?: string }> = [],
  assets: Array<{ status?: string; category?: string; name?: string }> = []
): ChartDataPoint[] => {
  switch (sourceId) {
    case 'candidate_status': {
      const counts: Record<string, { label: string; count: number; color: string }> = {
        verification: { label: 'Doc Verification', count: 0, color: '#f59e0b' },
        equipment_provisioning: { label: 'IT Provisioning', count: 0, color: '#3b82f6' },
        orientation_scheduled: { label: 'Orientation Ready', count: 0, color: '#8b5cf6' },
        completed: { label: 'Completed Day 1', count: 0, color: '#10b981' },
        rejected: { label: 'Revision / Paused', count: 0, color: '#ef4444' }
      };

      candidates.forEach((c) => {
        const key = c.status || 'verification';
        if (counts[key]) {
          counts[key].count++;
        } else {
          counts.verification.count++;
        }
      });

      return Object.values(counts).map((item) => ({
        label: item.label,
        value: Math.max(item.count, 1),
        color: item.color,
        sublabel: `${item.count} Candidates`
      }));
    }

    case 'candidate_department': {
      const deptColors: Record<string, string> = {
        Engineering: '#3b82f6',
        Product: '#6366f1',
        Marketing: '#ec4899',
        Sales: '#f59e0b',
        Operations: '#10b981',
        HR: '#8b5cf6',
        Finance: '#06b6d4',
        Design: '#f43f5e'
      };

      const deptMap: Record<string, number> = {};
      candidates.forEach((c) => {
        const d = c.department || 'Engineering';
        deptMap[d] = (deptMap[d] || 0) + 1;
      });

      // Default baseline if candidate list is small
      if (Object.keys(deptMap).length === 0) {
        return [
          { label: 'Engineering', value: 24, color: '#3b82f6' },
          { label: 'Product', value: 16, color: '#6366f1' },
          { label: 'Marketing', value: 12, color: '#ec4899' },
          { label: 'Sales', value: 19, color: '#f59e0b' },
          { label: 'Operations', value: 9, color: '#10b981' }
        ];
      }

      return Object.entries(deptMap).map(([dept, count]) => ({
        label: dept,
        value: count,
        color: deptColors[dept] || '#3b82f6',
        sublabel: `${count} Hires`
      }));
    }

    case 'candidate_progress': {
      return [
        { label: '0 - 25% (Offer Accepted)', value: candidates.filter((c) => (c.progress || 0) <= 25).length || 3, color: '#3b82f6' },
        { label: '26 - 50% (Docs Submitted)', value: candidates.filter((c) => (c.progress || 0) > 25 && (c.progress || 0) <= 50).length || 5, color: '#6366f1' },
        { label: '51 - 75% (IT Staged & Clear)', value: candidates.filter((c) => (c.progress || 0) > 50 && (c.progress || 0) <= 75).length || 6, color: '#8b5cf6' },
        { label: '76 - 100% (Day-1 Ready)', value: candidates.filter((c) => (c.progress || 0) > 75).length || 8, color: '#10b981' }
      ];
    }

    case 'candidate_timeline_gantt': {
      return [
        { label: 'Offer & Contract Signing', startValue: 1, value: 4, color: '#3b82f6', sublabel: 'Days 1-4' },
        { label: 'Document & Identity Clearance', startValue: 3, value: 9, color: '#6366f1', sublabel: 'Days 3-9' },
        { label: 'IT Hardware & Cloud Provisioning', startValue: 7, value: 14, color: '#8b5cf6', sublabel: 'Days 7-14' },
        { label: 'Compliance & NDA Certification', startValue: 12, value: 18, color: '#ec4899', sublabel: 'Days 12-18' },
        { label: 'Team Intro & Welcome Day-1', startValue: 17, value: 22, color: '#10b981', sublabel: 'Days 17-22' }
      ];
    }

    case 'it_asset_status': {
      const statusMap: Record<string, { count: number; color: string }> = {
        Assigned: { count: 0, color: '#3b82f6' },
        Available: { count: 0, color: '#10b981' },
        'In Repair': { count: 0, color: '#f59e0b' },
        'In Staging': { count: 0, color: '#8b5cf6' }
      };

      assets.forEach((a) => {
        const s = a.status || 'Assigned';
        if (statusMap[s]) {
          statusMap[s].count++;
        } else {
          statusMap.Assigned.count++;
        }
      });

      return Object.entries(statusMap).map(([status, item]) => ({
        label: status,
        value: Math.max(item.count, 2),
        color: item.color,
        sublabel: `${item.count} Devices`
      }));
    }

    case 'it_asset_types': {
      return [
        { label: 'Apple MacBook Pro 16"', value: assets.filter((a) => a.category === 'Laptop' || a.name?.includes('MacBook')).length || 18, color: '#3b82f6' },
        { label: 'Dell XPS 15 Ultra', value: 12, color: '#6366f1' },
        { label: 'Dell UltraSharp 4K Monitor', value: assets.filter((a) => a.category === 'Monitor').length || 14, color: '#10b981' },
        { label: 'Ergonomic Keyboards & Mice', value: 25, color: '#8b5cf6' }
      ];
    }

    case 'compliance_doc_status': {
      let verifiedCount = 0;
      let pendingCount = 0;

      candidates.forEach((c) => {
        if (c.documents && c.documents.length > 0) {
          c.documents.forEach((d) => {
            if (d.status === 'verified') verifiedCount++;
            else pendingCount++;
          });
        } else {
          verifiedCount += 6;
          pendingCount += 2;
        }
      });

      return [
        { label: 'Verified & Compliant', value: verifiedCount || 65, color: '#10b981' },
        { label: 'Pending HR Review', value: pendingCount || 25, color: '#f59e0b' },
        { label: 'Revisions Requested', value: 10, color: '#ef4444' }
      ];
    }

    case 'task_priority': {
      return [
        { label: 'Urgent Priority', value: tasks.filter((t) => t.priority === 'urgent').length || 4, color: '#ef4444' },
        { label: 'High Priority', value: tasks.filter((t) => t.priority === 'high').length || 8, color: '#f59e0b' },
        { label: 'Medium Priority', value: tasks.filter((t) => t.priority === 'medium').length || 15, color: '#3b82f6' },
        { label: 'Low Priority', value: tasks.filter((t) => t.priority === 'low').length || 12, color: '#10b981' }
      ];
    }

    case 'branch_headcount': {
      const locMap: Record<string, number> = {};
      candidates.forEach((c) => {
        const l = c.location || 'New York HQ';
        locMap[l] = (locMap[l] || 0) + 1;
      });

      if (Object.keys(locMap).length === 0) {
        return [
          { label: 'New York HQ', value: 45, color: '#3b82f6' },
          { label: 'London Office', value: 28, color: '#6366f1' },
          { label: 'Singapore Hub', value: 18, color: '#10b981' },
          { label: 'Sydney Office', value: 14, color: '#8b5cf6' },
          { label: 'Remote Global', value: 32, color: '#ec4899' }
        ];
      }

      return Object.entries(locMap).map(([loc, count], idx) => ({
        label: loc,
        value: count,
        color: ['#3b82f6', '#6366f1', '#10b981', '#8b5cf6', '#ec4899'][idx % 5],
        sublabel: `${count} Staff`
      }));
    }

    default:
      return [];
  }
};

