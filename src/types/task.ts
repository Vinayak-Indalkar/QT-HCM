export type TaskCategory = 'hr' | 'it' | 'operations' | 'compliance' | 'manager';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface OnboardingTask {
  id: string;
  candidateId?: string;
  candidateName?: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  dueDate: string;
  completedAt?: string;
  dependencies?: string[];
}
