"use client"

interface BulletListRendererProps {
  items: string[]
  type?: "ordered" | "unordered"
  isEditing?: boolean
}

export function BulletListRenderer({ items, type = "unordered", isEditing = false }: BulletListRendererProps) {
  if (type === "ordered") {
    return (
      <ol className="list-decimal pl-5 space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    )
  }

  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}
