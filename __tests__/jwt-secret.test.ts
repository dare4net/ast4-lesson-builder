import { afterEach, describe, expect, it, vi } from 'vitest'
import { requireJwtSecret } from '@/lib/jwt-secret'

describe('requireJwtSecret', () => {
    const original = process.env.JWT_SECRET

    afterEach(() => {
        if (original === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = original
        }
    })

    it('returns the env secret when set', () => {
        process.env.JWT_SECRET = 'test-secret-value'
        expect(requireJwtSecret()).toBe('test-secret-value')
    })

    it('throws when JWT_SECRET is unset', () => {
        delete process.env.JWT_SECRET
        expect(() => requireJwtSecret()).toThrow(/JWT_SECRET is not configured/)
    })

    it('throws when JWT_SECRET is empty', () => {
        process.env.JWT_SECRET = ''
        expect(() => requireJwtSecret()).toThrow(/JWT_SECRET is not configured/)
    })
})
