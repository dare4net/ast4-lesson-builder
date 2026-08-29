'use client'

import { useEffect } from 'react'
import { initErrorTracking } from '@/lib/error-tracker'

export function ErrorTrackingInit() {
    useEffect(() => {
        initErrorTracking()
    }, [])
    return null
}
