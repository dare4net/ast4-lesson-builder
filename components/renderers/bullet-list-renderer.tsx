import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTypingAnimation } from "@/hooks/use-typing-animation"
import { CheckCircle2 } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { ListenButton } from "@/components/renderers/listen-button"

interface BulletListRendererProps {
  items: string[]
  type?: "ordered" | "unordered"
  audioUrl?: string
  isEditing?: boolean
  isBuilder?: boolean
  autoPlayAudio?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
}

const AnimatedListItem = ({
  item,
  index,
  isActive,
  onComplete,
  componentId,
  isPreviouslyCompleted
}: {
  item: string,
  index: number,
  isActive: boolean,
  onComplete: () => void,
  componentId: string,
  isPreviouslyCompleted: boolean
}) => {
  const {
    displayedContent,
    showCursor,
    isCompleted
  } = useTypingAnimation({
    content: item.replace(/<[^>]*>?/gm, ""), // Strip HTML
    componentId: `${componentId}-item-${index}`,
    // Only start if active and not previously completed
    // Hook auto-starts on mount, so we only mount/render this component or pass a flag?
    // Actually the hook starts if component mounts. 
    // But we are rendering all items. We need a way to delay start.
    // The previous hook doesn't support "wait until".
    // Workaround: We only render the *Hook* usage when active.
    // Or we modify hook? 
    // Let's assume we render "static hidden" until active?
    // Actually, simple way: Only render the AnimatedListItem when it's its turn or passed.
    // But we want to see the list structure?
    // Let's just render them one by one.
    isEditing: false, // handled by parent
    alreadyCompleted: isPreviouslyCompleted || (!isActive && false), // False logic here... 
    // Wait, if not active and not prev completed, we shouldn't start.
    // But the hook starts on mount.
    // I should have added `autoStart` to hook. 
    // Since I can't easily change the hook right now without context switch, 
    // I will assume we render this component ONLY when it is active or completed.
  })

  // When complete, notify parent
  useEffect(() => {
    if (isCompleted && isActive) {
      onComplete()
    }
  }, [isCompleted, isActive, onComplete])

  return (
    <span className="relative">
      {displayedContent}
      {isActive && !isCompleted && (
        <span className={cn(
          "inline-block w-[0.1em] h-[0.8em] ml-[0.1em] bg-emerald-500 align-middle",
          showCursor ? "opacity-100" : "opacity-0"
        )} />
      )}
    </span>
  )
}

export function BulletListRenderer({
  items,
  type = "unordered",
  audioUrl,
  isEditing = false,
  isBuilder = false,
  autoPlayAudio,
  savedState,
  setComponentState,
  id = "list-renderer"
}: BulletListRendererProps) {
  const [hasStarted, setHasStarted] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isPreviouslyCompleted = savedState?.status === "completed"
  const shouldAutoPlay = (autoPlayAudio ?? (!isBuilder && !isEditing))
  const { isPlaying, hasAudio, play: playAudio } = useAudioPlayer({
    audioUrl,
    autoPlay: shouldAutoPlay && !!audioUrl
  })

  const handleSpeak = () => {
    playAudio()
  }

  const handleItemComplete = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // All done
      if (setComponentState && !isPreviouslyCompleted) {
        setComponentState({ status: "completed" })
      }
    }
  }

  const ListComponent = type === "ordered" ? "ol" : "ul"

  return (
    <div className="space-y-4 my-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between px-4">
        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">List Items</span>
        {hasAudio && (
          <ListenButton
            hasAudio={hasAudio}
            isPlaying={isPlaying}
            onClick={handleSpeak}
            className="rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
            iconClassName={cn(isPlaying && "text-emerald-500")}
            label="Listen"
          />
        )}
      </div>

      <ListComponent className={cn(
        "space-y-3 px-2 mx-auto max-w-2xl text-left",
        type === "ordered" ? "list-none counter-reset-item" : "list-none"
      )}>
        {items.map((item, index) => {
          const shouldShow = isEditing || isPreviouslyCompleted || hasStarted
          if (!shouldShow) return null

          const isActive = !isEditing && !isPreviouslyCompleted && index === currentIndex
          const isVisible = isEditing || isPreviouslyCompleted || index <= currentIndex
          if (!isVisible) return null

          return (
            <li
              key={index}
              className="relative text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-sm md:text-base flex items-start gap-3 transition-all duration-300 group"
            >
              {/* Marker Badge */}
              <div className="shrink-0 flex items-center justify-center min-w-[28px] h-7 mt-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs px-2 shadow-xs">
                {type === "ordered" ? `${index + 1}` : "•"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                {(isActive || (index < currentIndex && !isPreviouslyCompleted && !isEditing)) ? (
                  <AnimatedListItem
                    item={item}
                    index={index}
                    isActive={isActive}
                    onComplete={handleItemComplete}
                    componentId={id!}
                    isPreviouslyCompleted={isPreviouslyCompleted}
                  />
                ) : (
                  <span>{item.replace(/<[^>]*>?/gm, "")}</span>
                )}
              </div>
            </li>
          )
        })}
      </ListComponent>

      {(isPreviouslyCompleted || (hasStarted && currentIndex === items.length - 1)) && !isEditing && (
        <div className="mt-6 flex justify-center animate-in slide-in-from-bottom-2 fade-in duration-700">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">All done! ✓</span>
          </div>
        </div>
      )}
    </div>
  )
}
