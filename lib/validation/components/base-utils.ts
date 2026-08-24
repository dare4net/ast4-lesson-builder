import { ComponentValidationResult, ValidationError, ValidationWarning } from '../types';
import { calculateRecommendedTimeLimit } from '../time-limit-calculator';

export function createResult(componentId: string, componentType: string): ComponentValidationResult {
    return {
        componentId,
        componentType,
        isValid: true,
        errors: [],
        warnings: []
    };
}

export function addError(
    result: ComponentValidationResult,
    code: string,
    fieldPath: string,
    message: string
) {
    result.errors.push({
        id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code,
        fieldPath,
        message
    });
    result.isValid = false;
}

export function addWarning(
    result: ComponentValidationResult,
    code: string,
    fieldPath: string,
    message: string,
    recommendation?: string
) {
    result.warnings.push({
        id: `warn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code,
        fieldPath,
        message,
        recommendation
    });
}

export function validateTimeLimit(
    result: ComponentValidationResult,
    component: { type: string; props: any; mode?: string }
) {
    const isLive = component.mode === 'live' || component.props?.mode === 'live';
    const timeLimit = component.props?.timeLimit;
    const rec = calculateRecommendedTimeLimit(component.type, component.props);

    if (isLive) {
        if (timeLimit === undefined || timeLimit === null) {
            addWarning(
                result,
                'MISSING_TIME_LIMIT',
                'props.timeLimit',
                `Component is in Live Mode but 'props.timeLimit' is missing. Engine default (10s) will be inadequate.`,
                rec ? `Recommended duration: ${rec.recommendedSeconds}s (${rec.explanation})` : `Specify a dynamic timeLimit.`
            );
            return;
        }

        if (typeof timeLimit === 'number' && timeLimit <= 0) {
            addError(
                result,
                'INVALID_TIME_LIMIT',
                'props.timeLimit',
                'Time limit must be a positive number greater than 0.'
            );
            return;
        }
    }

    if (typeof timeLimit === 'number' && timeLimit > 0) {
        if (timeLimit < 15) {
            addWarning(
                result,
                'TIME_LIMIT_TOO_SHORT',
                'props.timeLimit',
                `Time limit of ${timeLimit}s is below the 15s absolute minimum threshold for cognitive processing.`,
                `Set props.timeLimit to at least 15s.`
            );
        } else if (rec && timeLimit < rec.recommendedSeconds) {
            addWarning(
                result,
                'TIME_LIMIT_TOO_LOW',
                'props.timeLimit',
                `A time limit of ${timeLimit}s may be too fast for student completion.`,
                `Recommended duration: ${rec.recommendedSeconds}s (${rec.explanation})`
            );
        }
    }
}
