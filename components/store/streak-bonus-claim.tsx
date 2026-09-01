'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClaimStreakBonus } from '@/hooks/use-claim-streak-bonus'

export function StreakBonusClaimButton({
    amount,
    className,
    variant = 'light',
    onClaimed,
}: {
    amount: number
    className?: string
    variant?: 'light' | 'duo'
    onClaimed?: () => void
}) {
    const claim = useClaimStreakBonus()

    if (amount <= 0) return null

    return (
        <button
            type="button"
            disabled={claim.isPending}
            onClick={() => {
                claim.mutate(undefined, {
                    onSuccess: () => onClaimed?.(),
                })
            }}
            className={cn(
                'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black uppercase tracking-wider transition-all disabled:opacity-60',
                variant === 'light'
                    ? 'bg-white text-[#FF9600] hover:bg-white/95'
                    : 'bg-[#58CC02] text-white border-b-4 border-[#46A302] hover:bg-[#46A302] active:border-b-0 active:translate-y-0.5',
                className
            )}
        >
            <Star className="h-4 w-4 fill-current" />
            {claim.isPending ? 'Claiming…' : `Claim +${amount} stars`}
        </button>
    )
}
