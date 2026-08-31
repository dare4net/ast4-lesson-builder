'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { BLOCK_RESET_COST } from '@/lib/store-skus'
import { resetStarAwardDedupe } from '@/lib/achievement-listener'

export function LiveBlockResetBar({
    lessonId,
    componentId,
    isLive,
    done,
    onWiped,
}: {
    lessonId?: string | null
    componentId?: string
    isLive: boolean
    done: boolean
    onWiped: () => void
}) {
    const queryClient = useQueryClient()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const store = useQuery({
        queryKey: queryKeys.store,
        queryFn: () => apiClient.store.get(),
        staleTime: 15_000,
        enabled: isLive && done,
    })

    if (!isLive || !done || !lessonId || !componentId) return null

    const charges = Number(store.data?.inventory?.items?.live_block_reset?.charges) || 0

    return (
        <div className="shrink-0 px-3 sm:px-6 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#FF4B4B]/30 bg-[#FF4B4B]/5 px-3 py-2">
                <p className="text-[11px] font-bold text-slate-600">
                    Wipe this live block and try again. Uses a reset charge or {BLOCK_RESET_COST} stars.
                </p>
                <Button
                    type="button"
                    variant="duo"
                    disabled={busy}
                    onClick={async () => {
                        setBusy(true)
                        setError('')
                        try {
                            const result = await apiClient.store.resetBlock({ lessonId, componentId })
                            resetStarAwardDedupe()
                            void queryClient.invalidateQueries({ queryKey: queryKeys.store })
                            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
                            if (typeof result.starBalance === 'number') {
                                queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                                    ...(prev || {}),
                                    starBalance: result.starBalance,
                                }))
                            }
                            onWiped()
                        } catch (err: any) {
                            setError(err?.response?.data?.error || 'Could not reset that block.')
                        } finally {
                            setBusy(false)
                        }
                    }}
                    className="h-9 px-3 text-[11px] bg-[#FF4B4B] hover:bg-red-600 border-[#FF4B4B] border-b-[#c43c3c] text-white"
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    {charges > 0 ? 'Reset block' : `Reset · ${BLOCK_RESET_COST}★`}
                </Button>
            </div>
            {error ? <p className="text-[11px] font-bold text-red-600 mt-1">{error}</p> : null}
        </div>
    )
}
