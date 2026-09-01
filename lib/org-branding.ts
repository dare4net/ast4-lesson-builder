import { ACCENT_COLORS, isAccentColor, type AccentColor } from '@/lib/pride-format'

export type OrgBrandingSettings = {
    accentColor?: string | null
    logoUrl?: string | null
    bannerUrl?: string | null
    welcomeMessage?: string | null
    prideScope?: 'cohort' | 'org'
    brandingTier?: 'standard' | 'branded' | 'white_label'
    joinLayout?: 'standard' | 'hero'
    allowPublicOptIn?: boolean
    vanityEnabled?: boolean
}

export type OrgBrandingTier = 'standard' | 'branded' | 'white_label'

const TIER_RANK: Record<OrgBrandingTier, number> = {
    standard: 0,
    branded: 1,
    white_label: 2,
}

export function slugAccent(slug?: string | null): AccentColor {
    const text = String(slug || '')
    let n = 0
    for (let i = 0; i < text.length; i += 1) {
        n = (n + text.charCodeAt(i) * (i + 1)) % ACCENT_COLORS.length
    }
    return ACCENT_COLORS[n]
}

export function resolveOrgAccent(slug?: string | null, chosen?: string | null): string {
    if (isAccentColor(chosen)) return chosen
    return slugAccent(slug)
}

export function orgCanUse(tier: OrgBrandingTier | undefined, feature: string): boolean {
    const required: Record<string, OrgBrandingTier> = {
        accent: 'standard',
        vanity: 'standard',
        logo: 'branded',
        banner: 'branded',
        welcome: 'branded',
        prideScope: 'branded',
        joinLayout: 'white_label',
    }
    const need = TIER_RANK[required[feature] || 'standard']
    const have = TIER_RANK[tier || 'standard']
    return have >= need
}

/** CSS custom properties for club-themed student chrome */
export function clubThemeVars(accent: string): Record<string, string> {
    return {
        '--club-accent': accent,
        '--club-accent-muted': `${accent}1a`,
        '--club-accent-border': `${accent}40`,
    }
}

export const ORG_ACCENT_PRESETS = ACCENT_COLORS
