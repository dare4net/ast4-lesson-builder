import type { Component, ComponentType, ComponentType_Category } from "@/types/lesson"
import { getRegistryCategory, isGatedComponent } from "@/lib/component-registry"

/**
 * Get the category for a given component type.
 * @param type - The component type
 * @returns The category of the component
 */
export function getComponentCategory(type: ComponentType | string): ComponentType_Category {
    return getRegistryCategory(type)
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
    return isGatedComponent(type)
}

/**
 * Normalize individual component props to ensure all interactive elements (quizzes, polls, etc.)
 * have valid, deterministic IDs for options.
 */
export function normalizeComponent(comp: any): any {
    if (!comp || !comp.props) return comp
    const cloned = { ...comp, props: { ...comp.props } }

    // Normalize quiz and multiSelectQuiz questions and options
    if (cloned.type === 'quiz' || cloned.type === 'multiSelectQuiz') {
        if (Array.isArray(cloned.props.questions)) {
            cloned.props.questions = cloned.props.questions.map((q: any, qIdx: number) => {
                if (!q) return q
                const qCloned = { ...q }
                if (Array.isArray(qCloned.options)) {
                    qCloned.options = qCloned.options.map((opt: any, oIdx: number) => {
                        if (!opt) return opt
                        return {
                            ...opt,
                            id: opt.id || `opt-${qIdx + 1}-${oIdx + 1}`
                        }
                    })
                }
                return qCloned
            })
        }
    }

    // Normalize poll options
    if (cloned.type === 'poll') {
        if (Array.isArray(cloned.props.options)) {
            cloned.props.options = cloned.props.options.map((opt: any, oIdx: number) => {
                if (!opt) return opt
                return {
                    ...opt,
                    id: opt.id || `opt-${oIdx + 1}`
                }
            })
        }
    }

    return cloned
}

/**
 * Normalize slide objects to ensure all required fields exist with robust fallbacks.
 * Guarantees slide.title is never missing, undefined, or empty, and all component options have valid IDs.
 */
export function normalizeSlides(slides: any[]): import("@/types/lesson").Slide[] {
    if (!Array.isArray(slides)) return []

    return slides.map((slide, index) => {
        const title = slide.title || slide.name || slide.header || `Slide ${index + 1}`
        const rawComponents = Array.isArray(slide.components) ? slide.components : []
        const components = rawComponents.map(normalizeComponent)

        return {
            ...slide,
            id: slide.id || slide._id || `slide-${index + 1}`,
            title: typeof title === 'string' && title.trim() ? title.trim() : `Slide ${index + 1}`,
            status: (slide.status as import("@/types/lesson").SlideStatus) || "uncompleted",
            state: (slide.state as import("@/types/lesson").SlideState) || "active",
            components,
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

