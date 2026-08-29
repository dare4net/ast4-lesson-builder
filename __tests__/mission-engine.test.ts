import { describe, it, expect } from 'vitest'
import { evaluateLevelProgress, PLATFORM_MISSIONS } from '@/lib/mission-engine'

describe('evaluateLevelProgress', () => {
    it('returns Level 1 active missions by default', () => {
        const progress = evaluateLevelProgress({ currentLevel: 1 })
        expect(progress.currentLevel).toBe(1)
        expect(progress.activeMissions).toHaveLength(3)
        expect(progress.canLevelUp).toBe(false)
    })

    it('evaluates Level 1 mission completion based on stats', () => {
        const progress = evaluateLevelProgress({
            currentLevel: 1,
            stats: {
                programsEnrolled: 1, // l1-enroll-program completed
                starsEarned: 5,       // l1-earn-stars completed
                componentsReset: 1,   // l1-reset-component completed
            }
        })

        expect(progress.activeMissions.every(m => m.isCompleted)).toBe(true)
        expect(progress.canLevelUp).toBe(false)
    })

    it('allows level up only after every current-level mission is claimed', () => {
        const progress = evaluateLevelProgress({
            currentLevel: 1,
            completedMissionIds: ['l1-enroll-program', 'l1-earn-stars', 'l1-reset-component'],
            stats: {
                programsEnrolled: 1,
                starsEarned: 5,
                componentsReset: 1,
            }
        })
        expect(progress.canLevelUp).toBe(true)
    })

    it('returns Level 2 missions when currentLevel is 2', () => {
        const progress = evaluateLevelProgress({ currentLevel: 2 })
        expect(progress.currentLevel).toBe(2)
        expect(progress.activeMissions[0].id).toBe('l2-spend-stars')
    })

    it('creates a new level from catalog data without new mission ids in code', () => {
        const catalog = [
            ...PLATFORM_MISSIONS,
            {
                id: 'l3-review-two',
                level: 3,
                title: 'Double Scholar',
                description: 'Review 2 lessons',
                targetCount: 2,
                rewardStars: 6,
                stat: 'lessonsReviewed' as const,
            },
        ]
        const progress = evaluateLevelProgress({
            currentLevel: 3,
            catalog,
            stats: { lessonsReviewed: 2 },
        })
        expect(progress.activeMissions).toHaveLength(1)
        expect(progress.activeMissions[0].isCompleted).toBe(true)
        expect(progress.canLevelUp).toBe(false)
    })

    it('counts filtered live quiz submits from catalog data', () => {
        const catalog = [
            {
                id: 'l3-perfect-live-quizzes',
                level: 3,
                title: 'Quiz Ace',
                description: 'Score 100 on 3 live quizzes',
                targetCount: 3,
                rewardStars: 8,
                stat: 'submits' as const,
                filters: { mode: 'live' as const, type: 'quiz', perfect: true },
            },
        ]
        const incomplete = evaluateLevelProgress({
            currentLevel: 3,
            catalog,
            stats: { submitsByType: { quiz: { perfectLive: 2 } } },
        })
        expect(incomplete.activeMissions[0].isCompleted).toBe(false)
        expect(incomplete.activeMissions[0].currentCount).toBe(2)

        const complete = evaluateLevelProgress({
            currentLevel: 3,
            catalog,
            stats: { submitsByType: { quiz: { perfectLive: 3 } } },
        })
        expect(complete.activeMissions[0].isCompleted).toBe(true)
    })

    it('counts a specific lesson block without using other hangmen', () => {
        const catalog = [
            {
                id: 'l3-this-hangman',
                level: 3,
                title: 'This Hangman',
                description: 'Complete this hangman',
                targetCount: 1,
                rewardStars: 4,
                stat: 'submits' as const,
                filters: { lessonId: 'lesson-1', componentId: 'hang-1' },
            },
        ]
        const other = evaluateLevelProgress({
            currentLevel: 3,
            catalog,
            stats: { submitsByComponent: { 'lesson-2__hang-9': { total: 2 } }, submitsByType: { hangman: { total: 2 } } },
        })
        expect(other.activeMissions[0].isCompleted).toBe(false)
        const mine = evaluateLevelProgress({
            currentLevel: 3,
            catalog,
            stats: { submitsByComponent: { 'lesson-1__hang-1': { total: 1 } } },
        })
        expect(mine.activeMissions[0].isCompleted).toBe(true)
    })

    it('keeps the shared mission ID contract', () => {
        expect(PLATFORM_MISSIONS.map(m => m.id)).toEqual([
            'l1-enroll-program',
            'l1-earn-stars',
            'l1-reset-component',
            'l2-spend-stars',
            'l2-streak-3',
            'l2-review-lesson',
        ])
    })
})
