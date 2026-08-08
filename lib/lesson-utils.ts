import type { Component, ComponentType, ComponentType_Category } from "@/types/lesson"

/**
 * Maps component types to their categories.
 * This is the single source of truth for component categorization.
 */
const COMPONENT_CATEGORY_MAP: Record<string, ComponentType_Category> = {
    // Content Components
    paragraph: "content",
    heading: "content",
    bulletList: "content",
    table: "content",
    codeBlock: "content",
    quote: "content",

    // Visual & Layout
    divider: "visual-guide",
    box: "visual-guide",
    callout: "visual-guide",
    grid: "structure",
    carousel: "structure",
    accordion: "structure",
    iconBlock: "visual-guide",

    // Media
    image: "media",
    video: "media",

    // Interactive Components  
    quiz: "interactive",
    poll: "interactive",
    dragDrop: "interactive",
    matchingPairs: "interactive",
    fillInTheBlank: "interactive",
    codeEditor: "interactive",
    clickableImage: "interactive",
    hotspot: "interactive",
    flashcardQuiz: "interactive",
    multiSelectQuiz: "interactive",

    // Gamified Components
    flashcards: "gamified",
    badgeReveal: "gamified",
    miniGame: "gamified",
    progressBar: "gamified",

    // Structure
    slideTitle: "structure",
    lessonIntro: "structure",
    lessonSummary: "structure",
    lessonComplete: "structure",

    // Utility
    timer: "utility",
    audioPlayer: "utility",
    languageToggle: "utility",
    themeSwitch: "utility",
    hint: "utility",
    notePad: "utility",
}

/**
 * Get the category for a given component type.
 * @param type - The component type
 * @returns The category of the component
 */
export function getComponentCategory(type: ComponentType | string): ComponentType_Category {
    return COMPONENT_CATEGORY_MAP[type] || "content"
}

/**
 * Interface for categorized components result
 */
export interface CategorizedComponents {
    gamified: Component[]
    interactive: Component[]
    content: Component[]
    media: Component[]
    utility: Component[]
    structure: Component[]
}

/**
 * Categorize an array of components by their type.
 * This replaces the stored categorizedComponents field with a computed version.
 * 
 * @param components - Array of components to categorize
 * @returns Object with components grouped by category
 */
export function getCategorizedComponents(components: Component[]): CategorizedComponents {
    const categorized: CategorizedComponents = {
        gamified: [],
        interactive: [],
        content: [],
        media: [],
        utility: [],
        structure: []
    }

    components.forEach(component => {
        const category = getComponentCategory(component.type)

        switch (category) {
            case "gamified":
                categorized.gamified.push(component)
                break
            case "interactive":
                categorized.interactive.push(component)
                break
            case "content":
                categorized.content.push(component)
                break
            case "media":
                categorized.media.push(component)
                break
            case "utility":
                categorized.utility.push(component)
                break
            case "structure":
            case "visual-guide":
                categorized.structure.push(component)
                break
        }
    })

    return categorized
}

/**
 * Get all interactive and gamified components from an array.
 * Useful for completion checking.
 * 
 * @param components - Array of components
 * @returns Array of interactive and gamified components
 */
export function getInteractiveAndGamifiedComponents(components: Component[]): Component[] {
    return components.filter(c => {
        const category = getComponentCategory(c.type)
        return category === "interactive" || category === "gamified"
    })
}

/**
 * Check if a component type is interactive or gamified.
 * 
 * @param type - Component type to check
 * @returns True if the component is interactive or gamified
 */
export function isInteractiveComponent(type: ComponentType | string): boolean {
    const category = getComponentCategory(type)
    return category === "interactive" || category === "gamified"
}

/**
 * Normalize slide objects to ensure all required fields exist with robust fallbacks.
 * Guarantees slide.title is never missing, undefined, or empty.
 */
export function normalizeSlides(slides: any[]): import("@/types/lesson").Slide[] {
    if (!Array.isArray(slides)) return []

    return slides.map((slide, index) => {
        const title = slide.title || slide.name || slide.header || `Slide ${index + 1}`
        return {
            ...slide,
            id: slide.id || slide._id || `slide-${index + 1}`,
            title: typeof title === 'string' && title.trim() ? title.trim() : `Slide ${index + 1}`,
            status: (slide.status as import("@/types/lesson").SlideStatus) || "uncompleted",
            state: (slide.state as import("@/types/lesson").SlideState) || "active",
            components: Array.isArray(slide.components) ? slide.components : [],
        }
    })
}

/**
 * Format slide title to enforce a maximum character length with ellipsis truncation.
 * Prevents UI overflow in sidebars.
 * 
 * @param title - Raw slide title
 * @param maxLength - Maximum allowed characters before ellipsis (default 20)
 * @returns Formatted slide title
 */
export function formatSlideTitle(title?: string, maxLength: number = 20): string {
    if (!title || !title.trim()) return "Untitled Slide"
    const trimmed = title.trim()
    if (trimmed.length <= maxLength) return trimmed
    return `${trimmed.slice(0, maxLength).trim()}...`
}

