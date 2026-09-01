'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type OrgStatCardProps = {
    label: string
    value: string | number
    hint?: string
    icon: ReactNode
    accent?: string
    accentBg?: string
}

export function OrgStatCard({
    label,
    value,
    hint,
    icon,
    accent = '#0EA5E9',
    accentBg = '#E0F2FE',
}: OrgStatCardProps) {
    return (
        <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 flex items-start justify-between gap-3 shadow-sm">
            <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                {hint && <p className="text-[11px] font-medium text-slate-500">{hint}</p>}
            </div>
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: accentBg, color: accent }}
            >
                {icon}
            </div>
        </div>
    )
}

type OrgAlertBannerProps = {
    message: string
    tone?: 'error' | 'info'
}

export function OrgAlertBanner({ message, tone = 'error' }: OrgAlertBannerProps) {
    if (!message) return null
    return (
        <div
            className={cn(
                'p-3 rounded-xl border text-xs font-bold',
                tone === 'error'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-sky-50 border-sky-200 text-sky-800',
            )}
        >
            {message}
        </div>
    )
}

type OrgEmptyClubProps = {
    title: string
    description: string
    icon?: ReactNode
}

export function OrgEmptyClub({ title, description, icon }: OrgEmptyClubProps) {
    return (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center space-y-3 max-w-lg mx-auto">
            {icon}
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            <p className="text-sm font-medium text-slate-500">{description}</p>
        </div>
    )
}

type OrgLoadingProps = {
    label?: string
}

export function OrgLoading({ label = 'Loading club dashboard…' }: OrgLoadingProps) {
    return (
        <div className="flex items-center justify-center py-24 text-slate-500 text-sm font-bold gap-2">
            <span className="inline-block w-5 h-5 rounded-full border-2 border-sky-200 border-t-sky-600 animate-spin" />
            {label}
        </div>
    )
}

type OrgGateProps = {
    loading: boolean
    hasOrgs: boolean
    selected: boolean
    children: ReactNode
}

export function OrgPageGate({ loading, hasOrgs, selected, children }: OrgGateProps) {
    if (loading) return <OrgLoading />
    if (!hasOrgs) {
        return (
            <OrgEmptyClub
                title="No club yet"
                description="This dashboard is for organisation owners and club tutors. Ask After-school.tech to create your club and invite your email as owner — then refresh here."
            />
        )
    }
    if (!selected) return <OrgLoading label="Selecting club…" />
    return <>{children}</>
}
