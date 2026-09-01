import { describe, expect, it, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/api-client'
import { createBlankStudioLesson } from '@/lib/studio/create-blank-lesson'

describe('createBlankStudioLesson', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('creates an untitled lesson without audio', async () => {
        vi.spyOn(apiClient.studio, 'createLesson').mockResolvedValue({ lesson: { _id: 'abc' } } as never)

        const { lessonId } = await createBlankStudioLesson('mod-1')
        expect(lessonId).toBe('abc')
        expect(apiClient.studio.createLesson).toHaveBeenCalledWith('mod-1', {
            title: 'Untitled lesson',
            description: '',
            slides: [],
            settings: { duration: 30, level: 'Beginner' },
        })
    })
})
