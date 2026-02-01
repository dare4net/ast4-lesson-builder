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
    <div className="w-full px-6 py-4 bg-white border-b-2 border-emerald-500/10">
      <div className="relative flex items-center gap-6">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-11 w-11 shrink-0 rounded-2xl text-emerald-600 active:scale-90 transition-transform hover:bg-emerald-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1 bg-emerald-50 rounded-full h-3.5 overflow-hidden border-2 border-emerald-100">
          <Progress
            value={progress}
            className="h-full transition-all duration-1000 ease-out bg-transparent"
            indicatorClassName={cn(
              "transition-all duration-1000 ease-out border-r-2 border-emerald-600/20 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
              progress < 100
                ? "bg-emerald-500"
                : "bg-emerald-400"
            )}
          />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Slide Progress</span>
            <span className="text-sm font-black text-emerald-600 tracking-tighter leading-none tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-100 transition-all duration-500 shadow-sm">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-50 duration-500 fill-emerald-500/10" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
