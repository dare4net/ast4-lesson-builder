'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Loader2, Play } from 'lucide-react';
import { superadminClient } from '@/lib/superadmin-client';

type JobSample = {
    userId: string;
    title: string;
    body: string;
    href?: string;
};

type JobRun = {
    jobId: string;
    dryRun: boolean;
    candidates: number;
    skippedAlreadySent: number;
    dispatched: number;
    queued: number;
    truncated: boolean;
    pushConfigured: boolean;
    sample: JobSample[];
    startedAt?: string;
    finishedAt?: string;
    createdAt?: string;
};

type JobRow = {
    id: string;
    title: string;
    description: string;
    cadence: string;
    pushConfigured: boolean;
    lastRun: JobRun | null;
};

function when(value?: string) {
    if (!value) return 'Never';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return 'Never';
    return formatDistanceToNow(date, { addSuffix: true });
}

export function JobsPanel() {
    const [jobs, setJobs] = useState<JobRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, JobRun>>({});

    const load = async () => {
        setError('');
        setLoading(true);
        try {
            const data = await superadminClient.listJobs();
            setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        } catch {
            setError('Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const run = async (job: JobRow, dryRun: boolean) => {
        if (!dryRun) {
            const ok = window.confirm(
                job.pushConfigured
                    ? `Send ${job.title.toLowerCase()} now? Students who already got this today are skipped.`
                    : `Preview-quality run: FCM is not wired yet, so this will count the audience and not send popups. Continue?`
            );
            if (!ok) return;
        }
        setBusyId(job.id);
        setError('');
        try {
            const data = await superadminClient.runJob(job.id, { dryRun });
            if (data?.result) {
                setResults((current) => ({ ...current, [job.id]: data.result }));
            }
            await load();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(message || 'Could not run job.');
        } finally {
            setBusyId(null);
        }
    };

    if (loading && !jobs.length) {
        return (
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs…
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-xs font-medium text-slate-400">
                Render has no cron on this tier. These are the daily reminder jobs — preview the audience, then run when you want the send. Closed-app popups need FCM; until that is wired, Run counts and queues, it does not ping phones.
            </p>
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">{error}</div>}
            {jobs.map((job) => {
                const result = results[job.id] || job.lastRun;
                const busy = busyId === job.id;
                return (
                    <section key={job.id} className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-sm font-black text-slate-800">{job.title}</h2>
                                <p className="text-[12px] text-slate-500 mt-1">{job.description}</p>
                                <p className="text-[11px] font-bold text-slate-400 mt-2">{job.cadence}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    disabled={Boolean(busyId)}
                                    onClick={() => void run(job, true)}
                                    className="h-9 px-3 rounded-xl border-2 border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                                    Preview
                                </button>
                                <button
                                    type="button"
                                    disabled={Boolean(busyId)}
                                    onClick={() => void run(job, false)}
                                    className="h-9 px-3 rounded-xl bg-[#58CC02] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                    Run
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                            <span className={`px-2 py-1 rounded-lg ${job.pushConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {job.pushConfigured ? 'FCM configured' : 'FCM not wired'}
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                                Last run {when(job.lastRun?.finishedAt || job.lastRun?.createdAt)}
                                {job.lastRun?.dryRun ? ' · preview' : job.lastRun ? ' · send' : ''}
                            </span>
                        </div>
                        {result && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                                    {result.dryRun ? 'Preview' : 'Last send'} · {result.candidates} students
                                    {result.truncated ? ' (capped)' : ''}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-600">
                                    <span>Queued {result.queued}</span>
                                    <span>Sent {result.dispatched}</span>
                                    <span>Already today {result.skippedAlreadySent}</span>
                                    <span>{result.pushConfigured ? 'Push on' : 'Push off'}</span>
                                </div>
                                {result.sample?.length > 0 && (
                                    <ul className="space-y-1">
                                        {result.sample.map((row) => (
                                            <li key={`${row.userId}-${row.title}`} className="text-[11px] text-slate-500 truncate">
                                                <span className="font-bold text-slate-700">{row.title}</span>
                                                {' · '}
                                                {row.body}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
