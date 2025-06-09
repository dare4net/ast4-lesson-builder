"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPreview(result)
      onChange(result)
    }
    reader.readAsDataURL(file)
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
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter image URL or upload"
          value={value}
          onChange={handleUrlChange}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={triggerFileInput}>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      {preview ? (
        <div className="border rounded-md overflow-hidden">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="max-h-[200px] w-auto mx-auto object-contain"
          />
        </div>
      ) : (
        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 mb-2" />
          <p>No image selected</p>
        </div>
      )}
    </div>
  )
}
