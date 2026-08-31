'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

export function useLessonsList() {
    const { user, token, isAuthenticated, loading: authLoading } = useAuth()
    const userId = user?.user_id

    return useQuery({
        queryKey: queryKeys.lessonsList,
        queryFn: async () => {
            if (!userId) return []
            const data = await apiClient.lessons.listMine(userId)
            return Array.isArray(data) ? data : []
        },
        enabled: !authLoading && Boolean(userId) && (isAuthenticated || Boolean(token)),
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        staleTime: 10_000,
    })
}
