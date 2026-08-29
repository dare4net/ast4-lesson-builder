const REDACT_KEY = /auth|token|password|secret|cookie|authorization|dsn/i
const REDACT_VALUE = /mongodb(\+srv)?:\/\/[^\s]+/gi

function redactValue(value: unknown): unknown {
    if (typeof value !== 'string') return value
    return value.replace(REDACT_VALUE, 'mongodb://[redacted]')
}

export function sanitizeLogFields(fields: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(fields)) {
        if (REDACT_KEY.test(key)) {
            out[key] = '[redacted]'
            continue
        }
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Error)) {
            out[key] = sanitizeLogFields(value as Record<string, unknown>)
            continue
        }
        out[key] = redactValue(value)
    }
    return out
}

export function log(level: 'info' | 'warn' | 'error', msg: string, fields: Record<string, unknown> = {}) {
    const payload = {
        ...sanitizeLogFields(fields),
        ts: new Date().toISOString(),
        level,
        msg,
    }
    const line = JSON.stringify(payload)
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
}
