"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { useFeedback } from "@/hooks/use-feedback"
import type { Component } from "@/types/lesson"

interface FlashcardQuizQuestion {
    id?: string
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
}

interface FlashcardQuizRendererProps {
    questions?: FlashcardQuizQuestion[]
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

type FlashcardQuizState = {
    currentQuestion: number
    questionsAnswered: boolean[]
    questionsCorrect: boolean[]
    selectedAnswers: number[]
    scores: number[]
    status?: string
    isComplete?: boolean
}

// ─── Inner content component ─────────────────────────────────────────────────

function FlashcardQuizContent({
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
}: ScoredRenderProps<FlashcardQuizState> & {
    isDisabled: boolean
    isLive: boolean
    id: string
    questions: FlashcardQuizQuestion[]
    points: number
    timeLimit?: number
}) {
    const { playFeedback } = useFeedback()
    const { registerLock, unregisterLock } = useNavigationLock()
    const [hasStarted, setHasStarted] = useState(false)

    const { currentQuestion, questionsAnswered, questionsCorrect, selectedAnswers } = state

    const [isMainFlipped, setIsMainFlipped] = useState(false)
    const [flippedOptions, setFlippedOptions] = useState<boolean[]>([])
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [allOptionsFlipped, setAllOptionsFlipped] = useState(false)

    const question = questions[currentQuestion]
    const pointsPerQuestion = questions.length > 0 ? points / questions.length : 0
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

    // When question index changes, restore or reset local flip state
    useEffect(() => {
        if (!question) return
        if (questionsAnswered[currentQuestion]) {
            setSelectedOption(selectedAnswers[currentQuestion])
            setShowResult(true)
            setIsMainFlipped(true)
            setFlippedOptions(new Array(question.options.length).fill(true))
            setAllOptionsFlipped(true)
        } else {
            setIsMainFlipped(false)
            setFlippedOptions([])
            setSelectedOption(null)
            setShowResult(false)
            setAllOptionsFlipped(false)
        }
    }, [currentQuestion])

    const flipOptionsSequentially = useCallback(() => {
        if (!question) return
        const newFlippedOptions: boolean[] = []
        question.options.forEach((_, index) => {
            setTimeout(() => {
                newFlippedOptions[index] = true
                setFlippedOptions([...newFlippedOptions])
                if (index === question.options.length - 1) {
                    setTimeout(() => setAllOptionsFlipped(true), 300)
                }
            }, index * 200)
        })
    }, [question])

    const handleMainCardClick = () => {
        if (isDisabled || isMainFlipped || isComplete) return
        setIsMainFlipped(true)
        setTimeout(() => flipOptionsSequentially(), 600)
    }

    const handleOptionSelect = async (optionIndex: number) => {
        if (!allOptionsFlipped || selectedOption !== null || isDisabled || isComplete) return

        const isCorrect = optionIndex === question.correctAnswer
        const questionScore = isCorrect ? pointsPerQuestion : 0

        setSelectedOption(optionIndex)
        setShowResult(true)

        const newAnswered = [...questionsAnswered]
        newAnswered[currentQuestion] = true

        const newCorrect = [...questionsCorrect]
        newCorrect[currentQuestion] = isCorrect

        const newSelectedAnswers = [...selectedAnswers]
        newSelectedAnswers[currentQuestion] = optionIndex

        const newScores = [...(state.scores || [])]
        newScores[currentQuestion] = questionScore

        const allDone = newAnswered.every(Boolean)

        if (isCorrect) {
            await playFeedback('quizSuccess', { animation: false })
        } else {
            await playFeedback('incorrect')
        }

        setState(prev => ({
            ...prev,
            questionsAnswered: newAnswered,
            questionsCorrect: newCorrect,
            selectedAnswers: newSelectedAnswers,
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
                label={`Start Flashcard Quiz (${questions.length} Questions)`}
            />
        )
    }

    if (!question) return null
    const isCorrect = selectedOption !== null && selectedOption === question.correctAnswer

    return (
        <div className="flex flex-col h-full w-full overflow-hidden px-4 py-2">
            {/* Live Timer or Segmented Progress Bar */}
            <div className="mb-3 shrink-0 flex items-center justify-between">
                <div className="flex-1 mr-4">
                    <div className="flex items-center gap-1.5">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 h-1.5 rounded-full transition-all duration-500",
                                    i < currentQuestion
                                        ? "bg-indigo-500"
                                        : i === currentQuestion
                                            ? "bg-indigo-300"
                                            : "bg-slate-200"
                                )}
                            />
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

            {/* Main content area */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-between gap-2 overflow-hidden py-1">
                {/* Main question card */}
                <div
                    className={cn(
                        "relative w-full max-w-xs h-28 md:h-32 cursor-pointer select-none shrink-0 my-auto",
                        (isMainFlipped || isComplete) && "cursor-default"
                    )}
                    onClick={handleMainCardClick}
                >
                    <div
                        className={cn(
                            "absolute inset-0 w-full h-full transition-transform duration-[600ms]",
                            "[transform-style:preserve-3d]",
                            isMainFlipped && "[transform:rotateY(180deg)]"
                        )}
                    >
                        {/* Front — mystery ? */}
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-2xl border-2 border-slate-200 shadow-md flex flex-col items-center justify-center gap-0.5">
                            <span className="text-4xl text-slate-300 font-black leading-none">?</span>
                            <span className="text-[10px] font-bold text-slate-400">Click to flip</span>
                        </div>
                        {/* Back — question text */}
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center p-3">
                            <p className="text-white text-sm md:text-base font-bold text-center leading-snug">{question.question}</p>
                        </div>
                    </div>
                </div>

                {/* Options 2×2 grid */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs shrink-0">
                    {question.options.map((option, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative h-12 md:h-13 cursor-pointer select-none transition-all duration-200",
                                allOptionsFlipped && selectedOption === null && !isComplete && "hover:scale-[1.02]",
                                selectedOption === index
                                    ? isCorrect
                                        ? "ring-4 ring-emerald-400 rounded-xl"
                                        : "ring-4 ring-rose-400 rounded-xl"
                                    : ""
                            )}
                            onClick={() => handleOptionSelect(index)}
                        >
                            <div
                                className={cn(
                                    "absolute inset-0 w-full h-full transition-transform duration-500",
                                    "[transform-style:preserve-3d]",
                                    flippedOptions[index] && "[transform:rotateY(180deg)]"
                                )}
                            >
                                {/* Front — mystery ? */}
                                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-xl border-2 border-slate-200 shadow-sm flex items-center justify-center">
                                    <span className="text-xl text-slate-300 font-black">?</span>
                                </div>
                                {/* Back — option text */}
                                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-sm flex items-center justify-center p-2">
                                    <p className="text-white font-semibold text-center text-xs leading-tight">{option}</p>
                                </div>
                            </div>

                            {/* ✓ / ✗ badge on selected option */}
                            {showResult && selectedOption === index && (
                                <div className={cn(
                                    "absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-md z-10",
                                    isCorrect ? "bg-emerald-500" : "bg-rose-500"
                                )}>
                                    {isCorrect ? "✓" : "✗"}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Result banner */}
                {showResult && (
                    <div className={cn(
                        "w-full max-w-xs rounded-xl px-3 py-1.5 text-center animate-in fade-in slide-in-from-bottom-2 duration-400 shrink-0",
                        isCorrect ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"
                    )}>
                        <p className="font-black text-xs">{isCorrect ? "Correct! 🎉" : "Incorrect!"}</p>
                        {!isCorrect && (
                            <p className="text-[10px] font-medium mt-0.5">
                                Correct: <span className="font-black">{question.options[question.correctAnswer]}</span>
                            </p>
                        )}
                        {question.explanation && (
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">{question.explanation}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Next button */}
            {showResult && currentQuestion < questions.length - 1 && (
                <div className="shrink-0 flex justify-center py-1">
                    <Button
                        onClick={handleNext}
                        className="px-6 h-9 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-500/20"
                    >
                        Next Question →
                    </Button>
                </div>
            )}
        </div>
    )
}

// ─── Renderer wrapper ─────────────────────────────────────────────────────────

export function FlashcardQuizRenderer(props: FlashcardQuizRendererProps) {
    const {
        questions = [],
        points = 20,
        timeLimit = 15,
        mode = 'practice',
        state: componentState = 'active',
        disabled = false,
        savedState,
        setComponentState,
        id = "flashcard-quiz-renderer",
        status,
        isEditing = false,
    } = props

    // Editing preview
    if (isEditing) {
        return (
            <div className="border p-4 rounded-2xl bg-white shadow-sm space-y-2">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Flashcard Quiz Preview ({mode} mode)</span>
                <p className="text-xs font-bold text-slate-500">{questions.length} question{questions.length !== 1 ? 's' : ''} · {points} pts total</p>
                {questions.slice(0, 2).map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs font-bold text-slate-700">
                        {i + 1}. {q.question}
                    </div>
                ))}
                {questions.length > 2 && (
                    <p className="text-[10px] font-bold text-slate-400 ml-1">+{questions.length - 2} more…</p>
                )}
            </div>
        )
    }

    const component: Component = {
        id,
        type: 'flashcardQuiz',
        state: componentState as any,
        status: (status || (savedState as any)?.status || 'uncompleted') as any,
        props: { questions, points },
        mode: mode as any
    } as Component

    const initialState: FlashcardQuizState = {
        currentQuestion: 0,
        questionsAnswered: new Array(questions.length).fill(false),
        questionsCorrect: new Array(questions.length).fill(false),
        selectedAnswers: new Array(questions.length).fill(-1),
        scores: new Array(questions.length).fill(0),
        status: 'active',
    }

    return (
        <ScoredRenderer<FlashcardQuizState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <FlashcardQuizContent
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
