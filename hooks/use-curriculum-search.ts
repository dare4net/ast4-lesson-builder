'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

export type CurriculumSearchHit = {
    id: string
    title: string
    href: string
    programTitle?: string
    moduleTitle?: string
}

export type CurriculumSearchPayload = {
    programs?: CurriculumSearchHit[]
    modules?: CurriculumSearchHit[]
    lessons?: CurriculumSearchHit[]
}

export function useCurriculumSearch(query: string, enabled: boolean) {
    return useQuery({
        queryKey: queryKeys.curriculumSearch(query),
        queryFn: () => apiClient.programs.searchCurriculum(query) as Promise<CurriculumSearchPayload>,
        enabled: enabled && query.trim().length >= 2,
        staleTime: 15_000,
        placeholderData: (previous) => previous,
    })
}
