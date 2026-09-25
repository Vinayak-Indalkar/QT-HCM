import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Candidate, OnboardingStatus, AuditLogEntry } from '../types/candidate';
import { OnboardingTask, TaskStatus } from '../types/task';
import { DocumentStatus } from '../types/document';
import { UserProfile } from '../types/common';
import { INITIAL_CANDIDATES, ALL_ONBOARDING_TASKS, CURRENT_USER } from '../services/mockData';
import { useToast } from './ToastContext';

export type NavigationPage =
  | 'dashboard'
  | 'candidates'
  | 'directory'
  | 'detail'
  | 'wizard'
  | 'profile'
  | 'tasks'
  | 'compliance'
  | 'analytics'
  | 'settings'
  | 'assets'
  | 'custom_dashboards'
  | 'setup'
  | 'setup_organization'
  | 'setup_branches'
  | 'setup_users'
  | 'setup_roles'
  | 'setup_structure'
  | 'setup_workflow';

export type ProfileTabId =
  | 'overview'
  | 'basic'
  | 'contact'
  | 'emergency'
  | 'employment'
  | 'reporting'
  | 'documents'
  | 'signature'
  | 'assets'
  | 'history'
  | 'password';

interface OnboardingContextType {
  candidates: Candidate[];
  tasks: OnboardingTask[];
  selectedCandidate: Candidate | null;
  selectedCandidateId: string | null;
  activePage: NavigationPage;
  activeProfileTab: ProfileTabId;
  setActiveProfileTab: (tab: ProfileTabId) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  navigateTo: (page: NavigationPage, candidateId?: string, profileTab?: ProfileTabId) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  bulkDeleteCandidates: (ids: string[]) => void;
  bulkUpdateStatus: (ids: string[], status: OnboardingStatus) => void;
  updateDocumentStatus: (candidateId: string, docId: string, status: DocumentStatus, reason?: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addTask: (task: OnboardingTask) => void;
  addAuditLog: (candidateId: string, action: string, details?: string, type?: AuditLogEntry['type']) => void;
  resetToMockData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY_CANDIDATES = 'quantira_onboarding_candidates';
const STORAGE_KEY_TASKS = 'quantira_onboarding_tasks';

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, info, warning } = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CANDIDATES);
      if (saved) {
        const parsed: Candidate[] = JSON.parse(saved);
        if (!parsed.some(c => c.id === 'EMP-2024-0847')) {
          parsed.unshift(INITIAL_CANDIDATES[0]);
          try {
            localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(parsed));
          } catch {}
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CANDIDATES;
  });

  const [tasks, setTasks] = useState<OnboardingTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return ALL_ONBOARDING_TASKS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabId>('overview');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Sync completion from employee flow into candidates state
  useEffect(() => {
    const handleEmployeeCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ employeeId: string; data: any }>;
      if (!customEvent.detail) return;
      const { employeeId, data } = customEvent.detail;
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === employeeId || c.id === data?.personalInfo?.employeeId) {
            return {
              ...c,
              status: 'completed',
              progress: 100,
              onboardingData: data
            };
          }
          return c;
        })
      );
    };

    window.addEventListener('quantira_employee_completed', handleEmployeeCompleted);
    return () => window.removeEventListener('quantira_employee_completed', handleEmployeeCompleted);
  }, []);

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || null;

  const navigateTo = useCallback((page: NavigationPage, candidateId?: string, profileTab?: ProfileTabId) => {
    if (candidateId) {
      setSelectedCandidateId(candidateId);
    }
    if (profileTab) {
      setActiveProfileTab(profileTab);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addAuditLog = useCallback(
    (candidateId: string, action: string, details?: string, type: AuditLogEntry['type'] = 'info') => {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const newEntry: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action,
            user: currentUser.name,
            details,
            type
          };
          return {
            ...c,
            auditLogs: [newEntry, ...(c.auditLogs || [])],
            updatedAt: new Date().toISOString()
          };
        })
      );
    },
    [currentUser.name]
  );

  const addCandidate = useCallback(
    (candidate: Candidate) => {
      setCandidates((prev) => [candidate, ...prev]);
      success('Candidate added', `${candidate.firstName} ${candidate.lastName} has been enrolled in onboarding.`);
    },
    [success]
  );

  const updateCandidate = useCallback(
    (id: string, updates: Partial<Candidate>) => {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              ...updates,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        })
      );
    },
    []
  );

  const deleteCandidate = useCallback(
    (id: string) => {
      const target = candidates.find((c) => c.id === id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      setTasks((prev) => prev.filter((t) => t.candidateId !== id));
      if (selectedCandidateId === id) {
        setSelectedCandidateId(null);
        setActivePage('directory');
      }
      warning('Candidate removed', target ? `${target.firstName} ${target.lastName} onboarding record was deleted.` : 'Record removed.');
    },
    [candidates, selectedCandidateId, warning]
  );

  const bulkDeleteCandidates = useCallback(
    (ids: string[]) => {
      setCandidates((prev) => prev.filter((c) => !ids.includes(c.id)));
      setTasks((prev) => prev.filter((t) => !t.candidateId || !ids.includes(t.candidateId)));
      if (selectedCandidateId && ids.includes(selectedCandidateId)) {
        setSelectedCandidateId(null);
        setActivePage('directory');
      }
      warning('Batch deletion completed', `Removed ${ids.length} candidate record(s).`);
    },
    [selectedCandidateId, warning]
  );

  const bulkUpdateStatus = useCallback(
    (ids: string[], status: OnboardingStatus) => {
      setCandidates((prev) =>
        prev.map((c) => {
          if (ids.includes(c.id)) {
            const auditEntry: AuditLogEntry = {
              id: `aud-${Date.now()}-${c.id}`,
              timestamp: new Date().toISOString(),
              action: `Bulk status update to ${status.replace(/_/g, ' ')}`,
              user: currentUser.name,
              type: 'info'
            };
            return {
              ...c,
              status,
              auditLogs: [auditEntry, ...(c.auditLogs || [])],
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        })
      );
      success('Status updated', `Updated ${ids.length} candidate(s) to "${status.replace(/_/g, ' ')}".`);
    },
    [currentUser.name, success]
  );

  const updateDocumentStatus = useCallback(
    (candidateId: string, docId: string, status: DocumentStatus, reason?: string) => {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const updatedDocs = c.documents.map((doc) => {
            if (doc.id !== docId) return doc;
            return {
              ...doc,
              status,
              verifiedAt: status === 'verified' ? new Date().toISOString() : undefined,
              verifiedBy: status === 'verified' ? currentUser.name : undefined,
              rejectionReason: status === 'rejected' ? reason : undefined
            };
          });

          // Recalculate progress
          const verifiedDocs = updatedDocs.filter((d) => d.status === 'verified').length;
          const totalDocs = updatedDocs.length || 1;
          const docProgress = Math.round((verifiedDocs / totalDocs) * 40); // docs account for 40% of onboarding
          const newProgress = Math.min(100, Math.max(c.progress, 30 + docProgress));

          const auditEntry: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: `Document status: ${status.toUpperCase()}`,
            user: currentUser.name,
            details: reason || undefined,
            type: status === 'verified' ? 'success' : status === 'rejected' ? 'warning' : 'info'
          };

          return {
            ...c,
            documents: updatedDocs,
            progress: newProgress,
            auditLogs: [auditEntry, ...(c.auditLogs || [])],
            updatedAt: new Date().toISOString()
          };
        })
      );

      if (status === 'verified') {
        success('Document verified', 'Document marked as verified and audit logged.');
      } else if (status === 'rejected') {
        warning('Document rejected', `Notification dispatched with reason: ${reason || 'Incomplete submission'}`);
      }
    },
    [currentUser.name, success, warning]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : undefined
            };
          }
          return t;
        })
      );
      info('Task updated', `Task status changed to ${status.replace('_', ' ')}.`);
    },
    [info]
  );

  const addTask = useCallback(
    (task: OnboardingTask) => {
      setTasks((prev) => [task, ...prev]);
      success('Task created', `Assigned to ${task.assignee.name}`);
    },
    [success]
  );

  const resetToMockData = useCallback(() => {
    setCandidates(INITIAL_CANDIDATES);
    setTasks(ALL_ONBOARDING_TASKS);
    localStorage.removeItem(STORAGE_KEY_CANDIDATES);
    localStorage.removeItem(STORAGE_KEY_TASKS);
    success('Reset completed', 'Data restored to initial demo dataset.');
  }, [success]);

  return (
    <OnboardingContext.Provider
      value={{
        candidates,
        tasks,
        selectedCandidate,
        selectedCandidateId,
        activePage,
        activeProfileTab,
        setActiveProfileTab,
        currentUser,
        setCurrentUser,
        navigateTo,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        bulkDeleteCandidates,
        bulkUpdateStatus,
        updateDocumentStatus,
        updateTaskStatus,
        addTask,
        addAuditLog,
        resetToMockData
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
