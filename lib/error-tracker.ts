import { log, sanitizeLogFields } from '@/lib/logger'
import { createRequestId } from '@/lib/request-id'

type ErrorContext = Record<string, unknown>

function parseSentryDsn(dsn: string): { url: string; key: string } {
    const url = new URL(dsn)
    const projectId = url.pathname.replace(/^\//, '').split('/')[0]
    if (!url.username || !projectId) {
        throw new Error('invalid Sentry DSN')
    }
    return {
        url: `${url.protocol}//${url.host}/api/${projectId}/store/`,
        key: url.username,
    }
}

async function reportToSentry(error: unknown, context: ErrorContext) {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return
    const parsed = parseSentryDsn(dsn)
    const message = error instanceof Error ? error.message : String(error)
    await fetch(parsed.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${parsed.key}, sentry_client=ast-frontend/1.0`,
        },
        body: JSON.stringify({
            message,
            level: 'error',
            extra: context,
            timestamp: Date.now() / 1000,
        }),
    })
}

export function captureException(error: unknown, context: ErrorContext = {}) {
    const safe = sanitizeLogFields(context)
    const message = error instanceof Error ? error.message : String(error)
    log('error', 'exception', { err: message, ...safe })
    void reportToSentry(error, safe).catch(() => {})
}

let listening = false

export function initErrorTracking() {
    if (listening || typeof window === 'undefined') return
    listening = true
    window.addEventListener('error', (event) => {
        captureException(event.error || event.message, {
            source: 'window.error',
            requestId: createRequestId(),
        })
    })
    window.addEventListener('unhandledrejection', (event) => {
        captureException(event.reason, {
            source: 'unhandledrejection',
            requestId: createRequestId(),
        })
    })
}

export { parseSentryDsn }
