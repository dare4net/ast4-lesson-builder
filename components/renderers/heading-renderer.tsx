"use client"

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
    1: "text-4xl font-extrabold",
    2: "text-3xl font-bold",
    3: "text-2xl font-bold",
    4: "text-xl font-semibold",
    5: "text-lg font-semibold",
    6: "text-base font-semibold",
  }

  return <HeadingTag className={`${sizeClasses[level]} ${alignmentClasses[align]}`}>{content}</HeadingTag>
}
