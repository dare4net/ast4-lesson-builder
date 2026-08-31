import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('superadmin manual jobs', () => {
    it('exposes preview and run for reminder jobs behind the console', () => {
        const page = read('app/superadmin/page.tsx')
        expect(page).toContain("setTab('jobs')")
        expect(page).toContain('JobsPanel')
        expect(page).toContain('Manual jobs')

        const client = read('lib/superadmin-client.ts')
        expect(client).toContain("this.api.get('/superadmin/jobs')")
        expect(client).toContain("this.api.post(`/superadmin/jobs/${id}/run`")

        const panel = read('components/superadmin/jobs-panel.tsx')
        expect(panel).toContain('run(job, true)')
        expect(panel).toContain('run(job, false)')
        expect(panel).toContain('FCM is not wired yet')
    })
})
