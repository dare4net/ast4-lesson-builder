'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useFollowHandle } from '@/hooks/use-people'
import { crownClass, resolveAccentColor } from '@/lib/pride-format'
import { publicProfilePath } from '@/lib/pride-paths'
import { cn } from '@/lib/utils'

export function CrownTier({ crown, className }: { crown?: string | null; className?: string }) {
    if (crown !== 'gold' && crown !== 'silver' && crown !== 'bronze') return null
    return (
        <Crown
            className={cn('w-4 h-4 shrink-0', crownClass(crown), className)}
            fill="currentColor"
            stroke="currentColor"
            aria-label={`${crown} crown`}
        />
    )
}

export function FollowChip({
    handle,
    accentColor,
    following = false,
}: {
    handle?: string | null
    accentColor?: string | null
    following?: boolean
}) {
    const { user } = useAuth()
    const color = resolveAccentColor(handle, accentColor)
    const follow = useFollowHandle(handle || '')
    const [on, setOn] = useState(following)

    useEffect(() => {
        setOn(following)
    }, [following])

    if (!handle || handle === user?.handle) return null

    const busy = follow.isPending
    const label = on ? 'Following' : 'Follow'

    return (
        <button
            type="button"
            disabled={busy}
            aria-label={on ? `Unfollow ${handle}` : `Follow ${handle}`}
            onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                const next = !on
                setOn(next)
                const action = next ? follow.follow() : follow.unfollow()
                action.catch(() => setOn(!next))
            }}
            className="h-6 px-2 rounded-lg text-[10px] font-extrabold shrink-0 border"
            style={on
                ? { color, borderColor: color, backgroundColor: 'transparent' }
                : { color: '#fff', borderColor: color, backgroundColor: color }}
        >
            {label}
        </button>
    )
}

export function StudentName({
    handle,
    displayName,
    accentColor,
    bestCrown,
    crown,
    following,
    className,
}: {
    handle?: string | null
    displayName?: string
    accentColor?: string | null
    bestCrown?: string | null
    crown?: string | null
    following?: boolean
    className?: string
}) {
    const color = resolveAccentColor(handle, accentColor)
    const name = displayName || handle || 'Student'
    const medal = bestCrown || crown
    const crownIcon = <CrownTier crown={medal} />
    if (!handle) {
        return (
            <span className="inline-flex items-center gap-1.5 min-w-0">
                {crownIcon}
                <span className={cn('text-sm font-bold text-slate-800 dark:text-white truncate', className)}>{name}</span>
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            {crownIcon}
            <Link
                href={publicProfilePath(handle)}
                className={cn('text-sm font-extrabold truncate hover:underline', className)}
                style={{ color }}
            >
                {name}
            </Link>
            <FollowChip handle={handle} accentColor={color} following={following} />
        </span>
    )
}
