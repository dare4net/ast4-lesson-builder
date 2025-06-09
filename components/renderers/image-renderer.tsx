"use client"

interface ImageRendererProps {
  src: string
  alt: string
  caption?: string
  width?: string
  isEditing?: boolean
}

export function ImageRenderer({ src, alt, caption, width = "100%", isEditing = false }: ImageRendererProps) {
  return (
    <figure className="my-4">
      <div className="relative" style={{ width }}>
        <img src={src || "/placeholder.svg"} alt={alt} className="rounded-md w-full h-auto" />
      </div>

      {caption && <figcaption className="text-center text-sm text-muted-foreground mt-2">{caption}</figcaption>}
    </figure>
  )
}
