import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DocumentItem } from './DocumentViewerModal';
import {
  Upload,
  Tag,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onSave: (doc: DocumentItem) => void;
}

const CATEGORY_OPTIONS = [
  'Identity Proof',
  'Educational Certificate',
  'Financial & Banking',
  'Tax & Statutory',
  'Certifications & Licenses',
  'Prior Employment',
  'Legal & Compliance',
  'Other Records'
];

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [status, setStatus] = useState<string>('uploaded');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (doc) {
      setName(doc.name || '');
      setCategory(doc.category || CATEGORY_OPTIONS[0]);
      setFileName(doc.fileName || '');
      setFileSize(doc.fileSize || '1.8 MB');
      setStatus(doc.status || 'uploaded');
      setDescription(doc.description || '');
      setValidationError('');
    }
  }, [doc]);

  if (!doc) return null;

  const isLocked = doc.isLocked || doc.type === 'nda' || doc.id === 'doc-nda';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      onClose();
      return;
    }
    if (!name.trim()) {
      setValidationError('Document name is required.');
      return;
    }

    const updated: DocumentItem = {
      ...doc,
      name: name.trim(),
      category,
      fileName: fileName || doc.fileName,
      fileSize: fileSize || doc.fileSize,
      status,
      description: description.trim() || undefined,
      uploadedAt: new Date().toISOString()
    };

    onSave(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLocked ? 'Protected Legal Document' : 'Edit Document Details'}
      description={
        isLocked
          ? 'Official executed document permanently locked under electronic agreement compliance.'
          : 'Modify title, category, replace file, or update verification records.'
      }
      size="md"
      topOffset="80px"
      height="auto"
    >
      {isLocked ? (
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm mb-1">Modifications Restricted</p>
              <p className="leading-relaxed">
                <strong>{doc.name}</strong> is a legally binding company record (countersigned NDA or legal agreement). In accordance with corporate governance and ESIGN regulatory standards, executed legal instruments cannot be edited or overwritten.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Document Title:</span>
              <span className="font-bold text-slate-900 dark:text-white">{doc.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Classification:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{doc.category || 'Legal & Compliance'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Archive File:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{doc.fileName || 'signed_agreement.pdf'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Execution Status:</span>
              <span className="font-bold text-emerald-600">✓ Executed & Countersigned</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setValidationError('');
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Category
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Replace File (Optional)
            </label>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/60 flex items-center justify-between gap-3 text-xs">
              <div className="truncate">
                <span className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 block truncate">
                  {fileName || 'No file attached'}
                </span>
                <span className="text-[11px] text-slate-400">Current file ({fileSize || '1.8 MB'})</span>
              </div>
              <label className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold hover:bg-blue-100 cursor-pointer">
                Upload New File
                <input
                  type="file"
                  onChange={handleFileChange}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).value = '';
                  }}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="uploaded">Uploaded</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                File Size
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="e.g. 1.8 MB"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Reference Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Credential ID or Expiry date"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
