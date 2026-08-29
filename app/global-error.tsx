'use client'

import { useEffect } from 'react'
import { captureException } from '@/lib/error-tracker'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        captureException(error, { source: 'global-error', digest: error.digest })
    }, [error])

    return (
        <html lang="en">
            <body>
                <div style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', fontFamily: 'sans-serif', padding: 24, textAlign: 'center' }}>
                    <div>
                        <p style={{ fontWeight: 800, marginBottom: 8 }}>Something went wrong</p>
                        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>This page failed to load. Try again.</p>
                        <button
                            type="button"
                            onClick={() => reset()}
                            style={{ background: '#58CC02', border: 0, borderRadius: 12, color: '#fff', fontWeight: 800, padding: '10px 20px' }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
