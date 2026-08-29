import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { apiClient } from '@/lib/api-client'
import { loadLeaderboardRows } from '@/lib/leaderboard-fetch'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('C6 strip dashboard lies', () => {
    it('does not keep fake search, bell, or dead header menu items', () => {
        const header = read('components/dashboard/dashboard-header.tsx')
        expect(header).not.toContain('⌘K')
        expect(header).not.toContain('Identity Overview')
        expect(header).not.toContain('System Settings')
        expect(header).not.toMatch(/lucide-react'[\s\S]*Bell/)
    })

    it('settings save calls PUT /profile', () => {
        expect(read('app/dashboard/student/settings/page.tsx')).toContain('profile.update')
        expect(read('app/dashboard/tutor/settings/page.tsx')).toContain('profile.update')
        expect(read('lib/api-client.ts')).toContain("this.put('/profile'")
    })

    it('hides forgot-password until it exists', () => {
        expect(read('app/auth/login/page.tsx')).not.toContain('Forgot password')
        expect(read('app/auth/login/page.tsx')).not.toContain('href="#"')
    })

    it('dashboard pages do not use alert or confirm', () => {
        const files = [
            'app/dashboard/student/catalog/page.tsx',
            'app/dashboard/student/programs/[id]/page.tsx',
            'app/dashboard/student/settings/page.tsx',
            'app/dashboard/tutor/settings/page.tsx',
            'app/dashboard/student/progress/page.tsx',
        ]
        for (const file of files) {
            const source = read(file)
            expect(source, file).not.toMatch(/\balert\(/)
            expect(source, file).not.toMatch(/\bconfirm\(/)
        }
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).toContain('AlertDialog')
    })

    it('posts raw earned and possible points, not a 0–100 percentage', () => {
        expect(read('lib/api-client.ts')).toContain('{ score, maxScore }')
        expect(read('components/viewer/LessonViewer.tsx')).toContain('earnedPoints, possiblePoints')
        expect(read('components/gamification/GamificationHubModal.tsx')).toContain('>Points<')
        expect(read('app/dashboard/student/progress/page.tsx')).toContain('>Points<')
        expect(read('app/dashboard/student/progress/page.tsx')).not.toContain('Total Baseline Score')
    })

    it('leaderboard tabs fetch different endpoints', () => {
        const progress = read('app/dashboard/student/progress/page.tsx')
        expect(progress).toContain("setLeaderboardType('personal')")
        expect(progress).not.toContain("setLeaderboardType('program')")
        expect(progress).toContain('No ranking data yet')
        expect(progress).not.toContain('Spend 15 Stars')
        expect(read('components/gamification/GamificationHubModal.tsx')).not.toContain('Spend 15 Stars')
        expect(read('components/gamification/GamificationHubModal.tsx')).not.toContain("setLeaderboardType('program')")
    })
})

describe('loadLeaderboardRows', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('maps global rows from totalScore', async () => {
        vi.spyOn(apiClient.gamification, 'getGlobalLeaderboard').mockResolvedValue({
            success: true,
            leaderboard: [{ userId: 'a', name: 'Ada', rank: 2, totalScore: 40 }],
        })
        const rows = await loadLeaderboardRows('global')
        expect(rows).toEqual([{ userId: 'a', name: 'Ada', rank: 2, totalBaselineScore: 40 }])
    })

    it('maps personal rank to a single row', async () => {
        vi.spyOn(apiClient.gamification, 'getPersonalRank').mockResolvedValue({
            success: true,
            userId: 'me',
            name: 'Me',
            totalScore: 12,
        })
        const rows = await loadLeaderboardRows('personal')
        expect(rows).toEqual([{ userId: 'me', name: 'Me', rank: null, totalBaselineScore: 12 }])
    })
})
