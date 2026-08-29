"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { onWalletStarBalance } from '@/lib/achievement-listener'
import { queryKeys } from '@/lib/query-keys'
import { useStudentAchievements, useMissionCatalog, useStudentStats, useWallet } from '@/hooks/use-student-stats'
import { PLATFORM_MISSIONS, type Mission, type MissionStats as EngineMissionStats } from '@/lib/mission-engine'
import { appEventBus } from '@/lib/event-bus'

export type MissionStats = EngineMissionStats & {
    programsEnrolled: number
    starsEarned: number
    componentsReset: number
    starsSpent: number
    consecutiveCorrect: number
    lessonsReviewed: number
    completedLessonsCount: number
    totalBaselineScore: number
}

export interface StudentAchievement {
    id: string
    title: string
    description: string
    icon: string
    rewardStars: number
    isEarned: boolean
    earnedAt?: string | null
}

interface GamificationContextType {
    starBalance: number
    level: number
    completedMissions: string[]
    missionStats: MissionStats
    missionCatalog: Mission[]
    achievements: StudentAchievement[]
    loading: boolean
    refresh: () => Promise<void>
    addStars: (amount: number, reason: string, componentId?: string) => Promise<void>
    claimMission: (missionId: string) => Promise<void>
    levelUp: () => Promise<void>
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export function GamificationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth()
    const queryClient = useQueryClient()
    const statsQuery = useStudentStats()
    const walletQuery = useWallet()
    const catalogQuery = useMissionCatalog()
    const achievementsQuery = useStudentAchievements()

    const stats = statsQuery.data?.stats || {}
    const starBalance = typeof walletQuery.data?.starBalance === 'number'
        ? walletQuery.data.starBalance
        : (stats.starBalance || 0)

    const missionStats = useMemo<MissionStats>(() => ({
        programsEnrolled: stats.enrolledProgramsCount || stats.programsEnrolled || 0,
        starsEarned: starBalance,
        lifetimeStarsEarned: stats.lifetimeStarsEarned || 0,
        componentsReset: stats.componentsReset || 0,
        starsSpent: stats.starsSpent || 0,
        consecutiveCorrect: stats.consecutiveCorrect || 0,
        lessonsReviewed: stats.lessonsReviewed || 0,
        lessonsCompleted: stats.lessonsCompleted || stats.completedLessonsCount || 0,
        completedLessonsCount: stats.completedLessonsCount || stats.lessonsCompleted || 0,
        totalBaselineScore: stats.totalBaselineScore || stats.totalScore || 0,
        totalSubmits: stats.totalSubmits || 0,
        liveSubmits: stats.liveSubmits || 0,
        practiceSubmits: stats.practiceSubmits || 0,
        perfectSubmits: stats.perfectSubmits || 0,
        perfectLiveSubmits: stats.perfectLiveSubmits || 0,
        perfectPracticeSubmits: stats.perfectPracticeSubmits || 0,
        submitsByType: stats.submitsByType || {},
    }), [stats, starBalance])

    const level = typeof stats.level === 'number' && stats.level > 0 ? stats.level : 1
    const completedMissions = Array.isArray(stats.completedMissions) ? stats.completedMissions : []
    const loading = Boolean(isAuthenticated && user?.user_id && (statsQuery.isPending || walletQuery.isPending))

    const missionCatalog = useMemo<Mission[]>(() => {
        const list = catalogQuery.data?.missions
        return Array.isArray(list) && list.length > 0 ? list : PLATFORM_MISSIONS
    }, [catalogQuery.data])

    const achievements = useMemo<StudentAchievement[]>(() => {
        const list = achievementsQuery.data?.achievements
        if (!Array.isArray(list)) return []
        return list.map((item: Record<string, unknown>) => ({
            id: String(item.id || ''),
            title: String(item.title || item.id || 'Achievement'),
            description: String(item.description || ''),
            icon: String(item.icon || 'award'),
            rewardStars: Number(item.rewardStars) || 0,
            isEarned: Boolean(item.isEarned),
            earnedAt: (item.earnedAt as string | null) || null,
        }))
    }, [achievementsQuery.data])

    const refresh = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
            queryClient.invalidateQueries({ queryKey: queryKeys.wallet }),
            queryClient.invalidateQueries({ queryKey: queryKeys.missionCatalog }),
            queryClient.invalidateQueries({ queryKey: queryKeys.achievements }),
        ])
    }, [queryClient])

    useEffect(() => {
        const unsubWallet = onWalletStarBalance((balance) => {
            queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                ...(prev || {}),
                starBalance: balance,
            }))
        })
        const unsubAchievement = appEventBus.on('ACHIEVEMENT_EARNED', () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.achievements })
            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
        })
        return () => {
            unsubWallet()
            unsubAchievement()
        }
    }, [queryClient])

    const addStars = useCallback(async (amount: number, reason: string, componentId?: string) => {
        if (typeof amount !== 'number' || amount <= 0) return
        const result = await apiClient.gamification.awardStars(amount, reason, componentId)
        if (typeof result?.starBalance === 'number') {
            queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                ...(prev || {}),
                starBalance: result.starBalance,
            }))
        }
        await queryClient.invalidateQueries({ queryKey: queryKeys.stats })
    }, [queryClient])

    const claimMission = useCallback(async (missionId: string) => {
        try {
            const result = await apiClient.gamification.claimMission(missionId)
            appEventBus.emit('MISSION_CLAIMED', {
                id: missionId,
                title: result?.title || 'Mission complete',
                rewardStars: result?.rewardStars,
            })
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
                queryClient.invalidateQueries({ queryKey: queryKeys.wallet }),
            ])
        } catch (err) {
            console.warn('[gamification] Claim mission failed:', err)
        }
    }, [queryClient])

    const levelUp = useCallback(async () => {
        try {
            const result = await apiClient.gamification.levelUp()
            if (typeof result?.level === 'number') {
                appEventBus.emit('LEVEL_UP', { level: result.level })
            }
            await queryClient.invalidateQueries({ queryKey: queryKeys.stats })
        } catch (err) {
            console.warn('[gamification] Level up failed:', err)
        }
    }, [queryClient])

    const value = useMemo<GamificationContextType>(() => ({
        starBalance,
        level,
        completedMissions,
        missionStats,
        missionCatalog,
        achievements,
        loading,
        refresh,
        addStars,
        claimMission,
        levelUp,
    }), [starBalance, level, completedMissions, missionStats, missionCatalog, achievements, loading, refresh, addStars, claimMission, levelUp])

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    )
}

export function useGamification() {
    const context = useContext(GamificationContext)
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider')
    }
    return context
}
