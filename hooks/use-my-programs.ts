'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { parseProgramList, queryKeys } from '@/lib/query-keys'
import { useStudentClubContext } from '@/hooks/use-student-club'

export function useMyPrograms(orgIdOverride?: string | null) {
    const { isAuthenticated, token, loading: authLoading } = useAuth()
    const club = useStudentClubContext()
    const orgId = orgIdOverride !== undefined ? orgIdOverride : club.orgQueryParam

    return useQuery({
        queryKey: queryKeys.myPrograms(orgId),
        queryFn: async () => parseProgramList(await apiClient.programs.getMyPrograms(orgId)),
        enabled: !authLoading && (isAuthenticated || Boolean(token)) && Boolean(orgId),
        refetchOnMount: 'always',
    })
}

/** All enrollments across club + personal — use on Explore to detect existing registrations. */
export function useAllMyPrograms() {
    const { isAuthenticated, token, loading: authLoading } = useAuth()

    return useQuery({
        queryKey: queryKeys.myPrograms(),
        queryFn: async () => parseProgramList(await apiClient.programs.getMyPrograms()),
        enabled: !authLoading && (isAuthenticated || Boolean(token)),
        refetchOnMount: 'always',
    })
}

export function useProgramCatalog() {
    const { isAuthenticated, token, loading: authLoading } = useAuth()
    const club = useStudentClubContext()
    return useQuery({
        queryKey: queryKeys.catalog,
        queryFn: async () => parseProgramList(await apiClient.programs.getCatalog()),
        enabled:
            !authLoading
            && (isAuthenticated || Boolean(token))
            && club.marketplaceOpen,
    })
}

export function useProgramDetails(programId: string | undefined) {
    const { isAuthenticated, token, loading: authLoading } = useAuth()
    return useQuery({
        queryKey: queryKeys.programDetails(programId || ''),
        queryFn: () => apiClient.programs.getDetails(programId!),
        enabled: !authLoading && Boolean(programId) && (isAuthenticated || Boolean(token)),
    })
}
