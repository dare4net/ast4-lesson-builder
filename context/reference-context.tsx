'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { SoundEffects } from '@/lib/sound-effects'
import { findLessonComponent, referencePayKey } from '@/lib/reference'
import type { Lesson, Component } from '@/types/lesson'

type ReferenceContextValue = {
    lesson: Lesson | null
    mode: 'practice' | 'live'
    preview: boolean
    contained: boolean
    componentStates: Record<string, any>
    setComponentState: (componentId: string, state: any) => void
    openId: string | null
    openComponent: Component | null
    open: (referenceId?: string | null, questionId?: string | null, sourceId?: string | null) => Promise<boolean>
    close: () => void
    error: string
}

const ReferenceContext = createContext<ReferenceContextValue | null>(null)

export function ReferenceProvider({
    lesson,
    mode = 'practice',
    preview = false,
    contained = false,
    componentStates,
    setComponentState,
    children,
}: {
    lesson: Lesson | null
    mode?: 'practice' | 'live'
    preview?: boolean
    contained?: boolean
    componentStates: Record<string, any>
    setComponentState: (componentId: string, state: any) => void
    children: ReactNode
}) {
    const queryClient = useQueryClient()
    const [openId, setOpenId] = useState<string | null>(null)
    const [paidKeys, setPaidKeys] = useState<Set<string>>(new Set())
    const [error, setError] = useState('')

    const openComponent = useMemo(
        () => (openId ? findLessonComponent(lesson, openId) as Component | null : null),
        [lesson, openId],
    )

    const open = useCallback(async (referenceId?: string | null, questionId?: string | null, sourceId?: string | null) => {
        if (!referenceId || !findLessonComponent(lesson, referenceId)) {
            setError('That reference is missing.')
            return false
        }
        const key = referencePayKey(sourceId || referenceId, questionId)
        if (preview || mode === 'practice' || paidKeys.has(key)) {
            setError('')
            setOpenId(referenceId)
            if (!preview && mode === 'practice') {
                void apiClient.store.openReference({ kind: 'practice', componentId: referenceId, questionId: questionId || undefined }).catch(() => {})
            }
            return true
        }
        try {
            const result = await apiClient.store.openReference({
                kind: 'live',
                componentId: referenceId,
                questionId: questionId || undefined,
            })
            setPaidKeys((prev) => new Set(prev).add(key))
            setError('')
            setOpenId(referenceId)
            void SoundEffects.play('starsSpent')
            void queryClient.invalidateQueries({ queryKey: queryKeys.store })
            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
            if (typeof result.starBalance === 'number') {
                queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                    ...(prev || {}),
                    starBalance: result.starBalance,
                }))
            }
            return true
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Could not open that reference.')
            return false
        }
    }, [lesson, mode, preview, paidKeys, queryClient])

    const close = useCallback(() => {
        setOpenId(null)
        setError('')
    }, [])

    const value = useMemo<ReferenceContextValue>(() => ({
        lesson,
        mode,
        preview,
        contained,
        componentStates,
        setComponentState,
        openId,
        openComponent,
        open,
        close,
        error,
    }), [lesson, mode, preview, contained, componentStates, setComponentState, openId, openComponent, open, close, error])

    return <ReferenceContext.Provider value={value}>{children}</ReferenceContext.Provider>
}

export function useReference() {
    return useContext(ReferenceContext)
}
