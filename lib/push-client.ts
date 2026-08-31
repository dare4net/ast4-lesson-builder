'use client'

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, isSupported, type Messaging } from 'firebase/messaging'
import { apiClient } from '@/lib/api-client'
import {
    isFirebaseWebConfigured,
    readFirebaseVapidKey,
    readFirebaseWebConfig,
} from '@/lib/firebase-config'
import {
    isPushOptedOut,
    setPushOptedOut,
    setStoredFcmToken,
    getStoredFcmToken,
} from '@/lib/push-preferences'

export function isPushClientConfigured() {
    return isFirebaseWebConfigured()
}

export type PushStatus = 'unsupported' | 'unconfigured' | 'denied' | 'default' | 'enabled' | 'disabled'

export class PushConfigError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PushConfigError'
    }
}

let app: FirebaseApp | null = null
let messaging: Messaging | null = null

function getApp() {
    const config = readFirebaseWebConfig()
    if (!config) return null
    if (!app) {
        app = getApps()[0] || initializeApp(config)
    }
    return app
}

async function getClientMessaging() {
    if (messaging) return messaging
    const supported = await isSupported()
    if (!supported) return null
    const firebaseApp = getApp()
    if (!firebaseApp) return null
    messaging = getMessaging(firebaseApp)
    return messaging
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
}

export function readPushStatus(userId?: string | null): PushStatus {
    if (!isPushClientConfigured()) return 'unconfigured'
    const permission = getBrowserNotificationPermission()
    if (permission === 'unsupported') return 'unsupported'
    if (permission === 'denied') return 'denied'
    if (userId && isPushOptedOut(userId)) return 'disabled'
    if (permission === 'granted') return 'enabled'
    return 'default'
}

/** PWA worker at /sw.js (FCM handlers are importScripted into the same file). */
async function pwaServiceWorkerRegistration() {
    if (!('serviceWorker' in navigator)) return null
    const scoped = await navigator.serviceWorker.getRegistration('/')
    if (scoped?.active) return scoped
    try {
        return await navigator.serviceWorker.ready
    } catch {
        return null
    }
}

type RegisterOptions = {
    requestPermission?: boolean
    userId?: string | null
}

export async function registerPushToken(options: RegisterOptions = {}) {
    const { requestPermission = false, userId = null } = options
    if (typeof window === 'undefined' || !isPushClientConfigured()) return null
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null
    if (userId && isPushOptedOut(userId)) return null

    const client = await getClientMessaging()
    if (!client) return null

    let permission = Notification.permission
    if (permission === 'default' && requestPermission) {
        permission = await Notification.requestPermission()
    }
    if (permission !== 'granted') return null

    const registration = await pwaServiceWorkerRegistration()
    if (!registration) return null

    let token: string | null
    try {
        token = await getToken(client, {
            vapidKey: readFirebaseVapidKey(),
            serviceWorkerRegistration: registration,
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (/api key not valid/i.test(message)) {
            throw new PushConfigError(
                'Firebase rejected the API key. Copy the web app config from Firebase Console → Project settings, and allow localhost in Google Cloud → Credentials → API key restrictions.',
            )
        }
        throw err
    }
    if (!token) return null

    await apiClient.push.register(token)
    if (userId) {
        setStoredFcmToken(userId, token)
        setPushOptedOut(userId, false)
    }
    return token
}

export async function enablePushNotifications(userId: string) {
    if (!isPushClientConfigured()) {
        return { ok: false as const, reason: 'unconfigured' as const }
    }
    const permission = getBrowserNotificationPermission()
    if (permission === 'unsupported') {
        return { ok: false as const, reason: 'unsupported' as const }
    }
    if (permission === 'denied') {
        return { ok: false as const, reason: 'denied' as const }
    }
    setPushOptedOut(userId, false)
    try {
        const token = await registerPushToken({ requestPermission: true, userId })
        if (!token) {
            const after = getBrowserNotificationPermission()
            if (after === 'denied') return { ok: false as const, reason: 'denied' as const }
            return { ok: false as const, reason: 'failed' as const }
        }
        return { ok: true as const, token }
    } catch (err) {
        if (err instanceof PushConfigError) {
            return { ok: false as const, reason: 'config' as const, message: err.message }
        }
        throw err
    }
}

export async function disablePushNotifications(userId: string) {
    const token = getStoredFcmToken(userId)
    if (token) {
        try {
            await apiClient.push.unregister(token)
        } catch {
            /* token may already be gone server-side */
        }
    }
    setStoredFcmToken(userId, null)
    setPushOptedOut(userId, true)
}

export async function syncPushTokenIfEnabled(userId: string) {
    if (isPushOptedOut(userId)) return null
    if (getBrowserNotificationPermission() !== 'granted') return null
    return registerPushToken({ requestPermission: false, userId })
}
