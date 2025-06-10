"use client"

import { cn } from "@/lib/utils"

interface BulletListRendererProps {
  items: string[]
  type?: "ordered" | "unordered"
  isEditing?: boolean
}

export function BulletListRenderer({ items, type = "unordered", isEditing = false }: BulletListRendererProps) {
  const listClasses = cn(
    "my-6 ml-6 space-y-2 [&>li]:mt-2",
    type === "ordered" ? "[list-style-type:decimal]" : "[list-style-type:disc]"
  )

  const ListComponent = type === "ordered" ? "ol" : "ul"

  return (
    <ListComponent className={listClasses}>
      {items.map((item, index) => (
        <li
          key={index}
          className="text-muted-foreground marker:text-foreground"
          dangerouslySetInnerHTML={{ __html: item }}
        />
      ))}
    </ListComponent>
  )
}
