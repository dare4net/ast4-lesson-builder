import { ComponentValidator } from '../types';
import { createResult, addError, addWarning, validateTimeLimit } from './base-utils';
import { resolveSpinTheWheelQuestions, minWheelQuestionsForSpins } from '@/lib/spin-the-wheel-utils';
import { normalizeHotspotBehavior, validateMaxClicks, getCorrectHotspots, resolveHotspotComponentProps } from '@/lib/hotspot-utils';

// Quiz Validator
export const quizValidator: ComponentValidator = {
    type: 'quiz',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const questions = component.props?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            addError(res, 'NO_QUESTIONS', 'props.questions', 'Quiz must contain at least one question.');
        } else {
            questions.forEach((q, qIdx) => {
                if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
                    addError(res, 'MISSING_QUESTION_TEXT', `props.questions[${qIdx}].question`, `Question ${qIdx + 1} prompt cannot be empty.`);
                } else if (q.question.length > 200) {
                    addWarning(res, 'LONG_QUESTION_TEXT', `props.questions[${qIdx}].question`, `Question ${qIdx + 1} prompt exceeds 200 characters.`);
                }

                if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim() === '') {
                    addWarning(res, 'MISSING_EXPLANATION', `props.questions[${qIdx}].explanation`, `Question ${qIdx + 1} has no answer explanation. Adding an explanation helps reinforce learning.`);
                }

                if (!Array.isArray(q.options) || q.options.length < 2) {
                    addError(res, 'INSUFFICIENT_OPTIONS', `props.questions[${qIdx}].options`, `Question ${qIdx + 1} must have at least 2 answer options.`);
                } else {
                    let correctCount = 0;
                    q.options.forEach((opt: any, oIdx: number) => {
                        if (opt.isCorrect === true) correctCount++;
                        if (!opt.text || typeof opt.text !== 'string' || opt.text.trim() === '') {
                            addError(res, 'EMPTY_OPTION_TEXT', `props.questions[${qIdx}].options[${oIdx}]`, `Question ${qIdx + 1}, Option ${oIdx + 1} text is empty.`);
                        }
                    });

                    if (correctCount === 0) {
                        addError(res, 'NO_CORRECT_ANSWER', `props.questions[${qIdx}].options`, `Question ${qIdx + 1} must have exactly one correct answer selected.`);
                    } else if (correctCount > 1) {
                        addError(res, 'MULTIPLE_CORRECT_ANSWERS', `props.questions[${qIdx}].options`, `Question ${qIdx + 1} has multiple correct answers. Use 'multiSelectQuiz' for multiple correct choices.`);
                    }
                }
            });
        }
        return res;
    }
};

// Flashcards Validator
export const flashcardsValidator: ComponentValidator = {
    type: 'flashcards',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const cards = component.props?.cards;

        if (!Array.isArray(cards) || cards.length === 0) {
            addError(res, 'NO_CARDS', 'props.cards', 'Flashcard deck must contain at least 1 card.');
        } else {
            if (cards.length === 1) {
                addWarning(res, 'SINGLE_CARD_DECK', 'props.cards', 'Consider adding 2 or 3 flashcards for a richer review deck.');
            }
            cards.forEach((card, idx) => {
                if (!card.front || typeof card.front !== 'string' || card.front.trim() === '') {
                    addError(res, 'EMPTY_CARD_FRONT', `props.cards[${idx}].front`, `Card ${idx + 1} front side is empty.`);
                }
                if (!card.back || typeof card.back !== 'string' || card.back.trim() === '') {
                    addError(res, 'EMPTY_CARD_BACK', `props.cards[${idx}].back`, `Card ${idx + 1} back side is empty.`);
                }
            });
        }
        return res;
    }
};

// DragDrop Validator
export const dragDropValidator: ComponentValidator = {
    type: 'dragDrop',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const items = component.props?.items;
        if (!Array.isArray(items) || items.length < 2) {
            addError(res, 'INSUFFICIENT_ITEMS', 'props.items', 'Drag & drop requires at least 2 items to sequence.');
        } else {
            if (items.length < 3) {
                addWarning(res, 'FEW_ITEMS', 'props.items', 'Drag and drop works best with 3 or more items to arrange.');
            }

            const indices = items.map((it: any) => it.correctIndex).sort((a: number, b: number) => a - b);
            const isSequential = indices.every((val, idx) => val === idx);

            if (!isSequential) {
                addError(
                    res,
                    'INVALID_CORRECT_INDICES',
                    'props.items',
                    `Item correctIndex values (${indices.join(', ')}) must form a sequential zero-based sequence (0, 1, 2...).`
                );
            }
        }
        return res;
    }
};

// MatchingPairs Validator
export const matchingPairsValidator: ComponentValidator = {
    type: 'matchingPairs',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const pairs = component.props?.pairs;
        if (!Array.isArray(pairs) || pairs.length < 2) {
            addError(res, 'INSUFFICIENT_PAIRS', 'props.pairs', 'Matching pairs requires at least 2 pairs.');
        } else {
            if (pairs.length < 3) {
                addWarning(res, 'FEW_PAIRS', 'props.pairs', 'Matching pairs activity works best with 3 or more pairs.');
            }
            pairs.forEach((pair, idx) => {
                if (!pair.left || typeof pair.left !== 'string' || pair.left.trim() === '') {
                    addError(res, 'EMPTY_LEFT_PAIR', `props.pairs[${idx}].left`, `Pair ${idx + 1} left item is empty.`);
                }
                if (!pair.right || typeof pair.right !== 'string' || pair.right.trim() === '') {
                    addError(res, 'EMPTY_RIGHT_PAIR', `props.pairs[${idx}].right`, `Pair ${idx + 1} right item is empty.`);
                }
            });
        }
        return res;
    }
};

// FillInTheBlank Validator
export const fillInTheBlankValidator: ComponentValidator = {
    type: 'fillInTheBlank',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const text = component.props?.text;
        const blanks = component.props?.blanks;

        if (typeof text !== 'string' || text.trim() === '') {
            addError(res, 'MISSING_TEXT', 'props.text', 'Fill-in-the-blank text cannot be empty.');
            return res;
        }

        const tokenCount = (text.match(/\{\{blank\}\}/g) || []).length;
        const blankCount = Array.isArray(blanks) ? blanks.length : 0;

        if (tokenCount === 0) {
            addError(res, 'NO_BLANK_TOKENS', 'props.text', "Text must contain at least one '{{blank}}' marker.");
        } else if (tokenCount !== blankCount) {
            addError(
                res,
                'BLANK_COUNT_MISMATCH',
                'props.blanks',
                `Text contains ${tokenCount} '{{blank}}' token(s), but blanks array defines ${blankCount} answer(s). They must match exactly.`
            );
        }

        if (Array.isArray(blanks)) {
            blanks.forEach((b, idx) => {
                if (!b.answer || typeof b.answer !== 'string' || b.answer.trim() === '') {
                    addError(res, 'EMPTY_BLANK_ANSWER', `props.blanks[${idx}].answer`, `Blank ${idx + 1} primary answer cannot be empty.`);
                }
            });
        }
        return res;
    }
};

// Hotspot Validator
export const hotspotValidator: ComponentValidator = {
    type: 'hotspot',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const resolved = resolveHotspotComponentProps(component);
        const { image, hotspots, behavior, maxClicks, markingMode } = resolved;

        if (typeof image !== 'string' || image.trim() === '') {
            addError(res, 'MISSING_HOTSPOT_IMAGE', 'props.image', 'Hotspot background image URL is required.');
        } else if (image.includes('/placeholder.svg') || image.includes('/placeholder.')) {
            addWarning(res, 'PLACEHOLDER_HOTSPOT_IMAGE', 'props.image', 'Hotspot component is using a default placeholder background.');
        }

        if (!Array.isArray(hotspots) || hotspots.length === 0) {
            addWarning(res, 'NO_HOTSPOTS_DEFINED', 'props.hotspots', 'No hotspots defined yet. Add interactive target regions to the diagram.');
        } else {
            hotspots.forEach((hs, idx) => {
                if (typeof hs.x !== 'number' || hs.x < 0 || hs.x > 1) {
                    addError(res, 'INVALID_X_COORD', `props.hotspots[${idx}].x`, `Hotspot ${idx + 1} x-coordinate (${hs.x}) must be a decimal between 0.0 and 1.0.`);
                }
                if (typeof hs.y !== 'number' || hs.y < 0 || hs.y > 1) {
                    addError(res, 'INVALID_Y_COORD', `props.hotspots[${idx}].y`, `Hotspot ${idx + 1} y-coordinate (${hs.y}) must be a decimal between 0.0 and 1.0.`);
                }
                if (behavior === 'explore' && (!hs.content || typeof hs.content !== 'string' || hs.content.trim() === '')) {
                    addWarning(res, 'MISSING_HOTSPOT_CONTENT', `props.hotspots[${idx}].content`, `Hotspot ${idx + 1} has no popup explanation text.`);
                }
            });

            if (behavior === 'discover') {
                const correctCount = getCorrectHotspots(hotspots).length;
                if (correctCount === 0) {
                    addError(res, 'NO_CORRECT_HOTSPOTS', 'props.hotspots', 'Discover mode requires at least one correct target node.');
                }
                const nodeCount = hotspots.length;
                const effectiveMaxClicks = typeof maxClicks === 'number' ? maxClicks : nodeCount + 6;
                if (!validateMaxClicks(effectiveMaxClicks, nodeCount)) {
                    addError(res, 'INVALID_MAX_CLICKS', 'props.maxClicks', `Max clicks (${effectiveMaxClicks}) must be greater than total nodes + 5 (minimum ${nodeCount + 6}).`);
                }
                if (markingMode && markingMode !== 'self-mark' && markingMode !== 'tutor-mark') {
                    addError(res, 'INVALID_MARKING_MODE', 'props.markingMode', 'Marking mode must be "self-mark" or "tutor-mark".');
                }
            }
        }
        return res;
    }
};

// CodeEditor Validator
export const codeEditorValidator: ComponentValidator = {
    type: 'codeEditor',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const testCases = component.props?.testCases;
        if (!Array.isArray(testCases) || testCases.length === 0) {
            addWarning(res, 'NO_TEST_CASES', 'props.testCases', 'Consider defining at least 1 unit test case to validate student code execution.');
        }
        return res;
    }
};

// Poll Validator
export const pollValidator: ComponentValidator = {
    type: 'poll',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);
        const { question, options } = component.props || {};

        if (!question || typeof question !== 'string' || question.trim() === '') {
            addError(res, 'MISSING_POLL_QUESTION', 'props.question', 'Poll question prompt is required.');
        } else if (question.length > 120) {
            addWarning(res, 'LONG_POLL_QUESTION', 'props.question', 'Poll question is over 120 characters.');
        }

        if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
            addError(res, 'INVALID_POLL_OPTIONS_COUNT', 'props.options', 'Poll must contain between 2 and 6 options.');
        } else {
            options.forEach((opt, idx) => {
                if (!opt.text || typeof opt.text !== 'string' || opt.text.trim() === '') {
                    addError(res, 'EMPTY_POLL_OPTION', `props.options[${idx}].text`, `Poll option ${idx + 1} text cannot be empty.`);
                } else if (opt.text.length > 60) {
                    addWarning(res, 'LONG_POLL_OPTION', `props.options[${idx}].text`, `Option ${idx + 1} text is over 60 characters.`);
                }
            });
        }
        return res;
    }
};

// FlashcardQuiz Validator
export const flashcardQuizValidator: ComponentValidator = {
    type: 'flashcardQuiz',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const questions = component.props?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            addError(res, 'NO_FLASHCARD_QUESTIONS', 'props.questions', 'Flashcard quiz must contain at least 1 question.');
        } else {
            questions.forEach((fq, qIdx) => {
                if (!fq.question || typeof fq.question !== 'string' || fq.question.trim() === '') {
                    addError(res, 'EMPTY_FQ_QUESTION', `props.questions[${qIdx}].question`, `Question ${qIdx + 1} prompt is empty.`);
                }
                if (!Array.isArray(fq.options) || fq.options.length < 2 || fq.options.length > 4) {
                    addError(res, 'INVALID_FQ_OPTIONS', `props.questions[${qIdx}].options`, `Question ${qIdx + 1} options must be an array of 2 to 4 strings.`);
                } else {
                    if (typeof fq.correctAnswer !== 'number' || fq.correctAnswer < 0 || fq.correctAnswer >= fq.options.length) {
                        addError(
                            res,
                            'INVALID_CORRECT_ANSWER_INDEX',
                            `props.questions[${qIdx}].correctAnswer`,
                            `Question ${qIdx + 1} correctAnswer index (${fq.correctAnswer}) is out of bounds (0 to ${fq.options.length - 1}).`
                        );
                    }
                }
            });
        }
        return res;
    }
};

// MultiSelectQuiz Validator
export const multiSelectQuizValidator: ComponentValidator = {
    type: 'multiSelectQuiz',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const questions = component.props?.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            addError(res, 'NO_MULTI_QUESTIONS', 'props.questions', 'Multi-select quiz must contain at least 1 question.');
        } else {
            questions.forEach((q, qIdx) => {
                if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim() === '') {
                    addWarning(res, 'MISSING_EXPLANATION', `props.questions[${qIdx}].explanation`, `Question ${qIdx + 1} has no answer explanation. Adding an explanation helps reinforce learning.`);
                }

                if (!Array.isArray(q.options) || q.options.length !== 4) {
                    addWarning(res, 'NON_STANDARD_MULTI_OPTIONS', `props.questions[${qIdx}].options`, `Multi-select quiz renders best with a 2x2 grid (4 options). Currently has ${q.options?.length || 0}.`);
                }
                let correctCount = 0;
                if (Array.isArray(q.options)) {
                    q.options.forEach((opt: any) => {
                        if (opt.isCorrect === true) correctCount++;
                    });
                }
                if (correctCount === 0) {
                    addError(res, 'NO_CORRECT_MULTI_OPTION', `props.questions[${qIdx}].options`, `Question ${qIdx + 1} must have at least one correct option checked.`);
                }
            });
        }
        return res;
    }
};

// TrueFalse Validator
export const trueFalseValidator: ComponentValidator = {
    type: 'trueFalse',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { statement, isTrue } = component.props || {};
        if (typeof statement !== 'string' || statement.trim() === '') {
            addError(res, 'MISSING_STATEMENT', 'props.statement', 'True or false question statement cannot be empty.');
        }
        if (typeof isTrue !== 'boolean') {
            addError(res, 'INVALID_CORRECT_ANSWER', 'props.isTrue', 'Correct answer (isTrue) must be a boolean.');
        }
        return res;
    }
};

// AnnotateImage Validator
export const annotateImageValidator: ComponentValidator = {
    type: 'annotateImage',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { image, labels } = component.props || {};
        if (typeof image !== 'string' || image.trim() === '') {
            addError(res, 'MISSING_ANNOTATE_IMAGE', 'props.image', 'Annotate image URL is required.');
        }
        if (!Array.isArray(labels) || labels.length === 0) {
            addError(res, 'NO_ANNOTATE_LABELS', 'props.labels', 'Annotate image requires at least 1 label tag target.');
        }
        return res;
    }
};

// Categorise Validator
export const categoriseValidator: ComponentValidator = {
    type: 'categorise',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { categories, items } = component.props || {};
        if (!Array.isArray(categories) || categories.length < 2) {
            addError(res, 'INSUFFICIENT_CATEGORIES', 'props.categories', 'Categorise component requires at least 2 categories.');
        }
        if (!Array.isArray(items) || items.length < 2) {
            addError(res, 'INSUFFICIENT_ITEMS', 'props.items', 'Categorise component requires at least 2 items to sort.');
        }
        return res;
    }
};

// Timeline Validator
export const timelineValidator: ComponentValidator = {
    type: 'timeline',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { events } = component.props || {};
        if (!Array.isArray(events) || events.length === 0) {
            addError(res, 'NO_TIMELINE_EVENTS', 'props.events', 'Timeline requires at least 1 event entry.');
        }
        return res;
    }
};

// WordScramble Validator
export const wordScrambleValidator: ComponentValidator = {
    type: 'wordScramble',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { word } = component.props || {};
        if (typeof word !== 'string' || word.trim().length < 2) {
            addError(res, 'INVALID_SCRAMBLE_WORD', 'props.word', 'Word scramble target word must be at least 2 characters long.');
        }
        return res;
    }
};

// MemoryGrid Validator
export const memoryGridValidator: ComponentValidator = {
    type: 'memoryGrid',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { pairs } = component.props || {};
        if (!Array.isArray(pairs) || pairs.length < 2) {
            addError(res, 'INSUFFICIENT_MEMORY_PAIRS', 'props.pairs', 'Memory grid requires at least 2 matching pairs.');
        }
        return res;
    }
};

// SpinTheWheel Validator
export const spinTheWheelValidator: ComponentValidator = {
    type: 'spinTheWheel',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { requiredSpins = 3 } = component.props || {};
        const resolvedQuestions = resolveSpinTheWheelQuestions(component.props || {});
        const sliceCount = resolvedQuestions.length;
        const minQuestionsRequired = minWheelQuestionsForSpins(requiredSpins);

        if (sliceCount < minQuestionsRequired) {
            addError(
                res,
                'INSUFFICIENT_WHEEL_QUESTIONS',
                'props.questions',
                `Spin the wheel requires total questions (${sliceCount}) to be at least requiredSpins + 2 (${minQuestionsRequired} questions for ${requiredSpins} required spins).`
            );
        }
        return res;
    }
};

// ShortAnswer Validator
export const shortAnswerValidator: ComponentValidator = {
    type: 'shortAnswer',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);

        const { question } = component.props || {};
        if (!question || typeof question !== 'string' || question.trim() === '') {
            addError(res, 'MISSING_SHORT_ANSWER_QUESTION', 'props.question', 'Short answer component requires a question prompt.');
        }
        return res;
    }
};

// WordCloud Validator
export const wordCloudValidator: ComponentValidator = {
    type: 'wordCloud',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);
        return res;
    }
};

// ScaleSlider Validator
export const scaleSliderValidator: ComponentValidator = {
    type: 'scaleSlider',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        validateTimeLimit(res, component);
        return res;
    }
};
