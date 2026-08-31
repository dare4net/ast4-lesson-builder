'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { isPushClientConfigured, syncPushTokenIfEnabled } from '@/lib/push-client'

/** Silently refresh FCM token when permission is already granted — never auto-prompt. */
export function PushRegister() {
    const { user } = useAuth()

    useEffect(() => {
        if (!user?.user_id || !isPushClientConfigured()) return
        const timer = window.setTimeout(() => {
            void syncPushTokenIfEnabled(user.user_id).catch(() => {})
        }, 1200)
        return () => window.clearTimeout(timer)
    }, [user?.user_id])

    return null
}
