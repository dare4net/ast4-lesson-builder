import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    interactionStorageKey,
    isCatalogObjectIdHex,
    isLessonPublicId,
} from '@/lib/lesson-ref'

describe('E3 LessonRef (frontend)', () => {
    it('treats viewer/interaction ids as public ids, not catalog ObjectIds', () => {
        expect(isCatalogObjectIdHex('507f1f77bcf86cd799439011')).toBe(true)
        expect(isLessonPublicId('lesson-1719876543210')).toBe(true)
        expect(isLessonPublicId('507f1f77bcf86cd799439011')).toBe(false)
        expect(interactionStorageKey('user-1', 'lesson-abc')).toBe('ast_interaction_user-1_lesson-abc')
    })

    it('offline keys are built, not parsed by splitting underscores', () => {
        const userInteractions = readFileSync(join(process.cwd(), 'lib/user-interactions.ts'), 'utf8')
        const tutor = readFileSync(join(process.cwd(), 'components/viewer/TutorLessonContent.tsx'), 'utf8')
        expect(userInteractions).toContain('interactionStorageKey')
        expect(userInteractions).not.toContain('parts.slice(3)')
        expect(tutor).toContain('interactionStorageKey')
        expect(tutor).not.toContain('ast_interaction_${studentId}_${lessonId}')
    })
})
