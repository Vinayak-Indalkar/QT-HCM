import React, { useState, useRef, useId } from 'react';
import { cn } from '../../utils/cn';
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';

export interface UploadedFileInfo {
  name: string;
  size: string;
  type: string;
  file?: File;
}

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  accept?: string;
  maxSizeMb?: number;
  value?: UploadedFileInfo | null;
  onChange?: (file: UploadedFileInfo | null) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  helperText = 'PDF, PNG, JPG up to 10MB',
  accept = '.pdf,.png,.jpg,.jpeg,.docx',
  maxSizeMb = 10,
  value,
  onChange,
  required = false,
  disabled = false,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const id = `file-upload-${generatedId}`;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = (file: File) => {
    setError(null);

    // Size validation
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File exceeds maximum size limit of ${maxSizeMb}MB`);
      return;
    }

    // Simulate upload progress
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          const uploaded: UploadedFileInfo = {
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            file
          };
          onChange?.(uploaded);
          return null;
        }
        return prev + 30;
      });
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5 text-left', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      {/* Hidden native file input - persistent across both states */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        onClick={(e) => {
          e.stopPropagation();
          (e.target as HTMLInputElement).value = '';
        }}
        disabled={disabled}
        className="sr-only"
        aria-label={label || 'Upload file'}
      />

      {value ? (
        <div className="flex items-center justify-between p-3 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 transition-all">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-200 truncate">
                {value.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                {value.size} • <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready for verification</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => !disabled && inputRef.current?.click()}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              aria-label={`Remove file ${value.name}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled) inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none',
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50',
            disabled && 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
          )}
        >
          {uploadProgress !== null ? (
            <div className="w-full max-w-xs flex flex-col items-center gap-2 py-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Uploading... {uploadProgress}%
              </span>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mb-2">
                <UploadCloud className="w-6 h-6" aria-hidden="true" />
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                <span className="text-blue-600 dark:text-blue-400 font-semibold underline">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {helperText}
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
