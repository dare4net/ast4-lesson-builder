"use client"

import type { ReactNode } from "react"
import { CheckCircle2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopProgressBarProps {
  progress: number
  isCompleted: boolean
  completedSlides?: number
  totalSlides?: number
  currentSlide?: number
  score?: number
  lessonTitle?: string
  onMenuClick?: () => void
  rightContent?: ReactNode
}

export function TopProgressBar({
  progress,
  isCompleted,
  completedSlides = 0,
  totalSlides = 0,
  currentSlide,
  score,
  lessonTitle,
  onMenuClick,
  rightContent
}: TopProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))
  const percentLabel = `${Math.round(clamped)}%`

  const progressTrack = (className?: string) => (
    <div
      className={cn("relative w-full bg-slate-100 rounded-full h-2.5 md:h-3 overflow-hidden border border-slate-200", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#58CC02] via-[#1CB0F6] to-[#CE82FF] transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )

  return (
    <div className="relative w-full px-3 sm:px-5 py-2.5 sm:py-3 bg-white text-slate-800 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.18)]">
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <span className="sr-only" aria-live="polite" aria-atomic="true">{percentLabel}</span>

      <div className="relative flex flex-wrap items-center gap-x-2 gap-y-2 max-w-7xl mx-auto md:flex-nowrap md:gap-3">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open lesson menu"
            onClick={onMenuClick}
            className="min-h-11 min-w-11 shrink-0 rounded-xl text-[#1CB0F6] hover:text-white hover:bg-[#1CB0F6] border-2 border-[#1CB0F6]/30 bg-[#1CB0F6]/10"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-center gap-2 px-0.5">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-800 truncate leading-tight">
                {lessonTitle || "Progress"}
              </p>
              {totalSlides > 0 && (
                <p className="md:hidden text-[10px] font-extrabold text-slate-400 tabular-nums leading-tight mt-0.5">
                  {typeof currentSlide === "number" ? `Slide ${currentSlide}/${totalSlides}` : `${completedSlides}/${totalSlides} done`}
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {totalSlides > 0 && (
                <span className="text-[10px] font-extrabold text-[#58CC02] bg-[#58CC02]/10 px-2 py-0.5 rounded-full border border-[#58CC02]/20">
                  {completedSlides}/{totalSlides} done
                </span>
              )}
              {typeof currentSlide === "number" && totalSlides > 0 && (
                <span className="text-[10px] font-extrabold text-[#1CB0F6] bg-[#1CB0F6]/10 px-2 py-0.5 rounded-full border border-[#1CB0F6]/20 tabular-nums">
                  Slide {currentSlide}/{totalSlides}
                </span>
              )}
              {typeof score === "number" && (
                <span className="text-[10px] font-extrabold text-[#FF9600] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 tabular-nums">
                  {score} pts
                </span>
              )}
              <span className="text-xs font-black text-[#58CC02] tabular-nums">{percentLabel}</span>
            </div>
          </div>
          <div className="hidden md:block mt-1.5">
            {progressTrack()}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 md:gap-2 md:pl-2 md:border-l-2 md:border-slate-100">
          {rightContent}
          <div className={cn(
            "hidden md:flex w-9 h-9 items-center justify-center rounded-xl border-2",
            isCompleted
              ? "bg-[#58CC02] border-[#3B8C00]"
              : "bg-amber-50 border-amber-200"
          )}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF9600]" />
            )}
          </div>
        </div>

        <div className="w-full flex items-center gap-2 md:hidden">
          {progressTrack("flex-1")}
          <span className="text-xs font-black text-[#58CC02] tabular-nums shrink-0">{percentLabel}</span>
        </div>
      </div>
    </div>
  )
}
