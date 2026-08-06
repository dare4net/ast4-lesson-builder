"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SoundEffects } from "@/lib/sound-effects"

interface LiveStartScreenProps {
    onStart: () => void
    label: string
    icon?: React.ReactNode
}

export function LiveStartScreen({ onStart, label, icon }: LiveStartScreenProps) {
    return (
        <div className="flex items-center justify-center p-6 w-full h-full min-h-[20vh] flex-1 bg-slate-50/50 rounded-xl border border-slate-100/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <div className="relative group cursor-pointer" onClick={onStart}>
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse group-hover:bg-emerald-500/30 transition-all" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform border-4 border-white/20">
                        <Play className="h-6 w-6 text-white fill-current ml-1" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">{label}</h3>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-xs mx-auto">
                        <span className="text-emerald-600 font-bold">LIVE LESSON ACTIVE.</span> Read each question carefully and answer before time runs out! Your score is being recorded. Good luck! 🎯
                    </p>
                </div>

                <Button
                    onClick={onStart}
                    variant="outline"
                    className="bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200 mt-2 font-bold tracking-wider text-[10px] uppercase shadow-sm"
                >
                    Start Live Challenge
                </Button>
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

    const onTimeoutRef = useRef(onTimeout)
    useEffect(() => {
        onTimeoutRef.current = onTimeout
    }, [onTimeout])

    useEffect(() => {
        setSecondsRemaining(duration)
    }, [duration])

    useEffect(() => {
        if (isCompleted) return

        const interval = setInterval(() => {
            setSecondsRemaining(prev => (prev <= 1 ? 0 : prev - 1))
        }, 1000)

        return () => clearInterval(interval)
    }, [isCompleted])

    // Play tick sound on every tick when active (and extra tick when urgent)
    useEffect(() => {
        if (!isCompleted && secondsRemaining > 0 && secondsRemaining < duration) {
            SoundEffects.play('timerTick')
        }
    }, [secondsRemaining, isCompleted, duration])

    useEffect(() => {
        if (secondsRemaining === 0 && !isCompleted) {
            onTimeoutRef.current?.()
        }
    }, [secondsRemaining, isCompleted])

    const fmt = (s: number) => {
        const min = Math.floor(s / 60)
        const sec = s % 60
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const isUrgent = !isCompleted && secondsRemaining <= 5 && secondsRemaining > 0

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 select-none",
            isCompleted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                : isUrgent
                    ? "bg-rose-500/15 border-rose-500/50 text-rose-600 animate-pulse shadow-rose-500/20"
                    : "bg-slate-900 border-slate-700 text-emerald-400 shadow-slate-900/40"
        )}>
            {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : isUrgent ? (
                <AlertCircle className="h-4 w-4 text-rose-500 animate-spin shrink-0" />
            ) : (
                <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
            )}

            <span className={cn(
                "font-mono font-black text-sm md:text-base tracking-widest leading-none",
                isCompleted && "text-xs font-bold text-emerald-600 tracking-wider",
                isUrgent && "text-rose-600 text-base"
            )}>
                {isCompleted ? "COMPLETED" : fmt(secondsRemaining)}
            </span>
        </div>
    )
}
