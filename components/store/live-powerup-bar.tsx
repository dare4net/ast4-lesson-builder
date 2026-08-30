'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Pause, RefreshCw, Shield, Sparkles, Zap } from 'lucide-react'
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

    return (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2 py-1.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-xl">
            <Zap className="w-3.5 h-3.5 text-[#FF9600] ml-1" />
            {LIVE_SKUS.map((item) => {
                const charges = Number(data?.inventory?.items?.[item.sku]?.charges) || 0
                const Icon = item.icon
                return (
                    <button
                        key={item.sku}
                        type="button"
                        disabled={charges < 1}
                        onClick={() => void powerups.activate(item.sku).then(() => queryClient.invalidateQueries({ queryKey: queryKeys.store }))}
                        className={cn(
                            'h-9 px-2 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1',
                            charges > 0
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'text-slate-500 cursor-not-allowed'
                        )}
                    >
                        <Icon className={cn('w-3.5 h-3.5', item.color)} />
                        {item.label}
                        <span className="tabular-nums">{charges}</span>
                    </button>
                )
            })}
        </div>
    )
}
