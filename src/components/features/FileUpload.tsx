'use client'

import { useState, useRef } from 'react';
import { FILE_LIMITS } from '@/lib/constants';

interface FileUploadProps {
  accept: string;
  maxSize: number;
  onFileSelect: (file: File) => void;
  label?: string;
  type: 'image' | 'video';
  preview?: string;
}

export default function FileUpload({ 
  accept, 
  maxSize, 
  onFileSelect, 
  label,
  type,
  preview 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');

    // Check file size
    if (file.size > maxSize) {
      setError(`ไฟล์ใหญ่เกินไป (สูงสุด ${maxSize / 1024 / 1024}MB)`);
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setError('ประเภทไฟล์ไม่ถูกต้อง');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-base font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative mx-auto max-w-md">
              {type === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              ลบไฟล์
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 text-gray-400">
              {type === 'image' ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            <div>
              <p className="text-lg text-gray-700 font-medium">
                คลิกหรือลากไฟล์มาวางที่นี่
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {type === 'image' ? 'PNG, JPG (สูงสุด 5MB)' : 'MP4, GIF (สูงสุด 10MB)'}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}