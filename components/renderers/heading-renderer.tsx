import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTypingAnimation } from "@/hooks/use-typing-animation"
import { Play, Pause, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeadingRendererProps {
  content: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  align?: "left" | "center" | "right"
  isEditing?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
}

export function HeadingRenderer({
  content,
  level = 2,
  align = "center", // Default to center as requested
  isEditing = false,
  savedState,
  setComponentState,
  id = "heading-renderer"
}: HeadingRendererProps) {
  const [hasStarted, setHasStarted] = useState(false)

  const isPreviouslyCompleted = savedState?.status === "completed"

  // If editing, always show content fully
  // If previously completed, consider it "started" and "done" (hook handles "alreadyCompleted")

  const {
    displayedContent,
    isTyping,
    isPaused,
    isCompleted,
    showCursor,
    togglePause,
    fontSizeClass
  } = useTypingAnimation({
    content,
    componentId: id,
    isEditing,
    alreadyCompleted: isPreviouslyCompleted,
    // Only start typing if we have explicitly started or it's not previously completed but we triggered it? 
    // Actually hook starts on mount. We need to conditionally render the hook or control it?
    // The hook has no "autoStart" prop, but we can just inhibit it by not rendering it? 
    // No, that remounts. 
    // Let's assume we render the "TypingView" only when hasStarted is true.
    startDelay: 0,
    autoStart: hasStarted
  })

  // Sync completion to parent
  useEffect(() => {
    if (isCompleted && !isPreviouslyCompleted && setComponentState) {
      setComponentState({ status: "completed" })
    }
  }, [isCompleted, isPreviouslyCompleted, setComponentState])

  const handleStart = () => {
    setHasStarted(true)
  }

  // Override alignment to center as requested, unless specifically set otherwise? 
  // User said "ask Mae them center aligned". Strong preference.
  const finalAlign = "center"

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  // Render Logic:
  // 1. Editing: Just show static. (Handled by hook isEditing flag -> returns full text immediately)
  // 2. Previously Completed: Show full text immediately. (Handled by hook alreadyCompleted -> returns full text immediately)
  // 3. Not Started: Show "Click to View".
  // 4. Started: Show Typing.

  if (!hasStarted && !isPreviouslyCompleted && !isEditing) {
    return (
      <div className="flex items-center justify-center p-4 w-full h-full min-h-[20vh] flex-1">
        <button
          onClick={handleStart}
          className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:scale-105 transition-all w-full max-w-md cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-900 group-hover:scale-110 transition-transform">
            <Play className="h-5 w-5 fill-current ml-1" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Initialize Header Stream</span>
        </button>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative group/heading transition-all duration-500 flex flex-col",
      // Force full height/centering
      "flex-1 w-full h-full min-h-[20vh] justify-center",
      finalAlign === "center" ? "items-center" : "items-start",
      level <= 2 && "mb-6"
    )}>

      {/* Typing Content */}
      <div
        onClick={togglePause}
        className={cn(
          "relative cursor-pointer select-none rounded-xl p-2 -m-2 transition-colors hover:bg-slate-100/50",
          finalAlign === "center" ? "text-center" : "text-left"
        )}
      >
        <HeadingTag
          className={cn(
            fontSizeClass, // Dynamic sizing from hook
            "font-black tracking-tight text-slate-900 leading-tight",
            level === 1 && "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
          )}
        >
          {displayedContent}
          <span className={cn(
            "inline-block w-[0.1em] h-[0.8em] ml-[0.1em] bg-emerald-500 align-middle",
            showCursor ? "opacity-100" : "opacity-0"
          )} />
        </HeadingTag>

        {/* Pause Indicator Overlay */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <Pause className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
        )}
      </div>

      {/* Completion Badge */}
      {isCompleted && !isEditing && (
        <div className="mt-4 flex animate-in slide-in-from-bottom-2 fade-in duration-700">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Header Verified</span>
          </div>
        </div>
      )}
    </div>
  )
}
