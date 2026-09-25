import { UserRole } from '../types/auth';

export type ChartVisualizationType =
  | 'bar'
  | 'horizontal_bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'funnel'
  | 'radial_gauge';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  sublabel?: string;
}

export interface DashletConfig {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'it' | 'compliance' | 'team' | 'custom';
  type: 'metric' | 'chart' | 'list' | 'progress' | 'hero' | 'custom';
  chartType?: ChartVisualizationType;
  chartData?: ChartDataPoint[];
  enabled: boolean; // Global ON / OFF switch for this dashlet
  assignedRoles: UserRole[]; // Which personas will have this dashlet on their dashboard
  order: number;
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
    assignedRoles: ['SUPER_ADMIN', 'HR', 'EMPLOYEE'],
    order: 4
  },
  {
    id: 'kpi_asset_pool',
    title: 'IT Hardware Availability',
    description: 'Stock availability of provisioned MacBooks, peripherals, and software seats',
    category: 'it',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
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
    id: 'chart_manager_velocity',
    title: 'Team Onboarding Velocity',
    description: 'Quarterly intake and Day-1 team milestone achievement trajectory',
    category: 'team',
    type: 'chart',
    chartType: 'area',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 11,
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
    assignedRoles: ['EMPLOYEE'],
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
    assignedRoles: ['EMPLOYEE'],
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
    assignedRoles: ['EMPLOYEE'],
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
    assignedRoles: ['EMPLOYEE'],
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
    assignedRoles: ['EMPLOYEE'],
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
    order: 14
  },
  {
    id: 'list_compliance_alerts',
    title: 'Compliance Risk Alerts',
    description: 'Action items for expired documents, missing proofs, and unsigned NDAs',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 15
  },
  {
    id: 'hr_widget_attendance_stream',
    title: 'Live Attendance Stream',
    description: 'Real-time punch-in and punch-out attendance activity feed',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 16
  },
  {
    id: 'hr_widget_roster_table',
    title: 'Employee Action Roster',
    description: 'Roster queue with fast dossier inspections and document approval actions',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 17
  },
  {
    id: 'mgr_widget_team_checklist',
    title: 'Manager Day-1 Kickoff Checklist',
    description: 'Manager onboarding checklist: welcome email, buddy pairing, and kickoff',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 18
  },
  {
    id: 'mgr_widget_team_roster',
    title: 'Direct Reports Roster',
    description: 'List of team members reporting directly with live progress rings',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 19
  },
  {
    id: 'emp_widget_welcome_hero',
    title: 'Personal Welcome Hero Banner',
    description: 'Personalized greeting, employee title, department, and Day-1 guidance',
    category: 'onboarding',
    type: 'hero',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 20
  },
  {
    id: 'emp_widget_journey_steps',
    title: '10-Step Journey Progress',
    description: 'Interactive tracker showing completion status for all 10 onboarding steps',
    category: 'onboarding',
    type: 'progress',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 21
  },
  {
    id: 'emp_widget_manager_buddy',
    title: 'Manager & Support Team Info',
    description: 'Direct contact info for reporting manager and HR people partner',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 22
  },
  {
    id: 'emp_widget_hardware_card',
    title: 'Assigned Workstation & SSO Access',
    description: 'Hardware model, asset tag, and corporate Okta SSO single sign-on access',
    category: 'it',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 23
  },
  {
    id: 'emp_widget_day1_checklist',
    title: 'Day-1 Action Checklist',
    description: 'Personal onboarding task list and mandatory readiness checkpoints',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 24
  }
];

const MASTER_STORAGE_KEY = 'quantira_master_dashlets_catalog';
const PERSONA_ORDER_PREFIX = 'quantira_persona_order_';

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
              enabled: s.enabled !== undefined ? s.enabled : def.enabled,
              assignedRoles: s.assignedRoles && s.assignedRoles.length > 0 ? s.assignedRoles : def.assignedRoles,
              order: s.order !== undefined ? s.order : def.order,
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

export const toggleDashletEnabled = (dashletId: string, enabled: boolean): void => {
  const current = getMasterDashlets();
  const updated = current.map((d) => (d.id === dashletId ? { ...d, enabled } : d));
  saveMasterDashlets(updated);
};

export const toggleDashletRole = (dashletId: string, role: UserRole): void => {
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

export const getDashletsForPersona = (role: UserRole): DashletConfig[] => {
  const master = getMasterDashlets();
  const filtered = master.filter((d) => d.enabled && d.assignedRoles.includes(role));

  try {
    const savedOrder = localStorage.getItem(`${PERSONA_ORDER_PREFIX}${role}`);
    if (savedOrder) {
      const orderIds: string[] = JSON.parse(savedOrder);
      const idMap = new Map<string, number>();
      orderIds.forEach((id, idx) => idMap.set(id, idx));

      return [...filtered].sort((a, b) => {
        const orderA = idMap.has(a.id) ? (idMap.get(a.id) as number) : a.order + 100;
        const orderB = idMap.has(b.id) ? (idMap.get(b.id) as number) : b.order + 100;
        return orderA - orderB;
      });
    }
  } catch {}

  return filtered.sort((a, b) => a.order - b.order);
};

export const moveDashletForPersona = (
  role: UserRole,
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

export const removeDashletFromPersona = (role: UserRole, dashletId: string): void => {
  toggleDashletRole(dashletId, role);
};

export const addDashletToPersona = (role: UserRole, dashletId: string): void => {
  const master = getMasterDashlets();
  const target = master.find((d) => d.id === dashletId);
  if (target && !target.assignedRoles.includes(role)) {
    toggleDashletRole(dashletId, role);
  }
};

export const resetPersonaLayout = (role: UserRole): DashletConfig[] => {
  localStorage.removeItem(`${PERSONA_ORDER_PREFIX}${role}`);
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
