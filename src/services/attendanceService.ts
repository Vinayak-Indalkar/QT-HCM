export interface PunchRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'in' | 'out';
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  location: string;
  device?: string;
}

export interface EmployeeAttendanceState {
  employeeId: string;
  employeeName: string;
  isClockedIn: boolean;
  clockInTime: string | null;
  todaySeconds: number;
  lastPunch: PunchRecord | null;
}

const STORAGE_KEY_RECORDS = 'hr_punch_attendance_records_v1';
const STORAGE_KEY_STATE = 'hr_employee_attendance_state_v1';

// Seed initial records for realism if none exist
const INITIAL_PUNCH_RECORDS: PunchRecord[] = [
  {
    id: 'punch-101',
    employeeId: 'EMP-2024-0847',
    employeeName: 'John Doe',
    type: 'in',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    timeFormatted: '09:00 AM',
    dateFormatted: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
    location: 'San Francisco HQ - Kiosk #02',
    device: 'MacBook Pro (Chrome)'
  },
  {
    id: 'punch-102',
    employeeId: 'EMP-2024-0847',
    employeeName: 'John Doe',
    type: 'out',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeFormatted: '12:30 PM',
    dateFormatted: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
    location: 'San Francisco HQ - Kiosk #02',
    device: 'MacBook Pro (Chrome)'
  }
];

export const getStoredPunchRecords = (): PunchRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_PUNCH_RECORDS));
      return INITIAL_PUNCH_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PUNCH_RECORDS;
  }
};

export const getStoredAttendanceState = (employeeId: string, employeeName = 'John Doe'): EmployeeAttendanceState => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_STATE}_${employeeId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  const records = getStoredPunchRecords().filter(r => r.employeeId === employeeId);
  const lastPunch = records.length > 0 ? records[records.length - 1] : null;
  const isClockedIn = lastPunch ? lastPunch.type === 'in' : false;

  const defaultState: EmployeeAttendanceState = {
    employeeId,
    employeeName,
    isClockedIn,
    clockInTime: isClockedIn && lastPunch ? lastPunch.timestamp : null,
    todaySeconds: 3.5 * 3600, // 3.5 hours default logged earlier
    lastPunch
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_STATE}_${employeeId}`, JSON.stringify(defaultState));
  } catch {}

  return defaultState;
};

export const punchIn = (employeeId: string, employeeName: string, location = 'San Francisco HQ'): EmployeeAttendanceState => {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const newRecord: PunchRecord = {
    id: `punch-${Date.now()}`,
    employeeId,
    employeeName,
    type: 'in',
    timestamp: now.toISOString(),
    timeFormatted,
    dateFormatted,
    location,
    device: navigator.userAgent.includes('Mac') ? 'MacBook Pro (Chrome)' : 'Workstation (Web)'
  };

  const records = getStoredPunchRecords();
  records.push(newRecord);
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch {}

  const currentState = getStoredAttendanceState(employeeId, employeeName);
  const newState: EmployeeAttendanceState = {
    ...currentState,
    isClockedIn: true,
    clockInTime: now.toISOString(),
    lastPunch: newRecord
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_STATE}_${employeeId}`, JSON.stringify(newState));
  } catch {}

  window.dispatchEvent(new CustomEvent('hr-attendance-updated', { detail: { employeeId, record: newRecord } }));
  return newState;
};

export const punchOut = (employeeId: string, employeeName: string, location = 'San Francisco HQ'): EmployeeAttendanceState => {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const newRecord: PunchRecord = {
    id: `punch-${Date.now()}`,
    employeeId,
    employeeName,
    type: 'out',
    timestamp: now.toISOString(),
    timeFormatted,
    dateFormatted,
    location,
    device: navigator.userAgent.includes('Mac') ? 'MacBook Pro (Chrome)' : 'Workstation (Web)'
  };

  const records = getStoredPunchRecords();
  records.push(newRecord);
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch {}

  const currentState = getStoredAttendanceState(employeeId, employeeName);
  let additionalSeconds = 0;
  if (currentState.clockInTime) {
    const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(currentState.clockInTime).getTime()) / 1000));
    additionalSeconds = elapsed;
  }

  const newState: EmployeeAttendanceState = {
    ...currentState,
    isClockedIn: false,
    clockInTime: null,
    todaySeconds: currentState.todaySeconds + additionalSeconds,
    lastPunch: newRecord
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_STATE}_${employeeId}`, JSON.stringify(newState));
  } catch {}

  window.dispatchEvent(new CustomEvent('hr-attendance-updated', { detail: { employeeId, record: newRecord } }));
  return newState;
};
