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

const OPTION_COLORS = ["bg-violet-500", "bg-amber-500", "bg-sky-500", "bg-rose-500"]

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

    // Normalize options: inject OPTION_COLORS for any option missing a color (e.g. JSON-authored lessons)
    const normalizedQuestions = questions.map((q) => ({
        ...q,
        options: q.options.map((opt, i) => ({
            ...opt,
            color: opt.color || OPTION_COLORS[i % OPTION_COLORS.length],
        })),
    }))

    const { currentQuestion, questionsAnswered, questionsCorrect } = state
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [showResult, setShowResult] = useState(false)

    const question = normalizedQuestions[currentQuestion]
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

        if (!showResult) {
            return isSelected
                ? "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-[1.02]"
                : "bg-white hover:bg-violet-50/50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-violet-300"
        }
        if (isSelected && option.isCorrect) return "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950"
        if (isSelected && !option.isCorrect) return "bg-rose-50 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950 opacity-80"
        if (!isSelected && option.isCorrect) return "bg-emerald-50/60 border-emerald-300 border-b-emerald-400 text-emerald-900"
        return "bg-slate-50 border-slate-200 border-b-slate-200 text-slate-400 opacity-50"
    }

    const getCheckIndicator = (option: MultiSelectOption) => {
        const isSelected = selectedOptions.includes(option.id)

        if (!showResult) {
            return (
                <div className={cn(
                    "w-6 h-6 rounded-lg border-2 border-b-4 flex items-center justify-center transition-all shadow-sm",
                    isSelected
                        ? "bg-white border-white border-b-slate-200 text-[#1CB0F6]"
                        : "bg-slate-50 border-slate-200 border-b-slate-300 text-transparent"
                )}>
                    <Check className={cn("w-3.5 h-3.5 stroke-[3]", isSelected ? "text-[#1CB0F6]" : "text-transparent")} />
                </div>
            )
        }

        if ((isSelected && option.isCorrect) || (!isSelected && option.isCorrect)) {
            return (
                <div className="w-6 h-6 rounded-lg bg-[#58CC02] border-2 border-[#58CC02] border-b-[#3B8C00] flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
            )
        }
        if (isSelected && !option.isCorrect) {
            return (
                <div className="w-6 h-6 rounded-lg bg-[#FF4B4B] border-2 border-[#FF4B4B] border-b-[#CC3C3C] flex items-center justify-center text-white font-black text-xs shadow-sm">
                    ✕
                </div>
            )
        }
        return <div className="w-6 h-6 rounded-lg border-2 border-slate-200 border-b-slate-300 bg-slate-100" />
    }

    // ── Result analysis ────────────────────────────────────────────────────────
    const correctIds = question.options.filter(o => o.isCorrect).map(o => o.id)
    const correctSelections = selectedOptions.filter(id => correctIds.includes(id))
    const incorrectSelections = selectedOptions.filter(id => !correctIds.includes(id))
    const isPerfect = showResult && correctSelections.length === correctIds.length && incorrectSelections.length === 0

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 overflow-hidden">
                {/* Segmented Progress Bar & Header */}
                <div className="shrink-0 mb-6 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                            {questions.map((_, i) => (
                                <div key={i} className={cn(
                                    "flex-1 h-2 rounded-full transition-all duration-500",
                                    i < currentQuestion ? "bg-[#58CC02]" : i === currentQuestion ? "bg-[#1CB0F6]" : "bg-slate-200"
                                )} />
                            ))}
                        </div>
                        <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mt-2">
                            Multi-Select Quiz • Question {currentQuestion + 1} of {questions.length}
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

                {/* Main content wrapper */}
                <div className="flex flex-col items-center gap-5 w-full">
                    {/* Question Card */}
                    <div className="w-full p-5 sm:p-6 rounded-2xl bg-violet-50/60 border-2 border-violet-100 border-b-4 text-center flex flex-col items-center justify-center space-y-1">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug tracking-tight">{question.question}</h2>
                        <p className="text-[10px] sm:text-xs font-black text-violet-600 uppercase tracking-wider">
                            ☑ Select all correct answers
                        </p>
                    </div>

                    {/* Options 2-column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                        {question.options.map(option => (
                            <button
                                key={option.id}
                                disabled={showResult || isDisabled || isComplete}
                                onClick={() => handleToggle(option.id)}
                                className={cn(
                                    "relative w-full p-4 sm:p-5 rounded-2xl border-2 border-b-4 text-left font-black text-sm leading-snug transition-all duration-200 active:border-b-2 active:translate-y-[2px] flex items-center justify-between shadow-sm cursor-pointer",
                                    getOptionStyle(option)
                                )}
                            >
                                <span className="pr-3 text-sm font-black leading-snug line-clamp-3">{option.text}</span>
                                <div className="shrink-0">{getCheckIndicator(option)}</div>
                            </button>
                        ))}
                    </div>

                    {/* Submit Button */}
                    {!showResult && (
                        <div className="w-full flex justify-center pt-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={selectedOptions.length === 0 || isDisabled || isComplete}
                                className={cn(
                                    "w-full sm:w-auto h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all duration-200 border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                                    selectedOptions.length > 0
                                        ? "bg-[#58CC02] hover:bg-[#46a302] text-white border-[#58CC02] border-b-[#3B8C00] shadow-emerald-500/20 cursor-pointer"
                                        : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200 cursor-not-allowed"
                                )}
                            >
                                Submit Answer
                            </button>
                        </div>
                    )}

                    {/* Result Feedback Card */}
                    {showResult && (
                        <div className={cn(
                            "w-full p-4 sm:p-5 rounded-2xl border-2 border-b-4 text-center shadow-sm space-y-1 animate-in fade-in duration-300",
                            isPerfect ? "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00]" : "bg-amber-50 border-[#FFC800] border-b-amber-600"
                        )}>
                            <p className={cn(
                                "font-black text-sm uppercase tracking-wider",
                                isPerfect ? "text-emerald-950" : "text-amber-950"
                            )}>
                                {isPerfect
                                    ? "🎉 Perfect! You got every correct answer!"
                                    : `You got ${correctSelections.length} out of ${correctIds.length} correct answers.`}
                            </p>
                            {question.explanation && (
                                <p className="text-xs font-bold text-slate-700 mt-1">{question.explanation}</p>
                            )}
                        </div>
                    )}

                    {/* Next Question Button */}
                    {showResult && currentQuestion < questions.length - 1 && (
                        <div className="w-full flex justify-center pt-2">
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full sm:w-auto h-12 px-10 rounded-2xl bg-[#1CB0F6] hover:bg-[#169ad8] text-white border-2 border-[#1CB0F6] border-b-4 border-b-[#0090CC] font-black text-xs uppercase tracking-[0.15em] transition-all active:border-b-0 active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer shadow-sky-500/20"
                            >
                                <span>Next Question</span>
                                <ChevronRight className="w-4 h-4 stroke-[3]" />
                            </button>
                        </div>
                    )}
                </div>
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
