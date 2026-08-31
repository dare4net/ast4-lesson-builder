import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { COMPONENT_REGISTRY, isScoredComponentType } from '@/lib/component-registry'

describe('crossword registry', () => {
    it('has a single scored crossword entry', () => {
        const entries = COMPONENT_REGISTRY.filter((e) => e.type === 'crossword')
        expect(entries).toHaveLength(1)
        expect(entries[0].scored).toBe(true)
        expect(entries[0].wrapper).toBe('scored')
        expect(isScoredComponentType('crossword')).toBe(true)
    })

    it('accepts typed letters from onChange so phone keyboards can fill cells', () => {
        const source = readFileSync(join(process.cwd(), 'components/renderers/crossword-renderer.tsx'), 'utf8')
        expect(source).toContain('handleCaptureChange')
        expect(source).toContain('selectedRef')
        expect(source).toContain('focusCapture')
        expect(source).toContain('autoCapitalize="characters"')
        expect(source).toContain('inputMode="text"')
        expect(source).not.toContain('inputRefs')
    })
})
