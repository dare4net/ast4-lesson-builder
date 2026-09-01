'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'

type InvitePreview = {
    org: { id: string; name: string; slug: string; status: string }
    inviteEmail: string | null
    role: string
    status: string
    needsOnboarding: boolean
}

export default function OrgInvitePage() {
    const params = useParams()
    const router = useRouter()
    const { establishSession, login, isAuthenticated, loading: authLoading } = useAuth()
    const token = typeof params?.token === 'string' ? params.token : ''

    const [preview, setPreview] = useState<InvitePreview | null>(null)
    const [loadError, setLoadError] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const [step, setStep] = useState<'password' | 'cohort'>('password')
    const [fullName, setFullName] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [cohortName, setCohortName] = useState('')
    const [returnPassword, setReturnPassword] = useState('')

    useEffect(() => {
        if (!token) {
            setLoadError('This invite link is missing a token.')
            return
        }
        let cancelled = false
        ;(async () => {
            try {
                const data = await apiClient.orgs.previewInvite(token)
                if (cancelled) return
                setPreview({
                    org: data.org,
                    inviteEmail: data.inviteEmail,
                    role: data.role,
                    status: data.status,
                    needsOnboarding: data.needsOnboarding === true,
                })
            } catch {
                if (!cancelled) setLoadError('This invite link is invalid or has been revoked.')
            }
        })()
        return () => {
            cancelled = true
        }
    }, [token])

    useEffect(() => {
        if (authLoading || !isAuthenticated || !preview) return
        if (!preview.needsOnboarding) {
            router.replace('/dashboard/org')
        }
    }, [authLoading, isAuthenticated, preview, router])

    const finishOnboarding = async (e: FormEvent) => {
        e.preventDefault()
        if (!token || !preview?.needsOnboarding) return
        setError('')
        if (step === 'password') {
            if (password.length < 8) {
                setError('Password must be at least 8 characters.')
                return
            }
            if (password !== confirm) {
                setError('Passwords do not match.')
                return
            }
            if (fullName.trim().length < 2) {
                setError('Enter your name.')
                return
            }
            setStep('cohort')
            return
        }

        setBusy(true)
        try {
            const data = await apiClient.orgs.completeInvite(token, {
                fullName: fullName.trim(),
                password,
                cohortName: cohortName.trim(),
            })
            establishSession(data.token, data.user)
            router.replace('/dashboard/org')
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
                'Could not finish club setup.'
            setError(message)
        } finally {
            setBusy(false)
        }
    }

    const returnLogin = async (e: FormEvent) => {
        e.preventDefault()
        if (!preview?.inviteEmail) return
        setBusy(true)
        setError('')
        try {
            await login(preview.inviteEmail, returnPassword)
            router.replace('/dashboard/org')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F4F7FB] grid place-items-center px-4 py-10">
            <div className="w-full max-w-md rounded-3xl border-2 border-slate-100 bg-white p-8 space-y-5">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-sky-600 mb-2">
                        Club invite
                    </p>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {preview?.org?.name || 'Your organisation'}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {preview?.needsOnboarding
                            ? 'Set a password, create your first cohort, then you’re in.'
                            : 'Welcome back — enter your password to open the club dashboard.'}
                    </p>
                </div>

                {loadError && <p className="text-sm font-bold text-red-600">{loadError}</p>}
                {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                        {error}
                    </div>
                )}

                {!loadError && !preview && (
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading invite…
                    </div>
                )}

                {preview?.needsOnboarding && (
                    <form onSubmit={(e) => void finishOnboarding(e)} className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-500">
                            Invited as <span className="text-slate-800">{preview.inviteEmail}</span>
                            {' · '}
                            Step {step === 'password' ? '1 of 2' : '2 of 2'}
                        </p>

                        {step === 'password' ? (
                            <>
                                <input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                                    required
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create password (8+ characters)"
                                    className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                                    required
                                    minLength={8}
                                />
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                                    required
                                    minLength={8}
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    value={cohortName}
                                    onChange={(e) => setCohortName(e.target.value)}
                                    placeholder="First cohort name (e.g. Thu KS2)"
                                    className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                                    required
                                    minLength={2}
                                />
                                <button
                                    type="button"
                                    className="text-[11px] font-bold text-slate-500"
                                    onClick={() => setStep('password')}
                                >
                                    ← Back
                                </button>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={busy}
                            className="w-full h-11 rounded-2xl bg-sky-600 text-white text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {busy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : step === 'password' ? (
                                <>Continue <ArrowRight className="w-4 h-4" /></>
                            ) : (
                                <>Create cohort & enter <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                )}

                {preview && !preview.needsOnboarding && (
                    <form onSubmit={(e) => void returnLogin(e)} className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-500">
                            Sign in as <span className="text-slate-800">{preview.inviteEmail}</span>
                        </p>
                        <input
                            type="password"
                            value={returnPassword}
                            onChange={(e) => setReturnPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                            required
                        />
                        <button
                            type="submit"
                            disabled={busy}
                            className="w-full h-11 rounded-2xl bg-sky-600 text-white text-sm font-black inline-flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Open club dashboard'}
                        </button>
                        <p className="text-[11px] text-center text-slate-400 font-medium">
                            Or bookmark{' '}
                            <Link href="/dashboard/org" className="text-sky-700 font-bold">
                                /dashboard/org
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
