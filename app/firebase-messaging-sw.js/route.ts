import {
    FIREBASE_SW_CDN_VERSION,
    readFirebaseWebConfig,
} from '@/lib/firebase-config'

export const dynamic = 'force-dynamic'

export function GET() {
    const config = readFirebaseWebConfig()
    const body = config
        ? `
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_SW_CDN_VERSION}/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_SW_CDN_VERSION}/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'After-school.tech';
  const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || '';
  const href = (payload.data && payload.data.href) || '/dashboard/student';
  return self.registration.showNotification(title, {
    body,
    data: { href },
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  });
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const href = (event.notification.data && event.notification.data.href) || '/dashboard/student';
  event.waitUntil(self.clients.openWindow(href));
});
`
        : '// Firebase Cloud Messaging is not configured.\n'
    return new Response(body, {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store',
            'Service-Worker-Allowed': '/',
        },
    })
}
