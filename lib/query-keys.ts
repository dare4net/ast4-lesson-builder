export const queryKeys = {
    stats: ['gamification', 'stats'] as const,
    wallet: ['gamification', 'wallet'] as const,
    missionCatalog: ['gamification', 'missions'] as const,
    achievements: ['gamification', 'achievements'] as const,
    myPrograms: ['programs', 'mine'] as const,
    lessonsList: ['lessons', 'mine'] as const,
    curriculumSearch: (q: string) => ['curriculum', 'search', q] as const,
    catalog: ['programs', 'catalog'] as const,
    programDetails: (id: string) => ['programs', 'detail', id] as const,
    notifications: ['notifications', 'inbox'] as const,
    notificationsUnread: ['notifications', 'unread'] as const,
    prideSummary: ['pride', 'summary'] as const,
    prideBoard: (statKey: string) => ['pride', 'board', statKey] as const,
    peopleSearch: (q: string) => ['people', 'search', q] as const,
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
