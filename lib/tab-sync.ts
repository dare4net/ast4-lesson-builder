export type TabInteractionMessage = {
    type: 'interaction'
    tabId: string
    userId: string
    lessonId: string
    version: number
    at: number
}

export type Channel = {
    postMessage: (msg: TabInteractionMessage) => void
    addEventListener: (type: 'message', fn: (event: { data: TabInteractionMessage }) => void) => void
    removeEventListener?: (type: 'message', fn: (event: { data: TabInteractionMessage }) => void) => void
    close?: () => void
}

function openDefaultChannel(): Channel | null {
    if (typeof BroadcastChannel === 'undefined') return null
    try {
        return new BroadcastChannel('ast-concurrency')
    } catch {
        return null
    }
}

function interactionKey(userId: string, lessonId: string) {
    return `${userId}:${lessonId}`
}

export function createTabSync(options: {
    channel?: Channel | null
    tabId?: string
    isHidden?: () => boolean
} = {}) {
    const tabId = options.tabId || `tab_${Math.random().toString(36).slice(2, 10)}`
    const isHidden =
        options.isHidden ||
        (() => typeof document !== 'undefined' && Boolean(document.hidden))
    const channel = options.channel === undefined ? openDefaultChannel() : options.channel
    const latest = new Map<string, TabInteractionMessage>()

    const onMessage = (event: { data: TabInteractionMessage }) => {
        const msg = event?.data
        if (!msg || msg.type !== 'interaction' || msg.tabId === tabId) return
        const key = interactionKey(msg.userId, msg.lessonId)
        const prev = latest.get(key)
        if (prev && prev.at > msg.at) return
        latest.set(key, msg)
    }

    channel?.addEventListener('message', onMessage)

    function publishInteraction(userId: string, lessonId: string, version: number) {
        const msg: TabInteractionMessage = {
            type: 'interaction',
            tabId,
            userId,
            lessonId,
            version,
            at: Date.now(),
        }
        latest.set(interactionKey(userId, lessonId), msg)
        channel?.postMessage(msg)
    }

    function noteRemote(userId: string, lessonId: string, version: number) {
        const msg: TabInteractionMessage = {
            type: 'interaction',
            tabId: 'server',
            userId,
            lessonId,
            version,
            at: Date.now(),
        }
        latest.set(interactionKey(userId, lessonId), msg)
    }

    function shouldSuppressWrite(userId: string, lessonId: string) {
        if (!isHidden()) return false
        const rec = latest.get(interactionKey(userId, lessonId))
        if (!rec || rec.tabId === tabId) return false
        return true
    }

    function close() {
        channel?.removeEventListener?.('message', onMessage)
        channel?.close?.()
    }

    return {
        tabId,
        publishInteraction,
        noteRemote,
        shouldSuppressWrite,
        close,
    }
}

export const tabSync = createTabSync()
