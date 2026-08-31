'use client'

import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { apiClient } from '@/lib/api-client'
import { SoundEffects } from '@/lib/sound-effects'

type LivePowerupsContextType = {
    extraSeconds: number
    freezeSeconds: number
    secondWind: number
    consumeExtra: () => void
    consumeFreeze: () => void
    consumeSecondWind: () => void
    activate: (sku: string) => Promise<{ effect: number; sku: string } | null>
}

const LivePowerupsContext = createContext<LivePowerupsContextType | undefined>(undefined)

export function LivePowerupsProvider({ children }: { children: ReactNode }) {
    const [extraSeconds, setExtraSeconds] = useState(0)
    const [freezeSeconds, setFreezeSeconds] = useState(0)
    const [secondWind, setSecondWind] = useState(0)

    const activate = useCallback(async (sku: string) => {
        const result = await apiClient.store.activate(sku)
        const effect = Number(result?.effect) || 0
        if (effect > 0 || result) {
            void SoundEffects.play('powerupUsed')
        }
        if (sku === 'live_time') setExtraSeconds((value) => value + effect)
        if (sku === 'live_freeze') setFreezeSeconds((value) => value + effect)
        if (sku === 'second_chance') setSecondWind((value) => value + Math.max(1, effect))
        return result ? { effect, sku } : null
    }, [])

    const value = useMemo<LivePowerupsContextType>(() => ({
        extraSeconds,
        freezeSeconds,
        secondWind,
        consumeExtra: () => setExtraSeconds(0),
        consumeFreeze: () => setFreezeSeconds(0),
        consumeSecondWind: () => setSecondWind((value) => Math.max(0, value - 1)),
        activate,
    }), [extraSeconds, freezeSeconds, secondWind, activate])

    return (
        <LivePowerupsContext.Provider value={value}>
            {children}
        </LivePowerupsContext.Provider>
    )
}

export function useLivePowerups() {
    return useContext(LivePowerupsContext)
}
