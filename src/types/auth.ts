export type UserRole = 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export type Permission =
  | 'system:manage'
  | 'system:settings'
  | 'employee:view_all'
  | 'employee:edit_all'
  | 'employee:delete'
  | 'employee:approve'
  | 'team:view'
  | 'team:manage'
  | 'onboarding:complete_own'
  | 'onboarding:view_sensitive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatar: string;
}

export interface RoleConfig {
  role: UserRole;
  title: string;
  description: string;
  iconName: string;
  permissions: Permission[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Admin',
    description: 'System configuration, user roles, permission policies, and enterprise settings',
    iconName: 'Shield',
    permissions: [
      'system:manage',
      'system:settings',
      'employee:view_all',
      'employee:edit_all',
      'employee:delete',
      'employee:approve',
      'team:view',
      'team:manage',
      'onboarding:complete_own',
      'onboarding:view_sensitive'
    ]
  },
  HR: {
    role: 'HR',
    title: 'HR Administrator',
    description: 'Manage people, review compliance documents, track onboarding pipeline, and verify employee onboarding',
    iconName: 'Users',
    permissions: [
      'employee:view_all',
      'employee:edit_all',
      'employee:approve',
      'team:view',
      'onboarding:complete_own',
      'onboarding:view_sensitive'
    ]
  },
  MANAGER: {
    role: 'MANAGER',
    title: 'Manager',
    description: 'Manage direct team members, track employee start dates, and oversee team orientation',
    iconName: 'UserCheck',
    permissions: [
      'team:view',
      'team:manage'
    ]
  },
  EMPLOYEE: {
    role: 'EMPLOYEE',
    title: 'Employee',
    description: 'Complete onboarding workflow, upload documents, sign NDA, and view employee profile',
    iconName: 'GraduationCap',
    permissions: [
      'onboarding:complete_own'
    ]
  }
};
