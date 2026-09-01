'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SoundEffects } from '@/lib/sound-effects'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { pendingStreakBonus } from '@/hooks/use-claim-streak-bonus'
import { StreakBonusClaimButton } from '@/components/store/streak-bonus-claim'
import { STREAK_MILESTONE_COPY, STREAK_MILESTONES, nextStreakMilestone, streakHeat, streakMilestoneReward, streakModalStorageKey, utcDay } from '@/lib/streak'

type StreakPayload = {
    loginStreak?: number
    streakContinued?: boolean
    streakBroken?: boolean
    streakAlreadyCounted?: boolean
    streakUsedFreeze?: number
    streakBonusStars?: number
    streakBonusClaimed?: boolean
}

function useCountUp(target: number, active: boolean, durationMs = 900) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!active) {
            setCount(0)
            return
        }
        let start: number | null = null
        let frame = 0
        const step = (stamp: number) => {
            if (start == null) start = stamp
            const progress = Math.min((stamp - start) / durationMs, 1)
            setCount(Math.round((1 - (1 - progress) ** 3) * target))
            if (progress < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
    }, [target, active, durationMs])

    return count
}

export function LoginStreakModal({
    stats,
    userId,
    enabled = true,
    preview = false,
    replayKey = 0,
}: {
    stats?: StreakPayload | null
    userId?: string | null
    enabled?: boolean
    /** Skip once-per-day localStorage gate and always open (for /streak preview). */
    preview?: boolean
    /** Bump to replay the animation in preview mode. */
    replayKey?: number
}) {
    const [open, setOpen] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const reduceMotion = useReducedMotion()

    const bonus = pendingStreakBonus(stats)
    const canClaim = bonus > 0

    useEffect(() => {
        if (!enabled || !stats) return
        const streak = Number(stats.loginStreak) || 0
        if (streak < 1) return
        if (!preview) {
            if (!userId) return
            const key = streakModalStorageKey(userId, utcDay())
            try {
                if (window.localStorage.getItem(key)) return
                window.localStorage.setItem(key, '1')
            } catch {
                // Private mode — still show once this mount.
            }
        }
        setOpen(true)
        setClaimed(!canClaim)
        void SoundEffects.play('streak')
    }, [enabled, userId, stats?.loginStreak, stats?.streakBonusStars, canClaim, preview, replayKey])

    useEffect(() => {
        if (!canClaim) setClaimed(true)
    }, [canClaim])

    const streak = Number(stats?.loginStreak) || 1
    const broken = Boolean(stats?.streakBroken)
    const freeze = Number(stats?.streakUsedFreeze) || 0
    const line = broken
        ? 'New streak. Protect it this time.'
        : (STREAK_MILESTONE_COPY[streak] || 'Come back tomorrow. Do not break this.')
    const shownStreak = useCountUp(streak, open && !reduceMotion, 1100)
    const shownBonus = useCountUp(bonus, open && !reduceMotion && bonus > 0, 1300)
    const heat = streakHeat(streak)
    const nextMark = nextStreakMilestone(streak)
    const nextReward = nextMark ? streakMilestoneReward(nextMark) : 0
    const nextProgress = nextMark ? Math.min(100, Math.round((streak / nextMark) * 100)) : 100

    if (!stats) return null

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        type="button"
                        className="absolute inset-0"
                        aria-label="Dismiss streak"
                        onClick={() => setOpen(false)}
                    />
                    {!reduceMotion && !broken ? (
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            {Array.from({ length: 14 }).map((_, index) => (
                                <motion.span
                                    key={index}
                                    className="absolute h-2 w-2 rounded-full"
                                    style={{ backgroundColor: heat.flame }}
                                    initial={{
                                        x: `${20 + (index * 5) % 60}vw`,
                                        y: '110vh',
                                        opacity: 0.9,
                                        scale: 0.6,
                                    }}
                                    animate={{ y: '-10vh', opacity: 0, scale: 1.4 }}
                                    transition={{
                                        duration: 2.4 + (index % 5) * 0.25,
                                        delay: index * 0.08,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                    }}
                                />
                            ))}
                        </div>
                    ) : null}
                    <motion.div
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                        className={cn(
                            'relative w-full max-w-sm rounded-[2rem] border-4 p-8 text-center text-white shadow-2xl',
                            broken && 'border-slate-400 bg-gradient-to-b from-slate-600 to-slate-900'
                        )}
                        style={broken ? undefined : { borderColor: heat.border, background: `linear-gradient(to bottom, ${heat.from}, ${heat.to})` }}
                    >
                        <motion.div
                            className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/15"
                            animate={reduceMotion || broken ? undefined : { scale: [1, 1.12, 1], rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.9, repeat: reduceMotion ? 0 : 2 }}
                        >
                            <Flame className="h-14 w-14 fill-white text-white" style={{ color: heat.flame, fill: heat.flame }} />
                        </motion.div>
                        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/80">
                            {broken ? 'Streak reset' : freeze ? 'Freeze saved you' : 'Daily streak'}
                        </p>
                        <p className="mt-2 text-7xl font-black tabular-nums leading-none">
                            {reduceMotion ? streak : shownStreak}
                        </p>
                        <p className="mt-1 text-lg font-extrabold uppercase tracking-wider">
                            {streak === 1 ? 'Day' : 'Day streak'}
                        </p>
                        <p className="mt-4 text-sm font-bold text-white/90">{line}</p>
                        {!broken ? (
                            <div className="mt-5 space-y-3">
                                <div className="flex justify-center gap-1.5">
                                    {STREAK_MILESTONES.map((mark) => {
                                        const reached = streak >= mark
                                        const isNext = mark === nextMark
                                        const tone = streakHeat(mark)
                                        return (
                                            <div
                                                key={mark}
                                                title={`${mark} days · +${streakMilestoneReward(mark)}`}
                                                className={cn(
                                                    'flex h-9 min-w-9 flex-col items-center justify-center rounded-lg px-1.5 text-[9px] font-black',
                                                    reached || isNext ? 'text-white' : 'text-white/40 bg-white/10'
                                                )}
                                                style={reached || isNext ? { backgroundColor: tone.flame } : undefined}
                                            >
                                                {mark}
                                            </div>
                                        )
                                    })}
                                </div>
                                {nextMark ? (
                                    <div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                            <div className="h-full rounded-full bg-white" style={{ width: `${nextProgress}%` }} />
                                        </div>
                                        <p className="mt-1.5 text-[11px] font-extrabold text-white/85">
                                            {nextMark - streak} day{nextMark - streak === 1 ? '' : 's'} to +{nextReward} · {heat.label}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[11px] font-extrabold text-white/85">Every streak mark reached</p>
                                )}
                            </div>
                        ) : null}
                        {canClaim && !broken ? (
                            claimed ? (
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5">
                                    <Star className="h-4 w-4 fill-white text-white" />
                                    <span className="text-sm font-black tabular-nums">+{bonus} in your wallet</span>
                                </div>
                            ) : (
                                <StreakBonusClaimButton
                                    amount={reduceMotion ? bonus : shownBonus}
                                    className="mt-4 w-full"
                                    onClaimed={() => setClaimed(true)}
                                />
                            )
                        ) : null}
                        <Link
                            href="/dashboard/student/streak"
                            onClick={() => setOpen(false)}
                            className="mt-5 block text-xs font-extrabold uppercase tracking-wider text-white/90 underline-offset-4 hover:underline"
                        >
                            See your streak
                        </Link>
                        {!canClaim || claimed || broken ? (
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'mt-4 h-11 w-full rounded-2xl bg-white text-sm font-black uppercase tracking-wider',
                                    broken ? 'text-slate-800' : ''
                                )}
                                style={broken ? undefined : { color: heat.to }}
                            >
                                Keep going
                            </button>
                        ) : (
                            <p className="mt-4 text-[11px] font-bold text-white/75">
                                Claim your stars here or on your streak page anytime.
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    )
}
