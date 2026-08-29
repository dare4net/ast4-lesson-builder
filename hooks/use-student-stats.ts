'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

export function useStudentStats() {
    const { isAuthenticated, user, loading: authLoading } = useAuth()
    return useQuery({
        queryKey: queryKeys.stats,
        queryFn: () => apiClient.gamification.getStats(),
        enabled: !authLoading && isAuthenticated && Boolean(user?.user_id),
    })
}

export function useWallet() {
    const { isAuthenticated, user, loading: authLoading } = useAuth()
    return useQuery({
        queryKey: queryKeys.wallet,
        queryFn: () => apiClient.gamification.getWallet(),
        enabled: !authLoading && isAuthenticated && Boolean(user?.user_id),
    })
}

export function useMissionCatalog() {
    const { isAuthenticated, user, loading: authLoading } = useAuth()
    return useQuery({
        queryKey: queryKeys.missionCatalog,
        queryFn: () => apiClient.gamification.getMissionCatalog(),
        enabled: !authLoading && isAuthenticated && Boolean(user?.user_id),
    })
}

export function useStudentAchievements() {
    const { isAuthenticated, user, loading: authLoading } = useAuth()
    return useQuery({
        queryKey: queryKeys.achievements,
        queryFn: () => apiClient.gamification.getAchievements(),
        enabled: !authLoading && isAuthenticated && Boolean(user?.user_id),
    })
}
