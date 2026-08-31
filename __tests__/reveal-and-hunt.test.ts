import { describe, expect, it } from 'vitest'
import { CERTIFICATE_PRINT_COST, certificateFileStem, formatPrintDay } from '@/lib/certificates'
import { shouldRevealAnswer } from '@/lib/reveal'
import { mergeLessonHunt, summarizeLessonHunt } from '@/lib/lesson-hunt'
import type { Component } from '@/types/lesson'

describe('shouldRevealAnswer', () => {
    it('reveals only in live mode', () => {
        expect(shouldRevealAnswer('live')).toBe(true)
        expect(shouldRevealAnswer('practice')).toBe(false)
        expect(shouldRevealAnswer(undefined)).toBe(false)
        expect(shouldRevealAnswer(null)).toBe(false)
    })
})

describe('summarizeLessonHunt', () => {
    it('splits live stars from practice points', () => {
        const quiz = {
            id: 'q1',
            type: 'quiz',
            props: {
                points: 5,
                mode: 'live',
                questions: [{ id: 'a' }, { id: 'b' }],
            },
        } as Component
        const practice = {
            id: 'tf1',
            type: 'trueFalse',
            props: { points: 10, mode: 'practice' },
        } as Component

        const hunt = summarizeLessonHunt([
            { title: 'Warmup', components: [practice] },
            { title: 'Live quiz', components: [quiz] },
        ])

        expect(hunt.practicePoints).toBe(10)
        expect(hunt.livePoints).toBe(10)
        expect(hunt.totalPoints).toBe(20)
        expect(hunt.maxStars).toBe(5)
        expect(hunt.activities).toHaveLength(2)
        expect(hunt.activities[0].mode).toBe('practice')
        expect(hunt.activities[1].maxStars).toBe(5)
    })
})

describe('mergeLessonHunt', () => {
    it('returns numbers the lesson details modal can store', () => {
        const merged = mergeLessonHunt({ lessonId: 'L1', title: 'Hello' }, [])
        expect(merged.lessonId).toBe('L1')
        expect(merged.totalSlides).toBe(0)
        expect(merged.obtainablePoints).toBe(0)
        expect(merged.interactiveCount).toBe(0)
        expect(Array.isArray(merged.activities)).toBe(true)
    })
})

describe('certificates', () => {
    it('stamps a UTC print day and keeps a cheap repeatable cost', () => {
        expect(CERTIFICATE_PRINT_COST).toBe(5)
        expect(formatPrintDay('2026-08-31T08:15:00.000Z')).toBe('31 August 2026')
        expect(certificateFileStem({
            kind: 'pride',
            studentName: 'Maya',
            boardLabel: 'Login streak',
            printedAt: '2026-08-31T08:15:00.000Z',
            valueLabel: '12',
            rank: 3,
        })).toContain('pride-login-streak-31-august-2026')
    })
})

describe('pride share-card themes', () => {
    it('gives featured boards their own colors, patterns, and mascot looks', async () => {
        const { prideCardTheme } = await import('@/lib/pride-card-themes')
        const streak = prideCardTheme('loginStreak')
        const stars = prideCardTheme('lifetimeStars')
        const quizzes = prideCardTheme('quizzesCompleted')
        expect(streak.bg).toBe('#FF9600')
        expect(streak.patternStyle).toBe('sunburst')
        expect(streak.impression).toBe('hype')
        expect(stars.bg).not.toBe(streak.bg)
        expect(quizzes.patternStyle).toBe('grid')
        expect(prideCardTheme('fastestLive:quiz').impression).toBe('hype')
        expect(['sunburst', 'dots', 'stripes', 'chevrons', 'grid', 'rings', 'dashes', 'squares'])
            .toContain(prideCardTheme('anagramCompleted').patternStyle)
    })
})
