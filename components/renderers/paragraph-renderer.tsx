import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTypingAnimation } from "@/hooks/use-typing-animation"
import { Play, Pause, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ParagraphRendererProps {
  content: string
  align?: "left" | "center" | "right" | "justify"
  isEditing?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
}

export function ParagraphRenderer({
  content,
  align = "center",
  isEditing = false,
  savedState,
  setComponentState,
  id = "paragraph-renderer"
}: ParagraphRendererProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const isPreviouslyCompleted = savedState?.status === "completed"

  const {
    displayedContent,
    isTyping,
    isPaused,
    isCompleted,
    showCursor,
    togglePause,
    fontSizeClass
  } = useTypingAnimation({
    content: content.replace(/<[^>]*>?/gm, ""), // Strip HTML for typing simulation? Or handle HTML? 
    // Paragraph content often has HTML (bold, italic). 
    // Typing HTML raw is bad.
    // If we want to support Rich Text typing, it's very complex. 
    // For now, we might strip tags for the animation or use a smarter parser. 
    // Given "dramatic typing", pure text is safer. 
    // However, user might lose formatting.
    // Compromise: We type the TEXT content, but render standard HTML at the end?
    // Or, we assume simple text for these "dramatic" paragraphs.
    // Let's type plain text for the animation effect, then switch to HTML if needed?
    // Or just dangerouslySetInnerHTML with the partial string? (Risky due to unclosed tags).
    // Let's assume plain text typing for the dramatic effect as priority.
    componentId: id,
    isEditing,
    alreadyCompleted: isPreviouslyCompleted,
    startDelay: 0,
    autoStart: hasStarted
  })

  useEffect(() => {
    if (isCompleted && !isPreviouslyCompleted && setComponentState) {
      setComponentState({ status: "completed" })
    }
  }, [isCompleted, isPreviouslyCompleted, setComponentState])

  const handleStart = () => {
    setHasStarted(true)
  }

  const finalAlign = "center"

  if (!hasStarted && !isPreviouslyCompleted && !isEditing) {
    return (
      <div className="flex items-center justify-center p-4 w-full h-full min-h-[20vh] flex-1">
        <Button
          onClick={() => setHasStarted(true)}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/50"
        >
          <Play className="w-4 h-4 mr-2" />
          Initialize Content
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative group/paragraph transition-all duration-500 flex flex-col my-4",
      // Force full height/centering
      "flex-1 w-full h-full min-h-[20vh] justify-center",
      finalAlign === "center" ? "items-center" : "items-start"
    )}>

      {/* Typing Content */}
      <div
        onClick={togglePause}
        className={cn(
          "relative cursor-pointer select-none rounded-xl p-3 -m-3 transition-colors hover:bg-slate-100/50 max-w-4xl",
          finalAlign === "center" ? "text-center" : "text-left"
        )}
      >
        <p className={cn(
          fontSizeClass,
          "font-medium text-slate-700 leading-relaxed tracking-wide"
        )}>
          {/* If completed, we could switch to dangerouslySetInnerHTML to restore formatting if we have the original HTML available? 
              But for now, consistency is key. */}
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
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Data Stream Verified</span>
          </div>
        </div>
      )}
    </div>
  )
}
