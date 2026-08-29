import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('E1 service boundary', () => {
    it('saves interactions through apiClient to Express, not Next Mongo', () => {
        expect(read('lib/user-interactions.ts')).toContain('apiClient.interactions')
        expect(read('lib/user-interactions.ts')).not.toContain('fetch("/api/interactions"')
        expect(read('lib/api-client.ts')).toContain("this.post('/interactions'")
        expect(existsSync(join(process.cwd(), 'pages/api/interactions.ts'))).toBe(false)
        expect(existsSync(join(process.cwd(), 'pages/api/lessons/[id].ts'))).toBe(false)
        expect(existsSync(join(process.cwd(), 'pages/api/users/[userId]/lessons.ts'))).toBe(false)
    })
})
