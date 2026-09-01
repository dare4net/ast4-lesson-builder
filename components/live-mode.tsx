"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Play, Clock, Star, Zap, AlertTriangle, Trophy, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { SoundEffects } from "@/lib/sound-effects"
import { LivePowerupBar } from "@/components/store/live-powerup-bar"
import { emitLiveTimerEvent, resolveLiveTimerEvent } from "@/lib/live-events"
import { useLivePowerups } from "@/context/live-powerups-context"
import { formatLiveTime } from "@/lib/live-start-info"

const LiveComponentMetaContext = React.createContext<{ componentId: string; type: string } | null>(null)

export function LiveComponentMetaProvider({
    componentId,
    type,
    children,
}: {
    componentId: string
    type: string
    children: React.ReactNode
}) {
    const value = React.useMemo(() => ({ componentId, type }), [componentId, type])
    return (
        <LiveComponentMetaContext.Provider value={value}>
            {children}
        </LiveComponentMetaContext.Provider>
    )
}

export interface LiveStartScreenProps {
    onStart: () => void
    label: string
    description?: string
    timeLimitSec?: number
    maxMark?: number
    maxStars?: number
    icon?: React.ReactNode
}

function StatPill({
    icon,
    label,
    value,
    accent = "slate",
}: {
    icon: React.ReactNode
    label: string
    value: string
    accent?: "green" | "sky" | "amber" | "rose" | "slate"
}) {
    const styles = {
        green: "border-[#58CC02]/30 bg-[#58CC02]/10 text-[#46A302]",
        sky: "border-[#1CB0F6]/30 bg-[#1CB0F6]/10 text-[#1899D6]",
        amber: "border-[#FF9600]/30 bg-[#FF9600]/10 text-[#E08600]",
        rose: "border-[#FF4B4B]/30 bg-[#FF4B4B]/10 text-[#EA2B2B]",
        slate: "border-slate-200 bg-slate-50 text-slate-700",
    }[accent]

    return (
        <div className={cn("flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-2.5 min-w-[5.5rem]", styles)}>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider opacity-80">
                {icon}
                <span>{label}</span>
            </div>
            <span className="text-lg font-extrabold tabular-nums leading-none">{value}</span>
        </div>
    )
}

export function LiveStartScreen({
    onStart,
    label,
    description,
    timeLimitSec = 10,
    maxMark,
    maxStars,
    icon,
}: LiveStartScreenProps) {
    const handleStart = () => {
        void SoundEffects.resumeAudio()
        onStart()
    }

    return (
        <div className="flex items-center justify-center p-4 sm:p-6 w-full h-full min-h-[24vh] flex-1">
            <div className="w-full max-w-lg rounded-3xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#58CC02] via-[#1CB0F6] to-[#FF9600]" />

                <div className="p-5 sm:p-6 space-y-5 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9600]/15 border border-[#FF9600]/30 text-[10px] font-black uppercase tracking-widest text-[#E08600]">
                        <Zap className="w-3 h-3" />
                        Live challenge
                    </div>

                    <div className="space-y-2">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#58CC02] border-b-4 border-[#46A302] flex items-center justify-center shadow-sm">
                            {icon || <Play className="h-7 w-7 text-white fill-white ml-0.5" />}
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{label}</h3>
                        <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-md mx-auto">
                            {description || "Answer before time runs out. Stars are awarded live."}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <StatPill
                            icon={<Timer className="w-3 h-3" />}
                            label="Time"
                            value={formatLiveTime(timeLimitSec)}
                            accent="sky"
                        />
                        {typeof maxMark === "number" && maxMark > 0 && (
                            <StatPill
                                icon={<Trophy className="w-3 h-3" />}
                                label="Mark"
                                value={`${maxMark}`}
                                accent="green"
                            />
                        )}
                        {typeof maxStars === "number" && maxStars > 0 && (
                            <StatPill
                                icon={<Star className="w-3 h-3 fill-current" />}
                                label="Up to"
                                value={`${maxStars}★`}
                                accent="amber"
                            />
                        )}
                    </div>

                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-3.5 text-left space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">How stars work</p>
                        <ul className="space-y-1.5 text-xs font-bold text-slate-600">
                            <li className="flex items-start gap-2">
                                <Clock className="w-3.5 h-3.5 text-[#1CB0F6] shrink-0 mt-0.5" />
                                <span>Timer starts when you tap <strong className="text-slate-800">Play</strong> — finish before {formatLiveTime(timeLimitSec)}.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Star className="w-3.5 h-3.5 text-[#FF9600] fill-[#FF9600] shrink-0 mt-0.5" />
                                <span>Earn stars for accuracy. Finish under half the time for <strong className="text-[#FF9600]">+2 speed bonus</strong> (under 75% for +1).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#FF4B4B] shrink-0 mt-0.5" />
                                <span>If time runs out: <strong className="text-[#FF4B4B]">−1 star timeout penalty</strong>.</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        type="button"
                        onClick={handleStart}
                        className="w-full h-12 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 text-white text-sm font-extrabold uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Play live
                    </button>
                </div>
            </div>
        </div>
    )
}

export function LiveTimer({
    isCompleted,
    duration = 10,
    onTimeout
}: {
    isCompleted: boolean
    duration?: number
    onTimeout?: () => void
}) {
    const [secondsRemaining, setSecondsRemaining] = useState(duration)
    const [frozen, setFrozen] = useState(false)
    const meta = React.useContext(LiveComponentMetaContext)
    const wasIncompleteAtStartRef = useRef(!isCompleted)
    const alreadyEmittedRef = useRef(false)
    const powerups = useLivePowerups()
    const lastTickSecondRef = useRef<number | null>(null)

    useEffect(() => {
        void SoundEffects.resumeAudio()
    }, [])

    const onTimeoutRef = useRef(onTimeout)
    useEffect(() => {
        onTimeoutRef.current = onTimeout
    }, [onTimeout])

    useEffect(() => {
        setSecondsRemaining(duration)
        lastTickSecondRef.current = null
    }, [duration])

    useEffect(() => {
        if (!powerups?.extraSeconds) return
        setSecondsRemaining((value) => value + powerups.extraSeconds)
        powerups.consumeExtra()
    }, [powerups?.extraSeconds, powerups])

    useEffect(() => {
        if (!powerups?.freezeSeconds || frozen) return
        setFrozen(true)
        const hold = powerups.freezeSeconds
        powerups.consumeFreeze()
        const timer = window.setTimeout(() => setFrozen(false), hold * 1000)
        return () => window.clearTimeout(timer)
    }, [powerups?.freezeSeconds, powerups, frozen])

    useEffect(() => {
        if (!powerups?.secondWind) return
        setSecondsRemaining(duration)
        alreadyEmittedRef.current = false
        lastTickSecondRef.current = null
        powerups.consumeSecondWind()
    }, [powerups?.secondWind, powerups, duration])

    useEffect(() => {
        if (isCompleted || frozen) return

        const interval = setInterval(() => {
            setSecondsRemaining(prev => (prev <= 1 ? 0 : prev - 1))
        }, 1000)

        return () => clearInterval(interval)
    }, [isCompleted, frozen])

    useEffect(() => {
        if (isCompleted || frozen || secondsRemaining <= 0) return
        if (lastTickSecondRef.current === secondsRemaining) return
        lastTickSecondRef.current = secondsRemaining
        void SoundEffects.play('timerTick')
    }, [secondsRemaining, isCompleted, frozen])

    useEffect(() => {
        const event = resolveLiveTimerEvent({
            alreadyEmitted: alreadyEmittedRef.current,
            wasIncompleteAtStart: wasIncompleteAtStartRef.current,
            isCompleted,
            secondsRemaining,
            durationSeconds: duration,
        })
        if (!event) return

        alreadyEmittedRef.current = true
        if (event.type === 'LIVE_TIMEOUT') {
            onTimeoutRef.current?.()
        }
        if (meta?.componentId && meta.type) {
            emitLiveTimerEvent(event, { componentId: meta.componentId, type: meta.type })
        }
    }, [secondsRemaining, isCompleted, duration, meta])

    const fmt = useCallback((s: number) => {
        const min = Math.floor(s / 60)
        const sec = s % 60
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }, [])

    const progress = duration > 0 ? Math.max(0, Math.min(1, secondsRemaining / duration)) : 0
    const isUrgent = !isCompleted && secondsRemaining <= 5 && secondsRemaining > 0
    const isWarning = !isCompleted && secondsRemaining <= 10 && secondsRemaining > 5

    return (
        <div className="inline-flex items-center gap-2 flex-wrap">
            <div
                className={cn(
                    "relative inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-2xl border-2 select-none overflow-hidden min-w-[7.5rem]",
                    isCompleted
                        ? "bg-[#58CC02]/15 border-[#58CC02]/40 text-[#46A302]"
                        : isUrgent
                            ? "bg-[#FF4B4B]/10 border-[#FF4B4B] text-[#EA2B2B] animate-pulse"
                            : isWarning
                                ? "bg-[#FF9600]/10 border-[#FF9600]/50 text-[#E08600]"
                                : "bg-white border-[#1CB0F6]/40 text-[#1899D6] shadow-sm"
                )}
            >
                {!isCompleted && (
                    <div
                        className={cn(
                            "absolute inset-y-0 left-0 transition-all duration-1000 ease-linear opacity-20",
                            isUrgent ? "bg-[#FF4B4B]" : isWarning ? "bg-[#FF9600]" : "bg-[#1CB0F6]"
                        )}
                        style={{ width: `${progress * 100}%` }}
                    />
                )}
                <Clock className={cn("h-4 w-4 shrink-0 relative z-10", isCompleted && "text-[#58CC02]")} />
                <span
                    aria-live="polite"
                    className={cn(
                        "relative z-10 font-mono font-extrabold text-sm tabular-nums leading-none tracking-wide",
                        isCompleted && "text-xs uppercase tracking-wider"
                    )}
                >
                    {isCompleted ? "Done!" : fmt(secondsRemaining)}
                </span>
            </div>
            {!isCompleted ? <LivePowerupBar visible /> : null}
        </div>
    )
}
