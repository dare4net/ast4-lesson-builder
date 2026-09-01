'use client'

import { useEffect, useState } from 'react'
import { superadminClient } from '@/lib/superadmin-client'
import {
    type CatalogLessonTarget,
    type MissionFilters,
    type MissionStatKey,
    canUsePerfectAttempt,
} from '@/lib/gamification-catalog'

export type LessonTarget = CatalogLessonTarget & {
    moduleTitle?: string
    published?: boolean
}

export function useSuperadminLessonTargets() {
    const [lessonTargets, setLessonTargets] = useState<LessonTarget[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        void superadminClient
            .listTargets()
            .then((targetRes) => {
                if (!cancelled) {
                    setLessonTargets(Array.isArray(targetRes?.lessons) ? targetRes.lessons : [])
                }
            })
            .catch(() => {
                if (!cancelled) setLessonTargets([])
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    return { lessonTargets, loading }
}

export type MissionDraft = {
    id: string
    level: number
    title: string
    description: string
    targetCount: number
    rewardStars: number
    stat: MissionStatKey
    filters: MissionFilters
    enabled: boolean
}

export const emptyMission = (level = 1): MissionDraft => ({
    id: '',
    level,
    title: '',
    description: '',
    targetCount: 1,
    rewardStars: 3,
    stat: 'programsEnrolled',
    filters: {},
    enabled: true,
})

export function nextMissionFilters(
    current: MissionFilters,
    patch: Partial<MissionFilters>,
    lessons: LessonTarget[],
): MissionFilters {
    const next = { ...current, ...patch }
    if (!canUsePerfectAttempt(next, lessons)) next.perfect = undefined
    return next
}
