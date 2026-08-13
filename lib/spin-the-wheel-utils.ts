export type QuestionType = "multipleChoice" | "inputAnswer" | "trueFalse"

export interface WheelQuestion {
    id: string
    type: QuestionType
    prompt: string
    options?: string[]
    correctOptionIndex?: number
    keywords?: string[]
    isTrue?: boolean
    explanation?: string
}

export const DEFAULT_WHEEL_QUESTIONS: WheelQuestion[] = [
    {
        id: "q1",
        type: "multipleChoice",
        prompt: "What gas do plants absorb from the atmosphere for photosynthesis?",
        options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correctOptionIndex: 0,
        explanation: "Plants take in carbon dioxide and release oxygen during photosynthesis.",
    },
    {
        id: "q2",
        type: "trueFalse",
        prompt: "Sound travels faster in air than in water.",
        isTrue: false,
        explanation: "Sound travels about 4 times faster in water because water particles are denser.",
    },
    {
        id: "q3",
        type: "inputAnswer",
        prompt: "What is the hardest natural substance on Earth?",
        keywords: ["diamond"],
        explanation: "Diamond is carbon arranged in a crystal lattice structure.",
    },
    {
        id: "q4",
        type: "multipleChoice",
        prompt: "Which organ in the human body pumps blood?",
        options: ["Brain", "Lungs", "Heart", "Liver"],
        correctOptionIndex: 2,
        explanation: "The heart is a muscular organ that pumps blood through the circulatory system.",
    },
    {
        id: "q5",
        type: "trueFalse",
        prompt: "The Earth revolves around the Sun.",
        isTrue: true,
        explanation: "It takes approximately 365.25 days for Earth to complete one orbit around the Sun.",
    },
    {
        id: "q6",
        type: "inputAnswer",
        prompt: "What force pulls objects toward the center of the Earth?",
        keywords: ["gravity"],
        explanation: "Gravity is a fundamental force of attraction between masses.",
    },
]

const QUESTION_TYPE_ALIASES: Record<string, QuestionType> = {
    multipleChoice: "multipleChoice",
    multiple_choice: "multipleChoice",
    quiz: "multipleChoice",
    inputAnswer: "inputAnswer",
    shortAnswer: "inputAnswer",
    input: "inputAnswer",
    trueFalse: "trueFalse",
    true_false: "trueFalse",
}

function inferQuestionType(raw: Partial<WheelQuestion>): QuestionType {
    if (Array.isArray(raw.options) && raw.options.length > 0) return "multipleChoice"
    if (typeof raw.isTrue === "boolean") return "trueFalse"
    if (Array.isArray(raw.keywords)) return "inputAnswer"
    return "multipleChoice"
}

export function normalizeWheelQuestion(raw: unknown, index: number): WheelQuestion {
    if (typeof raw === "string") {
        return {
            id: `q-${index + 1}`,
            type: "inputAnswer",
            prompt: raw,
            keywords: [""],
        }
    }

    const q = (raw ?? {}) as Partial<WheelQuestion> & Record<string, unknown>
    const type = QUESTION_TYPE_ALIASES[String(q.type ?? "")] ?? inferQuestionType(q)

    return {
        id: typeof q.id === "string" && q.id.trim() ? q.id : `q-${index + 1}`,
        type,
        prompt: typeof q.prompt === "string" ? q.prompt : "",
        options: Array.isArray(q.options) ? q.options.map(String) : undefined,
        correctOptionIndex: typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : undefined,
        keywords: Array.isArray(q.keywords) ? q.keywords.map(String) : undefined,
        isTrue: typeof q.isTrue === "boolean" ? q.isTrue : undefined,
        explanation: typeof q.explanation === "string" ? q.explanation : undefined,
    }
}

export function normalizeWheelQuestions(raw: unknown[] | undefined | null): WheelQuestion[] {
    if (!Array.isArray(raw) || raw.length === 0) return []

    const seenIds = new Set<string>()
    return raw.map((question, index) => {
        const normalized = normalizeWheelQuestion(question, index)
        if (!seenIds.has(normalized.id)) {
            seenIds.add(normalized.id)
            return normalized
        }

        const uniqueId = `${normalized.id}-${index + 1}`
        seenIds.add(uniqueId)
        return { ...normalized, id: uniqueId }
    })
}

export function minWheelQuestionsForSpins(requiredSpins: number): number {
    return Math.max(1, requiredSpins) + 2
}

/** Read questions from props.questions, falling back to legacy props.items. Never injects defaults. */
export function resolveSpinTheWheelQuestions(props: {
    questions?: unknown
    items?: unknown
}): WheelQuestion[] {
    const raw = Array.isArray(props.questions) && props.questions.length > 0
        ? props.questions
        : Array.isArray(props.items) && props.items.length > 0
            ? props.items
            : []

    return normalizeWheelQuestions(raw)
}

function createBlankWheelQuestion(index: number, existingIds: Set<string>): WheelQuestion {
    const types: QuestionType[] = ["multipleChoice", "trueFalse", "inputAnswer"]
    const type = types[index % types.length]

    let id = `q-blank-${Date.now()}-${index}`
    while (existingIds.has(id)) {
        id = `q-blank-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    }
    existingIds.add(id)

    return {
        id,
        type,
        prompt: "",
        ...(type === "multipleChoice" ? { options: ["", ""], correctOptionIndex: 0 } : {}),
        ...(type === "inputAnswer" ? { keywords: [""] } : {}),
        ...(type === "trueFalse" ? { isTrue: true } : {}),
    }
}

function dedupeWheelQuestionIds(questions: WheelQuestion[]): WheelQuestion[] {
    const seenIds = new Set<string>()
    return questions.map((question, index) => {
        if (!seenIds.has(question.id)) {
            seenIds.add(question.id)
            return question
        }
        const uniqueId = `${question.id}-dup-${index}-${Date.now()}`
        seenIds.add(uniqueId)
        return { ...question, id: uniqueId }
    })
}

/** Seed empty banks and pad until requiredSpins + 2 is satisfied. */
export function ensureSpinTheWheelQuestions(
    questions: WheelQuestion[],
    requiredSpins: number,
): WheelQuestion[] {
    const minCount = minWheelQuestionsForSpins(requiredSpins)

    if (questions.length === 0) {
        const seeded = DEFAULT_WHEEL_QUESTIONS.length >= minCount
            ? DEFAULT_WHEEL_QUESTIONS
            : [...DEFAULT_WHEEL_QUESTIONS, ...Array.from(
                { length: minCount - DEFAULT_WHEEL_QUESTIONS.length },
                (_, index) => {
                    const existingIds = new Set(DEFAULT_WHEEL_QUESTIONS.map(q => q.id))
                    return createBlankWheelQuestion(DEFAULT_WHEEL_QUESTIONS.length + index, existingIds)
                },
            )]
        return dedupeWheelQuestionIds(seeded)
    }

    const deduped = dedupeWheelQuestionIds(questions)
    if (deduped.length >= minCount) return deduped

    const existingIds = new Set(deduped.map(q => q.id))
    const next = [...deduped]
    while (next.length < minCount) {
        next.push(createBlankWheelQuestion(next.length, existingIds))
    }

    return next
}

export function wheelQuestionsChanged(
    current: unknown[] | undefined,
    next: WheelQuestion[],
): boolean {
    if (!Array.isArray(current) || current.length === 0) return next.length > 0
    if (current.length !== next.length) return true

    const normalizedCurrent = resolveSpinTheWheelQuestions({ questions: current })
    return JSON.stringify(normalizedCurrent) !== JSON.stringify(next)
}
