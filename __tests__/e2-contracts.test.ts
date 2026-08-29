import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    CONTRACT_KEYS,
    MISSION_IDS,
    PROGRESS_EVENT_TYPES,
    awardStarsBodySchema,
    claimMissionBodySchema,
    interactionSaveBodySchema,
    spendStarsBodySchema,
    statsEventBodySchema,
} from '@/lib/contracts'

describe('E2 shared contracts', () => {
    it('exports generated payload types via Zod schemas', () => {
        expect(Object.keys(awardStarsBodySchema.shape)).toEqual([...CONTRACT_KEYS.awardStars])
        expect(Object.keys(spendStarsBodySchema.shape)).toEqual([...CONTRACT_KEYS.spendStars])
        expect(Object.keys(statsEventBodySchema.shape)).toEqual([...CONTRACT_KEYS.statsEvent])
        expect(Object.keys(claimMissionBodySchema.shape)).toEqual([...CONTRACT_KEYS.claimMission])
        expect(Object.keys(interactionSaveBodySchema.shape)).toEqual([...CONTRACT_KEYS.interactionSave])
        expect([...MISSION_IDS]).toEqual([...CONTRACT_KEYS.missionIds])
        expect([...PROGRESS_EVENT_TYPES]).toEqual([...CONTRACT_KEYS.progressEventTypes])
    })

    it('parses the same wallet, stats, mission, and interaction payloads as Express', () => {
        expect(awardStarsBodySchema.parse({ amount: 5, reason: 'quiz', componentId: 'c1' }).amount).toBe(5)
        expect(spendStarsBodySchema.parse({ amount: 2, itemType: 'hint' }).amount).toBe(2)
        expect(statsEventBodySchema.parse({ eventType: 'COMPONENT_RESET' }).eventType).toBe('COMPONENT_RESET')
        expect(claimMissionBodySchema.parse({ missionId: 'l1-enroll-program' }).missionId).toBe('l1-enroll-program')
        expect(
            interactionSaveBodySchema.parse({
                userId: 'user-1',
                lessonId: 'lesson-1',
                componentsState: { q1: { submitted: true } },
                lessonState: { lessonTitle: 'Test' },
                attemptsMap: { q1: { firstAttemptCount: 1, bestAttemptCount: 1 } },
            }).lessonId
        ).toBe('lesson-1')
    })

    it('rejects invalid client payloads before they are posted', () => {
        expect(awardStarsBodySchema.safeParse({ amount: 0 }).success).toBe(false)
        expect(statsEventBodySchema.safeParse({ eventType: 'UNKNOWN' }).success).toBe(false)
        expect(claimMissionBodySchema.safeParse({ missionId: 'not a mission' }).success).toBe(false)
        expect(claimMissionBodySchema.safeParse({ missionId: 'l3-custom-quest' }).success).toBe(true)
        expect(interactionSaveBodySchema.safeParse({ lessonId: '' }).success).toBe(false)
    })

    it('apiClient parses contract payloads before POST', () => {
        const source = readFileSync(join(process.cwd(), 'lib/api-client.ts'), 'utf8')
        expect(source).toContain('awardStarsBodySchema.parse')
        expect(source).toContain('spendStarsBodySchema.parse')
        expect(source).toContain('statsEventBodySchema.parse')
        expect(source).toContain('claimMissionBodySchema.parse')
        expect(source).toContain('interactionSaveBodySchema.parse')
    })
})
