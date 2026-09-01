import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { clubThemeVars, resolveOrgAccent, slugAccent } from '@/lib/org-branding'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('org branding', () => {
    it('derives accent from slug when none is configured', () => {
        expect(resolveOrgAccent('riverside', null)).toBe(slugAccent('riverside'))
        expect(resolveOrgAccent('riverside', '#CE82FF')).toBe('#CE82FF')
    })

    it('exposes club CSS variables for student chrome', () => {
        const vars = clubThemeVars('#58CC02')
        expect(vars['--club-accent']).toBe('#58CC02')
        expect(vars['--club-accent-muted']).toContain('58CC02')
    })

    it('wires accent picker and branded student surfaces', () => {
        expect(read('components/dashboard/org/org-branding-settings.tsx')).toContain('OrgBrandingSettings')
        expect(read('components/dashboard/org/org-branding-settings.tsx')).toContain('prideScope')
        expect(read('app/dashboard/student/layout.tsx')).toContain('clubThemeVars')
        expect(read('app/join/[code]/page.tsx')).toContain('Join your class')
        expect(read('components/dashboard/student/student-club-strip.tsx')).toContain('StudentClubStrip')
        expect(read('lib/pride-scope-copy.ts')).toContain('clubPrideEyebrow')
        expect(read('components/dashboard/org/org-branding-settings.tsx')).toContain('OrgPlanUpgradeCard')
        expect(read('lib/club-plans.ts')).toContain('club_standard')
        expect(read('../afterschool-tech-backend/helpers/clubScope.js')).toContain('resolvePrideScopeMode')
    })
})
