'use client'

import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { OrgPageHeader } from '@/components/dashboard/org/org-page-header'
import { OrgPageGate } from '@/components/dashboard/org/org-ui'
import { OrgPublicCatalogPolicy } from '@/components/dashboard/org/org-public-catalog-policy'
import { OrgVanityInfo } from '@/components/dashboard/org/org-vanity-info'
import { OrgBrandingSettings } from '@/components/dashboard/org/org-branding-settings'
import { OrgPlanSummary } from '@/components/dashboard/org/org-plan-summary'

export default function OrgSettingsPage() {
    const { loading, staffOrgs, selected, membershipRole } = useOrgDashboard()

    return (
        <OrgPageGate loading={loading} hasOrgs={staffOrgs.length > 0} selected={Boolean(selected)}>
            <div className="space-y-6 max-w-2xl">
                <OrgPageHeader
                    title="Settings"
                    description="Club preferences and billing. Seat caps are managed by After-school.tech for now."
                />

                <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Club profile
                    </h2>
                    <dl className="grid gap-3 text-sm">
                        <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
                            <dt className="font-bold text-slate-500">Name</dt>
                            <dd className="font-black text-slate-900 text-right">{selected?.org.name}</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
                            <dt className="font-bold text-slate-500">Slug</dt>
                            <dd className="font-mono text-slate-700 text-right">{selected?.org.slug}</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
                            <dt className="font-bold text-slate-500">Your role</dt>
                            <dd className="font-black text-slate-900 capitalize text-right">{membershipRole}</dd>
                        </div>
                        <div className="flex justify-between gap-4 py-2">
                            <dt className="font-bold text-slate-500">Student seats</dt>
                            <dd className="font-black text-slate-900 text-right">
                                {selected?.org.seatsUsed}/{selected?.org.seatCap}
                            </dd>
                        </div>
                    </dl>
                </section>

                <OrgPlanSummary
                    orgName={selected?.org.name || 'Club'}
                    planId={selected?.org.billing?.plan}
                    brandingTier={selected?.org.settings?.brandingTier}
                    seatsUsed={selected?.org.seatsUsed ?? 0}
                    seatCap={selected?.org.seatCap ?? 0}
                />

                <OrgBrandingSettings />

                <OrgPublicCatalogPolicy />

                <OrgVanityInfo />

                <Link href="/dashboard/org" className="inline-flex text-xs font-bold text-sky-700">
                    ← Back to overview
                </Link>
            </div>
        </OrgPageGate>
    )
}
