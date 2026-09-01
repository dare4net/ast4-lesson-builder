import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('student cohort on dashboard', () => {
    it('returns cohort on /orgs/mine and shows it in the club switcher', () => {
        expect(read('../afterschool-tech-backend/helpers/studentOrgCohorts.js')).toContain(
            'enrichOrgRowsWithStudentCohorts',
        )
        expect(read('../afterschool-tech-backend/controllers/orgsController.js')).toContain(
            'enrichOrgRowsWithStudentCohorts',
        )
        expect(read('hooks/use-student-club.ts')).toContain('cohort')
        expect(read('components/dashboard/student/student-club-switcher.tsx')).toContain('cohort')
    })
})
