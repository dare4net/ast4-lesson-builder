'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

export function useHintPack() {
    const queryClient = useQueryClient()
    const store = useQuery({
        queryKey: queryKeys.store,
        queryFn: () => apiClient.store.get(),
        staleTime: 15_000,
    })
    const item = store.data?.inventory?.items?.hint_pack
    const charges = Number(item?.charges) || 0

    const tryUnlock = async (
        used: number,
        freeLimit: number,
        extra: number,
        onBonus: (bonus: number) => void,
    ): Promise<boolean> => {
        if (used < freeLimit + extra) return true
        if (charges < 1) return false
        try {
            const result = await apiClient.store.consume({ sku: 'hint_pack' })
            const bonus = Number(result.effect) || 1
            onBonus(bonus)
            void queryClient.invalidateQueries({ queryKey: queryKeys.store })
            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
            if (typeof result.starBalance === 'number') {
                queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                    ...(prev || {}),
                    starBalance: result.starBalance,
                }))
            }
            return used < freeLimit + extra + bonus
        } catch {
            return false
        }
    }

    return { charges, tryUnlock }
}
