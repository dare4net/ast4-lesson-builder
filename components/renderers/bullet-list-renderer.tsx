import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTypingAnimation } from "@/hooks/use-typing-animation"
import { Play, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulletListRendererProps {
  items: string[]
  type?: "ordered" | "unordered"
  isEditing?: boolean
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
  isEditing = false,
  savedState,
  setComponentState,
  id = "list-renderer"
}: BulletListRendererProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const isPreviouslyCompleted = savedState?.status === "completed"

  const handleStart = () => {
    setHasStarted(true)
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

  if (!hasStarted && !isPreviouslyCompleted && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in fade-in duration-500">
        <button
          onClick={handleStart}
          className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:scale-105 transition-all w-full max-w-md cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-900 group-hover:scale-110 transition-transform">
            <Play className="h-4 w-4 fill-current ml-1" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Initialize List Sequence</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 my-4">
      <ListComponent className={cn(
        "space-y-4 px-4 mx-auto max-w-2xl", // Center align container
        type === "ordered" ? "list-none counter-reset-item" : "list-none"
      )}>
        {items.map((item, index) => {
          // If editing or previously completed, show all.
          // If running: show if index <= currentIndex
          const shouldShow = isEditing || isPreviouslyCompleted || hasStarted

          if (!shouldShow) return null

          // Active if it is the current one being typed
          const isActive = !isEditing && !isPreviouslyCompleted && index === currentIndex
          // render if we have reached this index
          const isVisible = isEditing || isPreviouslyCompleted || index <= currentIndex

          if (!isVisible) return null

          return (
            <li
              key={index}
              className={cn(
                "relative text-slate-700 font-medium leading-tight text-sm md:text-base tracking-tight transition-all duration-300 pl-8",
                "flex items-start justify-center text-center" // Center contents
              )}
            >
              <div className="flex flex-col items-center w-full">
                {/* Marker */}
                <span className="text-emerald-500 font-black text-xs mb-1 uppercase tracking-widest bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                  {type === "ordered" ? `Step ${index + 1}` : "•"}
                </span>

                {/* Content */}
                <span className="block mt-1">
                  {/* We only use AnimatedListItem if it's the active one. 
                       Once completed (index < currentIndex), we just show static text to save resources? 
                       Or keep it mounted. Keeping mounted is safer for layout stability. */}
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
                    // Static Fallback for editing/completed/already typed
                    <span>{item.replace(/<[^>]*>?/gm, "")}</span>
                  )}
                </span>
              </div>
            </li>
          )
        })}
      </ListComponent>

      {(isPreviouslyCompleted || (hasStarted && currentIndex === items.length - 1)) && !isEditing && (
        <div className="mt-6 flex justify-center animate-in slide-in-from-bottom-2 fade-in duration-700">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Sequence Verified</span>
          </div>
        </div>
      )}
    </div>
  )
}
