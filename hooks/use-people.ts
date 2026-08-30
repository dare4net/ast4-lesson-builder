'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

const PROFILE_STALE_MS = 15_000

export type PrideCrown = {
    statKey: string
    label: string
    value: number
    unit?: string
    rank?: number | null
    crown?: string | null
}

export type PrideWallItem = {
    key: string
    label: string
    unit?: string
    group?: string
    sort?: string
    value?: number | null
    rank?: number | null
    crown?: string | null
    gold?: { handle?: string | null; displayName?: string; value?: number | null; accentColor?: string | null; avatarId?: string | null; bestCrown?: string | null; following?: boolean } | null
}

export type PublicProfilePayload = {
    success?: boolean
    profile?: {
        handle?: string
        displayName?: string
        accentColor?: string | null
        avatarId?: string | null
        bestCrown?: string | null
        followerCount?: number
        followingCount?: number
        crownCount?: number
        goldCrowns?: PrideCrown[]
        silverCrowns?: PrideCrown[]
        bronzeCrowns?: PrideCrown[]
        wall?: PrideWallItem[]
    }
    viewer?: {
        isSelf?: boolean
        following?: boolean
        muted?: boolean
        blocked?: boolean
    } | null
}

export function usePeopleProfile(handle: string) {
    return useQuery({
        queryKey: queryKeys.peopleProfile(handle),
        queryFn: async (): Promise<PublicProfilePayload | null> => {
            try {
                return await apiClient.people.getByHandle(handle)
            } catch (err: unknown) {
                const status = (err as { response?: { status?: number } })?.response?.status
                if (status === 404) return null
                throw err
            }
        },
        enabled: Boolean(handle),
        staleTime: PROFILE_STALE_MS,
        refetchOnMount: 'always',
        retry: false,
    })
}

export function useFollowHandle(handle: string) {
    const client = useQueryClient()
    const invalidate = () => {
        void client.invalidateQueries({ queryKey: ['people'] })
        void client.invalidateQueries({ queryKey: ['pride'] })
    }
    const follow = useMutation({
        mutationFn: () => apiClient.people.follow(handle),
        onSuccess: invalidate,
    })
    const unfollow = useMutation({
        mutationFn: () => apiClient.people.unfollow(handle),
        onSuccess: invalidate,
    })
    return {
        follow: () => follow.mutateAsync(),
        unfollow: () => unfollow.mutateAsync(),
        isPending: follow.isPending || unfollow.isPending,
    }
}

export function usePeopleActions(handle: string) {
    const client = useQueryClient()
    const invalidate = () => client.invalidateQueries({ queryKey: queryKeys.peopleProfile(handle) })

    const follow = useMutation({
        mutationFn: () => apiClient.people.follow(handle),
        onSuccess: invalidate,
    })
    const unfollow = useMutation({
        mutationFn: () => apiClient.people.unfollow(handle),
        onSuccess: invalidate,
    })
    const mute = useMutation({
        mutationFn: (muted: boolean) => apiClient.people.mute(handle, muted),
        onSuccess: invalidate,
    })
    const block = useMutation({
        mutationFn: () => apiClient.people.block(handle),
        onSuccess: invalidate,
    })
    const unblock = useMutation({
        mutationFn: () => apiClient.people.unblock(handle),
        onSuccess: invalidate,
    })

    return { follow, unfollow, mute, block, unblock, isBusy: follow.isPending || unfollow.isPending || mute.isPending || block.isPending || unblock.isPending }
}
