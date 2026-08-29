import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('A11 typecheck and lint are enforced', () => {
    it('does not ignore TypeScript or ESLint errors at build time', () => {
        const source = readFileSync(join(process.cwd(), 'next.config.mjs'), 'utf8')
        expect(source).not.toMatch(/ignoreBuildErrors\s*:\s*true/)
        expect(source).not.toMatch(/ignoreDuringBuilds\s*:\s*true/)
    })

    it('has an ESLint config and lint/typecheck scripts', () => {
        const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))
        expect(pkg.scripts.lint).toMatch(/eslint/)
        expect(pkg.scripts.typecheck).toMatch(/tsc/)
        const eslintConfig = readFileSync(join(process.cwd(), 'eslint.config.mjs'), 'utf8')
        expect(eslintConfig).toContain('eslint-config-next')
    })
})
