"use client"

import { useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { initAchievementListener } from '@/lib/achievement-listener'

export function GamificationEventListener({ userId }: { userId?: string }) {
    const { user } = useAuth()
    const resolvedUserId = userId || user?.user_id

    useEffect(() => {
        if (!resolvedUserId) return
        return initAchievementListener(resolvedUserId)
    }, [resolvedUserId])

    return null
}
