import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('vanity rollout wiring', () => {
    it('sets vanity cookie in middleware and exposes public org lookup', () => {
        expect(read('middleware.ts')).toContain('VANITY_ORG_SLUG_COOKIE')
        expect(read('middleware.ts')).toContain('parseVanitySlug')
        expect(read('lib/api-client.ts')).toContain('getPublicBySlug')
        expect(read('app/join/[code]/page.tsx')).toContain('readVanityOrgSlug')
        expect(read('components/dashboard/org/org-vanity-info.tsx')).toContain('vanityHostForSlug')
    })
})
