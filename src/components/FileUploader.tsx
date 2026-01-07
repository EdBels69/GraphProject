import React, { useCallback } from 'react';

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
    
    const file = event.dataTransfer.files[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
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
        className="cursor-pointer block"
      >
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-1 text-sm text-gray-600">
          Нажмите для выбора файла или перетащите его сюда
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Поддерживаемые форматы: CSV, JSON, BibTeX
        </p>
        {isLoading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Загрузка...</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </label>
    </div>
  );
};
