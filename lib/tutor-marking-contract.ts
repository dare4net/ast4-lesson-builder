/**
 * Standardized Tutor Marking Contract & Helper Utilities
 * 
 * Every submittable component (FillInTheBlank, ShortAnswer, Categorise, Matching, etc.)
 * uses these uniform contracts and rules.
 */

export type MarkingMode = 'self-mark' | 'tutor-mark';

export interface StandardComponentState {
    userAnswers?: Record<string, any>;
    userResponse?: string;
    isSubmitted: boolean;
    isPendingMarking?: boolean;
    tutorMarked?: boolean;
    isApproved?: boolean;
    score?: number;
    wasReset?: boolean;
    status?: string;
    markedBy?: string;
    markedAt?: string | Date;
}

export interface ComponentContractContext {
    markingMode?: MarkingMode;
    mode?: 'practice' | 'live';
    isTutorView?: boolean;
    disabledProp?: boolean;
}

/**
 * Standard Rule: Determines if input controls (textboxes, option buttons, etc.)
 * should be locked against user input.
 * 
 * Inputs are locked if:
 * 1. The component is rendered in Tutor View (read-only for tutor)
 * 2. The student has already submitted their response
 * 3. The component has a explicit disabled prop passed to it
 */
export function isInputDisabled(
    state: Partial<StandardComponentState>,
    context: ComponentContractContext
): boolean {
    if (context.isTutorView) return true;
    if (context.disabledProp) return true;
    if (state.isSubmitted && !state.wasReset) return true;
    return false;
}

/**
 * Standard Rule: Determines if the "Retry" / "Try Again" button should be rendered.
 * 
 * Retry is ALLOWED ONLY if ALL of the following are true:
 * 1. Not in Live mode (Live mode is strictly single-attempt)
 * 2. Not in Tutor-Mark mode (Tutor evaluation is final; retry only occurs if tutor clicks Reset)
 * 3. Not currently pending tutor review
 * 4. Component was submitted but score is less than total possible (not 100% correct / not approved)
 */
export function shouldShowRetry(
    state: Partial<StandardComponentState>,
    context: ComponentContractContext,
    totalPossible: number
): boolean {
    // 1. Live mode -> No Retry
    if (context.mode === 'live') return false;

    // 2. Tutor-marked mode -> No self-retry (Tutor must click Reset)
    const isTutorMode = context.markingMode === 'tutor-mark' || Boolean(state.tutorMarked);
    if (isTutorMode) return false;

    // 3. Pending marking -> No Retry
    if (state.isPendingMarking && !state.tutorMarked) return false;

    // 4. Must be submitted and not fully scored/approved
    if (!state.isSubmitted || state.wasReset) return false;

    // 5. Approved or perfect score -> No Retry
    if (state.isApproved) return false;
    const currentScore = state.score || 0;
    if (currentScore >= totalPossible && totalPossible > 0) return false;

    return true;
}

/**
 * Standard Rule: Determines correctness for feedback styling (Emerald vs Rose).
 * 
 * 1. If tutor evaluated the component, tutor's isApproved decision is absolute truth.
 * 2. Otherwise, falls back to the automated string/option match result.
 */
export function isItemApproved(
    state: Partial<StandardComponentState>,
    autoGradedCorrect: boolean
): boolean {
    if (state.tutorMarked) {
        return Boolean(state.isApproved);
    }
    return autoGradedCorrect;
}
