import { describe, expect, it } from 'vitest'
import { parseVanitySlug, vanityHostForSlug } from '../lib/vanity-host'

describe('vanity host', () => {
    it('parses production vanity subdomains', () => {
        expect(parseVanitySlug('riverside.after-school.tech')).toBe('riverside')
        expect(parseVanitySlug('app.after-school.tech')).toBeNull()
        expect(parseVanitySlug('after-school.tech')).toBeNull()
    })

    it('parses localhost dev vanity hosts', () => {
        expect(parseVanitySlug('riverside.localhost:3000')).toBe('riverside')
        expect(parseVanitySlug('www.localhost')).toBeNull()
    })

    it('builds vanity hostnames', () => {
        expect(vanityHostForSlug('riverside')).toBe('riverside.after-school.tech')
    })
})
