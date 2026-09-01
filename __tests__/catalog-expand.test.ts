import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PLATFORM_MISSIONS } from '@/lib/mission-engine'
import {
    describeAchievementRecipe,
    describeMissionRecipe,
    persistMissionFilters,
    visibleAchievementRules,
    canUsePerfectAttempt,
} from '@/lib/gamification-catalog'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('expandable missions and achievements', () => {
    it('shows all toasts at the top of the screen', () => {
        const gamification = read('components/ui/gamification-toast.tsx')
        expect(gamification).toContain('fixed top-6 right-6')
        expect(gamification).not.toContain('bottom-6')
        expect(gamification).toContain('slide-in-from-top-5')
        expect(gamification).toContain('aria-live="polite"')

        const toast = read('components/ui/toast.tsx')
        expect(toast).toContain('fixed top-0')
        expect(toast).not.toContain('sm:bottom-0')
        expect(toast).not.toContain('sm:slide-in-from-bottom-full')
    })

    it('locks catalog editing behind the env-auth superadmin console', () => {
        expect(PLATFORM_MISSIONS.every((m) => typeof m.stat === 'string')).toBe(true)
        expect(read('lib/api-client.ts')).toContain("this.get('/missions/catalog')")
        expect(read('lib/api-client.ts')).not.toContain('/studio/catalog/missions')
        expect(read('lib/superadmin-client.ts')).toContain("this.api.post('/superadmin/login'")
        expect(read('lib/superadmin-client.ts')).toContain('/superadmin/catalog/missions')
        expect(read('components/superadmin/missions-panel.tsx')).toContain('New level')
        expect(read('components/superadmin/achievements-panel.tsx')).toContain('Criteria (all must match)')
        expect(read('components/superadmin/missions-panel.tsx')).toContain('Mission recipe')
        expect(read('components/superadmin/missions-panel.tsx')).toContain('100% on first attempt')
        expect(read('components/superadmin/missions-panel.tsx')).toContain('Pick a lesson first')
        expect(read('components/superadmin/missions-panel.tsx')).not.toContain('placeholder="l3-complete-three-lessons"')
        expect(read('components/superadmin/missions-panel.tsx')).not.toContain('id: isNewMission')
        expect(read('components/superadmin/missions-panel.tsx')).toContain('createMission(payload)')
        expect(read('components/superadmin/achievements-panel.tsx')).toContain('createAchievement(payload)')
        expect(read('lib/superadmin-nav.ts')).toContain('SUPERADMIN_NAV_ITEMS')
        expect(read('components/superadmin/superadmin-sidebar.tsx')).toContain('Platform console')
        expect(read('lib/gamification-catalog.ts')).toContain("stat: 'submits'")
        expect(read('lib/gamification-catalog.ts')).toContain('lessonId')
        expect(read('lib/superadmin-client.ts')).toContain('/superadmin/catalog/targets')
        expect(read('app/superadmin/login/page.tsx')).toContain('Unlock')
        expect(read('app/studio/page.tsx')).not.toContain('/studio/gamification')
        expect(read('app/studio/page.tsx')).not.toContain('/superadmin')
        expect(read('lib/mission-engine.ts')).toContain('catalog = PLATFORM_MISSIONS')
        expect(read('../afterschool-tech-backend/helpers/platformAchievements.js')).toContain('rules:')
        expect(read('../afterschool-tech-backend/helpers/superadminAuth.js')).toContain('SUPERADMIN_PASSWORD')
        expect(read('../afterschool-tech-backend/helpers/superadminAuth.js')).not.toContain('dami')
        expect(read('app/superadmin/login/page.tsx')).not.toContain('dami')
        expect(read('app/superadmin/login/page.tsx')).not.toContain('1234')
    })

    it('hides type/mode and names the block when a specific block is chosen', () => {
        const missions = read('components/superadmin/missions-panel.tsx')
        const achievements = read('components/superadmin/achievements-panel.tsx')
        expect(missions).toContain('!editingMission.filters.componentId')
        expect(missions).toContain('describeMissionRecipe')
        expect(achievements).toContain('describeAchievementRecipe')

        expect(missions).toContain('canUsePerfectAttempt')
        expect(missions).toContain('isScoredCatalogType')

        const lessons = [{
            id: 'lesson-1',
            title: 'Intro',
            programTitle: 'Python',
            components: [
                { id: 'hang-1', type: 'hangman', title: 'Secret Word' },
                { id: 'p1', type: 'paragraph', title: 'Hello' },
            ],
        }]
        expect(describeMissionRecipe({
            stat: 'submits',
            targetCount: 1,
            filters: { lessonId: 'lesson-1', componentId: 'hang-1', type: 'hangman', mode: 'live' },
        }, lessons)).toBe('Count completions of Secret Word in Python · Intro until 1')
        expect(describeMissionRecipe({
            stat: 'submits',
            targetCount: 1,
            filters: { lessonId: 'lesson-1', componentId: 'hang-1', perfect: true },
        }, lessons)).toBe('Count completions of Secret Word in Python · Intro at 100% first try until 1')
        expect(describeMissionRecipe({
            stat: 'submits',
            targetCount: 1,
            filters: { lessonId: 'lesson-1', componentId: 'p1', perfect: true },
        }, lessons)).toBe('Count completions of Hello in Python · Intro until 1')
        expect(describeMissionRecipe({
            stat: 'submits',
            targetCount: 3,
            filters: { mode: 'live', type: 'quiz', perfect: true },
        })).toBe('Count live quiz completions at 100% first try until 3')
        expect(canUsePerfectAttempt({ type: 'quiz' })).toBe(true)
        expect(canUsePerfectAttempt({})).toBe(false)
        expect(canUsePerfectAttempt({ componentId: 'p1' }, lessons)).toBe(false)
        expect(persistMissionFilters('submits', {
            lessonId: 'lesson-1',
            componentId: 'hang-1',
            type: 'hangman',
            mode: 'live',
            perfect: true,
        }, lessons)).toEqual({ lessonId: 'lesson-1', componentId: 'hang-1', perfect: true })
        expect(persistMissionFilters('submits', {
            componentId: 'p1',
            perfect: true,
        }, lessons)).toEqual({ componentId: 'p1' })
        expect(describeAchievementRecipe('COMPONENT_SUBMITTED', [
            { field: 'type', op: 'eq', value: 'hangman' },
            { field: 'mode', op: 'eq', value: 'live' },
            { field: 'componentId', op: 'eq', value: 'hang-1' },
            { field: 'percentage', op: 'eq', value: 100 },
        ], lessons)).toBe('A block is completed, if block is Secret Word and percentage equals 100')
        expect(visibleAchievementRules([
            { field: 'type', op: 'eq', value: 'hangman' },
            { field: 'componentId', op: 'eq', value: 'hang-1' },
        ])).toEqual([{ field: 'componentId', op: 'eq', value: 'hang-1' }])
    })
})
