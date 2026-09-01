"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { defaultLiveTimeLimit } from "@/lib/live-mode-props"
import { cn } from "@/lib/utils"

interface LiveModeSettingsProps {
    componentType: string
    mode?: string
    timeLimit?: number
    onModeChange: (mode: "practice" | "live") => void
    onTimeLimitChange: (seconds: number) => void
    className?: string
}

function normalizeMode(mode?: string): "practice" | "live" {
    return mode === "live" ? "live" : "practice"
}

export function LiveModeSettings({
    componentType,
    mode,
    timeLimit,
    onModeChange,
    onTimeLimitChange,
    className,
}: LiveModeSettingsProps) {
    const normalizedMode = normalizeMode(mode)
    const isLive = normalizedMode === "live"
    const resolvedLimit = timeLimit ?? defaultLiveTimeLimit(componentType)

    const setMode = (next: "practice" | "live") => {
        if (next === normalizedMode) return
        onModeChange(next)
        if (next === "live" && (timeLimit === undefined || timeLimit === null)) {
            onTimeLimitChange(defaultLiveTimeLimit(componentType))
        }
    }

    return (
        <div className={cn("rounded-xl border border-slate-800 bg-slate-950/30 p-4 space-y-4", className)}>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live mode</p>
                <p className="text-[11px] text-slate-500 mt-1">
                    Live blocks show a pre-play briefing and countdown timer during the lesson.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</Label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/50 border border-slate-800">
                        <button
                            type="button"
                            onClick={() => setMode("practice")}
                            className={cn(
                                "h-10 rounded-lg text-xs font-bold transition-colors",
                                normalizedMode === "practice"
                                    ? "bg-[#58CC02] text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                            )}
                        >
                            Practice
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("live")}
                            className={cn(
                                "h-10 rounded-lg text-xs font-bold transition-colors",
                                normalizedMode === "live"
                                    ? "bg-[#58CC02] text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                            )}
                        >
                            Live
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Time limit (seconds)
                    </Label>
                    <Input
                        type="number"
                        min={15}
                        max={300}
                        step={5}
                        value={resolvedLimit}
                        disabled={!isLive}
                        onChange={(e) => {
                            const next = Number.parseInt(e.target.value, 10) || defaultLiveTimeLimit(componentType)
                            if (next === resolvedLimit) return
                            onTimeLimitChange(next)
                        }}
                        className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold disabled:opacity-50"
                    />
                </div>
            </div>

            {!isLive && (
                <p className="text-[10px] text-slate-600 font-medium">
                    Switch to Live to enable the timer and star scoring flow.
                </p>
            )}
        </div>
    )
}
