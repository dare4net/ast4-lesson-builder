'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type OrgPageHeaderProps = {
    title: string
    description?: string
    actions?: ReactNode
    className?: string
}

export function OrgPageHeader({ title, description, actions, className }: OrgPageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3', className)}>
            <div className="space-y-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-sky-600">Club OS</p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm font-medium text-slate-500 max-w-2xl">{description}</p>
                )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
    )
}
