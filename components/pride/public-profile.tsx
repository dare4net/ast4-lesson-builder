'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Crown, MoreHorizontal, UserPlus, UserCheck } from 'lucide-react'
import { HandleAvatar } from '@/components/pride/handle-avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePeopleActions, usePeopleProfile, type PrideCrown, type PrideWallItem } from '@/hooks/use-people'
import { usePrefetchPrideBoard } from '@/hooks/use-pride'
import { GoldHint } from '@/components/pride/gold-hint'
import { CrownTier } from '@/components/pride/student-name'
import { crownClass, formatPrideValue, hasPrideRecord, profileHeadline, resolveAccentColor } from '@/lib/pride-format'
import { PRIDE_INDEX_PATH, prideBoardPath } from '@/lib/pride-paths'
import { cn } from '@/lib/utils'

export function PublicProfileView({ handle }: { handle: string }) {
    const { data, isLoading, isError } = usePeopleProfile(handle)
    const profile = data?.profile
    const viewer = data?.viewer
    const actions = usePeopleActions(handle)
    const prefetchBoard = usePrefetchPrideBoard()
    const [confirmBlock, setConfirmBlock] = useState(false)

    const accent = resolveAccentColor(profile?.handle || handle, profile?.accentColor)
    const headline = profileHeadline(profile)
    const wall = profile?.wall || []
    const pinned = useMemo(
        () => wall.find((item) => item.key === profile?.pinnedStatKey) || null,
        [wall, profile?.pinnedStatKey],
    )
    const featured = useMemo(() => wall.filter((item) => item.group === 'featured'), [wall])
    const types = useMemo(() => wall.filter((item) => item.group === 'type'), [wall])
    const speeds = useMemo(() => wall.filter((item) => item.group === 'speed'), [wall])

    if (isLoading && !profile) {
        return <p className="text-sm font-bold text-slate-400">Loading this handle…</p>
    }

    if (isError) {
        return <p className="text-sm font-bold text-red-600">Could not load this profile.</p>
    }

    if (!profile?.handle) {
        return (
            <div className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-3">
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Profile not found</h1>
                <p className="text-sm font-medium text-slate-500">This profile is private or doesn&apos;t exist.</p>
                <Link href={PRIDE_INDEX_PATH} className="inline-block text-sm font-extrabold text-[#1CB0F6]">
                    Back to Pride
                </Link>
            </div>
        )
    }

    const displayName = profile.displayName || profile.handle
    const golds = profile.goldCrowns || []
    const silvers = profile.silverCrowns || []
    const bronzes = profile.bronzeCrowns || []

    return (
        <div className="w-full space-y-8 pb-8">
            <section className="overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="h-3" style={{ backgroundColor: accent }} />
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                        <HandleAvatar
                            handle={profile.handle}
                            avatarId={profile.avatarId}
                            displayName={displayName}
                            accentColor={accent}
                            avatarFrame={profile.avatarFrame}
                            className="h-28 w-28 border-4"
                            fallbackClassName="text-3xl"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>
                                Public handle
                            </p>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none inline-flex items-center gap-3 flex-wrap" style={{ color: accent }}>
                                @{profile.handle}
                                <CrownTier crown={profile.bestCrown} className="w-8 h-8" />
                            </h1>
                            <p className={cn('text-lg font-extrabold text-slate-800 dark:text-white', profile.nameplate === 'duo' && 'inline-block px-2 py-0.5 rounded-md text-white')} style={profile.nameplate === 'duo' ? { backgroundColor: accent } : undefined}>{displayName}</p>
                            <p className="text-sm font-bold text-slate-500">{headline}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {viewer?.isSelf ? (
                                <Link
                                    href="/dashboard/student/settings"
                                    className="h-11 px-4 inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-extrabold text-slate-700 dark:text-slate-200"
                                >
                                    This is you
                                </Link>
                            ) : viewer?.blocked ? (
                                <button
                                    type="button"
                                    disabled={actions.isBusy}
                                    onClick={() => actions.unblock.mutate()}
                                    className="h-11 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-extrabold text-slate-700 dark:text-slate-200"
                                >
                                    Unblock
                                </button>
                            ) : viewer?.following ? (
                                <button
                                    type="button"
                                    disabled={actions.isBusy}
                                    onClick={() => actions.unfollow.mutate()}
                                    className="h-11 px-4 inline-flex items-center gap-2 rounded-xl text-white text-sm font-extrabold"
                                    style={{ backgroundColor: accent }}
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Following
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={actions.isBusy}
                                    onClick={() => actions.follow.mutate()}
                                    className="h-11 px-4 inline-flex items-center gap-2 rounded-xl text-white text-sm font-extrabold"
                                    style={{ backgroundColor: accent }}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Follow
                                </button>
                            )}
                            {viewer && !viewer.isSelf && !viewer.blocked && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="h-11 w-11 inline-flex items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700"
                                            aria-label="More profile actions"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {viewer.following && (
                                            <DropdownMenuItem onClick={() => actions.mute.mutate(!viewer.muted)}>
                                                {viewer.muted ? 'Unmute gold alerts' : 'Mute gold alerts'}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => setConfirmBlock(true)}>
                                            Block this student
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>

                    {confirmBlock && (
                        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[#FF4B4B]/30 bg-[#FF4B4B]/5">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                Block @{profile.handle}? They will drop from your follows.
                            </p>
                            <button
                                type="button"
                                disabled={actions.isBusy}
                                onClick={() => {
                                    actions.block.mutate()
                                    setConfirmBlock(false)
                                }}
                                className="h-9 px-3 rounded-lg bg-[#FF4B4B] text-white text-xs font-extrabold"
                            >
                                Block
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmBlock(false)}
                                className="h-9 px-3 rounded-lg text-xs font-extrabold text-slate-500"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <CountWell label="Followers" value={profile.followerCount || 0} />
                        <CountWell label="Following" value={profile.followingCount || 0} />
                        <CountWell label="Crowns" value={profile.crownCount || 0} accent="#FF9600" />
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9600]">Podium</p>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Gold, silver, and bronze</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                    <CrownColumn title="Gold" tone="gold" items={golds} empty="No golds yet." />
                    <CrownColumn title="Silver" tone="silver" items={silvers} empty="No silvers yet." />
                    <CrownColumn title="Bronze" tone="bronze" items={bronzes} empty="No bronzes yet." />
                </div>
            </section>

            {pinned ? (
                <section className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#CE82FF]">Pinned</p>
                    <WallTile item={pinned} onPrefetch={() => prefetchBoard(pinned.key)} />
                </section>
            ) : null}

            <section className="space-y-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">Pride wall</p>
                    <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Every board they stand on</h2>
                    <p className="text-sm font-medium text-slate-500">All pride stats, including empty ones. Tap a tile to open the board.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {featured.map((item) => (
                        <WallTile key={item.key} item={item} onPrefetch={() => prefetchBoard(item.key)} />
                    ))}
                </div>
                {types.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">All scored blocks</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {types.map((item) => (
                                <WallRow key={item.key} item={item} onPrefetch={() => prefetchBoard(item.key)} />
                            ))}
                        </div>
                    </div>
                )}
                {speeds.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">Fastest live by block</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {speeds.map((item) => (
                                <WallRow key={item.key} item={item} onPrefetch={() => prefetchBoard(item.key)} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

function CountWell({ label, value, accent }: { label: string; value: number; accent?: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-2xl font-extrabold" style={{ color: accent || undefined }}>
                <span className={accent ? undefined : 'text-slate-800 dark:text-white'}>{value}</span>
            </p>
        </div>
    )
}

function CrownColumn({
    title,
    tone,
    items,
    empty,
}: {
    title: string
    tone: 'gold' | 'silver' | 'bronze'
    items: PrideCrown[]
    empty: string
}) {
    const toneClass = tone === 'gold' ? 'text-[#FF9600] border-[#FF9600]/30' : tone === 'silver' ? 'text-slate-400 border-slate-300' : 'text-amber-700 border-amber-700/30'
    return (
        <div className={cn('rounded-2xl border-2 bg-white dark:bg-slate-900 p-4 space-y-3', toneClass)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-black uppercase tracking-wider">{title}</p>
                <span className="text-xl font-extrabold">{items.length}</span>
            </div>
            {items.length === 0 ? (
                <p className="text-xs font-medium text-slate-500">{empty}</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <Link
                            key={item.statKey}
                            href={prideBoardPath(item.statKey)}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-current"
                        >
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.label}</span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white shrink-0">
                                {formatPrideValue(item.value, item.unit)}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function WallTile({ item, onPrefetch }: { item: PrideWallItem; onPrefetch: () => void }) {
    const mine = hasPrideRecord(item)
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-[#FF9600] transition-colors">
            <Link href={prideBoardPath(item.key)} onMouseEnter={onPrefetch} onFocus={onPrefetch} className="block">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{formatPrideValue(item.value, item.unit)}</p>
                    <CrownMark crown={item.crown} rank={item.rank} />
                </div>
            </Link>
            <div className="mt-2">
                {mine ? (
                    <p className="text-[11px] font-bold text-slate-500">Rank #{item.rank}</p>
                ) : (
                    <GoldHint gold={item.gold} unit={item.unit} />
                )}
            </div>
        </div>
    )
}

function WallRow({ item, onPrefetch }: { item: PrideWallItem; onPrefetch: () => void }) {
    const mine = hasPrideRecord(item)
    return (
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 hover:border-[#1CB0F6]">
            <Link
                href={prideBoardPath(item.key)}
                onMouseEnter={onPrefetch}
                onFocus={onPrefetch}
                className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate min-w-0"
            >
                {item.label}
            </Link>
            {mine ? (
                <span className="inline-flex items-center gap-2 shrink-0">
                    <CrownMark crown={item.crown} rank={item.rank} />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">{formatPrideValue(item.value, item.unit)}</span>
                </span>
            ) : (
                <GoldHint gold={item.gold} unit={item.unit} />
            )}
        </div>
    )
}

function CrownMark({ crown, rank }: { crown?: string | null; rank?: number | null }) {
    if (!crown) {
        return rank ? <span className="text-xs font-black text-slate-400">#{rank}</span> : null
    }
    return (
        <span className={cn('inline-flex items-center gap-1 text-xs font-black', crownClass(crown))}>
            <Crown className="w-4 h-4" />
            #{rank}
        </span>
    )
}
