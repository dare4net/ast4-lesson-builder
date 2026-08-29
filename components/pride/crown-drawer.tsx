'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import { formatPrideValue } from '@/lib/pride-format'
import { prideBoardPath } from '@/lib/pride-paths'

type GoldCrown = {
    statKey: string
    label: string
    value: number
    unit?: string
}

export function CrownDrawer({ count, golds }: { count: number; golds: GoldCrown[] }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="w-full space-y-3">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-[#FF9600]/10 text-[#FF9600] text-sm font-extrabold"
            >
                <Crown className="w-4 h-4" />
                {count} {count === 1 ? 'crown' : 'crowns'}
            </button>
            {open && (
                <div className="text-left space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gold crowns</p>
                    {golds.length === 0 ? (
                        <p className="text-xs font-medium text-slate-500">No golds yet. Silver and bronze still count in the total.</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {golds.map((gold) => (
                                <Link
                                    key={gold.statKey}
                                    href={prideBoardPath(gold.statKey)}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#FF9600]"
                                >
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{gold.label}</span>
                                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">{formatPrideValue(gold.value, gold.unit)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
