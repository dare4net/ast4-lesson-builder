'use client'

import { type ReactNode } from 'react'
import { SuperadminGate } from '@/components/superadmin/superadmin-gate'
import { SuperadminShell } from '@/components/superadmin/superadmin-shell'

export default function SuperadminConsoleLayout({ children }: { children: ReactNode }) {
    return (
        <SuperadminGate>
            <SuperadminShell>{children}</SuperadminShell>
        </SuperadminGate>
    )
}
