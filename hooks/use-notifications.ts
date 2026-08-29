'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

const POLL_MS = 45000

export function useNotificationsInbox() {
    const { isAuthenticated, user, loading: authLoading } = useAuth()
    const enabled = !authLoading && isAuthenticated && Boolean(user?.user_id) && user?.role !== 'tutor'

    const inboxQuery = useQuery({
        queryKey: queryKeys.notifications,
        queryFn: () => apiClient.notifications.list({ limit: 40 }),
        enabled,
        refetchInterval: POLL_MS,
    })

    const unreadQuery = useQuery({
        queryKey: queryKeys.notificationsUnread,
        queryFn: () => apiClient.notifications.unreadCount(),
        enabled,
        refetchInterval: POLL_MS,
    })

    return {
        enabled,
        notifications: inboxQuery.data?.notifications || [],
        unreadCount: unreadQuery.data?.unreadCount ?? inboxQuery.data?.unreadCount ?? 0,
        isLoading: inboxQuery.isLoading,
        refetchInbox: inboxQuery.refetch,
        refetchUnread: unreadQuery.refetch,
    }
}
