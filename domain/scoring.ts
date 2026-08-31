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

export const STARS_PER_UNIT = 5

export function getComponentScoringUnits(component: Component): number {
    const props = component.props || {}
    switch (component.type) {
        case 'fillInTheBlank': {
            const n =
                (Array.isArray(props.blanks) ? props.blanks.length : 0) ||
                (String(props.text || '').match(/\[blank\]/g) || []).length
            return Math.max(1, n)
        }
        case 'quiz':
        case 'flashcardQuiz':
        case 'multiSelectQuiz':
            return Math.max(1, Array.isArray(props.questions) ? props.questions.length : 1)
        case 'matchingPairs':
            return Math.max(1, Array.isArray(props.pairs) ? props.pairs.length : 1)
        case 'dragDrop':
            return Math.max(1, Array.isArray(props.items) ? props.items.length : 1)
        case 'categorise':
        case 'spectrumSorter':
            return Math.max(1, Array.isArray(props.items) ? props.items.length : 1)
        case 'hotspot':
            return Math.max(1, Array.isArray(props.hotspots) ? props.hotspots.length : 1)
        case 'swipeDeck':
            return Math.max(1, Array.isArray(props.cards) ? props.cards.length : 1)
        default:
            return 1
    }
}

export function maxStarsForLiveComponent(component: Component): number {
    if (componentMode(component) !== 'live') return 0
    if ((Number(component.props?.points) || 0) <= 0 && !isScoredComponent(component)) return 0
    const maxPoints = getComponentMaxPoints(component)
    if (maxPoints <= 0) return 0
    return STARS_PER_UNIT * getComponentScoringUnits(component)
}

export function getTotalPossiblePoints(lesson: Lesson): number {
    let total = 0
    for (const slide of lesson.slides || []) {
        for (const component of slide.components || []) {
            if (isScoredComponent(component)) {
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

/** Replace a block's contribution on the lesson total. Retry sets next to 0. */
export function shiftComponentAward(previousAwarded: number, nextAwarded: number) {
    const previous = Math.max(0, Number(previousAwarded) || 0)
    const next = Math.max(0, Number(nextAwarded) || 0)
    return { awarded: next, delta: next - previous }
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
 * Points this scored component contributes, derived from persisted state.
 * Unscored types return 0. Practice and live both count toward the lesson total.
 */
export function calculateComponentScore(component: Component, state: unknown): number {
    if (!isScoredComponent(component) || !state || typeof state !== 'object') return 0

    const max = getComponentMaxPoints(component)
    const record = state as Record<string, unknown>

    if (typeof record.score === 'number' && Number.isFinite(record.score)) {
        return clampScore(record.score, max)
    }

    if (!isComponentCompleted(record) && record.isChecking !== true) return 0

    return clampScore(scoreFromAnswers(component, record), max)
}

/**
 * Sum of scored component scores (practice and live). When no component state
 * exists yet, `fallback` (typically `lessonState.score`) is used so older saves
 * still resume.
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
