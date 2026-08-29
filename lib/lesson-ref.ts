/**
 * Frontend half of ADR-003. The browser never talks to Mongo; it only
 * carries the public lesson id (ast_lessons.lessons.id).
 */
const OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/

export function isCatalogObjectIdHex(value: string): boolean {
    return OBJECT_ID_HEX.test(value)
}

/** Viewer URLs, interactions, and offline keys use the public id — not a catalog ObjectId. */
export function isLessonPublicId(value: string): boolean {
    return typeof value === 'string' && value.length > 0 && !isCatalogObjectIdHex(value)
}

export function interactionStorageKey(userId: string, publicLessonId: string): string {
    return `ast_interaction_${userId}_${publicLessonId}`
}
