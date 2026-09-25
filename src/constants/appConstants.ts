import { UserRole } from '../types/auth';

/**
 * Enterprise Application Configuration Constants
 * Adheres to Enterprise Software Refactoring & Architecture Standard (Centralized Constants).
 */

export const APP_METADATA = {
  NAME: 'Quantira HR Portal & Onboarding',
  ORGANIZATION: 'Quantira Technologies',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@quantira.com',
  DEFAULT_TIMEZONE: 'America/Los_Angeles'
} as const;

export const ROLES: Record<UserRole, { label: string; description: string }> = {
  EMPLOYEE: {
    label: 'Employee / New Hire',
    description: 'Onboarding wizard, personal profile, tasks, assigned assets and attendance.'
  },
  MANAGER: {
    label: 'Team Manager',
    description: 'Team directory, employee dossiers, live attendance, and asset oversight.'
  },
  HR: {
    label: 'HR Specialist',
    description: 'Onboarding pipeline, candidate dossiers, compliance verification, and corporate documents.'
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full governance, employee provisioning, onboarding workflow steps, SSO and compliance policies.'
  }
};

export const ALLOWED_DOCUMENT_FORMATS = ['application/pdf', 'image/png', 'image/jpeg'] as const;
export const MAX_DOCUMENT_FILE_SIZE_MB = 10;

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const;
