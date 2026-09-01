'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { orgCanUse } from '@/lib/org-branding'
import {
    clubSplashStorageKey,
    hasSeenClubSplash,
    markClubSplashSeen,
} from '@/lib/club-welcome-storage'

type ClubSplashOverlayProps = {
    userId?: string | null
    orgId?: string | null
    orgName?: string
    logoUrl?: string | null
    accentColor: string
    brandingTier?: 'standard' | 'branded' | 'white_label'
    enabled?: boolean
    onFinished?: () => void
}

export function ClubSplashOverlay({
    userId,
    orgId,
    orgName,
    logoUrl,
    accentColor,
    brandingTier,
    enabled = true,
    onFinished,
}: ClubSplashOverlayProps) {
    const reduceMotion = useReducedMotion()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!enabled || !userId || !orgId) {
            onFinished?.()
            return
        }
        if (!orgCanUse(brandingTier, 'splash')) {
            onFinished?.()
            return
        }
        if (hasSeenClubSplash(userId, orgId)) {
            onFinished?.()
            return
        }
        setOpen(true)
        markClubSplashSeen(userId, orgId)

        const duration = reduceMotion ? 400 : 1800
        const timer = window.setTimeout(() => {
            setOpen(false)
            onFinished?.()
        }, duration)
        return () => window.clearTimeout(timer)
    }, [enabled, userId, orgId, brandingTier, reduceMotion, onFinished])

    const dismiss = () => {
        setOpen(false)
        onFinished?.()
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.button
                    type="button"
                    aria-label={`Welcome to ${orgName || 'your club'}`}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0.15 : 0.45 }}
                    onClick={dismiss}
                    className="fixed inset-0 z-[80] flex items-center justify-center border-0 p-0 cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                >
                    <motion.div
                        initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: reduceMotion ? 0 : 0.55, ease: 'easeOut' }}
                        className="flex flex-col items-center gap-4 text-white px-6"
                    >
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt=""
                                className="w-24 h-24 rounded-3xl object-cover border-4 border-white/30 shadow-xl"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center border-4 border-white/30">
                                <Building2 className="w-10 h-10" />
                            </div>
                        )}
                        <p className="text-lg font-black tracking-tight text-center">{orgName}</p>
                        {!reduceMotion && (
                            <p className="text-xs font-bold text-white/80">Tap to continue</p>
                        )}
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    )
}

export { clubSplashStorageKey }
