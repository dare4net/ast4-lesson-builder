import { Lesson, Component } from "@/types/lesson"
import {
    calculateComponentScore as pullComponentScore,
    getComponentMaxPoints as domainMaxPoints,
    getTotalPossiblePoints as domainTotalPossible,
    isScoredComponent as domainIsScored,
} from "@/domain/scoring"

export const ScoringService = {
    getTotalPossiblePoints(lesson: Lesson): number {
        return domainTotalPossible(lesson)
    },

    isScoredComponent(component: Component): boolean {
        return domainIsScored(component)
    },

    getComponentMaxPoints(component: Component): number {
        return domainMaxPoints(component)
    },

    calculateComponentScore(component: Component, state: unknown): number {
        return pullComponentScore(component, state)
    },
}
