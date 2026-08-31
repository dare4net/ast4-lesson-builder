import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { formatPrideValue, gapCopy } from '@/lib/pride-format'
import { PRIDE_INDEX_PATH, prideBoardPath, publicProfilePath } from '@/lib/pride-paths'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('W2 pride stats and crowns', () => {
    it('exposes student-dashboard pride boards without email', () => {
        const index = read('app/dashboard/student/pride/page.tsx')
        const board = read('app/dashboard/student/pride/[statKey]/page.tsx')
        expect(index).toContain('usePrideSummary')
        expect(index).toContain('GoldHint')
        expect(index).toContain('hasPrideRecord')
        expect(index).toContain('All scored blocks')
        expect(index).toContain('Fastest live by block')
        expect(index).toContain('Updating…')
        expect(index).toContain('CrownMark crown={stat.you?.crown} rank={stat.you?.rank}')
        expect(board).toContain('usePrideBoard')
        expect(board).toContain('gapToNext')
        expect(board).toContain('Make your profile public')
        expect(read('hooks/use-pride.ts')).toContain("refetchOnMount: 'always'")
        expect(read('hooks/use-pride.ts')).toContain('apiClient.pride.summary')
        expect(read('hooks/use-pride.ts')).toContain('apiClient.pride.board')
        expect(index).not.toContain('email')
        expect(board).not.toContain('email')
        expect(read('lib/api-client.ts')).toContain("this.get('/pride')")
        expect(read('lib/api-client.ts')).toContain('`/pride/${encodeURIComponent(statKey)}`')
        expect(read('app/pride/page.tsx')).toContain('redirect(PRIDE_INDEX_PATH)')
        expect(read('app/pride/[statKey]/page.tsx')).toContain('prideBoardPath')
        expect(PRIDE_INDEX_PATH).toBe('/dashboard/student/pride')
        expect(prideBoardPath('fastestLive:quiz')).toBe('/dashboard/student/pride/fastestLive%3Aquiz')
    })

    it('sends completionTimeMs on progress events and toasts gold crowns', () => {
        expect(read('lib/contracts.ts')).toContain('completionTimeMs')
        expect(read('lib/achievement-listener.ts')).toContain('completionTimeMs: payload.completionTimeMs')
        expect(read('lib/achievement-listener.ts')).toContain("appEventBus.emit('CROWN_GOLD'")
        expect(read('lib/event-bus.ts')).toContain('CROWN_GOLD')
        expect(read('components/ui/gamification-toast.tsx')).toContain("type: 'crown'")
        expect(read('components/ui/gamification-toast.tsx')).toContain("on('CROWN_GOLD'")
    })

    it('shows crowns on public profiles and Pride in student nav', () => {
        const profile = read('components/pride/public-profile.tsx')
        expect(profile).toContain('goldCrowns')
        expect(profile).toContain('silverCrowns')
        expect(profile).toContain('bronzeCrowns')
        expect(profile).toContain('Pride wall')
        expect(profile).not.toContain('profile.email')
        expect(profile).not.toContain('user.email')
        expect(read('app/u/[handle]/page.tsx')).toContain('publicProfilePath')
        expect(read('app/dashboard/student/u/[handle]/page.tsx')).toContain('PublicProfileView')
        expect(read('components/pride/pride-search.tsx')).toContain('Gold boards')
        expect(read('components/pride/pride-search.tsx')).toContain('board.gold.displayName')
        expect(read('components/pride/pride-search.tsx')).toContain('useCurriculumSearch')
        expect(read('app/dashboard/student/pride/page.tsx')).toContain('CrownMark crown={stat.you?.crown} rank={stat.you?.rank}')
        expect(read('components/dashboard/dashboard-header.tsx')).toContain('PrideSearch')
        expect(publicProfilePath('Maya_Codes')).toBe('/dashboard/student/u/maya_codes')
        expect(read('components/dashboard/sidebar/student-sidebar.tsx')).toContain('href: "/dashboard/student/pride"')
        expect(read('components/dashboard/sidebar/student-mobile-nav.tsx')).toContain('href: "/dashboard/student/pride"')
        expect(read('app/dashboard/student/progress/page.tsx')).toContain('href="/dashboard/student/pride"')
    })

    it('formats values and gap-to-next copy', () => {
        expect(formatPrideValue(null)).toBe('—')
        expect(formatPrideValue(1400, 'ms')).toBe('1.4s')
        expect(formatPrideValue(12, 'count')).toBe('12')
        expect(gapCopy(0, 'count', 'desc')).toBe('Tied — they got there first')
        expect(gapCopy(2, 'count', 'desc')).toBe('2 ahead of you')
        expect(gapCopy(900, 'ms', 'asc')).toBe('900ms faster than you')
        expect(gapCopy(1400, 'ms', 'asc')).toBe('1.4s faster than you')
    })
})
