"use client"

import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACTION_LABELS } from "@/lib/action-labels"

export function BestAttemptBadge({
    bestAttemptCount,
    attemptCount,
}: {
    bestAttemptCount: number | null
    attemptCount: number
}) {
    const bestLabel = bestAttemptCount === 1
        ? "1st try"
        : bestAttemptCount != null
            ? `${ACTION_LABELS.bestAttempt} ${bestAttemptCount}`
            : `${ACTION_LABELS.bestAttempt} —`

    return (
        <div
            className="flex items-center gap-1.5"
            aria-live="polite"
            aria-atomic="true"
            aria-label={
                bestAttemptCount != null
                    ? `Best attempt ${bestAttemptCount}${attemptCount > 0 ? `, this try ${attemptCount}` : ""}`
                    : "No best attempt yet"
            }
        >
            <span
                className={cn(
                    "inline-flex items-center gap-1 min-h-7 px-2 rounded-lg border-2 text-[10px] font-black uppercase tracking-wider tabular-nums",
                    bestAttemptCount === 1
                        ? "bg-[#58CC02]/10 border-[#58CC02]/30 text-[#3B8C00]"
                        : bestAttemptCount != null
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                )}
            >
                <Target className="w-3 h-3" />
                {bestLabel}
            </span>
            {attemptCount > 0 && attemptCount !== bestAttemptCount && (
                <span className="inline-flex items-center min-h-7 px-2 rounded-lg border-2 border-slate-200 bg-white text-[10px] font-black uppercase tracking-wider text-slate-500 tabular-nums">
                    Try {attemptCount}
                </span>
            )}
        </div>
    )
}
