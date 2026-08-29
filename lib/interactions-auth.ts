import type { NextApiRequest } from 'next'
import { jwtVerify } from 'jose'
import { requireJwtSecret } from '@/lib/jwt-secret'

export type InteractionActor = {
    user_id: string
    role?: string
}

function firstQueryValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0]
    return value
}

export function getBearerOrCookieToken(req: NextApiRequest): string | undefined {
    const header = req.headers.authorization
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
        return header.slice('Bearer '.length).trim() || undefined
    }
    const cookie = req.cookies?.ast_token
    return cookie || undefined
}

export async function getActorFromRequest(req: NextApiRequest): Promise<InteractionActor | null> {
    const token = getBearerOrCookieToken(req)
    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(requireJwtSecret()), {
            algorithms: ['HS256'],
        })
        const user_id = typeof payload.user_id === 'string' ? payload.user_id : undefined
        if (!user_id) return null
        const role = typeof payload.role === 'string' ? payload.role : undefined
        return { user_id, role }
    } catch (err: any) {
        if (err?.message?.includes('JWT_SECRET')) throw err
        return null
    }
}

/**
 * Students may only access their own interaction.
 * Tutors may pass a student userId (inspection / marking).
 */
export function resolveInteractionUserId(
    actor: InteractionActor,
    requestedUserId: string | string[] | undefined
): { userId: string } | { status: number; error: string } {
    const requested = firstQueryValue(requestedUserId as string | string[] | undefined)

    if (actor.role === 'tutor') {
        if (!requested) {
            return { status: 400, error: 'Missing userId' }
        }
        return { userId: requested }
    }

    if (requested && requested !== actor.user_id) {
        return { status: 403, error: 'Cannot access another student\'s interaction' }
    }

    return { userId: actor.user_id }
}
