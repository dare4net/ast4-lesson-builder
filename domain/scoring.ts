import type { Component, Lesson } from '@/types/lesson'
import { isScoredComponentType } from '@/lib/component-registry'
import { isComponentCompleted } from '@/domain/component-status'

export function componentMode(component: Component): 'practice' | 'live' | string {
    return (component.props?.mode || component.mode || 'practice') as string
}

export function isScoredComponent(component: Component): boolean {
    return isScoredComponentType(component.type) && (Number(component.props?.points) || 0) > 0
}

export function isScoredLiveComponent(component: Component): boolean {
    return isScoredComponent(component) && componentMode(component) === 'live'
}

export function getComponentMaxPoints(component: Component): number {
    const points = Number(component.props?.points) || 0
    if (points === 0) return 0

    switch (component.type) {
        case 'fillInTheBlank': {
            const blankCount =
                component.props.blanks?.length ||
                (component.props.text?.match(/\[blank\]/g) || []).length
            return points * blankCount
        }
        case 'dragDrop':
            return points * (component.props.items?.length || 0)
        case 'matchingPairs':
            return points * (component.props.pairs?.length || 0)
        case 'quiz':
            return points * (component.props.questions?.length || 0)
        default:
            return points
    }
}

export function getTotalPossiblePoints(lesson: Lesson): number {
    let total = 0
    for (const slide of lesson.slides || []) {
        for (const component of slide.components || []) {
            if (isScoredLiveComponent(component)) {
                total += getComponentMaxPoints(component)
            }
        }
    }
    return total
}

function clampScore(value: number, max: number): number {
    if (!Number.isFinite(value)) return 0
    return Math.max(0, Math.min(Math.round(value), max > 0 ? max : Math.round(value)))
}

function sumNumbers(value: unknown): number {
    if (!Array.isArray(value)) return 0
    return value.reduce((sum: number, item) => sum + (typeof item === 'number' && Number.isFinite(item) ? item : 0), 0)
}

function scoreDragDrop(state: Record<string, unknown>, points: number): number {
    const items = Array.isArray(state.dragItems) ? state.dragItems : []
    return items.reduce((sum: number, item: { correctIndex?: number }, index: number) => {
        return sum + (item?.correctIndex === index ? points : 0)
    }, 0)
}

function scoreMatches(state: Record<string, unknown>, points: number): number {
    const matches = state.matches
    if (!matches || typeof matches !== 'object') return 0
    let correct = 0
    for (const [leftId, match] of Object.entries(matches as Record<string, { rightId?: string }>)) {
        if (match && match.rightId === leftId) correct += 1
    }
    return correct * points
}

function scoreFromAnswers(component: Component, state: Record<string, unknown>): number {
    const points = Number(component.props?.points) || 0

    switch (component.type) {
        case 'dragDrop':
            return scoreDragDrop(state, points)
        case 'fillInTheBlank': {
            const correct = state.correctAnswers
            if (correct && typeof correct === 'object') {
                return Object.values(correct as Record<string, unknown>).filter(Boolean).length * points
            }
            return 0
        }
        case 'matchingPairs':
            return scoreMatches(state, points)
        case 'quiz':
        case 'flashcardQuiz':
        case 'multiSelectQuiz':
            return sumNumbers(state.scores)
        default:
            return 0
    }
}

/**
 * Points this live scored component contributes, derived from persisted state.
 * Practice mode and unscored types return 0.
 */
export function calculateComponentScore(component: Component, state: unknown): number {
    if (!isScoredLiveComponent(component) || !state || typeof state !== 'object') return 0

    const max = getComponentMaxPoints(component)
    const record = state as Record<string, unknown>

    if (typeof record.score === 'number' && Number.isFinite(record.score)) {
        return clampScore(record.score, max)
    }

    if (!isComponentCompleted(record) && record.isChecking !== true) return 0

    return clampScore(scoreFromAnswers(component, record), max)
}

/**
 * Sum of live component scores. When no component state exists yet, `fallback`
 * (typically `lessonState.score`) is used so older saves still resume.
 */
export function calculateLessonScore(
    lesson: Lesson | null | undefined,
    componentsState?: Record<string, unknown> | null,
    fallback = 0
): number {
    if (!lesson) return fallback

    let total = 0
    let sawState = false
    for (const slide of lesson.slides || []) {
        for (const component of slide.components || []) {
            const state = componentsState?.[component.id]
            if (state != null) sawState = true
            total += calculateComponentScore(component, state)
        }
    }

    if (total > 0) return total
    if (sawState) return 0
    return fallback
}
