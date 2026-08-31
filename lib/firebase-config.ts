/** Trim env strings. Use static process.env.NEXT_PUBLIC_* keys so Next.js inlines them on the client. */
function trim(value: string | undefined) {
    if (value == null) return undefined
    const trimmed = value.trim()
    return trimmed || undefined
}

export type FirebaseWebConfig = {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
}

export function readFirebaseWebConfig(): FirebaseWebConfig | null {
    const apiKey = trim(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    const projectId = trim(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    const messagingSenderId = trim(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
    const appId = trim(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
    if (!apiKey || !projectId || !messagingSenderId || !appId) return null

    const authDomain =
        trim(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || `${projectId}.firebaseapp.com`
    const storageBucket =
        trim(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || `${projectId}.appspot.com`

    return {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
    }
}

export function readFirebaseVapidKey() {
    return trim(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) || ''
}

export function isFirebaseWebConfigured() {
    return Boolean(readFirebaseWebConfig() && readFirebaseVapidKey())
}

/** Firebase compat CDN version — keep in sync with package.json "firebase". */
export const FIREBASE_SW_CDN_VERSION = '12.18.0'
