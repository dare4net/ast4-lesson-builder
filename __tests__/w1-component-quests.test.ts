import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('W1 component-specific quests', () => {
    it('emits lesson and component identity on submits', () => {
        expect(read('components/renderers/base/hooks.ts')).toContain('lessonId')
        expect(read('components/renderers/base/scored-renderer.tsx')).toContain('contextScoring.lessonId')
        expect(read('lib/achievement-listener.ts')).toContain('componentId: payload.componentId')
        expect(read('lib/contracts.ts')).toContain('componentId')
        expect(read('context/scoring-context.tsx')).toContain('lessonId')
    })

    it('lets Superadmin target a type, a lesson, then a block', () => {
        const page = read('app/superadmin/page.tsx')
        expect(page).toContain('Pick a lesson first')
        expect(page).toContain('!editingMission.filters.componentId')
        expect(page).toContain('filters.lessonId')
        expect(page).toContain('filters.componentId')
        expect(read('lib/superadmin-client.ts')).toContain('/superadmin/catalog/targets')
        expect(read('lib/gamification-catalog.ts')).toContain('lessonId?: string')
        expect(read('lib/gamification-catalog.ts')).toContain("'lessonId', 'programId'")
    })
})
