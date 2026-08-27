"use client"

import React from "react"
import { WYSIWYGTextArea } from "@/components/ui/wysiwyg-editor"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

/**
 * RichTextEditor (Compatibility Wrapper)
 * 
 * Replaces old static tabbed editor with the new contentEditable WYSIWYG Engine
 * with floating selection bubble and color wheel popovers.
 */
export function RichTextEditor({ value, onChange, placeholder, rows = 5, className }: RichTextEditorProps) {
  return (
    <WYSIWYGTextArea
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Type your content here..."}
      rows={rows}
      className={className}
      showPreviewToggle={true}
    />
  )
}
