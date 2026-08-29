import { afterEach, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import type { NextApiRequest } from 'next'
import {
    getActorFromRequest,
    getBearerOrCookieToken,
    resolveInteractionUserId,
} from '@/lib/interactions-auth'

function fakeReq(partial: { authorization?: string; cookie?: string }): NextApiRequest {
    return {
        headers: partial.authorization ? { authorization: partial.authorization } : {},
        cookies: partial.cookie ? { ast_token: partial.cookie } : {},
    } as NextApiRequest
}

describe('resolveInteractionUserId', () => {
    it('forces students onto their own user id', () => {
        const result = resolveInteractionUserId({ user_id: 'alice', role: 'student' }, undefined)
        expect(result).toEqual({ userId: 'alice' })
    })

    it('rejects a student requesting another user', () => {
        const result = resolveInteractionUserId({ user_id: 'alice', role: 'student' }, 'victim')
        expect(result).toEqual({
            status: 403,
            error: "Cannot access another student's interaction",
        })
    })

    it('lets tutors inspect a requested student', () => {
        const result = resolveInteractionUserId({ user_id: 'tutor-1', role: 'tutor' }, 'student-9')
        expect(result).toEqual({ userId: 'student-9' })
    })

    it('requires tutors to specify which student', () => {
        const result = resolveInteractionUserId({ user_id: 'tutor-1', role: 'tutor' }, undefined)
        expect(result).toMatchObject({ status: 400 })
    })
})

describe('getActorFromRequest', () => {
    const original = process.env.JWT_SECRET

    afterEach(() => {
        if (original === undefined) delete process.env.JWT_SECRET
        else process.env.JWT_SECRET = original
    })

    it('reads a Bearer token', async () => {
        process.env.JWT_SECRET = 'interactions-test-secret'
        const token = await new SignJWT({ user_id: 'alice', role: 'student' })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(new TextEncoder().encode('interactions-test-secret'))

        const actor = await getActorFromRequest(fakeReq({ authorization: `Bearer ${token}` }))
        expect(actor).toEqual({ user_id: 'alice', role: 'student' })
    })

    it('reads the ast_token cookie', async () => {
        process.env.JWT_SECRET = 'interactions-test-secret'
        const token = await new SignJWT({ user_id: 'bob', role: 'tutor' })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(new TextEncoder().encode('interactions-test-secret'))

        const actor = await getActorFromRequest(fakeReq({ cookie: token }))
        expect(actor).toEqual({ user_id: 'bob', role: 'tutor' })
        expect(getBearerOrCookieToken(fakeReq({ cookie: token }))).toBe(token)
    })

    it('returns null for a forged token', async () => {
        process.env.JWT_SECRET = 'interactions-test-secret'
        expect(await getActorFromRequest(fakeReq({ cookie: 'not-a-jwt' }))).toBeNull()
    })
})
