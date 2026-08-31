/**
 * Canonical completion for persisted component interaction state (ADR-007 / G-39).
 * Writers should set `status: "completed"`. Readers use this helper so legacy flags still count.
 */

export const LEGACY_COMPLETION_FLAGS = [
    'isComplete',
    'isSubmitted',
    'submitted',
    'completed',
    'hasVoted',
] as const

export function isComponentCompleted(state: unknown): boolean {
    if (!state || typeof state !== 'object') return false
    const record = state as Record<string, unknown>
    if (record.isPendingMarking === true && record.tutorMarked !== true) return false
    if (record.status === 'completed') return true
    return LEGACY_COMPLETION_FLAGS.some((key) => record[key] === true)
}
