'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { PushPermissionCard } from '@/components/notifications/push-permission-card'
import {
    enablePushNotifications,
    getBrowserNotificationPermission,
    isPushClientConfigured,
    readPushStatus,
} from '@/lib/push-client'
import { markPushNudgeDismissed, shouldShowPushNudge } from '@/lib/push-preferences'
import { resolveAccentColor } from '@/lib/pride-format'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export function PushPermissionNudge() {
    const { user } = useAuth()
    const reduceMotion = useReducedMotion()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const userId = user?.user_id
    const role = user?.role === 'tutor' ? 'tutor' : 'student'
    const accent = resolveAccentColor(user?.handle, user?.accentColor)
    const permission = getBrowserNotificationPermission()

    const evaluate = useCallback(() => {
        if (!userId || !isPushClientConfigured()) {
            setOpen(false)
            return
        }
        const status = readPushStatus(userId)
        if (status === 'enabled' || status === 'unconfigured' || status === 'unsupported') {
            setOpen(false)
            return
        }
        if (status === 'disabled') {
            setOpen(false)
            return
        }
        setOpen(shouldShowPushNudge(userId, permission))
    }, [userId, permission])

    useEffect(() => {
        const timer = window.setTimeout(evaluate, 2400)
        return () => window.clearTimeout(timer)
    }, [evaluate])

    const dismiss = () => {
        if (userId) markPushNudgeDismissed(userId)
        setOpen(false)
    }

    const enable = async () => {
        if (!userId) return
        setLoading(true)
        setError(null)
        try {
            const result = await enablePushNotifications(userId)
            if (result.ok) {
                setOpen(false)
                return
            }
            if (result.reason === 'denied') {
                markPushNudgeDismissed(userId)
                evaluate()
                return
            }
            if (result.reason === 'config') {
                setError(result.message)
                return
            }
            setError('Could not enable notifications. Try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    className="fixed inset-x-0 bottom-20 md:bottom-6 z-50 px-4 pointer-events-none"
                >
                    <div className="max-w-lg mx-auto pointer-events-auto relative">
                        <button
                            type="button"
                            onClick={dismiss}
                            className="absolute -top-2 -right-2 z-10 h-9 w-9 rounded-full bg-white border-2 border-slate-200 text-slate-500 shadow-md flex items-center justify-center"
                            aria-label="Dismiss notification prompt"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <PushPermissionCard
                            accent={accent}
                            variant="nudge"
                            permission={permission === 'unsupported' ? 'unsupported' : permission}
                            loading={loading}
                            role={role}
                            onEnable={() => void enable()}
                            onDismiss={dismiss}
                        />
                        {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
