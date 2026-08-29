import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PLATFORM_ACHIEVEMENT_IDS } from '@/lib/achievement-catalog'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('C1 broken MySQL achievements router is not used', () => {
    it('frontend talks to Express achievements via apiClient paths, not models/models', () => {
        expect(read('lib/api-client.ts')).toContain("this.get('/achievements/student')")
        expect(read('lib/api-client.ts')).toContain("this.post('/achievements/evaluate'")
        expect(read('lib/achievement-listener.ts')).toContain('evaluateAchievements')
        expect(read('lib/achievement-listener.ts')).not.toMatch(/['"`]\/api\/achievements/)
    })
})

describe('C2 event listener + wallet award', () => {
    it('student dashboard layout and production viewer both mount the listener', () => {
        expect(read('app/dashboard/student/layout.tsx')).toContain('GamificationEventListener')
        expect(read('components/viewer/LessonViewer.tsx')).toContain('initAchievementListener')
    })

    it('listener credits via awardStars and evaluates via apiClient', () => {
        const source = read('lib/achievement-listener.ts')
        expect(source).toContain('awardStars')
        expect(source).toContain('evaluateAchievements')
        expect(source).toContain('COMPONENT_RESET')
        expect(source).toContain('PROGRAM_ENROLLED')
        expect(source).toContain('LESSON_COMPLETED')
        expect(source).not.toContain('/api/achievements/evaluate')
    })
})

describe('C3 GamificationProvider', () => {
    it('wraps the app and replaces local star/level owners', () => {
        expect(read('app/layout.tsx')).toContain('QueryProvider')
        expect(read('app/layout.tsx')).toContain('GamificationProvider')
        expect(read('hooks/use-student-stats.ts')).toContain('getWallet')
        expect(read('hooks/use-student-stats.ts')).toContain('getStats')
        expect(read('context/gamification-context.tsx')).toContain('useStudentStats')
        expect(read('context/gamification-context.tsx')).toContain('useWallet')
        expect(read('context/gamification-context.tsx')).toContain('claimMission')
        expect(read('context/gamification-context.tsx')).toContain('levelUp')
        expect(read('context/gamification-context.tsx')).toContain('addStars')

        const viewer = read('components/viewer/LessonViewer.tsx')
        expect(viewer).toContain('useGamification')
        expect(viewer).not.toMatch(/const \[starBalance\] = useState\(0\)/)

        const progress = read('app/dashboard/student/progress/page.tsx')
        expect(progress).toContain('useGamification')
        expect(progress).not.toMatch(/useState<number>\(0\)/)

        const hub = read('components/gamification/GamificationHubModal.tsx')
        expect(hub).toContain('useGamification')
        expect(hub).not.toContain('getAchievements')
    })
})

describe('C4 mission and level persistence', () => {
    it('progress does not auto-unlock all badges after one lesson', () => {
        const progress = read('app/dashboard/student/progress/page.tsx')
        expect(progress).not.toContain('completedLessonsCount > 0')
        expect(progress).toContain('earnedBadgeIds.has(badge.id)')
    })

    it('provider claims and levels up through the API', () => {
        const source = read('context/gamification-context.tsx')
        expect(source).toContain('apiClient.gamification.claimMission')
        expect(source).toContain('apiClient.gamification.levelUp')
        expect(read('lib/api-client.ts')).toContain("this.post('/missions/claim'")
        expect(read('lib/api-client.ts')).toContain("this.post('/level/up'")
    })
})

describe('C5 achievement ID contract', () => {
    it('shares the same catalog IDs as the backend', () => {
        expect([...PLATFORM_ACHIEVEMENT_IDS]).toEqual([
            'grid-memory-master',
            'first-live-star',
            'speed-demon',
            'perfect-lesson',
        ])
        const backend = read('../afterschool-tech-backend/helpers/platformAchievements.js')
        for (const id of PLATFORM_ACHIEVEMENT_IDS) {
            expect(backend).toContain(`id: '${id}'`)
        }
    })
})
