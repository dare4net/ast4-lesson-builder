'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { captureException } from '@/lib/error-tracker'

export default function DashboardRouteError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        captureException(error, { source: 'route-error', digest: error.digest })
    }, [error])

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm font-extrabold text-slate-800 dark:text-white">Something went wrong</p>
            <p className="max-w-sm text-xs font-medium text-slate-500">
                {error.message || 'This page failed to load. Try again.'}
            </p>
            <Button
                type="button"
                onClick={() => reset()}
                className="h-10 rounded-xl bg-[#58CC02] px-5 text-xs font-extrabold text-white hover:bg-[#46a302]"
            >
                Try again
            </Button>
        </div>
    )
}
