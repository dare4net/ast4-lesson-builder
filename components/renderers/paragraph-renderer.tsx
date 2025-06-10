"use client"

import { cn } from "@/lib/utils"

interface ParagraphRendererProps {
  content: string
  align?: "left" | "center" | "right" | "justify"
  isEditing?: boolean
}

export function ParagraphRenderer({ content, align = "left", isEditing = false }: ParagraphRendererProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  }

  return (
    <div
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-6",
        alignmentClasses[align]
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
