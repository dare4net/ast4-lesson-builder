import type { ComponentType as ReactComponentType } from "react"
import type { ComponentType } from "@/lib/component-registry"

type RendererLoader = () => Promise<ReactComponentType<any>>

/**
 * Canonical type → dynamic renderer import.
 * Keep import paths static so Next/Turbopack can split chunks.
 */
export const RENDERER_LOADERS = {
    paragraph: () => import("@/components/renderers/paragraph-renderer").then((mod) => mod.ParagraphRenderer),
    heading: () => import("@/components/renderers/heading-renderer").then((mod) => mod.HeadingRenderer),
    bulletList: () => import("@/components/renderers/bullet-list-renderer").then((mod) => mod.BulletListRenderer),
    image: () => import("@/components/renderers/image-renderer").then((mod) => mod.ImageRenderer),
    table: () => import("@/components/renderers/table-renderer").then((mod) => mod.TableRenderer),
    video: () => import("@/components/renderers/video-renderer").then((mod) => mod.VideoRenderer),
    codeBlock: () => import("@/components/renderers/code-block-renderer").then((mod) => mod.CodeBlockRenderer),
    quote: () => import("@/components/renderers/quote-renderer").then((mod) => mod.QuoteRenderer),
    callout: () => import("@/components/renderers/callout-renderer").then((mod) => mod.CalloutRenderer),
    accordion: () => import("@/components/renderers/accordion-renderer").then((mod) => mod.AccordionRenderer),
    quiz: () => import("@/components/renderers/quiz-renderer").then((mod) => mod.QuizRenderer),
    trueFalse: () => import("@/components/renderers/true-false-renderer").then((mod) => mod.TrueFalseRenderer),
    annotateImage: () => import("@/components/renderers/annotate-image-renderer").then((mod) => mod.AnnotateImageRenderer),
    categorise: () => import("@/components/renderers/categorise-renderer").then((mod) => mod.CategoriseRenderer),
    timeline: () => import("@/components/renderers/timeline-renderer").then((mod) => mod.TimelineRenderer),
    matchingPairs: () => import("@/components/renderers/matching-pairs-renderer").then((mod) => mod.MatchingPairsRenderer),
    dragDrop: () => import("@/components/renderers/drag-drop-renderer").then((mod) => mod.DragDropRenderer),
    flashcards: () => import("@/components/renderers/flashcards-renderer").then((mod) => mod.FlashcardsRenderer),
    hotspot: () => import("@/components/renderers/hotspot-renderer").then((mod) => mod.HotspotRenderer),
    shortAnswer: () => import("@/components/renderers/short-answer-renderer").then((mod) => mod.ShortAnswerRenderer),
    fillInTheBlank: () => import("@/components/renderers/fill-in-the-blank-renderer").then((mod) => mod.FillInTheBlankRenderer),
    codeEditor: () => import("@/components/renderers/code-editor-renderer").then((mod) => mod.CodeEditorRenderer),
    poll: () => import("@/components/renderers/poll-renderer").then((mod) => mod.PollRenderer),
    flashcardQuiz: () => import("@/components/renderers/flashcard-quiz-renderer").then((mod) => mod.FlashcardQuizRenderer),
    multiSelectQuiz: () => import("@/components/renderers/multi-select-quiz-renderer").then((mod) => mod.MultiSelectQuizRenderer),
    wordCloud: () => import("@/components/renderers/word-cloud-renderer").then((mod) => mod.WordCloudRenderer),
    scaleSlider: () => import("@/components/renderers/scale-slider-renderer").then((mod) => mod.ScaleSliderRenderer),
    annotationBoard: () => import("@/components/renderers/annotation-board-renderer").then((mod) => (mod.AnnotationBoardRenderer || mod.default) as any),
    anagram: () => import("@/components/renderers/anagram-renderer").then((mod) => mod.AnagramRenderer as any),
    hangman: () => import("@/components/renderers/hangman-renderer").then((mod) => mod.HangmanRenderer as any),
    swipeDeck: () => import("@/components/renderers/swipe-deck-renderer").then((mod) => mod.SwipeDeckRenderer as any),
    spectrumSorter: () => import("@/components/renderers/spectrum-sorter-renderer").then((mod) => mod.SpectrumSorterRenderer as any),
    jigsaw: () => import("@/components/renderers/jigsaw-renderer").then((mod) => mod.JigsawRenderer as any),
    crossword: () => import("@/components/renderers/crossword-renderer").then((mod) => mod.CrosswordRenderer as any),
    wordScramble: () => import("@/components/renderers/word-scramble-renderer").then((mod) => mod.WordScrambleRenderer as any),
    memoryGrid: () => import("@/components/renderers/memory-grid-renderer").then((mod) => mod.MemoryGridRenderer as any),
    spinTheWheel: () => import("@/components/renderers/spin-the-wheel-renderer").then((mod) => mod.SpinTheWheelRenderer as any),
    slideTitle: () => import("@/components/renderers/heading-renderer").then((mod) => mod.HeadingRenderer),
} as const satisfies Partial<Record<ComponentType, RendererLoader>>

export type RenderableComponentType = keyof typeof RENDERER_LOADERS

export const FALLBACK_RENDERER_LOADER: RendererLoader = () =>
    import("@/components/renderers/fallback-renderer").then((mod) => mod.FallbackRenderer)
