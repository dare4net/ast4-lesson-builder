/**
 * Generic Mission & Level Engine
 *
 * Missions are data: { stat, targetCount, level, rewardStars, filters? }.
 * Completing all enabled missions for a level advances the student.
 * Adding missions at a new level number creates that level — no code change.
 */

import type { MissionFilters, MissionStatKey } from '@/lib/gamification-catalog'

export interface Mission {
    id: string
    level: number
    title: string
    description: string
    targetCount: number
    rewardStars: number
    stat: MissionStatKey
    filters?: MissionFilters
    enabled?: boolean
}

export const PLATFORM_MISSIONS: Mission[] = [
    {
        id: 'l1-enroll-program',
        level: 1,
        title: 'Program Explorer',
        description: 'Enroll in at least 1 program',
        targetCount: 1,
        rewardStars: 3,
        stat: 'programsEnrolled',
    },
    {
        id: 'l1-earn-stars',
        level: 1,
        title: 'Star Collector',
        description: 'Earn 5 Stars in Live Mode',
        targetCount: 5,
        rewardStars: 5,
        stat: 'starsEarned',
    },
    {
        id: 'l1-reset-component',
        level: 1,
        title: 'Perfectionist',
        description: 'Reset a practice component to challenge your attempt record',
        targetCount: 1,
        rewardStars: 2,
        stat: 'componentsReset',
    },
    {
        id: 'l2-spend-stars',
        level: 2,
        title: 'Big Spender',
        description: 'Spend 5 Stars in the Rewards Store',
        targetCount: 5,
        rewardStars: 5,
        stat: 'starsSpent',
    },
    {
        id: 'l2-streak-3',
        level: 2,
        title: 'Hat-Trick',
        description: 'Complete 3 components correctly in a row',
        targetCount: 3,
        rewardStars: 10,
        stat: 'consecutiveCorrect',
    },
    {
        id: 'l2-review-lesson',
        level: 2,
        title: 'Scholar',
        description: 'Replay or review a completed lesson',
        targetCount: 1,
        rewardStars: 4,
        stat: 'lessonsReviewed',
    },
]

export interface SubmitTypeCounts {
    total?: number
    live?: number
    practice?: number
    perfect?: number
    perfectLive?: number
    perfectPractice?: number
    byType?: Record<string, SubmitTypeCounts>
}

export interface MissionStats {
    programsEnrolled?: number
    starsEarned?: number
    lifetimeStarsEarned?: number
    componentsReset?: number
    starsSpent?: number
    consecutiveCorrect?: number
    lessonsReviewed?: number
    lessonsCompleted?: number
    totalSubmits?: number
    liveSubmits?: number
    practiceSubmits?: number
    perfectSubmits?: number
    perfectLiveSubmits?: number
    perfectPracticeSubmits?: number
    submitsByType?: Record<string, SubmitTypeCounts>
    submitsByLesson?: Record<string, SubmitTypeCounts>
    submitsByComponent?: Record<string, SubmitTypeCounts>
    completedLessonsCount?: number
    totalBaselineScore?: number
}

export interface LevelProgress {
    currentLevel: number
    completedMissionIds: string[]
    activeMissions: Array<Mission & { currentCount: number; isCompleted: boolean }>
    canLevelUp: boolean
}

function sanitizeProgressKey(value?: string) {
    if (typeof value !== 'string') return ''
    return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128)
}

function countFromBag(bag: SubmitTypeCounts | undefined, mode: string, perfect: boolean): number {
    if (!bag) return 0
    if (perfect && mode === 'live') return Number(bag.perfectLive) || 0
    if (perfect && mode === 'practice') return Number(bag.perfectPractice) || 0
    if (perfect) return Number(bag.perfect) || 0
    if (mode === 'live' || mode === 'practice') return Number(bag[mode]) || 0
    return Number(bag.total) || 0
}

function countSubmits(stats: MissionStats = {}, filters: MissionFilters = {}): number {
    const type = typeof filters.type === 'string' ? filters.type.replace(/[^a-zA-Z0-9]/g, '') : ''
    const mode = filters.mode === 'live' || filters.mode === 'practice' ? filters.mode : ''
    const perfect = filters.perfect === true
    const lessonId = sanitizeProgressKey(filters.lessonId)
    const componentId = sanitizeProgressKey(filters.componentId)

    if (componentId) {
        const key = lessonId ? `${lessonId}__${componentId}` : componentId
        return countFromBag(stats.submitsByComponent?.[key], mode, perfect)
    }
    if (lessonId) {
        const lessonBag = stats.submitsByLesson?.[lessonId]
        if (type) return countFromBag(lessonBag?.byType?.[type], mode, perfect)
        return countFromBag(lessonBag, mode, perfect)
    }
    if (type) return countFromBag(stats.submitsByType?.[type], mode, perfect)
    if (perfect && mode === 'live') return Number(stats.perfectLiveSubmits) || 0
    if (perfect && mode === 'practice') return Number(stats.perfectPracticeSubmits) || 0
    if (perfect) return Number(stats.perfectSubmits) || 0
    if (mode === 'live') return Number(stats.liveSubmits) || 0
    if (mode === 'practice') return Number(stats.practiceSubmits) || 0
    return Number(stats.totalSubmits) || 0
}

export function countForMission(mission: Mission, stats: MissionStats = {}): number {
    if (mission.stat === 'submits') return countSubmits(stats, mission.filters || {})
    if (mission.stat === 'lessonsCompleted') {
        return Number(stats.lessonsCompleted ?? stats.completedLessonsCount) || 0
    }
    return Number(stats[mission.stat as keyof MissionStats]) || 0
}

/**
 * Evaluate level and active mission progress for a student based on metrics.
 * Pass `catalog` from GET /missions/catalog so Studio-created missions appear.
 */
export function evaluateLevelProgress({
    currentLevel = 1,
    completedMissionIds = [],
    stats = {},
    catalog = PLATFORM_MISSIONS,
}: {
    currentLevel?: number
    completedMissionIds?: string[]
    stats?: MissionStats
    catalog?: Mission[]
}): LevelProgress {
    const enabled = (catalog || PLATFORM_MISSIONS).filter((m) => m.enabled !== false)
    const levelMissions = enabled.filter((m) => m.level === currentLevel)

    const activeMissions = levelMissions.map((m) => {
        const currentCount = countForMission(m, stats)
        const isCompleted = completedMissionIds.includes(m.id) || currentCount >= m.targetCount

        return {
            ...m,
            currentCount: Math.min(currentCount, m.targetCount),
            isCompleted,
        }
    })

    const canLevelUp = activeMissions.length > 0
        && activeMissions.every((m) => completedMissionIds.includes(m.id))

    return {
        currentLevel,
        completedMissionIds,
        activeMissions,
        canLevelUp,
    }
}
