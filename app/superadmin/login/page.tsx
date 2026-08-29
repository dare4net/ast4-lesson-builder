'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { superadminClient } from '@/lib/superadmin-client';

export default function SuperadminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await superadminClient.login(username, password);
            if (!result?.token) throw new Error('No token');
            superadminClient.setToken(result.token);
            router.replace('/superadmin');
        } catch (err: any) {
            const message = err.response?.data?.error;
            setError(message === 'Superadmin is not configured'
                ? 'This console is not configured on the server.'
                : 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                        <Lock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Locked console</p>
                        <h1 className="text-base font-black text-white">Platform Superadmin</h1>
                    </div>
                </div>
                <p className="text-xs text-slate-400">Missions, levels, and achievements. Credentials are env-only.</p>
                {error && <p className="text-xs font-bold text-red-400">{error}</p>}
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Username
                    <input
                        autoComplete="username"
                        className="mt-1 w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Password
                    <input
                        type="password"
                        autoComplete="current-password"
                        className="mt-1 w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock'}
                </button>
            </form>
        </div>
    );
}
