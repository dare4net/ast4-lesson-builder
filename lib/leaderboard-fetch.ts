import { apiClient } from '@/lib/api-client'

export type LeaderboardTab = 'global' | 'personal'

export interface LeaderboardRow {
    userId?: string
    name: string
    rank: number | null
    totalBaselineScore: number
}

export async function loadLeaderboardRows(tab: LeaderboardTab): Promise<LeaderboardRow[]> {
    if (tab === 'personal') {
        const data = await apiClient.gamification.getPersonalRank()
        if (!data?.success && data?.userId == null && data?.totalScore == null) return []
        return [{
            userId: data.userId,
            name: data.name || 'You',
            rank: null,
            totalBaselineScore: data.totalScore || 0,
        }]
    }

    const data = await apiClient.gamification.getGlobalLeaderboard()
    const rows = Array.isArray(data?.leaderboard) ? data.leaderboard : []
    return rows.map((item: any, idx: number) => ({
        userId: item.userId,
        name: item.name || item.email || `Student ${idx + 1}`,
        rank: item.rank || idx + 1,
        totalBaselineScore: item.totalScore ?? item.totalBaselineScore ?? 0,
    }))
}
