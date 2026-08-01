import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTypingAnimation } from "@/hooks/use-typing-animation"
import { Volume2, Pause, CheckCircle2 } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useAudioPlayer } from "@/hooks/use-audio-player"

interface ParagraphRendererProps {
  content: string
  audioUrl?: string
  align?: "left" | "center" | "right" | "justify"
  isEditing?: boolean
  isBuilder?: boolean
  autoPlayAudio?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
}

export function ParagraphRenderer({
  content,
  audioUrl,
  align = "center",
  isEditing = false,
  isBuilder = false,
  autoPlayAudio,
  savedState,
  setComponentState,
  id = "paragraph-renderer"
}: ParagraphRendererProps) {
  const [hasStarted, setHasStarted] = useState(true)
  const isPreviouslyCompleted = savedState?.status === "completed"
  const { isEnabled: isReadAloudEnabled, speak, isSpeaking: isTtsSpeaking } = useReadAloud()

  // Disable autoPlay in builder or editing mode unless explicitly enabled
  const shouldAutoPlay = (autoPlayAudio ?? (!isBuilder && !isEditing)) && isReadAloudEnabled
  const { isPlaying: isAudioPlaying, hasAudio, play: playAudio } = useAudioPlayer({
    audioUrl,
    autoPlay: shouldAutoPlay
  })

  const isSpeaking = isAudioPlaying || isTtsSpeaking

  const {
    displayedContent,
    isTyping,
    isPaused,
    isCompleted,
    showCursor,
    togglePause,
    fontSizeClass
  } = useTypingAnimation({
    content: content.replace(/<[^>]*>?/gm, ""),
    componentId: id,
    isEditing,
    alreadyCompleted: isPreviouslyCompleted,
    startDelay: 0,
    autoStart: true
  })

  useEffect(() => {
    if (isCompleted && !isPreviouslyCompleted && setComponentState) {
      setComponentState({ status: "completed" })
    }
  }, [isCompleted, isPreviouslyCompleted, setComponentState])

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasAudio) {
      playAudio()
    } else {
      speak(content)
    }
  }

  const finalAlign = "center"

  return (
    <div className={cn(
      "relative group/paragraph transition-all duration-500 flex flex-col my-4 items-center justify-center flex-1 w-full h-full min-h-[20vh]"
    )}>

      {/* Typing Content Box with Read Aloud Button */}
      <div
        onClick={togglePause}
        className={cn(
          "relative cursor-pointer select-none rounded-2xl p-6 bg-slate-50/80 border-2 border-slate-100 hover:border-emerald-500/30 transition-all shadow-sm max-w-4xl w-full",
          finalAlign === "center" ? "text-center" : "text-left"
        )}
      >
        <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Paragraph Content</span>
          <button
            onClick={handleSpeak}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold text-xs transition-all border border-emerald-500/30 active:scale-95 cursor-pointer"
            title="Read Aloud"
          >
            <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-emerald-500")} />
            <span className="text-[10px] uppercase tracking-wider">Read Aloud</span>
          </button>
        </div>

        <p className={cn(
          fontSizeClass,
          "font-medium text-slate-700 leading-relaxed tracking-wide"
        )}>
          {displayedContent}
          <span className={cn(
            "inline-block w-[0.1em] h-[0.8em] ml-[0.1em] bg-emerald-500 align-middle",
            showCursor ? "opacity-100" : "opacity-0"
          )} />
        </p>

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl">
            <Pause className="h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
        )}
      </div>

      {/* Completion Badge */}
      {isCompleted && !isEditing && (
        <div className="mt-4 flex animate-in slide-in-from-bottom-2 fade-in duration-700">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Keep it up! ✓</span>
          </div>
        </div>
      )}
    </div>
  )
}
