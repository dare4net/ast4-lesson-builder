'use client'

import { useState } from 'react'
import { Copy, Loader2, Plus, Users } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { CohortProgramsEditor } from '@/components/dashboard/org/cohort-programs-editor'
import { OrgPageHeader } from '@/components/dashboard/org/org-page-header'
import { OrgAlertBanner, OrgPageGate } from '@/components/dashboard/org/org-ui'

export default function OrgCohortsPage() {
    const {
        loading,
        staffOrgs,
        selected,
        selectedId,
        cohorts,
        orgPrograms,
        programsLoading,
        programsError,
        error,
        setError,
        busy,
        setBusy,
        refreshOrg,
    } = useOrgDashboard()

    const [cohortName, setCohortName] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [copied, setCopied] = useState('')

    const createCohort = async () => {
        if (!selectedId || !cohortName.trim()) return
        setBusy(true)
        setError('')
        try {
            await apiClient.orgs.createCohort(selectedId, {
                name: cohortName.trim(),
                joinCode: joinCode.trim() || undefined,
            })
            setCohortName('')
            setJoinCode('')
            await refreshOrg()
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not create cohort.')
        } finally {
            setBusy(false)
        }
    }

    const copyJoin = async (code: string) => {
        const path = `${window.location.origin}/join/${code}`
        try {
            await navigator.clipboard.writeText(path)
            setCopied(code)
            window.setTimeout(() => setCopied(''), 1500)
        } catch {
            setError('Could not copy link.')
        }
    }

    return (
        <OrgPageGate loading={loading} hasOrgs={staffOrgs.length > 0} selected={Boolean(selected)}>
            <div className="space-y-6">
                <OrgPageHeader
                    title="Cohorts"
                    description="Each cohort gets a join link. Assign club programs so students auto-enrol when they sign up — including students already in the cohort."
                />

                <OrgAlertBanner message={error} />
                <OrgAlertBanner message={programsError} tone="info" />

                <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create cohort
                    </h2>
                    <div className="flex flex-col lg:flex-row gap-2">
                        <input
                            value={cohortName}
                            onChange={(e) => setCohortName(e.target.value)}
                            placeholder="Cohort name (e.g. Thu KS2)"
                            className="flex-1 h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-medium"
                        />
                        <input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Join code (optional)"
                            className="lg:w-48 h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-medium uppercase"
                        />
                        <button
                            type="button"
                            disabled={busy || !cohortName.trim()}
                            onClick={() => void createCohort()}
                            className="h-11 px-5 rounded-xl bg-sky-600 text-white text-sm font-black disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create cohort
                        </button>
                    </div>
                </section>

                {cohorts.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
                        <Users className="w-10 h-10 text-sky-500 mx-auto" />
                        <h2 className="text-lg font-black text-slate-900">No cohorts yet</h2>
                        <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
                            Create your first cohort above, then share the join link with students.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {cohorts.map((cohort) => (
                            <li
                                key={cohort.id}
                                className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden shadow-sm"
                            >
                                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                                    <div>
                                        <p className="text-base font-black text-slate-900">{cohort.name}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                                            {cohort.memberCount} members · code{' '}
                                            <span className="font-mono text-sky-700">{cohort.joinCode}</span>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void copyJoin(cohort.joinCode)}
                                        className="h-10 px-4 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-2 shrink-0 hover:bg-slate-50"
                                    >
                                        <Copy className="w-4 h-4" />
                                        {copied === cohort.joinCode ? 'Copied!' : 'Copy join link'}
                                    </button>
                                </div>
                                <div className="px-5 py-4">
                                    {programsLoading ? (
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Loading programs…
                                        </p>
                                    ) : (
                                        <CohortProgramsEditor
                                            orgId={selectedId!}
                                            cohortId={cohort.id}
                                            cohortName={cohort.name}
                                            programIds={cohort.programIds || []}
                                            programs={orgPrograms}
                                            disabled={busy}
                                            onSaved={() => void refreshOrg()}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </OrgPageGate>
    )
}
