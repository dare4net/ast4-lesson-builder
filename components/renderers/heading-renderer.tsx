"use client"

import { cn } from "@/lib/utils"

interface HeadingRendererProps {
  content: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  align?: "left" | "center" | "right"
  isEditing?: boolean
}

export function HeadingRenderer({ content, level = 2, align = "left", isEditing = false }: HeadingRendererProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  const sizeClasses = {
    1: "text-4xl font-extrabold tracking-tight",
    2: "text-3xl font-bold tracking-tight",
    3: "text-2xl font-bold",
    4: "text-xl font-semibold",
    5: "text-lg font-semibold",
    6: "text-base font-semibold",
  }

  const gradientClass = level <= 2 ? "bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent" : ""

  return (
    <HeadingTag
      className={cn(
        sizeClasses[level],
        alignmentClasses[align],
        gradientClass,
        "scroll-m-20"
      )}
    >
      {content}
    </HeadingTag>
  )
}
