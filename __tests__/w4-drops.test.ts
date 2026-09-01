import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CURRICULUM_INBOX_TYPES, programProgressPercent } from '@/lib/program-progress'
import { shouldToastInboxItem } from '@/lib/inbox'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('W4 curriculum drops', () => {
    it('uses live published-lesson percent from the API, not a stale module snapshot', () => {
        expect(programProgressPercent({
            progress: { percent_complete: 50, published_lessons: 4, completed_published_lessons: 2 },
            modules: [1, 2],
        })).toBe(50)
        expect(programProgressPercent({
            progress: { published_lessons: 4, completed_published_lessons: 1 },
        })).toBe(25)
        expect(programProgressPercent({
            registration: { progress: { percent_complete: 75 } },
        })).toBe(75)
        expect(read('app/dashboard/student/programs/page.tsx')).toContain('programProgressPercent')
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).toContain('programProgressPercent')
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).toContain('is_published !== false')
        expect(read('app/dashboard/student/page.tsx')).toContain('Your courses')
        expect(read('app/dashboard/student/page.tsx')).toContain('programProgressPercent')
        expect(read('hooks/use-my-programs.ts')).toContain("refetchOnMount: 'always'")
    })

    it('toasts tutor publish mail and refreshes course percent', () => {
        const bell = read('components/dashboard/notification-bell.tsx')
        expect(bell).toContain('CURRICULUM_INBOX_TYPES')
        expect(bell).toContain("['programs', 'mine']")
        expect(CURRICULUM_INBOX_TYPES.has('PROGRAM_LESSON_PUBLISHED')).toBe(true)
        expect(CURRICULUM_INBOX_TYPES.has('PROGRAM_MODULE_PUBLISHED')).toBe(true)
        expect(CURRICULUM_INBOX_TYPES.has('NEXT_LESSON_UNLOCKED')).toBe(true)
        expect(shouldToastInboxItem({
            id: 'n1',
            actorId: 'tutor-1',
            type: 'PROGRAM_LESSON_PUBLISHED',
        }, 'student-a')).toBe(true)
        expect(shouldToastInboxItem({
            id: 'n2',
            actorId: 'student-a',
            type: 'PROGRAM_LESSON_PUBLISHED',
        }, 'student-a')).toBe(false)
    })

    it('lets studio publish a lesson without putting email on student surfaces', () => {
        const settings = read('components/studio/edit-lesson-settings-modal.tsx')
        expect(settings).toContain('is_published')
        expect(settings).toContain('Published')
        expect(read('lib/api-client.ts')).toContain('is_published?: boolean')
        expect(read('components/studio/lesson-timeline-item.tsx')).toContain('Draft')
        expect(read('components/dashboard/notification-bell.tsx')).not.toContain('item.email')
    })
})
