import type { MascotImpression } from '@/lib/ast-mascot'

export type PridePattern = 'sunburst' | 'dots' | 'stripes' | 'chevrons' | 'grid' | 'rings' | 'dashes' | 'squares'

export type PrideCardTheme = {
    bg: string
    ink: string
    muted: string
    accent: string
    pattern: string
    patternStyle: PridePattern
    impression: MascotImpression
    numberFill: string
    numberStroke: string
    pill: string
    pillInk: string
}

const NAMED: Record<string, PrideCardTheme> = {
    loginStreak: {
        bg: '#FF9600', ink: '#FFFFFF', muted: '#FFE4B5', accent: '#FFC800',
        pattern: '#FFB020', patternStyle: 'sunburst', impression: 'hype',
        numberFill: '#FFFFFF', numberStroke: '#E08600', pill: '#FFFFFF', pillInk: '#E08600',
    },
    currentStreak: {
        bg: '#FFFFFF', ink: '#E08600', muted: '#C46F00', accent: '#FF9600',
        pattern: '#FFE4B5', patternStyle: 'chevrons', impression: 'hype',
        numberFill: '#FFFFFF', numberStroke: '#FF9600', pill: '#FF9600', pillInk: '#FFFFFF',
    },
    lifetimeStars: {
        bg: '#FFC800', ink: '#3B2A00', muted: '#8A6400', accent: '#FFFFFF',
        pattern: '#FFE27A', patternStyle: 'dots', impression: 'proud',
        numberFill: '#FFFFFF', numberStroke: '#C79200', pill: '#3B2A00', pillInk: '#FFC800',
    },
    liveCompleted: {
        bg: '#FF4B4B', ink: '#FFFFFF', muted: '#FFD0D0', accent: '#FFC800',
        pattern: '#FF6B6B', patternStyle: 'chevrons', impression: 'focused',
        numberFill: '#FFFFFF', numberStroke: '#C43C3C', pill: '#FFFFFF', pillInk: '#C43C3C',
    },
    perfectFirstTries: {
        bg: '#58CC02', ink: '#FFFFFF', muted: '#D7F9B5', accent: '#FFC800',
        pattern: '#6FDE1A', patternStyle: 'dots', impression: 'wink',
        numberFill: '#FFFFFF', numberStroke: '#3B8C00', pill: '#FFFFFF', pillInk: '#3B8C00',
    },
    lessonsCompleted: {
        bg: '#1CB0F6', ink: '#FFFFFF', muted: '#C9EDFF', accent: '#FFC800',
        pattern: '#48C0F8', patternStyle: 'stripes', impression: 'proud',
        numberFill: '#FFFFFF', numberStroke: '#0A7CB3', pill: '#FFFFFF', pillInk: '#0A7CB3',
    },
    programsEnrolled: {
        bg: '#14B8A6', ink: '#FFFFFF', muted: '#CCFBF1', accent: '#FFC800',
        pattern: '#2DD4BF', patternStyle: 'rings', impression: 'chill',
        numberFill: '#FFFFFF', numberStroke: '#0F766E', pill: '#FFFFFF', pillInk: '#0F766E',
    },
    missionsClaimed: {
        bg: '#CE82FF', ink: '#FFFFFF', muted: '#F3E0FF', accent: '#FFC800',
        pattern: '#D9A0FF', patternStyle: 'squares', impression: 'cool',
        numberFill: '#FFFFFF', numberStroke: '#9B4ED9', pill: '#FFFFFF', pillInk: '#7A3CB0',
    },
    achievementsEarned: {
        bg: '#F472B6', ink: '#FFFFFF', muted: '#FCE7F3', accent: '#FFC800',
        pattern: '#F9A8D4', patternStyle: 'dots', impression: 'proud',
        numberFill: '#FFFFFF', numberStroke: '#DB2777', pill: '#FFFFFF', pillInk: '#BE185D',
    },
    followers: {
        bg: '#FFFFFF', ink: '#BE185D', muted: '#9D174D', accent: '#F472B6',
        pattern: '#FCE7F3', patternStyle: 'rings', impression: 'cool',
        numberFill: '#FFFFFF', numberStroke: '#F472B6', pill: '#F472B6', pillInk: '#FFFFFF',
    },
    quizzesCompleted: {
        bg: '#0EA5E9', ink: '#FFFFFF', muted: '#E0F2FE', accent: '#FFC800',
        pattern: '#38BDF8', patternStyle: 'grid', impression: 'focused',
        numberFill: '#FFFFFF', numberStroke: '#0369A1', pill: '#FFFFFF', pillInk: '#0369A1',
    },
    hangmanCompleted: {
        bg: '#1A1A1A', ink: '#FFFFFF', muted: '#D4D4D4', accent: '#FF9600',
        pattern: '#2A2A2A', patternStyle: 'dashes', impression: 'cool',
        numberFill: '#FF9600', numberStroke: '#111111', pill: '#FF9600', pillInk: '#111111',
    },
    memoryGridCompleted: {
        bg: '#35408C', ink: '#FFFFFF', muted: '#C7CBF0', accent: '#F4B942',
        pattern: '#4A56A8', patternStyle: 'grid', impression: 'focused',
        numberFill: '#FFFFFF', numberStroke: '#1E2460', pill: '#F4B942', pillInk: '#1E2460',
    },
    fastestLiveMs: {
        bg: '#111111', ink: '#D7F9B5', muted: '#A3E635', accent: '#58CC02',
        pattern: '#1F1F1F', patternStyle: 'dashes', impression: 'focused',
        numberFill: '#58CC02', numberStroke: '#052E16', pill: '#58CC02', pillInk: '#052E16',
    },
}

const PALETTES: PrideCardTheme[] = [
    NAMED.lessonsCompleted,
    NAMED.perfectFirstTries,
    NAMED.loginStreak,
    NAMED.missionsClaimed,
    NAMED.programsEnrolled,
    NAMED.lifetimeStars,
    NAMED.liveCompleted,
    NAMED.memoryGridCompleted,
]

const PATTERNS: PridePattern[] = ['sunburst', 'dots', 'stripes', 'chevrons', 'grid', 'rings', 'dashes', 'squares']
const LOOKS: MascotImpression[] = ['proud', 'hype', 'cool', 'wink', 'focused', 'chill']

function hashKey(key: string) {
    let n = 0
    for (let i = 0; i < key.length; i += 1) n = (n * 33 + key.charCodeAt(i)) >>> 0
    return n
}

export function prideCardTheme(statKey?: string | null): PrideCardTheme {
    const key = String(statKey || '')
    if (NAMED[key]) return NAMED[key]
    if (key.startsWith('fastestLive')) {
        return { ...NAMED.fastestLiveMs, patternStyle: 'chevrons', impression: 'hype' }
    }
    if (key.endsWith('Completed')) {
        const n = hashKey(key)
        return {
            ...PALETTES[n % PALETTES.length],
            patternStyle: PATTERNS[n % PATTERNS.length],
            impression: LOOKS[n % LOOKS.length],
        }
    }
    const n = hashKey(key || 'pride')
    return {
        ...PALETTES[n % PALETTES.length],
        patternStyle: PATTERNS[(n >> 3) % PATTERNS.length],
        impression: LOOKS[(n >> 5) % LOOKS.length],
    }
}
