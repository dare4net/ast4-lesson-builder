import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { calculateComponentScore, calculateLessonScore } from '@/domain/scoring'
import { saveUserInteraction, getOfflineStorageKey } from '@/lib/user-interactions'
import { calculateStarReward } from '@/lib/star-engine'
import { initAchievementListener, resetStarAwardDedupe } from '@/lib/achievement-listener'
import { appEventBus } from '@/lib/event-bus'
import { apiClient } from '@/lib/api-client'
import type { Component, Lesson } from '@/types/lesson'

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        interactions: {
            save: vi.fn(),
        },
        gamification: {
            awardStars: vi.fn(),
            evaluateAchievements: vi.fn().mockResolvedValue({ success: true, newlyEarned: [] }),
            recordProgressEvent: vi.fn().mockResolvedValue({ success: true }),
        },
    },
}))

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')
const save = () => vi.mocked(apiClient.interactions.save)
const awardStars = () => vi.mocked(apiClient.gamification.awardStars)

function liveQuiz(): Component {
    return {
        id: 'quiz-1',
        type: 'quiz',
        mode: 'live',
        props: { points: 10, mode: 'live', questions: [{}, {}] },
    }
}

function lessonWith(components: Component[]): Lesson {
    return {
        id: 'lesson-1',
        title: 'Live quiz',
        description: '',
        author: '',
        level: '',
        duration: 0,
        createdAt: '',
        updatedAt: '',
        slides: [{ id: 'slide-1', title: 'One', status: 'uncompleted', state: 'active', components }],
    }
}

const savePayload = {
    componentsState: { 'quiz-1': { status: 'completed', score: 20 } },
    lessonState: {
        slides: [{ id: 'slide-1', state: 'active' as const, status: 'completed' as const }],
        currentSlideIndex: 0,
        lessonTitle: 'Live quiz',
        lessonDescription: '',
        score: 20,
    },
}

describe('G1 pull-model scoring', () => {
    it('rebuilds fill-in-the-blank points from correctAnswers when score is missing', () => {
        const blanks: Component = {
            id: 'fib-1',
            type: 'fillInTheBlank',
            mode: 'live',
            props: {
                points: 4,
                mode: 'live',
                blanks: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
            },
        }
        expect(
            calculateComponentScore(blanks, {
                isSubmitted: true,
                correctAnswers: { a: true, b: false, c: true },
            })
        ).toBe(8)
    })

    it('sums a completed live lesson from componentsState after reload', () => {
        const lesson = lessonWith([liveQuiz()])
        expect(calculateLessonScore(lesson, { 'quiz-1': { score: 20, status: 'completed' } })).toBe(20)
        expect(calculateLessonScore(lesson, { 'quiz-1': { score: 0, status: 'completed' } }, 99)).toBe(0)
    })
})

describe('G1 saveUserInteraction failure paths', () => {
    beforeEach(() => {
        localStorage.clear()
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
        save().mockReset()
    })

    it('returns success: false on 401 and keeps the local copy', async () => {
        save().mockRejectedValue({ response: { status: 401, data: { error: 'Unauthorized' } } })
        const result = await saveUserInteraction('user-1', 'lesson-1', savePayload)
        expect(result.success).toBe(false)
        expect(result.error).toBe('Unauthorized')
        expect(localStorage.getItem(getOfflineStorageKey('user-1', 'lesson-1'))).toBeTruthy()
    })
})

describe('G1 enrol → live complete → stars persist', () => {
    beforeEach(() => {
        appEventBus.clearAll()
        resetStarAwardDedupe()
        awardStars().mockReset()
        awardStars().mockResolvedValue({ success: true, starBalance: 5 })
        vi.mocked(apiClient.gamification.evaluateAchievements).mockResolvedValue({ success: true, newlyEarned: [] })
    })

    it('credits live-completion stars through the listener and keeps the returned balance', async () => {
        const balances: number[] = []
        const { onWalletStarBalance } = await import('@/lib/achievement-listener')
        const stop = onWalletStarBalance((balance) => balances.push(balance))
        const cleanup = initAchievementListener('user-1')

        appEventBus.emit('PROGRAM_ENROLLED', { programId: 'program-1' })
        appEventBus.emit('COMPONENT_SUBMITTED', {
            componentId: 'quiz-1',
            type: 'quiz',
            mode: 'live',
            score: 20,
            maxScore: 20,
            percentage: 100,
            attemptCount: 1,
            isFirstAttempt: true,
            completionTimeMs: 4000,
        })

        await vi.waitFor(() => expect(awardStars()).toHaveBeenCalledTimes(1))
        const expectedStars = calculateStarReward({ mode: 'live', percentage: 100 }).totalStars
        expect(expectedStars).toBeGreaterThan(0)
        expect(awardStars()).toHaveBeenCalledWith(expectedStars, expect.stringContaining('Live completion'), 'quiz-1')
        expect(balances[balances.length - 1]).toBe(5)

        cleanup()
        stop()
    })

    it('keeps wallet, stats, interaction, and mission contracts in the client POST path', () => {
        const source = read('lib/api-client.ts')
        expect(source).toContain("this.post('/wallet/award'")
        expect(source).toContain("this.post('/missions/claim'")
        expect(source).toContain("this.post('/interactions'")
        expect(source).toContain("this.get('/stats/summary'")
        expect(read('__tests__/e2-contracts.test.ts')).toContain('awardStarsBodySchema')
        expect(read('__tests__/user-interactions.test.ts')).toContain('success: false')
        expect(read('__tests__/e6-scoring.test.ts')).toContain('calculateLessonScore')
        expect(read('__tests__/mission-engine.test.ts')).toContain('evaluateLevelProgress')
        expect(read('__tests__/star-engine.test.ts')).toContain('calculateStarReward')
    })
})
