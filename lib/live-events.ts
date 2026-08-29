import { appEventBus } from '@/lib/event-bus'

export type LiveTimerEvent =
    | { type: 'LIVE_TIMEOUT' }
    | { type: 'LIVE_EARLY_FINISH'; completionTimeMs: number; timeLimitMs: number }

/**
 * Decide whether a LiveTimer tick should emit timeout or early-finish.
 * Restored/already-completed timers must not emit (wasIncompleteAtStart = false).
 */
export function resolveLiveTimerEvent({
    alreadyEmitted,
    wasIncompleteAtStart,
    isCompleted,
    secondsRemaining,
    durationSeconds,
}: {
    alreadyEmitted: boolean
    wasIncompleteAtStart: boolean
    isCompleted: boolean
    secondsRemaining: number
    durationSeconds: number
}): LiveTimerEvent | null {
    if (alreadyEmitted || !wasIncompleteAtStart) return null

    if (secondsRemaining <= 0 && !isCompleted) {
        return { type: 'LIVE_TIMEOUT' }
    }

    if (isCompleted && secondsRemaining > 0) {
        const timeLimitMs = Math.max(0, durationSeconds) * 1000
        const completionTimeMs = Math.max(0, durationSeconds - secondsRemaining) * 1000
        return { type: 'LIVE_EARLY_FINISH', completionTimeMs, timeLimitMs }
    }

    return null
}

export function emitLiveTimerEvent(
    event: LiveTimerEvent,
    meta: { componentId: string; type: string },
) {
    if (event.type === 'LIVE_TIMEOUT') {
        appEventBus.emit('LIVE_TIMEOUT', {
            componentId: meta.componentId,
            type: meta.type,
        })
        return
    }

    appEventBus.emit('LIVE_EARLY_FINISH', {
        componentId: meta.componentId,
        type: meta.type,
        completionTimeMs: event.completionTimeMs,
        timeLimitMs: event.timeLimitMs,
    })
}
