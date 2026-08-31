export type ReferenceOption = {
    id: string
    type: string
    title: string
}

export function referencePayKey(componentId?: string | null, questionId?: string | null) {
    return [componentId || 'block', questionId || 'all'].join(':')
}

export function findLessonComponent(lesson: { slides?: Array<{ components?: Array<{ id: string }> }> } | null | undefined, componentId?: string | null) {
    if (!lesson || !componentId) return null
    for (const slide of lesson.slides || []) {
        const match = (slide.components || []).find((component) => component.id === componentId)
        if (match) return match
    }
    return null
}

export function lessonReferenceOptions(lesson: { slides?: Array<{ components?: Array<{ id: string; type: string; props?: { title?: string } }> }> } | null | undefined): ReferenceOption[] {
    return (lesson?.slides || []).flatMap((slide) =>
        (slide.components || []).map((component) => ({
            id: component.id,
            type: component.type,
            title: String(component.props?.title || component.type),
        })),
    )
}
