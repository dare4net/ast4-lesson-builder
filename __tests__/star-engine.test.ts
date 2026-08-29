import { describe, it, expect } from 'vitest'
import { calculateStarReward } from '@/lib/star-engine'

describe('calculateStarReward', () => {
    it('returns 0 stars for practice mode regardless of score or speed', () => {
        const result = calculateStarReward({
            mode: 'practice',
            percentage: 100,
            completionTimeMs: 1000,
            timeLimitMs: 60000,
        })
        expect(result.totalStars).toBe(0)
        expect(result.baseStars).toBe(0)
        expect(result.speedBonusStars).toBe(0)
    })

    it('awards 5 base stars for 90-100% score in live mode', () => {
        const r1 = calculateStarReward({ mode: 'live', percentage: 95 })
        expect(r1.baseStars).toBe(5)

        const r2 = calculateStarReward({ mode: 'live', percentage: 90 })
        expect(r2.baseStars).toBe(5)
    })

    it('awards correct accuracy tier stars (4 for 75-89%, 3 for 55-74%, 2 for 35-54%, 1 for <35%, 0 for 0%)', () => {
        expect(calculateStarReward({ mode: 'live', percentage: 80 }).baseStars).toBe(4)
        expect(calculateStarReward({ mode: 'live', percentage: 60 }).baseStars).toBe(3)
        expect(calculateStarReward({ mode: 'live', percentage: 40 }).baseStars).toBe(2)
        expect(calculateStarReward({ mode: 'live', percentage: 20 }).baseStars).toBe(1)
        expect(calculateStarReward({ mode: 'live', percentage: 0 }).baseStars).toBe(0)
    })

    it('adds +2 speed bonus stars if finished in under 50% of time limit', () => {
        const result = calculateStarReward({
            mode: 'live',
            percentage: 100,
            completionTimeMs: 20000,
            timeLimitMs: 60000, // 33% time used
        })
        expect(result.baseStars).toBe(5)
        expect(result.speedBonusStars).toBe(2)
        expect(result.totalStars).toBe(7)
    })

    it('adds +1 speed bonus star if finished in 50% to 74% of time limit', () => {
        const result = calculateStarReward({
            mode: 'live',
            percentage: 90,
            completionTimeMs: 36000,
            timeLimitMs: 60000, // 60% time used
        })
        expect(result.speedBonusStars).toBe(1)
        expect(result.totalStars).toBe(6)
    })

    it('applies -1 timeout penalty when timed out and floors total stars at 0', () => {
        const r1 = calculateStarReward({
            mode: 'live',
            percentage: 60,
            isTimeout: true,
        })
        expect(r1.baseStars).toBe(3)
        expect(r1.timeoutPenalty).toBe(-1)
        expect(r1.totalStars).toBe(2)

        // Floor at 0 check
        const r2 = calculateStarReward({
            mode: 'live',
            percentage: 0,
            isTimeout: true,
        })
        expect(r2.totalStars).toBe(0)
    })
})
