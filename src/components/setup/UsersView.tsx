import React, { useState, useEffect, useMemo } from 'react';
import {
  ERPUserRecord,
  getERPUsers,
  saveERPUsers,
  getBranches,
  getDepartments,
  DEFAULT_ERP_USERS
} from '../../services/organizationSetupService';
import { Button } from '../atoms';
import { Modal } from '../organisms';
import { ConfirmDialog } from '../organisms';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  KeyRound,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RotateCcw,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { success, info } = useToast();
  const [users, setUsers] = useState<ERPUserRecord[]>(() => getERPUsers());
  const [branches] = useState(() => getBranches());
  const [departments] = useState(() => getDepartments());

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ERPUserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<ERPUserRecord | null>(null);

  // Form
  const [formData, setFormData] = useState<Partial<ERPUserRecord>>({
    userCode: '',
    name: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    roleLabel: 'Team Member',
    department: 'Engineering & Technology',
    branch: 'San Francisco Global Headquarters',
    designation: 'Software Engineer II',
    ssoEnabled: true,
    status: 'Active'
  });

  useEffect(() => {
    const handleUpdate = () => setUsers(getERPUsers());
    window.addEventListener('quantira_erp_users_updated', handleUpdate);
    return () => window.removeEventListener('quantira_erp_users_updated', handleUpdate);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userCode.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.branch.toLowerCase().includes(q);
      return matchRole && matchStatus && matchSearch;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    const nextNum = users.length + 1;
    setFormData({
      userCode: `USR-EMP-0${nextNum}`,
      name: '',
      email: '',
      phone: '+1 (555) 000-0000',
      role: 'EMPLOYEE',
      roleLabel: 'Team Member',
      department: departments[0]?.name || 'Engineering & Technology',
      branch: branches[0]?.name || 'San Francisco Global Headquarters',
      designation: 'Software Engineer II',
      ssoEnabled: true,
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: ERPUserRecord) => {
    setEditingUser(user);
    setFormData({ ...user });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) return;

    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrator',
      HR: 'HR Enterprise Lead',
      MANAGER: 'Engineering Manager',
      EMPLOYEE: 'Team Member',
      PAYROLL_ADMIN: 'Payroll & Benefits Administrator',
      AUDITOR: 'Statutory Compliance Auditor'
    };

    const finalRoleLabel = roleMap[formData.role || 'EMPLOYEE'] || 'Team Member';

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? ({
              ...u,
              ...formData,
              roleLabel: finalRoleLabel
            } as ERPUserRecord)
          : u
      );
      setUsers(updated);
      saveERPUsers(updated);
      setEditingUser(null);
      success('User Updated', `"${formData.name}" account details updated.`);
    } else {
      const newUser: ERPUserRecord = {
        ...(formData as ERPUserRecord),
        id: `usr-${Date.now()}`,
        roleLabel: finalRoleLabel,
        lastLogin: 'Never logged in',
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = [...users, newUser];
      setUsers(updated);
      saveERPUsers(updated);
      setShowAddModal(false);
      success('User Account Provisioned', `"${newUser.name}" account created with ${finalRoleLabel} privileges.`);
    }
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    const updated = users.filter((u) => u.id !== deletingUser.id);
    setUsers(updated);
    saveERPUsers(updated);
    setDeletingUser(null);
    info('User Deactivated', 'ERP user account revoked.');
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total System Accounts</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">{users.length}</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {users.filter((u) => u.status === 'Active').length} Active
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Admin &amp; HR Privileged</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">
            {users.filter((u) => ['SUPER_ADMIN', 'HR'].includes(u.role)).length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">High privilege security</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Corporate SSO Active</span>
            <KeyRound className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">
            {users.filter((u) => u.ssoEnabled).length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">SAML 2.0 / Okta / Azure AD</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Multi-Branch Deployment</span>
            <Building className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">
            {new Set(users.map((u) => u.branch)).size} Branches
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Assigned across sites</span>
        </div>
      </div>

      {/* Header Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, role, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="SUPER_ADMIN">Super Administrator</option>
            <option value="HR">HR Enterprise Lead</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="PAYROLL_ADMIN">Payroll Admin</option>
            <option value="AUDITOR">Auditor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Invite">Pending Invite</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 px-4"
        >
          Provision User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">User &amp; Code</th>
                <th className="px-4 py-3">Role &amp; Privilege</th>
                <th className="px-4 py-3">Department &amp; Designation</th>
                <th className="px-4 py-3">Branch Office</th>
                <th className="px-4 py-3">SSO Status</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="font-mono">{u.userCode}</span>
                          <span>•</span>
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : u.role === 'HR'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : u.role === 'MANAGER'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.roleLabel}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{u.department}</span>
                    <span className="text-[11px] text-slate-400">{u.designation}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="text-slate-700 dark:text-slate-300 block">{u.branch}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    {u.ssoEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enabled
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Standard Password</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : u.status === 'Pending Invite'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Deactivate User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(showAddModal || editingUser) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAddModal(false);
            setEditingUser(null);
          }}
          title={editingUser ? `Edit User: ${editingUser.name}` : 'Provision New System User Account'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Miller"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@quantiratechnologies.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  User Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="USR-EMP-007"
                  value={formData.userCode || ''}
                  onChange={(e) => setFormData({ ...formData, userCode: e.target.value })}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ERP Role Tier <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer font-bold"
                >
                  <option value="SUPER_ADMIN">Super Administrator (Full Access)</option>
                  <option value="HR">HR Enterprise Lead</option>
                  <option value="MANAGER">Hiring &amp; Line Manager</option>
                  <option value="EMPLOYEE">Standard Employee</option>
                  <option value="PAYROLL_ADMIN">Payroll &amp; Benefits Officer</option>
                  <option value="AUDITOR">Statutory Compliance Auditor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Branch Office
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Job Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={formData.designation || ''}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Pending Invite">Pending Invite</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 shadow-md shadow-blue-600/25"
              >
                {editingUser ? 'Save User Changes' : 'Provision User'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Revoke Confirmation */}
      {deletingUser && (
        <ConfirmDialog
          isOpen={true}
          title="Deactivate System User?"
          message={`Are you sure you want to deactivate account "${deletingUser.name}" (${deletingUser.email})? The user will immediately lose access to the ERP portal.`}
          confirmLabel="Deactivate Account"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};
