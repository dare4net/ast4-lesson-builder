import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('E4 polls and word clouds on Express', () => {
    it('does not keep a Next filesystem polls API', () => {
        expect(existsSync(join(process.cwd(), 'app/api/polls/route.ts'))).toBe(false)
        expect(existsSync(join(process.cwd(), 'data/polls/default.json'))).toBe(false)
        expect(read('hooks/use-poll-store.ts')).toContain('apiClient.live.getPoll')
        expect(read('hooks/use-poll-store.ts')).toContain('apiClient.live.votePoll')
        expect(read('hooks/use-poll-store.ts')).not.toContain("fetch(\"/api/polls\"")
    })

    it('word-cloud renderer stores and fetches class counts through apiClient', () => {
        const source = read('components/renderers/word-cloud-renderer.tsx')
        expect(source).toContain('apiClient.live.getWordCloud')
        expect(source).toContain('apiClient.live.addWordCloudWord')
        expect(read('lib/api-client.ts')).toContain("this.post('/wordclouds'")
        expect(read('lib/api-client.ts')).toContain("this.post('/polls'")
    })
})
