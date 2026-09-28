import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader, Card, CardHeader, CardContent, Button, Checkbox } from '../components';
import { formatDate } from '../utils/formatters';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Filter,
  CheckCircle2,
  Calendar,
  User
} from 'lucide-react';
import { TaskStatus } from '../types/task';

export const TasksChecklistPage: React.FC = () => {
  const { tasks, updateTaskStatus } = useOnboarding();
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'urgent' | 'high' | 'medium' | 'low'>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const urgentCount = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;

  const toggleTask = (taskId: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateTaskStatus(taskId, newStatus);
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12">
      <PageHeader
        title="Onboarding Tasks & Checklist"
        description="Operational checklist"
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Tasks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{pendingCount}</p>
          <span className="text-[11px] text-slate-400">Awaiting completion</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Urgent Priority</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{urgentCount}</p>
          <span className="text-[11px] text-rose-500">Requires prompt action</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{completedCount}</p>
          <span className="text-[11px] text-slate-400">Successfully verified</span>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter By:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-slate-800 dark:text-slate-100 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-slate-800 dark:text-slate-100 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* Tasks List */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Task Checklist ({filteredTasks.length} Items)
            </h2>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No tasks found matching the selected filter.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isDone ? 'opacity-60 bg-slate-50 dark:bg-slate-800/50/40 dark:bg-slate-900/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="pt-0.5">
                        <Checkbox
                          checked={isDone}
                          onChange={() => toggleTask(task.id, task.status)}
                          aria-label={`Mark task ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-sm font-bold text-slate-900 dark:text-white ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {task.description}
                          </span>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {task.candidateName || 'Company-Wide'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Due: {formatDate(task.dueDate)}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            Dept: {task.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : task.priority === 'high'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <Button
                        size="sm"
                        variant={isDone ? 'secondary' : 'primary'}
                        onClick={() => toggleTask(task.id, task.status)}
                      >
                        {isDone ? 'Mark Pending' : 'Mark Done'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
