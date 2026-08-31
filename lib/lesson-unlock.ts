import { LESSON_EARLY_UNLOCK_COST, LESSON_UNLOCK_PROGRESS } from '@/lib/store-skus'

export { LESSON_EARLY_UNLOCK_COST, LESSON_UNLOCK_PROGRESS }

export type SequentialLesson = {
    lessonId?: string
    id?: string
    _id?: string
    progress?: number
    completed?: boolean
    locked?: boolean
    unlockedByStars?: boolean
    unlockCost?: number
}

export function meetsUnlockThreshold(lesson: Pick<SequentialLesson, 'progress' | 'completed'> | null | undefined) {
    if (!lesson) return false
    if (lesson.completed) return true
    return (Number(lesson.progress) || 0) >= LESSON_UNLOCK_PROGRESS
}

function lessonUnlockIds(lesson: SequentialLesson) {
    return [lesson.lessonId, lesson.id, lesson._id]
        .filter((value): value is string => value !== undefined && value !== null && String(value) !== '')
        .map(String)
}

export function applySequentialUnlock<T extends SequentialLesson>(lessons: T[], earlyUnlockIds: Array<string | number> = []): T[] {
    const early = new Set(earlyUnlockIds.map(String))
    let previousReady = true
    return (lessons || []).map((lesson, index) => {
        const ids = lessonUnlockIds(lesson)
        const unlockedByStars = ids.some((id) => early.has(id)) || Boolean(lesson.unlockedByStars)
        const locked = index > 0 && !previousReady && !unlockedByStars
        previousReady = meetsUnlockThreshold(lesson)
        return {
            ...lesson,
            locked,
            unlockedByStars,
            unlockCost: lesson.unlockCost || LESSON_EARLY_UNLOCK_COST,
        }
    })
}

/** Prefer server `locked` when present so star-paid skips stay open. */
export function withLessonLocks<T extends SequentialLesson>(lessons: T[]): T[] {
    if (!Array.isArray(lessons) || lessons.length === 0) return lessons
    if (lessons.some((lesson) => typeof lesson.locked === 'boolean')) return lessons
    return applySequentialUnlock(lessons)
}
