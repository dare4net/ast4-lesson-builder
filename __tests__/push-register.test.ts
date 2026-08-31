import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('FCM web push wiring', () => {
    it('asks permission in onboarding and settings instead of on login', () => {
        expect(read('components/push-register.tsx')).toContain('syncPushTokenIfEnabled')
        expect(read('components/push-register.tsx')).not.toContain('requestPermission')
        expect(read('lib/push-client.ts')).toContain('serviceWorkerRegistration')
        expect(read('lib/push-client.ts')).toContain('pwaServiceWorkerRegistration')
        expect(read('lib/push-client.ts')).not.toContain("register('/firebase-messaging-sw.js'")
        expect(read('public/sw.js')).toContain("importScripts('/firebase-messaging-sw.js')")
        expect(read('lib/push-client.ts')).toContain('disablePushNotifications')
        expect(read('components/onboarding/onboarding-flow.tsx')).toContain("'notify'")
        expect(read('components/onboarding/onboarding-flow.tsx')).toContain('PushPermissionCard')
        expect(read('components/notifications/push-permission-nudge.tsx')).toContain('shouldShowPushNudge')
        expect(read('components/notifications/push-notifications-settings.tsx')).toContain('PushNotificationsSettings')
        expect(read('app/dashboard/student/settings/page.tsx')).toContain('PushNotificationsSettings')
        expect(read('app/dashboard/tutor/settings/page.tsx')).toContain('PushNotificationsSettings')
        expect(read('app/dashboard/student/layout.tsx')).toContain('PushPermissionNudge')
        expect(read('lib/api-client.ts')).toContain("this.post('/push/tokens'")
        expect(read('app/firebase-messaging-sw.js/route.ts')).toContain('onBackgroundMessage')
    })

    it('reads Firebase env with static NEXT_PUBLIC keys for client inlining', () => {
        const source = read('lib/firebase-config.ts')
        expect(source).toContain('process.env.NEXT_PUBLIC_FIREBASE_API_KEY')
        expect(source).not.toContain('process.env[name]')
    })
})
