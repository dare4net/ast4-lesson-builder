import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function read(rel: string) {
    return readFileSync(join(process.cwd(), rel), 'utf8')
}

describe('phase 3 program org tagging', () => {
    it('studio create sends org_id and remembers active org', () => {
        expect(read('app/studio/programs/new/page.tsx')).toContain('org_id')
        expect(read('app/studio/programs/new/page.tsx')).toContain('setActiveOrgId')
        expect(read('lib/active-org.ts')).toContain('ast_active_org_id')
        expect(read('lib/api-client.ts')).toContain('/studio/programs?org_id=')
    })

    it('studio home switches organisation context', () => {
        expect(read('app/studio/page.tsx')).toContain('StudioOrgSwitcher')
        expect(read('components/studio/studio-org-switcher.tsx')).toContain('staffOrgs')
        expect(read('components/studio/studio-org-switcher.tsx')).toContain('PERSONAL_ORG_ID')
    })
})

describe('phase 4 student club home', () => {
    it('scopes my programs and hides marketplace in club mode', () => {
        expect(read('hooks/use-my-programs.ts')).toContain('useStudentClubContext')
        expect(read('hooks/use-student-club.ts')).toContain('marketplaceOpen')
        expect(read('hooks/use-student-club.ts')).toContain('canUsePersonal')
        expect(read('hooks/use-lessons-list.ts')).toContain('orgQueryParam')
        expect(read('hooks/use-lessons-list.ts')).toContain('listMine')
        expect(read('lib/api-client.ts')).toContain('org_id=')
        expect(read('components/dashboard/sidebar/student-sidebar.tsx')).toContain('marketplaceOpen')
        expect(read('app/dashboard/student/page.tsx')).toContain('StudentClubSwitcher')
        expect(read('app/dashboard/student/programs/page.tsx')).toContain('StudentClubSwitcher')
    })

    it('scopes pride and people search by active org', () => {
        expect(read('hooks/use-pride.ts')).toContain('orgQueryParam')
        expect(read('lib/api-client.ts')).toContain('/pride?org_id=')
        expect(read('lib/api-client.ts')).toContain('org_id')
        expect(read('components/pride/pride-search.tsx')).toContain('clubLens')
        expect(read('components/dashboard/student/live-pride-showcase.tsx')).toContain('clubPrideShowcaseDescription')
    })

    it('org dashboard assigns programs to cohorts', () => {
        expect(read('app/dashboard/org/programs/page.tsx')).toContain('Club programs')
        expect(read('app/dashboard/org/cohorts/page.tsx')).toContain('CohortProgramsEditor')
        expect(read('components/dashboard/org/cohort-programs-editor.tsx')).toContain('updateCohort')
        expect(read('components/dashboard/org/org-sidebar.tsx')).toContain('ORG_NAV_ITEMS')
        expect(read('lib/api-client.ts')).toContain('getPrograms')
        expect(read('lib/api-client.ts')).toContain('/orgs/${id}/programs')
        expect(read('lib/api-client.ts')).toContain('updateCohort')
        expect(read('../afterschool-tech-backend/routes/orgsRoutes.js')).toContain('listOrgPrograms')
    })

    it('student settings can opt into public catalog', () => {
        expect(read('components/dashboard/student/student-public-catalog-settings.tsx')).toContain('updatePublicAccess')
        expect(read('lib/api-client.ts')).toContain('/profile/public-access')
        expect(read('../afterschool-tech-backend/routes/profileRoutes.js')).toContain('updatePublicAccess')
    })

    it('students can self-serve leave a club', () => {
        expect(read('components/dashboard/student/student-club-membership.tsx')).toContain('apiClient.orgs.leave')
        expect(read('lib/api-client.ts')).toContain('/orgs/${orgId}/leave')
        expect(read('../afterschool-tech-backend/routes/orgsRoutes.js')).toContain('leaveOrg')
        expect(read('../afterschool-tech-backend/helpers/orgs.js')).toContain('leaveOrgAsStudent')
    })

    it('studio program editor exposes catalog visibility', () => {
        expect(read('components/studio/edit-program-dialog.tsx')).toContain('Catalog visibility')
        expect(read('components/studio/edit-program-dialog.tsx')).toContain('marketplace')
        expect(read('components/superadmin/orgs-panel.tsx')).toContain('CohortProgramsEditor')
        expect(read('lib/superadmin-client.ts')).toContain('getOrgPrograms')
    })

    it('org owners can use studio and manage public catalog policy', () => {
        expect(read('../afterschool-tech-backend/helpers/studioAccess.js')).toContain('organization')
        expect(read('../afterschool-tech-backend/routes/studioRoutes.js')).toContain('requireStudioAccess')
        expect(read('middleware.ts')).toContain('canUseAuthoringTools')
        expect(read('components/dashboard/org/org-public-catalog-policy.tsx')).toContain('allowPublicOptIn')
        expect(read('lib/api-client.ts')).toContain("patch(`/orgs/${id}`")
    })

    it('vanity subdomain rollout is wired', () => {
        expect(read('lib/vanity-host.ts')).toContain('parseVanitySlug')
        expect(read('middleware.ts')).toContain('VANITY_ORG_SLUG_COOKIE')
        expect(read('lib/api-client.ts')).toContain('getPublicBySlug')
        expect(read('../afterschool-tech-backend/routes/orgsRoutes.js')).toContain('/public/:slug')
        expect(read('components/superadmin/orgs-panel.tsx')).toContain('vanityEnabled')
        expect(read('components/dashboard/org/org-vanity-info.tsx')).toContain('vanityHostForSlug')
        expect(read('hooks/use-student-club.ts')).toContain('readVanityOrgSlug')
    })
})
