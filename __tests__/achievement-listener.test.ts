import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initAchievementListener, resetStarAwardDedupe } from '@/lib/achievement-listener'
import { appEventBus } from '@/lib/event-bus'
import { apiClient } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        gamification: {
            awardStars: vi.fn().mockResolvedValue({ success: true, starBalance: 5 }),
            evaluateAchievements: vi.fn().mockResolvedValue({ success: true, newlyEarned: [] }),
            recordProgressEvent: vi.fn().mockResolvedValue({ success: true }),
        },
    },
}))

const awardStars = () => vi.mocked(apiClient.gamification.awardStars)
const evaluateAchievements = () => vi.mocked(apiClient.gamification.evaluateAchievements)

describe('initAchievementListener', () => {
    beforeEach(() => {
        appEventBus.clearAll()
        resetStarAwardDedupe()
        awardStars().mockReset()
        awardStars().mockResolvedValue({ success: true, starBalance: 5 })
        evaluateAchievements().mockReset()
        evaluateAchievements().mockResolvedValue({ success: true, newlyEarned: [] })
    })

    it('credits stars via awardStars and evaluates achievements via apiClient', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))
        const cleanup = initAchievementListener('user-123')

        appEventBus.emit('COMPONENT_SUBMITTED', {
            componentId: 'c1',
            type: 'memoryGrid',
            mode: 'live',
            score: 10,
            maxScore: 10,
            percentage: 100,
            attemptCount: 1,
            isFirstAttempt: true,
            completionTimeMs: 1500,
        })

        await vi.waitFor(() => expect(awardStars()).toHaveBeenCalled())
        expect(fetchSpy).not.toHaveBeenCalled()
        expect(evaluateAchievements()).toHaveBeenCalledWith(
            'COMPONENT_SUBMITTED',
            expect.objectContaining({ componentId: 'c1', type: 'memoryGrid' }),
        )
        expect(awardStars().mock.calls[0][0]).toBeGreaterThan(0)
        expect(awardStars()).toHaveBeenCalledWith(
            expect.any(Number),
            expect.stringContaining('Live completion'),
            'c1',
        )
        cleanup()
    })

    it('does not credit stars for practice submissions but still evaluates', async () => {
        const cleanup = initAchievementListener('user-123')
        appEventBus.emit('COMPONENT_SUBMITTED', {
            componentId: 'c1',
            type: 'quiz',
            mode: 'practice',
            score: 10,
            maxScore: 10,
            percentage: 100,
            attemptCount: 1,
            isFirstAttempt: true,
            completionTimeMs: 1500,
        })
        await Promise.resolve()
        expect(awardStars()).not.toHaveBeenCalled()
        expect(evaluateAchievements()).toHaveBeenCalledWith(
            'COMPONENT_SUBMITTED',
            expect.objectContaining({ mode: 'practice' }),
        )
        cleanup()
    })

    it('credits live early-finish via the star engine and does not double-award submit', async () => {
        const cleanup = initAchievementListener('user-123')
        appEventBus.emit('LIVE_EARLY_FINISH', {
            componentId: 'quiz-1',
            type: 'quiz',
            completionTimeMs: 20000,
            timeLimitMs: 60000,
        })
        await vi.waitFor(() => expect(awardStars()).toHaveBeenCalledTimes(1))
        expect(awardStars()).toHaveBeenCalledWith(7, expect.stringContaining('early finish'), 'quiz-1')
        expect(evaluateAchievements()).toHaveBeenCalledWith(
            'LIVE_EARLY_FINISH',
            expect.objectContaining({ componentId: 'quiz-1' }),
        )

        appEventBus.emit('COMPONENT_SUBMITTED', {
            componentId: 'quiz-1',
            type: 'quiz',
            mode: 'live',
            score: 10,
            maxScore: 10,
            percentage: 100,
            attemptCount: 1,
            isFirstAttempt: true,
            completionTimeMs: 20000,
        })
        await Promise.resolve()
        expect(awardStars()).toHaveBeenCalledTimes(1)
        cleanup()
    })

    it('subscribes to reset, enroll, and lesson-complete; evaluates lesson complete without live stars', async () => {
        const cleanup = initAchievementListener('user-123')
        expect(appEventBus.listenerCount('COMPONENT_RESET')).toBeGreaterThan(0)
        expect(appEventBus.listenerCount('PROGRAM_ENROLLED')).toBeGreaterThan(0)
        expect(appEventBus.listenerCount('LESSON_COMPLETED')).toBeGreaterThan(0)

        appEventBus.emit('COMPONENT_RESET', { componentId: 'c1', type: 'quiz' })
        appEventBus.emit('PROGRAM_ENROLLED', { programId: 'p1' })
        appEventBus.emit('LESSON_COMPLETED', {
            lessonId: 'l1',
            score: 10,
            maxScore: 10,
            percentage: 100,
        })
        await Promise.resolve()
        expect(awardStars()).not.toHaveBeenCalled()
        expect(evaluateAchievements()).toHaveBeenCalledWith(
            'COMPONENT_RESET',
            expect.objectContaining({ componentId: 'c1', type: 'quiz' }),
        )
        expect(evaluateAchievements()).toHaveBeenCalledWith(
            'PROGRAM_ENROLLED',
            expect.objectContaining({ programId: 'p1' }),
        )
        expect(evaluateAchievements()).toHaveBeenCalledWith(
            'LESSON_COMPLETED',
            expect.objectContaining({ lessonId: 'l1', percentage: 100 }),
        )
        cleanup()
    })

    it('unsubscribes listeners on cleanup call', async () => {
        const cleanup = initAchievementListener('user-123')
        cleanup()

        appEventBus.emit('COMPONENT_SUBMITTED', {
            componentId: 'c1',
            type: 'quiz',
            mode: 'live',
            score: 10,
            maxScore: 10,
            percentage: 100,
            attemptCount: 1,
            isFirstAttempt: true,
            completionTimeMs: 1500,
        })
        await Promise.resolve()
        expect(awardStars()).not.toHaveBeenCalled()
        expect(evaluateAchievements()).not.toHaveBeenCalled()
    })
})
