'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { avatarUrl, resolveAvatarId } from '@/lib/avatar'
import { resolveAccentColor } from '@/lib/pride-format'
import { cn } from '@/lib/utils'

export function HandleAvatar({
    handle,
    avatarId,
    displayName,
    accentColor,
    avatarFrame,
    className,
    fallbackClassName,
}: {
    handle?: string | null
    avatarId?: string | null
    displayName?: string | null
    accentColor?: string | null
    avatarFrame?: string | null
    className?: string
    fallbackClassName?: string
}) {
    const seed = handle || displayName || 'student'
    const id = resolveAvatarId(seed, avatarId)
    const accent = resolveAccentColor(handle, accentColor)
    const letter = (displayName || handle || 'S')[0]?.toUpperCase() || 'S'
    const gold = avatarFrame === 'gold'

    return (
        <Avatar
            className={cn('h-8 w-8 border-2 shrink-0', gold && 'ring-2 ring-[#FFD700] ring-offset-2 ring-offset-white dark:ring-offset-slate-900', className)}
            style={{ borderColor: gold ? '#FFD700' : `${accent}55` }}
        >
            <AvatarImage src={avatarUrl(seed, id)} alt="" />
            <AvatarFallback className={cn('text-xs font-extrabold', fallbackClassName)} style={{ color: accent, backgroundColor: `${accent}22` }}>
                {letter}
            </AvatarFallback>
        </Avatar>
    )
}
