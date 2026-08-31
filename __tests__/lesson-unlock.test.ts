import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { applySequentialUnlock, meetsUnlockThreshold, withLessonLocks } from '@/lib/lesson-unlock'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('sequential lesson unlock', () => {
    it('opens the first lesson and locks later ones until the previous hits 50%', () => {
        const rows = applySequentialUnlock([
            { lessonId: 'a', progress: 40 },
            { lessonId: 'b', progress: 0 },
            { lessonId: 'c', progress: 0 },
        ])
        expect(rows[0].locked).toBe(false)
        expect(rows[1].locked).toBe(true)
        expect(rows[2].locked).toBe(true)
        expect(meetsUnlockThreshold({ progress: 50 })).toBe(true)
        expect(meetsUnlockThreshold({ progress: 49 })).toBe(false)
        expect(meetsUnlockThreshold({ completed: true, progress: 10 })).toBe(true)
    })

    it('unlocks the next lesson at 50% and lets stars skip the gate', () => {
        const half = applySequentialUnlock([
            { lessonId: 'a', progress: 50 },
            { lessonId: 'b', progress: 0 },
        ])
        expect(half[1].locked).toBe(false)

        const skipped = applySequentialUnlock([
            { lessonId: 'a', progress: 10 },
            { lessonId: 'b', progress: 0 },
        ], ['b'])
        expect(skipped[1].locked).toBe(false)
        expect(skipped[1].unlockedByStars).toBe(true)
    })

    it('keeps server locked flags when present', () => {
        const rows = withLessonLocks([
            { lessonId: 'a', progress: 0, locked: false },
            { lessonId: 'b', progress: 0, locked: false, unlockedByStars: true },
        ])
        expect(rows[1].locked).toBe(false)
        expect(read('lib/api-client.ts')).toContain("this.post('/store/unlock-lesson'")
        expect(read('components/viewer/LessonViewer.tsx')).toContain('LESSON_PATH_UNLOCKED')
        expect(read('app/dashboard/student/programs/[id]/modules/[moduleId]/page.tsx')).toContain('Unlock ·')
        expect(read('components/dashboard/student/lesson-card.tsx')).toContain('Finish {LESSON_UNLOCK_PROGRESS}% of previous lesson to unlock for free')
        expect(read('app/dashboard/student/programs/[id]/modules/[moduleId]/page.tsx')).toContain('LESSON_UNLOCK_PROGRESS')
    })
})
