import { afterEach, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { getSessionFromAstCookie } from '@/lib/session-cookie'

describe('getSessionFromAstCookie', () => {
    const original = process.env.JWT_SECRET

    afterEach(() => {
        if (original === undefined) delete process.env.JWT_SECRET
        else process.env.JWT_SECRET = original
    })

    it('returns null when the cookie is missing', async () => {
        process.env.JWT_SECRET = 'viewer-session-secret'
        const session = await getSessionFromAstCookie({ get: () => undefined })
        expect(session).toBeNull()
    })

    it('reads user_id from the ast_token cookie, not from the URL', async () => {
        process.env.JWT_SECRET = 'viewer-session-secret'
        const token = await new SignJWT({ user_id: 'alice', role: 'student' })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(new TextEncoder().encode('viewer-session-secret'))

        const session = await getSessionFromAstCookie({
            get: (name) => (name === 'ast_token' ? { value: token } : undefined),
        })
        expect(session).toEqual({ token, user_id: 'alice', role: 'student' })
    })
})
