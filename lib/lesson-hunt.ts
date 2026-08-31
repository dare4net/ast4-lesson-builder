import { componentMode, getComponentMaxPoints, isScoredComponent } from '@/domain/scoring'
import { isScoredComponentType } from '@/lib/component-registry'
import type { Component } from '@/types/lesson'

const HUNT_TYPES = new Set([
    'quiz', 'trueFalse', 'annotateImage', 'categorise', 'timeline', 'dragDrop', 'matchingPairs',
    'fillInTheBlank', 'hotspot', 'flashcardQuiz', 'multiSelectQuiz', 'codeEditor', 'shortAnswer',
    'scaleSlider', 'wordCloud', 'poll', 'flashcards', 'wordScramble', 'memoryGrid', 'spinTheWheel',
    'annotationBoard', 'anagram', 'hangman', 'swipeDeck', 'spectrumSorter', 'jigsaw', 'crossword',
    'clickableImage', 'miniGame',
])

export type LessonHuntActivity = {
    type: string
    label: string
    slideTitle: string
    mode: string
    points: number
    maxStars: number
}

export type LessonHuntSummary = {
    activities: LessonHuntActivity[]
    totalPoints: number
    livePoints: number
    practicePoints: number
    maxStars: number
    interactiveCount: number
}

function humanizeType(type: string) {
    const text = String(type || '').replace(/([A-Z])/g, ' $1').trim()
    if (!text) return 'Block'
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function summarizeLessonHunt(slides: Array<{ title?: string; components?: Component[] }> | null | undefined): LessonHuntSummary {
    const activities: LessonHuntActivity[] = []
    let totalPoints = 0
    let livePoints = 0
    let practicePoints = 0
    let maxStars = 0
    let interactiveCount = 0

    for (const slide of slides || []) {
        for (const component of slide.components || []) {
            if (!component?.type) continue
            const maxPoints = getComponentMaxPoints(component)
            const mode = componentMode(component)
            const hunt = isScoredComponent(component) || HUNT_TYPES.has(component.type) || isScoredComponentType(component.type)
            if (!hunt) continue
            if (HUNT_TYPES.has(component.type) || isScoredComponentType(component.type)) interactiveCount += 1
            const stars = mode === 'live' && maxPoints > 0 ? 5 : 0
            totalPoints += maxPoints
            if (mode === 'live') livePoints += maxPoints
            else practicePoints += maxPoints
            maxStars += stars
            activities.push({
                type: component.type,
                label: humanizeType(component.type),
                slideTitle: slide.title || '',
                mode,
                points: maxPoints,
                maxStars: stars,
            })
        }
    }

    return { activities, totalPoints, livePoints, practicePoints, maxStars, interactiveCount }
}

function slidesFrom(value: unknown): Array<{ title?: string; components?: Component[] }> | undefined {
    return Array.isArray(value) ? value : undefined
}

export function mergeLessonHunt(lesson: Record<string, unknown>, slides?: Array<{ title?: string; components?: Component[] }>) {
    const hunt = summarizeLessonHunt(slides || slidesFrom(lesson.slides))
    return {
        ...lesson,
        activities: lesson.activities || hunt.activities,
        obtainablePoints: lesson.obtainablePoints ?? hunt.totalPoints,
        livePoints: lesson.livePoints ?? hunt.livePoints,
        practicePoints: lesson.practicePoints ?? hunt.practicePoints,
        obtainableStars: lesson.obtainableStars ?? hunt.maxStars,
        totalScore: lesson.totalScore || hunt.totalPoints,
        totalSlides: lesson.totalSlides ?? (slides?.length ?? slidesFrom(lesson.slides)?.length ?? 0),
        interactiveCount: lesson.interactiveCount ?? hunt.interactiveCount,
    }
}
