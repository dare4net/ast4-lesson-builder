"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, Star, Rocket, Trophy, Target, Award, Lock, CheckCircle2, RefreshCw, Sparkles, Crown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { evaluateLevelProgress } from "@/lib/mission-engine"
import { cn } from "@/lib/utils"
import { useGamification } from "@/context/gamification-context"
import { loadLeaderboardRows, type LeaderboardTab, type LeaderboardRow } from "@/lib/leaderboard-fetch"
import { achievementIcon } from "@/components/gamification/achievement-icon"

export default function ProgressPage() {
    const { user } = useAuth()
    const {
        starBalance,
        level,
        completedMissions,
        missionStats,
        missionCatalog,
        achievements,
        loading: gamificationLoading,
        refresh,
        claimMission,
        levelUp,
    } = useGamification()
    const [leaderboardType, setLeaderboardType] = useState<LeaderboardTab>('global')
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([])
    const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(true)

    const liveStats = missionStats

    const fetchLeaderboard = (tab: LeaderboardTab) => {
        setLeaderboardLoading(true)
        loadLeaderboardRows(tab)
            .then(setLeaderboardData)
            .catch(err => console.warn('[ProgressPage] Leaderboard fetch error:', err))
            .finally(() => setLeaderboardLoading(false))
    }

    const fetchAllData = () => {
        if (!user?.user_id) return
        void refresh()
        fetchLeaderboard(leaderboardType)
    }

    useEffect(() => {
        fetchAllData()
    }, [user])

    useEffect(() => {
        if (!user?.user_id) return
        fetchLeaderboard(leaderboardType)
    }, [leaderboardType])

    const loading = gamificationLoading || leaderboardLoading

    const levelProgress = evaluateLevelProgress({
        currentLevel: level,
        completedMissionIds: completedMissions,
        stats: liveStats,
        catalog: missionCatalog,
    })
    const completedMissionsCount = levelProgress.activeMissions.filter(m => m.isCompleted).length
    const totalMissionsCount = levelProgress.activeMissions.length

    const handleClaimMission = (id: string) => {
        claimMission(id)
    }

    const handleLevelUp = () => {
        if (levelProgress.canLevelUp) {
            levelUp()
        }
    }

    const earnedBadgeIds = new Set(achievements.filter(a => a.isEarned).map(a => a.id))

    return (
        <div className="space-y-6 pb-12">
            {/* Sleek Hero Welcome Banner (Matching Student Dashboard Style) */}
            <section className="relative overflow-hidden p-6 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60">
                                <TrendingUp className="w-3.5 h-3.5 text-[#58CC02]" />
                                <span className="text-[11px] font-bold text-[#58CC02]">Learning Analytics</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/60">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-300 tabular-nums">
                                    {starBalance} wallet · {Number(liveStats.lifetimeStarsEarned) || 0} lifetime
                                </span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800/80 bg-cyan-50 dark:bg-cyan-950/60">
                                <Rocket className="w-3.5 h-3.5 text-cyan-500" />
                                <span className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-300">Level {level}</span>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Gamification & Progression
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                            Track platform missions, earn star rewards, unlock achievement badges, and climb student rankings.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link href="/dashboard/student/store">
                            <Button variant="outline" size="sm" className="h-9 border-amber-200 text-amber-700 rounded-xl text-xs font-bold">
                                Star store
                            </Button>
                        </Link>
                        <Button onClick={fetchAllData} variant="outline" size="sm" className="h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold gap-2 cursor-pointer">
                            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-[#58CC02]")} />
                            <span>Refresh Live Stats</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Level Explorer Card */}
            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-extrabold text-xl shrink-0">
                        Lvl {level}
                    </div>
                    <div className="space-y-1.5 max-w-lg">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Level {level} Explorer Progression</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#58CC02] border border-emerald-200 dark:border-emerald-800/80">Active</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Complete all active platform missions below to advance to Level {level + 1}!</p>

                        <div className="pt-1 flex items-center gap-3">
                            <div className="w-48 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (completedMissionsCount / Math.max(1, totalMissionsCount)) * 100)}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                {completedMissionsCount} / {totalMissionsCount} Missions
                            </span>
                        </div>
                    </div>
                </div>

                {levelProgress.canLevelUp ? (
                    <Button onClick={handleLevelUp} className="bg-[#58CC02] hover:bg-[#46A302] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl gap-2 h-10 px-5 shadow-sm cursor-pointer">
                        <Rocket className="w-4 h-4" />
                        Claim Level Up!
                    </Button>
                ) : (
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 flex items-center gap-2 self-start md:self-auto">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Level Up Locked</span>
                    </div>
                )}
            </Card>

            {/* Grid: Active Missions & Badges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Missions */}
                <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[#58CC02]">
                                <Target className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Missions</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Generic Level {level} checklist</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-[#58CC02] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                            {completedMissionsCount}/{totalMissionsCount} Done
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {levelProgress.activeMissions.map(m => (
                            <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2.5 rounded-xl border shrink-0", m.isCompleted ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-[#58CC02]" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400")}>
                                        {m.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{m.title}</h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{m.description}</p>
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <div className="w-28 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                <div className="h-full bg-[#58CC02] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (m.currentCount / m.targetCount) * 100)}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{m.currentCount} / {m.targetCount}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 font-bold text-xs">
                                        <Star className="w-3 h-3 fill-amber-400" />
                                        <span>+{m.rewardStars}</span>
                                    </div>
                                    {m.isCompleted && !completedMissions.includes(m.id) && (
                                        <Button size="sm" onClick={() => handleClaimMission(m.id)} className="h-7 text-[10px] font-bold uppercase tracking-wider bg-[#58CC02] hover:bg-[#46A302] text-white rounded-lg cursor-pointer">
                                            Claim
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Achievements Badge Room */}
                <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-purple-600 dark:text-purple-400">
                                <Award className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Trophy Room</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Badges earned from component mastery</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/80">
                            {earnedBadgeIds.size} Unlocked
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto">
                        {achievements.map(badge => {
                            const isUnlocked = earnedBadgeIds.has(badge.id)
                            const IconComponent = achievementIcon(badge.icon)

                            return (
                                <div
                                    key={badge.id}
                                    className={cn(
                                        "p-3.5 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden",
                                        isUnlocked ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-900 opacity-60"
                                    )}
                                >
                                    <div className={cn("p-2.5 rounded-xl border shrink-0", isUnlocked ? "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/80 text-purple-600 dark:text-purple-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400")}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{badge.title}</h5>
                                            {isUnlocked ? (
                                                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                                            ) : (
                                                <Lock className="w-3 h-3 text-slate-400" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-medium">{badge.description}</p>
                                        <span className="inline-block mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/80">
                                            +{badge.rewardStars} Stars
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Platform Leaderboards Section */}
            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400">
                            <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Platform Leaderboard</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rankings based on points earned in completed lessons</p>
                            <Link href="/dashboard/student/pride" className="inline-flex items-center gap-1 mt-1 text-xs font-extrabold text-[#FF9600] hover:underline">
                                <Crown className="w-3.5 h-3.5" />
                                Pride boards
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={() => setLeaderboardType('global')} className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer", leaderboardType === 'global' ? "bg-[#58CC02] text-white shadow-sm" : "text-slate-600 dark:text-slate-400")}>Global</button>
                        <button type="button" onClick={() => setLeaderboardType('personal')} className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer", leaderboardType === 'personal' ? "bg-[#58CC02] text-white shadow-sm" : "text-slate-600 dark:text-slate-400")}>My Stats</button>
                    </div>
                </div>

                {/* Rank Table */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span>Rank & Student</span>
                        <span>Points</span>
                    </div>

                    {leaderboardData.length > 0 ? (
                        leaderboardData.map((item, idx) => (
                            <div
                                key={item.userId || idx}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                    item.userId === user?.user_id ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-extrabold text-amber-500 text-sm w-6">{item.rank ? `#${item.rank}` : '—'}</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        {item.name}
                                        {item.userId === user?.user_id && " (You)"}
                                    </span>
                                </div>
                                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">{item.totalBaselineScore} pts</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs font-medium text-slate-500 px-3 py-4">No ranking data yet.</p>
                    )}
                </div>
            </Card>
        </div>
    )
}
