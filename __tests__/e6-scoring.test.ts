import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isComponentCompleted, isComponentReadyToAdvance } from '@/domain/component-status'
import {
    calculateComponentScore,
    calculateLessonScore,
    getComponentMaxPoints,
    getComponentScoringUnits,
    getTotalPossiblePoints,
    maxStarsForLiveComponent,
    shiftComponentAward,
} from '@/domain/scoring'
import type { Component, Lesson } from '@/types/lesson'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

function liveComponent(overrides: Partial<Component> & { type: Component['type']; id: string }): Component {
    return {
        mode: 'live',
        ...overrides,
        props: { points: 10, mode: 'live', ...(overrides.props || {}) },
    }
}

function lessonWith(components: Component[]): Lesson {
    return {
        id: 'lesson-1',
        title: 'Scoring',
        description: '',
        author: '',
        level: '',
        duration: 0,
        createdAt: '',
        updatedAt: '',
        slides: [
            {
                id: 'slide-1',
                title: 'One',
                status: 'uncompleted',
                state: 'active',
                components,
            },
        ],
    }
}

describe('E6 pull-model scoring', () => {
    it('counts practice mode toward obtainable points and hydrated score', () => {
        const quiz = liveComponent({
            id: 'q1',
            type: 'quiz',
            mode: 'practice',
            props: { points: 15, mode: 'practice', questions: [{}, {}] },
        })
        expect(calculateComponentScore(quiz, { score: 30, status: 'completed' })).toBe(30)
        expect(getTotalPossiblePoints(lessonWith([quiz]))).toBe(30)
    })

    it('prefers persisted state.score for live components', () => {
        const quiz = liveComponent({
            id: 'q1',
            type: 'quiz',
            props: { points: 10, mode: 'live', questions: [{}, {}] },
        })
        expect(getComponentMaxPoints(quiz)).toBe(20)
        expect(calculateComponentScore(quiz, { score: 10, status: 'completed' })).toBe(10)
    })

    it('rebuilds drag-drop score from placements when score was not stored', () => {
        const drag = liveComponent({
            id: 'dd1',
            type: 'dragDrop',
            props: {
                points: 5,
                mode: 'live',
                items: [
                    { id: 'a', correctIndex: 0 },
                    { id: 'b', correctIndex: 1 },
                ],
            },
        })
        expect(
            calculateComponentScore(drag, {
                isSubmitted: true,
                dragItems: [
                    { id: 'a', correctIndex: 0 },
                    { id: 'b', correctIndex: 1 },
                ],
            })
        ).toBe(10)
    })

    it('sums a lesson from componentsState and falls back when none exists', () => {
        const quiz = liveComponent({
            id: 'q1',
            type: 'quiz',
            props: { points: 10, mode: 'live', questions: [{}] },
        })
        const lesson = lessonWith([quiz])
        expect(calculateLessonScore(lesson, { q1: { score: 7, status: 'completed' } })).toBe(7)
        expect(calculateLessonScore(lesson, null, 42)).toBe(42)
        expect(calculateLessonScore(lesson, { q1: { score: 0, status: 'completed' } }, 42)).toBe(0)
    })

    it('hydrates ScoringProvider from componentsState', () => {
        expect(read('context/scoring-context.tsx')).toContain('calculateLessonScore')
        expect(read('context/scoring-context.tsx')).toContain('componentsState')
        expect(read('components/viewer/LessonViewer.tsx')).toContain('componentsState={resolvedInteraction?.componentsState}')
        expect(read('services/scoring-service.ts')).toContain('pullComponentScore')
    })
})

describe('practice retry does not stack points', () => {
    it('replaces a block contribution instead of adding it again', () => {
        const first = shiftComponentAward(0, 10)
        expect(first).toEqual({ awarded: 10, delta: 10 })
        const again = shiftComponentAward(10, 10)
        expect(again).toEqual({ awarded: 10, delta: 0 })
        const retry = shiftComponentAward(10, 0)
        expect(retry).toEqual({ awarded: 0, delta: -10 })
        const better = shiftComponentAward(0, 8)
        expect(better).toEqual({ awarded: 8, delta: 8 })
    })

    it('on retry only removes points actually earned on a multi-blank block', () => {
        // 3 blanks × 5 = 15 max, one correct → 5 earned. Retry must claw back 5, not 15.
        expect(shiftComponentAward(5, 0)).toEqual({ awarded: 0, delta: -5 })
        const fib = {
            id: 'fib',
            type: 'fillInTheBlank',
            mode: 'live',
            props: { points: 5, mode: 'live', blanks: [{}, {}, {}] },
        } as Component
        expect(getComponentScoringUnits(fib)).toBe(3)
        expect(maxStarsForLiveComponent(fib)).toBe(15)
    })
})

describe('E7 component completion status', () => {
    it('treats canonical status and legacy flags as complete', () => {
        expect(isComponentCompleted({ status: 'completed' })).toBe(true)
        expect(isComponentCompleted({ isSubmitted: true })).toBe(true)
        expect(isComponentCompleted({ submitted: true })).toBe(true)
        expect(isComponentCompleted({ isComplete: true })).toBe(true)
        expect(isComponentCompleted({ completed: true })).toBe(true)
        expect(isComponentCompleted({ hasVoted: true })).toBe(true)
        expect(isComponentCompleted({ status: 'active' })).toBe(false)
        expect(isComponentCompleted(null)).toBe(false)
        expect(isComponentCompleted({ isSubmitted: true, isPendingMarking: true })).toBe(false)
        expect(isComponentCompleted({ status: 'completed', isPendingMarking: true, tutorMarked: false })).toBe(false)
        expect(isComponentCompleted({ isSubmitted: true, isPendingMarking: true, tutorMarked: true })).toBe(true)
    })

    it('lets students leave a tutor-marked block after they submit, before the tutor scores it', () => {
        expect(isComponentReadyToAdvance({ isSubmitted: true, isPendingMarking: true, status: 'pending' })).toBe(true)
        expect(isComponentReadyToAdvance({ status: 'pending' })).toBe(true)
        expect(isComponentReadyToAdvance({ status: 'active' })).toBe(false)
        expect(isComponentReadyToAdvance({ isSubmitted: true })).toBe(true)
        expect(read('components/viewer/LessonContent.tsx')).toContain('isComponentReadyToAdvance')
    })

    it('gates slides and interactive wrappers through the helper', () => {
        expect(read('components/viewer/LessonContent.tsx')).toContain('isComponentCompleted')
        expect(read('components/renderers/base/interactive-renderer.tsx')).toContain('isComponentCompleted')
        expect(read('domain/component-status.ts')).toContain('status === \'completed\'')
    })
})
