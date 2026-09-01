import { VANITY_ORG_SLUG_COOKIE } from '@/lib/vanity-host'

/** Read vanity org slug from document.cookie (client only). */
export function readVanityOrgSlug(): string | null {
    if (typeof document === 'undefined') return null
    const prefix = `${VANITY_ORG_SLUG_COOKIE}=`
    const row = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix))
    if (!row) return null
    try {
        return decodeURIComponent(row.slice(prefix.length)) || null
    } catch {
        return null
    }
}
