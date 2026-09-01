import { describe, expect, it } from 'vitest'
import {
    brandingTierForPlan,
    clubPlanDefinition,
    isClubPlanId,
    planForBrandingTier,
    upgradeMailtoUrl,
} from '@/lib/club-plans'

describe('club plans', () => {
    it('maps plan ids to branding tiers', () => {
        expect(isClubPlanId('club_branded')).toBe(true)
        expect(brandingTierForPlan('club_white_label')).toBe('white_label')
        expect(planForBrandingTier('branded')).toBe('club_branded')
    })

    it('falls back to tier when billing plan is unset', () => {
        const plan = clubPlanDefinition(null, 'branded')
        expect(plan.id).toBe('club_branded')
        expect(plan.features.length).toBeGreaterThan(2)
    })

    it('builds upgrade mailto links', () => {
        const url = upgradeMailtoUrl('Riverside Club', 'white_label')
        expect(url).toContain('mailto:')
        expect(url).toContain('Riverside')
        expect(url).toContain('White-label')
    })
})
