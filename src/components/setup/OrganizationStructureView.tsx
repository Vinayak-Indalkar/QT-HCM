import React, { useState, useEffect, useMemo } from 'react';
import {
  DepartmentRecord,
  DesignationRecord,
  LocationRecord,
  getDepartments,
  saveDepartments,
  getDesignations,
  saveDesignations,
  getLocations,
  saveLocations,
  DEFAULT_DEPARTMENTS,
  DEFAULT_DESIGNATIONS,
  DEFAULT_LOCATIONS
} from '../../services/organizationSetupService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Network,
  Briefcase,
  MapPin,
  Plus,
  Search,
  Users,
  Building,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowUpDown,
  Layers,
  Sparkles
} from 'lucide-react';

export interface OrganizationStructureViewProps {
  initialSubTab?: 'departments' | 'designations' | 'locations';
}

export const OrganizationStructureView: React.FC<OrganizationStructureViewProps> = ({
  initialSubTab = 'departments'
}) => {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState<'departments' | 'designations' | 'locations'>(initialSubTab);

  // Data Collections
  const [departments, setDepartments] = useState<DepartmentRecord[]>(() => getDepartments());
  const [designations, setDesignations] = useState<DesignationRecord[]>(() => getDesignations());
  const [locations, setLocations] = useState<LocationRecord[]>(() => getLocations());

  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Department
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentRecord | null>(null);
  const [deptForm, setDeptForm] = useState<Partial<DepartmentRecord>>({
    code: '',
    name: '',
    headOfDepartment: '',
    costCenter: '',
    headcount: 10,
    openPositions: 2,
    budgetAnnualUSD: 1000000,
    status: 'Active',
    description: ''
  });

  // Modals for Designation
  const [showAddDesigModal, setShowAddDesigModal] = useState(false);
  const [editingDesig, setEditingDesig] = useState<DesignationRecord | null>(null);
  const [deletingDesig, setDeletingDesig] = useState<DesignationRecord | null>(null);
  const [desigForm, setDesigForm] = useState<Partial<DesignationRecord>>({
    code: '',
    title: '',
    level: 'L3 - Senior',
    department: 'Engineering & Technology',
    minSalaryUSD: 100000,
    maxSalaryUSD: 150000,
    headcount: 5,
    status: 'Active'
  });

  // Modals for Location
  const [showAddLocModal, setShowAddLocModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationRecord | null>(null);
  const [deletingLoc, setDeletingLoc] = useState<LocationRecord | null>(null);
  const [locForm, setLocForm] = useState<Partial<LocationRecord>>({
    code: '',
    siteName: '',
    type: 'Corporate Campus',
    buildingFloor: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    postalCode: '',
    capacity: 150,
    workstations: 120,
    emergencyContact: '+1 (555) 000-0911',
    status: 'Operational'
  });

  useEffect(() => {
    const handleUpdate = () => {
      setDepartments(getDepartments());
      setDesignations(getDesignations());
      setLocations(getLocations());
    };
    window.addEventListener('quantira_departments_updated', handleUpdate);
    window.addEventListener('quantira_designations_updated', handleUpdate);
    window.addEventListener('quantira_locations_updated', handleUpdate);
    return () => {
      window.removeEventListener('quantira_departments_updated', handleUpdate);
      window.removeEventListener('quantira_designations_updated', handleUpdate);
      window.removeEventListener('quantira_locations_updated', handleUpdate);
    };
  }, []);

  // Filtered Collections
  const filteredDepartments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.headOfDepartment.toLowerCase().includes(q) ||
        d.costCenter.toLowerCase().includes(q)
    );
  }, [departments, searchQuery]);

  const filteredDesignations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return designations;
    return designations.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.level.toLowerCase().includes(q)
    );
  }, [designations, searchQuery]);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return locations;
    return locations.filter(
      (l) =>
        l.siteName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q)
    );
  }, [locations, searchQuery]);

  // -------------------------------------------------------------
  // DEPARTMENT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddDept = () => {
    const num = departments.length + 1;
    setDeptForm({
      code: `DPT-CORP-0${num}`,
      name: '',
      headOfDepartment: '',
      costCenter: `CC-DPT-90${num}`,
      headcount: 10,
      openPositions: 2,
      budgetAnnualUSD: 1200000,
      status: 'Active',
      description: ''
    });
    setShowAddDeptModal(true);
  };

  const handleOpenEditDept = (dept: DepartmentRecord) => {
    setEditingDept(dept);
    setDeptForm({ ...dept });
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name?.trim() || !deptForm.code?.trim()) return;

    if (editingDept) {
      const updated = departments.map((d) =>
        d.id === editingDept.id ? ({ ...d, ...deptForm } as DepartmentRecord) : d
      );
      setDepartments(updated);
      saveDepartments(updated);
      setEditingDept(null);
      success('Department Updated', `"${deptForm.name}" configuration updated.`);
    } else {
      const newDept: DepartmentRecord = {
        ...(deptForm as DepartmentRecord),
        id: `dept-${Date.now()}`
      };
      const updated = [...departments, newDept];
      setDepartments(updated);
      saveDepartments(updated);
      setShowAddDeptModal(false);
      success('Department Created', `"${newDept.name}" added to organization tree.`);
    }
  };

  const handleDeleteDept = () => {
    if (!deletingDept) return;
    const updated = departments.filter((d) => d.id !== deletingDept.id);
    setDepartments(updated);
    saveDepartments(updated);
    setDeletingDept(null);
    info('Department Removed', 'Department removed from organization structure.');
  };

  // -------------------------------------------------------------
  // DESIGNATION HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddDesig = () => {
    const num = designations.length + 1;
    setDesigForm({
      code: `DES-ROLE-0${num}`,
      title: '',
      level: 'L3 - Senior',
      department: departments[0]?.name || 'Engineering & Technology',
      minSalaryUSD: 110000,
      maxSalaryUSD: 160000,
      headcount: 5,
      status: 'Active'
    });
    setShowAddDesigModal(true);
  };

  const handleOpenEditDesig = (desig: DesignationRecord) => {
    setEditingDesig(desig);
    setDesigForm({ ...desig });
  };

  const handleSaveDesig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigForm.title?.trim() || !desigForm.code?.trim()) return;

    if (editingDesig) {
      const updated = designations.map((d) =>
        d.id === editingDesig.id ? ({ ...d, ...desigForm } as DesignationRecord) : d
      );
      setDesignations(updated);
      saveDesignations(updated);
      setEditingDesig(null);
      success('Designation Updated', `"${desigForm.title}" position details updated.`);
    } else {
      const newDesig: DesignationRecord = {
        ...(desigForm as DesignationRecord),
        id: `des-${Date.now()}`
      };
      const updated = [...designations, newDesig];
      setDesignations(updated);
      saveDesignations(updated);
      setShowAddDesigModal(false);
      success('Designation Created', `"${newDesig.title}" job level registered.`);
    }
  };

  const handleDeleteDesig = () => {
    if (!deletingDesig) return;
    const updated = designations.filter((d) => d.id !== deletingDesig.id);
    setDesignations(updated);
    saveDesignations(updated);
    setDeletingDesig(null);
    info('Designation Removed', 'Job designation removed from catalog.');
  };

  // -------------------------------------------------------------
  // LOCATION HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddLoc = () => {
    const num = locations.length + 1;
    setLocForm({
      code: `LOC-SITE-0${num}`,
      siteName: '',
      type: 'Corporate Campus',
      buildingFloor: 'Floor 1',
      address: '',
      city: '',
      state: '',
      country: 'United States',
      postalCode: '',
      capacity: 150,
      workstations: 120,
      emergencyContact: '+1 (555) 000-0911',
      status: 'Operational'
    });
    setShowAddLocModal(true);
  };

  const handleOpenEditLoc = (loc: LocationRecord) => {
    setEditingLoc(loc);
    setLocForm({ ...loc });
  };

  const handleSaveLoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locForm.siteName?.trim() || !locForm.code?.trim()) return;

    if (editingLoc) {
      const updated = locations.map((l) =>
        l.id === editingLoc.id ? ({ ...l, ...locForm } as LocationRecord) : l
      );
      setLocations(updated);
      saveLocations(updated);
      setEditingLoc(null);
      success('Location Updated', `"${locForm.siteName}" facility details updated.`);
    } else {
      const newLoc: LocationRecord = {
        ...(locForm as LocationRecord),
        id: `loc-${Date.now()}`
      };
      const updated = [...locations, newLoc];
      setLocations(updated);
      saveLocations(updated);
      setShowAddLocModal(false);
      success('Location Created', `"${newLoc.siteName}" campus registered.`);
    }
  };

  const handleDeleteLoc = () => {
    if (!deletingLoc) return;
    const updated = locations.filter((l) => l.id !== deletingLoc.id);
    setLocations(updated);
    saveLocations(updated);
    setDeletingLoc(null);
    info('Location Deleted', 'Location facility removed.');
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* 3 Sub-Tabs Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('departments');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'departments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('designations');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'designations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Designations ({designations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('locations');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'locations'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Locations ({locations.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'departments' && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenAddDept}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 px-4"
            >
              Add Department
            </Button>
          )}

          {activeTab === 'designations' && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenAddDesig}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 px-4"
            >
              Add Designation
            </Button>
          )}

          {activeTab === 'locations' && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenAddLoc}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 px-4"
            >
              Add Location
            </Button>
          )}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DEPARTMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Code &amp; Department Name</th>
                  <th className="px-4 py-3">Head of Department</th>
                  <th className="px-4 py-3">Cost Center</th>
                  <th className="px-4 py-3">Staff Headcount</th>
                  <th className="px-4 py-3">Annual Budget ($)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Network className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{dept.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{dept.code}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {dept.headOfDepartment || 'Unassigned'}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {dept.costCenter}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{dept.headcount}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({dept.openPositions} open)</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${(dept.budgetAnnualUSD || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dept.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {dept.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditDept(dept)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Department"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDept(dept)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete Department"
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DESIGNATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'designations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Code &amp; Designation Title</th>
                  <th className="px-4 py-3">Career Band / Level</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Standard Pay Scale (USD)</th>
                  <th className="px-4 py-3">Active Headcount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDesignations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{desig.title}</span>
                          <span className="font-mono text-[10px] text-slate-400">{desig.code}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {desig.level}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {desig.department}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ${(desig.minSalaryUSD || 0).toLocaleString()} - ${(desig.maxSalaryUSD || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {desig.headcount} Staff
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          desig.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {desig.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditDesig(desig)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Designation"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDesig(desig)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete Designation"
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LOCATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'locations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Code &amp; Site Campus</th>
                  <th className="px-4 py-3">Facility Type</th>
                  <th className="px-4 py-3">Building &amp; Floor</th>
                  <th className="px-4 py-3">City &amp; Country</th>
                  <th className="px-4 py-3">Capacity &amp; Workstations</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{loc.siteName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{loc.code}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {loc.type}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {loc.buildingFloor}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {loc.city}, {loc.country}
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <strong className="text-slate-900 dark:text-white">{loc.workstations}</strong> / {loc.capacity} Seats
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loc.status === 'Operational'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {loc.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLoc(loc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Location"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLoc(loc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete Location"
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
      )}

      {/* ========================================================================= */}
      {/* DEPARTMENT MODAL */}
      {/* ========================================================================= */}
      {(showAddDeptModal || editingDept) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAddDeptModal(false);
            setEditingDept(null);
          }}
          title={editingDept ? `Edit Department: ${editingDept.name}` : 'Add New Department'}
          size="lg"
        >
          <form onSubmit={handleSaveDept} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering & Technology"
                  value={deptForm.name || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DPT-ENG-01"
                  value={deptForm.code || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Head of Department / Director
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Brody"
                  value={deptForm.headOfDepartment || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Cost Center Code
                </label>
                <input
                  type="text"
                  placeholder="CC-ENG-901"
                  value={deptForm.costCenter || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, costCenter: e.target.value })}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Staff Headcount
                </label>
                <input
                  type="number"
                  value={deptForm.headcount ?? 10}
                  onChange={(e) => setDeptForm({ ...deptForm, headcount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Annual Budget (USD $)
                </label>
                <input
                  type="number"
                  value={deptForm.budgetAnnualUSD ?? 1000000}
                  onChange={(e) => setDeptForm({ ...deptForm, budgetAnnualUSD: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Department Mission / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of department scope..."
                  value={deptForm.description || ''}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddDeptModal(false);
                  setEditingDept(null);
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
                {editingDept ? 'Save Department Changes' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* DESIGNATION MODAL */}
      {/* ========================================================================= */}
      {(showAddDesigModal || editingDesig) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAddDesigModal(false);
            setEditingDesig(null);
          }}
          title={editingDesig ? `Edit Designation: ${editingDesig.title}` : 'Add New Designation Level'}
          size="lg"
        >
          <form onSubmit={handleSaveDesig} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Designation Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={desigForm.title || ''}
                  onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Designation Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DES-SR-ENG"
                  value={desigForm.code || ''}
                  onChange={(e) => setDesigForm({ ...desigForm, code: e.target.value })}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Career Band / Level
                </label>
                <select
                  value={desigForm.level}
                  onChange={(e) => setDesigForm({ ...desigForm, level: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Executive">Executive / C-Level</option>
                  <option value="L7 - Director">L7 - Director</option>
                  <option value="L6 - Principal">L6 - Principal</option>
                  <option value="L5 - Staff">L5 - Staff</option>
                  <option value="L4 - Lead">L4 - Lead / Manager</option>
                  <option value="L3 - Senior">L3 - Senior</option>
                  <option value="L2 - Mid">L2 - Mid Level</option>
                  <option value="L1 - Junior">L1 - Associate / Junior</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Department Assignment
                </label>
                <select
                  value={desigForm.department}
                  onChange={(e) => setDesigForm({ ...desigForm, department: e.target.value })}
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
                  Minimum Salary (USD $)
                </label>
                <input
                  type="number"
                  value={desigForm.minSalaryUSD ?? 100000}
                  onChange={(e) => setDesigForm({ ...desigForm, minSalaryUSD: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Maximum Salary (USD $)
                </label>
                <input
                  type="number"
                  value={desigForm.maxSalaryUSD ?? 150000}
                  onChange={(e) => setDesigForm({ ...desigForm, maxSalaryUSD: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddDesigModal(false);
                  setEditingDesig(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 shadow-md shadow-indigo-600/25"
              >
                {editingDesig ? 'Save Designation Changes' : 'Create Designation'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* LOCATION MODAL */}
      {/* ========================================================================= */}
      {(showAddLocModal || editingLoc) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAddLocModal(false);
            setEditingLoc(null);
          }}
          title={editingLoc ? `Edit Location: ${editingLoc.siteName}` : 'Add New Location Campus'}
          size="lg"
        >
          <form onSubmit={handleSaveLoc} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Site Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Howard Street Corporate Center"
                  value={locForm.siteName || ''}
                  onChange={(e) => setLocForm({ ...locForm, siteName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Location Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LOC-SFO-01"
                  value={locForm.code || ''}
                  onChange={(e) => setLocForm({ ...locForm, code: e.target.value })}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Facility Type
                </label>
                <select
                  value={locForm.type}
                  onChange={(e) => setLocForm({ ...locForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Corporate Campus">Corporate Campus</option>
                  <option value="Technology Park">Technology Park</option>
                  <option value="Co-Working Hub">Co-Working Hub</option>
                  <option value="Branch Facility">Branch Facility</option>
                  <option value="Data Center">Data Center</option>
                  <option value="Warehouse / Logistics">Warehouse / Logistics</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Building &amp; Floor
                </label>
                <input
                  type="text"
                  placeholder="Building A, Floors 4 & 5"
                  value={locForm.buildingFloor || ''}
                  onChange={(e) => setLocForm({ ...locForm, buildingFloor: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  City
                </label>
                <input
                  type="text"
                  placeholder="San Francisco"
                  value={locForm.city || ''}
                  onChange={(e) => setLocForm({ ...locForm, city: e.target.value })}
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
                  value={locForm.country || ''}
                  onChange={(e) => setLocForm({ ...locForm, country: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Total Seating Capacity
                </label>
                <input
                  type="number"
                  value={locForm.capacity ?? 150}
                  onChange={(e) => setLocForm({ ...locForm, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Workstation Desks
                </label>
                <input
                  type="number"
                  value={locForm.workstations ?? 120}
                  onChange={(e) => setLocForm({ ...locForm, workstations: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddLocModal(false);
                  setEditingLoc(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 shadow-md shadow-emerald-600/25"
              >
                {editingLoc ? 'Save Location Changes' : 'Create Location'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Dialogs */}
      {deletingDept && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Department?"
          message={`Are you sure you want to delete "${deletingDept.name}" (${deletingDept.code})? Staff assigned to this department should be reassigned.`}
          confirmLabel="Delete Department"
          variant="danger"
          onConfirm={handleDeleteDept}
          onClose={() => setDeletingDept(null)}
        />
      )}

      {deletingDesig && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Designation?"
          message={`Are you sure you want to delete "${deletingDesig.title}" (${deletingDesig.code})?`}
          confirmLabel="Delete Designation"
          variant="danger"
          onConfirm={handleDeleteDesig}
          onClose={() => setDeletingDesig(null)}
        />
      )}

      {deletingLoc && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Location Site?"
          message={`Are you sure you want to delete "${deletingLoc.siteName}" (${deletingLoc.code})?`}
          confirmLabel="Delete Location"
          variant="danger"
          onConfirm={handleDeleteLoc}
          onClose={() => setDeletingLoc(null)}
        />
      )}
    </div>
  );
};
