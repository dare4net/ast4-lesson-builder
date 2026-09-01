'use client'

import { useEffect, useState } from 'react'
import { Building2, User } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import {
    ACTIVE_ORG_EVENT,
    PERSONAL_ORG_ID,
    getActiveOrgId,
    setActiveOrgId,
} from '@/lib/active-org'
import { cn } from '@/lib/utils'

type StaffOrgOption = {
    id: string
    name: string
}

type StudioOrgSwitcherProps = {
    className?: string
    onChange?: (orgId: string) => void
}

export function StudioOrgSwitcher({ className, onChange }: StudioOrgSwitcherProps) {
    const [staffOrgs, setStaffOrgs] = useState<StaffOrgOption[]>([])
    const [value, setValue] = useState<string>(PERSONAL_ORG_ID)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const data = await apiClient.orgs.mine()
                const rows = Array.isArray(data?.staffOrgs) ? data.staffOrgs : []
                const options: StaffOrgOption[] = rows
                    .map((row: { org?: { id?: string; name?: string } }) => ({
                        id: row?.org?.id || '',
                        name: row?.org?.name || 'Club',
                    }))
                    .filter((row: StaffOrgOption) => row.id)
                if (cancelled) return
                setStaffOrgs(options)

                const saved = getActiveOrgId()
                let next = PERSONAL_ORG_ID
                if (saved === PERSONAL_ORG_ID) next = PERSONAL_ORG_ID
                else if (saved && options.some((o) => o.id === saved)) next = saved
                else if (options[0]) next = options[0].id

                setValue(next)
                setActiveOrgId(next)
                setReady(true)
                onChange?.(next)
            } catch {
                if (cancelled) return
                setStaffOrgs([])
                setValue(PERSONAL_ORG_ID)
                setActiveOrgId(PERSONAL_ORG_ID)
                setReady(true)
                onChange?.(PERSONAL_ORG_ID)
            }
        })()
        return () => {
            cancelled = true
        }
        // intentionally once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const onStorage = (event: Event) => {
            const detail = (event as CustomEvent<{ orgId?: string }>).detail
            if (detail?.orgId) setValue(detail.orgId)
        }
        window.addEventListener(ACTIVE_ORG_EVENT, onStorage)
        return () => window.removeEventListener(ACTIVE_ORG_EVENT, onStorage)
    }, [])

    if (!ready) {
        return (
            <div
                className={cn(
                    'h-9 min-w-[9rem] rounded-xl border-2 border-slate-200 bg-slate-50 animate-pulse',
                    className,
                )}
            />
        )
    }

    // No clubs — keep personal only, compact.
    if (staffOrgs.length === 0) {
        return (
            <div
                className={cn(
                    'h-9 px-3 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold text-slate-600 inline-flex items-center gap-1.5',
                    className,
                )}
            >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Personal library
            </div>
        )
    }

    return (
        <label className={cn('relative inline-flex items-center', className)}>
            <Building2 className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 pointer-events-none" />
            <select
                value={value}
                aria-label="Studio organisation"
                onChange={(e) => {
                    const next = e.target.value
                    setValue(next)
                    setActiveOrgId(next)
                    onChange?.(next)
                }}
                className="h-9 pl-8 pr-8 rounded-xl border-2 border-sky-200 bg-sky-50 text-xs font-bold text-sky-900 appearance-none cursor-pointer max-w-[14rem] truncate"
            >
                {staffOrgs.map((org) => (
                    <option key={org.id} value={org.id}>
                        {org.name}
                    </option>
                ))}
                <option value={PERSONAL_ORG_ID}>Personal library</option>
            </select>
        </label>
    )
}
