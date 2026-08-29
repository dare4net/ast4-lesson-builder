/**
 * AppEventBus
 *
 * Typed singleton event bus for the AST gamification system.
 * All gamification engines (star wallet, attempts, missions, achievements)
 * subscribe to events emitted by component renderers, the lesson viewer,
 * the audio player, and other system actors.
 *
 * Usage:
 *   import { appEventBus } from '@/lib/event-bus'
 *   appEventBus.emit('COMPONENT_SUBMITTED', { ... })
 *   appEventBus.on('COMPONENT_SUBMITTED', (payload) => { ... })
 *   appEventBus.off('COMPONENT_SUBMITTED', handler)
 */

// ─── Event Payload Types ─────────────────────────────────────────────────────

export interface ComponentSubmittedPayload {
    componentId: string
    /** Component type key e.g. 'quiz', 'memoryGrid', 'wordScramble' */
    type: string
    mode: 'practice' | 'live'
    /** Points earned on this submission */
    score: number
    /** Maximum possible points for this component */
    maxScore: number
    /** Percentage accuracy 0-100 */
    percentage: number
    /**
     * Number of submit/check attempts made to achieve 100% completion.
     * Sealed on first completion and never retroactively mutated by retries.
     */
    attemptCount: number
    /** Elapsed time in milliseconds from component mount to submission */
    completionTimeMs: number
    /**
     * True only on the very first time the component reaches `completed` state.
     * Used by leaderboards, achievements, and missions. Retries produce false.
     */
    isFirstAttempt: boolean
    lessonId?: string
    programId?: string
}

export interface ComponentResetPayload {
    componentId: string
    type: string
    lessonId?: string
}

export interface LiveTimeoutPayload {
    componentId: string
    type: string
}

export interface LiveEarlyFinishPayload {
    componentId: string
    type: string
    completionTimeMs: number
    timeLimitMs: number
}

export interface AudioReplayedPayload {
    componentId: string
}

export interface LessonCompletedPayload {
    lessonId: string
    programId?: string
    score: number
    maxScore: number
    percentage: number
}

export interface LessonReviewedPayload {
    lessonId: string
}

export interface ProgramEnrolledPayload {
    programId: string
}

export interface StarsSpentPayload {
    amount: number
    itemType: string
}

export interface ComponentCorrectStreakPayload {
    /** Number of consecutive correct first-attempt completions */
    count: number
}

export interface AchievementEarnedPayload {
    id: string
    title: string
    rewardStars?: number
}

export interface MissionClaimedPayload {
    id: string
    title: string
    rewardStars?: number
}

export interface LevelUpPayload {
    level: number
}

export interface CrownGoldPayload {
    statKey: string
    label: string
    value: number
}

export interface InboxNoticePayload {
    title: string
    body: string
}

// ─── Event Map ───────────────────────────────────────────────────────────────

export interface SystemEventMap {
    /** Emitted every time a student submits/checks a gamified component */
    COMPONENT_SUBMITTED: ComponentSubmittedPayload
    /** Emitted when a student uses the Reset button after completing a component */
    COMPONENT_RESET: ComponentResetPayload
    /** Emitted when a live-mode timer expires before submission */
    LIVE_TIMEOUT: LiveTimeoutPayload
    /** Emitted when a live-mode component is completed before the timer runs out */
    LIVE_EARLY_FINISH: LiveEarlyFinishPayload
    /** Emitted when a student replays audio on a component */
    AUDIO_REPLAYED: AudioReplayedPayload
    /** Emitted when all slides in a lesson are completed */
    LESSON_COMPLETED: LessonCompletedPayload
    /** Emitted when a student opens a previously completed lesson to review it */
    LESSON_REVIEWED: LessonReviewedPayload
    /** Emitted when a student enrolls in a program */
    PROGRAM_ENROLLED: ProgramEnrolledPayload
    /** Emitted when a student spends stars in the reward shop */
    STARS_SPENT: StarsSpentPayload
    /** Emitted when a student completes N components correctly in a row without retry */
    COMPONENT_CORRECT_STREAK: ComponentCorrectStreakPayload
    /** Emitted after POST /achievements/evaluate returns a newly earned badge */
    ACHIEVEMENT_EARNED: AchievementEarnedPayload
    /** Emitted after a mission claim succeeds */
    MISSION_CLAIMED: MissionClaimedPayload
    /** Emitted after a student levels up */
    LEVEL_UP: LevelUpPayload
    CROWN_GOLD: CrownGoldPayload
    /** Inbox garnish for mail from someone else (follows, crowns, curriculum drops) */
    INBOX_NOTICE: InboxNoticePayload
}

export type SystemEventName = keyof SystemEventMap

type Listener<K extends SystemEventName> = (payload: SystemEventMap[K]) => void

// ─── EventBus Class ──────────────────────────────────────────────────────────

export class EventBus {
    private listeners: {
        [K in SystemEventName]?: Set<Listener<K>>
    } = {}

    /**
     * Subscribe to an event.
     * Returns an unsubscribe function for easy cleanup.
     */
    on<K extends SystemEventName>(event: K, listener: Listener<K>): () => void {
        if (!this.listeners[event]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.listeners[event] = new Set<any>()
        }
        ; (this.listeners[event] as Set<Listener<K>>).add(listener)
        return () => this.off(event, listener)
    }

    /** Unsubscribe a specific listener from an event */
    off<K extends SystemEventName>(event: K, listener: Listener<K>): void {
        ; (this.listeners[event] as Set<Listener<K>> | undefined)?.delete(listener)
    }

    /** Emit an event to all subscribed listeners */
    emit<K extends SystemEventName>(event: K, payload: SystemEventMap[K]): void {
        ; (this.listeners[event] as Set<Listener<K>> | undefined)?.forEach(listener => {
            try {
                listener(payload)
            } catch (err) {
                console.error(`[AppEventBus] Error in listener for "${event}":`, err)
            }
        })
    }

    /** Remove all listeners for a specific event (useful for test teardown) */
    clear<K extends SystemEventName>(event: K): void {
        delete this.listeners[event]
    }

    /** Remove ALL listeners for ALL events */
    clearAll(): void {
        this.listeners = {}
    }

    /** Returns the number of active listeners for a given event (useful for tests) */
    listenerCount<K extends SystemEventName>(event: K): number {
        return this.listeners[event]?.size ?? 0
    }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

/**
 * The single global event bus instance shared across the entire app.
 * Import this wherever you need to emit or listen for system events.
 */
export const appEventBus = new EventBus()
