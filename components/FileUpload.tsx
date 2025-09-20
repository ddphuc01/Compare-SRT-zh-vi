import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './Icon';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
  label: string;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, label, id }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.srt')) {
          processFile(file);
      }
    }
  }, [processFile]);
  
  const handleClick = () => {
      fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div 
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-indigo-400 transition-colors"
      >
        <div className="space-y-1 text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-400">
            <p className="pl-1">{fileName ? `Tệp: ${fileName}` : 'Tải tệp lên hoặc kéo thả vào đây'}</p>
            <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept=".srt" ref={fileInputRef} />
          </div>
          <p className="text-xs text-gray-500">Chỉ chấp nhận tệp .srt</p>
        </div>
      </div>
    </div>
  );
};