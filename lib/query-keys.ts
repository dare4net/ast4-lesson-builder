export const queryKeys = {
    stats: ['gamification', 'stats'] as const,
    wallet: ['gamification', 'wallet'] as const,
    missionCatalog: ['gamification', 'missions'] as const,
    achievements: ['gamification', 'achievements'] as const,
    myPrograms: ['programs', 'mine'] as const,
    catalog: ['programs', 'catalog'] as const,
    programDetails: (id: string) => ['programs', 'detail', id] as const,
}

export function parseProgramList(raw: unknown): any[] {
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object') {
        const record = raw as { data?: unknown; programs?: unknown }
        if (Array.isArray(record.data)) return record.data
        if (Array.isArray(record.programs)) return record.programs
    }
    return []
}
