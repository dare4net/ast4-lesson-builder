import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getRegistryEntry } from '@/lib/component-registry'

describe('B3 registry matches renderer wrappers', () => {
    it('spinTheWheel is scored and uses ScoredRenderer', () => {
        const entry = getRegistryEntry('spinTheWheel')
        expect(entry?.scored).toBe(true)
        expect(entry?.wrapper).toBe('scored')
        const source = readFileSync(join(process.cwd(), 'components/renderers/spin-the-wheel-renderer.tsx'), 'utf8')
        expect(source).toContain('ScoredRenderer')
        expect(source).toContain('handlePoints(earned)')
    })

    it('timeline is scored and uses ScoredRenderer', () => {
        const entry = getRegistryEntry('timeline')
        expect(entry?.scored).toBe(true)
        expect(entry?.wrapper).toBe('scored')
        const source = readFileSync(join(process.cwd(), 'components/renderers/timeline-renderer.tsx'), 'utf8')
        expect(source).toContain('ScoredRenderer')
        expect(source).not.toMatch(/<InteractiveRenderer/)
        expect(source).toContain('handlePoints(points)')
    })
})
