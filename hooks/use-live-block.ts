'use client'

import { useEffect, useState } from 'react'
import { useNavigationLock } from '@/context/navigation-lock-context'

export function useLiveBlock({
    isLive,
    isComplete,
    lockId = 'live-block',
}: {
    isLive: boolean
    isComplete: boolean
    lockId?: string
}) {
    const [hasStarted, setHasStarted] = useState(false)
    const { registerLock, unregisterLock } = useNavigationLock()

    useEffect(() => {
        if (isLive && hasStarted && !isComplete) {
            registerLock(lockId)
        } else {
            unregisterLock(lockId)
        }
        return () => unregisterLock(lockId)
    }, [isLive, hasStarted, isComplete, lockId, registerLock, unregisterLock])

    return {
        hasStarted,
        setHasStarted,
        showStartScreen: isLive && !hasStarted && !isComplete,
    }
}

export function readTimeLimit(value: unknown, fallback = 15) {
    return Math.max(1, Math.round(Number(value) || fallback))
}
