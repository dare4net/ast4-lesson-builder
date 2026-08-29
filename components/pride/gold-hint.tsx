'use client'

import { StudentName } from '@/components/pride/student-name'
import { formatPrideValue } from '@/lib/pride-format'

export type GoldHolder = {
    handle?: string | null
    displayName?: string
    value?: number | null
    accentColor?: string | null
    bestCrown?: string | null
    following?: boolean
}

export function GoldHint({ gold, unit }: { gold?: GoldHolder | null; unit?: string }) {
    if (!gold?.handle) {
        return <p className="text-[11px] font-bold text-slate-500">No gold yet — this board is open</p>
    }
    return (
        <span className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold text-[#FF9600] shrink-0">Gold</span>
            <StudentName
                handle={gold.handle}
                displayName={gold.displayName}
                accentColor={gold.accentColor}
                bestCrown={gold.bestCrown || 'gold'}
                following={gold.following}
                className="text-[11px]"
            />
            <span className="text-[11px] font-extrabold text-slate-500 shrink-0">{formatPrideValue(gold.value, unit)}</span>
        </span>
    )
}
