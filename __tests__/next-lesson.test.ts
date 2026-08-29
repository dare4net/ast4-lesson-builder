import { describe, expect, it } from 'vitest'
import { resolveLessonModuleId, resolveNextLesson } from '@/lib/next-lesson'

describe('resolveLessonModuleId', () => {
    it('prefers module_id on the lesson, then metadata', () => {
        expect(resolveLessonModuleId({ module_id: 'mod-1' })).toBe('mod-1')
        expect(resolveLessonModuleId({ moduleId: 'mod-2' })).toBe('mod-2')
        expect(resolveLessonModuleId({ metadata: { module_id: 'mod-3' } })).toBe('mod-3')
        expect(resolveLessonModuleId({ id: 'lesson-1' })).toBeNull()
    })
})

describe('resolveNextLesson', () => {
    const rows = [
        { lessonId: 'lesson-a', title: 'Intro' },
        { lessonId: 'lesson-b', title: 'Practice' },
        { lessonId: 'lesson-c', name: 'Wrap up' },
    ]

    it('returns the following module lesson', () => {
        expect(resolveNextLesson('lesson-a', rows)).toEqual({ id: 'lesson-b', title: 'Practice' })
        expect(resolveNextLesson('lesson-b', rows)).toEqual({ id: 'lesson-c', title: 'Wrap up' })
    })

    it('returns null for the last lesson or an unknown id', () => {
        expect(resolveNextLesson('lesson-c', rows)).toBeNull()
        expect(resolveNextLesson('lesson-z', rows)).toBeNull()
        expect(resolveNextLesson('lesson-a', [])).toBeNull()
    })
})
