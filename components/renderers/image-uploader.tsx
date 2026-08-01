"use client"

import * as React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, ImageIcon, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  className?: string
  lessonId?: string
  componentId?: string
}

export function ImageUploader({ value, onChange, className, lessonId, componentId }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(value)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately while uploading
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploadError(null)

    if (!lessonId || !componentId) {
      // If no lessonId/componentId available, fall back to base64 URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreview(result)
        onChange(result)
      }
      reader.readAsDataURL(file)
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('lessonId', lessonId)
      formData.append('componentId', componentId)

      const res = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed')
      }

      setPreview(data.url)
      onChange(data.url)
    } catch (err: any) {
      console.error('[ImageUploader] Upload failed:', err)
      setUploadError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPreview(url)
    onChange(url)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className} group/uploader`}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Paste content URL..."
          value={value}
          onChange={handleUrlChange}
          className="flex-1 bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-xs font-bold h-10 rounded-xl"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-emerald-500 hover:text-slate-950 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      {uploadError && (
        <p className="text-xs text-red-400 font-semibold">{uploadError}</p>
      )}

      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40 shadow-inner group-hover/uploader:border-emerald-500/30 transition-all">
        {preview ? (
          <>
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-cover opacity-80 group-hover/uploader:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover/uploader:opacity-100 transition-all">
                {isUploading ? 'Uploading to Cloud...' : 'Image Ready'}
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 group-hover/uploader:text-emerald-500/50 transition-colors">
            <ImageIcon className="h-12 w-12 mb-4 stroke-1 animate-pulse" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">No Image Added</p>
          </div>
        )}
      </div>
    </div>
  )
}
