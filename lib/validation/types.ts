export interface ValidationError {
    id: string;
    code: string;
    fieldPath: string; // e.g. "props.questions[0].options"
    message: string;   // Clear, human-readable English message
}

export interface ValidationWarning {
    id: string;
    code: string;
    fieldPath: string;
    message: string;   // Clear, human-readable English explanation
    recommendation?: string; // Optional suggested value or tip
}

export interface ComponentValidationResult {
    componentId: string;
    componentType: string;
    isValid: boolean; // true if errors.length === 0
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface SlideValidationResult {
    slideId: string;
    slideTitle: string;
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    componentResults: Record<string, ComponentValidationResult>;
}

export interface MasterValidationReport {
    lessonId: string;
    isValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    slideResults: Record<string, SlideValidationResult>;
    componentResults: Record<string, ComponentValidationResult>;
}

export interface ValidationContext {
    mode?: 'practice' | 'live';
}

export interface ComponentValidator {
    type: string;
    validate: (component: { id: string; type: string; props: any; mode?: string }, context?: ValidationContext) => ComponentValidationResult;
}
