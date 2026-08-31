'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';

export type RecipientStatus =
    | 'would_send'
    | 'sent'
    | 'no_token'
    | 'already_sent'
    | 'send_failed'
    | 'unknown';

export type JobRecipient = {
    userId: string;
    handle?: string | null;
    fullName?: string | null;
    status: RecipientStatus;
    tokenCount: number;
    title: string;
    body: string;
    href?: string | null;
    loginStreak?: number;
    lastLoginDate?: string | null;
    programId?: string | null;
    programName?: string | null;
    percentComplete?: number;
    lastActivity?: string | null;
};

export type JobRunDetail = {
    id?: string;
    jobId: string;
    dryRun: boolean;
    candidates: number;
    skippedAlreadySent: number;
    dispatched: number;
    wouldSend: number;
    noToken: number;
    sendFailed: number;
    truncated: boolean;
    pushConfigured: boolean;
    recipients: JobRecipient[];
    startedAt?: string;
    finishedAt?: string;
    createdAt?: string;
    actor?: string | null;
};

const STATUS_LABEL: Record<RecipientStatus, string> = {
    would_send: 'Would send',
    sent: 'Sent',
    no_token: 'No token',
    already_sent: 'Already today',
    send_failed: 'FCM failed',
    unknown: 'Unknown',
};

const STATUS_CLASS: Record<RecipientStatus, string> = {
    would_send: 'bg-sky-50 text-sky-700 border-sky-200',
    sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    no_token: 'bg-amber-50 text-amber-800 border-amber-200',
    already_sent: 'bg-slate-100 text-slate-600 border-slate-200',
    send_failed: 'bg-red-50 text-red-700 border-red-200',
    unknown: 'bg-slate-100 text-slate-500 border-slate-200',
};

function studentLabel(row: JobRecipient) {
    if (row.handle) return `@${row.handle}`;
    if (row.fullName) return row.fullName;
    return row.userId;
}

function formatWhen(value?: string | null) {
    if (!value) return '—';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '—';
    return format(date, 'MMM d, yyyy HH:mm');
}

type JobRunReportProps = {
    run: JobRunDetail;
    jobKind: 'streak_reminders' | 'lesson_reminders';
    variant: 'preview' | 'send';
};

export function JobRunReport({ run, jobKind, variant }: JobRunReportProps) {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<RecipientStatus | 'all'>('all');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (run.recipients || []).filter((row) => {
            if (statusFilter !== 'all' && row.status !== statusFilter) return false;
            if (!q) return true;
            const hay = [
                row.userId,
                row.handle,
                row.fullName,
                row.programName,
                row.title,
                row.body,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return hay.includes(q);
        });
    }, [run.recipients, query, statusFilter]);

    const isPreview = variant === 'preview';

    return (
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                        {isPreview ? 'Preview snapshot' : 'Last send snapshot'}
                        {' · '}
                        {run.candidates} eligible
                        {run.truncated ? ' (capped at 500)' : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {formatWhen(run.finishedAt || run.createdAt)}
                        {run.actor ? ` · by ${run.actor}` : ''}
                        {!isPreview && run.dryRun ? ' · preview run' : ''}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                    {isPreview ? (
                        <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700">Would send {run.wouldSend ?? 0}</span>
                    ) : (
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">Sent {run.dispatched}</span>
                    )}
                    <span className="px-2 py-1 rounded-lg bg-white border border-slate-200">No token {run.noToken ?? 0}</span>
                    <span className="px-2 py-1 rounded-lg bg-white border border-slate-200">Already today {run.skippedAlreadySent}</span>
                    {!isPreview && (run.sendFailed ?? 0) > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-red-50 text-red-700">Failed {run.sendFailed}</span>
                    )}
                </div>
            </div>

            {run.candidates === 0 && (
                <p className="text-[11px] text-slate-500 font-medium">
                    Nobody matches this job&apos;s rules right now. Preview again later — eligibility is live, but this snapshot stays frozen until you run Preview again.
                </p>
            )}

            {run.recipients?.length > 0 && (
                <>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search student, course, message…"
                            className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as RecipientStatus | 'all')}
                            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700"
                        >
                            <option value="all">All statuses</option>
                            {(Object.keys(STATUS_LABEL) as RecipientStatus[]).map((key) => (
                                <option key={key} value={key}>
                                    {STATUS_LABEL[key]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full min-w-[640px] text-left text-[11px]">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wide">
                                <tr>
                                    <th className="px-3 py-2">Student</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Tokens</th>
                                    <th className="px-3 py-2">{jobKind === 'lesson_reminders' ? 'Course' : 'Streak'}</th>
                                    <th className="px-3 py-2">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((row) => (
                                    <tr key={`${row.userId}-${row.title}`} className="text-slate-700">
                                        <td className="px-3 py-2 align-top">
                                            <p className="font-bold text-slate-800">{studentLabel(row)}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{row.userId}</p>
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded-md border font-bold ${STATUS_CLASS[row.status] || STATUS_CLASS.unknown}`}
                                            >
                                                {STATUS_LABEL[row.status] || row.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 align-top font-bold">{row.tokenCount}</td>
                                        <td className="px-3 py-2 align-top font-medium text-slate-600">
                                            {jobKind === 'lesson_reminders' ? (
                                                <>
                                                    {row.programName || 'Course'}
                                                    {row.percentComplete != null ? ` · ${row.percentComplete}%` : ''}
                                                    {row.lastActivity ? (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            Last active {formatWhen(String(row.lastActivity))}
                                                        </p>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <>
                                                    {row.loginStreak ?? 0}-day streak
                                                    {row.lastLoginDate ? (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            Last login {row.lastLoginDate} UTC
                                                        </p>
                                                    ) : null}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <p className="font-bold text-slate-800">{row.title}</p>
                                            <p className="text-slate-500 mt-0.5">{row.body}</p>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-slate-400 font-medium">
                                            No rows match your filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                        Showing {filtered.length} of {run.recipients.length} in this snapshot.
                    </p>
                </>
            )}
        </div>
    );
}
