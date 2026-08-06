import { ComponentValidator, ComponentValidationResult } from './types';
import { createResult, addError } from './components/base-utils';

import {
    headingValidator,
    slideTitleValidator,
    paragraphValidator,
    bulletListValidator,
    tableValidator,
    imageValidator,
    videoValidator,
    codeBlockValidator,
    quoteValidator
} from './components/content';

import {
    quizValidator,
    flashcardsValidator,
    dragDropValidator,
    matchingPairsValidator,
    fillInTheBlankValidator,
    hotspotValidator,
    codeEditorValidator,
    pollValidator,
    flashcardQuizValidator,
    multiSelectQuizValidator
} from './components/interactive';

const registry: Record<string, ComponentValidator> = {
    heading: headingValidator,
    slideTitle: slideTitleValidator,
    paragraph: paragraphValidator,
    bulletList: bulletListValidator,
    table: tableValidator,
    image: imageValidator,
    video: videoValidator,
    codeBlock: codeBlockValidator,
    quote: quoteValidator,
    quiz: quizValidator,
    flashcards: flashcardsValidator,
    dragDrop: dragDropValidator,
    matchingPairs: matchingPairsValidator,
    fillInTheBlank: fillInTheBlankValidator,
    hotspot: hotspotValidator,
    codeEditor: codeEditorValidator,
    poll: pollValidator,
    flashcardQuiz: flashcardQuizValidator,
    multiSelectQuiz: multiSelectQuizValidator
};

export function getComponentValidator(type: string): ComponentValidator | null {
    return registry[type] || null;
}

export function isKnownComponent(type: string): boolean {
    return !!registry[type];
}

export function validateSingleComponent(
    component: { id: string; type: string; props: any; mode?: string },
    context?: { mode?: 'practice' | 'live' }
): ComponentValidationResult {
    if (!component || !component.id || !component.type) {
        const res = createResult(component?.id || 'unknown', component?.type || 'unknown');
        addError(res, 'MALFORMED_COMPONENT', 'component', 'Component object is missing required id or type.');
        return res;
    }

    const validator = getComponentValidator(component.type);
    if (!validator) {
        const res = createResult(component.id, component.type);
        addError(
            res,
            'UNKNOWN_COMPONENT_TYPE',
            'type',
            `Unknown or unsupported component type '${component.type}'. Allowed components: ${Object.keys(registry).join(', ')}.`
        );
        return res;
    }

    return validator.validate(component, context);
}
