/**
 * Star Engine
 *
 * Handles star reward calculations for Live Mode component completions.
 * Calculates base stars from accuracy percentage, speed bonuses for early
 * completion, and penalties for timeouts.
 */

export interface StarCalculationInput {
    /** Mode of the component attempt */
    mode: 'practice' | 'live'
    /** Percentage accuracy achieved (0 - 100) */
    percentage: number
    /** Scoring units (questions, blanks, pairs). Multi-unit live blocks pay 5 stars per unit. */
    units?: number
    /** Total time limit in milliseconds if component has a timer */
    timeLimitMs?: number | null
    /** Actual time taken in milliseconds */
    completionTimeMs?: number | null
    /** Whether the component timed out before completion */
    isTimeout?: boolean
}

export interface StarCalculationResult {
    /** Total stars earned (always 0 in practice mode, non-negative in live mode) */
    totalStars: number
    /** Base stars awarded for score accuracy */
    baseStars: number
    /** Speed bonus stars awarded for fast completion */
    speedBonusStars: number
    /** Penalty stars deducted for timeout (-1 or 0) */
    timeoutPenalty: number
    /** Breakdown reason strings for UI toast feedback */
    breakdown: string[]
}

/**
 * Calculate stars earned for a component submission.
 */
export function calculateStarReward({
    mode,
    percentage,
    units = 1,
    timeLimitMs = null,
    completionTimeMs = null,
    isTimeout = false,
}: StarCalculationInput): StarCalculationResult {
    // Rule 1: Only live mode awards stars. Missing/unknown mode is treated as practice.
    if (mode !== 'live') {
        return {
            totalStars: 0,
            baseStars: 0,
            speedBonusStars: 0,
            timeoutPenalty: 0,
            breakdown: ['Practice mode does not award stars']
        }
    }

    const breakdown: string[] = []
    const unitCount = Math.max(1, Math.round(Number(units) || 1))
    const pct = Math.max(0, Math.min(100, Number(percentage) || 0))

    // Rule 2: Base stars. One-unit blocks keep the 1–5 accuracy table.
    // Multi-unit blocks (quiz questions, FITB blanks, pairs) pay 5 stars per unit, scaled by how many were correct.
    let baseStars = 0
    if (unitCount > 1) {
        baseStars = Math.round((pct / 100) * 5 * unitCount)
        breakdown.push(`${baseStars} Base Stars (${pct}% of ${unitCount} units)`)
    } else if (pct >= 90) {
        baseStars = 5
        breakdown.push(`${baseStars} Base Stars (${pct}% score)`)
    } else if (pct >= 75) {
        baseStars = 4
        breakdown.push(`${baseStars} Base Stars (${pct}% score)`)
    } else if (pct >= 55) {
        baseStars = 3
        breakdown.push(`${baseStars} Base Stars (${pct}% score)`)
    } else if (pct >= 35) {
        baseStars = 2
        breakdown.push(`${baseStars} Base Stars (${pct}% score)`)
    } else if (pct > 0) {
        baseStars = 1
        breakdown.push(`${baseStars} Base Stars (${pct}% score)`)
    } else {
        baseStars = 0
        breakdown.push(`${baseStars} Base Stars (${pct}% score)`)
    }

    // Rule 3: Speed Bonus Stars (Live mode with timer)
    let speedBonusStars = 0
    if (!isTimeout && timeLimitMs && completionTimeMs && timeLimitMs > 0) {
        const timeRatio = completionTimeMs / timeLimitMs
        if (timeRatio < 0.5) {
            speedBonusStars = 2
            breakdown.push('+2 Speed Bonus (Completed in under 50% time!)')
        } else if (timeRatio < 0.75) {
            speedBonusStars = 1
            breakdown.push('+1 Speed Bonus (Completed in under 75% time!)')
        }
    }

    // Rule 4: Timeout Penalty (-1 Star)
    let timeoutPenalty = 0
    if (isTimeout) {
        timeoutPenalty = -1
        breakdown.push('-1 Timeout Penalty')
    }

    // Calculate final star reward with floor at 0
    const rawTotal = baseStars + speedBonusStars + timeoutPenalty
    const totalStars = Math.max(0, rawTotal)

    return {
        totalStars,
        baseStars,
        speedBonusStars,
        timeoutPenalty,
        breakdown
    }
}
