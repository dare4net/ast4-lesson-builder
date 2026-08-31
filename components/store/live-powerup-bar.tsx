'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Pause, RefreshCw, Shield, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { useLivePowerups } from '@/context/live-powerups-context'
import { cn } from '@/lib/utils'

const LIVE_SKUS = [
    { sku: 'live_time', label: 'Time', icon: Clock, color: 'text-[#58CC02]' },
    { sku: 'live_freeze', label: 'Freeze', icon: Pause, color: 'text-[#1CB0F6]' },
    { sku: 'second_chance', label: 'Wind', icon: RefreshCw, color: 'text-[#FF9600]' },
    { sku: 'star_surge', label: 'Surge', icon: Sparkles, color: 'text-[#CE82FF]' },
    { sku: 'focus_shield', label: 'Shield', icon: Shield, color: 'text-[#FF4B4B]' },
] as const

export function LivePowerupBar({ visible }: { visible: boolean }) {
    const powerups = useLivePowerups()
    const queryClient = useQueryClient()
    const { data } = useQuery({
        queryKey: queryKeys.store,
        queryFn: () => apiClient.store.get(),
        enabled: visible,
        staleTime: 10_000,
    })

    if (!visible || !powerups) return null

    const owned = LIVE_SKUS.filter((item) => (Number(data?.inventory?.items?.[item.sku]?.charges) || 0) > 0)
    if (owned.length === 0) return null

    return (
        <div className="inline-flex items-center gap-1">
            {owned.map((item) => {
                const charges = Number(data?.inventory?.items?.[item.sku]?.charges) || 0
                const Icon = item.icon
                return (
                    <button
                        key={item.sku}
                        type="button"
                        aria-label={`Use ${item.label}`}
                        onClick={() => void powerups.activate(item.sku).then(() => queryClient.invalidateQueries({ queryKey: queryKeys.store }))}
                        className={cn(
                            'h-9 min-w-9 px-1.5 rounded-xl border-2 border-b-4 border-slate-200 bg-white text-slate-700',
                            'inline-flex items-center justify-center gap-1 text-[10px] font-black uppercase',
                            'active:border-b-0 active:translate-y-[2px]'
                        )}
                    >
                        <Icon className={cn('w-4 h-4', item.color)} />
                        <span className="tabular-nums">{charges}</span>
                        <span className="hidden lg:inline">{item.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
