"use client"

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

  return <div className={`${alignmentClasses[align]}`} dangerouslySetInnerHTML={{ __html: content }} />
}
