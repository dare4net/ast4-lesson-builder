export type NextLesson = { id: string; title: string }

type LessonLike = {
    id?: unknown
    module_id?: unknown
    moduleId?: unknown
    metadata?: {
        module_id?: unknown
        moduleId?: unknown
    } | null
}

type ModuleLessonRow = {
    lessonId?: unknown
    id?: unknown
    _id?: unknown
    title?: unknown
    name?: unknown
    lesson_title?: unknown
}

function asId(value: unknown): string | null {
    if (value === undefined || value === null || value === '') return null
    return String(value)
}

export function resolveLessonModuleId(lesson: LessonLike | null | undefined): string | null {
    if (!lesson) return null
    return (
        asId(lesson.module_id) ||
        asId(lesson.moduleId) ||
        asId(lesson.metadata?.module_id) ||
        asId(lesson.metadata?.moduleId)
    )
}

function rowIds(row: ModuleLessonRow): string[] {
    return [row.lessonId, row.id, row._id].map(asId).filter((id): id is string => Boolean(id))
}

export function resolveNextLesson(
    currentLessonId: string | null | undefined,
    rows: ModuleLessonRow[] | null | undefined,
): NextLesson | null {
    const currentId = asId(currentLessonId)
    if (!currentId || !Array.isArray(rows) || rows.length === 0) return null

    const idx = rows.findIndex((row) => rowIds(row).includes(currentId))
    if (idx < 0 || idx >= rows.length - 1) return null

    const next = rows[idx + 1]
    const id = asId(next.lessonId) || asId(next.id)
    if (!id) return null

    const title =
        (typeof next.title === 'string' && next.title) ||
        (typeof next.name === 'string' && next.name) ||
        (typeof next.lesson_title === 'string' && next.lesson_title) ||
        'Next lesson'

    return { id, title }
}
