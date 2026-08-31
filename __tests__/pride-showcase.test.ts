import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PrideStat } from '@/hooks/use-pride'
import { prideShowcasePageCount, prideShowcaseQueue, prideShowcaseWindow } from '@/lib/pride-showcase'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

function stat(key: string, extras: Partial<PrideStat> = {}): PrideStat {
    return {
        key,
        label: key,
        sort: 'desc',
        unit: '',
        group: 'featured',
        ...extras,
    }
}

describe('live pride showcase', () => {
    it('puts featured boards with holders first', () => {
        const queue = prideShowcaseQueue([
            stat('empty', { group: 'featured', leaders: [] }),
            stat('quiz', { group: 'type', leaders: [{ rank: 1, handle: 'a', displayName: 'A', value: 3, crown: 'gold' }] }),
            stat('streak', { group: 'featured', leaders: [{ rank: 1, handle: 'b', displayName: 'B', value: 9, crown: 'gold' }] }),
        ])
        expect(queue.map((item) => item.key)).toEqual(['streak', 'empty', 'quiz'])
    })

    it('pages four boards and wraps the last page', () => {
        const queue = ['a', 'b', 'c', 'd', 'e'].map((key) => stat(key))
        expect(prideShowcasePageCount(queue.length)).toBe(2)
        expect(prideShowcaseWindow(queue, 0).map((item) => item.key)).toEqual(['a', 'b', 'c', 'd'])
        expect(prideShowcaseWindow(queue, 1).map((item) => item.key)).toEqual(['e', 'a', 'b', 'c'])
    })

    it('is mounted on the student dashboard', () => {
        expect(read('app/dashboard/student/page.tsx')).toContain('LivePrideShowcase')
        expect(read('components/dashboard/student/live-pride-showcase.tsx')).toContain('gold')
        expect(read('components/dashboard/student/live-pride-showcase.tsx')).toContain('silver')
        expect(read('components/dashboard/student/live-pride-showcase.tsx')).toContain('bronze')
        expect(read('components/dashboard/student/live-pride-showcase.tsx')).toContain('usePrideSummary')
    })
})
