"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { useScoring } from "@/context/scoring-context"
import { Award, Star, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export function ScoreDisplay({ className }: { className?: string }) {
    const { currentScore, totalScore, percentage, isPerfect } = useScoring()

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-2 rounded-full transition-colors",
                        isPerfect ? "bg-yellow-100 text-yellow-600" : "bg-primary/10 text-primary"
                    )}>
                        {isPerfect ? <Trophy className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-none">Lesson Progress</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {currentScore} / {totalScore} points
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={cn(
                        "text-2xl font-bold tracking-tighter transition-all",
                        isPerfect && "text-yellow-600 scale-110"
                    )}>
                        {percentage}%
                    </p>
                </div>
            </div>

            <div className="relative pt-1">
                <Progress
                    value={percentage}
                    className={cn(
                        "h-2",
                        isPerfect && "[&>div]:bg-yellow-400"
                    )}
                />
                {isPerfect && (
                    <div className="absolute -top-1 right-0 animate-bounce">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                )}
            </div>

            {isPerfect && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-xs font-medium text-yellow-800 text-center flex items-center justify-center gap-1">
                        Perfect Score! You're a rockstar! 🎉
                    </p>
                </div>
            )}
        </div>
    )
}
