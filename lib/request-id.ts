const REQUEST_ID_RE = /^[A-Za-z0-9._-]{8,128}$/

export function createRequestId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function resolveRequestId(headerValue: unknown): string {
    if (typeof headerValue === 'string' && REQUEST_ID_RE.test(headerValue)) {
        return headerValue
    }
    return createRequestId()
}

export const REQUEST_ID_HEADER = 'x-request-id'
