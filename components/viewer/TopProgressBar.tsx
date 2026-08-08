"use client"

import { CheckCircle2, Menu } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopProgressBarProps {
  progress: number
  isCompleted: boolean
  completedSlides?: number
  totalSlides?: number
  onMenuClick?: () => void
}

export function TopProgressBar({
  progress,
  isCompleted,
  completedSlides = 0,
  totalSlides = 0,
  onMenuClick
}: TopProgressBarProps) {
  return (
    <div className="w-full px-5 py-3.5 bg-slate-900 border-b border-slate-800 shadow-md text-white">
      <div className="relative flex items-center gap-4 max-w-7xl mx-auto">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9 shrink-0 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* High Prominence Glowing Progress Track */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
                Lesson Progress
              </span>
              {/* % shown inline on mobile, next to label */}
              <span className="sm:hidden text-[10px] font-black text-white tabular-nums">{Math.round(progress)}%</span>
              {/* Badge: hidden on mobile */}
              {totalSlides > 0 && (
                <span className="hidden sm:inline text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  {completedSlides} of {totalSlides} Slides Completed
                </span>
              )}
            </div>
            {/* % on desktop only, right-aligned */}
            <span className="hidden sm:block text-xs font-black text-white tabular-nums tracking-wide">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="relative w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800/80 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(52,211,153,0.5)] relative overflow-hidden"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            >
              {/* Shimmer animation highlight overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
