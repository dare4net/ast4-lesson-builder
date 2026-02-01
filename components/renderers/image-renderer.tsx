"use client"

import { cn } from "@/lib/utils"

interface ImageRendererProps {
  src: string
  alt: string
  caption?: string
  width?: string
  isEditing?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
}

export function ImageRenderer({ src, alt, caption, width = "100%", isEditing = false, savedState, setComponentState }: ImageRendererProps) {
  const isAcknowledged = savedState?.status === "completed"

  const handleAcknowledge = () => {
    if (setComponentState) {
      setComponentState({ status: "completed" })
    }
  }

  return (
    <figure className="my-12 group/image space-y-8 animate-in fade-in duration-700">
      <div
        className={cn(
          "w-full transition-all duration-500",
          !isAcknowledged && "blur-md grayscale opacity-30",
          isAcknowledged && "animate-in fade-in slide-in-from-bottom-2 duration-500"
        )}
        style={{ width }}
      >
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover/image:scale-[1.02]"
        />
      </div>

      {!isAcknowledged && !isEditing && (
        <div className="flex justify-center flex-col items-center gap-4">
          <p className="text-[10px] font-black text-emerald-600/40 uppercase tracking-[0.3em]">Visual Data Stream Locked</p>
          <button
            onClick={handleAcknowledge}
            className="group relative px-5 py-2 bg-emerald-600 text-white rounded font-black uppercase text-[8px] tracking-[0.2em] shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Synchronize Visuals</span>
            <div className="absolute inset-0 bg-white/10 rounded animate-pulse" />
          </button>
        </div>
      )}

      {isAcknowledged && caption && (
        <figcaption className="text-center mt-6 animate-in fade-in slide-in-from-top-2 duration-700">
          <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.3em] block mb-2">Visual Asset Manifest</span>
          <span className="text-slate-900 text-base font-black italic tracking-tight">
            "{caption}"
          </span>
        </figcaption>
      )}
    </figure>
  )
}
