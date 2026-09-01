/** Cookie set by edge middleware when the request host is a club vanity subdomain. */
export const VANITY_ORG_SLUG_COOKIE = 'ast_vanity_org_slug'

const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'studio', 'dashboard', 'auth'])

export function vanityRootDomain(): string {
    return (process.env.NEXT_PUBLIC_VANITY_ROOT_DOMAIN || 'after-school.tech').toLowerCase()
}

/**
 * Extract org slug from a vanity host like `riverside.after-school.tech`.
 * Dev: `riverside.localhost` also works.
 */
export function parseVanitySlug(host: string, rootDomain = vanityRootDomain()): string | null {
    const hostname = String(host || '').split(':')[0].toLowerCase()
    if (!hostname) return null

    if (hostname.endsWith('.localhost')) {
        const sub = hostname.slice(0, -'.localhost'.length)
        if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null
        return sub
    }

    const root = rootDomain.toLowerCase()
    const suffix = `.${root}`
    if (!hostname.endsWith(suffix) || hostname === root) return null

    const sub = hostname.slice(0, -suffix.length)
    if (!sub || sub.includes('.') || RESERVED_SUBDOMAINS.has(sub)) return null
    return sub
}

export function vanityHostForSlug(slug: string, rootDomain = vanityRootDomain()): string {
    return `${slug}.${rootDomain}`
}
