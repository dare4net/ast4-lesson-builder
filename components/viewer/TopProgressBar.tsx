"use client"

import { CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TopProgressBarProps {
  progress: number
  isCompleted: boolean
}

export function TopProgressBar({ progress, isCompleted }: TopProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-background/80 backdrop-blur-sm border-b">
      <div className="relative max-w-screen-xl mx-auto flex items-center gap-2">
        <div className="flex-1">
          <Progress 
            value={progress} 
            className="h-2 transition-all duration-300"
            // Start with yellow, transition to green as progress increases
            indicatorClassName={cn(
              "transition-colors duration-300",
              progress < 100 
                ? "bg-yellow-400" 
                : "bg-[#4CAF50]"
            )}
          />
        </div>
        <div className="w-6 h-6 flex items-center justify-center">
          {isCompleted && (
            <CheckCircle2 className="w-5 h-5 text-[#4CAF50] animate-in fade-in duration-300" />
          )}
        </div>
      </div>
    </div>
  )
}
