'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Mail, Shield, UserMinus, UserPlus, Users } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { OrgPageHeader } from '@/components/dashboard/org/org-page-header'
import { OrgAlertBanner, OrgPageGate, OrgStatCard } from '@/components/dashboard/org/org-ui'
import { cn } from '@/lib/utils'

const ROLE_STYLES: Record<string, string> = {
    owner: 'bg-violet-50 text-violet-700 border-violet-100',
    tutor: 'bg-sky-50 text-sky-700 border-sky-100',
    student: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    invited: 'bg-amber-50 text-amber-700',
    removed: 'bg-slate-100 text-slate-500',
}

export default function OrgPeoplePage() {
    const {
        loading,
        staffOrgs,
        selected,
        selectedId,
        members,
        cohorts,
        isOwner,
        error,
        setError,
        busy,
        setBusy,
        refreshOrg,
        refreshStaff,
    } = useOrgDashboard()

    const [memberEmail, setMemberEmail] = useState('')
    const [memberRole, setMemberRole] = useState<'student' | 'tutor'>('student')

    const activeMembers = members.filter((m) => m.status === 'active')
    const invitedMembers = members.filter((m) => m.status === 'invited')
    const activeStudents = activeMembers.filter((m) => m.role === 'student')
    const studentsWithoutCohort = activeStudents.filter((m) => !m.cohort?.id)
    const activeCohorts = useMemo(
        () => cohorts.filter((c) => c.status === 'active'),
        [cohorts],
    )

    const addMember = async () => {
        if (!selectedId || !memberEmail.trim()) return
        setBusy(true)
        setError('')
        try {
            await apiClient.orgs.addMember(selectedId, {
                email: memberEmail.trim(),
                role: memberRole,
            })
            setMemberEmail('')
            await refreshOrg()
            await refreshStaff()
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not add member.')
        } finally {
            setBusy(false)
        }
    }

    const cancelInvite = async (memberId: string) => {
        if (!selectedId) return
        setBusy(true)
        setError('')
        try {
            await apiClient.orgs.cancelInvite(selectedId, memberId)
            await refreshOrg()
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not cancel invite.')
        } finally {
            setBusy(false)
        }
    }

    const removeStudent = async (userId: string, label: string) => {
        if (!selectedId || !userId) return
        const ok = window.confirm(`Remove ${label} from this club? Their seat will be freed.`)
        if (!ok) return
        setBusy(true)
        setError('')
        try {
            await apiClient.orgs.removeMember(selectedId, userId)
            await refreshOrg()
            await refreshStaff()
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not remove member.')
        } finally {
            setBusy(false)
        }
    }

    const assignCohort = async (userId: string, cohortId: string) => {
        if (!selectedId || !userId || !cohortId) return
        setBusy(true)
        setError('')
        try {
            await apiClient.orgs.assignMemberCohort(selectedId, userId, cohortId)
            await refreshOrg()
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not assign class.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <OrgPageGate loading={loading} hasOrgs={staffOrgs.length > 0} selected={Boolean(selected)}>
            <div className="space-y-6">
                <OrgPageHeader
                    title="People"
                    description="Invite students and tutors to your club. Student seats count toward your plan."
                />

                <OrgAlertBanner message={error} />

                {studentsWithoutCohort.length > 0 && (
                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-black text-amber-900">
                                {studentsWithoutCohort.length} student
                                {studentsWithoutCohort.length === 1 ? '' : 's'} without a class
                            </p>
                            <p className="text-amber-800/90 font-medium text-xs mt-1">
                                Assign them to a cohort below so they get the right courses and pride scope.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid sm:grid-cols-3 gap-3">
                    <OrgStatCard
                        label="Active"
                        value={activeMembers.length}
                        icon={<Users className="w-5 h-5" />}
                    />
                    <OrgStatCard
                        label="Invited"
                        value={invitedMembers.length}
                        icon={<Mail className="w-5 h-5" />}
                        accent="#F59E0B"
                        accentBg="#FEF3C7"
                    />
                    <OrgStatCard
                        label="Seats left"
                        value={selected?.org.seatsRemaining ?? 0}
                        icon={<Shield className="w-5 h-5" />}
                        accent="#10B981"
                        accentBg="#D1FAE5"
                    />
                </div>

                <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Invite someone
                    </h2>
                    <div className="flex flex-col lg:flex-row gap-2">
                        <input
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            placeholder="Email address"
                            type="email"
                            className="flex-1 h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-medium"
                        />
                        <select
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value as 'student' | 'tutor')}
                            className="h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-bold lg:w-40"
                            disabled={!isOwner && memberRole === 'tutor'}
                        >
                            <option value="student">Student</option>
                            {isOwner && <option value="tutor">Tutor</option>}
                        </select>
                        <button
                            type="button"
                            disabled={busy || !memberEmail.trim() || (!isOwner && memberRole === 'tutor')}
                            onClick={() => void addMember()}
                            className="h-11 px-5 rounded-xl bg-sky-600 text-white text-sm font-black disabled:opacity-50"
                        >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send invite'}
                        </button>
                    </div>
                    {!isOwner && (
                        <p className="text-[11px] text-slate-500 font-medium">
                            Only club owners can invite tutors. You can still invite students and manage cohorts.
                        </p>
                    )}
                </section>

                <section className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-black text-slate-800">Roster</h2>
                    </div>
                    {members.length === 0 ? (
                        <p className="px-5 py-8 text-sm font-medium text-slate-500 text-center">
                            No members yet. Invite your first student above.
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {members.map((member) => {
                                const label = member.inviteEmail || member.userId || 'Member'
                                const canManageStudent =
                                    member.role === 'student' &&
                                    member.status === 'active' &&
                                    member.userId &&
                                    !member.userId.startsWith('invite:')
                                return (
                                    <li
                                        key={member.id}
                                        className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900 truncate">{label}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                <span
                                                    className={cn(
                                                        'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                                                        ROLE_STYLES[member.role] || 'bg-slate-50 text-slate-600 border-slate-100',
                                                    )}
                                                >
                                                    {member.role}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-[10px] font-black uppercase px-2 py-0.5 rounded-full',
                                                        STATUS_STYLES[member.status] || 'bg-slate-100 text-slate-600',
                                                    )}
                                                >
                                                    {member.status}
                                                </span>
                                                {member.role === 'student' && member.status === 'active' && (
                                                    <span
                                                        className={cn(
                                                            'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                                            member.cohort?.name
                                                                ? 'bg-sky-50 text-sky-700'
                                                                : 'bg-amber-50 text-amber-700',
                                                        )}
                                                    >
                                                        {member.cohort?.name || 'No class assigned'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            {canManageStudent && activeCohorts.length > 0 && (
                                                <label className="inline-flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                        Class
                                                    </span>
                                                    <select
                                                        value={member.cohort?.id || ''}
                                                        disabled={busy}
                                                        onChange={(e) => {
                                                            const next = e.target.value
                                                            if (next) void assignCohort(member.userId, next)
                                                        }}
                                                        className="h-9 min-w-[9rem] px-2 rounded-xl border border-slate-200 text-xs font-bold"
                                                    >
                                                        <option value="">Assign…</option>
                                                        {activeCohorts.map((cohort) => (
                                                            <option key={cohort.id} value={cohort.id}>
                                                                {cohort.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            )}
                                            {canManageStudent && (isOwner || member.role === 'student') && (
                                                <button
                                                    type="button"
                                                    className="h-9 px-3 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5 disabled:opacity-50"
                                                    disabled={busy}
                                                    onClick={() => void removeStudent(member.userId, label)}
                                                >
                                                    <UserMinus className="w-3.5 h-3.5" />
                                                    Remove
                                                </button>
                                            )}
                                            {member.status === 'invited' && isOwner && (
                                                <button
                                                    type="button"
                                                    className="text-xs font-bold text-red-600 hover:text-red-700"
                                                    disabled={busy}
                                                    onClick={() => void cancelInvite(member.id)}
                                                >
                                                    Cancel invite
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </OrgPageGate>
    )
}
