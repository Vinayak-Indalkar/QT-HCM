import React, { useState, useEffect, useMemo } from 'react';
import {
  CustomFieldDefinition,
  CustomizerModule,
  SchemaVariable,
  QueryPreset
} from '../types';
import {
  getModuleFields,
  saveModuleFields,
  getModuleSections,
  saveModuleSections
} from '../services/customizerStorageService';
import { CustomFieldBuilderView } from './CustomFieldBuilderView';
import { Button, TextInput } from '../ui';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Layers,
  Sparkles,
  Lock,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Settings2
} from 'lucide-react';

export interface ModuleCustomizerManagerProps {
  modules?: CustomizerModule[];
  initialModuleId?: string;
  schemaVariables?: SchemaVariable[];
  queryPresets?: QueryPreset[];
  onFieldsChanged?: (moduleId: string, fields: CustomFieldDefinition[]) => void;
  className?: string;
}

const DEFAULT_MODULES: CustomizerModule[] = [
  {
    id: 'users',
    label: 'Users & Profiles',
    description: 'Customize member profile attributes and onboarding forms',
    defaultSections: ['Basic Profile', 'Contact & Location', 'Custom Details']
  },
  {
    id: 'assets',
    label: 'Inventory & Assets',
    description: 'Hardware equipment specifications, procurement and assignments',
    defaultSections: ['Device Identity', 'Technical Specs', 'Procurement & Warranty']
  }
];

export const ModuleCustomizerManager: React.FC<ModuleCustomizerManagerProps> = ({
  modules = DEFAULT_MODULES,
  initialModuleId,
  schemaVariables,
  queryPresets,
  onFieldsChanged,
  className = ''
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(
    initialModuleId || modules[0]?.id || 'users'
  );

  const activeModule = useMemo(
    () => modules.find((m) => m.id === activeModuleId) || modules[0],
    [modules, activeModuleId]
  );

  // Storage State
  const [sections, setSections] = useState<string[]>(() =>
    getModuleSections(activeModuleId, activeModule?.defaultSections)
  );

  const [fields, setFields] = useState<CustomFieldDefinition[]>(() =>
    getModuleFields(activeModuleId)
  );

  // Sync when module tab changes
  useEffect(() => {
    if (!activeModule) return;
    setSections(getModuleSections(activeModule.id, activeModule.defaultSections));
    setFields(getModuleFields(activeModule.id));
  }, [activeModule]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [builderState, setBuilderState] = useState<{
    isOpen: boolean;
    initialField?: CustomFieldDefinition | null;
    defaultSection?: string;
  } | null>(null);

  const [newSectionModal, setNewSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  // Persist helper
  const updateFields = (next: CustomFieldDefinition[]) => {
    setFields(next);
    saveModuleFields(activeModuleId, next);
    onFieldsChanged?.(activeModuleId, next);
  };

  const updateSections = (next: string[]) => {
    setSections(next);
    saveModuleSections(activeModuleId, next);
  };

  // Section actions
  const handleAddSection = () => {
    const trimmed = newSectionName.trim();
    if (!trimmed || sections.includes(trimmed)) return;
    const next = [...sections, trimmed];
    updateSections(next);
    setNewSectionName('');
    setNewSectionModal(false);
  };

  const handleDeleteSection = (sectionName: string) => {
    if (!window.confirm(`Are you sure you want to remove section "${sectionName}"?`)) return;
    const nextSections = sections.filter((s) => s !== sectionName);
    const nextFields = fields.filter((f) => f.section !== sectionName);
    updateSections(nextSections);
    updateFields(nextFields);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    updateSections(next);
  };

  const toggleSectionCollapse = (sectionName: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Field actions
  const handleDeleteField = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    updateFields(fields.filter((f) => f.id !== id));
  };

  const handleToggleRequired = (id: string) => {
    updateFields(
      fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const handleSaveFieldFromBuilder = (
    fieldData: CustomFieldDefinition,
    newSection?: string
  ) => {
    let currentSections = [...sections];
    if (newSection && !currentSections.includes(newSection)) {
      currentSections.push(newSection);
      updateSections(currentSections);
    }

    const fieldToSave: CustomFieldDefinition = {
      ...fieldData,
      id: fieldData.id || `fld_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      section: newSection || fieldData.section || currentSections[0] || 'General'
    };

    const exists = fields.some((f) => f.id === fieldToSave.id);
    const next = exists
      ? fields.map((f) => (f.id === fieldToSave.id ? fieldToSave : f))
      : [...fields, fieldToSave];

    updateFields(next);
    setBuilderState(null);
  };

  // Filtered fields
  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return fields;
    const q = searchQuery.toLowerCase();
    return fields.filter(
      (f) =>
        f.label?.toLowerCase().includes(q) ||
        f.key?.toLowerCase().includes(q) ||
        (f.type && f.type.toLowerCase().includes(q))
    );
  }, [fields, searchQuery]);

  // If Builder View is open, render full-screen builder
  if (builderState?.isOpen) {
    return (
      <CustomFieldBuilderView
        initialField={builderState.initialField}
        targetModule={activeModuleId}
        availableSections={sections}
        standardSections={activeModule?.defaultSections || []}
        schemaVariables={schemaVariables}
        queryPresets={queryPresets}
        onSave={handleSaveFieldFromBuilder}
        onCancel={() => setBuilderState(null)}
      />
    );
  }

  return (
    <div className={`space-y-6 text-left w-full ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            Module Customizer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build schema fields, configure validation rules, and organize custom sections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setNewSectionModal(true)}
            leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
          >
            Add Section
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              setBuilderState({
                isOpen: true,
                initialField: null,
                defaultSection: sections[0]
              })
            }
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Field
          </Button>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {modules.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveModuleId(m.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeModuleId === m.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fields</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">{fields.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mandatory</span>
          <span className="text-xl font-black text-rose-600 dark:text-rose-400">{fields.filter(f => f.required).length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Computed Queries</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">{fields.filter(f => f.isComputed).length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sections</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{sections.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <TextInput
          placeholder="Search fields by label, key or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          className="text-xs"
        />
      </div>

      {/* Sections & Fields Listing */}
      <div className="space-y-4">
        {sections.map((sectionName, sIdx) => {
          const sectionFields = filteredFields.filter((f) => f.section === sectionName);
          const isCollapsed = collapsedSections[sectionName];

          return (
            <div
              key={sectionName}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSectionCollapse(sectionName)}
                >
                  <button type="button" className="text-slate-400 hover:text-slate-600">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {sectionName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {sectionFields.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={sIdx === 0}
                    onClick={() => handleMoveSection(sIdx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    title="Move section up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={sIdx === sections.length - 1}
                    onClick={() => handleMoveSection(sIdx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    title="Move section down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBuilderState({
                        isOpen: true,
                        initialField: null,
                        defaultSection: sectionName
                      })
                    }
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title="Add field to this section"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sectionName)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded"
                    title="Delete section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Fields Table */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sectionFields.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      No fields configured in this section yet. Click "+ Add Field" to get started.
                    </div>
                  ) : (
                    sectionFields.map((field) => (
                      <div
                        key={field.id}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {field.type}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {field.label}
                              </span>
                              {field.required && (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                  *Required
                                </span>
                              )}
                              {field.isComputed && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Formula
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              key: {field.key}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleRequired(field.id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              field.required
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                          >
                            {field.required ? 'Mandatory' : 'Optional'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setBuilderState({
                                isOpen: true,
                                initialField: field,
                                defaultSection: sectionName
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                            title="Edit field settings"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                            title="Delete field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Section Modal Dialog */}
      {newSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Section</h3>
            <TextInput
              placeholder="e.g. Identity Documents, Payroll Data..."
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="text-xs"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setNewSectionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddSection} disabled={!newSectionName.trim()}>
                Create Section
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

