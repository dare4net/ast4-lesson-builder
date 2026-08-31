'use client'

import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Flame, Shield, Star, Trophy } from 'lucide-react'
import { useStudentStats } from '@/hooks/use-student-stats'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { SoundEffects } from '@/lib/sound-effects'
import { prideBoardPath } from '@/lib/pride-paths'
import {
    STREAK_MILESTONE_COPY,
    STREAK_MILESTONES,
    inferredStreakDays,
    lastNUtcDays,
    nextStreakMilestone,
    streakMilestoneReward,
    utcDay,
} from '@/lib/streak'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function weekdayLetter(isoDay: string) {
    const stamp = Date.parse(`${isoDay}T00:00:00Z`)
    if (!Number.isFinite(stamp)) return ''
    return WEEKDAYS[new Date(stamp).getUTCDay()]
}

export default function StudentStreakPage() {
    const queryClient = useQueryClient()
    const statsQuery = useStudentStats()
    const stats = statsQuery.data?.stats || {}
    const streak = Number(stats.loginStreak) || 0
    const longest = Number(stats.longestLoginStreak) || streak
    const lastLoginDate = typeof stats.lastLoginDate === 'string' ? stats.lastLoginDate : utcDay()
    const freezeRemaining = Number(stats.streakFreezeRemaining) || 0
    const storeQuery = useQuery({
        queryKey: queryKeys.store,
        queryFn: () => apiClient.store.get(),
    })
    const freezeCharges = Number(storeQuery.data?.inventory?.items?.streak_freeze?.charges) || 0
    const armFreeze = useMutation({
        mutationFn: () => apiClient.store.activate('streak_freeze'),
        onSuccess: () => {
            void SoundEffects.play('powerupUsed')
            void queryClient.invalidateQueries({ queryKey: queryKeys.store })
            void queryClient.invalidateQueries({ queryKey: queryKeys.stats })
        },
    })
    const nextMark = Number(stats.nextStreakMilestone) || nextStreakMilestone(streak)
    const nextReward = Number(stats.nextStreakMilestoneReward) || (nextMark ? streakMilestoneReward(nextMark) : 0)
    const lit = new Set(inferredStreakDays(streak, lastLoginDate))
    const calendar = lastNUtcDays(14, utcDay())
    const daysToNext = nextMark ? Math.max(0, nextMark - streak) : 0

    return (
        <div className="space-y-6 pb-12">
            <section className="relative overflow-hidden rounded-2xl border-4 border-[#FF9600] bg-gradient-to-br from-[#FF9600] to-[#FF4B4B] p-6 text-white md:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/80">Login streak</p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                                <Flame className="h-9 w-9 fill-white text-white" />
                            </div>
                            <div>
                                <p className="text-6xl font-black tabular-nums leading-none">{streak}</p>
                                <p className="mt-1 text-sm font-extrabold uppercase tracking-wider">
                                    {streak === 1 ? 'Day' : 'Days'} in a row
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-md text-sm font-bold text-white/90">
                            {STREAK_MILESTONE_COPY[streak] || 'Show up tomorrow. That is the whole game.'}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="rounded-2xl bg-white/15 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Best</p>
                            <p className="text-2xl font-black tabular-nums">{longest}</p>
                        </div>
                        <div className="rounded-2xl bg-white/15 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Freezes</p>
                            <p className="text-2xl font-black tabular-nums">{freezeRemaining}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-black text-slate-800 dark:text-white">Last 14 days</h2>
                    <p className="text-[11px] font-bold text-slate-500">Inferred from your current streak</p>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-2">
                    {calendar.map((day) => {
                        const on = lit.has(day)
                        const today = day === utcDay()
                        return (
                            <div key={day} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400">{weekdayLetter(day)}</span>
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black tabular-nums',
                                        on
                                            ? 'bg-[#FF9600] text-white'
                                            : 'border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950',
                                        today && 'ring-2 ring-[#58CC02] ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                                    )}
                                    title={day}
                                >
                                    {Number(day.slice(-2))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-black text-slate-800 dark:text-white">Milestone stars</h2>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            Rewards double each mark: 5, 10, 20, 40, 80, 160.
                        </p>
                    </div>
                    {nextMark ? (
                        <p className="text-xs font-extrabold text-[#FF9600]">
                            {daysToNext} day{daysToNext === 1 ? '' : 's'} to +{nextReward}
                        </p>
                    ) : (
                        <p className="text-xs font-extrabold text-[#58CC02]">Every mark claimed</p>
                    )}
                </div>
                <ol className="mt-4 space-y-2">
                    {STREAK_MILESTONES.map((mark) => {
                        const reward = streakMilestoneReward(mark)
                        const reached = streak >= mark
                        return (
                            <li
                                key={mark}
                                className={cn(
                                    'flex items-center justify-between rounded-xl border px-3 py-2.5',
                                    reached
                                        ? 'border-[#FF9600]/40 bg-orange-50 dark:bg-orange-950/30'
                                        : 'border-slate-200 dark:border-slate-800'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Flame className={cn('h-4 w-4', reached ? 'fill-[#FF9600] text-[#FF9600]' : 'text-slate-400')} />
                                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">{mark} days</span>
                                </div>
                                <span className={cn('inline-flex items-center gap-1 text-sm font-black tabular-nums', reached ? 'text-[#FF9600]' : 'text-slate-500')}>
                                    <Star className="h-3.5 w-3.5" />
                                    +{reward}
                                </span>
                            </li>
                        )
                    })}
                </ol>
            </section>

            {freezeCharges > 0 ? (
                <button
                    type="button"
                    disabled={armFreeze.isPending}
                    onClick={() => armFreeze.mutate()}
                    className="w-full rounded-2xl border-2 border-[#1CB0F6] bg-[#1CB0F6]/10 p-4 text-left hover:bg-[#1CB0F6]/15 disabled:opacity-60"
                >
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white">Arm a freeze</p>
                    <p className="text-xs font-medium text-slate-500">
                        Move {freezeCharges} bought freeze{freezeCharges === 1 ? '' : 's'} into protection for a missed day.
                    </p>
                </button>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
                <Link
                    href="/dashboard/student/store"
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                    <Shield className="h-5 w-5 text-[#1CB0F6]" />
                    <div>
                        <p className="text-sm font-extrabold text-slate-800 dark:text-white">Buy a streak freeze</p>
                        <p className="text-xs font-medium text-slate-500">Covers a missed day so the flame stays lit.</p>
                    </div>
                </Link>
                <Link
                    href={prideBoardPath('loginStreak')}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                    <Trophy className="h-5 w-5 text-[#CE82FF]" />
                    <div>
                        <p className="text-sm font-extrabold text-slate-800 dark:text-white">Login streak pride</p>
                        <p className="text-xs font-medium text-slate-500">See who else is showing up every day.</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
