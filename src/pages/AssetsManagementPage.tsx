import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Keyboard,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
  Calendar,
  Building2,
  DollarSign,
  ShieldCheck,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Hash,
  Cpu,
  RefreshCw,
  X,
  Upload,
  ImageIcon
} from 'lucide-react';
import { ITAsset, AssetCategory, AssetStatus, AssetCondition } from '../types/asset';
import { ColumnDef } from '../types/common';
import { getAssets, createAsset, updateAsset, deleteAsset, saveAssets } from '../services/assetService';
import {
  getAssetFieldConfigs,
  AssetFieldConfig,
  getAssetSectionOrder
} from '../services/customFieldsService';
import { useOnboarding } from '../context/OnboardingContext';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Modal,
  ConfirmDialog,
  PageHeader,
  DataTable,
  FilterGroupConfig
} from '../components';
import { formatDate, formatCurrency } from '../utils/formatters';

export const AssetsManagementPage: React.FC = () => {
  const { candidates } = useOnboarding();
  const { success: showToastSuccess, error: showToastError } = useToast();
  const { currentRole } = useRole();

  const [assets, setAssets] = useState<ITAsset[]>(() => getAssets());
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<ITAsset | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'detail'>('list');
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<ITAsset | null>(null);
  const [viewingAssetModal, setViewingAssetModal] = useState<ITAsset | null>(null);

  // Asset Customizer Sequence & Section State
  const [assetFieldConfigs, setAssetFieldConfigs] = useState<AssetFieldConfig[]>(() => getAssetFieldConfigs());
  const [assetSectionOrder, setAssetSectionOrder] = useState<string[]>(() => getAssetSectionOrder());

  // Bulk Operations State
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [bulkStatusIds, setBulkStatusIds] = useState<string[] | null>(null);
  const [selectedBulkStatus, setSelectedBulkStatus] = useState<AssetStatus>('Available');

  // Generic Action Confirmation Popup
  const [actionConfirmation, setActionConfirmation] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'info' | 'warning' | 'danger' | 'success';
    onConfirm: () => void;
  } | null>(null);

  // Photo Upload State
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      showToastError('Invalid File', 'Please upload a PNG, JPG, WEBP, or GIF image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToastError('File Too Large', 'Device photo must be under 8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
      showToastSuccess('Photo Uploaded', `${file.name} loaded as device photo.`);
    };
    reader.readAsDataURL(file);
  }, [showToastError, showToastSuccess]);

  // Listen to cross-window or local updates
  useEffect(() => {
    const handleUpdate = () => {
      setAssets(getAssets());
    };
    const handleAssetFieldsUpdate = (e: any) => {
      setAssetFieldConfigs(e.detail || getAssetFieldConfigs());
    };
    const handleAssetSectionsUpdate = (e: any) => {
      setAssetSectionOrder(e.detail || getAssetSectionOrder());
    };
    window.addEventListener('quantira_assets_updated', handleUpdate);
    window.addEventListener('quantira_asset_field_configs_updated', handleAssetFieldsUpdate);
    window.addEventListener('quantira_asset_section_order_updated', handleAssetSectionsUpdate);
    return () => {
      window.removeEventListener('quantira_assets_updated', handleUpdate);
      window.removeEventListener('quantira_asset_field_configs_updated', handleAssetFieldsUpdate);
      window.removeEventListener('quantira_asset_section_order_updated', handleAssetSectionsUpdate);
    };
  }, []);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    category: AssetCategory;
    assetTag: string;
    serialNumber: string;
    status: AssetStatus;
    condition: AssetCondition;
    assignedCandidateId: string;
    location: string;
    purchaseCost: string;
    purchaseDate: string;
    warrantyExpiry: string;
    processor: string;
    ram: string;
    storage: string;
    os: string;
    display: string;
    vendor: string;
    storageBay: string;
    notes: string;
    imageUrl: string;
  }>({
    name: '',
    category: 'Laptop',
    assetTag: '',
    serialNumber: '',
    status: 'Available',
    condition: 'New',
    assignedCandidateId: '',
    location: 'San Francisco HQ',
    purchaseCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    processor: '',
    ram: '',
    storage: '',
    os: '',
    display: '',
    vendor: '',
    storageBay: '',
    notes: '',
    imageUrl: ''
  });

  const openAddModal = () => {
    const randomTag = `QTR-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomSerial = `C02${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setFormData({
      name: '',
      category: 'Laptop',
      assetTag: randomTag,
      serialNumber: randomSerial,
      status: 'Available',
      condition: 'New',
      assignedCandidateId: '',
      location: 'San Francisco HQ',
      purchaseCost: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      processor: '',
      ram: '',
      storage: '',
      os: '',
      display: '',
      vendor: '',
      storageBay: '',
      notes: '',
      imageUrl: ''
    });
    setCurrentView('add');
  };

  const openEditScreen = (asset: ITAsset) => {
    setEditingAsset(asset);
    setCurrentView('edit');
    setFormData({
      name: asset.name,
      category: asset.category,
      assetTag: asset.assetTag,
      serialNumber: asset.serialNumber,
      status: asset.status,
      condition: asset.condition,
      assignedCandidateId: asset.assignedTo?.id || '',
      location: asset.location,
      purchaseCost: asset.purchaseCost ? String(asset.purchaseCost) : '',
      purchaseDate: asset.purchaseDate || new Date().toISOString().split('T')[0],
      warrantyExpiry: asset.warrantyExpiry || '',
      processor: asset.specifications?.['Processor'] || '',
      ram: asset.specifications?.['Memory'] || '',
      storage: asset.specifications?.['Storage'] || '',
      os: asset.specifications?.['Operating System'] || '',
      display: asset.specifications?.['Display'] || '',
      vendor: asset.specifications?.['Vendor'] || '',
      storageBay: asset.specifications?.['Storage Bay'] || '',
      notes: asset.notes || '',
      imageUrl: asset.imageUrl || ''
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.assetTag.trim() || !formData.serialNumber.trim()) {
      showToastError('Validation Error', 'Name, Asset Tag, and Serial Number are required.');
      return;
    }

    let assignedTo = null;
    if (formData.assignedCandidateId) {
      const cand = candidates.find((c) => c.id === formData.assignedCandidateId);
      if (cand) {
        assignedTo = {
          id: cand.id,
          name: `${cand.firstName} ${cand.lastName}`,
          email: cand.email,
          department: cand.department,
          avatarUrl: cand.avatarUrl,
          assignedDate: new Date().toISOString().split('T')[0]
        };
      }
    }

    const specs: Record<string, string> = {};
    if (formData.processor.trim()) specs['Processor'] = formData.processor.trim();
    if (formData.ram.trim()) specs['Memory'] = formData.ram.trim();
    if (formData.storage.trim()) specs['Storage'] = formData.storage.trim();
    if (formData.os.trim()) specs['Operating System'] = formData.os.trim();
    if (formData.display.trim()) specs['Display'] = formData.display.trim();
    if (formData.vendor.trim()) specs['Vendor'] = formData.vendor.trim();
    if (formData.storageBay.trim()) specs['Storage Bay'] = formData.storageBay.trim();

    const assetName = formData.name.trim();
    const assetTagVal = formData.assetTag.trim();
    const serialVal = formData.serialNumber.trim();
    const currentFormData = { ...formData };
    const currentAssignedTo = assignedTo;
    const currentSpecs = specs;

    setActionConfirmation({
      title: 'Confirm Asset Registration',
      message: `Are you sure you want to register "${assetName}" (Tag: ${assetTagVal}) into inventory?`,
      confirmLabel: 'Register Asset',
      variant: 'info',
      onConfirm: () => {
        const newAsset = createAsset({
          name: assetName,
          category: currentFormData.category,
          assetTag: assetTagVal,
          serialNumber: serialVal,
          status: currentAssignedTo ? 'Assigned' : currentFormData.status,
          condition: currentFormData.condition,
          assignedTo: currentAssignedTo,
          location: currentFormData.location,
          purchaseCost: parseFloat(currentFormData.purchaseCost) || 0,
          purchaseDate: currentFormData.purchaseDate,
          warrantyExpiry: currentFormData.warrantyExpiry,
          specifications: currentSpecs,
          notes: currentFormData.notes.trim(),
          imageUrl: currentFormData.imageUrl.trim() || undefined
        });

        setAssets(getAssets());
        setCurrentView('list');
        showToastSuccess('Asset Created', `${newAsset.name} has been added to inventory with tag ${newAsset.assetTag}.`);
      }
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    if (!formData.name.trim() || !formData.assetTag.trim() || !formData.serialNumber.trim()) {
      showToastError('Validation Error', 'Name, Asset Tag, and Serial Number are required.');
      return;
    }

    let assignedTo = null;
    if (formData.assignedCandidateId) {
      const cand = candidates.find((c) => c.id === formData.assignedCandidateId);
      if (cand) {
        assignedTo = {
          id: cand.id,
          name: `${cand.firstName} ${cand.lastName}`,
          email: cand.email,
          department: cand.department,
          avatarUrl: cand.avatarUrl,
          assignedDate: editingAsset.assignedTo?.assignedDate || new Date().toISOString().split('T')[0]
        };
      }
    }

    const specs: Record<string, string> = { ...(editingAsset.specifications || {}) };
    if (formData.processor.trim()) specs['Processor'] = formData.processor.trim();
    if (formData.ram.trim()) specs['Memory'] = formData.ram.trim();
    if (formData.storage.trim()) specs['Storage'] = formData.storage.trim();
    if (formData.os.trim()) specs['Operating System'] = formData.os.trim();
    if (formData.display.trim()) specs['Display'] = formData.display.trim();
    if (formData.vendor.trim()) specs['Vendor'] = formData.vendor.trim();
    if (formData.storageBay.trim()) specs['Storage Bay'] = formData.storageBay.trim();

    const assetName = formData.name.trim();
    const assetTagVal = formData.assetTag.trim();
    const serialVal = formData.serialNumber.trim();
    const currentFormData = { ...formData };
    const currentAssignedTo = assignedTo;
    const currentSpecs = specs;
    const currentEditingAsset = editingAsset;

    setActionConfirmation({
      title: 'Confirm Asset Changes',
      message: `Save updates to asset record "${assetName}" (${assetTagVal})?`,
      confirmLabel: 'Save Changes',
      variant: 'info',
      onConfirm: () => {
        const updated = updateAsset(currentEditingAsset.id, {
          name: assetName,
          category: currentFormData.category,
          assetTag: assetTagVal,
          serialNumber: serialVal,
          status: currentAssignedTo ? (currentFormData.status === 'Available' ? 'Assigned' : currentFormData.status) : currentFormData.status,
          condition: currentFormData.condition,
          assignedTo: currentAssignedTo,
          location: currentFormData.location,
          purchaseCost: parseFloat(currentFormData.purchaseCost) || 0,
          purchaseDate: currentFormData.purchaseDate,
          warrantyExpiry: currentFormData.warrantyExpiry,
          specifications: currentSpecs,
          notes: currentFormData.notes.trim(),
          imageUrl: currentFormData.imageUrl.trim() || undefined
        });

        setAssets(getAssets());
        if (selectedAssetDetail && selectedAssetDetail.id === currentEditingAsset.id && updated) {
          setSelectedAssetDetail(updated);
        }
        setEditingAsset(null);
        setCurrentView(selectedAssetDetail ? 'detail' : 'list');
        showToastSuccess('Asset Updated', `${assetName} (${assetTagVal}) details updated.`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingAsset) return;
    deleteAsset(deletingAsset.id);
    setAssets(getAssets());
    if (selectedAssetDetail && selectedAssetDetail.id === deletingAsset.id) {
      setSelectedAssetDetail(null);
    }
    showToastSuccess('Asset Deleted', `${deletingAsset.name} has been removed from inventory.`);
    setDeletingAsset(null);
  };

  const handleExportCSV = (selectedItems: ITAsset[] = []) => {
    const items = selectedItems.length > 0 ? selectedItems : assets;
    const headers = 'Asset Tag,Name,Category,Serial Number,Status,Condition,Assigned To,Department,Location,Purchase Cost,Purchase Date,Warranty Expiry';
    const rows = items.map((a) => {
      const assignedName = a.assignedTo ? a.assignedTo.name : 'Unassigned';
      const assignedDept = a.assignedTo ? a.assignedTo.department : 'N/A';
      return `"${a.assetTag}","${a.name}","${a.category}","${a.serialNumber}","${a.status}","${a.condition}","${assignedName}","${assignedDept}","${a.location}","$${a.purchaseCost}","${a.purchaseDate}","${a.warrantyExpiry}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Quantira_IT_Assets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastSuccess('Export Complete', `Exported ${items.length} assets to CSV.`);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = assets.length;
    const assigned = assets.filter((a) => a.status === 'Assigned').length;
    const available = assets.filter((a) => a.status === 'Available').length;
    const maintenance = assets.filter((a) => a.status === 'Maintenance').length;
    const totalValue = assets.reduce((acc, a) => acc + (a.purchaseCost || 0), 0);
    return { total, assigned, available, maintenance, totalValue };
  }, [assets]);

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'Laptop':
      case 'Desktop':
        return <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Monitor':
        return <Monitor className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'Mobile Device':
        return <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Audio/Video':
        return <Headphones className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Peripheral':
      case 'Accessories':
        return <Keyboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Available
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
            <UserCheck className="w-3 h-3" /> Assigned
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
            <Clock className="w-3 h-3" /> Maintenance
          </span>
        );
      case 'Retired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <UserX className="w-3 h-3" /> Retired
          </span>
        );
    }
  };

  // Columns definition for DataTable
  const columns: ColumnDef<ITAsset>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Asset Details',
        accessorKey: 'name',
        sortable: true,
        hideable: false,
        defaultVisible: true,
        minWidth: '260px',
        cell: (asset) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {getCategoryIcon(asset.category)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 dark:text-white truncate">
                {asset.name}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {asset.category}
              </span>
            </div>
          </div>
        )
      },
      {
        id: 'assetTag',
        header: 'Tag & Serial',
        accessorKey: 'assetTag',
        sortable: true,
        defaultVisible: true,
        minWidth: '160px',
        cell: (asset) => (
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded block w-fit">
              {asset.assetTag}
            </span>
            <span className="font-mono text-[11px] text-slate-400 block">
              S/N: {asset.serialNumber}
            </span>
          </div>
        )
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        sortable: true,
        defaultVisible: true,
        minWidth: '140px',
        cell: (asset) => getStatusBadge(asset.status)
      },
      {
        id: 'condition',
        header: 'Condition',
        accessorKey: 'condition',
        sortable: true,
        defaultVisible: true,
        minWidth: '120px',
        cell: (asset) => (
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {asset.condition}
          </span>
        )
      },
      {
        id: 'assignedTo',
        header: 'Assigned To',
        accessorKey: 'assignedTo',
        sortable: false,
        defaultVisible: true,
        minWidth: '200px',
        cell: (asset) =>
          asset.assignedTo ? (
            <div className="flex items-center gap-2">
              <Avatar
                src={asset.assignedTo.avatarUrl}
                name={asset.assignedTo.name}
                size="sm"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[140px]">
                  {asset.assignedTo.name}
                </span>
                <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                  {asset.assignedTo.department}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Unassigned (In Pool)
            </span>
          )
      },
      {
        id: 'location',
        header: 'Location',
        accessorKey: 'location',
        sortable: true,
        defaultVisible: true,
        minWidth: '160px',
        cell: (asset) => (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {asset.location}
          </span>
        )
      },
      {
        id: 'purchaseCost',
        header: 'Purchase Cost',
        accessorKey: 'purchaseCost',
        sortable: true,
        defaultVisible: false,
        minWidth: '140px',
        cell: (asset) => (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {formatCurrency(asset.purchaseCost, 'USD')}
          </span>
        )
      },
      {
        id: 'warrantyExpiry',
        header: 'Warranty Expiry',
        accessorKey: 'warrantyExpiry',
        sortable: true,
        defaultVisible: false,
        minWidth: '150px',
        cell: (asset) => (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {formatDate(asset.warrantyExpiry)}
          </span>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        sortable: false,
        hideable: false,
        defaultVisible: true,
        minWidth: '130px',
        align: 'right',
        cell: (asset) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View Detail */}
            <button
              type="button"
              onClick={() => setViewingAssetModal(asset)}
              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
              title="View Full Asset Details"
              aria-label="View Asset"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => openEditScreen(asset)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Edit Asset Details"
              aria-label="Edit Asset"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => setDeletingAsset(asset)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Delete Asset from Registry"
              aria-label="Delete Asset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    ],
    []
  );

  // Filter groups
  const filterGroups: FilterGroupConfig[] = useMemo(
    () => [
      {
        id: 'category',
        label: 'Category',
        options: [
          'Laptop',
          'Desktop',
          'Monitor',
          'Mobile Device',
          'Peripheral',
          'Audio/Video',
          'Accessories'
        ].map((cat) => ({
          label: cat,
          value: cat,
          count: assets.filter((a) => a.category === cat).length
        }))
      },
      {
        id: 'status',
        label: 'Status',
        options: [
          { label: 'Available', value: 'Available', count: assets.filter((a) => a.status === 'Available').length },
          { label: 'Assigned', value: 'Assigned', count: assets.filter((a) => a.status === 'Assigned').length },
          { label: 'Maintenance', value: 'Maintenance', count: assets.filter((a) => a.status === 'Maintenance').length },
          { label: 'Retired', value: 'Retired', count: assets.filter((a) => a.status === 'Retired').length }
        ]
      },
      {
        id: 'condition',
        label: 'Condition',
        options: [
          { label: 'New', value: 'New', count: assets.filter((a) => a.condition === 'New').length },
          { label: 'Excellent', value: 'Excellent', count: assets.filter((a) => a.condition === 'Excellent').length },
          { label: 'Good', value: 'Good', count: assets.filter((a) => a.condition === 'Good').length },
          { label: 'Fair', value: 'Fair', count: assets.filter((a) => a.condition === 'Fair').length },
          { label: 'Damaged', value: 'Damaged', count: assets.filter((a) => a.condition === 'Damaged').length }
        ]
      }
    ],
    [assets]
  );

  // Expandable row rendering
  const renderExpandedRow = (asset: ITAsset) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Hardware Specifications */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-500" /> Technical Specifications
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {asset.assetTag}
            </span>
          </div>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
            {asset.specifications && Object.keys(asset.specifications).length > 0 ? (
              Object.entries(asset.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <strong className="text-slate-700 dark:text-slate-300">{key}:</strong>
                  <span className="truncate max-w-[180px]" title={val}>{val}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No detailed specifications recorded.</p>
            )}
          </div>
        </div>

        {/* Procurement & Lifecycle */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Procurement &amp; Warranty
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(asset.purchaseCost, 'USD')}
            </span>
          </div>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <strong>Purchase Date:</strong>
              <span>{formatDate(asset.purchaseDate)}</span>
            </div>
            <div className="flex justify-between">
              <strong>Warranty Expiry:</strong>
              <span>{formatDate(asset.warrantyExpiry)}</span>
            </div>
            <div className="flex justify-between">
              <strong>Serial Number:</strong>
              <span className="font-mono">{asset.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <strong>Location:</strong>
              <span>{asset.location}</span>
            </div>
          </div>
        </div>

        {/* Notes & Actions */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block mb-1">
              Deployment Notes &amp; Assigned Staff
            </span>
            <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
              {asset.notes || 'No extra provisioning notes.'}
            </p>
            {asset.assignedTo && (
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Assigned to: <strong>{asset.assignedTo.name}</strong> ({asset.assignedTo.department})
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setSelectedAssetDetail(asset);
              setCurrentView('detail');
            }}
            className="mt-3 w-full"
            rightIcon={<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />}
          >
            Open Full Asset Specifications
          </Button>
        </div>
      </div>
    );
  };

  // Group and sort asset sections according to Super Admin customizer sequence
  const configuredAssetSections = useMemo(() => {
    const activeConfigs = assetFieldConfigs.filter((f) => f.enabled !== false);
    const sectionMap = new Map<string, AssetFieldConfig[]>();

    activeConfigs.forEach((f) => {
      const sec = f.section || 'General';
      if (!sectionMap.has(sec)) {
        sectionMap.set(sec, []);
      }
      sectionMap.get(sec)!.push(f);
    });

    const sortedSectionNames = Array.from(sectionMap.keys());
    if (assetSectionOrder.length > 0) {
      const orderMap = new Map(assetSectionOrder.map((name, idx) => [name, idx]));
      sortedSectionNames.sort((a, b) => {
        const idxA = orderMap.has(a) ? orderMap.get(a)! : 999;
        const idxB = orderMap.has(b) ? orderMap.get(b)! : 999;
        return idxA - idxB;
      });
    }

    return sortedSectionNames.map((secName) => ({
      name: secName,
      fields: sectionMap.get(secName)!
    }));
  }, [assetFieldConfigs, assetSectionOrder]);

  const getAssetSectionMeta = (sectionName: string) => {
    switch (sectionName) {
      case 'Hardware Identity':
        return {
          icon: <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          title: 'Hardware Model & Categorization',
          bg: 'bg-blue-100 dark:bg-blue-950/60'
        };
      case 'Technical Specs':
        return {
          icon: <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
          title: 'Technical Specifications & Performance',
          bg: 'bg-purple-100 dark:bg-purple-950/60'
        };
      case 'Procurement & Warranty':
        return {
          icon: <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          title: 'Procurement, Warranty & Facility Location',
          bg: 'bg-emerald-100 dark:bg-emerald-950/60'
        };
      case 'Deployment & Notes':
        return {
          icon: <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          title: 'Accessories, Hardware Photo & Deployment Notes',
          bg: 'bg-amber-100 dark:bg-amber-950/60'
        };
      default:
        return {
          icon: <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          title: sectionName,
          bg: 'bg-indigo-100 dark:bg-indigo-950/60'
        };
    }
  };

  const renderAssetFormField = (field: AssetFieldConfig, isEdit = false) => {
    const key = field.key;
    const isRequired = field.required ?? false;

    switch (key) {
      case 'name':
        return (
          <div key={field.id || key} className="col-span-full">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Asset Name / Hardware Model'} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. Apple MacBook Pro 16-inch (M3 Max, 36GB, 1TB SSD)"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
              required={isRequired}
            />
          </div>
        );

      case 'category':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Category'} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              required={isRequired}
            >
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Monitor">Monitor</option>
              <option value="Mobile Device">Mobile Device</option>
              <option value="Peripheral">Peripheral</option>
              <option value="Audio/Video">Audio / Video</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        );

      case 'condition':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Physical Condition'} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              required={isRequired}
            >
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        );

      case 'status':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Inventory Status'} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              required={isRequired}
            >
              <option value="Available">Available {isEdit ? '' : '(In Stockroom Pool)'}</option>
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance / Repair</option>
              <option value="Retired">Retired / Decommissioned</option>
            </select>
          </div>
        );

      case 'assetTag':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Asset Tag / Barcode'} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. QTR-LAP-1049"}
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              required={isRequired}
            />
          </div>
        );

      case 'serialNumber':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Serial Number'} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. C02G8492MD6R"}
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              required={isRequired}
            />
          </div>
        );

      case 'assignedTo':
      case 'assignedCandidateId':
        return (
          <div key={field.id || key} className="col-span-full">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Assigned Employee Custodian'}
            </label>
            <select
              value={formData.assignedCandidateId}
              onChange={(e) => setFormData({ ...formData, assignedCandidateId: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value="">Unassigned (Return to Stockroom Pool)</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.jobTitle} - {c.department})
                </option>
              ))}
            </select>
          </div>
        );

      case 'processor':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Processor / Chipset'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. Apple M3 Max 16-Core / Intel Core i7"}
              value={formData.processor}
              onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'ram':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'RAM / System Memory'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. 36GB Unified / 32GB DDR5"}
              value={formData.ram}
              onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'storage':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Storage Capacity'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. 1TB NVMe PCIe SSD / 512GB SSD"}
              value={formData.storage}
              onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'os':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Operating System / Platform'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. macOS Sonoma 14.x / Windows 11 Pro Enterprise"}
              value={formData.os}
              onChange={(e) => setFormData({ ...formData, os: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'display':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Screen / Display Specifications'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. 16.2-inch Liquid Retina XDR / 27-inch 4K UHD"}
              value={formData.display}
              onChange={(e) => setFormData({ ...formData, display: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'location':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Primary Office Location'} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              required={isRequired}
            >
              <option value="San Francisco HQ">San Francisco HQ</option>
              <option value="New York Office">New York Office</option>
              <option value="Austin Technology Center">Austin Technology Center</option>
              <option value="Remote - USA">Remote - USA</option>
            </select>
          </div>
        );

      case 'storageBay':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Storage Bay / Stockroom Shelf'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. IT Stockroom Shelf B-4 / Locker 08"}
              value={formData.storageBay}
              onChange={(e) => setFormData({ ...formData, storageBay: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'vendor':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Authorized Vendor / Supplier'}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || "e.g. Apple Direct Enterprise / CDW / Dell"}
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'purchaseCost':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Purchase Cost ($ USD)'}
            </label>
            <input
              type="number"
              placeholder={field.placeholder || "2499.00"}
              value={formData.purchaseCost}
              onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'purchaseDate':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Acquisition / Purchase Date'}
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'warrantyExpiry':
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Warranty Expiry Date'}
            </label>
            <input
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            />
          </div>
        );

      case 'imageUrl':
        return (
          <div key={field.id || key} className="col-span-full">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {field.label || 'Device Photo'} <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            {formData.imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 max-w-md">
                <img
                  src={formData.imageUrl}
                  alt="Device photo preview"
                  className="w-full h-44 object-contain p-4"
                />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Replace photo"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Device photo loaded
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => photoInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && photoInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setPhotoDragOver(true); }}
                onDragLeave={() => setPhotoDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setPhotoDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handlePhotoFile(file);
                }}
                className={`flex flex-col items-center justify-center gap-3 h-40 max-w-md rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none
                  ${photoDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                  }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${photoDragOver ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  {photoDragOver ? <Upload className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {photoDragOver ? 'Drop to upload' : 'Drag & drop device photo'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    or <span className="text-blue-600 dark:text-blue-400 font-semibold underline">browse files</span> · PNG, JPG, WEBP · Max 8 MB
                  </p>
                </div>
              </div>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoFile(file);
                e.target.value = '';
              }}
            />
          </div>
        );

      case 'accessories':
      case 'notes':
        return (
          <div key={field.id || key} className="col-span-full">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label || 'Deployment Notes & Peripherals'}
            </label>
            <textarea
              rows={3}
              placeholder={field.placeholder || "Included accessories, charger serial, notes..."}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        );

      default:
        return (
          <div key={field.id || key}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {field.label} {isRequired && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || ''}
              value={(formData as any)[key] || ''}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              required={isRequired}
            />
          </div>
        );
    }
  };

  // =========================================================================
  // VIEW 1: IN-SCREEN ADD ASSET
  // =========================================================================
  if (currentView === 'add') {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <button
              type="button"
              onClick={() => setCurrentView('list')}
              className="-ml-1 mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Assets Directory
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                IT Inventory Management
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                New Equipment Registration
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Register New Corporate IT Asset
            </h1>
          </div>
        </div>

        <form onSubmit={handleSaveAdd} className="space-y-6">
          <div className="w-full space-y-6">
            {configuredAssetSections.map((sec) => {
              const meta = getAssetSectionMeta(sec.name);
              return (
                <Card key={sec.name} className="shadow-xs border border-slate-200 dark:border-slate-800 w-full">
                  <CardHeader className="justify-start pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center font-bold shrink-0`}>
                        {meta.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {meta.title}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sec.fields.map((f) => renderAssetFormField(f, false))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setCurrentView('list')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              Register Asset
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: IN-SCREEN EDIT ASSET
  // =========================================================================
  if (currentView === 'edit' && editingAsset) {
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (selectedAssetDetail) {
                  setCurrentView('detail');
                } else {
                  setCurrentView('list');
                }
              }}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              {selectedAssetDetail ? 'Back to Asset Detail' : 'Back to Assets Directory'}
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                  {editingAsset.assetTag}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-bold text-slate-400">
                  Update Asset Record
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                Edit Asset: {editingAsset.name}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-6">
          <div className="w-full space-y-6">
            {configuredAssetSections.map((sec) => {
              const meta = getAssetSectionMeta(sec.name);
              return (
                <Card key={sec.name} className="shadow-xs border border-slate-200 dark:border-slate-800 w-full">
                  <CardHeader className="justify-start pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center font-bold shrink-0`}>
                        {meta.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {meta.title}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sec.fields.map((f) => renderAssetFormField(f, true))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (selectedAssetDetail) {
                  setCurrentView('detail');
                } else {
                  setCurrentView('list');
                }
              }}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="text-xs font-bold"
            >
              Save Asset Changes
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ASSET DETAIL SCREEN
  // =========================================================================
  if (currentView === 'detail' && selectedAssetDetail) {
    const asset = selectedAssetDetail;
    return (
      <div className="space-y-6 text-left w-full animate-fade-in pb-16">
        {/* Top Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedAssetDetail(null); setCurrentView('list'); }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Return to Assets Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  IT Hardware Directory
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                  {asset.assetTag}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {asset.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              leftIcon={<Pencil className="w-4 h-4" />}
              onClick={() => openEditScreen(asset)}
              className="text-xs font-bold"
            >
              Edit Asset Details
            </Button>
            <Button
              variant="destructive"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setDeletingAsset(asset)}
              className="text-xs font-bold"
            >
              Delete Asset
            </Button>
          </div>
        </div>

        {/* Top Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">Inventory Status</span>
            <div className="pt-1">{getStatusBadge(asset.status)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">Physical Condition</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
              {asset.condition} Condition
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">Purchase Value</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
              ${asset.purchaseCost.toLocaleString()} USD
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">Primary Location</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white block truncate">
              {asset.location}
            </span>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Hardware Specifications */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Technical Profile &amp; Specifications
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
                  Serial: {asset.serialNumber}
                </span>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {asset.specifications && Object.keys(asset.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(asset.specifications).map(([key, value]) => (
                      <div key={key} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {key}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400 text-xs">
                    Standard enterprise specifications active. No custom configuration flags specified.
                  </div>
                )}

                {asset.notes && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                      IT Management &amp; Deployment Notes
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {asset.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Procurement & Lifecycle Card */}
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Procurement, Warranty &amp; Lifecycle
                  </h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Purchase Date
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {asset.purchaseDate}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Warranty Expiry
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                      {asset.warrantyExpiry}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      OEM Service Tier
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      Next Business Day On-site
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Assigned Employee Card */}
          <div className="space-y-6">
            <Card className="shadow-xs border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Assigned Custodian
                  </h3>
                </div>
                {asset.assignedTo && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    Active Assignment
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {asset.assignedTo ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={asset.assignedTo.avatarUrl}
                        name={asset.assignedTo.name}
                        size="lg"
                        className="ring-2 ring-blue-500/20"
                      />
                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                          {asset.assignedTo.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          <a
                            href={`mailto:${asset.assignedTo.email}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                          >
                            {asset.assignedTo.email}
                          </a>
                        </p>
                        <span className="inline-block text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          {asset.assignedTo.department}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned Since:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                          {asset.assignedTo.assignedDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sign-off Acknowledged:</span>
                        <span className="font-bold text-emerald-600">✓ Onboarding Step 7 Signed</span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs font-bold mt-2"
                      onClick={() => openEditScreen(asset)}
                    >
                      Reassign / Return to Pool
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Available in Inventory
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                        This hardware unit is in the {asset.location} stockroom, ready to be deployed to an employee.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold"
                      onClick={() => openEditScreen(asset)}
                    >
                      Assign to Employee
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ASSETS DIRECTORY LIST & GRID
  // =========================================================================
  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-16">
      {/* Header Bar */}
      <PageHeader
        title="Corporate IT Assets Directory"
        description="Comprehensive enterprise hardware registry. Search, multi-column sort, filter, customize columns, and execute batch operations."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
            {assets.length} Total Inventory Records
          </span>
        }
        actions={
          <Button
            variant="primary"
            leftIcon={<Laptop className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Add Asset
          </Button>
        }
      />

      {/* Enterprise Data Table */}
      <DataTable
        data={assets}
        columns={columns}
        filterGroups={filterGroups}
        searchPlaceholder="Search by asset name, tag, serial, assignee, location..."
        enableSelection={false}
        enableExpanding={false}
        onRowClick={(asset) => setViewingAssetModal(asset)}
        extraHeaderActions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExportCSV([])}
          >
            Export All CSV
          </Button>
        }
      />

      {/* Confirmation Dialog: Single Delete */}
      <ConfirmDialog
        isOpen={Boolean(deletingAsset)}
        onClose={() => setDeletingAsset(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Asset Record?"
        message={`Are you sure you want to remove ${deletingAsset?.name} (${deletingAsset?.assetTag}) from corporate inventory?`}
        consequence="All specifications, assignment logs, and serial records will be permanently removed from enterprise auditing logs."
        confirmLabel="Delete Asset"
        variant="danger"
      />

      {/* Confirmation Dialog: Bulk Delete */}
      <ConfirmDialog
        isOpen={Boolean(bulkDeleteIds)}
        onClose={() => setBulkDeleteIds(null)}
        onConfirm={() => {
          if (bulkDeleteIds) {
            const current = getAssets();
            const filtered = current.filter((a) => !bulkDeleteIds.includes(a.id));
            saveAssets(filtered);
            setAssets(filtered);
            showToastSuccess('Assets Deleted', `Successfully deleted ${bulkDeleteIds.length} asset(s).`);
            setBulkDeleteIds(null);
          }
        }}
        title={`Delete ${bulkDeleteIds?.length} Selected Assets?`}
        message="This action will permanently delete the selected hardware records from corporate inventory."
        consequence="This operation cannot be undone."
        confirmLabel="Delete All Selected"
        variant="danger"
      />

      {/* Bulk Status Update Modal */}
      {bulkStatusIds && (
        <Modal
          isOpen={true}
          onClose={() => setBulkStatusIds(null)}
          title={`Update Status for ${bulkStatusIds.length} Asset(s)`}
          description="Select the new operational inventory status to apply to all selected asset records."
          size="sm"
          topOffset="80px"
          height="auto"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => setBulkStatusIds(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!bulkStatusIds || bulkStatusIds.length === 0) return;
                  const targetIds = [...bulkStatusIds];
                  const targetStatus = selectedBulkStatus;
                  setActionConfirmation({
                    title: 'Confirm Bulk Status Update',
                    message: `Are you sure you want to change status to "${targetStatus}" for ${targetIds.length} selected asset(s)?`,
                    confirmLabel: 'Apply Status',
                    variant: 'warning',
                    onConfirm: () => {
                      const current = getAssets();
                      const updated = current.map((a) =>
                        targetIds.includes(a.id)
                          ? { ...a, status: targetStatus, updatedAt: new Date().toISOString() }
                          : a
                      );
                      saveAssets(updated);
                      setAssets(updated);
                      showToastSuccess('Status Updated', `Updated status to ${targetStatus} for ${targetIds.length} asset(s).`);
                      setBulkStatusIds(null);
                    }
                  });
                }}
              >
                Apply Status
              </Button>
            </div>
          }
        >
          <div className="p-1 space-y-3 text-left">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              New Inventory Status
            </label>
            <select
              value={selectedBulkStatus}
              onChange={(e) => setSelectedBulkStatus(e.target.value as AssetStatus)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Available">Available (Ready for Deployment)</option>
              <option value="Assigned">Assigned (Allocated to Staff)</option>
              <option value="Maintenance">Maintenance (Service Desk)</option>
              <option value="Retired">Retired (Decommissioned)</option>
            </select>
          </div>
        </Modal>
      )}

      {/* Asset Full Details Modal (Opened on click of View Eye icon) */}
      {viewingAssetModal && (
        <Modal
          isOpen={true}
          onClose={() => setViewingAssetModal(null)}
          title="Corporate IT Asset Record"
          description={`Comprehensive hardware specifications and lifecycle dossier for ${viewingAssetModal.assetTag}`}
          size="xl"
          topOffset="80px"
          height="auto"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingAssetModal(null)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const target = viewingAssetModal;
                    setViewingAssetModal(null);
                    setSelectedAssetDetail(target);
                    setCurrentView('detail');
                  }}
                >
                  Full Page View
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Pencil className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const target = viewingAssetModal;
                    setViewingAssetModal(null);
                    openEditScreen(target);
                  }}
                >
                  Edit Asset Details
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-left p-1">
            {/* 1. Hero Identity Header Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {viewingAssetModal.imageUrl ? (
                <img
                  src={viewingAssetModal.imageUrl}
                  alt={viewingAssetModal.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  {getCategoryIcon(viewingAssetModal.category)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-md">
                    {viewingAssetModal.assetTag}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md">
                    {viewingAssetModal.category}
                  </span>
                  {getStatusBadge(viewingAssetModal.status)}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {viewingAssetModal.condition} Condition
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                  {viewingAssetModal.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  S/N: <strong className="text-slate-700 dark:text-slate-300">{viewingAssetModal.serialNumber}</strong> • Location: <strong className="text-slate-700 dark:text-slate-300">{viewingAssetModal.location}</strong>
                </p>
              </div>
            </div>

            {/* 2. Custodian Assignment Information */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 pb-1 mb-2">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Custodian &amp; Allocation Status
                </h4>
              </div>
              {viewingAssetModal.assignedTo ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={viewingAssetModal.assignedTo.avatarUrl}
                      name={viewingAssetModal.assignedTo.name}
                      size="md"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">
                        {viewingAssetModal.assignedTo.name}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        <a
                          href={`mailto:${viewingAssetModal.assignedTo.email}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                        >
                          {viewingAssetModal.assignedTo.email}
                        </a>{' '}
                        • {viewingAssetModal.assignedTo.department}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-slate-400 block">Assigned Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">
                      {viewingAssetModal.assignedTo.assignedDate}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Available in Pool
                    </span>
                    <span className="text-xs text-slate-500">
                      Hardware is currently in {viewingAssetModal.location} stockroom, unassigned and ready for allocation.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Technical Specifications Grid */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 pb-1 mb-2">
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Hardware Specifications &amp; Technical Profile
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Processor / Chipset</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.specifications?.['Processor'] || 'Standard Multi-Core CPU'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">System Memory (RAM)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.specifications?.['Memory'] || '16GB RAM'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Storage Capacity</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.specifications?.['Storage'] || '512GB NVMe SSD'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Operating System</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.specifications?.['Operating System'] || viewingAssetModal.specifications?.['OS'] || 'macOS / Windows 11'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Display / Screen</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.specifications?.['Display'] || viewingAssetModal.specifications?.['Screen Size'] || 'Built-in Display'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Storage Bay / Shelf</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.specifications?.['Storage Bay'] || 'Stockroom Main Bay'}
                  </span>
                </div>
                {/* Any extra custom specifications */}
                {viewingAssetModal.specifications &&
                  Object.entries(viewingAssetModal.specifications)
                    .filter(([k]) => !['Processor', 'Memory', 'Storage', 'Operating System', 'OS', 'Display', 'Screen Size', 'Storage Bay', 'Vendor'].includes(k))
                    .map(([key, val]) => (
                      <div key={key} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 font-semibold block mb-0.5">{key}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{val}</span>
                      </div>
                    ))}
              </div>
            </div>

            {/* 4. Procurement, Financials & Warranty */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 pb-1 mb-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Procurement, Warranty &amp; Supplier Information
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Purchase Cost</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${viewingAssetModal.purchaseCost.toLocaleString()} USD
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Purchase Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.purchaseDate || '2026-08-10'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Warranty Expiry</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {viewingAssetModal.warrantyExpiry || '2029-08-10'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-0.5">Authorized Vendor</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingAssetModal.specifications?.['Vendor'] || 'Direct OEM Enterprise'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Accessories & Notes */}
            {viewingAssetModal.notes && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 pb-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Included Accessories &amp; Deployment Notes
                  </h4>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {viewingAssetModal.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog: Generic Action Confirmation */}
      {actionConfirmation && (
        <ConfirmDialog
          isOpen={Boolean(actionConfirmation)}
          title={actionConfirmation.title}
          message={actionConfirmation.message}
          confirmLabel={actionConfirmation.confirmLabel || 'Confirm'}
          variant={actionConfirmation.variant || 'info'}
          onClose={() => setActionConfirmation(null)}
          onConfirm={() => {
            const cb = actionConfirmation.onConfirm;
            setActionConfirmation(null);
            cb();
          }}
        />
      )}
    </div>
  );
};
