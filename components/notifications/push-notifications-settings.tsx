'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/auth-context'
import { PushPermissionCard } from '@/components/notifications/push-permission-card'
import {
    disablePushNotifications,
    enablePushNotifications,
    getBrowserNotificationPermission,
    isPushClientConfigured,
    readPushStatus,
    type PushStatus,
} from '@/lib/push-client'
import { resolveAccentColor } from '@/lib/pride-format'

const STATUS_COPY: Record<PushStatus, string> = {
    enabled: 'On — reminders can reach this device when the app is closed.',
    disabled: 'Off — you turned reminders off on this device.',
    default: 'Not set — allow notifications to get lesson and streak reminders.',
    denied: 'Blocked by your browser. Allow notifications in site settings, then turn on here.',
    unsupported: 'This browser does not support push notifications.',
    unconfigured: 'Push is not configured on this environment yet.',
}

export function PushNotificationsSettings() {
    const { user } = useAuth()
    const userId = user?.user_id
    const role = user?.role === 'tutor' ? 'tutor' : 'student'
    const accent = resolveAccentColor(user?.handle, user?.accentColor)
    const [status, setStatus] = useState<PushStatus>('unconfigured')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(() => {
        setStatus(readPushStatus(userId))
    }, [userId])

    useEffect(() => {
        refresh()
    }, [refresh])

    const configured = isPushClientConfigured()
    const permission = getBrowserNotificationPermission()
    const canToggle = configured && permission !== 'unsupported' && Boolean(userId)
    const enabled = status === 'enabled'

    const onToggle = async (next: boolean) => {
        if (!userId || !canToggle) return
        setLoading(true)
        setError(null)
        try {
            if (next) {
                const result = await enablePushNotifications(userId)
                if (!result.ok) {
                    if (result.reason === 'denied') {
                        setError('Browser blocked notifications. Allow them in site settings, then try again.')
                    } else if (result.reason === 'unconfigured') {
                        setError('Push is not configured on the server yet.')
                    } else if (result.reason === 'config') {
                        setError(result.message)
                    } else {
                        setError('Could not enable notifications. Try again.')
                    }
                }
            } else {
                await disablePushNotifications(userId)
            }
            refresh()
        } catch {
            setError('Something went wrong. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-[#FF9600]/10 text-[#FF9600] flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-slate-800">Notifications</h3>
                    <p className="text-xs text-slate-500 font-medium">Lesson drops, streaks, and class activity on this device</p>
                </div>
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 shrink-0" />
                ) : (
                    <Switch
                        checked={enabled}
                        disabled={!canToggle || loading}
                        onCheckedChange={(on) => void onToggle(on)}
                        aria-label="Device notifications"
                        className="data-[state=checked]:bg-[#58CC02] shrink-0"
                    />
                )}
            </div>

            <p className="text-xs font-semibold text-slate-500 mb-4">{STATUS_COPY[status]}</p>

            {(status === 'default' || status === 'denied') && configured && (
                <PushPermissionCard
                    accent={accent}
                    variant="settings"
                    permission={permission === 'unsupported' ? 'unsupported' : permission}
                    role={role}
                    loading={loading}
                    onEnable={() => void onToggle(true)}
                />
            )}

            {error && <p className="mt-3 text-xs font-bold text-red-600">{error}</p>}
        </Card>
    )
}
