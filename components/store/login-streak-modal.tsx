'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

type StreakPayload = {
    loginStreak?: number
    streakContinued?: boolean
    streakBroken?: boolean
    streakAlreadyCounted?: boolean
    streakUsedFreeze?: number
}

const MILESTONES: Record<number, string> = {
    3: 'You are on fire.',
    7: 'A whole week. Unstoppable.',
    14: 'Two weeks. The podium noticed.',
    30: 'A month of showing up.',
}

export function LoginStreakModal({ stats }: { stats?: StreakPayload | null }) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!stats || stats.streakAlreadyCounted) return
        if (!stats.streakContinued && !stats.streakBroken) return
        setOpen(true)
        const timer = window.setTimeout(() => setOpen(false), 5200)
        return () => window.clearTimeout(timer)
    }, [stats?.loginStreak, stats?.streakAlreadyCounted, stats?.streakContinued, stats?.streakBroken])

    if (!open || !stats) return null

    const streak = Number(stats.loginStreak) || 1
    const broken = Boolean(stats.streakBroken)
    const freeze = Number(stats.streakUsedFreeze) || 0
    const line = broken
        ? 'New streak. Protect it this time.'
        : (MILESTONES[streak] || 'Come back tomorrow. Do not break this.')

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-4">
            <button type="button" className="absolute inset-0" aria-label="Dismiss streak" onClick={() => setOpen(false)} />
            <div className="relative w-full max-w-sm rounded-[2rem] border-4 border-[#FF9600] bg-gradient-to-b from-[#FF9600] to-[#FF4B4B] p-8 text-center text-white shadow-2xl">
                <div className={cn('mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/15', !broken && 'animate-bounce')}>
                    <Flame className="h-14 w-14 fill-white text-white" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/80">
                    {broken ? 'Streak reset' : freeze ? 'Freeze saved you' : 'Daily streak'}
                </p>
                <p className="mt-2 text-6xl font-black tabular-nums leading-none">{streak}</p>
                <p className="mt-1 text-lg font-extrabold uppercase tracking-wider">
                    {streak === 1 ? 'Day' : 'Day streak'}
                </p>
                <p className="mt-4 text-sm font-bold text-white/90">{line}</p>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-6 h-11 w-full rounded-2xl bg-white text-sm font-black uppercase tracking-wider text-[#FF4B4B]"
                >
                    Keep going
                </button>
            </div>
        </div>
    )
}
