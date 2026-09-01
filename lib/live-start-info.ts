/** Copy + scoring hints for the shared Live Mode pre-play screen. */

export type LiveStartMeta = {
    label: string
    description: string
    timeLimitSec: number
    maxMark: number
    maxStars: number
    units: number
}

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
    quiz: 'Answer every question. Get it right for stars — finish fast for a speed bonus.',
    multiSelectQuiz: 'Pick every correct option on each question before time runs out.',
    flashcardQuiz: 'Flip each card and choose the right answer before the timer hits zero.',
    fillInTheBlank: 'Fill every blank with the correct word or phrase.',
    matchingPairs: 'Match each item to its partner. All pairs must be correct.',
    dragDrop: 'Sort every item into the right group or category.',
    hotspot: 'Tap the correct spots on the image. Avoid wrong areas.',
    wordCloud: 'Submit your word response before the clock runs out.',
    scaleSlider: 'Move the slider to the best answer, then submit.',
    shortAnswer: 'Write your answer clearly. Tutor marking may apply after submit.',
    trueFalse: 'Decide if the statement is true or false before time runs out.',
    anagram: 'Unscramble the letters to spell the correct word.',
    categorise: 'Place each item in the correct bucket.',
    timeline: 'Work through every event on the timeline before time runs out.',
    annotateImage: 'Place every label on the correct spot on the image.',
    codeEditor: 'Write code that passes the challenge before the timer ends.',
    hangman: 'Guess the word letter by letter before you run out of lives.',
    memoryGrid: 'Match every pair on the board before time runs out.',
    wordScramble: 'Unscramble the word before the clock hits zero.',
    spinTheWheel: 'Spin and complete the challenge in time.',
    swipeDeck: 'Swipe through cards and respond to each one in time.',
    spectrumSorter: 'Order or sort items along the spectrum before time runs out.',
    jigsaw: 'Complete the jigsaw puzzle before time runs out.',
    crossword: 'Fill the crossword grid before time runs out.',
    annotationBoard: 'Complete your annotations before time runs out.',
}

export function buildLiveStartMeta(opts: {
    type: string
    title: string
    description?: string
    timeLimitSec: number
    points?: number
    units?: number
}): LiveStartMeta {
    const units = Math.max(1, Math.round(Number(opts.units) || 1))
    const pointsPerUnit = Math.max(1, Math.round(Number(opts.points) || 1))
    const maxMark = pointsPerUnit * units
    // Best case: perfect score (5★ per unit) + max speed bonus (+2)
    const maxStars = 5 * units + 2

    return {
        label: opts.title,
        description:
            opts.description?.trim()
            || DEFAULT_DESCRIPTIONS[opts.type]
            || 'Complete this challenge before time runs out. Stars are awarded live.',
        timeLimitSec: Math.max(1, Math.round(Number(opts.timeLimitSec) || 10)),
        maxMark,
        maxStars,
        units,
    }
}

export function formatLiveTime(seconds: number) {
    const s = Math.max(0, Math.floor(seconds))
    const min = Math.floor(s / 60)
    const sec = s % 60
    if (min > 0) {
        return `${min}:${sec.toString().padStart(2, '0')}`
    }
    return `${sec}s`
}
