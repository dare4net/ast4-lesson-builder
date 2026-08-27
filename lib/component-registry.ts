import type { ComponentType, ComponentType_Category } from "@/types/lesson"

export type ComponentWrapper = "content" | "interactive" | "scored"

export interface ComponentRegistryEntry {
    type: ComponentType | string
    /** Maps to `ComponentType_Category` in lesson-utils */
    category: ComponentType_Category
    /** Blocks Next until complete */
    gated: boolean
    /** Can earn points in live mode */
    scored: boolean
    /** Which base wrapper the renderer should use */
    wrapper: ComponentWrapper
    /** Uses server-side aggregate store (polls, etc.) */
    collaborative?: boolean
}

/**
 * Single source of truth for component behaviour capabilities.
 * Drives gating (lesson-utils), scoring (scoring-service), and renderer prop wiring (component-renderer).
 */
export const COMPONENT_REGISTRY: ComponentRegistryEntry[] = [
    // Content
    { type: "paragraph", category: "content", gated: false, scored: false, wrapper: "content" },
    { type: "heading", category: "content", gated: false, scored: false, wrapper: "content" },
    { type: "bulletList", category: "content", gated: false, scored: false, wrapper: "content" },
    { type: "table", category: "content", gated: false, scored: false, wrapper: "content" },
    { type: "codeBlock", category: "content", gated: false, scored: false, wrapper: "content" },
    { type: "quote", category: "content", gated: false, scored: false, wrapper: "content" },
    { type: "callout", category: "visual-guide", gated: false, scored: false, wrapper: "content" },
    { type: "accordion", category: "structure", gated: true, scored: false, wrapper: "interactive" },
    { type: "image", category: "media", gated: false, scored: false, wrapper: "content" },
    { type: "video", category: "media", gated: false, scored: false, wrapper: "content" },

    // Interactive (scored)
    { type: "quiz", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "trueFalse", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "annotateImage", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "categorise", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "timeline", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "dragDrop", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "matchingPairs", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "fillInTheBlank", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "hotspot", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "flashcardQuiz", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "multiSelectQuiz", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "codeEditor", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "shortAnswer", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "scaleSlider", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "wordCloud", category: "interactive", gated: true, scored: true, wrapper: "scored" },

    // Interactive (non-scored)
    { type: "poll", category: "interactive", gated: true, scored: false, wrapper: "interactive", collaborative: true },
    { type: "flashcards", category: "gamified", gated: true, scored: false, wrapper: "interactive" },

    // Gamified (scored)
    { type: "wordScramble", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "memoryGrid", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "spinTheWheel", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "annotationBoard", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "anagram", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "hangman", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "swipeDeck", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "spectrumSorter", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "jigsaw", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "crossword", category: "gamified", gated: true, scored: true, wrapper: "scored" },

    // Structure
    { type: "slideTitle", category: "structure", gated: false, scored: false, wrapper: "content" },

    // Legacy / studio types not yet implemented in viewer
    { type: "clickableImage", category: "interactive", gated: true, scored: true, wrapper: "scored" },
    { type: "crossword", category: "interactive", gated: true, scored: false, wrapper: "interactive" },
    { type: "audioRecording", category: "interactive", gated: true, scored: false, wrapper: "interactive" },
    { type: "drawingCanvas", category: "interactive", gated: true, scored: false, wrapper: "interactive" },
    { type: "divider", category: "visual-guide", gated: false, scored: false, wrapper: "content" },
    { type: "box", category: "visual-guide", gated: false, scored: false, wrapper: "content" },
    { type: "grid", category: "structure", gated: false, scored: false, wrapper: "content" },
    { type: "carousel", category: "structure", gated: false, scored: false, wrapper: "content" },
    { type: "iconBlock", category: "visual-guide", gated: false, scored: false, wrapper: "content" },
    { type: "badgeReveal", category: "gamified", gated: false, scored: false, wrapper: "content" },
    { type: "miniGame", category: "gamified", gated: true, scored: true, wrapper: "scored" },
    { type: "progressBar", category: "gamified", gated: false, scored: false, wrapper: "content" },
    { type: "lessonIntro", category: "structure", gated: false, scored: false, wrapper: "content" },
    { type: "lessonSummary", category: "structure", gated: false, scored: false, wrapper: "content" },
    { type: "lessonComplete", category: "structure", gated: false, scored: false, wrapper: "content" },
    { type: "timer", category: "utility", gated: false, scored: false, wrapper: "content" },
    { type: "audioPlayer", category: "utility", gated: false, scored: false, wrapper: "content" },
    { type: "languageToggle", category: "utility", gated: false, scored: false, wrapper: "content" },
    { type: "themeSwitch", category: "utility", gated: false, scored: false, wrapper: "content" },
    { type: "hint", category: "utility", gated: false, scored: false, wrapper: "content" },
    { type: "notePad", category: "utility", gated: false, scored: false, wrapper: "content" },
]

const REGISTRY_MAP = new Map<string, ComponentRegistryEntry>(
    COMPONENT_REGISTRY.map(entry => [entry.type, entry])
)

export function getRegistryEntry(type: ComponentType | string): ComponentRegistryEntry | undefined {
    return REGISTRY_MAP.get(type)
}

export function getRegistryCategory(type: ComponentType | string): ComponentType_Category {
    return getRegistryEntry(type)?.category ?? "content"
}

export function isGatedComponent(type: ComponentType | string): boolean {
    return getRegistryEntry(type)?.gated ?? false
}

export function isScoredComponentType(type: ComponentType | string): boolean {
    return getRegistryEntry(type)?.scored ?? false
}

/** Types that receive savedState + setComponentState via the gamified props branch */
export function usesGamifiedRendererProps(type: ComponentType | string): boolean {
    const entry = getRegistryEntry(type)
    if (!entry) return false
    return entry.scored || entry.category === "gamified"
}

/** Types that receive savedState + setComponentState via the interactive props branch */
export function usesInteractiveRendererProps(type: ComponentType | string): boolean {
    const entry = getRegistryEntry(type)
    if (!entry) return false
    if (usesGamifiedRendererProps(type)) return false
    return entry.gated || entry.wrapper === "interactive"
}

export function getScoredComponentTypes(): ComponentType[] {
    return COMPONENT_REGISTRY
        .filter(e => e.scored)
        .map(e => e.type as ComponentType)
}
