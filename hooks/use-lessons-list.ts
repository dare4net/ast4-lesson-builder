'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { useStudentClubContext } from '@/hooks/use-student-club'

export function useLessonsList(orgIdOverride?: string | null) {
    const { user, token, isAuthenticated, loading: authLoading } = useAuth()
    const club = useStudentClubContext()
    const userId = user?.user_id
    const orgId = orgIdOverride !== undefined ? orgIdOverride : club.orgQueryParam

    return useQuery({
        queryKey: queryKeys.lessonsList(orgId),
        queryFn: async () => {
            if (!userId) return []
            const data = await apiClient.lessons.listMine(userId, orgId)
            return Array.isArray(data) ? data : []
        },
        enabled: !authLoading && Boolean(userId) && (isAuthenticated || Boolean(token)) && Boolean(orgId),
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        staleTime: 10_000,
    })
}
