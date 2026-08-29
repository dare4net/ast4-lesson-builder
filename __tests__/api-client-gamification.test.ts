import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/api-client'

describe('gamification API client identity', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('does not put userId on wallet, stats, or personal leaderboard URLs', () => {
        const get = vi.spyOn(apiClient, 'get').mockResolvedValue({})

        apiClient.gamification.getStats()
        apiClient.gamification.getWallet()
        apiClient.gamification.getPersonalRank()

        expect(get).toHaveBeenCalledWith('/stats/summary')
        expect(get).toHaveBeenCalledWith('/wallet')
        expect(get).toHaveBeenCalledWith('/leaderboard/personal')
        for (const [url] of get.mock.calls) {
            expect(String(url)).not.toMatch(/userId=/)
        }
    })

    it('awardStars posts to /wallet/award without a userId', async () => {
        const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, starBalance: 8 })
        await apiClient.gamification.awardStars(5, 'Live completion: quiz', 'c1')
        expect(post).toHaveBeenCalledWith('/wallet/award', {
            amount: 5,
            reason: 'Live completion: quiz',
            componentId: 'c1',
        })
        expect(String(post.mock.calls[0][0])).not.toMatch(/userId=/)
    })

    it('claimMission and levelUp post to authenticated endpoints', async () => {
        const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true })
        await apiClient.gamification.claimMission('l1-enroll-program')
        await apiClient.gamification.levelUp()
        await apiClient.gamification.recordProgressEvent('COMPONENT_RESET')
        expect(post).toHaveBeenCalledWith('/missions/claim', { missionId: 'l1-enroll-program' })
        expect(post).toHaveBeenCalledWith('/level/up')
        expect(post).toHaveBeenCalledWith('/stats/event', { eventType: 'COMPONENT_RESET' })
    })

    it('getAchievements and evaluateAchievements hit the JWT achievements API', async () => {
        const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ success: true, achievements: [] })
        const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, newlyEarned: [] })
        await apiClient.gamification.getAchievements()
        await apiClient.gamification.evaluateAchievements('COMPONENT_SUBMITTED', { type: 'quiz' })
        expect(get).toHaveBeenCalledWith('/achievements/student')
        expect(post).toHaveBeenCalledWith('/achievements/evaluate', {
            eventType: 'COMPONENT_SUBMITTED',
            payload: { type: 'quiz' },
        })
    })

    it('getLessonDetails calls GET /lessons/:id and unwraps { lesson }', async () => {
        const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
            lesson: { id: 'L1', title: 'Hello' },
            interaction: { score: 1 },
        })
        const lesson = await apiClient.lessons.getLessonDetails('L1')
        expect(get).toHaveBeenCalledWith('/lessons/L1')
        expect(lesson).toEqual({ id: 'L1', title: 'Hello' })
    })
})
