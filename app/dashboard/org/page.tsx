'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
    ArrowRight,
    BookOpen,
    Building2,
    CheckCircle2,
    Circle,
    Copy,
    ExternalLink,
    Users,
    UserPlus,
} from 'lucide-react'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { OrgPageHeader } from '@/components/dashboard/org/org-page-header'
import { OrgAlertBanner, OrgPageGate, OrgStatCard } from '@/components/dashboard/org/org-ui'
import { setActiveOrgId } from '@/lib/active-org'

export default function OrgOverviewPage() {
    const {
        loading,
        staffOrgs,
        selected,
        selectedId,
        cohorts,
        orgPrograms,
        members,
        membershipRole,
        error,
        setError,
        programsLoading,
    } = useOrgDashboard()

    const [copied, setCopied] = useState('')

    const copyJoin = async (code: string) => {
        const path = `${window.location.origin}/join/${code}`
        try {
            await navigator.clipboard.writeText(path)
            setCopied(code)
            window.setTimeout(() => setCopied(''), 1500)
        } catch {
            setError('Could not copy join link.')
        }
    }

    const activeMembers = members.filter((m) => m.status === 'active').length
    const invitedMembers = members.filter((m) => m.status === 'invited').length
    const livePrograms = orgPrograms.filter((p) => p.is_published !== false).length

    const setupSteps = [
        { done: orgPrograms.length > 0, label: 'Create club programs in Creator Studio', href: '/dashboard/org/programs' },
        { done: cohorts.length > 0, label: 'Create at least one cohort', href: '/dashboard/org/cohorts' },
        { done: cohorts.some((c) => (c.programIds?.length || 0) > 0), label: 'Assign programs to a cohort', href: '/dashboard/org/cohorts' },
        { done: activeMembers > 1, label: 'Invite students or tutors', href: '/dashboard/org/people' },
    ]
    const setupComplete = setupSteps.every((s) => s.done)

    return (
        <OrgPageGate loading={loading} hasOrgs={staffOrgs.length > 0} selected={Boolean(selected)}>
            <div className="space-y-6">
                <OrgPageHeader
                    title={selected?.org.name || 'Club overview'}
                    description={`You are signed in as ${membershipRole}. Manage programs, cohorts, and people from the sidebar.`}
                    actions={
                        <Link
                            href="/studio"
                            onClick={() => selectedId && setActiveOrgId(selectedId)}
                            className="h-10 px-4 rounded-xl bg-emerald-500 text-white text-xs font-black inline-flex items-center gap-2 border-b-[3px] border-emerald-700 active:border-b-0 active:translate-y-px"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Creator Studio
                        </Link>
                    }
                />

                <OrgAlertBanner message={error} />

                <div className="rounded-2xl border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900">{selected?.org.name}</p>
                        <p className="text-xs font-mono text-slate-500">{selected?.org.slug}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1 capitalize">
                            Status: {selected?.org.status} · Role: {membershipRole}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-2xl font-black text-slate-900">
                            {selected?.org.seatsUsed}/{selected?.org.seatCap}
                        </p>
                        <p className="text-[11px] font-bold text-slate-500">student seats used</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <OrgStatCard
                        label="Programs"
                        value={programsLoading ? '…' : orgPrograms.length}
                        hint={`${livePrograms} live`}
                        icon={<BookOpen className="w-5 h-5" />}
                        accent="#0EA5E9"
                        accentBg="#E0F2FE"
                    />
                    <OrgStatCard
                        label="Cohorts"
                        value={cohorts.length}
                        hint={`${cohorts.reduce((n, c) => n + c.memberCount, 0)} students enrolled`}
                        icon={<Users className="w-5 h-5" />}
                        accent="#8B5CF6"
                        accentBg="#EDE9FE"
                    />
                    <OrgStatCard
                        label="People"
                        value={members.length}
                        hint={`${activeMembers} active · ${invitedMembers} invited`}
                        icon={<UserPlus className="w-5 h-5" />}
                        accent="#F59E0B"
                        accentBg="#FEF3C7"
                    />
                    <OrgStatCard
                        label="Seats left"
                        value={selected?.org.seatsRemaining ?? 0}
                        hint="Managed by After-school.tech"
                        icon={<Building2 className="w-5 h-5" />}
                        accent="#10B981"
                        accentBg="#D1FAE5"
                    />
                </div>

                {!setupComplete && (
                    <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-3">
                        <h2 className="text-sm font-black text-slate-800">Getting started</h2>
                        <ul className="space-y-2">
                            {setupSteps.map((step) => (
                                <li key={step.label}>
                                    <Link
                                        href={step.href}
                                        className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                                    >
                                        {step.done ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                        )}
                                        <span className="text-xs font-bold text-slate-700 flex-1">{step.label}</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        {
                            title: 'Programs',
                            body: 'View courses tagged to this club and open the studio to author more.',
                            href: '/dashboard/org/programs',
                            cta: 'Manage programs',
                        },
                        {
                            title: 'Cohorts',
                            body: 'Create classes, share join links, and map programs for auto-enrolment.',
                            href: '/dashboard/org/cohorts',
                            cta: 'Manage cohorts',
                        },
                        {
                            title: 'People',
                            body: 'Invite students and tutors, track pending invites, and manage roster.',
                            href: '/dashboard/org/people',
                            cta: 'Manage people',
                        },
                    ].map((card) => (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-2 hover:border-sky-200 hover:shadow-sm transition-all group"
                        >
                            <h3 className="text-sm font-black text-slate-900">{card.title}</h3>
                            <p className="text-xs font-medium text-slate-500">{card.body}</p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-sky-700 group-hover:gap-2 transition-all">
                                {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </Link>
                    ))}
                </section>

                {cohorts.length > 0 && (
                    <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-black text-slate-800">Cohort join links</h2>
                            <Link href="/dashboard/org/cohorts" className="text-[11px] font-bold text-sky-700">
                                View all
                            </Link>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {cohorts.slice(0, 3).map((cohort) => (
                                <li key={cohort.id} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{cohort.name}</p>
                                        <p className="text-[11px] font-mono text-sky-700">/join/{cohort.joinCode}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void copyJoin(cohort.joinCode)}
                                        className="h-8 px-2.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 inline-flex items-center gap-1 shrink-0 hover:bg-slate-50"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        {copied === cohort.joinCode ? 'Copied' : 'Copy'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </OrgPageGate>
    )
}
