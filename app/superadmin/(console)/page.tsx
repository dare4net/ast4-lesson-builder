'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Loader2, PlayCircle, Target, Trophy } from 'lucide-react'
import { SuperadminPageHeader } from '@/components/superadmin/superadmin-page-header'
import { superadminClient } from '@/lib/superadmin-client'
import { SUPERADMIN_NAV_ITEMS } from '@/lib/superadmin-nav'

type Stats = {
    missions: number
    achievements: number
    orgs: number
    orgsActive: number
    orgsSuspended: number
    seatsUsed: number
    jobs: number
}

export default function SuperadminOverviewPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        void Promise.all([
            superadminClient.listMissions(),
            superadminClient.listAchievements(),
            superadminClient.listOrgs(),
            superadminClient.listJobs(),
        ])
            .then(([missionsRes, achievementsRes, orgsRes, jobsRes]) => {
                if (cancelled) return
                const orgRows = Array.isArray(orgsRes?.orgs) ? orgsRes.orgs : []
                setStats({
                    missions: Array.isArray(missionsRes?.missions) ? missionsRes.missions.length : 0,
                    achievements: Array.isArray(achievementsRes?.achievements)
                        ? achievementsRes.achievements.length
                        : 0,
                    orgs: orgRows.length,
                    orgsActive: orgRows.filter((o: { status?: string }) => o.status === 'active').length,
                    orgsSuspended: orgRows.filter((o: { status?: string }) => o.status === 'suspended').length,
                    seatsUsed: orgRows.reduce(
                        (sum: number, o: { seatsUsed?: number }) => sum + (Number(o.seatsUsed) || 0),
                        0,
                    ),
                    jobs: Array.isArray(jobsRes?.jobs) ? jobsRes.jobs.length : 0,
                })
            })
            .catch(() => {
                if (!cancelled) {
                    setStats({
                        missions: 0,
                        achievements: 0,
                        orgs: 0,
                        orgsActive: 0,
                        orgsSuspended: 0,
                        seatsUsed: 0,
                        jobs: 0,
                    })
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [])

    const cards = [
        { label: 'Missions', value: stats?.missions, href: '/superadmin/missions', icon: Target, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { label: 'Achievements', value: stats?.achievements, href: '/superadmin/achievements', icon: Trophy, tone: 'text-purple-600 bg-purple-50 border-purple-100' },
        { label: 'Organisations', value: stats?.orgs, href: '/superadmin/orgs', icon: Building2, tone: 'text-sky-600 bg-sky-50 border-sky-100' },
        { label: 'Manual jobs', value: stats?.jobs, href: '/superadmin/jobs', icon: PlayCircle, tone: 'text-amber-600 bg-amber-50 border-amber-100' },
    ]

    return (
        <div className="space-y-6">
            <SuperadminPageHeader
                title="Overview"
                description="Platform-wide catalog, clubs, and evening push jobs. Credentials are env-only — never commit them."
            />

            {loading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold py-8">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading snapshot…
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {cards.map((card) => (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="rounded-2xl border-2 border-slate-100 bg-white p-4 hover:border-amber-200 hover:shadow-sm transition-all group"
                        >
                            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${card.tone}`}>
                                <card.icon className="w-4 h-4" />
                            </div>
                            <p className="mt-3 text-2xl font-black text-slate-900">{card.value ?? '—'}</p>
                            <p className="text-xs font-bold text-slate-600 group-hover:text-amber-700">{card.label}</p>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && stats && (
                <section className="rounded-2xl border-2 border-slate-100 bg-white p-4 grid sm:grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="text-xl font-black text-slate-900">{stats.orgsActive}</p>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase">Active clubs</p>
                    </div>
                    <div>
                        <p className="text-xl font-black text-slate-900">{stats.seatsUsed}</p>
                        <p className="text-[10px] font-bold text-sky-700 uppercase">Seats in use</p>
                    </div>
                    <div>
                        <p className="text-xl font-black text-slate-900">{stats.orgsSuspended}</p>
                        <p className="text-[10px] font-bold text-red-600 uppercase">Suspended</p>
                    </div>
                </section>
            )}

            <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-3">
                <h2 className="text-sm font-black text-slate-800">Quick links</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                    {SUPERADMIN_NAV_ITEMS.filter((item) => item.href !== '/superadmin').map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-amber-50 hover:border-amber-100 transition-colors"
                            >
                                <item.icon className="w-4 h-4 text-amber-600 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                                    {item.description && (
                                        <p className="text-[10px] text-slate-400 font-medium truncate">{item.description}</p>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}
