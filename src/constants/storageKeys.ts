/**
 * Centralized dictionary of all LocalStorage keys used throughout the application.
 * Adheres to Enterprise Software Refactoring & Architecture Standard (Centralized Constants).
 */
export const STORAGE_KEYS = {
  // Theme & Preferences
  THEME: 'quantira_theme',
  ACTIVE_ROLE: 'quantira_active_role',

  // Onboarding Core
  CANDIDATES: 'quantira_onboarding_candidates',
  TASKS: 'quantira_onboarding_tasks',
  FLOW: 'onboarding_mvp_flow_data',
  ACTIVE_ONBOARDING_ID: 'quantira_active_onboarding_id',
  FLOW_BY_ID: (id: string) => `onboarding_flow_${id}`,

  // Employee Profile & Credentials
  EMPLOYEE_PROFILE_FORM: (id: string) => `employee_profile_form_${id}`,
  EMPLOYEE_DOCS: (id: string) => `employee_docs_${id}`,
  EMPLOYEE_AVATAR: (id: string) => `employee_avatar_${id}`,
  EMPLOYEE_DIGITAL_SIG: 'employee_digital_sig',
  EMPLOYEE_EMERGENCY_CONTACTS: 'employee_emergency_contacts',
  EMPLOYEE_CUSTOM_VALUES: 'quantira_employee_custom_values',

  // Corporate Governance & Admin Configurations
  CUSTOM_PROFILE_FIELDS: 'quantira_custom_profile_fields',
  STEP_CONFIGS: 'quantira_step_configs',
  COMPLIANCE_DOCS: 'quantira_compliance_docs',
  SSO_CONFIGS: 'quantira_sso_configs',
  AUDIT_LOGS: 'quantira_audit_logs',

  // Corporate Documents Management (SuperAdmin / HR)
  CORPORATE_DOCUMENTS: 'quantira_corporate_documents_v2',
  CORP_DOCS_DELETED_LOG: 'quantira_corp_docs_deleted_log',

  // Assets Management
  ENTERPRISE_ASSETS: 'quantira_enterprise_assets',

  // Attendance & Time Tracking
  PUNCH_RECORDS: 'quantira_punch_records',
  ATTENDANCE_STATE: 'quantira_attendance_state'
} as const;
