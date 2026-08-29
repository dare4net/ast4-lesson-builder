'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { parseProgramList, queryKeys } from '@/lib/query-keys'

export function useMyPrograms() {
    const { isAuthenticated, token, loading: authLoading } = useAuth()
    return useQuery({
        queryKey: queryKeys.myPrograms,
        queryFn: async () => parseProgramList(await apiClient.programs.getMyPrograms()),
        enabled: !authLoading && (isAuthenticated || Boolean(token)),
        refetchOnMount: 'always',
    })
}

export function useProgramCatalog() {
    const { isAuthenticated, token, loading: authLoading } = useAuth()
    return useQuery({
        queryKey: queryKeys.catalog,
        queryFn: async () => parseProgramList(await apiClient.programs.getCatalog()),
        enabled: !authLoading && (isAuthenticated || Boolean(token)),
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
