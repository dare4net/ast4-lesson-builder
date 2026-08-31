import type { PrideStat } from '@/hooks/use-pride'

export const PRIDE_SHOWCASE_SIZE = 4

function holderCount(stat: PrideStat) {
    return (stat.leaders || []).filter((row) => row?.handle || row?.displayName).length
}

/** Featured boards with holders first, then other live boards, then empty featured so the strip still runs. */
export function prideShowcaseQueue(stats: PrideStat[] = []): PrideStat[] {
    const featured: PrideStat[] = []
    const rest: PrideStat[] = []
    for (const stat of stats) {
        if (stat.group === 'featured' || stat.featured) featured.push(stat)
        else rest.push(stat)
    }
    const byHolders = (a: PrideStat, b: PrideStat) => holderCount(b) - holderCount(a)
    featured.sort(byHolders)
    rest.sort(byHolders)
    return [...featured, ...rest]
}

export function prideShowcaseWindow(queue: PrideStat[], page: number, size = PRIDE_SHOWCASE_SIZE): PrideStat[] {
    if (!queue.length) return []
    if (queue.length <= size) return queue
    const start = ((page % Math.ceil(queue.length / size)) * size) % queue.length
    const out: PrideStat[] = []
    for (let i = 0; i < size; i += 1) {
        out.push(queue[(start + i) % queue.length])
    }
    return out
}

export function prideShowcasePageCount(queueLength: number, size = PRIDE_SHOWCASE_SIZE) {
    if (queueLength <= 0) return 0
    if (queueLength <= size) return 1
    return Math.ceil(queueLength / size)
}
