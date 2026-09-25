import React, { useState, useEffect, useMemo } from 'react';
import {
  BranchRecord,
  getBranches,
  saveBranches,
  DEFAULT_BRANCHES
} from '../../services/organizationSetupService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Building,
  Plus,
  Search,
  MapPin,
  Users,
  Clock,
  Phone,
  Mail,
  Edit,
  Trash2,
  Globe,
  CheckCircle2,
  AlertCircle,
  Filter,
  Download,
  RotateCcw
} from 'lucide-react';

export const BranchesView: React.FC = () => {
  const { success, info } = useToast();
  const [branches, setBranches] = useState<BranchRecord[]>(() => getBranches());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Under Setup'>('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BranchRecord>>({
    code: '',
    name: '',
    type: 'Regional Office',
    branchHead: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    postalCode: '',
    timezone: 'PST (UTC-8)',
    capacity: 100,
    staffCount: 0,
    status: 'Active',
    establishedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const handleUpdate = () => setBranches(getBranches());
    window.addEventListener('quantira_branches_updated', handleUpdate);
    return () => window.removeEventListener('quantira_branches_updated', handleUpdate);
  }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q) ||
        b.branchHead.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [branches, searchQuery, statusFilter]);

  const totalCapacity = useMemo(() => branches.reduce((acc, b) => acc + (b.capacity || 0), 0), [branches]);
  const totalStaff = useMemo(() => branches.reduce((acc, b) => acc + (b.staffCount || 0), 0), [branches]);

  const handleOpenAdd = () => {
    const nextNum = branches.length + 1;
    setFormData({
      code: `BR-SITE-0${nextNum}`,
      name: '',
      type: 'Regional Office',
      branchHead: '',
      email: '',
      phone: '+1 (555) 000-0000',
      address: '',
      city: '',
      state: '',
      country: 'United States',
      postalCode: '',
      timezone: 'PST (UTC-8)',
      capacity: 100,
      staffCount: 0,
      status: 'Active',
      establishedDate: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (branch: BranchRecord) => {
    setEditingBranch(branch);
    setFormData({ ...branch });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.code?.trim()) return;

    if (editingBranch) {
      const updated = branches.map((b) =>
        b.id === editingBranch.id ? ({ ...b, ...formData } as BranchRecord) : b
      );
      setBranches(updated);
      saveBranches(updated);
      setEditingBranch(null);
      success('Branch Updated', `"${formData.name}" has been successfully updated.`);
    } else {
      const newBranch: BranchRecord = {
        ...(formData as BranchRecord),
        id: `br-${Date.now()}`
      };
      const updated = [...branches, newBranch];
      setBranches(updated);
      saveBranches(updated);
      setShowAddModal(false);
      success('Branch Created', `"${newBranch.name}" has been registered.`);
    }
  };

  const handleDelete = () => {
    if (!deletingBranch) return;
    const updated = branches.filter((b) => b.id !== deletingBranch.id);
    setBranches(updated);
    saveBranches(updated);
    setDeletingBranch(null);
    info('Branch Deleted', 'Branch office removed from ERP network.');
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Branches</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">{branches.length}</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {branches.filter((b) => b.status === 'Active').length} Active Sites
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Staff Headcount</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">{totalStaff}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all facilities</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Seating Capacity</span>
            <MapPin className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">{totalCapacity}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {Math.round((totalStaff / Math.max(1, totalCapacity)) * 100)}% Occupancy Rate
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Global Regions</span>
            <Globe className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">
            {new Set(branches.map((b) => b.country)).size} Countries
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Multi-National Entity</span>
        </div>
      </div>

      {/* Header Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search branches by name, city, country, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Setup">Under Setup</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 px-4"
        >
          Add New Branch
        </Button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBranches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {branch.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        branch.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : branch.status === 'Under Setup'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                    {branch.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 block">{branch.type}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(branch)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Branch"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingBranch(branch)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete Branch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{branch.address}, {branch.city}, {branch.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Head: <strong>{branch.branchHead || 'Unassigned'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{branch.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{branch.timezone}</span>
                </div>
              </div>
            </div>

            {/* Bottom Metrics Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">
                Staff: <strong className="text-slate-900 dark:text-white font-mono">{branch.staffCount}</strong> / {branch.capacity}
              </span>
              <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (branch.staffCount / Math.max(1, branch.capacity)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Branch Modal */}
      {(showAddModal || editingBranch) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAddModal(false);
            setEditingBranch(null);
          }}
          title={editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add New Branch Office'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Austin Tech Lab"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Branch Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BR-ATX-02"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Facility Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Headquarters">Headquarters</option>
                  <option value="Regional Office">Regional Office</option>
                  <option value="Tech Center">Tech Center</option>
                  <option value="Sales Hub">Sales Hub</option>
                  <option value="Support Center">Support Center</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Branch Head / Director
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Chen"
                  value={formData.branchHead || ''}
                  onChange={(e) => setFormData({ ...formData, branchHead: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="100 Congress Avenue, Floor 12"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Austin"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="United States"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity ?? 100}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Operational Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Under Setup">Under Setup</option>
                  <option value="Inactive">Inactive</option>
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
                  setEditingBranch(null);
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
                {editingBranch ? 'Save Branch Changes' : 'Create Branch'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingBranch && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Branch Facility?"
          message={`Are you sure you want to delete "${deletingBranch.name}" (${deletingBranch.code})? Staff assigned to this branch may need reassignment.`}
          confirmLabel="Delete Branch"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeletingBranch(null)}
        />
      )}
    </div>
  );
};
