"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative group/uploader cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${isDragActive
          ? 'border-green-500 bg-green-50 dark:bg-green-500/10 scale-[0.99]'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-green-500 dark:hover:border-green-500 shadow-sm'
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-center py-10 px-6">
        <div className={`rounded-2xl p-4 transition-all duration-300 ${isDragActive
            ? 'bg-green-500 text-white rotate-6'
            : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 group-hover/uploader:scale-105 border border-green-200 dark:border-green-500/20'
          }`}>
          <Upload className={`h-7 w-7 transition-all ${isDragActive ? 'animate-bounce' : ''}`} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {isDragActive ? 'Drop lesson file here' : 'Upload Lesson File'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
            Drag and drop your lesson file (.json) or click to browse files
          </p>
        </div>
        <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <FileText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span>Supports JSON lesson files</span>
        </div>
      </div>
    </div>
  );
}