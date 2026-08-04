"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { useFeedback } from "@/hooks/use-feedback"
import type { Component } from "@/types/lesson"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MultiSelectOption {
    id: string
    text: string
    isCorrect: boolean
    color: string
}

interface MultiSelectQuestion {
    id: string
    question: string
    options: MultiSelectOption[]
    explanation?: string
}

interface MultiSelectQuizRendererProps {
    title?: string
    questions?: MultiSelectQuestion[]
    points?: number
    timeLimit?: number
    isEditing?: boolean
    mode?: 'practice' | 'live'
    state?: 'active' | 'disabled'
    disabled?: boolean
    savedState?: any
    setComponentState?: (state: any) => void
    id?: string
    status?: string
}

type MultiSelectQuizState = {
    currentQuestion: number
    questionsAnswered: boolean[]
    questionsCorrect: boolean[]
    scores: number[]
    status?: string
    isComplete?: boolean
}

// ─── Inner content ────────────────────────────────────────────────────────────

function MultiSelectContent({
    state,
    setState,
    handleScore,
    handlePoints,
    isDisabled,
    isLive,
    id,
    questions,
    points,
    timeLimit = 15,
}: ScoredRenderProps<MultiSelectQuizState> & {
    isDisabled: boolean
    isLive: boolean
    id: string
    questions: MultiSelectQuestion[]
    points: number
    timeLimit?: number
}) {
    const { playFeedback } = useFeedback()
    const { registerLock, unregisterLock } = useNavigationLock()
    const [hasStarted, setHasStarted] = useState(false)

    const { currentQuestion, questionsAnswered, questionsCorrect } = state
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [showResult, setShowResult] = useState(false)

    const question = questions[currentQuestion]
    const pointsPerQ = questions.length > 0 ? points / questions.length : 0
    const isComplete = state.isComplete || state.status === 'completed'

    // Navigation Lock for Live Mode
    useEffect(() => {
        if (isLive && hasStarted && !isComplete) {
            registerLock(id)
        } else {
            unregisterLock(id)
        }
        return () => unregisterLock(id)
    }, [isLive, hasStarted, isComplete, registerLock, unregisterLock, id])

    const handleToggle = (optionId: string) => {
        if (showResult || isDisabled || isComplete) return
        setSelectedOptions(prev =>
            prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
        )
    }

    const handleSubmit = async () => {
        if (selectedOptions.length === 0 || showResult || isComplete) return

        const correctIds = question.options.filter(o => o.isCorrect).map(o => o.id)
        const correctSelections = selectedOptions.filter(id => correctIds.includes(id))
        const incorrectSelections = selectedOptions.filter(id => !correctIds.includes(id))
        const isPerfect = correctSelections.length === correctIds.length && incorrectSelections.length === 0
        const questionScore = isPerfect ? pointsPerQ : (correctSelections.length / correctIds.length) * pointsPerQ

        const newAnswered = [...questionsAnswered]
        newAnswered[currentQuestion] = true

        const newCorrect = [...questionsCorrect]
        newCorrect[currentQuestion] = isPerfect

        const newScores = [...(state.scores || [])]
        newScores[currentQuestion] = questionScore

        const allDone = newAnswered.every(Boolean)

        if (isPerfect) {
            await playFeedback('quizSuccess', { animation: false })
        } else {
            await playFeedback('incorrect')
        }

        setShowResult(true)
        setState(prev => ({
            ...prev,
            questionsAnswered: newAnswered,
            questionsCorrect: newCorrect,
            scores: newScores,
            isComplete: allDone,
            status: allDone ? 'completed' : 'active',
        }))

        if (allDone) {
            handlePoints(newScores.reduce((a, b) => a + b, 0))
        }
    }

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
            setSelectedOptions([])
            setShowResult(false)
        }
    }

    const handleTimeout = () => {
        if (!isComplete) {
            playFeedback('incorrect')
            setState(prev => ({
                ...prev,
                isComplete: true,
                status: 'completed',
            }))
            handleScore(false)
            handlePoints(0)
        }
    }

    // Live Start Screen
    if (isLive && !hasStarted && !isComplete) {
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                label={`Start Multi-Select Quiz (${questions.length} Questions)`}
            />
        )
    }

    if (!question) return null

    // ── Option styling ─────────────────────────────────────────────────────────
    const getOptionStyle = (option: MultiSelectOption) => {
        const isSelected = selectedOptions.includes(option.id)
        const base = `${option.color} text-white`

        if (!showResult) {
            return cn(base, isSelected ? "ring-4 ring-white/60 scale-[1.02]" : "hover:scale-[1.02] opacity-90 hover:opacity-100")
        }
        if (isSelected && option.isCorrect) return cn(base, "ring-4 ring-emerald-300")
        if (isSelected && !option.isCorrect) return cn(base, "ring-4 ring-rose-400 opacity-70")
        if (!isSelected && option.isCorrect) return cn(base, "ring-4 ring-emerald-300/60")
        return cn(base, "opacity-40")
    }

    const getCheckIndicator = (option: MultiSelectOption) => {
        const isSelected = selectedOptions.includes(option.id)

        if (!showResult) {
            return (
                <div className={cn(
                    "w-5 h-5 rounded-md border-2 border-white flex items-center justify-center transition-all",
                    isSelected ? "bg-white" : "bg-transparent"
                )}>
                    {isSelected && <Check className="w-3 h-3 text-slate-800" />}
                </div>
            )
        }

        if ((isSelected && option.isCorrect) || (!isSelected && option.isCorrect)) {
            return (
                <div className="w-5 h-5 rounded-md bg-emerald-400 border-2 border-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
            )
        }
        if (isSelected && !option.isCorrect) {
            return (
                <div className="w-5 h-5 rounded-md bg-rose-500 border-2 border-white flex items-center justify-center text-white font-black text-[10px]">
                    ✗
                </div>
            )
        }
        return <div className="w-5 h-5 rounded-md border-2 border-white/50" />
    }

    // ── Result analysis ────────────────────────────────────────────────────────
    const correctIds = question.options.filter(o => o.isCorrect).map(o => o.id)
    const correctSelections = selectedOptions.filter(id => correctIds.includes(id))
    const incorrectSelections = selectedOptions.filter(id => !correctIds.includes(id))
    const isPerfect = showResult && correctSelections.length === correctIds.length && incorrectSelections.length === 0

    return (
        <div className="flex flex-col h-full w-full overflow-hidden px-2 py-1">
            {/* Segmented Progress Bar & Live Timer */}
            <div className="shrink-0 mb-3 flex items-center justify-between">
                <div className="flex-1 mr-4">
                    <div className="flex items-center gap-1.5">
                        {questions.map((_, i) => (
                            <div key={i} className={cn(
                                "flex-1 h-1.5 rounded-full transition-all duration-500",
                                i < currentQuestion ? "bg-violet-500" : i === currentQuestion ? "bg-violet-300" : "bg-slate-200"
                            )} />
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Question {currentQuestion + 1} of {questions.length}
                    </p>
                </div>

                {isLive && (
                    <LiveTimer
                        isCompleted={isComplete}
                        duration={timeLimit}
                        onTimeout={handleTimeout}
                    />
                )}
            </div>

            {/* Question card */}
            <div className="shrink-0 mb-3 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100">
                <h2 className="text-base md:text-lg font-black text-slate-900 text-center leading-snug">{question.question}</h2>
                <p className="text-[10px] font-bold text-violet-500 text-center mt-1 uppercase tracking-widest">
                    ☑ Select all correct answers
                </p>
            </div>

            {/* Options 2×2 grid */}
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 mb-3 overflow-y-auto">
                {question.options.map(option => (
                    <button
                        key={option.id}
                        disabled={showResult || isDisabled || isComplete}
                        onClick={() => handleToggle(option.id)}
                        className={cn(
                            "relative h-16 md:h-18 px-3.5 py-2.5 rounded-xl text-left font-semibold text-xs md:text-sm leading-tight transition-all duration-200 active:scale-95",
                            getOptionStyle(option)
                        )}
                    >
                        <span className="pr-7">{option.text}</span>
                        <div className="absolute top-3 right-3">{getCheckIndicator(option)}</div>
                    </button>
                ))}
            </div>

            {/* Submit button */}
            {!showResult && (
                <div className="shrink-0 flex justify-center mb-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedOptions.length === 0 || isDisabled || isComplete}
                        className="h-11 px-10 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-md transition-all"
                    >
                        Submit Answer
                    </Button>
                </div>
            )}

            {/* Result feedback */}
            {showResult && (
                <div className={cn(
                    "shrink-0 p-4 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 duration-400 mb-3",
                    isPerfect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                )}>
                    <p className={cn(
                        "font-black text-sm text-center",
                        isPerfect ? "text-emerald-700" : "text-amber-700"
                    )}>
                        {isPerfect
                            ? "🎉 Perfect! You got every correct answer!"
                            : `You got ${correctSelections.length} out of ${correctIds.length} correct answers.`}
                    </p>
                    {question.explanation && (
                        <p className="text-xs font-medium text-slate-500 text-center mt-1">{question.explanation}</p>
                    )}
                </div>
            )}

            {/* Next question */}
            <div className="shrink-0 flex justify-center pb-1">
                <Button
                    onClick={handleNext}
                    disabled={currentQuestion >= questions.length - 1 || !showResult}
                    className="h-10 px-8 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all gap-2 shadow-md shadow-violet-500/20"
                >
                    Next Question <ChevronRight className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    )
}

// ─── Renderer wrapper ─────────────────────────────────────────────────────────

export function MultiSelectQuizRenderer(props: MultiSelectQuizRendererProps) {
    const {
        title = "Select All That Apply",
        questions = [],
        points = 15,
        timeLimit = 15,
        mode = 'practice',
        state: componentState = 'active',
        disabled = false,
        savedState,
        setComponentState,
        id = "multi-select-quiz-renderer",
        status,
        isEditing = false,
    } = props

    if (isEditing) {
        return (
            <div className="border p-4 rounded-2xl bg-white shadow-sm space-y-2">
                <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">☑ Multi-Select Quiz Preview ({mode} mode)</span>
                <p className="text-xs font-bold text-slate-500">{questions.length} question{questions.length !== 1 ? 's' : ''} · {points} pts total</p>
                {questions.slice(0, 2).map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-violet-50/50 border border-violet-100 text-xs font-bold text-slate-700">
                        {i + 1}. {q.question}
                    </div>
                ))}
            </div>
        )
    }

    const component: Component = {
        id,
        type: 'multiSelectQuiz',
        state: componentState as any,
        status: (status || (savedState as any)?.status || 'uncompleted') as any,
        props: { title, questions, points },
        mode: mode as any,
    } as Component

    const initialState: MultiSelectQuizState = {
        currentQuestion: 0,
        questionsAnswered: new Array(questions.length).fill(false),
        questionsCorrect: new Array(questions.length).fill(false),
        scores: new Array(questions.length).fill(0),
        status: 'active',
    }

    return (
        <ScoredRenderer<MultiSelectQuizState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <MultiSelectContent
                    {...renderProps}
                    id={id}
                    questions={questions}
                    points={points}
                    timeLimit={timeLimit}
                    isDisabled={disabled || component.state === 'disabled'}
                />
            )}
        />
    )
}
