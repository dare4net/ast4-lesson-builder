'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { useAuth } from '@/context/auth-context'
import { isOnboardingReplay, isStudentRole, needsOnboarding } from '@/lib/onboarding'

function OnboardingGate() {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const replay = isOnboardingReplay(searchParams?.toString())
    const [started, setStarted] = useState(false)

    useEffect(() => {
        if (loading) return
        if (!isAuthenticated) {
            router.replace('/auth/login?role=student')
            return
        }
        if (user && !isStudentRole(user.role)) {
            router.replace('/dashboard/tutor')
            return
        }
        if (needsOnboarding(user) || replay) {
            setStarted(true)
            return
        }
        if (!started) router.replace('/dashboard/student')
    }, [loading, isAuthenticated, user, router, started, replay])

    if (started) return <OnboardingFlow />

    return <div className="min-h-screen grid place-items-center text-xs font-extrabold text-slate-400">Loading…</div>
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center text-xs font-extrabold text-slate-400">Loading…</div>}>
            <OnboardingGate />
        </Suspense>
    )
}
