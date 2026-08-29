/**
 * Shared catalog constants for missions and achievements.
 * Missions count facts. Achievements match a single event with JSON rules.
 * Adding a row in Superadmin does not require a code change unless a new
 * measurable (stat / event field) is introduced.
 */

export const MISSION_STAT_KEYS = [
    'programsEnrolled',
    'starsEarned',
    'lifetimeStarsEarned',
    'componentsReset',
    'starsSpent',
    'consecutiveCorrect',
    'lessonsReviewed',
    'lessonsCompleted',
    'submits',
] as const

export type MissionStatKey = (typeof MISSION_STAT_KEYS)[number]

export const SCORED_COMPONENT_TYPES = [
    'quiz',
    'trueFalse',
    'multiSelectQuiz',
    'flashcardQuiz',
    'dragDrop',
    'matchingPairs',
    'fillInTheBlank',
    'memoryGrid',
    'wordScramble',
    'hangman',
    'anagram',
    'crossword',
    'jigsaw',
    'spinTheWheel',
    'shortAnswer',
    'categorise',
    'hotspot',
    'codeEditor',
    'miniGame',
    'annotateImage',
    'timeline',
    'scaleSlider',
    'wordCloud',
    'annotationBoard',
    'swipeDeck',
    'spectrumSorter',
    'clickableImage',
] as const

export type MissionFilters = {
    mode?: 'live' | 'practice'
    type?: string
    perfect?: boolean
}

export const ACHIEVEMENT_EVENT_TYPES = [
    'COMPONENT_SUBMITTED',
    'LIVE_EARLY_FINISH',
    'LIVE_TIMEOUT',
    'LESSON_COMPLETED',
    'COMPONENT_RESET',
    'LESSON_REVIEWED',
    'PROGRAM_ENROLLED',
    'STARS_SPENT',
    'STARS_AWARDED',
] as const

export type AchievementEventType = (typeof ACHIEVEMENT_EVENT_TYPES)[number]

export const ACHIEVEMENT_FIELDS_BY_EVENT: Record<AchievementEventType, string[]> = {
    COMPONENT_SUBMITTED: ['type', 'mode', 'score', 'maxScore', 'percentage', 'attemptCount', 'isFirstAttempt', 'completionTimeMs', 'componentId'],
    LIVE_EARLY_FINISH: ['type', 'completionTimeMs', 'timeLimitMs', 'componentId'],
    LIVE_TIMEOUT: ['type', 'componentId'],
    LESSON_COMPLETED: ['lessonId', 'programId', 'score', 'maxScore', 'percentage'],
    COMPONENT_RESET: ['type', 'componentId'],
    LESSON_REVIEWED: ['lessonId'],
    PROGRAM_ENROLLED: ['programId'],
    STARS_SPENT: ['amount', 'itemType'],
    STARS_AWARDED: ['amount', 'reason', 'componentId'],
}

export const RULE_OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'exists', 'ratioLt'] as const

export type RuleOp = (typeof RULE_OPS)[number]

export interface AchievementRule {
    field: string
    op: RuleOp
    value?: string | number | boolean
    /** Denominator field when op is ratioLt */
    over?: string
}

export const ACHIEVEMENT_ICONS = [
    'brain',
    'star',
    'zap',
    'award',
    'trophy',
    'target',
    'rocket',
    'flame',
] as const

export const MISSION_STAT_LABELS: Record<MissionStatKey, string> = {
    programsEnrolled: 'Programs enrolled',
    starsEarned: 'Current star balance',
    lifetimeStarsEarned: 'Lifetime stars earned',
    componentsReset: 'Components reset',
    starsSpent: 'Stars spent',
    consecutiveCorrect: 'Consecutive correct',
    lessonsReviewed: 'Lessons reviewed',
    lessonsCompleted: 'Lessons completed',
    submits: 'Block completions (filterable)',
}

export const RULE_OP_LABELS: Record<RuleOp, string> = {
    eq: 'equals',
    neq: 'does not equal',
    gt: 'greater than',
    gte: 'at least',
    lt: 'less than',
    lte: 'at most',
    exists: 'is present',
    ratioLt: '÷ field is less than',
}

export const ACHIEVEMENT_EVENT_LABELS: Record<AchievementEventType, string> = {
    COMPONENT_SUBMITTED: 'A block is completed',
    LIVE_EARLY_FINISH: 'A live block finishes early',
    LIVE_TIMEOUT: 'A live timer runs out',
    LESSON_COMPLETED: 'A lesson is completed',
    COMPONENT_RESET: 'A practice block is reset',
    LESSON_REVIEWED: 'A lesson is reviewed',
    PROGRAM_ENROLLED: 'A program is enrolled',
    STARS_SPENT: 'Stars are spent',
    STARS_AWARDED: 'Stars are awarded',
}

export const MISSION_PRESETS = [
    {
        label: '3 perfect live quizzes',
        title: 'Quiz Ace',
        description: 'Score 100% on 3 live quizzes',
        stat: 'submits' as const,
        targetCount: 3,
        rewardStars: 8,
        filters: { mode: 'live' as const, type: 'quiz', perfect: true },
    },
    {
        label: '5 live completions',
        title: 'Live Operator',
        description: 'Complete 5 live-mode blocks',
        stat: 'submits' as const,
        targetCount: 5,
        rewardStars: 8,
        filters: { mode: 'live' as const },
    },
    {
        label: 'Finish 2 lessons',
        title: 'Lesson Finisher',
        description: 'Complete 2 lessons',
        stat: 'lessonsCompleted' as const,
        targetCount: 2,
        rewardStars: 6,
        filters: {},
    },
    {
        label: 'Earn 10 lifetime stars',
        title: 'Star Hoarder',
        description: 'Earn 10 stars over time',
        stat: 'lifetimeStarsEarned' as const,
        targetCount: 10,
        rewardStars: 5,
        filters: {},
    },
    {
        label: 'Review 3 lessons',
        title: 'Triple Scholar',
        description: 'Review 3 completed lessons',
        stat: 'lessonsReviewed' as const,
        targetCount: 3,
        rewardStars: 4,
        filters: {},
    },
]

export const ACHIEVEMENT_PRESETS = [
    {
        label: 'Perfect live quiz',
        title: 'Quiz Ace',
        description: 'Score 100% on a live quiz',
        eventType: 'COMPONENT_SUBMITTED' as const,
        rules: [
            { field: 'type', op: 'eq' as const, value: 'quiz' },
            { field: 'mode', op: 'eq' as const, value: 'live' },
            { field: 'percentage', op: 'eq' as const, value: 100 },
        ],
    },
    {
        label: 'Memory grid in 6 tries',
        title: 'Grid Memory Master',
        description: 'Complete a Memory Grid in 6 or fewer attempts',
        eventType: 'COMPONENT_SUBMITTED' as const,
        rules: [
            { field: 'type', op: 'eq' as const, value: 'memoryGrid' },
            { field: 'attemptCount', op: 'lte' as const, value: 6 },
            { field: 'isFirstAttempt', op: 'eq' as const, value: true },
        ],
    },
    {
        label: 'Finish a lesson at 100%',
        title: 'Flawless Victory',
        description: 'Complete a lesson with a 100% score',
        eventType: 'LESSON_COMPLETED' as const,
        rules: [{ field: 'percentage', op: 'eq' as const, value: 100 }],
    },
    {
        label: 'Enroll in a program',
        title: 'First Enrolment',
        description: 'Enroll in any program',
        eventType: 'PROGRAM_ENROLLED' as const,
        rules: [{ field: 'programId', op: 'exists' as const }],
    },
    {
        label: 'Spend stars',
        title: 'First Purchase',
        description: 'Spend any stars in the store',
        eventType: 'STARS_SPENT' as const,
        rules: [{ field: 'amount', op: 'gte' as const, value: 1 }],
    },
]
