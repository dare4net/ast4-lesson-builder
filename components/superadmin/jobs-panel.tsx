'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Loader2, Play } from 'lucide-react';
import { superadminClient } from '@/lib/superadmin-client';
import { JobRunReport, type JobRunDetail } from '@/components/superadmin/job-run-report';

type JobRow = {
    id: 'streak_reminders' | 'lesson_reminders';
    title: string;
    description: string;
    cadence: string;
    pushConfigured: boolean;
    pushRegisteredUsers: number;
    lastPreview: JobRunDetail | null;
    lastSend: JobRunDetail | null;
};

type JobPanelTab = 'preview' | 'send';

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
    const [activeTab, setActiveTab] = useState<Record<string, JobPanelTab>>({});
    const [livePreview, setLivePreview] = useState<Record<string, JobRunDetail>>({});
    const [liveSend, setLiveSend] = useState<Record<string, JobRunDetail>>({});

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
                `Send ${job.title.toLowerCase()} now? Only eligible students with a registered device token are pinged. Students already reminded today are skipped.`,
            );
            if (!ok) return;
        }
        setBusyId(job.id);
        setError('');
        try {
            const data = await superadminClient.runJob(job.id, { dryRun });
            const result = data?.result as JobRunDetail | undefined;
            if (result) {
                if (dryRun) {
                    setLivePreview((current) => ({ ...current, [job.id]: result }));
                    setActiveTab((current) => ({ ...current, [job.id]: 'preview' }));
                } else {
                    setLiveSend((current) => ({ ...current, [job.id]: result }));
                    setActiveTab((current) => ({ ...current, [job.id]: 'send' }));
                }
            }
            await load();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(message || 'Could not run job.');
        } finally {
            setBusyId(null);
        }
    };

    const registeredCount = jobs[0]?.pushRegisteredUsers ?? 0;

    if (loading && !jobs.length) {
        return (
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs…
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700">
                    Render has no cron — these are manual evening reminders.
                </p>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-600">Preview</span> builds a live audience list (never sends).
                    {' '}<span className="font-bold text-slate-600">Run</span> sends FCM and saves a new last-send snapshot.
                    {' '}Come back anytime — Preview is fresh when you click it; Last send stays frozen until the next Run.
                </p>
                <p className="text-[11px] font-bold text-emerald-700">
                    {registeredCount} student account{registeredCount === 1 ? '' : 's'} with at least one push device token in Mongo
                </p>
            </div>
            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">{error}</div>}
            {jobs.map((job) => {
                const busy = busyId === job.id;
                const tab = activeTab[job.id] || 'preview';
                const previewRun = livePreview[job.id] || job.lastPreview;
                const sendRun = liveSend[job.id] || job.lastSend;
                const activeRun = tab === 'preview' ? previewRun : sendRun;

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
                                {job.pushConfigured ? 'Server can send (FCM configured)' : 'Server cannot send yet'}
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                                Preview {when(previewRun?.finishedAt || previewRun?.createdAt)}
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                                Last send {when(sendRun?.finishedAt || sendRun?.createdAt)}
                            </span>
                        </div>

                        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit">
                            <button
                                type="button"
                                onClick={() => setActiveTab((current) => ({ ...current, [job.id]: 'preview' }))}
                                className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
                                    tab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                                }`}
                            >
                                Preview
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab((current) => ({ ...current, [job.id]: 'send' }))}
                                className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
                                    tab === 'send' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                                }`}
                            >
                                Last send
                            </button>
                        </div>

                        {activeRun ? (
                            <JobRunReport run={activeRun} jobKind={job.id} variant={tab} />
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-[11px] font-medium text-slate-400">
                                {tab === 'preview'
                                    ? 'No preview yet. Click Preview to build the live audience list.'
                                    : 'No send yet. Click Run to deliver and save a snapshot here.'}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
