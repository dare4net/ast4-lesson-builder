'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { superadminClient } from '@/lib/superadmin-client'

export default function SuperadminLoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError('')
        setLoading(true)
        try {
            const result = await superadminClient.login(username, password)
            if (!result?.token) throw new Error('No token')
            superadminClient.setToken(result.token)
            router.replace('/superadmin')
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(
                message === 'Superadmin is not configured'
                    ? 'This console is not configured on the server.'
                    : 'Invalid credentials.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F4F7FB] grid place-items-center px-4">
            <form
                onSubmit={(e) => void onSubmit(e)}
                className="w-full max-w-md rounded-3xl border-2 border-slate-100 bg-white p-8 space-y-5 shadow-sm"
            >
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/icons/icon-192x192.png"
                        alt="After-school.tech"
                        width={36}
                        height={36}
                        className="rounded-lg"
                    />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Platform console
                        </p>
                        <h1 className="text-lg font-black text-slate-900">Sign in</h1>
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-500">
                    Missions, achievements, organisations, and push jobs. Credentials live in server env only.
                </p>
                {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                        {error}
                    </div>
                )}
                <label className="block space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Username</span>
                    <input
                        autoComplete="username"
                        className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <label className="block space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Password</span>
                    <input
                        type="password"
                        autoComplete="current-password"
                        className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-2xl bg-amber-500 text-slate-950 text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-amber-400 transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock console'}
                </button>
            </form>
        </div>
    )
}
