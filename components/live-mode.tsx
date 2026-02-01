import { useState, useEffect } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
                        <span className="text-emerald-600 font-bold">LIVE MODE ACTIVE.</span> Navigation is disabled during the data stream. Please read carefully and answer within the time limit. Scores are recorded.
                    </p>
                </div>

                <Button
                    onClick={onStart}
                    variant="outline"
                    className="bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200 mt-2 font-bold tracking-wider text-[10px] uppercase shadow-sm"
                >
                    Initialize Stream
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

    // Sync state with prop if it changes significantly (e.g. init)
    useEffect(() => {
        setSecondsRemaining(duration)
    }, [duration])

    // Timer countdown effect
    useEffect(() => {
        if (isCompleted || secondsRemaining <= 0) return

        const interval = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isCompleted, secondsRemaining])

    // Separate effect to handle timeout callback
    useEffect(() => {
        if (secondsRemaining === 0 && !isCompleted && onTimeout) {
            onTimeout()
        }
    }, [secondsRemaining, isCompleted, onTimeout])

    const fmt = (s: number) => {
        const min = Math.floor(s / 60)
        const sec = s % 60
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    return (
        <div className={cn(
            "flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
            isCompleted
                ? "bg-emerald-100/50 text-emerald-700"
                : secondsRemaining <= 5
                    ? "bg-red-100/80 text-red-700 animate-pulse"
                    : "bg-rose-100/50 text-rose-700"
        )}>
            {isCompleted ? (
                <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            ) : (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
            )}

            <span className={cn(
                "text-[10px] font-mono font-bold tracking-widest",
                !isCompleted && secondsRemaining <= 5 && "scale-110"
            )}>
                {isCompleted ? "STREAM COMPLETE" : `LIVE ${fmt(secondsRemaining)}`}
            </span>
        </div>
    )
}
