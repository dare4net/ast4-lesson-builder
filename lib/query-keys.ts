export const queryKeys = {
    stats: ['gamification', 'stats'] as const,
    wallet: ['gamification', 'wallet'] as const,
    missionCatalog: ['gamification', 'missions'] as const,
    achievements: ['gamification', 'achievements'] as const,
    myPrograms: (orgId?: string | null) => ['programs', 'mine', orgId || 'all'] as const,
    lessonsList: (orgId?: string | null) => ['lessons', 'mine', orgId || 'all'] as const,
    curriculumSearch: (q: string) => ['curriculum', 'search', q] as const,
    catalog: ['programs', 'catalog'] as const,
    programDetails: (id: string) => ['programs', 'detail', id] as const,
    notifications: ['notifications', 'inbox'] as const,
    notificationsUnread: ['notifications', 'unread'] as const,
    prideSummary: (orgId?: string | null) => ['pride', 'summary', orgId || 'global'] as const,
    prideBoard: (statKey: string, orgId?: string | null) => ['pride', 'board', statKey, orgId || 'global'] as const,
    peopleSearch: (q: string, orgId?: string | null) => ['people', 'search', q, orgId || 'global'] as const,
    peopleProfile: (handle: string) => ['people', 'profile', handle] as const,
    store: ['store', 'inventory'] as const,
    storeResetLessons: ['store', 'reset-lessons'] as const,
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
