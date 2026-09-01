'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { SoundEffects } from '@/lib/sound-effects'

export function useClaimStreakBonus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => apiClient.gamification.claimStreakBonus(),
        onSuccess: () => {
            void SoundEffects.play('complete')
            void queryClient.invalidateQueries({ queryKey: queryKeys.stats })
            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
        },
    })
}

export function pendingStreakBonus(stats?: {
    streakBonusStars?: number
    streakBonusClaimed?: boolean
} | null) {
    if (!stats || stats.streakBonusClaimed) return 0
    return Math.max(0, Number(stats.streakBonusStars) || 0)
}
