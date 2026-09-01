'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SuperadminPageHeaderProps = {
    title: string
    description?: string
    actions?: ReactNode
    className?: string
}

export function SuperadminPageHeader({ title, description, actions, className }: SuperadminPageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3', className)}>
            <div className="space-y-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">Platform console</p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm font-medium text-slate-500 max-w-2xl">{description}</p>
                )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
    )
}

export const SUPERADMIN_FIELD_CLASS =
    'w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm font-medium bg-white'

export function SuperadminAlert({ message, tone = 'error' }: { message: string; tone?: 'error' | 'info' }) {
    if (!message) return null
    return (
        <div
            className={cn(
                'p-3 rounded-xl text-xs font-bold border',
                tone === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-sky-50 border-sky-200 text-sky-800',
            )}
        >
            {message}
        </div>
    )
}
