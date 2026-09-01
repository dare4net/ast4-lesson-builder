import type { OrgBrandingTier } from '@/lib/org-branding'

export type ClubPlanId = 'club_standard' | 'club_branded' | 'club_white_label'

export type ClubPlanDefinition = {
    id: ClubPlanId
    label: string
    brandingTier: OrgBrandingTier
    /** Internal list price guidance — not shown to students; invoice manually until Stripe. */
    indicativeSeatGbp?: string
    features: string[]
}

export const CLUB_PLANS: Record<ClubPlanId, ClubPlanDefinition> = {
    club_standard: {
        id: 'club_standard',
        label: 'Club Standard',
        brandingTier: 'standard',
        indicativeSeatGbp: '£2–4 / learner / month',
        features: [
            'Club accent colour on join and student home',
            'Branded join page with cohort preview',
            'Org dashboard, cohorts, join codes, seat cap',
            'Club-scoped programs and pride (cohort default)',
        ],
    },
    club_branded: {
        id: 'club_branded',
        label: 'Club Branded',
        brandingTier: 'branded',
        indicativeSeatGbp: '£4–7 / learner / month',
        features: [
            'Everything in Standard',
            'Logo, banner, and welcome message on student home',
            'Choose club-wide or class-only pride leaderboards',
            'Stronger “this is our club” feel without a custom domain',
        ],
    },
    club_white_label: {
        id: 'club_white_label',
        label: 'Club White-label',
        brandingTier: 'white_label',
        indicativeSeatGbp: '£7–12 / learner / month',
        features: [
            'Everything in Branded',
            'Vanity subdomain (e.g. yourclub.ast.devinna.com)',
            'Hero join layout, custom favicon, first-visit splash',
            'Branded invite and join-reminder email templates',
        ],
    },
}

export const CLUB_PLAN_OPTIONS = Object.values(CLUB_PLANS)

const TIER_TO_PLAN: Record<OrgBrandingTier, ClubPlanId> = {
    standard: 'club_standard',
    branded: 'club_branded',
    white_label: 'club_white_label',
}

export const CLUB_UPGRADE_CONTACT_EMAIL =
    process.env.NEXT_PUBLIC_CLUB_UPGRADE_EMAIL || 'hello@after-school.tech'

export function isClubPlanId(value: unknown): value is ClubPlanId {
    return typeof value === 'string' && value in CLUB_PLANS
}

export function planForBrandingTier(tier?: OrgBrandingTier | null): ClubPlanId {
    return TIER_TO_PLAN[tier || 'standard']
}

export function brandingTierForPlan(plan: string | null | undefined): OrgBrandingTier | null {
    if (!isClubPlanId(plan)) return null
    return CLUB_PLANS[plan].brandingTier
}

export function clubPlanLabel(plan: string | null | undefined, tier?: OrgBrandingTier | null): string {
    if (isClubPlanId(plan)) return CLUB_PLANS[plan].label
    const id = planForBrandingTier(tier)
    return CLUB_PLANS[id].label
}

export function clubPlanDefinition(
    plan: string | null | undefined,
    tier?: OrgBrandingTier | null,
): ClubPlanDefinition {
    const id = isClubPlanId(plan) ? plan : planForBrandingTier(tier)
    return CLUB_PLANS[id]
}

export function upgradeMailtoUrl(orgName: string, targetTier: OrgBrandingTier): string {
    const target = CLUB_PLANS[planForBrandingTier(targetTier)].label
    const subject = encodeURIComponent(`Upgrade ${orgName} to ${target}`)
    const body = encodeURIComponent(
        `Hi,\n\nWe would like to upgrade our club "${orgName}" to the ${target} plan.\n\nThanks`,
    )
    return `mailto:${CLUB_UPGRADE_CONTACT_EMAIL}?subject=${subject}&body=${body}`
}
