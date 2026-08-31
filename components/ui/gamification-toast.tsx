"use client"

import React, { useEffect, useState } from 'react'
import { appEventBus } from '@/lib/event-bus'
import { SoundEffects } from '@/lib/sound-effects'
import { Star, Trophy, Target, Rocket, X, Crown, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastItem {
    id: string
    type: 'stars' | 'achievement' | 'mission' | 'level' | 'inbox' | 'crown' | 'unlock'
    title: string
    description: string
    rewardStars?: number
}

export function GamificationToastContainer() {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const addToast = (item: Omit<ToastItem, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const toastItem: ToastItem = { ...item, id }

        setToasts(prev => [...prev.slice(-2), toastItem])

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4500)
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    useEffect(() => {
        const unsubSubmitted = appEventBus.on('COMPONENT_SUBMITTED', (payload) => {
            if (payload.mode === 'live' && payload.score > 0) {
                addToast({
                    type: 'stars',
                    title: 'Live Activity Completed!',
                    description: `Accuracy ${payload.percentage}% • Earned Stars!`,
                })
            }
        })

        const unsubEarlyFinish = appEventBus.on('LIVE_EARLY_FINISH', () => {
            addToast({
                type: 'stars',
                title: 'Speed Demon Bonus!',
                description: 'Completed in record time (+2 Bonus Stars)',
            })
        })

        const unsubReset = appEventBus.on('COMPONENT_RESET', () => {
            addToast({
                type: 'mission',
                title: 'Challenge Reset!',
                description: 'Attempt count cleared. Try to beat your record!',
            })
        })

        const unsubAchievement = appEventBus.on('ACHIEVEMENT_EARNED', (payload) => {
            void SoundEffects.play('quizSuccess')
            addToast({
                type: 'achievement',
                title: payload.title || 'Achievement unlocked',
                description: payload.rewardStars
                    ? `+${payload.rewardStars} Stars`
                    : 'Badge earned',
                rewardStars: payload.rewardStars,
            })
        })

        const unsubMission = appEventBus.on('MISSION_CLAIMED', (payload) => {
            void SoundEffects.play('complete')
            addToast({
                type: 'mission',
                title: payload.title || 'Mission complete',
                description: payload.rewardStars
                    ? `+${payload.rewardStars} Stars claimed`
                    : 'Reward claimed',
                rewardStars: payload.rewardStars,
            })
        })

        const unsubLevel = appEventBus.on('LEVEL_UP', (payload) => {
            void SoundEffects.play('levelUp')
            addToast({
                type: 'level',
                title: `Level ${payload.level} unlocked`,
                description: 'New missions are ready. Keep going!',
            })
        })

        const unsubCrown = appEventBus.on('CROWN_GOLD', (payload) => {
            void SoundEffects.play('streak')
            addToast({
                type: 'crown',
                title: `Gold crown: ${payload.label}`,
                description: 'You are #1 on this pride board',
            })
        })

        const unsubInbox = appEventBus.on('INBOX_NOTICE', (payload) => {
            addToast({
                type: 'inbox',
                title: payload.title || 'New notification',
                description: payload.body || '',
            })
        })

        const unsubPathUnlock = appEventBus.on('LESSON_PATH_UNLOCKED', (payload) => {
            void SoundEffects.play('complete')
            addToast({
                type: 'unlock',
                title: payload.title || 'Next lesson unlocked',
                description: payload.description || 'You passed 50% — the next lesson is open.',
            })
        })

        return () => {
            unsubSubmitted()
            unsubEarlyFinish()
            unsubReset()
            unsubAchievement()
            unsubMission()
            unsubLevel()
            unsubCrown()
            unsubInbox()
            unsubPathUnlock()
        }
    }, [])

    if (toasts.length === 0) return null

    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4" aria-live="polite" aria-relevant="additions" role="status">
            {toasts.map(toast => {
                let icon = <Star className="w-6 h-6 text-amber-400 fill-amber-400 animate-spin" />
                let bgGradient = "from-amber-500/20 to-yellow-500/10 border-amber-500/40"

                if (toast.type === 'achievement') {
                    icon = <Trophy className="w-6 h-6 text-yellow-300" />
                    bgGradient = "from-purple-500/20 to-indigo-500/10 border-purple-500/40"
                } else if (toast.type === 'mission') {
                    icon = <Target className="w-6 h-6 text-emerald-400" />
                    bgGradient = "from-emerald-500/20 to-teal-500/10 border-emerald-500/40"
                } else if (toast.type === 'level') {
                    icon = <Rocket className="w-6 h-6 text-cyan-400" />
                    bgGradient = "from-cyan-500/20 to-blue-500/10 border-cyan-500/40"
                } else if (toast.type === 'inbox') {
                    icon = <Trophy className="w-6 h-6 text-[#1CB0F6]" />
                    bgGradient = "from-sky-500/20 to-blue-500/10 border-sky-500/40"
                } else if (toast.type === 'crown') {
                    icon = <Crown className="w-6 h-6 text-[#FF9600]" />
                    bgGradient = "from-amber-500/20 to-orange-500/10 border-amber-500/40"
                } else if (toast.type === 'unlock') {
                    icon = <Unlock className="w-6 h-6 text-[#58CC02]" />
                    bgGradient = "from-emerald-500/20 to-lime-500/10 border-emerald-500/40"
                }

                return (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-b-4 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-5 duration-300",
                            bgGradient
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0">
                                {icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-100">{toast.title}</span>
                                <span className="text-[11px] text-slate-300 font-medium">{toast.description}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label="Dismiss notification"
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
