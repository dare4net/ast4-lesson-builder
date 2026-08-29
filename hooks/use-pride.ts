'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

const PRIDE_STALE_MS = 15_000

export type PrideStat = {
    key: string
    label: string
    sort: 'asc' | 'desc'
    unit: string
    group: string
    featured?: boolean
    you?: { value: number | null; rank: number | null; crown: string | null; listed?: boolean } | null
    leaders?: Array<{ rank: number; handle: string | null; displayName: string; value: number; crown: string | null; accentColor?: string | null; bestCrown?: string | null; following?: boolean }>
}

export type PrideBoardPayload = {
    stat?: { key: string; label: string; sort: 'asc' | 'desc'; unit: string }
    board?: Array<{
        rank: number
        handle: string | null
        displayName: string
        value: number
        crown: string | null
        accentColor?: string | null
        bestCrown?: string | null
        following?: boolean
    }>
    you?: {
        value: number | null
        rank: number | null
        crown: string | null
        listed?: boolean
        handle?: string | null
        gapToNext?: { handle: string | null; displayName: string; amount: number; accentColor?: string | null; bestCrown?: string | null; crown?: string | null; following?: boolean } | null
    } | null
}

export function usePrideSummary() {
    return useQuery({
        queryKey: queryKeys.prideSummary,
        queryFn: async () => {
            const data = await apiClient.pride.summary()
            return Array.isArray(data?.stats) ? (data.stats as PrideStat[]) : []
        },
        staleTime: PRIDE_STALE_MS,
        refetchOnMount: 'always',
    })
}

export function usePrideBoard(statKey: string) {
    return useQuery({
        queryKey: queryKeys.prideBoard(statKey),
        queryFn: () => apiClient.pride.board(statKey) as Promise<PrideBoardPayload>,
        enabled: Boolean(statKey),
        staleTime: PRIDE_STALE_MS,
        refetchOnMount: 'always',
    })
}

export function usePrideSearch(query: string, enabled: boolean) {
    return useQuery({
        queryKey: queryKeys.peopleSearch(query),
        queryFn: () => apiClient.people.search(query),
        enabled,
        staleTime: PRIDE_STALE_MS,
        placeholderData: (previous) => previous,
    })
}

export function usePrefetchPrideBoard() {
    const client = useQueryClient()
    return (statKey: string) => {
        if (!statKey) return
        void client.prefetchQuery({
            queryKey: queryKeys.prideBoard(statKey),
            queryFn: () => apiClient.pride.board(statKey),
            staleTime: PRIDE_STALE_MS,
        })
    }
}
