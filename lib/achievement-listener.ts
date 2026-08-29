import { appEventBus } from './event-bus'
import { apiClient } from './api-client'
import { calculateStarReward } from './star-engine'
import type {
    ComponentSubmittedPayload,
    LiveEarlyFinishPayload,
    LiveTimeoutPayload,
} from './event-bus'

const awardedComponentIds = new Set<string>()
const walletBalanceListeners = new Set<(balance: number) => void>()

/** Test-only: clear per-component award dedupe. */
export function resetStarAwardDedupe() {
    awardedComponentIds.clear()
}

/** Provider (C3) subscribes so the header updates after a wallet credit. */
export function onWalletStarBalance(listener: (balance: number) => void) {
    walletBalanceListeners.add(listener)
    return () => {
        walletBalanceListeners.delete(listener)
    }
}

function notifyWalletBalance(balance: number) {
    walletBalanceListeners.forEach((listener) => listener(balance))
}

function rememberComponent(componentId: string): boolean {
    if (!componentId || awardedComponentIds.has(componentId)) return false
    awardedComponentIds.add(componentId)
    return true
}

async function creditWalletStars(amount: number, reason: string, componentId?: string) {
    if (typeof amount !== 'number' || amount <= 0) return
    try {
        const result = await apiClient.gamification.awardStars(amount, reason, componentId)
        if (typeof result?.starBalance === 'number') {
            notifyWalletBalance(result.starBalance)
        }
    } catch (err) {
        if (componentId) awardedComponentIds.delete(componentId)
        console.warn('[AchievementListener] Failed to credit wallet stars:', err)
    }
}

function evaluateAchievements(eventType: string, payload: Record<string, unknown>) {
    void apiClient.gamification.evaluateAchievements(eventType, payload)
        .then((result) => {
            const earned = Array.isArray(result?.newlyEarned) ? result.newlyEarned : []
            for (const ach of earned) {
                appEventBus.emit('ACHIEVEMENT_EARNED', {
                    id: String(ach.achievement_id || ach.id || ''),
                    title: String(ach.title || 'Achievement unlocked'),
                    rewardStars: Number(ach.rewardStars) || 0,
                })
            }
        })
        .catch((err) => {
            console.warn('[AchievementListener] Failed to evaluate achievements:', err)
        })
}

function persistProgressEvent(eventType: string, payload?: {
    isFirstAttempt?: boolean
    percentage?: number
    mode?: 'live' | 'practice'
    type?: string
    amount?: number
    lessonId?: string
    programId?: string
}) {
    void apiClient.gamification.recordProgressEvent(eventType, payload).catch((err) => {
        console.warn('[AchievementListener] Failed to record progress event:', err)
    })
}

function awardFromSubmitted(payload: ComponentSubmittedPayload) {
    persistProgressEvent('COMPONENT_SUBMITTED', {
        isFirstAttempt: payload.isFirstAttempt,
        percentage: payload.percentage,
        mode: payload.mode,
        type: payload.type,
    })
    evaluateAchievements('COMPONENT_SUBMITTED', { ...payload })
    const stars = calculateStarReward({
        mode: payload.mode,
        percentage: payload.percentage,
        completionTimeMs: payload.completionTimeMs,
        timeLimitMs: null,
    }).totalStars
    if (stars <= 0) return
    if (!rememberComponent(payload.componentId)) return
    void creditWalletStars(stars, `Live completion: ${payload.type}`, payload.componentId)
}

function awardFromEarlyFinish(payload: LiveEarlyFinishPayload) {
    evaluateAchievements('LIVE_EARLY_FINISH', { ...payload })
    if (!rememberComponent(payload.componentId)) return
    const stars = calculateStarReward({
        mode: 'live',
        percentage: 100,
        completionTimeMs: payload.completionTimeMs,
        timeLimitMs: payload.timeLimitMs,
    }).totalStars
    if (stars <= 0) {
        awardedComponentIds.delete(payload.componentId)
        return
    }
    void creditWalletStars(stars, `Live early finish: ${payload.type}`, payload.componentId)
}

function awardFromTimeout(payload: LiveTimeoutPayload) {
    if (!rememberComponent(payload.componentId)) return
    const stars = calculateStarReward({
        mode: 'live',
        percentage: 0,
        isTimeout: true,
    }).totalStars
    if (stars <= 0) return
    void creditWalletStars(stars, `Live timeout: ${payload.type}`, payload.componentId)
}

/**
 * Initialize Achievement Listener
 * Subscribes to system events, credits stars via POST /wallet/award,
 * and evaluates achievements via POST /achievements/evaluate.
 */
export function initAchievementListener(userId: string) {
    if (!userId) return () => { }

    const unsubSubmitted = appEventBus.on('COMPONENT_SUBMITTED', awardFromSubmitted)
    const unsubReset = appEventBus.on('COMPONENT_RESET', (payload) => {
        persistProgressEvent('COMPONENT_RESET', { type: payload.type })
        evaluateAchievements('COMPONENT_RESET', { ...payload })
    })
    const unsubEnrolled = appEventBus.on('PROGRAM_ENROLLED', (payload) => {
        persistProgressEvent('PROGRAM_ENROLLED', { programId: payload.programId })
        evaluateAchievements('PROGRAM_ENROLLED', { ...payload })
    })
    const unsubLessonCompleted = appEventBus.on('LESSON_COMPLETED', (payload) => {
        persistProgressEvent('LESSON_COMPLETED', {
            lessonId: payload.lessonId,
            programId: payload.programId,
            percentage: payload.percentage,
        })
        evaluateAchievements('LESSON_COMPLETED', { ...payload })
    })
    const unsubLessonReviewed = appEventBus.on('LESSON_REVIEWED', (payload) => {
        persistProgressEvent('LESSON_REVIEWED', { lessonId: payload.lessonId })
        evaluateAchievements('LESSON_REVIEWED', { ...payload })
    })
    const unsubEarlyFinish = appEventBus.on('LIVE_EARLY_FINISH', awardFromEarlyFinish)
    const unsubTimeout = appEventBus.on('LIVE_TIMEOUT', (payload) => {
        evaluateAchievements('LIVE_TIMEOUT', { ...payload })
        awardFromTimeout(payload)
    })
    const unsubStarsSpent = appEventBus.on('STARS_SPENT', (payload) => {
        evaluateAchievements('STARS_SPENT', { ...payload })
    })

    return () => {
        unsubSubmitted()
        unsubReset()
        unsubEnrolled()
        unsubLessonCompleted()
        unsubLessonReviewed()
        unsubEarlyFinish()
        unsubTimeout()
        unsubStarsSpent()
    }
}
