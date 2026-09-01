'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { apiClient } from '@/lib/api-client'
import { readVanityOrgSlug } from '@/lib/vanity-cookie'

const STUDENT_ORG_KEY = 'ast_student_active_org_id'

type Preview = {
    org: { id: string; name: string; slug: string }
    cohort: { id: string; name: string; joinCode: string; memberCount: number }
}

type VanityOrg = { id: string; name: string; slug: string }

export default function JoinCohortPage() {
    const params = useParams<{ code: string }>()
    const code = decodeURIComponent(String(params?.code || '')).toUpperCase()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [preview, setPreview] = useState<Preview | null>(null)
    const [vanityOrg, setVanityOrg] = useState<VanityOrg | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)
    const [manualCode, setManualCode] = useState(code)

    useEffect(() => {
        let cancelled = false
        const slug = readVanityOrgSlug()
        if (!slug) return
        void apiClient.orgs
            .getPublicBySlug(slug)
            .then((data) => {
                if (!cancelled && data?.org) setVanityOrg(data.org)
            })
            .catch(() => {
                if (!cancelled) setVanityOrg(null)
            })
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        let cancelled = false
        const run = async () => {
            if (!code) {
                setLoading(false)
                return
            }
            setLoading(true)
            setError('')
            try {
                const data = await apiClient.orgs.previewJoin(code)
                if (!cancelled) setPreview({ org: data.org, cohort: data.cohort })
            } catch (err: unknown) {
                const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
                if (!cancelled) {
                    setPreview(null)
                    setError(message || 'Join code not found.')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        void run()
        return () => {
            cancelled = true
        }
    }, [code])

    const join = async () => {
        if (!user) {
            router.push(`/auth/login?next=${encodeURIComponent(`/join/${code}`)}`)
            return
        }
        if (
            vanityOrg &&
            preview &&
            vanityOrg.slug.toLowerCase() !== preview.org.slug.toLowerCase()
        ) {
            setError(`This code belongs to ${preview.org.name}, not ${vanityOrg.name}.`)
            return
        }
        setJoining(true)
        setError('')
        try {
            const result = await apiClient.orgs.join(code)
            const orgId = result?.org?.id || preview?.org?.id
            if (orgId) {
                try {
                    window.localStorage.setItem(STUDENT_ORG_KEY, orgId)
                } catch {
                    // ignore
                }
            }
            router.push('/dashboard/student')
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not join this class.')
        } finally {
            setJoining(false)
        }
    }

    const onManual = (event: FormEvent) => {
        event.preventDefault()
        const next = manualCode.trim().toUpperCase()
        if (!next) return
        router.push(`/join/${encodeURIComponent(next)}`)
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50 px-4 py-10">
            <div className="mx-auto max-w-md rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-sky-600">
                    {vanityOrg ? vanityOrg.name : 'Join a class'}
                </p>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enter your cohort code</h1>
                <p className="text-sm font-medium text-slate-500">
                    Your tutor gives you a code like <span className="font-mono">RIV-THU</span>. Same account works across clubs.
                </p>

                <form onSubmit={onManual} className="flex gap-2">
                    <input
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        className="flex-1 h-11 px-3 rounded-xl border border-slate-200 font-mono text-sm font-bold uppercase"
                        placeholder="JOIN-CODE"
                    />
                    <button type="submit" className="h-11 px-4 rounded-xl border-2 border-slate-200 text-xs font-bold">
                        Look up
                    </button>
                </form>

                {loading || authLoading ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold py-6 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" /> Checking code…
                    </div>
                ) : preview ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                        <div>
                            <p className="text-xs font-bold text-slate-500">{preview.org.name}</p>
                            <p className="text-lg font-black text-slate-900">{preview.cohort.name}</p>
                            <p className="text-[11px] font-mono text-sky-700 mt-1">{preview.cohort.joinCode}</p>
                        </div>
                        <button
                            type="button"
                            disabled={joining}
                            onClick={() => void join()}
                            className="w-full h-11 rounded-2xl bg-[#58CC02] text-white text-sm font-black disabled:opacity-60"
                        >
                            {joining ? 'Joining…' : user ? 'Join this class' : 'Log in to join'}
                        </button>
                        {!user && (
                            <p className="text-[11px] text-slate-500 font-medium text-center">
                                No account yet?{' '}
                                <Link className="font-bold text-sky-700" href={`/auth/signup?next=${encodeURIComponent(`/join/${code}`)}`}>
                                    Sign up
                                </Link>
                            </p>
                        )}
                    </div>
                ) : null}

                {error && <p className="text-xs font-bold text-red-600">{error}</p>}
            </div>
        </main>
    )
}
