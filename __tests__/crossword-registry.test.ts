import { describe, expect, it } from 'vitest'
import { COMPONENT_REGISTRY, isScoredComponentType } from '@/lib/component-registry'

describe('crossword registry', () => {
    it('has a single scored crossword entry', () => {
        const entries = COMPONENT_REGISTRY.filter((e) => e.type === 'crossword')
        expect(entries).toHaveLength(1)
        expect(entries[0].scored).toBe(true)
        expect(entries[0].wrapper).toBe('scored')
        expect(isScoredComponentType('crossword')).toBe(true)
    })
})
