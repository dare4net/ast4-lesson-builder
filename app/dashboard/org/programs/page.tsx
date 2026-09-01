'use client'

import Link from 'next/link'
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { OrgPageHeader } from '@/components/dashboard/org/org-page-header'
import { OrgAlertBanner, OrgPageGate } from '@/components/dashboard/org/org-ui'
import { setActiveOrgId } from '@/lib/active-org'

export default function OrgProgramsPage() {
    const {
        loading,
        staffOrgs,
        selected,
        selectedId,
        orgPrograms,
        programsLoading,
        programsError,
        error,
    } = useOrgDashboard()

    const liveCount = orgPrograms.filter((p) => p.is_published !== false).length
    const draftCount = orgPrograms.length - liveCount

    return (
        <OrgPageGate loading={loading} hasOrgs={staffOrgs.length > 0} selected={Boolean(selected)}>
            <div className="space-y-6">
                <OrgPageHeader
                    title="Club programs"
                    description={
                        selected
                            ? `Courses created in Creator Studio with ${selected.org.name} selected — not Personal library.`
                            : undefined
                    }
                    actions={
                        <>
                            <Link
                                href="/studio/programs/new"
                                onClick={() => selectedId && setActiveOrgId(selectedId)}
                                className="h-10 px-4 rounded-xl bg-sky-600 text-white text-xs font-black inline-flex items-center gap-2"
                            >
                                New program
                            </Link>
                            <Link
                                href="/studio"
                                onClick={() => selectedId && setActiveOrgId(selectedId)}
                                className="h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Studio
                            </Link>
                        </>
                    }
                />

                <OrgAlertBanner message={error} />
                <OrgAlertBanner message={programsError} />

                <div className="rounded-2xl border-2 border-amber-100 bg-amber-50/80 px-4 py-3 text-[11px] font-medium text-amber-900">
                    <strong className="font-black">Tip:</strong> In Creator Studio, use the club dropdown at the top
                    before creating a program. Programs in Personal library never appear here.
                </div>

                {programsLoading ? (
                    <div className="flex items-center justify-center py-16 text-sm font-bold text-slate-500 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                        Loading programs…
                    </div>
                ) : orgPrograms.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-black text-slate-900">No club programs yet</h2>
                            <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
                                Switch to your club in Creator Studio, then create your first program. Come back here
                                to assign it to cohorts.
                            </p>
                        </div>
                        <Link
                            href="/studio/programs/new"
                            onClick={() => selectedId && setActiveOrgId(selectedId)}
                            className="inline-flex h-10 px-5 rounded-xl bg-emerald-500 text-white text-xs font-black items-center gap-2"
                        >
                            Create in Studio
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-xs font-bold text-slate-500">
                            {orgPrograms.length} total · {liveCount} live · {draftCount} draft
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {orgPrograms.map((program) => (
                                <div
                                    key={String(program._id)}
                                    className="rounded-2xl border-2 border-slate-100 bg-white p-4 space-y-3 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-black text-slate-900 line-clamp-2">{program.name}</h3>
                                        {program.is_published === false ? (
                                            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                                                Draft
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                                Live
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/studio/programs/${program._id}`}
                                        className="text-[11px] font-bold text-sky-700 inline-flex items-center gap-1"
                                    >
                                        Edit in Studio <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">
                            Assign these programs to cohorts on the{' '}
                            <Link href="/dashboard/org/cohorts" className="font-bold text-sky-700">
                                Cohorts
                            </Link>{' '}
                            page so new students auto-enrol when they join.
                        </p>
                    </>
                )}
            </div>
        </OrgPageGate>
    )
}
