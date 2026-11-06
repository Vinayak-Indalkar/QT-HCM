export type ThemeMode = 'light' | 'dark';

export type UserRole = 'hr_admin' | 'manager' | 'hiring_manager' | 'it_specialist' | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatar: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type SortDirection = 'asc' | 'desc' | 'none';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (item: T) => any;
  sortable?: boolean;
  hideable?: boolean;
  defaultVisible?: boolean;
  minWidth?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cell?: (item: T) => React.ReactNode;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface ActiveFilter {
  id: string;
  field: string;
  label: string;
  value: string | string[];
  displayValue: string;
}
