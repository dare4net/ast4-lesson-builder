import { apiClient } from '@/lib/api-client'

const DEFAULT_LESSON_TITLE = 'Untitled lesson'

export type CreateBlankLessonResult = {
    lessonId: string
}

/**
 * Create a minimal lesson and open the editor — no modal, no upfront audio.
 */
export async function createBlankStudioLesson(moduleId: string): Promise<CreateBlankLessonResult> {
    const result = await apiClient.studio.createLesson(moduleId, {
        title: DEFAULT_LESSON_TITLE,
        description: '',
        slides: [],
        settings: {
            duration: 30,
            level: 'Beginner',
        },
    })

    const lessonId = result?.lesson?._id || result?._id
    if (!lessonId) {
        throw new Error('Lesson was created but no id was returned')
    }

    return { lessonId: String(lessonId) }
}
