"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

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
      className={`relative group/uploader cursor-pointer rounded-[2rem] border-2 border-dashed transition-all duration-500 overflow-hidden ${isDragActive
          ? 'border-emerald-500 bg-emerald-500/10 scale-[0.99] shadow-inner'
          : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 hover:border-emerald-500/30 shadow-xl'
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-6 text-center py-12 px-8">
        <div className={`rounded-3xl p-5 transition-all duration-500 ${isDragActive ? 'bg-emerald-500 text-slate-950 rotate-12' : 'bg-slate-950 text-emerald-500 group-hover/uploader:scale-110 group-hover/uploader:rotate-3 shadow-2xl border border-slate-800'
          }`}>
          <Upload className={`h-8 w-8 transition-all ${isDragActive ? 'animate-bounce' : ''}`} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-black text-white uppercase tracking-widest">
            {isDragActive ? 'Release to Deploy' : 'Initialize Data Stream'}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
            Drag & drop lesson artifacts or click to browse local storage
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/50 border border-slate-800/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Manifest: .json only</span>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/10 rounded-tl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/10 rounded-br-xl pointer-events-none" />
    </div>
  );
} 