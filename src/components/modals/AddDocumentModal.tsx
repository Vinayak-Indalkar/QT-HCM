import React, { useState, useRef } from 'react';
import { Modal } from '../organisms';
import { Button } from '../atoms';
import { DocumentItem } from './DocumentViewerModal';
import {
  Upload,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (doc: DocumentItem) => void;
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

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [status, setStatus] = useState<'uploaded' | 'verified' | 'pending'>('uploaded');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);
      if (!name) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setName(cleanName);
      }
    }
  };

  const handleSimulateFile = () => {
    const randomSize = (Math.random() * 2 + 0.5).toFixed(1);
    const mockFile = `${(name || 'document').toLowerCase().replace(/\s+/g, '_')}_verified.pdf`;
    setFileName(mockFile);
    setFileSize(`${randomSize} MB`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Document name is required.');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      type: category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: name.trim(),
      category,
      fileName: fileName || `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      fileSize: fileSize || '1.4 MB',
      uploadedAt: new Date().toISOString(),
      status,
      isLocked: false,
      description: description.trim() || undefined
    };

    onAdd(newDoc);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setCategory(CATEGORY_OPTIONS[0]);
    setFileName('');
    setFileSize('');
    setStatus('uploaded');
    setDescription('');
    setValidationError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Add Document"
      description="Upload verified employee credentials, educational degrees, or compliance certificates."
      size="md"
      topOffset="80px"
      height="auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
            Document Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AWS Solutions Architect Certificate"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setValidationError('');
            }}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
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
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
            Attach Document File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            onClick={(e) => {
              e.stopPropagation();
              (e.target as HTMLInputElement).value = '';
            }}
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="sr-only"
          />

          {!fileName ? (
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/60 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all text-center space-y-2 cursor-pointer select-none"
            >
              <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mx-auto" />
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-blue-600 dark:text-blue-400 underline">
                  Click to choose a file
                </span>
                <span className="text-slate-400"> or drag and drop</span>
              </div>
              <p className="text-[11px] text-slate-400">PDF, PNG, JPG, or DOC up to 25MB</p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateFile();
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer underline"
                >
                  Auto-generate demo file attachment
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="truncate min-w-0">
                  <span className="font-bold block truncate text-slate-900 dark:text-white">{fileName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{fileSize || '1.4 MB'} • Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileName('');
                    setFileSize('');
                  }}
                  className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 text-xs cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
              Document Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="uploaded">Uploaded</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
              Security Classification
            </label>
            <div className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              Editable Record
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
            Notes / Reference Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Credential ID: AWS-89210-2026"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              handleReset();
              onClose();
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
            Add Document
          </Button>
        </div>
      </form>
    </Modal>
  );
};
