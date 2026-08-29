"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Star, Rocket, Trophy, Target, ShoppingBag, Award, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { evaluateLevelProgress } from '@/lib/mission-engine'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGamification } from '@/context/gamification-context'
import { loadLeaderboardRows, type LeaderboardTab, type LeaderboardRow } from '@/lib/leaderboard-fetch'
import { achievementIcon } from '@/components/gamification/achievement-icon'

interface GamificationHubModalProps {
    isOpen: boolean
    onClose: () => void
    userId?: string
    starBalance?: number
}

export function GamificationHubModal({
    isOpen,
    onClose,
    userId = 'guest',
}: GamificationHubModalProps) {
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
    const [currentTab, setCurrentTab] = useState<'missions' | 'achievements' | 'leaderboard' | 'store'>('missions')
    const [leaderboardType, setLeaderboardType] = useState<LeaderboardTab>('global')
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([])
    const [leaderboardLoading, setLeaderboardLoading] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        void refresh()
        setLeaderboardLoading(true)
        loadLeaderboardRows(leaderboardType)
            .then(setLeaderboardData)
            .catch(err => console.warn('Leaderboard API fetch notice:', err))
            .finally(() => setLeaderboardLoading(false))
    }, [isOpen, refresh, leaderboardType])

    const loading = gamificationLoading || leaderboardLoading

    const levelProgress = evaluateLevelProgress({
        currentLevel: level,
        completedMissionIds: completedMissions,
        stats: missionStats,
        catalog: missionCatalog,
    })

    const handleClaimMission = (missionId: string) => {
        claimMission(missionId)
    }

    const handleLevelUp = () => {
        if (levelProgress.canLevelUp) {
            levelUp()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 rounded-2xl shadow-xl overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[#58CC02]">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Gamification Hub</span>
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-[#58CC02]" />}
                            </DialogTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Missions, achievements, platform ranks & store</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-300 tabular-nums">{starBalance} Stars</span>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={currentTab} onValueChange={(v: any) => setCurrentTab(v)} className="mt-4">
                    <TabsList className="grid grid-cols-4 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <TabsTrigger value="missions" className="rounded-lg text-xs font-bold uppercase tracking-wider gap-1.5 data-[state=active]:bg-[#58CC02] data-[state=active]:text-white">
                            <Target className="w-3.5 h-3.5" />
                            <span>Missions</span>
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="rounded-lg text-xs font-bold uppercase tracking-wider gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Award className="w-3.5 h-3.5" />
                            <span>Badges</span>
                        </TabsTrigger>
                        <TabsTrigger value="leaderboard" className="rounded-lg text-xs font-bold uppercase tracking-wider gap-1.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Ranks</span>
                        </TabsTrigger>
                        <TabsTrigger value="store" className="rounded-lg text-xs font-bold uppercase tracking-wider gap-1.5 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Store</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Missions Tab */}
                    <TabsContent value="missions" className="space-y-4 pt-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 text-cyan-600 dark:text-cyan-400 font-extrabold text-base">
                                    Lvl {level}
                                </div>
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Level {level} Explorer</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Complete missions to advance!</p>
                                </div>
                            </div>
                            {levelProgress.canLevelUp && (
                                <Button onClick={handleLevelUp} className="bg-[#58CC02] hover:bg-[#46A302] text-white font-bold text-xs uppercase tracking-wider rounded-xl gap-1.5">
                                    <Rocket className="w-3.5 h-3.5" />
                                    Level Up!
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {levelProgress.activeMissions.map(m => (
                                <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl border shrink-0", m.isCompleted ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-[#58CC02]" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400")}>
                                            {m.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{m.title}</h5>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{m.description}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="w-28 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-[#58CC02] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (m.currentCount / m.targetCount) * 100)}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.currentCount} / {m.targetCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
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
                    </TabsContent>

                    {/* Achievements Tab */}
                    <TabsContent value="achievements" className="pt-4">
                        <div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto">
                            {achievements.length === 0 ? (
                                <p className="col-span-2 text-xs font-medium text-slate-500 p-4">No achievements in the catalog yet.</p>
                            ) : achievements.map((badge) => {
                                const IconComponent = achievementIcon(badge.icon)
                                return (
                                    <div key={badge.id} className={cn("p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3", !badge.isEarned && "opacity-60")}>
                                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-purple-600 dark:text-purple-400">
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                                {badge.title}
                                                {!badge.isEarned && <Lock className="w-3 h-3 text-slate-400" />}
                                            </h5>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{badge.description}</p>
                                            <span className="inline-block mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/80">+{badge.rewardStars} Stars</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>

                    {/* Leaderboard Tab */}
                    <TabsContent value="leaderboard" className="pt-4 space-y-3">
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => setLeaderboardType('global')} className={cn("text-[10px] font-bold uppercase tracking-wider h-7 rounded-lg cursor-pointer", leaderboardType === 'global' ? "bg-[#58CC02] text-white" : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400")}>Global</Button>
                            <Button size="sm" onClick={() => setLeaderboardType('personal')} className={cn("text-[10px] font-bold uppercase tracking-wider h-7 rounded-lg cursor-pointer", leaderboardType === 'personal' ? "bg-[#58CC02] text-white" : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400")}>My Stats</Button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 max-h-[280px] overflow-y-auto">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3">
                                <span>Rank & Student</span>
                                <span>Points</span>
                            </div>
                            {leaderboardData.length > 0 ? (
                                leaderboardData.map((item, idx) => (
                                    <div key={item.userId || idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <span className="font-extrabold text-amber-500 text-sm">{item.rank ? `#${item.rank}` : '—'}</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">{item.totalBaselineScore} pts</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs font-medium text-slate-500 px-3 py-4">No ranking data yet.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="store" className="pt-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            The rewards store is not available yet.
                        </p>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
