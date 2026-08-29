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
    lessonId?: string
    componentId?: string
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
    COMPONENT_SUBMITTED: ['type', 'mode', 'score', 'maxScore', 'percentage', 'attemptCount', 'isFirstAttempt', 'completionTimeMs', 'componentId', 'lessonId', 'programId'],
    LIVE_EARLY_FINISH: ['type', 'completionTimeMs', 'timeLimitMs', 'componentId', 'lessonId'],
    LIVE_TIMEOUT: ['type', 'componentId', 'lessonId'],
    LESSON_COMPLETED: ['lessonId', 'programId', 'score', 'maxScore', 'percentage'],
    COMPONENT_RESET: ['type', 'componentId', 'lessonId'],
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
        label: 'Complete a hangman',
        title: 'Word Detective',
        description: 'Finish a hangman block',
        stat: 'submits' as const,
        targetCount: 1,
        rewardStars: 4,
        filters: { type: 'hangman' },
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

export type CatalogLessonTarget = {
    id: string
    title: string
    programTitle?: string
    components: Array<{ id: string; type: string; title: string }>
}

function findLesson(lessons: CatalogLessonTarget[], lessonId?: string) {
    if (!lessonId) return undefined
    return lessons.find((lesson) => lesson.id === lessonId)
}

function findBlock(lessons: CatalogLessonTarget[], lessonId?: string, componentId?: string) {
    if (!componentId) return undefined
    const fromLesson = findLesson(lessons, lessonId)?.components.find((block) => block.id === componentId)
    if (fromLesson) return fromLesson
    for (const lesson of lessons) {
        const block = lesson.components.find((item) => item.id === componentId)
        if (block) return block
    }
    return undefined
}

function lessonLabel(lesson?: CatalogLessonTarget) {
    if (!lesson) return 'this lesson'
    return lesson.programTitle ? `${lesson.programTitle} · ${lesson.title}` : lesson.title
}

const SCORED_TYPE_SET = new Set<string>(SCORED_COMPONENT_TYPES)
const SCORE_RULE_FIELDS = new Set(['percentage', 'isFirstAttempt', 'score', 'maxScore'])

function hasSpecificBlock(rules: AchievementRule[]) {
    return rules.some((rule) => rule.field === 'componentId' && rule.value !== undefined && rule.value !== '')
}

export function isScoredCatalogType(type?: string) {
    return Boolean(type && SCORED_TYPE_SET.has(type))
}

function resolvedTargetType(filters: MissionFilters = {}, lessons: CatalogLessonTarget[] = []) {
    if (filters.componentId) {
        const block = findBlock(lessons, filters.lessonId, filters.componentId)
        if (block?.type) return block.type
    }
    return filters.type
}

export function canUsePerfectAttempt(filters: MissionFilters = {}, lessons: CatalogLessonTarget[] = []) {
    return isScoredCatalogType(resolvedTargetType(filters, lessons))
}

export function persistMissionFilters(
    stat: MissionStatKey,
    filters: MissionFilters = {},
    lessons: CatalogLessonTarget[] = [],
): MissionFilters | null {
    if (stat !== 'submits') return null
    const targetingBlock = Boolean(filters.componentId)
    const out: MissionFilters = {}
    if (!targetingBlock && filters.mode) out.mode = filters.mode
    if (!targetingBlock && filters.type) out.type = filters.type
    if (filters.perfect && canUsePerfectAttempt(filters, lessons)) out.perfect = true
    if (filters.lessonId) out.lessonId = filters.lessonId
    if (filters.componentId) out.componentId = filters.componentId
    return Object.keys(out).length ? out : null
}

export function visibleAchievementRules(rules: AchievementRule[], lessons: CatalogLessonTarget[] = []) {
    let visible = hasSpecificBlock(rules)
        ? rules.filter((rule) => rule.field !== 'type' && rule.field !== 'mode')
        : rules
    const type = hasSpecificBlock(rules)
        ? findBlock(lessons, undefined, String(rules.find((rule) => rule.field === 'componentId')?.value || ''))?.type
        : String(rules.find((rule) => rule.field === 'type')?.value || '')
    if (type && !isScoredCatalogType(type)) {
        visible = visible.filter((rule) => !SCORE_RULE_FIELDS.has(rule.field))
    }
    return visible
}

export function describeMissionRecipe(
    mission: { stat: MissionStatKey; targetCount: number; filters?: MissionFilters },
    lessons: CatalogLessonTarget[] = [],
) {
    if (mission.stat !== 'submits') {
        return `${MISSION_STAT_LABELS[mission.stat]} until ${mission.targetCount}`
    }
    const filters = persistMissionFilters('submits', mission.filters, lessons) || {}
    const perfect = filters.perfect ? ' at 100% first try' : ''
    const until = `until ${mission.targetCount}`
    const lesson = findLesson(lessons, filters.lessonId)
    const where = filters.lessonId ? ` in ${lessonLabel(lesson)}` : ''

    if (filters.componentId) {
        const block = findBlock(lessons, filters.lessonId, filters.componentId)
        const name = block?.title || 'this block'
        return `Count completions of ${name}${where}${perfect} ${until}`.replace(/\s+/g, ' ').trim()
    }

    const mode = filters.mode ? `${filters.mode} ` : ''
    const type = filters.type || 'any block'
    return `Count ${mode}${type} completions${perfect}${where} ${until}`.replace(/\s+/g, ' ').trim()
}

export function describeAchievementRule(rule: AchievementRule, lessons: CatalogLessonTarget[] = []) {
    if (rule.field === 'componentId') {
        const block = findBlock(lessons, undefined, String(rule.value || ''))
        if (rule.op === 'exists') return 'a specific block is present'
        return block ? `block is ${block.title}` : 'a specific block is selected'
    }
    if (rule.field === 'lessonId') {
        const lesson = findLesson(lessons, String(rule.value || ''))
        if (rule.op === 'exists') return 'a specific lesson is present'
        return lesson ? `lesson is ${lesson.title}` : 'a specific lesson is selected'
    }
    if (rule.op === 'exists') return `${rule.field} is present`
    if (rule.op === 'ratioLt') return `${rule.field} ÷ ${rule.over || '?'} is less than ${rule.value}`
    return `${rule.field} ${RULE_OP_LABELS[rule.op]} ${rule.value ?? ''}`
}

export function describeAchievementRecipe(
    eventType: AchievementEventType,
    rules: AchievementRule[],
    lessons: CatalogLessonTarget[] = [],
) {
    const targetingBlock = hasSpecificBlock(rules)
    const visible = visibleAchievementRules(rules, lessons).filter((rule) => !(targetingBlock && rule.field === 'lessonId'))
    const criteria = visible.map((rule) => describeAchievementRule(rule, lessons)).join(' and ') || 'no criteria'
    return `${ACHIEVEMENT_EVENT_LABELS[eventType]}, if ${criteria}`
}
