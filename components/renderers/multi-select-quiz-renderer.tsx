"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, CheckCircle2, ChevronRight, RefreshCw, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { useFeedback } from "@/hooks/use-feedback"
import { FormattedText } from "@/components/ui/formatted-text"
import { ReferenceChip } from "@/components/reference/reference-chip"
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
    referenceComponentId?: string
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
    selectedOptionsByQuestion: string[][]
    showResultByQuestion: boolean[]
    status?: string
    isComplete?: boolean
    score?: number
}

// ─── Inner content ────────────────────────────────────────────────────────────

const OPTION_COLORS = ["bg-violet-500", "bg-amber-500", "bg-sky-500", "bg-rose-500"]

function MultiSelectContent({
    state,
    setState,
    handleScore,
    handlePoints,
    handleRetry,
    recordAttempt,
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

    const { currentQuestion, questionsAnswered, questionsCorrect, selectedOptionsByQuestion, showResultByQuestion } = state

    const selectedOptions = selectedOptionsByQuestion[currentQuestion] ?? []
    const showResult = showResultByQuestion[currentQuestion] ?? false

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
        void playFeedback("click", { sound: true, animation: false })
        setState(prev => {
            const current = prev.selectedOptionsByQuestion[prev.currentQuestion] ?? []
            const next = current.includes(optionId)
                ? current.filter(id => id !== optionId)
                : [...current, optionId]
            const nextSelections = [...prev.selectedOptionsByQuestion]
            nextSelections[prev.currentQuestion] = next
            return { ...prev, selectedOptionsByQuestion: nextSelections }
        })
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

        if (isPerfect) {
            await playFeedback('quizSuccess')
        } else {
            await playFeedback('incorrect')
        }

        const allDone = currentQuestion === questions.length - 1
        const running = newScores.reduce((a, b) => a + b, 0)
        handlePoints(running)

        setState(prev => {
            const nextShowResult = [...prev.showResultByQuestion]
            nextShowResult[currentQuestion] = true
            return {
                ...prev,
                questionsAnswered: newAnswered,
                questionsCorrect: newCorrect,
                scores: newScores,
                showResultByQuestion: nextShowResult,
                isComplete: allDone,
                status: allDone ? 'completed' : 'active',
                score: newScores.reduce((a, b) => a + b, 0),
            }
        })

        if (allDone) {
            recordAttempt(newCorrect.every(Boolean), running, pointsPerQ * questions.length)
        }
    }

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
        }
    }

    const handleReset = () => {
        handleRetry()
        setState({
            currentQuestion: 0,
            questionsAnswered: questions.map(() => false),
            questionsCorrect: questions.map(() => false),
            scores: questions.map(() => 0),
            selectedOptionsByQuestion: questions.map(() => []),
            showResultByQuestion: questions.map(() => false),
            isComplete: false,
            status: 'active',
        })
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
                label={`Start Multi-Select Quiz (${questions.length} Questions)`}
            />
        )
    }

    if (!question) return null

    // ── Result analysis ────────────────────────────────────────────────────────
    const correctIds = question.options.filter(o => o.isCorrect).map(o => o.id)
    const correctSelections = selectedOptions.filter(id => correctIds.includes(id))
    const incorrectSelections = selectedOptions.filter(id => !correctIds.includes(id))
    const isPerfect = showResult && correctSelections.length === correctIds.length && incorrectSelections.length === 0

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-2">
            {/* TOP SECTION: Meta & Title */}
            <div className="shrink-0 space-y-3 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-violet-600/60 uppercase tracking-[0.2em]">Activity</span>
                        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none">Multi-Select Quiz</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLive && (
                            <LiveTimer
                                isCompleted={isComplete}
                                duration={timeLimit}
                                onTimeout={handleTimeout}
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quiz Progress</span>
                        <span className="text-[8px] font-black text-violet-600 uppercase tracking-tighter">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-violet-50 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-500 ease-out"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* CENTER SECTION: Question + Options (Full Canvas Width) */}
            <div className="flex-1 min-h-0 flex flex-col justify-start md:justify-center py-3 md:py-4 w-full">
                <div className="relative space-y-4 my-auto w-full">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-violet-500 rounded-full" />
                            <span className="text-[9px] font-black text-violet-600 uppercase tracking-[0.2em]">Question {currentQuestion + 1} / {questions.length} · Select all correct</span>
                        </div>
                        <FormattedText content={question.question} as="h2" className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight" />
                        <ReferenceChip referenceId={question.referenceComponentId} questionId={question.id} sourceId={id} mode={isLive ? 'live' : 'practice'} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                        {question.options.map((option, idx) => {
                            const isSelected = selectedOptions.includes(option.id)
                            const isCorrectOpt = option.isCorrect
                            const showCorrect = showResult && isCorrectOpt && (isLive || isSelected)
                            const showIncorrect = showResult && isSelected && !isCorrectOpt

                            return (
                                <button
                                    key={option.id}
                                    disabled={showResult || isDisabled || isComplete}
                                    onClick={() => handleToggle(option.id)}
                                    className={cn(
                                        'group/opt w-full p-4 text-left transition-all duration-200 relative rounded-2xl border-2 shadow-sm',
                                        'border-b-4 active:border-b-0 active:translate-y-[2px]',
                                        isSelected && !showResult && 'border-[#1CB0F6] bg-[#1CB0F6]/10 border-b-[#0090CC] text-[#0070A3] dark:text-[#38BDF8] font-black',
                                        !isSelected && !showResult && 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5 hover:shadow-md cursor-pointer',
                                        showCorrect && isSelected && 'bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg font-black',
                                        showCorrect && !isSelected && 'bg-emerald-100 dark:bg-emerald-950 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 dark:text-emerald-200 font-extrabold shadow-sm',
                                        showIncorrect && 'bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B] font-black',
                                        showResult && !isSelected && !isCorrectOpt && 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                    )}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3.5">
                                            {/* Circular Checkbox Indicator */}
                                            <span className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 border-b-4 transition-colors shrink-0",
                                                isSelected && !showResult ? "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC]" :
                                                    showCorrect && isSelected ? "bg-white text-[#58CC02] border-white border-b-slate-200" :
                                                        showCorrect && !isSelected ? "bg-[#58CC02] text-white border-[#58CC02] border-b-[#3B8C00]" :
                                                            showIncorrect ? "bg-[#FF4B4B] text-white border-[#FF4B4B] border-b-[#CC3C3C]" :
                                                                "bg-slate-100 dark:bg-slate-800 text-transparent border-slate-300 dark:border-slate-700 border-b-slate-400 group-hover/opt:border-[#1CB0F6]"
                                            )}>
                                                {(isSelected || showCorrect) && !showIncorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                {showIncorrect && <span className="font-black text-xs">✕</span>}
                                            </span>
                                            <FormattedText content={option.text} className="font-bold text-sm tracking-tight text-inherit" />
                                        </div>
                                        {showCorrect && isSelected && <CheckCircle2 className="w-5 h-5 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                        {showCorrect && !isSelected && <CheckCircle2 className="w-5 h-5 text-[#58CC02] stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                        {showIncorrect && <XCircle className="w-5 h-5 text-[#FF4B4B] stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: Reserved Footer Height to Prevent Layout Jump */}
            <div className="shrink-0 space-y-3 pb-4 pt-1 min-h-[56px] flex flex-col justify-center items-center">
                {showResult && (
                    <div className={cn(
                        'p-3.5 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm w-full max-w-md text-center',
                        isPerfect
                            ? 'bg-emerald-50/50 border-emerald-500/20'
                            : 'bg-amber-50/50 border-amber-400/20'
                    )}>
                        {isPerfect ? (
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Perfect score!</span>
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 italic">You got every correct answer!</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
                                    {correctSelections.length} of {correctIds.length} correct
                                </span>
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100">Not bad — keep going!</p>
                            </div>
                        )}
                        {question.explanation && (isPerfect || isLive) && (
                            <FormattedText content={question.explanation} as="p" className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1" />
                        )}
                    </div>
                )}

                <div className="flex items-center justify-center">
                    {currentQuestion < questions.length - 1 || !showResult ? (
                        <button
                            type="button"
                            onClick={showResult ? handleNext : handleSubmit}
                            disabled={!showResult && (selectedOptions.length === 0 || isDisabled || isComplete)}
                            className={cn(
                                'px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border-b-4 active:border-b-0 active:translate-y-[2px] shadow-md cursor-pointer',
                                showResult
                                    ? 'bg-[#1CB0F6] text-white hover:bg-sky-500 border-[#0090CC]'
                                    : selectedOptions.length > 0
                                        ? 'bg-[#58CC02] text-white hover:bg-[#46a302] border-[#3B8C00]'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 border-b-slate-300 shadow-none cursor-not-allowed'
                            )}
                        >
                            {showResult
                                ? (currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz')
                                : 'Check Answer'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Retry Quiz</span>
                        </button>
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
            <div className="border p-4 rounded-2xl bg-white text-slate-900 shadow-sm space-y-2">
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

    const baseInitialState: MultiSelectQuizState = {
        currentQuestion: 0,
        questionsAnswered: new Array(questions.length).fill(false),
        questionsCorrect: new Array(questions.length).fill(false),
        scores: new Array(questions.length).fill(0),
        selectedOptionsByQuestion: new Array(questions.length).fill(null).map(() => []),
        showResultByQuestion: new Array(questions.length).fill(false),
        status: 'active',
    }

    const mergedSavedState = savedState
        ? {
            ...baseInitialState,
            ...savedState,
            selectedOptionsByQuestion:
                savedState.selectedOptionsByQuestion ??
                baseInitialState.selectedOptionsByQuestion,
            showResultByQuestion:
                savedState.showResultByQuestion ??
                baseInitialState.showResultByQuestion,
        }
        : undefined

    return (
        <ScoredRenderer<MultiSelectQuizState>
            component={component}
            initialState={baseInitialState}
            savedState={mergedSavedState}
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
