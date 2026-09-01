'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { useStudentClubContext } from '@/hooks/use-student-club'

const PRIDE_STALE_MS = 15_000

export type PrideStat = {
    key: string
    label: string
    sort: 'asc' | 'desc'
    unit: string
    group: string
    featured?: boolean
    you?: { value: number | null; rank: number | null; crown: string | null; listed?: boolean } | null
    leaders?: Array<{ rank: number; handle: string | null; displayName: string; value: number; crown: string | null; accentColor?: string | null; avatarId?: string | null; bestCrown?: string | null; following?: boolean }>
}

export type PrideScope = { type?: string; orgId?: string | null; cohortId?: string | null }

export type PrideBoardPayload = {
    scope?: PrideScope
    stat?: { key: string; label: string; sort: 'asc' | 'desc'; unit: string }
    board?: Array<{
        rank: number
        handle: string | null
        displayName: string
        value: number
        crown: string | null
        accentColor?: string | null
        avatarId?: string | null
        bestCrown?: string | null
        following?: boolean
    }>
    you?: {
        value: number | null
        rank: number | null
        crown: string | null
        listed?: boolean
        handle?: string | null
        gapToNext?: { handle: string | null; displayName: string; amount: number; accentColor?: string | null; avatarId?: string | null; bestCrown?: string | null; crown?: string | null; following?: boolean } | null
    } | null
}

function usePrideOrgParam() {
    const club = useStudentClubContext()
    return {
        orgId: club.orgQueryParam,
        enabled: Boolean(club.orgQueryParam),
        clubLens: Boolean(club.clubMode && club.orgQueryParam && club.orgQueryParam !== 'personal'),
        marketplaceOpen: club.marketplaceOpen,
    }
}

export function usePrideSummary() {
    const { orgId, enabled } = usePrideOrgParam()
    const query = useQuery({
        queryKey: queryKeys.prideSummary(orgId),
        queryFn: async () => {
            const data = await apiClient.pride.summary(orgId) as { stats?: PrideStat[]; scope?: PrideScope }
            return {
                stats: Array.isArray(data?.stats) ? data.stats : [],
                scope: data?.scope || { type: 'global' },
            }
        },
        enabled,
        staleTime: PRIDE_STALE_MS,
        refetchOnMount: 'always',
    })
    return {
        ...query,
        data: query.data?.stats || [],
        scope: query.data?.scope as PrideScope | undefined,
    }
}

export function usePrideBoard(statKey: string) {
    const { orgId, enabled } = usePrideOrgParam()
    return useQuery({
        queryKey: queryKeys.prideBoard(statKey, orgId),
        queryFn: () => apiClient.pride.board(statKey, orgId) as Promise<PrideBoardPayload>,
        enabled: Boolean(statKey) && enabled,
        staleTime: PRIDE_STALE_MS,
        refetchOnMount: 'always',
    })
}

export type PridePerson = {
    handle: string | null
    displayName?: string
    userId?: string | null
    accentColor?: string | null
    avatarId?: string | null
    bestCrown?: string | null
    following?: boolean
    value?: number | null
}

export type PrideSearchBoard = {
    key: string
    label: string
    unit?: string
    gold?: PridePerson | null
}

export type PrideSearchPayload = {
    people?: PridePerson[]
    boards?: PrideSearchBoard[]
    mode?: string
    scope?: PrideScope
}

export function usePrideSearch(query: string, enabled: boolean) {
    const { orgId, enabled: orgReady, clubLens, marketplaceOpen } = usePrideOrgParam()
    const queryResult = useQuery({
        queryKey: queryKeys.peopleSearch(query, orgId),
        queryFn: () => apiClient.people.search(query, orgId) as Promise<PrideSearchPayload>,
        enabled: enabled && orgReady,
        staleTime: PRIDE_STALE_MS,
        placeholderData: (previous) => previous,
    })
    return {
        ...queryResult,
        clubLens,
        marketplaceOpen,
    }
}

export function usePrefetchPrideBoard() {
    const client = useQueryClient()
    const { orgId } = usePrideOrgParam()
    return (statKey: string) => {
        if (!statKey || !orgId) return
        void client.prefetchQuery({
            queryKey: queryKeys.prideBoard(statKey, orgId),
            queryFn: () => apiClient.pride.board(statKey, orgId),
            staleTime: PRIDE_STALE_MS,
        })
    }
}
