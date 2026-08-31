'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Crown } from 'lucide-react'
import { usePrefetchPrideBoard, usePrideSummary, type PrideStat } from '@/hooks/use-pride'
import { GoldHint } from '@/components/pride/gold-hint'
import { crownClass, formatPrideValue, hasPrideRecord } from '@/lib/pride-format'
import { prideBoardPath } from '@/lib/pride-paths'
import { cn } from '@/lib/utils'

export default function PrideIndexPage() {
    const { data: stats = [], isLoading, isFetching, isError } = usePrideSummary()
    const prefetchBoard = usePrefetchPrideBoard()
    const featured = useMemo(() => stats.filter((item) => item.group === 'featured'), [stats])
    const types = useMemo(() => stats.filter((item) => item.group === 'type'), [stats])
    const speeds = useMemo(() => stats.filter((item) => item.group === 'speed'), [stats])
    const showLoading = isLoading && stats.length === 0

    return (
        <div className="w-full space-y-8 pb-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9600]">Pride</p>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Crowns and boards</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Public ranks only. Gold, silver, and bronze are 1st, 2nd, and 3rd.
                    </p>
                </div>
                {isFetching && stats.length > 0 && (
                    <p className="text-[10px] font-bold text-slate-400 shrink-0">Updating…</p>
                )}
            </div>

            {isError && stats.length === 0 && <p className="text-sm font-bold text-red-600">Could not load pride boards.</p>}
            {showLoading ? (
                <p className="text-sm font-bold text-slate-400">Loading boards…</p>
            ) : (
                <>
                    <section className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {featured.map((stat) => (
                            <StatTile key={stat.key} stat={stat} onPrefetch={() => prefetchBoard(stat.key)} />
                        ))}
                    </section>
                    {types.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-sm font-black text-slate-700 dark:text-slate-200">All scored blocks</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                {types.map((stat) => (
                                    <StatRow key={stat.key} stat={stat} onPrefetch={() => prefetchBoard(stat.key)} />
                                ))}
                            </div>
                        </section>
                    )}
                    {speeds.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-sm font-black text-slate-700 dark:text-slate-200">Fastest live by block</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                {speeds.map((stat) => (
                                    <StatRow key={stat.key} stat={stat} onPrefetch={() => prefetchBoard(stat.key)} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    )
}

function StatTile({ stat, onPrefetch }: { stat: PrideStat; onPrefetch: () => void }) {
    const mine = hasPrideRecord(stat.you)
    const gold = stat.leaders?.[0]
    return (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-[#FF9600] transition-colors">
            <Link href={prideBoardPath(stat.key)} onMouseEnter={onPrefetch} onFocus={onPrefetch} className="block">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{formatPrideValue(stat.you?.value, stat.unit)}</p>
                    <CrownMark crown={stat.you?.crown} rank={stat.you?.rank} />
                </div>
            </Link>
            <div className="mt-2">
                {mine ? (
                    <p className="text-[11px] font-bold text-slate-500">Your rank #{stat.you?.rank}</p>
                ) : (
                    <GoldHint gold={gold} unit={stat.unit} />
                )}
            </div>
        </div>
    )
}

function StatRow({ stat, onPrefetch }: { stat: PrideStat; onPrefetch: () => void }) {
    const mine = hasPrideRecord(stat.you)
    const gold = stat.leaders?.[0]
    return (
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 hover:border-[#1CB0F6]">
            <Link
                href={prideBoardPath(stat.key)}
                onMouseEnter={onPrefetch}
                onFocus={onPrefetch}
                className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate min-w-0"
            >
                {stat.label}
            </Link>
            {mine ? (
                <span className="inline-flex items-center gap-2 shrink-0">
                    <CrownMark crown={stat.you?.crown} rank={stat.you?.rank} />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">{formatPrideValue(stat.you?.value, stat.unit)}</span>
                </span>
            ) : (
                <GoldHint gold={gold} unit={stat.unit} />
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
            <Crown className="w-4 h-4" fill="currentColor" stroke="currentColor" />
            #{rank}
        </span>
    )
}
