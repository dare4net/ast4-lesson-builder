import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('A12 CI workflow', () => {
    it('typechecks, lints, and tests on every PR', () => {
        const source = readFileSync(join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')
        expect(source).toContain('pnpm typecheck')
        expect(source).toContain('pnpm lint')
        expect(source).toContain('pnpm test')
    })
})
