import type { Lesson, Component } from "@/types/lesson"

/**
 * Generates a deterministic hash representing ONLY Live Mode components within a lesson.
 * 
 * Versioning Rule:
 * Cosmetic edits (text updates, image URLs, option text, practice questions, non-live polls)
 * yield the EXACT same hash so existing student attempts, slide indices, and scores remain intact.
 * Only adding, removing, or changing the mode of a LIVE component will change this hash.
 */
export function calculateLiveComponentsHash(lesson: Partial<Lesson>): string {
    if (!lesson || !lesson.slides) return "0"

    const liveComponents: string[] = []

    lesson.slides.forEach((slide, slideIdx) => {
        if (!slide.components) return
        slide.components.forEach((comp: Component, compIdx: number) => {
            // Check if component is explicitly in live mode
            if (comp.mode === 'live') {
                liveComponents.push(`${slideIdx}:${comp.id}:${comp.type}:live`)
            }
        })
    })

    // Simple, fast deterministic hash of the live components signature
    const signature = liveComponents.join('|')
    let hash = 0
    for (let i = 0; i < signature.length; i++) {
        const char = signature.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0 // Convert to 32bit integer
    }

    return hash.toString(36)
}

/**
 * Compares two lesson payloads to determine if Live Mode structure has changed.
 * Returns true ONLY if Live Mode components were added, removed, or altered in position/mode.
 */
export function hasLiveStructureChanged(oldLesson: Partial<Lesson>, newLesson: Partial<Lesson>): boolean {
    const oldHash = calculateLiveComponentsHash(oldLesson)
    const newHash = calculateLiveComponentsHash(newLesson)
    return oldHash !== newHash
}
