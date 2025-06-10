"use client"

import { cn } from "@/lib/utils"

interface ImageRendererProps {
  src: string
  alt: string
  caption?: string
  width?: string
  isEditing?: boolean
}

export function ImageRenderer({ src, alt, caption, width = "100%", isEditing = false }: ImageRendererProps) {
  return (
    <figure className="my-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border bg-muted transition-all hover:bg-muted/50",
          !isEditing && "animate-in fade-in-50"
        )}
        style={{ width }}
      >
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="rounded-lg w-full h-auto object-cover transition-transform hover:scale-[1.02]"
        />
      </div>

      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
