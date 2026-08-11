import { Lesson, Component, ComponentType } from "@/types/lesson"

const SCORED_COMPONENT_TYPES: ComponentType[] = [
    "quiz",
    "trueFalse",
    "annotateImage",
    "categorise",
    "timeline",
    "dragDrop",
    "matchingPairs",
    "fillInTheBlank",
    "codeEditor",
    "hotspot",
    "flashcardQuiz",
    "multiSelectQuiz",
    "wordScramble",
    "memoryGrid",
    "spinTheWheel",
    // "clickableImage" maps to hotspot
]

export const ScoringService = {
    /**
     * Calculates the total possible points in a lesson
     */
    getTotalPossiblePoints(lesson: Lesson): number {
        let total = 0

        lesson.slides.forEach(slide => {
            slide.components.forEach(component => {
                const mode = component.props.mode || component.mode
                if (this.isScoredComponent(component) && mode === 'live') {
                    total += this.getComponentMaxPoints(component)
                }
            })
        })

        return total
    },

    /**
     * Checks if a component is a scored type
     */
    isScoredComponent(component: Component): boolean {
        return SCORED_COMPONENT_TYPES.includes(component.type) && (component.props.points || 0) > 0
    },

    /**
     * Gets the max points for a component
     * Handles specific logic for different component types if needed
     * (e.g. some might calculate points based on item count, but usually 'points' prop is total)
     */
    getComponentMaxPoints(component: Component): number {
        const points = component.props.points || 0

        if (points === 0) return 0

        switch (component.type) {
            case "fillInTheBlank":
                const blankCount = component.props.blanks?.length || (component.props.text?.match(/\[blank\]/g) || []).length
                return points * blankCount

            case "dragDrop":
                return points * (component.props.items?.length || 0)

            case "matchingPairs":
                return points * (component.props.pairs?.length || 0)

            case "quiz":
                return points * (component.props.questions?.length || 0)

            case "trueFalse":
            case "annotateImage":
            case "categorise":
            case "timeline":
            case "flashcardQuiz":
            case "multiSelectQuiz":
            default:
                return points
        }
    },

    /**
     * Calculate score for a component based on its state
     * (Optional helper for calculating current score from state)
     */
    calculateComponentScore(component: Component, state: any): number {
        if (!this.isScoredComponent(component) || !state) return 0

        // Implementation depends on standardizing state structure which we haven't fully done for *scoring* calculation inside Service.
        // Currently Renderers calculate score and call addPoints.
        // So Service might not need this method immediately if we rely on "Push" model (addPoints).
        // But "Pull" model (calculate from state) is more robust for persistence/re-calc.
        return 0
    }
}
