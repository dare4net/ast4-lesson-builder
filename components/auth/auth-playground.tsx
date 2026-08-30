'use client'

import type { ReactNode } from 'react'
import { Crown, Flame, Star, Timer, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

export function AuthPlayground({
    accent,
    compact = false,
}: {
    accent: string
    compact?: boolean
}) {
    const reduceMotion = useReducedMotion()
    const float = (delay: number, y = 8) => (reduceMotion ? undefined : {
        y: [0, -y, 0],
        transition: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' as const, delay },
    })

    if (compact) {
        return (
            <div className="flex items-center justify-center gap-2 py-2">
                <Chip color="#FF9600" icon={<Star className="w-3.5 h-3.5 fill-current" />} label="+5" />
                <Chip color={accent} icon={<Timer className="w-3.5 h-3.5" />} label="0:18" />
                <Chip color="#FFC800" icon={<Crown className="w-3.5 h-3.5 fill-current" />} label="Gold" />
            </div>
        )
    }

    return (
        <div className="relative h-full min-h-[420px] flex flex-col justify-between p-8 overflow-hidden">
            <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white/70">After-School Tech</p>
                <h2 className="mt-2 text-4xl font-black text-white tracking-tight leading-none">
                    Play lessons.<br />Earn stars.<br />Take gold.
                </h2>
                <p className="mt-3 text-sm font-semibold text-white/80 max-w-xs">
                    Live timers, pride boards, and a face that is yours. This is the run.
                </p>
            </div>

            <div className="relative h-56">
                <motion.div
                    className="absolute left-0 top-2"
                    animate={float(0, 10)}
                >
                    <PlayCard title="Live quiz" color={accent}>
                        <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            <span className="font-black tabular-nums">0:18</span>
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                    </PlayCard>
                </motion.div>
                <motion.div
                    className="absolute right-2 top-20"
                    animate={float(0.4, 12)}
                >
                    <PlayCard title="First stars" color="#FF9600">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="text-2xl font-black">+5</span>
                        </div>
                    </PlayCard>
                </motion.div>
                <motion.div
                    className="absolute left-8 bottom-2"
                    animate={float(0.8, 8)}
                >
                    <PlayCard title="Pride" color="#FFC800">
                        <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 fill-current" />
                            <span className="font-black">Gold on quizzes</span>
                        </div>
                    </PlayCard>
                </motion.div>
                <motion.div
                    className="absolute right-6 bottom-16"
                    animate={float(0.2, 6)}
                >
                    <div className="px-3 py-1.5 rounded-full bg-white text-[#FF4B4B] text-[11px] font-black inline-flex items-center gap-1.5 border-2 border-white/20">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        Day 3
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function Chip({ color, icon, label }: { color: string; icon: ReactNode; label: string }) {
    return (
        <span
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-[11px] font-black text-white"
            style={{ backgroundColor: color }}
        >
            {icon}
            {label}
        </span>
    )
}

function PlayCard({ title, color, children }: { title: string; color: string; children: ReactNode }) {
    return (
        <div className={cn('rounded-2xl bg-white p-3 shadow-lg min-w-[148px] border-b-4')} style={{ borderColor: color }}>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p>
            <div className="mt-1 font-black" style={{ color }}>{children}</div>
        </div>
    )
}
