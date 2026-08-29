"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { ListenButton } from "@/components/renderers/listen-button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { playReveal } from "@/lib/sound-effects"

interface ImageRendererProps {
  src: string
  alt: string
  caption?: string
  audioUrl?: string
  width?: string
  isEditing?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
}

export function ImageRenderer({ src, alt, caption, audioUrl, width = "100%", isEditing = false, savedState, setComponentState }: ImageRendererProps) {
  const { playFeedback } = useFeedback()
  const { isPlaying, hasAudio, play: playAudio } = useAudioPlayer({ audioUrl })
  const [localRevealed, setLocalRevealed] = useState(false)

  const isAcknowledged = savedState?.status === "completed"
  // Builder/editor always shows the image; preview-without-state uses local reveal
  const isRevealed = isEditing || isAcknowledged || localRevealed

  const handleAcknowledge = () => {
    void playFeedback("click", { sound: true, animation: false })
    playReveal()
    if (setComponentState) {
      setComponentState({ status: "completed" })
    } else {
      setLocalRevealed(true)
    }
  }

  const handleListen = () => {
    playAudio()
  }

  return (
    <figure className="group/image space-y-3 animate-in fade-in duration-700 w-full h-full flex-1 flex flex-col items-center justify-center overflow-hidden p-0 min-h-0">
      {hasAudio && (
        <div className="w-full max-w-3xl flex justify-end shrink-0 px-2">
          <ListenButton
            hasAudio={hasAudio}
            isPlaying={isPlaying}
            onClick={handleListen}
            className="bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-none shadow-none"
            iconClassName={cn(isPlaying && "text-emerald-600")}
          />
        </div>
      )}

      <div
        className={cn(
          "relative w-full flex-1 min-h-0 flex justify-center items-center overflow-hidden transition-all duration-500",
          !isRevealed && "blur-md grayscale opacity-30",
          isRevealed && "animate-in fade-in slide-in-from-bottom-2 duration-500"
        )}
        style={{ width }}
      >
        <OptimizedImage
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-contain rounded-2xl transition-transform duration-700 group-hover/image:scale-[1.01]"
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </div>

      {!isRevealed && !isEditing && (
        <div className="flex justify-center flex-col items-center gap-2 shrink-0 pt-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tap to reveal the image</p>
          <button
            onClick={handleAcknowledge}
            className="group relative min-h-11 px-6 py-2.5 bg-[#58CC02] text-white rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:bg-[#46a302] hover:scale-105 active:scale-95 transition-all border-b-4 border-[#3B8C00] active:border-b-0 active:translate-y-[2px]"
          >
            <span>Show Image</span>
          </button>
        </div>
      )}

      {isRevealed && caption && (
        <figcaption className="text-center mt-1 animate-in fade-in slide-in-from-top-2 duration-700 shrink-0">
          <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-tight italic">
            {caption}
          </span>
        </figcaption>
      )}
    </figure>
  )
}
