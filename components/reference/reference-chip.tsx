'use client'

import { BookOpen } from 'lucide-react'
import { useReference } from '@/context/reference-context'
import { REFERENCE_LIVE_COST, REFERENCE_STORE_COST } from '@/lib/store-skus'
import { cn } from '@/lib/utils'

export function ReferenceChip({
    referenceId,
    questionId,
    sourceId,
    mode,
    className,
}: {
    referenceId?: string | null
    questionId?: string | null
    sourceId?: string | null
    mode?: 'practice' | 'live'
    className?: string
}) {
    const reference = useReference()
    if (!referenceId || !reference) return null

    const live = (mode || reference.mode) === 'live'
    return (
        <button
            type="button"
            onClick={() => {
                void reference.open(referenceId, questionId, sourceId)
            }}
            className={cn(
                'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border-2 text-[11px] font-extrabold',
                live
                    ? 'border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#0d9de0]'
                    : 'border-slate-200 bg-white text-slate-600',
                className,
            )}
        >
            <BookOpen className="w-3.5 h-3.5" />
            {live ? `Reference · ${REFERENCE_LIVE_COST}★ or a ${REFERENCE_STORE_COST}★ credit` : 'Open reference'}
        </button>
    )
}
