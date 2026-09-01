import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RENDERERS_DIR = join(process.cwd(), 'components/renderers')

function readRenderer(file: string) {
    return readFileSync(join(RENDERERS_DIR, file), 'utf8')
}

function extractContentFunctionParams(source: string, marker: string): string | null {
    const idx = source.indexOf(marker)
    if (idx < 0) return null
    const slice = source.slice(idx)
    const open = slice.indexOf('(')
    if (open < 0) return null
    let depth = 0
    for (let i = open; i < slice.length; i += 1) {
        const ch = slice[i]
        if (ch === '(') depth += 1
        if (ch === ')') {
            depth -= 1
            if (depth === 0) {
                return slice.slice(open + 1, i)
            }
        }
    }
    return null
}

const SCORED_RENDERER_FILES: Record<string, string> = {
    quiz: 'quiz-renderer.tsx',
    trueFalse: 'true-false-renderer.tsx',
    multiSelectQuiz: 'multi-select-quiz-renderer.tsx',
    flashcardQuiz: 'flashcard-quiz-renderer.tsx',
    fillInTheBlank: 'fill-in-the-blank-renderer.tsx',
    matchingPairs: 'matching-pairs-renderer.tsx',
    dragDrop: 'drag-drop-renderer.tsx',
    hotspot: 'hotspot-renderer.tsx',
    shortAnswer: 'short-answer-renderer.tsx',
    scaleSlider: 'scale-slider-renderer.tsx',
    wordCloud: 'word-cloud-renderer.tsx',
    categorise: 'categorise-renderer.tsx',
    timeline: 'timeline-renderer.tsx',
    annotateImage: 'annotate-image-renderer.tsx',
    codeEditor: 'code-editor-renderer.tsx',
    anagram: 'anagram-renderer.tsx',
    hangman: 'hangman-renderer.tsx',
    swipeDeck: 'swipe-deck-renderer.tsx',
    spectrumSorter: 'spectrum-sorter-renderer.tsx',
    jigsaw: 'jigsaw-renderer.tsx',
    crossword: 'crossword-renderer.tsx',
    wordScramble: 'word-scramble-renderer.tsx',
    memoryGrid: 'memory-grid-renderer.tsx',
    spinTheWheel: 'spin-the-wheel-renderer.tsx',
    annotationBoard: 'annotation-board-renderer.tsx',
}

describe('renderer live start meta', () => {
    const rendererFiles = readdirSync(RENDERERS_DIR).filter((file) => file.endsWith('-renderer.tsx'))

    it('only references in-scope identifiers inside buildLiveStartMeta', () => {
        const violations: string[] = []

        for (const file of rendererFiles) {
            const source = readRenderer(file)
            if (!source.includes('buildLiveStartMeta')) continue

            const fnMarkers = [
                'function MatchingPairsContent',
                'function DragDropContent',
                'function QuizPlayfield',
                'function MultiSelectContent',
                'function FlashcardQuizContent',
                'function FillInTheBlankContent',
                'function HotspotContent',
                'function WordCloudContent',
                'function ScaleSliderContent',
                'function ShortAnswerContent',
                'function TrueFalseContent',
                'function CategoriseContent',
                'function TimelineContent',
                'function AnnotateImageContent',
                'function CodeEditorContent',
                'function AnagramContent',
                'function HangmanContent',
                'function SwipeDeckContent',
                'function SpectrumSorterContent',
                'function JigsawContent',
                'function CrosswordContent',
                'function WordScrambleShell',
                'function MemoryGridContent',
                'function SpinTheWheelPlayfield',
                'function AnnotationBoardContent',
            ].filter((marker) => source.includes(marker))

            const paramSource = fnMarkers
                .map((marker) => extractContentFunctionParams(source, marker))
                .find(Boolean) || ''

            const metaMatch = source.match(/buildLiveStartMeta\(\{[\s\S]*?\}\)/)
            if (!metaMatch) continue
            const metaBlock = metaMatch[0]

            const barePoints = /\bpoints\s*,/.test(metaBlock) && !/props\.points|pointsPer/.test(metaBlock)
            if (barePoints && !/\bpoints\b/.test(paramSource)) {
                violations.push(`${file}: buildLiveStartMeta uses bare "points" but it is not a content param`)
            }

            const bareTitle = /title:\s*title\b/.test(metaBlock)
            if (bareTitle && !/\btitle\b/.test(paramSource)) {
                violations.push(`${file}: buildLiveStartMeta uses bare "title" but it is not a content param`)
            }
        }

        expect(violations).toEqual([])
    })
})

describe('renderer registry coverage', () => {
    it('has a smoke fixture for every registered renderer loader', async () => {
        const { RENDERER_LOADERS } = await import('@/lib/component-renderer-loaders')
        const { RENDERER_FIXTURES } = await import('@/lib/test-utils/renderer-fixtures')

        for (const type of Object.keys(RENDERER_LOADERS)) {
            expect(RENDERER_FIXTURES).toHaveProperty(type)
        }
    })

    it('every scored registry entry with a loader uses ScoredRenderer', async () => {
        const { COMPONENT_REGISTRY } = await import('@/lib/component-registry')
        const { RENDERER_LOADERS } = await import('@/lib/component-renderer-loaders')
        const loaderTypes = new Set(Object.keys(RENDERER_LOADERS))

        for (const entry of COMPONENT_REGISTRY) {
            if (!entry.scored || !loaderTypes.has(entry.type)) continue
            const file = SCORED_RENDERER_FILES[entry.type]
            expect(file, `missing renderer file map for ${entry.type}`).toBeTruthy()
            const source = readRenderer(file!)
            expect(source, `${entry.type} should use ScoredRenderer`).toContain('ScoredRenderer')
        }
    })
})
