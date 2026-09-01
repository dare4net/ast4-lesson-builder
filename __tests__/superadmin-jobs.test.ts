import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('superadmin manual jobs', () => {
    it('exposes preview and run for reminder jobs behind the console', () => {
        const page = read('app/superadmin/(console)/jobs/page.tsx')
        expect(page).toContain('JobsPanel')
        expect(page).toContain('Manual jobs')
        expect(read('lib/superadmin-nav.ts')).toContain('/jobs')

        const client = read('lib/superadmin-client.ts')
        expect(client).toContain("this.api.get('/superadmin/jobs')")
        expect(client).toContain("this.api.post(`/superadmin/jobs/${id}/run`")

        const panel = read('components/superadmin/jobs-panel.tsx')
        expect(panel).toContain('run(job, true)')
        expect(panel).toContain('run(job, false)')
        expect(panel).toContain('pushRegisteredUsers')
        expect(panel).toContain('lastPreview')
        expect(panel).toContain('lastSend')
        expect(panel).toContain('JobRunReport')

        const report = read('components/superadmin/job-run-report.tsx')
        expect(report).toContain('Would send')
        expect(report).toContain('Last send snapshot')
    })
})
