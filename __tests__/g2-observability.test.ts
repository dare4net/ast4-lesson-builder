import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { log, sanitizeLogFields } from '@/lib/logger'
import { captureException, parseSentryDsn } from '@/lib/error-tracker'
import { createRequestId, resolveRequestId, REQUEST_ID_HEADER } from '@/lib/request-id'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('G2 structured logs', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('emits JSON with level, msg, and requestId', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        log('error', 'exception', { requestId: 'req-fe', status: 500 })
        expect(spy).toHaveBeenCalledTimes(1)
        const parsed = JSON.parse(String(spy.mock.calls[0][0]))
        expect(parsed).toMatchObject({ level: 'error', msg: 'exception', requestId: 'req-fe', status: 500 })
        expect(typeof parsed.ts).toBe('string')
    })

    it('does not let fields overwrite level or msg', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        log('error', 'health_db_down', { msg: 'socket hang up', requestId: 'req-down' })
        const parsed = JSON.parse(String(spy.mock.calls[0][0]))
        expect(parsed.msg).toBe('health_db_down')
        expect(parsed.level).toBe('error')
        expect(parsed.requestId).toBe('req-down')
    })

    it('redacts tokens and mongo URIs', () => {
        const cleaned = sanitizeLogFields({
            authorization: 'Bearer secret-token',
            password: 'hunter2',
            msg: 'failed mongodb://user:pass@localhost/db',
        })
        expect(cleaned.authorization).toBe('[redacted]')
        expect(cleaned.password).toBe('[redacted]')
        expect(cleaned.msg).toBe('failed mongodb://[redacted]')
        expect(JSON.stringify(cleaned)).not.toContain('hunter2')
    })
})

describe('G2 request IDs', () => {
    it('creates unique ids and reuses a valid incoming value', () => {
        const a = createRequestId()
        const b = createRequestId()
        expect(a).not.toBe(b)
        expect(resolveRequestId('client-req-12345')).toBe('client-req-12345')
        expect(resolveRequestId('nope spaces')).not.toBe('nope spaces')
    })
})

describe('G2 error tracker', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('logs exceptions without leaking secrets and never throws', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(() =>
            captureException(new Error('boom'), { requestId: 'req-err', authorization: 'Bearer abc' })
        ).not.toThrow()
        const parsed = JSON.parse(String(spy.mock.calls[0][0]))
        expect(parsed.msg).toBe('exception')
        expect(parsed.err).toBe('boom')
        expect(parsed.requestId).toBe('req-err')
        expect(parsed.authorization).toBe('[redacted]')
    })

    it('parses a Sentry DSN for the optional reporter', () => {
        const parsed = parseSentryDsn('https://abc123@o1.ingest.sentry.io/99')
        expect(parsed.key).toBe('abc123')
        expect(parsed.url).toBe('https://o1.ingest.sentry.io/api/99/store/')
    })
})

describe('G2 wiring', () => {
    it('sends x-request-id and reports API 5xx through the error tracker', () => {
        const source = read('lib/api-client.ts')
        expect(source).toContain('REQUEST_ID_HEADER')
        expect(source).toContain('createRequestId')
        expect(source).toContain('captureException')
        expect(source).toContain("source: 'api-client'")
        expect(REQUEST_ID_HEADER).toBe('x-request-id')
    })

    it('installs window listeners and dashboard/global error reporting', () => {
        expect(read('app/layout.tsx')).toContain('ErrorTrackingInit')
        expect(read('components/error-tracking-init.tsx')).toContain('initErrorTracking')
        expect(read('lib/error-tracker.ts')).toContain("source: 'window.error'")
        expect(read('lib/error-tracker.ts')).toContain('unhandledrejection')
        expect(read('components/dashboard/route-error.tsx')).toContain('captureException')
        expect(read('app/global-error.tsx')).toContain('captureException')
        expect(read('app/global-error.tsx')).toContain("source: 'global-error'")
    })
})
