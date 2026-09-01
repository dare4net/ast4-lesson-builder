'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { superadminClient } from '@/lib/superadmin-client'

export function SuperadminGate({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const token = superadminClient.getToken()
        if (!token) {
            router.replace('/superadmin/login')
            return
        }
        superadminClient
            .me()
            .then(() => setReady(true))
            .catch(() => {
                superadminClient.clearToken()
                router.replace('/superadmin/login')
            })
    }, [router])

    if (!ready) {
        return (
            <div className="min-h-screen grid place-items-center text-sm font-bold text-slate-500 gap-2 bg-[#F4F7FB]">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                Checking access…
            </div>
        )
    }

    return <>{children}</>
}
