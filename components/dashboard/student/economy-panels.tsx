"use client"

import Link from "next/link"
import { Flame, Star, Rocket, ArrowRight, ShoppingBag, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useGamification } from "@/context/gamification-context"
import { evaluateLevelProgress, evaluateLevelTimeline } from "@/lib/mission-engine"
import {
    inferredStreakDays,
    lastNUtcDays,
    nextStreakMilestone,
    streakHeat,
    streakMilestoneReward,
    utcDay,
} from "@/lib/streak"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

function weekdayLetter(isoDay: string) {
    const stamp = Date.parse(`${isoDay}T00:00:00Z`)
    if (!Number.isFinite(stamp)) return ""
    return WEEKDAYS[new Date(stamp).getUTCDay()]
}

function HowToEarnStars() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 hover:underline"
                >
                    <Info className="h-3.5 w-3.5" />
                    How to earn
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="font-extrabold">How stars work</DialogTitle>
                    <DialogDescription className="text-left text-sm font-medium text-slate-600">
                        Stars are the live economy. They are not a badge on the header.
                    </DialogDescription>
                </DialogHeader>
                <ul className="space-y-3 text-sm font-medium text-slate-700">
                    <li>
                        <span className="font-extrabold text-slate-900">Live work.</span> Finish live blocks. Stars scale with how many scoring units you get right (about 5★ each).
                    </li>
                    <li>
                        <span className="font-extrabold text-slate-900">Missions.</span> Claim finished missions on Progress — those pay into this wallet.
                    </li>
                    <li>
                        <span className="font-extrabold text-slate-900">Showing up.</span> Streak milestones pay 5, 10, 20, 40… stars.
                    </li>
                    <li>
                        <span className="font-extrabold text-slate-900">Practice does not.</span> Practice is points and personal bests, not stars.
                    </li>
                </ul>
            </DialogContent>
        </Dialog>
    )
}

export function StudentEconomyPanels() {
    const { starBalance, level, completedMissions, missionStats, missionCatalog, levelUp } = useGamification()
    const loginStreak = Number(missionStats.loginStreak) || 0
    const longest = Number(missionStats.longestLoginStreak) || loginStreak
    const lifetimeStars = Number(missionStats.lifetimeStarsEarned) || 0
    const starsSpent = Number(missionStats.starsSpent) || 0
    const heat = streakHeat(loginStreak)
    const nextMark = nextStreakMilestone(loginStreak)
    const nextReward = nextMark ? streakMilestoneReward(nextMark) : 0
    const daysToNext = nextMark ? Math.max(0, nextMark - loginStreak) : 0
    const lit = new Set(inferredStreakDays(loginStreak))
    const week = lastNUtcDays(7, utcDay())

    const levelProgress = evaluateLevelProgress({
        currentLevel: level,
        completedMissionIds: completedMissions,
        stats: missionStats,
        catalog: missionCatalog,
    })
    const timeline = evaluateLevelTimeline({
        currentLevel: level,
        completedMissionIds: completedMissions,
        stats: missionStats,
        catalog: missionCatalog,
    })
    const doneMissions = levelProgress.activeMissions.filter((m) => m.isCompleted).length
    const totalMissions = levelProgress.activeMissions.length
    const missionPct = totalMissions > 0 ? Math.round((doneMissions / totalMissions) * 100) : 0

    return (
        <section className="space-y-3">
            <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Your economy</h2>
                <p className="text-xs font-medium text-slate-500">
                    Streak, stars, and level run the platform the same way lessons do.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <article className="flex flex-col rounded-2xl border-2 border-[#FF9600]/25 bg-white p-5 shadow-sm dark:border-orange-900/40 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className={cn("flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider", heat.chipText)}>
                                <Flame className="h-4 w-4" style={{ color: heat.flame, fill: heat.flame }} />
                                Streak · {heat.label}
                            </p>
                            <p className="mt-1 text-4xl font-black tabular-nums leading-none text-slate-900 dark:text-white">
                                {loginStreak}
                                <span className="ml-1.5 text-sm font-extrabold text-slate-500">
                                    {loginStreak === 1 ? "day" : "days"}
                                </span>
                            </p>
                        </div>
                        <p className="text-right text-[11px] font-bold text-slate-500">
                            Best {longest}
                        </p>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-1">
                        {week.map((day) => {
                            const on = lit.has(day)
                            const today = day === utcDay()
                            return (
                                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                                    <span className="text-[9px] font-bold text-slate-400">{weekdayLetter(day)}</span>
                                    <div
                                        className={cn(
                                            "h-8 w-full max-w-8 rounded-lg",
                                            on ? "bg-[#FF9600]" : "border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950",
                                            today && "ring-2 ring-[#58CC02] ring-offset-1"
                                        )}
                                        title={day}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {nextMark
                            ? `${daysToNext} day${daysToNext === 1 ? "" : "s"} to ${nextMark} · +${nextReward}★`
                            : "Every streak mark claimed."}
                    </p>
                    <Link href="/dashboard/student/streak" className="mt-auto pt-4">
                        <Button variant="duo" className="h-10 w-full rounded-xl text-xs">
                            Open streak
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </article>

                <article className="flex flex-col rounded-2xl border-2 border-amber-200 bg-white p-5 shadow-sm dark:border-amber-900/40 dark:bg-slate-900">
                    <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                        Star wallet
                    </p>
                    <p className="mt-1 text-4xl font-black tabular-nums leading-none text-slate-900 dark:text-white">
                        {starBalance}
                        <span className="ml-1.5 text-sm font-extrabold text-slate-500">★ now</span>
                    </p>
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/30">
                            <dt className="font-bold uppercase tracking-wider text-amber-700/80">Earned</dt>
                            <dd className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{lifetimeStars}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                            <dt className="font-bold uppercase tracking-wider text-slate-500">Spent</dt>
                            <dd className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{starsSpent}</dd>
                        </div>
                    </dl>
                    <div className="mt-3">
                        <HowToEarnStars />
                    </div>
                    <Link href="/dashboard/student/store" className="mt-auto pt-4">
                        <Button variant="duo" className="h-10 w-full rounded-xl bg-amber-500 text-xs hover:bg-amber-600 border-amber-500 border-b-amber-700">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Open store
                        </Button>
                    </Link>
                </article>

                <article className="flex flex-col rounded-2xl border-2 border-cyan-200 bg-white p-5 shadow-sm dark:border-cyan-900/40 dark:bg-slate-900">
                    <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-600">
                        <Rocket className="h-4 w-4" />
                        Level {level}
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-white">
                        {totalMissions > 0
                            ? `${doneMissions} / ${totalMissions} missions to level ${level + 1}`
                            : "No missions on this rung yet"}
                    </p>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                        <div
                            className="h-full rounded-full bg-[#1CB0F6] transition-all"
                            style={{ width: `${missionPct}%` }}
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-0 overflow-x-auto pb-1">
                        {timeline.map((node, index) => (
                            <div key={node.level} className="flex min-w-0 flex-1 items-center">
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={cn(
                                            "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black tabular-nums",
                                            node.status === "done" && "bg-[#58CC02] text-white",
                                            node.status === "current" && "bg-[#1CB0F6] text-white ring-2 ring-[#1CB0F6]/40",
                                            node.status === "locked" && "border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950"
                                        )}
                                    >
                                        {node.level}
                                    </div>
                                    {node.status === "current" && node.totalCount > 0 ? (
                                        <span className="text-[9px] font-bold tabular-nums text-cyan-700">
                                            {node.completedCount}/{node.totalCount}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-slate-400">
                                            {node.status === "done" ? "Done" : "Next"}
                                        </span>
                                    )}
                                </div>
                                {index < timeline.length - 1 ? (
                                    <div
                                        className={cn(
                                            "mx-1 h-0.5 min-w-3 flex-1",
                                            node.status === "done" ? "bg-[#58CC02]" : "bg-slate-200 dark:bg-slate-800"
                                        )}
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>
                    {levelProgress.canLevelUp ? (
                        <div className="mt-auto pt-4">
                            <Button
                                variant="duo"
                                className="h-10 w-full rounded-xl text-xs"
                                onClick={() => void levelUp()}
                            >
                                Claim level {level + 1}
                            </Button>
                        </div>
                    ) : (
                        <Link href="/dashboard/student/progress" className="mt-auto pt-4">
                            <Button variant="outline" className="h-10 w-full rounded-xl text-xs font-extrabold">
                                Open missions
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    )}
                </article>
            </div>
        </section>
    )
}
