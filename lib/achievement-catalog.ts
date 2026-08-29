/** Shared with afterschool-tech-backend/helpers/platformAchievements.js */
export const PLATFORM_ACHIEVEMENT_IDS = [
    'grid-memory-master',
    'first-live-star',
    'speed-demon',
    'perfect-lesson',
] as const

export type PlatformAchievementId = (typeof PLATFORM_ACHIEVEMENT_IDS)[number]
