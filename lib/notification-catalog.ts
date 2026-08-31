const CATALOG: Record<string, { inbox: boolean; toast: boolean; pushServer: boolean }> = {
    ACHIEVEMENT_EARNED: { inbox: true, toast: false, pushServer: false },
    MISSION_CLAIMED: { inbox: true, toast: false, pushServer: false },
    LEVEL_UP: { inbox: true, toast: false, pushServer: false },
    FOLLOWED_YOU: { inbox: true, toast: true, pushServer: true },
    CROWN_GOLD: { inbox: true, toast: true, pushServer: false },
    PROGRAM_LESSON_PUBLISHED: { inbox: true, toast: true, pushServer: true },
    PROGRAM_MODULE_PUBLISHED: { inbox: true, toast: true, pushServer: true },
    TUTOR_MARKED: { inbox: true, toast: true, pushServer: true },
    NEXT_LESSON_UNLOCKED: { inbox: true, toast: false, pushServer: true },
    CLASS_POLL_LIVE: { inbox: true, toast: true, pushServer: true },
    CLASS_CLOUD_LIVE: { inbox: true, toast: true, pushServer: true },
    CLASS_SCALE_LIVE: { inbox: true, toast: true, pushServer: true },
    CLASS_ACTIVITY: { inbox: true, toast: true, pushServer: true },
    STREAK_REMINDER: { inbox: false, toast: false, pushServer: true },
    LESSON_REMINDER: { inbox: false, toast: false, pushServer: true },
}

export function inboxTypes() {
    return Object.keys(CATALOG).filter((type) => CATALOG[type].inbox)
}

export function isPushServer(type?: string | null) {
    return Boolean(type && CATALOG[type]?.pushServer)
}

export { CATALOG }
