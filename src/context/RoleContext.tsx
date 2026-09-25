import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, Permission, User, ROLE_CONFIGS } from '../types/auth';
import { RADIAN_PERSONA_AVATARS } from '../utils/radianAvatars';

export interface RoleContextType {
  currentRole: UserRole;
  currentUser: User;
  isAuthenticated: boolean;
  login: (role?: UserRole, credentials?: { email: string; password?: string }) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  canView: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  availableRoles: typeof ROLE_CONFIGS;
}

export const DEMO_USERS: Record<UserRole, User> = {
  SUPER_ADMIN: {
    id: 'usr-super-admin',
    name: 'Alexandra Wright',
    email: 'admin@quantira.com',
    role: 'SUPER_ADMIN',
    roleTitle: 'Principal Enterprise Administrator',
    department: 'Executive Operations',
    avatar: RADIAN_PERSONA_AVATARS.alexandraWright
  },
  HR: {
    id: 'usr-hr-lead',
    name: 'Eleanor Vance',
    email: 'hr@quantira.com',
    role: 'HR',
    roleTitle: 'Head of People Operations',
    department: 'Human Resources',
    avatar: RADIAN_PERSONA_AVATARS.eleanorVance
  },
  MANAGER: {
    id: 'usr-manager',
    name: 'Marcus Brody',
    email: 'manager@quantira.com',
    role: 'MANAGER',
    roleTitle: 'VP of Engineering',
    department: 'Engineering',
    avatar: RADIAN_PERSONA_AVATARS.marcusBrody
  },
  EMPLOYEE: {
    id: 'usr-emp-john-doe',
    name: 'John Doe',
    email: 'john.doe@quantira.com',
    role: 'EMPLOYEE',
    roleTitle: 'Software Engineer',
    department: 'Engineering',
    avatar: RADIAN_PERSONA_AVATARS.johnDoe
  }
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const STORAGE_KEY_ROLE = 'onboarding_mvp_role';
const STORAGE_KEY_AUTH = 'onboarding_mvp_auth';

export const DemoRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AUTH);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;
      if (saved && ROLE_CONFIGS[saved]) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'HR'; // Default role after login
  });

  const currentUser = DEMO_USERS[currentRole];

  const setRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    (role?: UserRole, credentials?: { email: string; password?: string }) => {
      let targetRole: UserRole = role || 'HR';

      if (!role && credentials?.email) {
        const lower = credentials.email.toLowerCase();
        if (lower.includes('admin')) targetRole = 'SUPER_ADMIN';
        else if (lower.includes('hr')) targetRole = 'HR';
        else if (lower.includes('manager')) targetRole = 'MANAGER';
        else if (lower.includes('john') || lower.includes('emp')) targetRole = 'EMPLOYEE';
        else targetRole = 'HR';
      }

      setRole(targetRole);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } catch {
        // ignore
      }
    },
    [setRole]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {
      // ignore
    }
  }, []);

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (Array.isArray(role)) {
        return role.includes(currentRole);
      }
      return currentRole === role;
    },
    [currentRole]
  );

  const hasPermission = useCallback(
    (permission: Permission) => {
      const config = ROLE_CONFIGS[currentRole];
      return config.permissions.includes(permission);
    },
    [currentRole]
  );

  const canView = useCallback(
    (resource: string) => {
      if (currentRole === 'SUPER_ADMIN' || currentRole === 'HR') return true;
      if (resource === 'sensitive_tax_docs') return false;
      if (resource === 'team_dashboard') return currentRole === 'MANAGER';
      if (resource === 'onboarding_flow') return true;
      return true;
    },
    [currentRole]
  );

  const canEdit = useCallback(
    (resource: string) => {
      if (currentRole === 'SUPER_ADMIN') return true;
      if (currentRole === 'HR') return resource !== 'system_settings';
      if (currentRole === 'EMPLOYEE') return resource === 'own_onboarding';
      if (currentRole === 'MANAGER') return resource === 'team_notes';
      return false;
    },
    [currentRole]
  );

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser,
        isAuthenticated,
        login,
        logout,
        setRole,
        hasRole,
        hasPermission,
        canView,
        canEdit,
        availableRoles: ROLE_CONFIGS
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a DemoRoleProvider');
  }
  return context;
};
