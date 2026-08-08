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
    <figure className="my-2 group/image space-y-3 animate-in fade-in duration-700 w-full h-full flex flex-col items-center justify-center overflow-hidden p-2">
      <div
        className={cn(
          "w-full max-h-[55vh] flex justify-center items-center overflow-hidden transition-all duration-500",
          !isAcknowledged && "blur-md grayscale opacity-30",
          isAcknowledged && "animate-in fade-in slide-in-from-bottom-2 duration-500"
        )}
        style={{ width }}
      >
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="max-h-[52vh] max-w-full w-auto h-auto object-contain rounded-2xl shadow-md transition-transform duration-700 group-hover/image:scale-[1.01]"
        />
      </div>

      {!isAcknowledged && !isEditing && (
        <div className="flex justify-center flex-col items-center gap-2 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tap to reveal the image</p>
          <button
            onClick={handleAcknowledge}
            className="group relative px-5 py-2 bg-[#58CC02] text-white rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:bg-[#46a302] hover:scale-105 active:scale-95 transition-all border-b-4 border-[#3B8C00] active:border-b-0 active:translate-y-[2px]"
          >
            <span>Show Image</span>
          </button>
        </div>
      )}

      {isAcknowledged && caption && (
        <figcaption className="text-center mt-2 animate-in fade-in slide-in-from-top-2 duration-700 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Image Caption</span>
          <span className="text-slate-900 text-sm font-black italic tracking-tight">
            {caption}
          </span>
        </figcaption>
      )}
    </figure>
  )
}
