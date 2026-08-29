import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { requireJwtSecret } from '@/lib/jwt-secret'

export type CookieSession = {
    token: string
    user_id: string
    role?: string
}

export async function getSessionFromAstCookie(
    cookieStore?: { get: (name: string) => { value: string } | undefined }
): Promise<CookieSession | null> {
    const store = cookieStore ?? (await cookies())
    const token = store.get('ast_token')?.value
    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(requireJwtSecret()), {
            algorithms: ['HS256'],
        })
        const user_id = typeof payload.user_id === 'string' ? payload.user_id : undefined
        if (!user_id) return null
        const role = typeof payload.role === 'string' ? payload.role : undefined
        return { token, user_id, role }
    } catch {
        return null
    }
}
