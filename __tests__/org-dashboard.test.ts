import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homePathForRole } from '../lib/home-path'

function read(rel: string) {
    return readFileSync(join(process.cwd(), rel), 'utf8')
}

describe('org dashboard is separate from tutor', () => {
    it('maps organization role to /dashboard/org', () => {
        expect(homePathForRole('organization')).toBe('/dashboard/org')
        expect(homePathForRole('tutor')).toBe('/dashboard/tutor')
        expect(homePathForRole('student')).toBe('/dashboard/student')
    })

    it('ships a dedicated org dashboard route, not merged into tutor', () => {
        expect(read('app/dashboard/org/page.tsx')).toContain('Club overview')
        expect(read('app/dashboard/org/layout.tsx')).toContain('OrgSidebar')
        expect(read('app/dashboard/org/layout.tsx')).toContain('OrgMobileNav')
        expect(read('lib/org-nav.ts')).toContain('ORG_DASHBOARD_ROOT}/programs')
        expect(read('app/dashboard/tutor/page.tsx')).not.toContain('apiClient.orgs')
        expect(read('app/dashboard/tutor/layout.tsx')).not.toContain('/dashboard/org')
    })

    it('keeps org auth invite-only — no public Club portal', () => {
        expect(read('components/identity-selection.tsx')).not.toContain('organization')
        expect(read('components/auth/auth-shell.tsx')).not.toContain('role=organization')
        expect(read('app/org/invite/[token]/page.tsx')).toContain('completeInvite')
        expect(read('app/dashboard/org/layout.tsx')).toContain('OrgLoginGate')
        expect(read('app/auth/signup/page.tsx')).toContain('invite-only')
    })
})
