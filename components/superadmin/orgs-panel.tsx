'use client';

import { useEffect, useMemo, useState } from 'react';
import { Globe, Loader2, Plus, Save, Search, ShieldAlert, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { vanityHostForSlug } from '@/lib/vanity-host';
import {
    mapSuperadminOrgError,
    orgStatusTone,
    ORG_STATUS_OPTIONS,
    type OrgStatus,
} from '@/lib/superadmin-org-errors';
import { superadminClient } from '@/lib/superadmin-client';
import { CohortProgramsEditor, type OrgProgramOption } from '@/components/dashboard/org/cohort-programs-editor';

type OrgRow = {
    id: string;
    name: string;
    slug: string;
    status: string;
    seatCap: number;
    seatsUsed: number;
    seatsRemaining: number;
    settings?: {
        vanityEnabled?: boolean;
        allowPublicOptIn?: boolean;
    };
};

type MemberRow = {
    id: string;
    userId: string;
    role: string;
    status: string;
    seatCounts: boolean;
    inviteEmail?: string | null;
    inviteToken?: string | null;
};

type CohortRow = {
    id: string;
    name: string;
    joinCode: string;
    status: string;
    memberCount: number;
    programIds: string[];
};

export function OrgsPanel() {
    const [orgs, setOrgs] = useState<OrgRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [members, setMembers] = useState<MemberRow[]>([]);
    const [cohorts, setCohorts] = useState<CohortRow[]>([]);
    const [orgPrograms, setOrgPrograms] = useState<OrgProgramOption[]>([]);
    const [programsLoading, setProgramsLoading] = useState(false);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [seatCap, setSeatCap] = useState('40');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [memberRole, setMemberRole] = useState<'owner' | 'tutor' | 'student'>('tutor');
    const [cohortName, setCohortName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [lastInviteLink, setLastInviteLink] = useState('');
    const [inviteCopied, setInviteCopied] = useState(false);
    const [vanitySaving, setVanitySaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | OrgStatus>('all');
    const [editSeatCap, setEditSeatCap] = useState('');
    const [orgSettingsSaving, setOrgSettingsSaving] = useState(false);

    const inviteUrl = (token: string) =>
        `${typeof window !== 'undefined' ? window.location.origin : ''}/org/invite/${token}`;

    const copyInvite = async (token: string) => {
        const link = inviteUrl(token);
        try {
            await navigator.clipboard.writeText(link);
            setLastInviteLink(link);
            setInviteCopied(true);
            window.setTimeout(() => setInviteCopied(false), 1500);
        } catch {
            setError('Could not copy invite link.');
        }
    };

    const load = async () => {
        setError('');
        setLoading(true);
        try {
            const data = await superadminClient.listOrgs();
            setOrgs(Array.isArray(data?.orgs) ? data.orgs : []);
        } catch {
            setError('Failed to load organisations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const selected = useMemo(
        () => orgs.find((row) => row.id === selectedId) || null,
        [orgs, selectedId],
    );

    useEffect(() => {
        if (selected) setEditSeatCap(String(selected.seatCap ?? 0));
    }, [selected?.id, selected?.seatCap]);

    const filteredOrgs = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return orgs.filter((org) => {
            if (statusFilter !== 'all' && org.status !== statusFilter) return false;
            if (!q) return true;
            return (
                org.name.toLowerCase().includes(q) ||
                org.slug.toLowerCase().includes(q) ||
                org.id.toLowerCase().includes(q)
            );
        });
    }, [orgs, searchQuery, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts = { all: orgs.length, active: 0, trial: 0, suspended: 0 };
        for (const org of orgs) {
            if (org.status === 'active') counts.active += 1;
            else if (org.status === 'trial') counts.trial += 1;
            else if (org.status === 'suspended') counts.suspended += 1;
        }
        return counts;
    }, [orgs]);

    const openOrg = async (id: string) => {
        setSelectedId(id);
        setError('');
        setProgramsLoading(true);
        try {
            const [data, programsData] = await Promise.all([
                superadminClient.getOrg(id),
                superadminClient.getOrgPrograms(id),
            ]);
            const nextMembers: MemberRow[] = Array.isArray(data?.members) ? data.members : [];
            setMembers(nextMembers);
            setCohorts(Array.isArray(data?.cohorts) ? data.cohorts : []);
            setOrgPrograms(Array.isArray(programsData?.programs) ? programsData.programs : []);
            if (data?.org) {
                setOrgs((current) => current.map((row) => (row.id === id ? { ...row, ...data.org } : row)));
            }
            const owner = nextMembers.find((m) => m.role === 'owner' && m.inviteToken);
            if (owner?.inviteToken) {
                setLastInviteLink(inviteUrl(owner.inviteToken));
            }
        } catch {
            setError('Failed to load org details.');
            setOrgPrograms([]);
        } finally {
            setProgramsLoading(false);
        }
    };

    const create = async () => {
        if (!name.trim()) return;
        if (!ownerEmail.trim()) {
            setError('Owner email is required — that is how the club gets its invite link.');
            return;
        }
        setBusy(true);
        setError('');
        setLastInviteLink('');
        try {
            const data = await superadminClient.createOrg({
                name: name.trim(),
                slug: slug.trim() || undefined,
                seatCap: Number(seatCap) || 40,
                ownerEmail: ownerEmail.trim(),
            });
            setName('');
            setSlug('');
            setOwnerEmail('');
            await load();
            if (data?.org?.id) await openOrg(data.org.id);
            const token = data?.owner?.inviteToken as string | undefined;
            if (token) {
                await copyInvite(token);
            } else {
                setError('Org created but no invite token came back — select the org under Members.');
            }
        } catch (err: unknown) {
            setError(mapSuperadminOrgError(err, 'Could not create organisation.'));
        } finally {
            setBusy(false);
        }
    };

    const addMember = async () => {
        if (!selectedId || !memberEmail.trim()) return;
        setBusy(true);
        setError('');
        try {
            await superadminClient.addOrgMember(selectedId, {
                email: memberEmail.trim(),
                role: memberRole,
            });
            setMemberEmail('');
            await openOrg(selectedId);
            await load();
        } catch (err: unknown) {
            setError(mapSuperadminOrgError(err, 'Could not add member.'));
        } finally {
            setBusy(false);
        }
    };

    const createCohort = async () => {
        if (!selectedId || !cohortName.trim()) return;
        setBusy(true);
        setError('');
        try {
            await superadminClient.createOrgCohort(selectedId, {
                name: cohortName.trim(),
                joinCode: joinCode.trim() || undefined,
            });
            setCohortName('');
            setJoinCode('');
            await openOrg(selectedId);
        } catch (err: unknown) {
            setError(mapSuperadminOrgError(err, 'Could not create cohort.'));
        } finally {
            setBusy(false);
        }
    };

    if (loading && !orgs.length) {
        return (
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading organisations…
            </div>
        );
    }

    const patchOrg = async (patch: Record<string, unknown>) => {
        if (!selectedId) return
        setOrgSettingsSaving(true)
        setError('')
        try {
            const data = await superadminClient.updateOrg(selectedId, patch)
            if (data?.org) {
                setOrgs((current) =>
                    current.map((row) => (row.id === selectedId ? { ...row, ...data.org } : row)),
                )
            }
            await load()
        } catch (err: unknown) {
            setError(mapSuperadminOrgError(err, 'Could not update organisation.'))
        } finally {
            setOrgSettingsSaving(false)
        }
    }

    const saveSeatCap = async () => {
        const next = Number(editSeatCap)
        if (!Number.isFinite(next) || next < 0) {
            setError('Seat cap must be zero or a positive number.')
            return
        }
        await patchOrg({ seatCap: next })
    }

    const setOrgStatus = async (status: OrgStatus) => {
        if (!selected || selected.status === status) return
        if (status === 'suspended') {
            const ok = window.confirm(
                `Suspend ${selected.name}? New student joins will fail until you reactivate the club.`,
            )
            if (!ok) return
        }
        await patchOrg({ status })
    }

    const toggleVanity = async (enabled: boolean) => {
        if (!selectedId) return;
        setVanitySaving(true);
        setError('');
        try {
            await superadminClient.updateOrg(selectedId, {
                settings: { vanityEnabled: enabled },
            });
            setOrgs((current) =>
                current.map((row) =>
                    row.id === selectedId
                        ? {
                              ...row,
                              settings: { ...row.settings, vanityEnabled: enabled },
                          }
                        : row,
                ),
            );
        } catch (err: unknown) {
            setError(mapSuperadminOrgError(err, 'Could not update vanity subdomain.'));
        } finally {
            setVanitySaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 space-y-2">
                <p className="text-xs font-bold text-amber-900">How clubs onboard</p>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                    Create an organisation with an <span className="font-bold text-slate-700">owner email</span>,
                    copy the invite link, and send it to the club. They set a password and first cohort on that link.
                    Students later join at <span className="font-mono">/join/CODE</span>.
                </p>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">{error}</div>}

            {lastInviteLink && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                    <p className="text-xs font-black text-sky-900">Owner invite / login link</p>
                    <p className="font-mono text-[10px] text-sky-800 break-all">{lastInviteLink}</p>
                    <button
                        type="button"
                        className="h-8 px-3 rounded-lg bg-sky-600 text-white text-[11px] font-bold"
                        onClick={() => {
                            const token = lastInviteLink.split('/org/invite/')[1];
                            if (token) void copyInvite(token);
                        }}
                    >
                        {inviteCopied ? 'Copied' : 'Copy invite link'}
                    </button>
                </div>
            )}

            <section className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New organisation
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name (e.g. Riverside After-School)"
                        className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                    <input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="Slug (optional, e.g. riverside)"
                        className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                    <input
                        value={seatCap}
                        onChange={(e) => setSeatCap(e.target.value)}
                        placeholder="Seat cap"
                        type="number"
                        min={0}
                        className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                    <input
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="Owner email (required)"
                        type="email"
                        required
                        className="h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                </div>
                <button
                    type="button"
                    disabled={busy || !name.trim() || !ownerEmail.trim()}
                    onClick={() => void create()}
                    className="h-9 px-4 rounded-xl bg-[#58CC02] text-white text-xs font-bold disabled:opacity-50"
                >
                    {busy ? 'Saving…' : 'Create org'}
                </button>
            </section>

            <div className="grid lg:grid-cols-2 gap-4">
                <section className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h2 className="text-sm font-black text-slate-800">Organisations</h2>
                        <p className="text-[10px] font-bold text-slate-400">
                            {filteredOrgs.length} of {orgs.length} shown
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search name, slug, or id…"
                            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(['all', 'active', 'trial', 'suspended'] as const).map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setStatusFilter(key)}
                                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                    statusFilter === key
                                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
                                {' '}
                                ({statusCounts[key]})
                            </button>
                        ))}
                    </div>
                    {orgs.length === 0 && (
                        <p className="text-[11px] text-slate-400 font-medium">No orgs yet.</p>
                    )}
                    {orgs.length > 0 && filteredOrgs.length === 0 && (
                        <p className="text-[11px] text-slate-400 font-medium">No matches — try another search or filter.</p>
                    )}
                    <ul className="space-y-2 max-h-[420px] overflow-auto">
                        {filteredOrgs.map((org) => (
                            <li key={org.id}>
                                <button
                                    type="button"
                                    onClick={() => void openOrg(org.id)}
                                    className={`w-full text-left rounded-xl border px-3 py-2 ${
                                        selectedId === org.id
                                            ? 'border-[#58CC02] bg-emerald-50'
                                            : 'border-slate-100 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-black text-slate-800">{org.name}</p>
                                        <span
                                            className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${orgStatusTone(org.status)}`}
                                        >
                                            {org.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        {org.slug} · {org.seatsUsed}/{org.seatCap} seats
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Members
                    </h2>
                    {!selected && (
                        <p className="text-[11px] text-slate-400 font-medium">Select an organisation.</p>
                    )}
                    {selected && (
                        <>
                            <p className="text-[11px] font-bold text-slate-600">
                                {selected.name} · {selected.seatsRemaining} seats left
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                    placeholder="Member email"
                                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                                />
                                <select
                                    value={memberRole}
                                    onChange={(e) => setMemberRole(e.target.value as typeof memberRole)}
                                    className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                                >
                                    <option value="tutor">Tutor</option>
                                    <option value="owner">Owner</option>
                                    <option value="student">Student</option>
                                </select>
                                <button
                                    type="button"
                                    disabled={busy || !memberEmail.trim()}
                                    onClick={() => void addMember()}
                                    className="h-9 px-3 rounded-xl border-2 border-slate-200 text-xs font-bold disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                            <ul className="space-y-2 max-h-40 overflow-auto">
                                {members.map((member) => (
                                    <li
                                        key={member.id}
                                        className="rounded-xl border border-slate-100 px-3 py-2 text-[11px]"
                                    >
                                        <p className="font-bold text-slate-800">
                                            {member.inviteEmail || member.userId}
                                            {' · '}
                                            {member.role}
                                            {' · '}
                                            {member.status}
                                        </p>
                                        {member.inviteToken && (
                                            <div className="mt-1 space-y-1">
                                                <p className="font-mono text-[10px] text-amber-700 break-all">
                                                    {inviteUrl(member.inviteToken)}
                                                </p>
                                                <button
                                                    type="button"
                                                    className="text-[10px] font-bold text-sky-700"
                                                    onClick={() => void copyInvite(member.inviteToken!)}
                                                >
                                                    {inviteCopied ? 'Copied' : 'Copy invite link'}
                                                </button>
                                                {member.status === 'invited' && (
                                                    <button
                                                        type="button"
                                                        className="text-[10px] font-bold text-red-600 ml-2"
                                                        disabled={busy}
                                                        onClick={async () => {
                                                            if (!selectedId) return;
                                                            setBusy(true);
                                                            setError('');
                                                            try {
                                                                await superadminClient.cancelOrgInvite(selectedId, member.id);
                                                                await openOrg(selectedId);
                                                            } catch (err: unknown) {
                                                                setError(mapSuperadminOrgError(err, 'Could not cancel invite.'));
                                                            } finally {
                                                                setBusy(false);
                                                            }
                                                        }}
                                                    >
                                                        Cancel invite
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {!member.inviteToken && (member.role === 'owner' || member.role === 'tutor') && (
                                            <p className="mt-1 text-[10px] text-slate-400 font-medium">
                                                No invite link yet — re-open this org to generate one.
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>
            </div>

            {selected && (
                <section className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-4">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Org settings
                    </h2>
                    {selected.status === 'suspended' && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                            Suspended — students cannot join with a cohort code until status is Active or Trial.
                        </div>
                    )}
                    <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end max-w-md">
                        <label className="block space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Student seat cap
                            </span>
                            <input
                                type="number"
                                min={0}
                                value={editSeatCap}
                                onChange={(e) => setEditSeatCap(e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                            />
                            <span className="text-[10px] text-slate-400 font-medium">
                                {selected.seatsUsed} seats in use · {selected.seatsRemaining} remaining
                            </span>
                        </label>
                        <button
                            type="button"
                            disabled={orgSettingsSaving || busy || editSeatCap === String(selected.seatCap)}
                            onClick={() => void saveSeatCap()}
                            className="h-10 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {orgSettingsSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            Save cap
                        </button>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {ORG_STATUS_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={orgSettingsSaving || busy || selected.status === option.value}
                                    onClick={() => void setOrgStatus(option.value)}
                                    className={`h-9 px-3 rounded-xl text-xs font-bold border transition-colors disabled:opacity-60 ${
                                        selected.status === option.value
                                            ? orgStatusTone(option.value)
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                            {ORG_STATUS_OPTIONS.find((o) => o.value === selected.status)?.hint}
                        </p>
                    </div>
                </section>
            )}

            {selected && (
                <section className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Vanity subdomain
                    </h2>
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-extrabold text-slate-700">
                                Enable {vanityHostForSlug(selected.slug)}
                            </Label>
                            <p className="text-[11px] text-slate-500 font-medium max-w-md">
                                When on, students can open branded join links. DNS for the subdomain must point at
                                this app.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                            {vanitySaving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                            <Switch
                                checked={selected.settings?.vanityEnabled === true}
                                disabled={vanitySaving || busy}
                                onCheckedChange={(next) => void toggleVanity(next)}
                                aria-label="Enable vanity subdomain"
                                className="data-[state=checked]:bg-sky-600"
                            />
                        </div>
                    </div>
                </section>
            )}

            {selected && (
                <section className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                    <h2 className="text-sm font-black text-slate-800">Cohorts</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            value={cohortName}
                            onChange={(e) => setCohortName(e.target.value)}
                            placeholder="Cohort name (e.g. Thu KS2)"
                            className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                        <input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Join code (optional)"
                            className="sm:w-44 h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium uppercase"
                        />
                        <button
                            type="button"
                            disabled={busy || !cohortName.trim()}
                            onClick={() => void createCohort()}
                            className="h-9 px-3 rounded-xl bg-sky-500 text-white text-xs font-bold disabled:opacity-50"
                        >
                            Create cohort
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {cohorts.length === 0 && (
                            <li className="text-[11px] text-slate-400 font-medium">No cohorts yet.</li>
                        )}
                        {cohorts.map((cohort) => (
                            <li key={cohort.id} className="rounded-xl border border-slate-100 px-3 py-3 space-y-2">
                                <div>
                                    <p className="font-bold text-slate-800">
                                        {cohort.name}
                                        {' · '}
                                        <span className="font-mono text-sky-700">{cohort.joinCode}</span>
                                        {' · '}
                                        {cohort.memberCount} members
                                    </p>
                                    <p className="text-slate-400 mt-0.5">
                                        Join link:{' '}
                                        {selected.settings?.vanityEnabled
                                            ? `https://${vanityHostForSlug(selected.slug)}/join/${cohort.joinCode}`
                                            : `/join/${cohort.joinCode}`}
                                    </p>
                                </div>
                                {programsLoading ? (
                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading programs…
                                    </p>
                                ) : (
                                    <CohortProgramsEditor
                                        orgId={selectedId!}
                                        cohortId={cohort.id}
                                        cohortName={cohort.name}
                                        programIds={cohort.programIds || []}
                                        programs={orgPrograms}
                                        disabled={busy}
                                        onSaved={() => void openOrg(selectedId!)}
                                        onSavePrograms={(programIds) =>
                                            superadminClient.updateOrgCohort(selectedId!, cohort.id, { programIds })
                                        }
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
