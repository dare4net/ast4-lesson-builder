import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { componentDefinitions } from '@/lib/component-definitions'
import { LIBRARY_GROUPS } from '@/lib/component-library-groups'

describe('component library groups', () => {
    it('places every library block in exactly one group', () => {
        const groupedTypes = LIBRARY_GROUPS.flatMap((group) => group.types)
        expect(new Set(groupedTypes).size).toBe(groupedTypes.length)

        const definitionTypes = componentDefinitions.map((definition) => definition.type)
        expect([...groupedTypes].sort()).toEqual([...definitionTypes].sort())
    })

    it('renders collapsible groups in the library', () => {
        const source = readFileSync(join(process.cwd(), 'components/component-library.tsx'), 'utf8')
        expect(source).toContain('LIBRARY_GROUPS')
        expect(source).toContain('Accordion')
        expect(source).not.toContain('value="gamified"')
        expect(source).not.toContain('Labs')
    })
})
