import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('superadmin organisations', () => {
    it('exposes an Orgs tab wired to the superadmin client', () => {
        const page = read('app/superadmin/(console)/orgs/page.tsx')
        expect(page).toContain('OrgsPanel')
        expect(read('lib/superadmin-nav.ts')).toContain('/orgs')

        const client = read('lib/superadmin-client.ts')
        expect(client).toContain("this.api.get('/superadmin/orgs')")
        expect(client).toContain("this.api.post('/superadmin/orgs'")
        expect(client).toContain('/members')

        const panel = read('components/superadmin/orgs-panel.tsx')
        expect(panel).toContain('Create org')
        expect(panel).toContain('seatCap')
        expect(panel).toContain('Org settings')
        expect(panel).toContain('mapSuperadminOrgError')
        expect(panel).toContain('Search name, slug')
        expect(panel).toContain('Create cohort')
        expect(panel).toContain('joinCode')

        const joinPage = read('app/join/[code]/page.tsx')
        expect(joinPage).toContain('previewJoin')
        expect(joinPage).toContain('apiClient.orgs.join')
    })
})
