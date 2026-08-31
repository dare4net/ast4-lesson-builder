export function formatPrideValue(value: number | null | undefined, unit?: string) {
    if (value == null || Number.isNaN(Number(value))) return '—'
    const amount = Number(value)
    if (unit === 'ms') {
        if (amount < 1000) return `${Math.round(amount)}ms`
        return `${(amount / 1000).toFixed(1)}s`
    }
    return String(Math.round(amount))
}

export function crownClass(crown?: string | null) {
    if (crown === 'gold') return 'text-[#FF9600]'
    if (crown === 'silver') return 'text-slate-400'
    if (crown === 'bronze') return 'text-amber-700'
    return 'text-slate-300'
}

export function hasPrideRecord(you?: { value?: number | null; rank?: number | null } | null) {
    return you?.rank != null || (you?.value != null && Number(you.value) > 0)
}

export const ACCENT_COLORS = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B'] as const
export const PREMIUM_ACCENT_COLORS = ['#14B8A6', '#F472B6', '#0EA5E9'] as const
export const ALL_ACCENT_COLORS = [...ACCENT_COLORS, ...PREMIUM_ACCENT_COLORS] as const

export type AccentColor = (typeof ALL_ACCENT_COLORS)[number]

export function isAccentColor(value?: string | null): value is AccentColor {
    return ALL_ACCENT_COLORS.includes(String(value || '') as AccentColor)
}

export function handleAccent(handle?: string | null) {
    const text = String(handle || '')
    let n = 0
    for (let i = 0; i < text.length; i += 1) {
        n = (n + text.charCodeAt(i) * (i + 1)) % ACCENT_COLORS.length
    }
    return ACCENT_COLORS[n]
}

export function resolveAccentColor(handle?: string | null, chosen?: string | null) {
    if (isAccentColor(chosen)) return chosen
    return handleAccent(handle)
}

export function profileHeadline(profile?: {
    goldCrowns?: Array<{ label?: string }>
    silverCrowns?: Array<{ label?: string }>
    bronzeCrowns?: Array<{ label?: string }>
} | null) {
    const gold = profile?.goldCrowns?.[0]?.label
    if (gold) return `Gold on ${gold}`
    const silver = profile?.silverCrowns?.[0]?.label
    if (silver) return `Silver on ${silver}`
    const bronze = profile?.bronzeCrowns?.[0]?.label
    if (bronze) return `Bronze on ${bronze}`
    return 'Building a pride wall'
}

export function gapCopy(amount: number | null | undefined, unit?: string, sort?: string) {
    if (amount == null) return null
    if (amount <= 0) return 'Tied — they got there first'
    const formatted = formatPrideValue(amount, unit)
    if (sort === 'asc') return `${formatted} faster than you`
    return `${formatted} ahead of you`
}
