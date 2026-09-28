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
  // ================= 1. SUPER ADMIN PERSONA DASHLETS (1 - 22) ================= //
  {
    id: 'sa_total_employees',
    title: 'Total Employees',
    description: 'Total global employee headcount across all corporate locations & branches',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 1,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '248', subtitle: 'Global enterprise workforce', badge: '+12% YoY', badgePositive: true, icon: 'Users' }
  },
  {
    id: 'sa_active_employees',
    title: 'Active Employees',
    description: 'Currently active and working employees on regular payroll',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 2,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '232', subtitle: '93.5% operational workforce', badge: '+8 this quarter', badgePositive: true, icon: 'UserCheck' }
  },
  {
    id: 'sa_new_joiners',
    title: 'New Joiners',
    description: 'Employees inducted and onboarded within the last 30 days',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 3,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '18', subtitle: 'Joined in current billing cycle', badge: '+4 vs last month', badgePositive: true, icon: 'Sparkles' }
  },
  {
    id: 'sa_employees_on_leave',
    title: 'Employees on Leave',
    description: 'Employees currently on approved paid, sick, or personal leave',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 4,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '7', subtitle: 'Active approved leaves', badge: 'Normal SLA', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'sa_employees_on_probation',
    title: 'Employees on Probation',
    description: 'New hires in their initial 90-day evaluation and probation window',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 5,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '14', subtitle: 'Under 90-day performance review', badge: '5 due this week', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'sa_employees_on_notice_period',
    title: 'Employees on Notice Period',
    description: 'Employees currently serving formal notice period prior to exit',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 6,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '3', subtitle: 'Handover & knowledge transfer', badge: '2 completing soon', badgePositive: false, icon: 'AlertTriangle' }
  },
  {
    id: 'sa_total_departments',
    title: 'Total Departments',
    description: 'Active functional business units and corporate divisions',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 7,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '8', subtitle: 'Eng, Product, Sales, Ops, HR, etc.', badge: 'All Active', badgePositive: true, icon: 'Building' }
  },
  {
    id: 'sa_total_branches',
    title: 'Total Branches',
    description: 'Global physical offices, branch hubs, and remote jurisdictions',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 8,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '5', subtitle: 'San Jose, Austin, London, Bengaluru, Tokyo', badge: '5 Global Hubs', badgePositive: true, icon: 'Building' }
  },
  {
    id: 'sa_open_positions',
    title: 'Open Positions',
    description: 'Approved open job requisitions currently in recruitment pipeline',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 9,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '26', subtitle: 'Approved talent requisitions', badge: '12 Priority', badgePositive: true, icon: 'Briefcase' }
  },
  {
    id: 'sa_pending_approvals',
    title: 'Pending Approvals',
    description: 'Executive requisitions, budget allowances, and contract sign-offs awaiting action',
    category: 'compliance',
    type: 'metric',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN', 'HR'],
    order: 10,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '6', subtitle: 'Require administrative clearance', badge: 'Action Required', badgePositive: false, icon: 'CheckCircle2' }
  },
  {
    id: 'sa_employee_headcount_trend',
    title: 'Employee Headcount Trend',
    description: 'Historical headcount growth, quarterly additions, and talent scaling trajectory',
    category: 'onboarding',
    type: 'chart',
    chartType: 'line',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 11,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Jan', value: 180, color: '#3b82f6' },
      { label: 'Feb', value: 195, color: '#3b82f6' },
      { label: 'Mar', value: 210, color: '#3b82f6' },
      { label: 'Apr', value: 224, color: '#3b82f6' },
      { label: 'May', value: 236, color: '#3b82f6' },
      { label: 'Jun', value: 248, color: '#10b981' }
    ]
  },
  {
    id: 'sa_department_wise_headcount',
    title: 'Department-wise Headcount',
    description: 'Distribution of global employees across corporate departments',
    category: 'onboarding',
    type: 'chart',
    chartType: 'bar',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 12,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Engineering', value: 84, color: '#3b82f6' },
      { label: 'Product & Design', value: 36, color: '#6366f1' },
      { label: 'Sales & BD', value: 48, color: '#f59e0b' },
      { label: 'Marketing', value: 28, color: '#ec4899' },
      { label: 'Operations & HR', value: 32, color: '#10b981' },
      { label: 'Customer Success', value: 20, color: '#8b5cf6' }
    ]
  },
  {
    id: 'sa_branch_wise_headcount',
    title: 'Branch-wise Headcount',
    description: 'Headcount distribution across regional headquarters and global branches',
    category: 'onboarding',
    type: 'chart',
    chartType: 'horizontal_bar',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 13,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'San Jose HQ', value: 110, color: '#3b82f6' },
      { label: 'London EMEA Hub', value: 54, color: '#6366f1' },
      { label: 'Bengaluru APAC Hub', value: 46, color: '#10b981' },
      { label: 'Austin Branch', value: 26, color: '#f59e0b' },
      { label: 'Tokyo Branch', value: 12, color: '#ec4899' }
    ]
  },
  {
    id: 'sa_attendance_overview',
    title: 'Attendance Overview',
    description: 'Organization-wide daily attendance, remote presence, and leave ratios',
    category: 'onboarding',
    type: 'chart',
    chartType: 'donut',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 14,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'On-Premises', value: 142, color: '#10b981' },
      { label: 'Remote / WFH', value: 90, color: '#3b82f6' },
      { label: 'On Leave', value: 7, color: '#f59e0b' },
      { label: 'Late / Partial', value: 9, color: '#8b5cf6' }
    ]
  },
  {
    id: 'sa_employee_lifecycle',
    title: 'Employee Lifecycle',
    description: 'Stage conversion pipeline from recruitment offer to sustained retention',
    category: 'onboarding',
    type: 'chart',
    chartType: 'funnel',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 15,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Offers Extended', value: 100, color: '#3b82f6' },
      { label: 'Accepted & Onboarded', value: 88, color: '#6366f1' },
      { label: 'Probation Confirmed', value: 82, color: '#8b5cf6' },
      { label: 'Active Tenured', value: 76, color: '#10b981' }
    ]
  },
  {
    id: 'sa_attrition_overview',
    title: 'Attrition Overview',
    description: 'Quarterly voluntary and involuntary employee turnover analytics',
    category: 'onboarding',
    type: 'chart',
    chartType: 'bar',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 16,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Q1', value: 3.2, color: '#3b82f6', sublabel: '3.2% Turnover' },
      { label: 'Q2', value: 2.8, color: '#3b82f6', sublabel: '2.8% Turnover' },
      { label: 'Q3', value: 2.1, color: '#10b981', sublabel: '2.1% Turnover' },
      { label: 'Q4 (Target)', value: 1.9, color: '#10b981', sublabel: '1.9% Goal' }
    ]
  },
  {
    id: 'sa_recruitment_overview',
    title: 'Recruitment Overview',
    description: 'Talent pipeline stages: applied, screened, interviewed, and offered',
    category: 'onboarding',
    type: 'chart',
    chartType: 'funnel',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 17,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Candidates Applied', value: 340, color: '#3b82f6' },
      { label: 'Screened & Shortlisted', value: 140, color: '#6366f1' },
      { label: 'Technical Interviews', value: 68, color: '#8b5cf6' },
      { label: 'Offers Extended', value: 26, color: '#10b981' }
    ]
  },
  {
    id: 'sa_leave_overview',
    title: 'Leave Overview',
    description: 'Breakdown of taken and planned leave categories across the enterprise',
    category: 'onboarding',
    type: 'chart',
    chartType: 'pie',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 18,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Casual / Vacation Leave', value: 45, color: '#3b82f6' },
      { label: 'Sick / Medical Leave', value: 28, color: '#10b981' },
      { label: 'Maternity / Paternity', value: 15, color: '#ec4899' },
      { label: 'Comp Off / Unpaid', value: 12, color: '#f59e0b' }
    ]
  },
  {
    id: 'sa_recent_joiners',
    title: 'Recent Joiners',
    description: 'Newly inducted hires who started with the organization recently',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 19,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'sa_recent_exits',
    title: 'Recent Exits',
    description: 'Completed employee offboardings and exit clearance status',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 20,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'sa_pending_hr_actions',
    title: 'Pending HR Actions',
    description: 'Administrative approvals, contract renewals, and compliance alerts',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 21,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'sa_system_alerts',
    title: 'System Alerts',
    description: 'Critical enterprise security, server health, and integration status feeds',
    category: 'it',
    type: 'list',
    enabled: true,
    assignedRoles: ['SUPER_ADMIN'],
    order: 22,
    colSpan: 6,
    heightPreset: 'normal'
  },

  // ================= 2. HR OPERATIONS PERSONA DASHLETS (23 - 44) ================= //
  {
    id: 'hr_total_employees',
    title: 'Total Employees',
    description: 'Total active employee headcount managed under HR operations',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 23,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '248', subtitle: 'Total managed staff', badge: '+5 this month', badgePositive: true, icon: 'Users' }
  },
  {
    id: 'hr_present_today',
    title: 'Present Today',
    description: 'Staff logged into attendance system and active today',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 24,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '232', subtitle: '93.5% presence rate', badge: 'High Attendance', badgePositive: true, icon: 'CheckCircle2' }
  },
  {
    id: 'hr_absent_today',
    title: 'Absent Today',
    description: 'Unplanned absences and missing punch-ins today',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 25,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '9', subtitle: 'Unnotified absences', badge: 'Follow-up sent', badgePositive: false, icon: 'AlertTriangle' }
  },
  {
    id: 'hr_on_leave_today',
    title: 'On Leave Today',
    description: 'Employees on pre-approved leave or scheduled time-off today',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 26,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '7', subtitle: 'Approved leave calendar', badge: 'Cover assigned', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'hr_new_joiners',
    title: 'New Joiners',
    description: 'Newly hired staff scheduled to start or newly joined this week',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 27,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '18', subtitle: 'Active new hire intake', badge: 'Day 1 induction', badgePositive: true, icon: 'Sparkles' }
  },
  {
    id: 'hr_pending_onboarding',
    title: 'Pending Onboarding',
    description: 'Candidates with pending identity verification, background check, or IT setup',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 28,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '8', subtitle: 'Awaiting clearance gates', badge: '3 at Day-1 Ready', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'hr_probation_due',
    title: 'Probation Due',
    description: 'Employees completing probationary period requiring HR confirmation review',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 29,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '5', subtitle: 'Reviews due in 14 days', badge: 'Action required', badgePositive: false, icon: 'Clock' }
  },
  {
    id: 'hr_notice_period',
    title: 'Notice Period',
    description: 'Staff currently serving resignation notice period with exit dates',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 30,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '3', subtitle: 'Exit clearance in progress', badge: 'Asset recovery on track', badgePositive: true, icon: 'AlertTriangle' }
  },
  {
    id: 'hr_pending_approvals',
    title: 'Pending Approvals',
    description: 'Leave requests, reimbursement claims, and document submissions awaiting HR approval',
    category: 'compliance',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 31,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '11', subtitle: 'Submissions awaiting review', badge: '4 Urgent', badgePositive: false, icon: 'CheckCircle2' }
  },
  {
    id: 'hr_open_positions',
    title: 'Open Positions',
    description: 'Active department job requisitions and candidate sourcing drives',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['HR'],
    order: 32,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '26', subtitle: 'Across all departments', badge: '12 in Final Round', badgePositive: true, icon: 'Briefcase' }
  },
  {
    id: 'hr_attendance_overview',
    title: 'Attendance Overview',
    description: 'Real-time punch-in, WFH, and departmental attendance ratios',
    category: 'onboarding',
    type: 'chart',
    chartType: 'donut',
    enabled: true,
    assignedRoles: ['HR'],
    order: 33,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Office Check-In', value: 142, color: '#10b981' },
      { label: 'Work From Home', value: 90, color: '#3b82f6' },
      { label: 'Approved Leave', value: 7, color: '#f59e0b' },
      { label: 'Unplanned Leave', value: 9, color: '#ef4444' }
    ]
  },
  {
    id: 'hr_headcount_trend',
    title: 'Headcount Trend',
    description: 'Monthly employee headcount growth curve and recruiting net additions',
    category: 'onboarding',
    type: 'chart',
    chartType: 'area',
    enabled: true,
    assignedRoles: ['HR'],
    order: 34,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Q1', value: 195, color: '#3b82f6' },
      { label: 'Q2', value: 215, color: '#6366f1' },
      { label: 'Q3', value: 232, color: '#8b5cf6' },
      { label: 'Q4', value: 248, color: '#10b981' }
    ]
  },
  {
    id: 'hr_employee_distribution',
    title: 'Employee Distribution',
    description: 'Breakdown of employees by department, employment type, and seniority',
    category: 'onboarding',
    type: 'chart',
    chartType: 'pie',
    enabled: true,
    assignedRoles: ['HR'],
    order: 35,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Full-Time Regular', value: 210, color: '#3b82f6' },
      { label: 'Contractors / Temp', value: 24, color: '#6366f1' },
      { label: 'Interns / Trainees', value: 14, color: '#10b981' }
    ]
  },
  {
    id: 'hr_recruitment_pipeline',
    title: 'Recruitment Pipeline',
    description: 'Active talent funnel stages from sourcing to offer acceptance',
    category: 'onboarding',
    type: 'chart',
    chartType: 'funnel',
    enabled: true,
    assignedRoles: ['HR'],
    order: 36,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Applications', value: 280, color: '#3b82f6' },
      { label: 'HR Screening', value: 120, color: '#6366f1' },
      { label: 'Manager Rounds', value: 55, color: '#8b5cf6' },
      { label: 'Offers Released', value: 22, color: '#10b981' }
    ]
  },
  {
    id: 'hr_onboarding_progress',
    title: 'Onboarding Progress',
    description: 'Step-by-step onboarding progress and compliance completion percentage',
    category: 'onboarding',
    type: 'chart',
    chartType: 'bar',
    enabled: true,
    assignedRoles: ['HR'],
    order: 37,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Doc Submission', value: 92, color: '#3b82f6' },
      { label: 'Identity / I-9', value: 88, color: '#6366f1' },
      { label: 'NDA & Policies', value: 96, color: '#10b981' },
      { label: 'IT Provisioning', value: 84, color: '#f59e0b' },
      { label: 'Induction Ready', value: 78, color: '#8b5cf6' }
    ]
  },
  {
    id: 'hr_leave_overview',
    title: 'Leave Overview',
    description: 'Distribution of leave balance utilization across casual, sick, and earned leave',
    category: 'onboarding',
    type: 'chart',
    chartType: 'donut',
    enabled: true,
    assignedRoles: ['HR'],
    order: 38,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Casual Leave (CL)', value: 48, color: '#3b82f6' },
      { label: 'Earned / Privileged (EL)', value: 34, color: '#10b981' },
      { label: 'Sick Leave (SL)', value: 18, color: '#f59e0b' }
    ]
  },
  {
    id: 'hr_attrition_trend',
    title: 'Attrition Trend',
    description: 'Quarterly employee turnover rate vs industry benchmark',
    category: 'onboarding',
    type: 'chart',
    chartType: 'line',
    enabled: true,
    assignedRoles: ['HR'],
    order: 39,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Q1', value: 3.4, color: '#3b82f6' },
      { label: 'Q2', value: 2.9, color: '#3b82f6' },
      { label: 'Q3', value: 2.3, color: '#10b981' },
      { label: 'Q4', value: 2.0, color: '#10b981' }
    ]
  },
  {
    id: 'hr_probation_review_due',
    title: 'Probation Review Due',
    description: 'List of employees due for probation appraisal and manager sign-off',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 40,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'hr_documents_pending',
    title: 'Documents Pending',
    description: 'Pending compliance proofs, ID uploads, tax declarations, and signed NDAs',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 41,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'hr_upcoming_birthdays',
    title: 'Upcoming Birthdays',
    description: 'Upcoming employee birthdays for cultural celebration and announcements',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 42,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'hr_upcoming_work_anniversaries',
    title: 'Upcoming Work Anniversaries',
    description: 'Tenure milestones and work anniversary celebrations for the current month',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 43,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'hr_hr_action_items',
    title: 'HR Action Items',
    description: 'Urgent HR deliverables: payroll lock, compliance filings, and contract renewals',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['HR'],
    order: 44,
    colSpan: 6,
    heightPreset: 'normal'
  },

  // ================= 3. MANAGER PERSONA DASHLETS (45 - 63) ================= //
  {
    id: 'mgr_my_team',
    title: 'My Team',
    description: 'Total direct and indirect team reports managed',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 45,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '14', subtitle: 'Direct team members', badge: '100% Staffed', badgePositive: true, icon: 'Users' }
  },
  {
    id: 'mgr_present_today',
    title: 'Present Today',
    description: 'Team members checked in and actively working today',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 46,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '13', subtitle: '92.8% team attendance', badge: 'All on schedule', badgePositive: true, icon: 'CheckCircle2' }
  },
  {
    id: 'mgr_absent_today',
    title: 'Absent Today',
    description: 'Team members absent without scheduled leave',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 47,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '0', subtitle: 'No unannounced absences', badge: 'Optimal', badgePositive: true, icon: 'CheckCircle2' }
  },
  {
    id: 'mgr_on_leave',
    title: 'On Leave',
    description: 'Team members on approved vacation or medical leave today',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 48,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '1', subtitle: 'Sarah Connor (PTO)', badge: 'Coverage assigned', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'mgr_late_arrivals',
    title: 'Late Arrivals',
    description: 'Team check-ins recorded past shift scheduled start time',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 49,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '1', subtitle: 'Logged 15m delay', badge: 'Grace period', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'mgr_pending_approvals',
    title: 'Pending Approvals',
    description: 'Time-off requests, expense receipts, and timesheets awaiting your manager sign-off',
    category: 'compliance',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 50,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '3', subtitle: 'Pending manager approval', badge: 'Review required', badgePositive: false, icon: 'CheckCircle2' }
  },
  {
    id: 'mgr_goals_completed',
    title: 'Goals Completed',
    description: 'Sprint and quarterly OKR milestones successfully achieved by team',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 51,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '28 / 32', subtitle: '87.5% OKR completion', badge: '+4 this sprint', badgePositive: true, icon: 'Award' }
  },
  {
    id: 'mgr_reviews_due',
    title: 'Reviews Due',
    description: 'Quarterly 1-on-1 performance and probation reviews pending',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 52,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '2', subtitle: 'Due before month-end', badge: 'Schedule 1-on-1', badgePositive: false, icon: 'Clock' }
  },
  {
    id: 'mgr_team_attendance',
    title: 'Team Attendance',
    description: 'Weekly team attendance rate and punch-in consistency',
    category: 'onboarding',
    type: 'chart',
    chartType: 'bar',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 53,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Mon', value: 14, color: '#10b981' },
      { label: 'Tue', value: 14, color: '#10b981' },
      { label: 'Wed', value: 13, color: '#3b82f6' },
      { label: 'Thu', value: 14, color: '#10b981' },
      { label: 'Fri', value: 13, color: '#3b82f6' }
    ]
  },
  {
    id: 'mgr_team_goal_progress',
    title: 'Team Goal Progress',
    description: 'Quarterly team OKR and strategic milestone achievement gauge',
    category: 'team',
    type: 'chart',
    chartType: 'radial_gauge',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 54,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Team OKR Pace', value: 88, color: '#10b981', sublabel: 'Target: 90%' }
    ]
  },
  {
    id: 'mgr_team_performance',
    title: 'Team Performance',
    description: 'Monthly sprint velocity, story point throughput, and delivery consistency',
    category: 'team',
    type: 'chart',
    chartType: 'area',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 55,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Sprint 1', value: 42, color: '#3b82f6' },
      { label: 'Sprint 2', value: 48, color: '#6366f1' },
      { label: 'Sprint 3', value: 52, color: '#8b5cf6' },
      { label: 'Sprint 4', value: 58, color: '#10b981' }
    ]
  },
  {
    id: 'mgr_team_leave_calendar',
    title: 'Team Leave Calendar',
    description: 'Team time-off schedule, planned vacations, and coverage distribution',
    category: 'team',
    type: 'chart',
    chartType: 'donut',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 56,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Active on Duty', value: 13, color: '#10b981' },
      { label: 'Planned PTO', value: 1, color: '#3b82f6' }
    ]
  },
  {
    id: 'mgr_team_members',
    title: 'Team Members',
    description: 'Roster of reporting team members, roles, contact info, and status',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 57,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'mgr_pending_leave_requests',
    title: 'Pending Leave Requests',
    description: 'Team vacation and leave applications awaiting manager sign-off',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 58,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'mgr_pending_timesheets',
    title: 'Pending Timesheets',
    description: 'Weekly work hour logs and project timesheets awaiting approval',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 59,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'mgr_performance_reviews_due',
    title: 'Performance Reviews Due',
    description: 'Direct report performance appraisals and milestone evaluations',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 60,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'mgr_upcoming_birthdays',
    title: 'Upcoming Birthdays',
    description: 'Team members celebrating birthdays in the upcoming 30 days',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 61,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'mgr_upcoming_anniversaries',
    title: 'Upcoming Anniversaries',
    description: 'Work anniversaries and milestone achievements within your team',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 62,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'mgr_team_action_items',
    title: 'Team Action Items',
    description: 'Action items for sprint deliverables, 1-on-1s, and project milestones',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['MANAGER'],
    order: 63,
    colSpan: 6,
    heightPreset: 'normal'
  },

  // ================= 4. EMPLOYEE PERSONA DASHLETS (64 - 82) ================= //
  {
    id: 'emp_attendance',
    title: 'Attendance',
    description: 'Personal monthly check-in rate and punctuality record',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 64,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '98.5%', subtitle: '21 / 21 days recorded', badge: 'Perfect Record', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'emp_leave_balance',
    title: 'Leave Balance',
    description: 'Available accrued paid time off, sick leave, and casual leave balance',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 65,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '16.5 Days', subtitle: 'CL: 6.5 | EL: 8 | SL: 2', badge: 'Available', badgePositive: true, icon: 'Calendar' }
  },
  {
    id: 'emp_goal_progress',
    title: 'Goal Progress',
    description: 'Personal OKR target completion percentage for current quarter',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 66,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '85%', subtitle: '4 of 5 OKRs achieved', badge: 'Ahead of Pace', badgePositive: true, icon: 'Award' }
  },
  {
    id: 'emp_performance_score',
    title: 'Performance Score',
    description: 'Overall quarterly appraisal score and feedback index',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 67,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '4.8 / 5.0', subtitle: 'Top Tier Rating', badge: 'Excellent', badgePositive: true, icon: 'Sparkles' }
  },
  {
    id: 'emp_working_hours',
    title: 'Working Hours',
    description: 'Total logged productive hours recorded in current pay period',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 68,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '168.5 Hrs', subtitle: 'Average 8.4h / day', badge: 'On target', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'emp_pending_tasks',
    title: 'Pending Tasks',
    description: 'Open onboarding, compliance, and sprint action items assigned',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 69,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '2 Tasks', subtitle: 'Security training & timesheet', badge: 'Due in 3 days', badgePositive: false, icon: 'CheckCircle2' }
  },
  {
    id: 'emp_todays_attendance',
    title: "Today's Attendance",
    description: 'Real-time punch-in status, break tracker, and daily logged hours',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 70,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_my_leave_balance',
    title: 'My Leave Balance',
    description: 'Detailed breakdown of annual leave entitlements, used days, and carryover',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 71,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_my_goals',
    title: 'My Goals',
    description: 'Personal quarterly goals, key results (KR), and milestone milestones',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 72,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_my_tasks',
    title: 'My Tasks',
    description: 'Assigned checklist tasks, Day-1 readiness steps, and project deliverables',
    category: 'onboarding',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 73,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_my_performance',
    title: 'My Performance',
    description: 'Manager feedback, quarterly rating history, and appraisal highlights',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 74,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_my_payslips',
    title: 'My Payslips',
    description: 'Salary statements, tax computation sheets, and monthly pay records',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 75,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_my_documents',
    title: 'My Documents',
    description: 'Uploaded government IDs, signed employment contract, and compliance certifications',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 76,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_my_training',
    title: 'My Training',
    description: 'Enrolled learning pathways, mandatory compliance modules, and certifications',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 77,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_upcoming_holidays',
    title: 'Upcoming Holidays',
    description: 'Official corporate holidays and statutory public leave calendar',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 78,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_upcoming_events',
    title: 'Upcoming Events',
    description: 'Company all-hands, department hackathons, and team building events',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 79,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_upcoming_birthday',
    title: 'Upcoming Birthday',
    description: 'Personal birthday celebration perks, anniversary notes, and greetings',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 80,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_work_anniversary',
    title: 'Work Anniversary',
    description: 'Tenure badge, service recognition, and milestone rewards',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 81,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'emp_pending_actions',
    title: 'Pending Actions',
    description: 'Mandatory items requiring action: document uploads, survey responses, and feedback',
    category: 'compliance',
    type: 'list',
    enabled: true,
    assignedRoles: ['EMPLOYEE'],
    order: 82,
    colSpan: 6,
    heightPreset: 'normal'
  },

  // ================= 5. KPI DASHBOARD PERSONA DASHLETS (83 - 101) ================= //
  {
    id: 'kpi_overall_kpi_score',
    title: 'Overall KPI Score',
    description: 'Aggregate performance index calculated across milestones, pace, and quality',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 83,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '94 / 100', subtitle: 'Outstanding Execution', badge: 'Top 5%', badgePositive: true, icon: 'Award' }
  },
  {
    id: 'kpi_goal_achievement',
    title: 'Goal Achievement',
    description: 'Target milestone delivery rate across all assigned business objectives',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 84,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '92.4%', subtitle: '18 of 20 Goals Met', badge: '+7% vs Benchmark', badgePositive: true, icon: 'Sparkles' }
  },
  {
    id: 'kpi_attendance_rate',
    title: 'Attendance Rate',
    description: 'Punctuality and attendance reliability metric over the last 90 days',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 85,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '99.1%', subtitle: 'Consistent Presence', badge: 'Leaderboard Tier 1', badgePositive: true, icon: 'Clock' }
  },
  {
    id: 'kpi_performance_rating',
    title: 'Performance Rating',
    description: 'Executive appraisal rating given by department leaders and peers',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 86,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '4.9 / 5.0', subtitle: 'Exceeds Expectations', badge: '5-Star Rating', badgePositive: true, icon: 'Award' }
  },
  {
    id: 'kpi_task_completion',
    title: 'Task Completion',
    description: 'Ratio of sprint deliverables and tickets closed on time before SLA',
    category: 'onboarding',
    type: 'metric',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 87,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '96.2%', subtitle: '124 / 129 items on SLA', badge: 'Zero overdue', badgePositive: true, icon: 'CheckCircle2' }
  },
  {
    id: 'kpi_training_completion',
    title: 'Training Completion',
    description: 'Mandatory compliance, security certifications, and skills courses finished',
    category: 'team',
    type: 'metric',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 88,
    colSpan: 3,
    heightPreset: 'compact',
    customData: { value: '100%', subtitle: 'All 6 courses verified', badge: 'Certified', badgePositive: true, icon: 'Award' }
  },
  {
    id: 'kpi_kpi_overview',
    title: 'KPI Overview',
    description: 'Radar and gauge metric evaluating composite competency and SLA adherence',
    category: 'team',
    type: 'chart',
    chartType: 'radial_gauge',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 89,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Composite KPI Score', value: 94, color: '#10b981', sublabel: 'Benchmark: 85%' }
    ]
  },
  {
    id: 'kpi_goal_progress',
    title: 'Goal Progress',
    description: 'Quarterly strategic milestone trajectory and progress towards key results',
    category: 'team',
    type: 'chart',
    chartType: 'radial_gauge',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 90,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Strategic Goals', value: 92, color: '#3b82f6', sublabel: 'Target: 90%' }
    ]
  },
  {
    id: 'kpi_performance_history',
    title: 'Performance History',
    description: 'Quarter-on-quarter performance and appraisal score evolution trend',
    category: 'team',
    type: 'chart',
    chartType: 'line',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 91,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Q1', value: 84, color: '#3b82f6' },
      { label: 'Q2', value: 89, color: '#3b82f6' },
      { label: 'Q3', value: 91, color: '#3b82f6' },
      { label: 'Q4', value: 95, color: '#10b981' }
    ]
  },
  {
    id: 'kpi_attendance_trend',
    title: 'Attendance Trend',
    description: 'Monthly punctuality index and shift adherence curve',
    category: 'onboarding',
    type: 'chart',
    chartType: 'area',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 92,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Month 1', value: 96, color: '#3b82f6' },
      { label: 'Month 2', value: 98, color: '#3b82f6' },
      { label: 'Month 3', value: 99, color: '#10b981' },
      { label: 'Month 4', value: 100, color: '#10b981' }
    ]
  },
  {
    id: 'kpi_leave_utilization',
    title: 'Leave Utilization',
    description: 'Proportion of planned vacation taken vs optimal work-life balance target',
    category: 'onboarding',
    type: 'chart',
    chartType: 'donut',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 93,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Utilized Leave', value: 65, color: '#3b82f6' },
      { label: 'Available Balance', value: 35, color: '#10b981' }
    ]
  },
  {
    id: 'kpi_task_performance',
    title: 'Task Performance',
    description: 'Weekly delivery velocity and sprint task throughput',
    category: 'onboarding',
    type: 'chart',
    chartType: 'bar',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 94,
    colSpan: 6,
    heightPreset: 'normal',
    chartData: [
      { label: 'Week 1', value: 24, color: '#3b82f6' },
      { label: 'Week 2', value: 32, color: '#3b82f6' },
      { label: 'Week 3', value: 28, color: '#3b82f6' },
      { label: 'Week 4', value: 36, color: '#10b981' }
    ]
  },
  {
    id: 'kpi_training_certifications',
    title: 'Training & Certifications',
    description: 'Completed corporate certifications, badges, and skill accreditations',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 95,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'kpi_competency_assessment',
    title: 'Competency Assessment',
    description: 'Core leadership, technical, and domain skill assessment rubric',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 96,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'kpi_manager_feedback',
    title: 'Manager Feedback',
    description: 'Periodic manager observations, strengths highlights, and kudos notes',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 97,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'kpi_review_history',
    title: 'Review History',
    description: 'Chronological timeline of annual, mid-year, and 360 review records',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 98,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'kpi_recognition_achievements',
    title: 'Recognition & Achievements',
    description: 'Peer spot awards, employee of the month accolades, and bonus recognitions',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 99,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'kpi_improvement_areas',
    title: 'Improvement Areas',
    description: 'Identified growth competencies, stretch opportunities, and mentoring targets',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 100,
    colSpan: 6,
    heightPreset: 'normal'
  },
  {
    id: 'kpi_development_plan',
    title: 'Development Plan',
    description: 'Annual career progression roadmap, skill targets, and mentorship steps',
    category: 'team',
    type: 'list',
    enabled: true,
    assignedRoles: ['KPI_DASHBOARD'],
    order: 101,
    colSpan: 6,
    heightPreset: 'normal'
  }
];

const MASTER_STORAGE_KEY = 'quantira_master_dashlets_catalog_v2';
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

