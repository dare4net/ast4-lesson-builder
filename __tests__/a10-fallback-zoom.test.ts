import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('student-safe fallback and zoom', () => {
    it('does not show developer error copy in the fallback renderer', () => {
        const source = readFileSync(join(process.cwd(), 'components/renderers/fallback-renderer.tsx'), 'utf8')
        expect(source).not.toMatch(/Protocol Misalignment/)
        expect(source).not.toMatch(/Synchronization Failed/)
        expect(source).toMatch(/isn.t available/)
    })

    it('does not disable pinch-zoom', () => {
        const source = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8')
        expect(source).not.toMatch(/maximumScale:\s*1/)
    })
})
