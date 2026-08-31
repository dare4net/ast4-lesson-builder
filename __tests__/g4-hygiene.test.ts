import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateFrontendEnv } from '@/lib/env'

const root = process.cwd()
const read = (relative: string) => readFileSync(join(root, relative), 'utf8')

describe('G4 hygiene', () => {
    it('uses one pnpm lockfile and drops bogus packages', () => {
        expect(existsSync(join(root, 'pnpm-lock.yaml'))).toBe(true)
        expect(existsSync(join(root, 'package-lock.json'))).toBe(false)
        const pkg = JSON.parse(read('package.json'))
        expect(pkg.dependencies.latest).toBeUndefined()
        expect(pkg.dependencies.nextjs).toBeUndefined()
        expect(pkg.dependencies.pnpm).toBeUndefined()
        expect(pkg.dependencies['react-dnd']).not.toBe('latest')
        expect(pkg.packageManager).toMatch(/^pnpm@/)
    })

    it('ships an env example and keeps it out of the ignore list', () => {
        expect(existsSync(join(root, '.env.example'))).toBe(true)
        expect(read('.env.example')).toContain('JWT_SECRET=')
        expect(read('.env.example')).toContain('NEXT_PUBLIC_API_URL=')
        expect(read('.env.example')).toContain('NEXT_PUBLIC_FIREBASE_VAPID_KEY=')
        expect(read('.gitignore')).toContain('!.env.example')
        expect(read('README.md')).toContain('IMPLEMENTATION_ORDER.md')
        expect(read('instrumentation.ts')).toContain('validateFrontendEnv')
    })

    it('validates frontend env and requires JWT_SECRET outside tests', () => {
        expect(() => validateFrontendEnv({
            NEXT_PUBLIC_API_URL: 'not-a-url',
        }, { requireSecrets: false })).toThrow(/NEXT_PUBLIC_API_URL/)

        expect(() => validateFrontendEnv({
            NODE_ENV: 'production',
        }, { requireSecrets: true })).toThrow(/JWT_SECRET/)

        const parsed = validateFrontendEnv({
            JWT_SECRET: 'local-dev-secret-value',
            NEXT_PUBLIC_API_URL: 'http://localhost:5001/api',
        })
        expect(parsed.JWT_SECRET).toBe('local-dev-secret-value')
        expect(parsed.NEXT_PUBLIC_API_URL).toBe('http://localhost:5001/api')
    })
})
