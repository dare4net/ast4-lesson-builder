'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Flame, Play, RotateCcw } from 'lucide-react'
import { LoginStreakModal } from '@/components/store/login-streak-modal'
import { useAuth } from '@/context/auth-context'
import { useStudentStats } from '@/hooks/use-student-stats'
import { STREAK_MILESTONES, streakMilestoneReward } from '@/lib/streak'
import { cn } from '@/lib/utils'

type PreviewScenario = {
    id: string
    label: string
    stats: {
        loginStreak: number
        streakBonusStars?: number
        streakBonusClaimed?: boolean
        streakBroken?: boolean
        streakUsedFreeze?: number
    }
}

const PRESETS: PreviewScenario[] = [
    {
        id: 'day-3-bonus',
        label: '3 days · +5★ claim',
        stats: { loginStreak: 3, streakBonusStars: 5, streakBonusClaimed: false },
    },
    {
        id: 'day-7-bonus',
        label: '7 days · +10★ claim',
        stats: { loginStreak: 7, streakBonusStars: 10, streakBonusClaimed: false },
    },
    {
        id: 'day-14-bonus',
        label: '14 days · +20★ claim',
        stats: { loginStreak: 14, streakBonusStars: 20, streakBonusClaimed: false },
    },
    {
        id: 'day-5-no-bonus',
        label: '5 days · no milestone',
        stats: { loginStreak: 5, streakBonusStars: 0, streakBonusClaimed: true },
    },
    {
        id: 'freeze-save',
        label: '8 days · freeze saved you',
        stats: { loginStreak: 8, streakUsedFreeze: 1, streakBonusStars: 0, streakBonusClaimed: true },
    },
    {
        id: 'broken',
        label: 'Streak reset',
        stats: { loginStreak: 1, streakBroken: true, streakBonusStars: 0, streakBonusClaimed: true },
    },
]

export default function StreakPreviewPage() {
    const { user } = useAuth()
    const statsQuery = useStudentStats()
    const liveStats = statsQuery.data?.stats

    const [presetId, setPresetId] = useState(PRESETS[1].id)
    const [useLiveStats, setUseLiveStats] = useState(false)
    const [customDays, setCustomDays] = useState(7)
    const [withBonus, setWithBonus] = useState(true)
    const [replayKey, setReplayKey] = useState(0)

    const preset = PRESETS.find((item) => item.id === presetId) || PRESETS[0]

    const previewStats = useMemo(() => {
        if (useLiveStats && liveStats) {
            const bonus = Number(liveStats.streakBonusStars) || 0
            return {
                loginStreak: Number(liveStats.loginStreak) || 0,
                streakBonusStars: bonus,
                streakBonusClaimed: liveStats.streakBonusClaimed === true || bonus <= 0,
                streakBroken: Boolean(liveStats.streakBroken),
                streakUsedFreeze: Number(liveStats.streakUsedFreeze) || 0,
            }
        }
        if (presetId === 'custom') {
            const bonus = withBonus ? streakMilestoneReward(customDays) : 0
            return {
                loginStreak: customDays,
                streakBonusStars: bonus,
                streakBonusClaimed: bonus <= 0,
            }
        }
        return preset.stats
    }, [useLiveStats, liveStats, presetId, preset.stats, customDays, withBonus])

    const replay = () => setReplayKey((value) => value + 1)

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <LoginStreakModal
                stats={previewStats.loginStreak >= 1 ? previewStats : { loginStreak: 1 }}
                userId={user?.user_id || 'streak-preview'}
                preview
                replayKey={replayKey}
            />

            <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-4 py-12">
                <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF9600]/20">
                        <Flame className="h-8 w-8 text-[#FF9600]" fill="#FF9600" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">Streak preview</h1>
                    <p className="text-sm font-medium text-slate-400">
                        Replay the login streak animation anytime. Production still shows it once per day.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                    {user ? (
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                            <span className="text-sm font-bold">Use my live stats</span>
                            <input
                                type="checkbox"
                                checked={useLiveStats}
                                onChange={(event) => setUseLiveStats(event.target.checked)}
                                className="h-4 w-4 accent-[#58CC02]"
                            />
                        </label>
                    ) : (
                        <p className="text-xs font-medium text-slate-500">
                            Log in to preview with your real pending claim state.
                        </p>
                    )}

                    {!useLiveStats ? (
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setPresetId(item.id)}
                                        className={cn(
                                            'rounded-xl border px-3 py-2.5 text-left text-xs font-extrabold transition-colors',
                                            presetId === item.id
                                                ? 'border-[#58CC02] bg-[#58CC02]/15 text-[#58CC02]'
                                                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom</p>
                                <div className="flex flex-wrap gap-2">
                                    {STREAK_MILESTONES.map((mark) => (
                                        <button
                                            key={mark}
                                            type="button"
                                            onClick={() => {
                                                setPresetId('custom')
                                                setCustomDays(mark)
                                                setWithBonus(true)
                                            }}
                                            className={cn(
                                                'rounded-lg px-2.5 py-1 text-xs font-black',
                                                presetId === 'custom' && customDays === mark
                                                    ? 'bg-[#FF9600] text-white'
                                                    : 'bg-slate-800 text-slate-300'
                                            )}
                                        >
                                            {mark}d
                                        </button>
                                    ))}
                                </div>
                                <label className="flex items-center justify-between gap-3 text-sm font-bold text-slate-300">
                                    Milestone bonus (+{streakMilestoneReward(customDays)}★)
                                    <input
                                        type="checkbox"
                                        checked={withBonus}
                                        onChange={(event) => {
                                            setPresetId('custom')
                                            setWithBonus(event.target.checked)
                                        }}
                                        className="h-4 w-4 accent-[#FF9600]"
                                    />
                                </label>
                            </div>
                        </>
                    ) : null}

                    <button
                        type="button"
                        onClick={replay}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#58CC02] text-sm font-black uppercase tracking-wide text-white border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 active:translate-y-0.5"
                    >
                        <Play className="h-4 w-4 fill-current" />
                        Play streak animation
                    </button>

                    <button
                        type="button"
                        onClick={replay}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 text-xs font-extrabold uppercase tracking-wider text-slate-300 hover:bg-slate-800"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Replay
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
                    <Link href="/dashboard/student/streak" className="text-[#1CB0F6] hover:underline">
                        Real streak page
                    </Link>
                    <Link href="/dashboard/student" className="text-slate-500 hover:underline">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
