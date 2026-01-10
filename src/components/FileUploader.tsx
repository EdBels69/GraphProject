import React, { useCallback } from 'react';
import { FileUp, Loader2, AlertCircle, FileType } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading, error }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading) return;

    const file = event.dataTransfer.files[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload, isLoading]);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative group transition-all duration-500 rounded-3xl overflow-hidden
        border-2 border-dashed border-ash/30 bg-void
        ${!isLoading && 'hover:border-plasma/30 hover:bg-white cursor-pointer shadow-sm'}
        ${isLoading && 'opacity-50 cursor-not-allowed'}
      `}
    >
      <input
        type="file"
        id="file-upload"
        accept=".csv,.json,.bib,.txt"
        onChange={handleFileChange}
        disabled={isLoading}
        className="hidden"
      />

      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center p-12 w-full ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className={`
          p-6 rounded-2xl bg-white border border-ash/20 mb-6 shadow-sm
          ${!isLoading && 'group-hover:scale-110 group-hover:shadow-glow-plasma/20 group-hover:border-plasma/20'} 
          transition-all duration-500
        `}>
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-plasma animate-spin" />
          ) : (
            <FileUp className="w-10 h-10 text-steel/30 group-hover:text-plasma transition-colors" />
          )}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-display font-bold text-steel tracking-widest uppercase">
            {isLoading ? 'SYNCING_DATA...' : 'INITIALIZE_UPLOAD'}
          </h3>
          <p className="text-xs font-mono text-steel-dim uppercase tracking-widest">
            {isLoading ? 'Processing neural pathways' : 'Click to select or drag & drop file'}
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-steel/5 rounded border border-ash/10 text-[9px] font-mono text-steel-dim font-bold">
              <FileType className="w-3 h-3" /> CSV
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-steel/5 rounded border border-ash/10 text-[9px] font-mono text-steel-dim font-bold">
              <FileType className="w-3 h-3" /> JSON
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-steel/5 rounded border border-ash/10 text-[9px] font-mono text-steel-dim font-bold">
              <FileType className="w-3 h-3" /> BIB
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-8 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-mono text-red-600 font-bold uppercase tracking-tight">{error}</span>
          </div>
        )}
      </label>
    </div>
  );
};
