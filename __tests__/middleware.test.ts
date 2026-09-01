import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SignJWT } from 'jose'
import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

const SECRET = 'test-secret-value'

async function authedRequest(path: string, claims: { user_id: string; role: string }) {
    const token = await new SignJWT(claims)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(new TextEncoder().encode(SECRET))
    const request = new NextRequest(`http://localhost${path}`)
    request.cookies.set('ast_token', token)
    return request
}

function requestTo(path: string, token?: string) {
    const request = new NextRequest(`http://localhost${path}`)
    if (token) request.cookies.set('ast_token', token)
    return request
}

describe('edge middleware', () => {
    const original = process.env.JWT_SECRET

    afterEach(() => {
        if (original === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = original
        }
    })

    it('returns 500 when JWT_SECRET is missing', async () => {
        delete process.env.JWT_SECRET
        const res = await middleware(requestTo('/studio', 'forged-token'))
        expect(res.status).toBe(500)
    })

    it('redirects to home when there is no session cookie', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(requestTo('/editor'))
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toBe('http://localhost/')
    })

    it('sends students away from studio/editor', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(await authedRequest('/studio', { user_id: 's1', role: 'student' }))
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toBe('http://localhost/dashboard/student')
    })

    it('sends tutors away from the student dashboard', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(await authedRequest('/dashboard/student', { user_id: 't1', role: 'tutor' }))
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toBe('http://localhost/dashboard/tutor')
    })

    it('sends tutors away from onboarding', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(await authedRequest('/onboarding', { user_id: 't1', role: 'tutor' }))
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toBe('http://localhost/dashboard/tutor')
    })

    it('sends org accounts to the club dashboard, not tutor', async () => {
        process.env.JWT_SECRET = SECRET
        const fromStudent = await middleware(
            await authedRequest('/dashboard/student', { user_id: 'o1', role: 'organization' }),
        )
        expect(fromStudent.status).toBe(307)
        expect(fromStudent.headers.get('location')).toBe('http://localhost/dashboard/org')

        const fromTutor = await middleware(
            await authedRequest('/dashboard/tutor', { user_id: 'o1', role: 'organization' }),
        )
        expect(fromTutor.status).toBe(307)
        expect(fromTutor.headers.get('location')).toBe('http://localhost/dashboard/org')
    })

    it('lets org owners open Creator Studio', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(await authedRequest('/studio', { user_id: 'o1', role: 'organization' }))
        expect(res.status).not.toBe(307)
        expect(res.status).not.toBe(500)
    })

    it('lets tutors open the separate org dashboard', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(await authedRequest('/dashboard/org', { user_id: 't1', role: 'tutor' }))
        expect(res.status).not.toBe(307)
        expect(res.status).not.toBe(500)
    })

    it('keeps students out of the org dashboard', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(await authedRequest('/dashboard/org', { user_id: 's1', role: 'student' }))
        expect(res.status).toBe(307)
        expect(res.headers.get('location')).toBe('http://localhost/dashboard/student')
    })

    it('lets unauthenticated users reach the org login gate', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(requestTo('/dashboard/org'))
        expect(res.status).not.toBe(307)
        expect(res.status).not.toBe(500)
    })

    it('sets vanity org cookie on join routes', async () => {
        process.env.JWT_SECRET = SECRET
        const request = new NextRequest('http://riverside.localhost/join/RIV-THU')
        const res = await middleware(request)
        expect(res.cookies.get('ast_vanity_org_slug')?.value).toBe('riverside')
    })

    it('lets a student through to the student dashboard', async () => {
        process.env.JWT_SECRET = SECRET
        const res = await middleware(await authedRequest('/dashboard/student', { user_id: 's1', role: 'student' }))
        expect(res.status).not.toBe(307)
        expect(res.status).not.toBe(500)
    })
})

describe('/builder', () => {
    it('is a redirect to /editor, not an unauthenticated LessonBuilder', () => {
        const source = readFileSync(join(process.cwd(), 'app/builder/page.tsx'), 'utf8')
        expect(source).toContain("redirect('/editor')")
        expect(source).not.toContain('LessonBuilder')
    })
})
