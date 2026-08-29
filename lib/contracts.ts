import { z } from 'zod'

/** Seed IDs. New missions use catalogIdSchema — keep in sync with backend seed. */
export const MISSION_IDS = [
    'l1-enroll-program',
    'l1-earn-stars',
    'l1-reset-component',
    'l2-spend-stars',
    'l2-streak-3',
    'l2-review-lesson',
] as const

export const catalogIdSchema = z.string().min(1).max(64).regex(
    /^[a-z][a-z0-9-]*$/,
    'Use a lowercase slug like l3-complete-three-lessons'
)

export const PROGRESS_EVENT_TYPES = [
    'COMPONENT_RESET',
    'LESSON_REVIEWED',
    'COMPONENT_SUBMITTED',
    'LESSON_COMPLETED',
    'PROGRAM_ENROLLED',
    'STARS_AWARDED',
    'STARS_SPENT',
] as const

export const awardStarsBodySchema = z.object({
    amount: z.number().positive(),
    reason: z.string().min(1).optional(),
    componentId: z.string().min(1).optional(),
})

export const spendStarsBodySchema = z.object({
    amount: z.number().positive(),
    itemType: z.string().min(1).optional(),
})

export const statsEventBodySchema = z.object({
    eventType: z.enum(PROGRESS_EVENT_TYPES),
    isFirstAttempt: z.boolean().optional(),
    percentage: z.number().min(0).max(100).optional(),
    mode: z.enum(['live', 'practice']).optional(),
    type: z.string().min(1).max(64).optional(),
    amount: z.number().positive().optional(),
    lessonId: z.string().min(1).max(128).optional(),
    programId: z.string().min(1).max(128).optional(),
})

export const claimMissionBodySchema = z.object({
    missionId: catalogIdSchema,
})

export const interactionSaveBodySchema = z.object({
    userId: z.string().min(1).optional(),
    lessonId: z.string().min(1),
    componentsState: z.record(z.any()).optional().default({}),
    lessonState: z.record(z.any()).optional(),
    attemptsMap: z.record(z.object({
        firstAttemptCount: z.number().nullable(),
        bestAttemptCount: z.number().nullable(),
    })).optional(),
    version: z.number().int().min(0).optional(),
})

export type AwardStarsBody = z.infer<typeof awardStarsBodySchema>
export type SpendStarsBody = z.infer<typeof spendStarsBodySchema>
export type StatsEventBody = z.infer<typeof statsEventBodySchema>
export type ClaimMissionBody = z.infer<typeof claimMissionBodySchema>
export type InteractionSaveBody = z.input<typeof interactionSaveBodySchema>

export const CONTRACT_KEYS = {
    awardStars: ['amount', 'reason', 'componentId'],
    spendStars: ['amount', 'itemType'],
    statsEvent: ['eventType', 'isFirstAttempt', 'percentage', 'mode', 'type', 'amount', 'lessonId', 'programId'],
    claimMission: ['missionId'],
    interactionGet: ['lessonId', 'userId'],
    interactionSave: ['userId', 'lessonId', 'componentsState', 'lessonState', 'attemptsMap', 'version'],
    missionIds: [...MISSION_IDS],
    progressEventTypes: [...PROGRESS_EVENT_TYPES],
} as const
