'use client'

import { useEffect } from 'react'
import { readVanityOrgSlug } from '@/lib/vanity-cookie'
import { apiClient } from '@/lib/api-client'

/**
 * Sets document favicon from vanity org branding when on a club subdomain.
 */
export function VanityFavicon() {
    useEffect(() => {
        const slug = readVanityOrgSlug()
        if (!slug) return

        let cancelled = false
        void apiClient.orgs
            .getPublicBySlug(slug)
            .then((data) => {
                if (cancelled) return
                const href = data?.org?.faviconUrl || data?.org?.logoUrl
                if (!href) return
                let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
                if (!link) {
                    link = document.createElement('link')
                    link.rel = 'icon'
                    document.head.appendChild(link)
                }
                link.href = href
            })
            .catch(() => {
                // keep default favicon
            })

        return () => {
            cancelled = true
        }
    }, [])

    return null
}
