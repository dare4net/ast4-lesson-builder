/**
 * SKILL-Based Time Limit Calculator & Recommendation Matrix
 * Derived strictly from skills/curriculum-lesson-generator/SKILL.md Section 5.
 */

import { resolveHotspotComponentProps } from '@/lib/hotspot-utils';

export interface TimeRecommendation {
    recommendedSeconds: number;
    minimumSeconds: number;
    explanation: string;
}

export function calculateRecommendedTimeLimit(
    type: string,
    props: any
): TimeRecommendation | null {
    if (!props) return null;

    switch (type) {
        case 'quiz': {
            const qCount = Array.isArray(props.questions) ? props.questions.length : 1;
            const rec = 10 + 10 * Math.max(1, qCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 20,
                explanation: `${qCount} question${qCount > 1 ? 's' : ''} (10s setup + 10s per question)`
            };
        }

        case 'trueFalse': {
            const qCount = Array.isArray(props.questions) ? props.questions.length : 1;
            const rec = 10 + 10 * Math.max(1, qCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 20,
                explanation: `${qCount} question${qCount > 1 ? 's' : ''} (10s setup + 10s per question)`
            };
        }

        case 'fillInTheBlank': {
            const bCount = Array.isArray(props.blanks) ? props.blanks.length : 1;
            const rec = 15 + 15 * Math.max(1, bCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 30,
                explanation: `${bCount} blank${bCount > 1 ? 's' : ''} (15s setup + 15s per blank)`
            };
        }

        case 'dragDrop': {
            const iCount = Array.isArray(props.items) ? props.items.length : 1;
            const rec = 10 + 10 * Math.max(1, iCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 30,
                explanation: `${iCount} item${iCount > 1 ? 's' : ''} to sequence (10s setup + 10s per item)`
            };
        }

        case 'matchingPairs': {
            const pCount = Array.isArray(props.pairs) ? props.pairs.length : 1;
            const rec = 10 + 10 * Math.max(1, pCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 30,
                explanation: `${pCount} pair${pCount > 1 ? 's' : ''} to match (10s setup + 10s per pair)`
            };
        }

        case 'flashcardQuiz': {
            const qCount = Array.isArray(props.questions) ? props.questions.length : 1;
            const rec = 10 + 12 * Math.max(1, qCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 25,
                explanation: `${qCount} flip card question${qCount > 1 ? 's' : ''} (10s setup + 12s per question)`
            };
        }

        case 'spinTheWheel': {
            const spins = typeof props.requiredSpins === 'number' ? props.requiredSpins : (Array.isArray(props.items) ? props.items.length : 3);
            const rec = 15 + 12 * Math.max(1, spins);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 35,
                explanation: `${spins} required wheel spin${spins > 1 ? 's' : ''} (15s setup + 12s per spin)`
            };
        }

        case 'multiSelectQuiz': {
            let totalOptions = 0;
            if (Array.isArray(props.questions)) {
                props.questions.forEach((q: any) => {
                    if (Array.isArray(q.options)) totalOptions += q.options.length;
                });
            }
            if (totalOptions === 0) totalOptions = 4;
            const rec = 12 + 8 * totalOptions;
            return {
                recommendedSeconds: rec,
                minimumSeconds: 30,
                explanation: `${totalOptions} option cards to evaluate (12s setup + 8s per option)`
            };
        }

        case 'categorise': {
            const iCount = Array.isArray(props.items) ? props.items.length : 1;
            const rec = 15 + 8 * Math.max(1, iCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 35,
                explanation: `${iCount} item${iCount > 1 ? 's' : ''} to sort (15s setup + 8s per item)`
            };
        }

        case 'annotateImage': {
            const lCount = Array.isArray(props.labels) ? props.labels.length : 1;
            const rec = 15 + 10 * Math.max(1, lCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 35,
                explanation: `${lCount} label node${lCount > 1 ? 's' : ''} (15s setup + 10s per label)`
            };
        }

        case 'wordScramble': {
            const wCount = Array.isArray(props.words) ? props.words.length : 1;
            const rec = 15 + 15 * Math.max(1, wCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 30,
                explanation: `${wCount} word${wCount > 1 ? 's' : ''} to unscramble (15s setup + 15s per word)`
            };
        }

        case 'memoryGrid': {
            const pCount = Array.isArray(props.pairs) ? props.pairs.length : 1;
            const rec = 15 + 10 * Math.max(1, pCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 35,
                explanation: `${pCount} pair${pCount > 1 ? 's' : ''} to match (15s setup + 10s per pair)`
            };
        }

        case 'timeline': {
            const eCount = Array.isArray(props.events) ? props.events.length : 1;
            const rec = 15 + 10 * Math.max(1, eCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 35,
                explanation: `${eCount} event${eCount > 1 ? 's' : ''} to order (15s setup + 10s per event)`
            };
        }

        case 'codeEditor': {
            const tCount = Array.isArray(props.testCases) ? props.testCases.length : 1;
            const rec = 20 + 30 * Math.max(1, tCount);
            return {
                recommendedSeconds: rec,
                minimumSeconds: 60,
                explanation: `${tCount} test case${tCount > 1 ? 's' : ''} (20s setup + 30s per test case)`
            };
        }

        case 'hotspot': {
            const resolved = resolveHotspotComponentProps({ props })
            const behavior = String(resolved.behavior ?? '').toLowerCase()
            const isDiscover = behavior === 'discover' || behavior === 'quiz'
            if (isDiscover) {
                const hCount = Array.isArray(props.hotspots) ? props.hotspots.length : 1;
                const rec = 15 + 10 * Math.max(1, hCount);
                return {
                    recommendedSeconds: rec,
                    minimumSeconds: 30,
                    explanation: `${hCount} target hotspot${hCount > 1 ? 's' : ''} (15s setup + 10s per target)`
                };
            }
            return null;
        }

        default:
            return null;
    }
}
