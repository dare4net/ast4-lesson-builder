'use client'

import { FormEvent, ReactNode, useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/auth-context'
import { OrgDashboardProvider } from '@/components/dashboard/org/org-context'
import { OrgSidebar } from '@/components/dashboard/org/org-sidebar'
import { OrgMobileNav } from '@/components/dashboard/org/org-mobile-nav'

function OrgLoginGate() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        try {
            const user = await login(email.trim(), password)
            const role = user.role?.toLowerCase()
            if (role === 'student') {
                setError('Students use the student portal. Club staff sign in here.')
                return
            }
            window.location.assign('/dashboard/org')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F4F7FB] grid place-items-center px-4">
            <div className="w-full max-w-md rounded-3xl border-2 border-slate-100 bg-white p-8 space-y-5 shadow-sm">
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/icons/icon-192x192.png"
                        alt="After-school.tech"
                        width={36}
                        height={36}
                        className="rounded-lg"
                    />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-sky-600">
                            Club dashboard
                        </p>
                        <h1 className="text-lg font-black text-slate-900">Sign in</h1>
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-500">
                    Use the email from your club invite and the password you created on the invite link.
                </p>
                {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                        {error}
                    </div>
                )}
                <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Club email"
                        className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 text-sm font-semibold"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </form>
            </div>
        </div>
    )
}

function OrgShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F4F7FB] text-slate-900 font-sans">
            <OrgSidebar />
            <OrgMobileNav />
            <main className="relative flex flex-col min-h-screen md:pl-[260px]">
                <div className="flex-1 w-full pt-6 pb-24 md:pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="org-page"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

export default function OrgDashboardLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center text-sm font-bold text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <OrgLoginGate />
    }

    return (
        <OrgDashboardProvider>
            <OrgShell>{children}</OrgShell>
        </OrgDashboardProvider>
    )
}
