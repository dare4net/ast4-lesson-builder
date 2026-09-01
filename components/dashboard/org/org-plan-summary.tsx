'use client'

import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { OrgBrandingTier } from '@/lib/org-branding'
import {
    CLUB_PLANS,
    clubPlanDefinition,
    upgradeMailtoUrl,
    type ClubPlanId,
} from '@/lib/club-plans'
import { cn } from '@/lib/utils'

const TIER_LABELS: Record<OrgBrandingTier, string> = {
    standard: 'Standard',
    branded: 'Branded',
    white_label: 'White-label',
}

type OrgPlanUpgradeCardProps = {
    orgName: string
    targetTier: OrgBrandingTier
    className?: string
}

export function OrgPlanUpgradeCard({ orgName, targetTier, className }: OrgPlanUpgradeCardProps) {
    const plan = clubPlanDefinition(null, targetTier)
    const mailto = upgradeMailtoUrl(orgName, targetTier)

    return (
        <section
            className={cn(
                'rounded-2xl border-2 border-dashed p-5 space-y-3',
                targetTier === 'white_label'
                    ? 'border-violet-200 bg-violet-50/50'
                    : 'border-slate-200 bg-slate-50',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {TIER_LABELS[targetTier]} plan
                    </p>
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        Unlock {plan.label}
                    </h2>
                </div>
                <a
                    href={mailto}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-800"
                >
                    Request upgrade
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
            </div>
            <ul className="space-y-1.5 text-xs font-medium text-slate-600">
                {plan.features.slice(0, 4).map((line) => (
                    <li key={line} className="flex gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>{line}</span>
                    </li>
                ))}
            </ul>
            <p className="text-[11px] text-slate-500 font-medium">
                Billing is set up by After-school.tech for now. We will enable these features on your club
                after you upgrade.
            </p>
        </section>
    )
}

type OrgPlanSummaryProps = {
    orgName: string
    planId?: string | null
    brandingTier?: OrgBrandingTier
    seatsUsed: number
    seatCap: number
}

export function OrgPlanSummary({
    orgName,
    planId,
    brandingTier = 'standard',
    seatsUsed,
    seatCap,
}: OrgPlanSummaryProps) {
    const plan = clubPlanDefinition(planId, brandingTier)
    const nextTier: OrgBrandingTier | null =
        brandingTier === 'standard' ? 'branded' : brandingTier === 'branded' ? 'white_label' : null

    return (
        <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Your plan
                    </p>
                    <h2 className="text-lg font-black text-slate-900">{plan.label}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {seatsUsed}/{seatCap} student seats in use
                        {plan.indicativeSeatGbp ? ` · ${plan.indicativeSeatGbp} (guide)` : ''}
                    </p>
                </div>
                {planId && (
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-600">
                        {planId}
                    </span>
                )}
            </div>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                {plan.features.map((line) => (
                    <li key={line} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-emerald-600">✓</span>
                        <span>{line}</span>
                    </li>
                ))}
            </ul>
            {nextTier && (
                <OrgPlanUpgradeCard orgName={orgName} targetTier={nextTier} className="border-solid" />
            )}
        </section>
    )
}

export function orgBillingPlanLabel(planId: string | null | undefined): string {
    if (planId && planId in CLUB_PLANS) {
        return CLUB_PLANS[planId as ClubPlanId].label
    }
    return 'Not set'
}
