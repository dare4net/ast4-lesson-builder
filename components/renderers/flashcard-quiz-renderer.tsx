"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { useFeedback } from "@/hooks/use-feedback"
import { FormattedText } from "@/components/ui/formatted-text"
import { ReferenceChip } from "@/components/reference/reference-chip"
import { playFlashcardFlipForward } from "@/lib/sound-effects"
import { shouldRevealAnswer } from "@/lib/reveal"
import type { Component } from "@/types/lesson"

interface FlashcardQuizQuestion {
    id?: string
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
    referenceComponentId?: string
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
    score?: number
}

// ─── Inner content component ─────────────────────────────────────────────────

function FlashcardQuizContent({
    state,
    setState,
    handleScore,
    handlePoints,
    handleRetry,
    recordAttempt,
    isDisabled,
    isLive,
    mode,
    id,
    questions,
    points,
    timeLimit = 15,
    initialState,
}: ScoredRenderProps<FlashcardQuizState> & {
    isDisabled: boolean
    isLive: boolean
    id: string
    questions: FlashcardQuizQuestion[]
    points: number
    timeLimit?: number
    initialState: FlashcardQuizState
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

    const flipTimers = useRef<number[]>([])

    useEffect(() => () => {
        flipTimers.current.forEach((id) => window.clearTimeout(id))
    }, [])

    const flipOptionsSequentially = useCallback(() => {
        if (!question) return
        flipTimers.current.forEach((id) => window.clearTimeout(id))
        flipTimers.current = []
        const newFlippedOptions: boolean[] = []
        question.options.forEach((_, index) => {
            const id = window.setTimeout(() => {
                newFlippedOptions[index] = true
                setFlippedOptions([...newFlippedOptions])
                playFlashcardFlipForward()
                if (index === question.options.length - 1) {
                    const doneId = window.setTimeout(() => setAllOptionsFlipped(true), 300)
                    flipTimers.current.push(doneId)
                }
            }, index * 200)
            flipTimers.current.push(id)
        })
    }, [question])

    const handleMainCardClick = () => {
        if (isDisabled || isMainFlipped || isComplete) return
        playFlashcardFlipForward()
        setIsMainFlipped(true)
        const id = window.setTimeout(() => flipOptionsSequentially(), 600)
        flipTimers.current.push(id)
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
            score: newScores.reduce((a, b) => a + b, 0),
        }))

        if (allDone) {
            const total = newScores.reduce((a, b) => a + b, 0)
            handlePoints(total)
            recordAttempt(newCorrect.every(Boolean), total, points)
        }
    }

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
        }
    }

    const onLocalRetry = () => {
        handleRetry()
        setState({ ...initialState })
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
            recordAttempt(false)
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
    const revealAnswers = shouldRevealAnswer(mode)
    const lastQuestion = currentQuestion === questions.length - 1

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-2">
            <div className="shrink-0 space-y-3 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Activity</span>
                        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none">Flashcard Quiz</h3>
                    </div>
                    {isLive && (
                        <LiveTimer isCompleted={isComplete} duration={timeLimit} onTimeout={handleTimeout} />
                    )}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quiz Progress</span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex-1 h-2 rounded-full border-b-2 transition-all duration-500',
                                    i < currentQuestion
                                        ? 'bg-[#58CC02] border-b-[#3B8C00]'
                                        : i === currentQuestion
                                            ? 'bg-[#1CB0F6] border-b-[#0090CC]'
                                            : 'bg-slate-200 border-b-slate-300 dark:bg-slate-800 dark:border-b-slate-700'
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col justify-start md:justify-center py-3 md:py-4 w-full max-w-2xl mx-auto gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="h-px w-8 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Question {currentQuestion + 1} / {questions.length}</span>
                    </div>
                </div>

                <div
                    className={cn(
                        'relative w-full min-h-[140px] sm:min-h-[160px] select-none',
                        (isMainFlipped || isComplete) ? 'cursor-default' : 'cursor-pointer'
                    )}
                    style={{ perspective: '1200px' }}
                    onClick={handleMainCardClick}
                >
                    <div
                        className="relative w-full h-full min-h-[140px] sm:min-h-[160px]"
                        style={{
                            transformStyle: 'preserve-3d',
                            transition: 'transform 600ms ease',
                            transform: isMainFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                    >
                        <div
                            className="absolute inset-0 rounded-2xl border-2 border-b-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2 p-4 shadow-sm"
                            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        >
                            <span className="text-5xl font-black text-slate-200 leading-none">?</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tap to flip</span>
                        </div>
                        <div
                            className="absolute inset-0 rounded-2xl border-2 border-b-4 border-[#1CB0F6] border-b-[#0090CC] bg-[#1CB0F6]/5 flex flex-col items-center justify-center p-5 sm:p-6 gap-3"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <FormattedText content={question.question} as="h2" className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight text-center" />
                            <ReferenceChip referenceId={question.referenceComponentId} questionId={question.id} sourceId={id} mode={mode} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                    {question.options.map((option, index) => {
                        const picked = selectedOption === index
                        const isRightAnswer = index === question.correctAnswer
                        const showCorrect = showResult && ((picked && isCorrect) || (!picked && isRightAnswer && revealAnswers))
                        const showIncorrect = showResult && picked && !isCorrect
                        return (
                            <button
                                key={index}
                                type="button"
                                className={cn(
                                    'relative min-h-[72px] select-none',
                                    allOptionsFlipped && selectedOption === null && !isComplete && 'cursor-pointer',
                                    (selectedOption !== null || isComplete) && 'cursor-default'
                                )}
                                style={{ perspective: '1000px' }}
                                onClick={() => handleOptionSelect(index)}
                                disabled={!allOptionsFlipped || selectedOption !== null || isDisabled || isComplete}
                            >
                                <div
                                    className="relative w-full h-full min-h-[72px]"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transition: 'transform 500ms ease',
                                        transform: flippedOptions[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 rounded-2xl border-2 border-b-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm"
                                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                    >
                                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 bg-slate-50 text-slate-400 border-slate-200">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                    </div>
                                    <div
                                        className={cn(
                                            'absolute inset-0 rounded-2xl border-2 border-b-4 p-4 flex items-center justify-between gap-3 text-left shadow-sm',
                                            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
                                            !showResult && allOptionsFlipped && 'hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5',
                                            picked && !showResult && 'border-[#1CB0F6] bg-[#1CB0F6]/5 border-b-[#0090CC]',
                                            showCorrect && 'bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg',
                                            showIncorrect && 'bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]'
                                        )}
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            WebkitBackfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                        }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={cn(
                                                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 shrink-0',
                                                picked && !showResult ? 'bg-[#1CB0F6] text-white border-[#1CB0F6]' : 'bg-slate-50 text-slate-400 border-slate-200',
                                                showCorrect && 'bg-white/30 text-white border-white/30',
                                                showIncorrect && 'bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/30'
                                            )}>
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <FormattedText content={option} as="p" className="font-bold text-sm tracking-tight leading-snug line-clamp-3 break-words text-inherit" />
                                        </div>
                                        {showCorrect && <CheckCircle2 className="w-5 h-5 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                        {showIncorrect && <XCircle className="w-5 h-5 text-[#FF4B4B] stroke-[3] shrink-0" />}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="shrink-0 space-y-3 pb-4 pt-1 max-w-2xl mx-auto w-full">
                <div className="min-h-[52px] flex flex-col justify-end">
                    {showResult && (
                        <div
                            className={cn(
                                'p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm',
                                isCorrect ? 'bg-emerald-50/50 border-emerald-500/20 shadow-emerald-500/5' : 'bg-rose-50/50 border-rose-500/20 shadow-rose-500/5'
                            )}
                        >
                            {lastQuestion && isCorrect ? (
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Great Job!</span>
                                    <p className="text-sm font-black text-slate-900 italic line-clamp-2">You finished the quiz! Keep it up!</p>
                                </div>
                            ) : (
                                <>
                                    <span className={cn('text-[8px] font-black uppercase tracking-widest', isCorrect ? 'text-emerald-600' : 'text-rose-500')}>
                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 leading-tight mt-1">
                                        {isCorrect ? 'Correct! Well done!' : 'Not quite right — keep going, you can do it!'}
                                    </p>
                                    {!isCorrect && revealAnswers && (
                                        <p className="text-xs font-bold text-slate-600 mt-1">
                                            Answer: <span className="font-black">{question.options[question.correctAnswer]}</span>
                                        </p>
                                    )}
                                    {question.explanation && (isCorrect || revealAnswers) && (
                                        <FormattedText content={question.explanation} as="p" className="text-xs font-bold text-slate-600 leading-tight mt-1" />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
                {showResult && currentQuestion < questions.length - 1 && (
                    <Button
                        onClick={handleNext}
                        className="h-12 w-full rounded-2xl font-black uppercase text-xs tracking-[0.15em] bg-[#1CB0F6] text-white border-b-4 border-[#0090CC] hover:bg-sky-500 active:border-b-0 active:translate-y-[2px] shadow-md shadow-sky-500/20"
                    >
                        Next Question
                    </Button>
                )}
                {showResult && lastQuestion && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-100 shadow-lg shadow-emerald-500/20"
                            disabled
                        >
                            Quiz Completed
                        </Button>
                        {!isLive && (
                            <Button
                                className="h-11 w-full rounded-xl bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95"
                                onClick={onLocalRetry}
                            >
                                Retry
                            </Button>
                        )}
                    </div>
                )}
            </div>
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
                    initialState={initialState}
                    isDisabled={disabled || component.state === 'disabled'}
                />
            )}
        />
    )
}
