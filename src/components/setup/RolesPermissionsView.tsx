import React, { useState, useEffect } from 'react';
import {
  RolePermissionMatrix,
  ModulePermission,
  getRolesPermissionsMatrix,
  saveRolesPermissionsMatrix,
  DEFAULT_ROLES_MATRIX,
  DEFAULT_MODULE_PERMISSIONS
} from '../../services/organizationSetupService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Shield,
  Plus,
  Save,
  RotateCcw,
  Check,
  X,
  Lock,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckSquare,
  Sparkles,
  Info
} from 'lucide-react';

export const RolesPermissionsView: React.FC = () => {
  const { success, info } = useToast();
  const [roles, setRoles] = useState<RolePermissionMatrix[]>(() => getRolesPermissionsMatrix());
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('SUPER_ADMIN');
  const [isSaving, setIsSaving] = useState(false);

  // New Role Modal
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  useEffect(() => {
    const handleUpdate = () => setRoles(getRolesPermissionsMatrix());
    window.addEventListener('quantira_roles_updated', handleUpdate);
    return () => window.removeEventListener('quantira_roles_updated', handleUpdate);
  }, []);

  const activeRole = roles.find((r) => r.roleKey === selectedRoleKey) || roles[0];

  const handleTogglePermission = (moduleKey: string, permKey: keyof Omit<ModulePermission, 'module' | 'moduleKey'>) => {
    if (activeRole.roleKey === 'SUPER_ADMIN') {
      info('Super Admin Protected', 'Super Administrator role maintains unrestricted access across all modules.');
      return;
    }

    const updatedRoles = roles.map((r) => {
      if (r.roleKey === activeRole.roleKey) {
        const updatedPerms = r.permissions.map((p) => {
          if (p.moduleKey === moduleKey) {
            return { ...p, [permKey]: !p[permKey] };
          }
          return p;
        });
        return { ...r, permissions: updatedPerms };
      }
      return r;
    });

    setRoles(updatedRoles);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveRolesPermissionsMatrix(roles);
      setIsSaving(false);
      success('Permissions Matrix Saved', `Access policies for "${activeRole.name}" updated and enforced.`);
    }, 200);
  };

  const handleResetDefaults = () => {
    setRoles(DEFAULT_ROLES_MATRIX);
    saveRolesPermissionsMatrix(DEFAULT_ROLES_MATRIX);
    info('Defaults Restored', 'Role permission matrices reset to standard security baselines.');
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const slug = newRoleName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_');

    const newRole: RolePermissionMatrix = {
      id: `role-${Date.now()}`,
      roleKey: slug,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Custom organizational ERP access role.',
      userCount: 0,
      isSystemRole: false,
      permissions: DEFAULT_MODULE_PERMISSIONS.map((p) => ({
        ...p,
        view: true,
        create: false,
        edit: false,
        delete: false,
        export: false,
        approve: false
      }))
    };

    const updated = [...roles, newRole];
    setRoles(updated);
    saveRolesPermissionsMatrix(updated);
    setSelectedRoleKey(newRole.roleKey);
    setShowAddRoleModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
    success('Custom Role Created', `"${newRole.name}" is now available for user assignment.`);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Role-Based Access Control (RBAC) Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure granular permissions per module for viewing, modifying, deleting, exporting, and approving records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Reset Matrix
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowAddRoleModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Create Custom Role
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleSaveAll}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 shadow-md shadow-blue-600/25"
          >
            Save Access Policies
          </Button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {roles.map((r) => {
          const isSelected = r.roleKey === selectedRoleKey;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoleKey(r.roleKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border select-none ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{r.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {r.userCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Role Details Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeRole.name}</h3>
            {activeRole.isSystemRole && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                System Core Role
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeRole.description}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Assigned Users: <strong className="font-mono text-slate-900 dark:text-white">{activeRole.userCount}</strong></span>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">ERP System Module</th>
                <th className="px-4 py-3 text-center">View / Read</th>
                <th className="px-4 py-3 text-center">Create / Add</th>
                <th className="px-4 py-3 text-center">Edit / Update</th>
                <th className="px-4 py-3 text-center">Delete / Purge</th>
                <th className="px-4 py-3 text-center">Export Data</th>
                <th className="px-4 py-3 text-center">Approve Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeRole.permissions.map((perm) => (
                <tr key={perm.moduleKey} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {perm.module}
                  </td>

                  {/* View */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(perm.moduleKey, 'view')}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        perm.view
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                      }`}
                    >
                      {perm.view ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Create */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(perm.moduleKey, 'create')}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        perm.create
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                      }`}
                    >
                      {perm.create ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Edit */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(perm.moduleKey, 'edit')}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        perm.edit
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                      }`}
                    >
                      {perm.edit ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(perm.moduleKey, 'delete')}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        perm.delete
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                      }`}
                    >
                      {perm.delete ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Export */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(perm.moduleKey, 'export')}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        perm.export
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                      }`}
                    >
                      {perm.export ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Approve */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(perm.moduleKey, 'approve')}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        perm.approve
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                      }`}
                    >
                      {perm.approve ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Role Modal */}
      {showAddRoleModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddRoleModal(false)}
          title="Create Custom Access Role"
          size="md"
        >
          <form onSubmit={handleCreateRole} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IT Asset Provisioner, Talent Lead"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Description &amp; Purpose
              </label>
              <textarea
                rows={3}
                placeholder="Describe the scope of access and responsibilities for this role..."
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddRoleModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 shadow-md shadow-blue-600/25"
              >
                Create Access Role
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
