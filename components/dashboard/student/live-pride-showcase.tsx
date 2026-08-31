"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Radio } from "lucide-react"
import { HandleAvatar } from "@/components/pride/handle-avatar"
import { CrownTier } from "@/components/pride/student-name"
import { usePrideSummary, type PrideStat } from "@/hooks/use-pride"
import { prideCardTheme } from "@/lib/pride-card-themes"
import { crownClass, formatPrideValue } from "@/lib/pride-format"
import { PRIDE_INDEX_PATH, prideBoardPath } from "@/lib/pride-paths"
import {
    PRIDE_SHOWCASE_SIZE,
    prideShowcasePageCount,
    prideShowcaseQueue,
    prideShowcaseWindow,
} from "@/lib/pride-showcase"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

const TIER_ORDER = ["gold", "silver", "bronze"] as const

function HolderRow({
    stat,
    tier,
}: {
    stat: PrideStat
    tier: (typeof TIER_ORDER)[number]
}) {
    const person = (stat.leaders || []).find((row) => row.crown === tier)
        || (stat.leaders || [])[TIER_ORDER.indexOf(tier)]
    const hasPerson = Boolean(person?.handle || person?.displayName)
    return (
        <div className="flex min-h-8 items-center gap-2">
            <CrownTier crown={tier} className="h-3.5 w-3.5" />
            {hasPerson ? (
                <>
                    <HandleAvatar
                        handle={person?.handle}
                        avatarId={person?.avatarId}
                        displayName={person?.displayName}
                        accentColor={person?.accentColor}
                        className="h-6 w-6"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-extrabold text-slate-800 dark:text-white">
                        {person?.displayName || person?.handle}
                    </span>
                    <span className={cn("shrink-0 text-[11px] font-black tabular-nums", crownClass(tier))}>
                        {formatPrideValue(person?.value, stat.unit)}
                    </span>
                </>
            ) : (
                <span className="text-[11px] font-bold text-slate-400">Open — take {tier}</span>
            )}
        </div>
    )
}

function BoardCard({ stat }: { stat: PrideStat }) {
    const theme = prideCardTheme(stat.key)
    return (
        <Link
            href={prideBoardPath(stat.key)}
            className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition-colors hover:border-[#FF9600] dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="h-1.5 w-full" style={{ backgroundColor: theme.bg }} />
            <div className="flex flex-1 flex-col p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.group === "speed" ? "Fastest" : stat.group === "type" ? "Block" : "Pride"}</p>
                <h3 className="mt-0.5 line-clamp-2 text-sm font-extrabold leading-snug text-slate-900 dark:text-white">
                    {stat.label}
                </h3>
                <div className="mt-3 space-y-1.5">
                    {TIER_ORDER.map((tier) => (
                        <HolderRow key={tier} stat={stat} tier={tier} />
                    ))}
                </div>
            </div>
        </Link>
    )
}

export function LivePrideShowcase() {
    const { data: stats = [], isLoading } = usePrideSummary()
    const reduceMotion = useReducedMotion()
    const queue = useMemo(() => prideShowcaseQueue(stats), [stats])
    const pages = prideShowcasePageCount(queue.length)
    const [page, setPage] = useState(0)

    useEffect(() => {
        if (reduceMotion || pages <= 1) return
        const id = window.setInterval(() => {
            setPage((current) => (current + 1) % pages)
        }, 5500)
        return () => window.clearInterval(id)
    }, [pages, reduceMotion])

    const visible = prideShowcaseWindow(queue, page)

    if (!isLoading && queue.length === 0) return null

    return (
        <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <p className={cn("inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF9600]", !reduceMotion && "animate-pulse")}>
                        <Radio className="h-3.5 w-3.5" />
                        Live pride
                    </p>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Who holds the crowns</h2>
                    <p className="text-xs font-medium text-slate-500">
                        Gold, silver, and bronze on boards that are moving right now.
                    </p>
                </div>
                <Link href={PRIDE_INDEX_PATH} className="shrink-0 text-xs font-extrabold text-[#1CB0F6] hover:underline">
                    All boards
                </Link>
            </div>

            {isLoading && queue.length === 0 ? (
                <p className="text-sm font-bold text-slate-400">Loading live boards…</p>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.28 }}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        {visible.map((stat) => (
                            <BoardCard key={stat.key} stat={stat} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {pages > 1 ? (
                <div className="flex justify-center gap-1.5" aria-hidden>
                    {Array.from({ length: pages }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            aria-label={`Pride boards page ${index + 1}`}
                            onClick={() => setPage(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all",
                                index === page ? "w-5 bg-[#FF9600]" : "w-1.5 bg-slate-200 dark:bg-slate-700"
                            )}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    )
}
