import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, Button, Modal, ConfirmDialog } from '../components';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';
import { formatDate } from '../utils/formatters';
import {
  CorporateDocument,
  getCorporateDocuments,
  addCorporateDocument,
  updateCorporateDocument,
  deleteCorporateDocument,
  resetCorporateDocuments,
  getSectionFolders,
  createSectionFolder
} from '../services/corporateDocumentService';
import {
  FileText,
  Plus,
  Search,
  Share2,
  Pencil,
  Trash2,
  Eye,
  Download,
  Copy,
  Check,
  Send,
  ShieldCheck,
  BookOpen,
  Layers,
  FileCheck2,
  RotateCcw,
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  X
} from 'lucide-react';

export const ComplianceDocsPage: React.FC = () => {
  const { success, info, warning } = useToast();
  const { currentRole } = useRole();

  const isHrOrSuperAdmin = currentRole === 'HR' || currentRole === 'SUPER_ADMIN';

  // Master documents state from service
  const [documents, setDocuments] = useState<CorporateDocument[]>(() => getCorporateDocuments());

  // Folders state
  const [policyFolders, setPolicyFolders] = useState<string[]>(() => getSectionFolders('policy'));
  const [otherFolders, setOtherFolders] = useState<string[]>(() => getSectionFolders('other'));

  // Active selected folder per section ('ALL' means show all folders in that section)
  const [activePolicyFolder, setActivePolicyFolder] = useState<string>('ALL');
  const [activeOtherFolder, setActiveOtherFolder] = useState<string>('ALL');

  // New Folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderSection, setNewFolderSection] = useState<'policy' | 'other'>('policy');

  // Listen for storage events
  useEffect(() => {
    const handleUpdate = () => {
      setDocuments(getCorporateDocuments());
      setPolicyFolders(getSectionFolders('policy'));
      setOtherFolders(getSectionFolders('other'));
    };
    window.addEventListener('quantira_documents_updated', handleUpdate);
    window.addEventListener('quantira_folders_updated', handleUpdate);
    return () => {
      window.removeEventListener('quantira_documents_updated', handleUpdate);
      window.removeEventListener('quantira_folders_updated', handleUpdate);
    };
  }, []);

  // Filtering & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'policy' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CorporateDocument['status']>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CorporateDocument | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    section: 'policy' as 'policy' | 'other',
    folder: 'HR & Ethics',
    category: 'Human Resources & Ethics',
    description: '',
    format: 'PDF' as 'PDF' | 'DOCX' | 'XLSX' | 'ZIP',
    fileSize: '1.5 MB',
    version: 'v1.0',
    status: 'Active' as CorporateDocument['status'],
    mandatory: true,
    targetAudience: 'All Employees',
    contentSnippet: ''
  });
  const [customFolderInput, setCustomFolderInput] = useState('');

  // Delete Confirmation State
  const [docToDelete, setDocToDelete] = useState<CorporateDocument | null>(null);

  // Share Modal State
  const [sharingDoc, setSharingDoc] = useState<CorporateDocument | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareRecipient, setShareRecipient] = useState('All Employees');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareAccessLevel, setShareAccessLevel] = useState<'View Only' | 'Can Acknowledge & Sign'>('Can Acknowledge & Sign');

  // Preview / View Modal State
  const [viewingDoc, setViewingDoc] = useState<CorporateDocument | null>(null);

  // Filtered Lists
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (sectionFilter !== 'all' && doc.section !== sectionFilter) return false;
      if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.code.toLowerCase().includes(q) ||
          doc.folder.toLowerCase().includes(q) ||
          doc.category.toLowerCase().includes(q) ||
          doc.targetAudience.toLowerCase().includes(q) ||
          doc.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [documents, sectionFilter, statusFilter, categoryFilter, searchTerm]);

  // Section-specific filtered lists (including active folder filter)
  const policyDocs = useMemo(() => {
    return filteredDocs.filter((d) => {
      if (d.section !== 'policy') return false;
      if (activePolicyFolder !== 'ALL' && d.folder !== activePolicyFolder) return false;
      return true;
    });
  }, [filteredDocs, activePolicyFolder]);

  const otherDocs = useMemo(() => {
    return filteredDocs.filter((d) => {
      if (d.section !== 'other') return false;
      if (activeOtherFolder !== 'ALL' && d.folder !== activeOtherFolder) return false;
      return true;
    });
  }, [filteredDocs, activeOtherFolder]);

  // Counts for folders
  const getPolicyFolderCount = (folderName: string) => {
    return documents.filter((d) => d.section === 'policy' && d.folder === folderName).length;
  };

  const getOtherFolderCount = (folderName: string) => {
    return documents.filter((d) => d.section === 'other' && d.folder === folderName).length;
  };

  // Unique categories for filter
  const allCategories = useMemo(() => {
    return Array.from(new Set(documents.map((d) => d.category)));
  }, [documents]);

  // Counts
  const totalPolicies = documents.filter((d) => d.section === 'policy').length;
  const totalOther = documents.filter((d) => d.section === 'other').length;
  const mandatoryCount = documents.filter((d) => d.mandatory).length;

  // Handlers for Add / Edit
  const handleOpenAdd = (defaultSection: 'policy' | 'other' = 'policy', targetFolder?: string) => {
    setEditingDoc(null);
    const prefix = defaultSection === 'policy' ? 'POL' : 'DOC';
    const randNum = Math.floor(100 + Math.random() * 900);
    const defaultFolder =
      targetFolder ||
      (defaultSection === 'policy'
        ? activePolicyFolder !== 'ALL'
          ? activePolicyFolder
          : policyFolders[0] || 'HR & Ethics'
        : activeOtherFolder !== 'ALL'
        ? activeOtherFolder
        : otherFolders[0] || 'Legal & IP');

    setFormData({
      title: '',
      code: `${prefix}-CORP-${randNum}`,
      section: defaultSection,
      folder: defaultFolder,
      category: defaultSection === 'policy' ? 'Human Resources & Ethics' : 'General & Statutory',
      description: '',
      format: 'PDF',
      fileSize: '1.8 MB',
      version: 'v1.0',
      status: 'Active',
      mandatory: true,
      targetAudience: 'All Employees',
      contentSnippet: ''
    });
    setCustomFolderInput('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (doc: CorporateDocument) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      code: doc.code,
      section: doc.section,
      folder: doc.folder,
      category: doc.category,
      description: doc.description,
      format: doc.format,
      fileSize: doc.fileSize,
      version: doc.version,
      status: doc.status,
      mandatory: doc.mandatory,
      targetAudience: doc.targetAudience,
      contentSnippet: doc.contentSnippet || ''
    });
    setCustomFolderInput('');
    setShowAddEditModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      warning('Validation Error', 'Document title is required.');
      return;
    }
    if (!formData.code.trim()) {
      warning('Validation Error', 'Document code identifier is required.');
      return;
    }

    const finalFolder = customFolderInput.trim() ? customFolderInput.trim() : formData.folder;

    if (customFolderInput.trim()) {
      createSectionFolder(formData.section, customFolderInput.trim());
    }

    if (editingDoc) {
      updateCorporateDocument(editingDoc.id, {
        title: formData.title.trim(),
        code: formData.code.trim().toUpperCase(),
        section: formData.section,
        folder: finalFolder,
        category: formData.category.trim(),
        description: formData.description.trim(),
        format: formData.format,
        fileSize: formData.fileSize,
        version: formData.version.trim(),
        status: formData.status,
        mandatory: formData.mandatory,
        targetAudience: formData.targetAudience.trim(),
        contentSnippet: formData.contentSnippet.trim()
      });
      setDocuments(getCorporateDocuments());
      success('Document Updated', `"${formData.title.trim()}" has been updated successfully.`);
    } else {
      addCorporateDocument({
        title: formData.title.trim(),
        code: formData.code.trim().toUpperCase(),
        section: formData.section,
        folder: finalFolder,
        category: formData.category.trim(),
        description: formData.description.trim(),
        format: formData.format,
        fileSize: formData.fileSize,
        version: formData.version.trim(),
        status: formData.status,
        mandatory: formData.mandatory,
        targetAudience: formData.targetAudience.trim(),
        contentSnippet: formData.contentSnippet.trim()
      });
      setDocuments(getCorporateDocuments());
      success('Document Added', `New ${formData.section === 'policy' ? 'company policy' : 'document'} "${formData.title.trim()}" created.`);
    }

    setShowAddEditModal(false);
    setEditingDoc(null);
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    deleteCorporateDocument(docToDelete.id);
    setDocuments(getCorporateDocuments());
    info('Document Deleted', `"${docToDelete.title}" was removed from the repository.`);
    setDocToDelete(null);
  };

  // Share Handler
  const handleOpenShare = (doc: CorporateDocument) => {
    setSharingDoc(doc);
    setCopiedLink(false);
    setShareRecipient('All Employees');
    setShareEmail('');
    setShareMessage('');
    setShareAccessLevel('Can Acknowledge & Sign');
  };

  const handleCopyShareLink = () => {
    if (!sharingDoc) return;
    const shareUrl = `${window.location.origin}/documents/${sharingDoc.code.toLowerCase()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      success('Link Copied', 'Direct document link copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleSendShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingDoc) return;
    const target = shareRecipient === 'Specific Email Address' ? shareEmail : shareRecipient;
    if (shareRecipient === 'Specific Email Address' && !shareEmail.trim()) {
      warning('Recipient Required', 'Please enter a valid recipient email address.');
      return;
    }

    success(
      'Document Dispatched',
      `"${sharingDoc.title}" share notification sent to ${target} (${shareAccessLevel}).`
    );
    setSharingDoc(null);
  };

  // Download Mock File
  const handleDownloadFile = (doc: CorporateDocument) => {
    const textContent = `QUANTIRA TECHNOLOGIES - OFFICIAL REPOSITORY\n\nTitle: ${doc.title}\nCode: ${doc.code}\nSection: ${doc.section === 'policy' ? 'Company Policy' : 'Corporate Document'}\nFolder: ${doc.folder}\nCategory: ${doc.category}\nVersion: ${doc.version}\nEffective Date: ${doc.lastUpdated}\nMandatory Requirement: ${doc.mandatory ? 'Yes' : 'No'}\nTarget Audience: ${doc.targetAudience}\n\nDESCRIPTION:\n${doc.description}\n\nDOCUMENT BODY & PROVISIONS:\n${doc.contentSnippet || 'Standard corporate agreement provisions apply.'}\n\nGenerated via Quantira Document Management Platform.`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.code}_${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('Download Started', `Downloading ${doc.code} (${doc.format}).`);
  };

  // Reset to initial mock documents
  const handleResetDefaults = () => {
    resetCorporateDocuments();
    setDocuments(getCorporateDocuments());
    setPolicyFolders(getSectionFolders('policy'));
    setOtherFolders(getSectionFolders('other'));
    setActivePolicyFolder('ALL');
    setActiveOtherFolder('ALL');
    info('Repository Reset', 'Document repository restored to default enterprise templates.');
  };

  // Handle New Folder creation
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      warning('Validation Error', 'Folder name is required.');
      return;
    }
    const created = createSectionFolder(newFolderSection, newFolderName.trim());
    if (created) {
      if (newFolderSection === 'policy') {
        setPolicyFolders(getSectionFolders('policy'));
        setActivePolicyFolder(newFolderName.trim());
      } else {
        setOtherFolders(getSectionFolders('other'));
        setActiveOtherFolder(newFolderName.trim());
      }
      success('Folder Created', `Folder "${newFolderName.trim()}" added to ${newFolderSection === 'policy' ? 'Company Policies' : 'Other Documents'}.`);
    } else {
      info('Folder Exists', `Folder "${newFolderName.trim()}" already exists.`);
    }
    setShowNewFolderModal(false);
    setNewFolderName('');
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Management &amp; Repository
          </h1>
        </div>
      </div>

      {/* Global Filter & Search Bar */}
      <Card className="p-4 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Section Selector Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setSectionFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sectionFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Documents ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter('policy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sectionFilter === 'policy'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Company Policies ({totalPolicies})
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter('other')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sectionFilter === 'other'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Other Documents ({totalOther})
            </button>
          </div>

          {/* Search and Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, folder, code, category..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* SECTION 1: Company Policies */}
      {(sectionFilter === 'all' || sectionFilter === 'policy') && (
        <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Company Policies
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                    {policyDocs.length} {policyDocs.length === 1 ? 'Policy' : 'Policies'}
                  </span>
                </h2>
              </div>
            </div>

            {isHrOrSuperAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAdd('policy')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Policy
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0 border-t border-slate-100 dark:border-slate-800">
            {policyDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No company policies found in this folder matching your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <th className="py-3 px-4 min-w-[300px] whitespace-nowrap">Policy Title</th>
                      <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Folder</th>
                      <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Code</th>
                      <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Version &amp; Format</th>
                      <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Audience</th>
                      <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Last Updated</th>
                      <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 min-w-[120px] text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-xs">
                    {policyDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white block truncate max-w-sm" title={doc.title}>
                                {doc.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {doc.mandatory ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                                    Mandatory
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Optional
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActivePolicyFolder(doc.folder)}
                            className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                            title={`Filter to folder: ${doc.folder}`}
                          >
                            <Folder className="w-3.5 h-3.5 text-purple-500" />
                            <span>{doc.folder}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                            {doc.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{doc.version}</span> • {doc.format} ({doc.fileSize})
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {doc.targetAudience}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(doc.lastUpdated)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              doc.status === 'Active'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : doc.status === 'Under Review'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenShare(doc)}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                              title="Share Policy"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            {isHrOrSuperAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(doc)}
                                  className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                  title="Edit Policy"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDocToDelete(doc)}
                                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                  title="Delete Policy"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: Other Documents */}
      {(sectionFilter === 'all' || sectionFilter === 'other') && (
        <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Other Documents
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                    {otherDocs.length} {otherDocs.length === 1 ? 'Document' : 'Documents'}
                  </span>
                </h2>
              </div>
            </div>

            {isHrOrSuperAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAdd('other')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Document
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0 border-t border-slate-100 dark:border-slate-800">
            {otherDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No corporate documents found in this folder matching your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <th className="py-3 px-4 min-w-[300px] whitespace-nowrap">Document Title</th>
                      <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Folder</th>
                      <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Code</th>
                      <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Version &amp; Format</th>
                      <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Audience</th>
                      <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Last Updated</th>
                      <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 min-w-[120px] text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-xs">
                    {otherDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                              <FileCheck2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white block truncate max-w-sm" title={doc.title}>
                                {doc.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {doc.mandatory ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Reference
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActiveOtherFolder(doc.folder)}
                            className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                            title={`Filter to folder: ${doc.folder}`}
                          >
                            <Folder className="w-3.5 h-3.5 text-teal-500" />
                            <span>{doc.folder}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                            {doc.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{doc.version}</span> • {doc.format} ({doc.fileSize})
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {doc.targetAudience}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(doc.lastUpdated)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              doc.status === 'Active'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : doc.status === 'Under Review'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenShare(doc)}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                              title="Share Document"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            {isHrOrSuperAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(doc)}
                                  className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                  title="Edit Document"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDocToDelete(doc)}
                                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Create New Folder Modal */}
      {/* ========================================================================= */}
      {showNewFolderModal && (
        <Modal
          isOpen={showNewFolderModal}
          onClose={() => {
            setShowNewFolderModal(false);
            setNewFolderName('');
          }}
          title={`Create New ${newFolderSection === 'policy' ? 'Policy' : 'Document'} Folder`}
          size="sm"
        >
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Target Section
              </label>
              <select
                value={newFolderSection}
                onChange={(e) => setNewFolderSection(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="policy">Company Policies</option>
                <option value="other">Other Documents</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Compensation & Stock Options"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Create Folder
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add / Edit Document Modal */}
      {/* ========================================================================= */}
      {showAddEditModal && (
        <Modal
          isOpen={showAddEditModal}
          onClose={() => {
            setShowAddEditModal(false);
            setEditingDoc(null);
          }}
          title={editingDoc ? `Edit Document: ${editingDoc.code}` : 'Add New Corporate Document'}
          size="lg"
        >
          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Remote Work Ergonomics & Equipment Security Policy"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Section *
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => {
                    const nextSection = e.target.value as 'policy' | 'other';
                    const targetFolders = nextSection === 'policy' ? policyFolders : otherFolders;
                    setFormData({
                      ...formData,
                      section: nextSection,
                      folder: targetFolders[0] || 'General'
                    });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="policy">Company Policy</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Folder *
                </label>
                <select
                  value={customFolderInput ? '__NEW__' : formData.folder}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setCustomFolderInput('New Folder');
                    } else {
                      setCustomFolderInput('');
                      setFormData({ ...formData, folder: e.target.value });
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {(formData.section === 'policy' ? policyFolders : otherFolders).map((f) => (
                    <option key={f} value={f}>
                      📁 {f}
                    </option>
                  ))}
                  <option value="__NEW__">+ Add Custom Folder...</option>
                </select>
              </div>

              {customFolderInput !== '' && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                    Enter New Folder Name *
                  </label>
                  <input
                    type="text"
                    value={customFolderInput}
                    onChange={(e) => setCustomFolderInput(e.target.value)}
                    placeholder="Enter custom folder name..."
                    className="w-full px-3.5 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/40 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Document Code / ID *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. POL-OPS-009"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. IT & Security, Legal, HR"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g. All Employees, Engineering"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g. v1.0"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="DOCX">Microsoft Word (DOCX)</option>
                  <option value="XLSX">Excel Spreadsheet (XLSX)</option>
                  <option value="ZIP">Archive Package (ZIP)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.mandatory}
                    onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    Mandatory Employee Acknowledgment Required
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Executive Summary / Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Brief summary of policy requirements, purpose, and applicability..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Document Body / Policy Clauses (Text Snippet)
              </label>
              <textarea
                value={formData.contentSnippet}
                onChange={(e) => setFormData({ ...formData, contentSnippet: e.target.value })}
                rows={4}
                placeholder="Enter document clauses, definitions, operational guidelines, or statutory terms..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAddEditModal(false);
                  setEditingDoc(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {editingDoc ? 'Save Changes' : 'Create Document'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Share Document Modal */}
      {/* ========================================================================= */}
      {sharingDoc && (
        <Modal
          isOpen={!!sharingDoc}
          onClose={() => setSharingDoc(null)}
          title={`Share Document: ${sharingDoc.code}`}
          size="md"
        >
          <div className="space-y-5">
            {/* Document Quick Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                  {sharingDoc.title}
                </span>
                <span className="text-xs text-slate-500">
                  📁 {sharingDoc.folder} • {sharingDoc.section === 'policy' ? 'Company Policy' : 'Corporate Document'} • {sharingDoc.version} ({sharingDoc.format})
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownloadFile(sharingDoc)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="text-xs font-bold shrink-0"
              >
                Download
              </Button>
            </div>

            {/* Direct Link Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Direct Document Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/documents/${sharingDoc.code.toLowerCase()}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyShareLink}
                  leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  className="text-xs font-bold whitespace-nowrap shrink-0"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            {/* Email / Department Dispatch Form */}
            <form onSubmit={handleSendShare} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Send Notification to Team or Personnel
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Select Recipient Group
                </label>
                <select
                  value={shareRecipient}
                  onChange={(e) => setShareRecipient(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="All Employees">All Employees (Company-Wide Announcement)</option>
                  <option value="Engineering & Product">Engineering &amp; Product Pods</option>
                  <option value="Human Resources & Legal">Human Resources &amp; Legal</option>
                  <option value="Sales & Customer Success">Sales &amp; Customer Success</option>
                  <option value="All People Managers">All People Managers</option>
                  <option value="New Hires in Onboarding">New Hires in Onboarding Pipeline</option>
                  <option value="Specific Email Address">Specific Email Address...</option>
                </select>
              </div>

              {shareRecipient === 'Specific Email Address' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="employee@quantira.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Permission / Access Level
                </label>
                <select
                  value={shareAccessLevel}
                  onChange={(e) => setShareAccessLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Can Acknowledge & Sign">Can Acknowledge &amp; E-Sign Required</option>
                  <option value="View Only">View &amp; Reference Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Optional Note / Instructions
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please review the updated Q3 compliance clauses by Friday EOD..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSharingDoc(null)}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Send Share Link
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: View / Preview Document Modal */}
      {/* ========================================================================= */}
      {viewingDoc && (
        <Modal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          title={`${viewingDoc.code}: ${viewingDoc.title}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Meta Tags Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Folder</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
                  <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {viewingDoc.folder}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Section</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingDoc.section === 'policy' ? 'Company Policy' : 'Corporate Document'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Version &amp; File</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingDoc.version} • {viewingDoc.format}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Requirement</span>
                <span className={`text-xs font-bold ${viewingDoc.mandatory ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {viewingDoc.mandatory ? 'Mandatory' : 'Optional'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Summary &amp; Scope
              </h3>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {viewingDoc.description}
              </p>
            </div>

            {/* Document Content Box */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Document Provisions &amp; Policy Clauses
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 max-h-60 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {viewingDoc.contentSnippet || 'Standard corporate clauses, compliance acknowledgments, and statutory terms govern this active documentation asset.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Last reviewed: {formatDate(viewingDoc.lastUpdated)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadFile(viewingDoc)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Download File
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const doc = viewingDoc;
                    setViewingDoc(null);
                    handleOpenShare(doc);
                  }}
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700"
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION: Delete Document Dialog */}
      {/* ========================================================================= */}
      {docToDelete && (
        <ConfirmDialog
          isOpen={!!docToDelete}
          title="Delete Document"
          message={`Are you sure you want to permanently remove "${docToDelete.title}" (${docToDelete.code}) from the corporate repository? This will revoke active links.`}
          confirmLabel="Delete Document"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onClose={() => setDocToDelete(null)}
        />
      )}
    </div>
  );
};
