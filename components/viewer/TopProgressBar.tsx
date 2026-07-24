"use client"

import { CheckCircle2, Menu } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopProgressBarProps {
  progress: number
  isCompleted: boolean
  onMenuClick?: () => void
}

export function TopProgressBar({ progress, isCompleted, onMenuClick }: TopProgressBarProps) {
  return (
    <div className="w-full px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="relative flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9 shrink-0 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <Progress
            value={progress}
            className="h-full transition-all duration-700 ease-out bg-transparent"
            indicatorClassName={cn(
              "transition-all duration-700 ease-out",
              progress < 100
                ? "bg-green-500"
                : "bg-green-600"
            )}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mb-0.5">Lesson Progress</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
