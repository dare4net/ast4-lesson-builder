import {
    MasterValidationReport,
    SlideValidationResult,
    ComponentValidationResult,
    ValidationError,
    ValidationWarning
} from './types';
import { validateSingleComponent } from './registry';

// Memory cache for component validation results by hash
const componentHashCache = new Map<string, ComponentValidationResult>();

function hashComponent(component: any): string {
    try {
        return `${component.id}:${JSON.stringify(component)}`;
    } catch (e) {
        return `${component?.id || 'err'}:${Date.now()}`;
    }
}

export function clearValidationCache() {
    componentHashCache.clear();
}

export function validateLesson(
    lesson: any,
    options?: { forceRevalidate?: boolean }
): MasterValidationReport {
    const report: MasterValidationReport = {
        lessonId: lesson?.id || 'unknown',
        isValid: true,
        totalErrors: 0,
        totalWarnings: 0,
        errors: [],
        warnings: [],
        slideResults: {},
        componentResults: {}
    };

    if (!lesson || typeof lesson !== 'object') {
        report.isValid = false;
        report.errors.push({
            id: 'err-lesson-null',
            code: 'INVALID_LESSON_OBJECT',
            fieldPath: 'lesson',
            message: 'Lesson structure is null or not a valid object.'
        });
        report.totalErrors = report.errors.length;
        return report;
    }

    // Top-Level Lesson Rules
    if (!lesson.title || typeof lesson.title !== 'string' || lesson.title.trim() === '') {
        report.errors.push({
            id: 'err-lesson-title',
            code: 'MISSING_LESSON_TITLE',
            fieldPath: 'title',
            message: 'Lesson title is missing or empty.'
        });
    }

    if (!Array.isArray(lesson.slides) || lesson.slides.length === 0) {
        report.errors.push({
            id: 'err-lesson-slides',
            code: 'NO_SLIDES',
            fieldPath: 'slides',
            message: 'Lesson must contain at least one slide.'
        });
    } else {
        lesson.slides.forEach((slide: any, sIdx: number) => {
            const slideId = slide.id || `slide-${sIdx}`;
            const slideTitle = slide.title || `Slide ${sIdx + 1}`;

            const slideRes: SlideValidationResult = {
                slideId,
                slideTitle,
                isValid: true,
                errors: [],
                warnings: [],
                componentResults: {}
            };

            if (!slide.title || typeof slide.title !== 'string' || slide.title.trim() === '') {
                const err: ValidationError = {
                    id: `err-slide-title-${sIdx}`,
                    code: 'MISSING_SLIDE_TITLE',
                    fieldPath: `slides[${sIdx}].title`,
                    message: `Slide ${sIdx + 1} is missing a title.`
                };
                slideRes.errors.push(err);
                report.errors.push(err);
            }

            if (!Array.isArray(slide.components) || slide.components.length === 0) {
                const warn: ValidationWarning = {
                    id: `warn-slide-components-${sIdx}`,
                    code: 'EMPTY_SLIDE',
                    fieldPath: `slides[${sIdx}].components`,
                    message: `Slide ${sIdx + 1} ("${slideTitle}") has no components.`
                };
                slideRes.warnings.push(warn);
                report.warnings.push(warn);
            } else {
                slide.components.forEach((comp: any, cIdx: number) => {
                    const compId = comp.id || `comp-${sIdx}-${cIdx}`;

                    let compRes: ComponentValidationResult;
                    const hash = hashComponent(comp);

                    if (!options?.forceRevalidate && componentHashCache.has(hash)) {
                        compRes = componentHashCache.get(hash)!;
                    } else {
                        compRes = validateSingleComponent(comp);
                        componentHashCache.set(hash, compRes);
                    }

                    slideRes.componentResults[compId] = compRes;
                    report.componentResults[compId] = compRes;

                    if (!compRes.isValid) {
                        slideRes.isValid = false;
                        slideRes.errors.push(...compRes.errors);
                        report.errors.push(...compRes.errors);
                    }
                    if (compRes.warnings.length > 0) {
                        slideRes.warnings.push(...compRes.warnings);
                        report.warnings.push(...compRes.warnings);
                    }
                });
            }

            if (slideRes.errors.length > 0) {
                slideRes.isValid = false;
            }
            report.slideResults[slideId] = slideRes;
        });
    }

    report.totalErrors = report.errors.length;
    report.totalWarnings = report.warnings.length;
    report.isValid = report.totalErrors === 0;

    return report;
}
