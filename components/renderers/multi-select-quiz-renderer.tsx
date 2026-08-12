"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, CheckCircle2, ChevronRight, XCircle } from "lucide-react"
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
        <div className="w-full h-full flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 px-6">
            {/* TOP SECTION: Meta & Title */}
            <div className="shrink-0 space-y-3 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-violet-600/60 uppercase tracking-[0.2em]">Activity</span>
                        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">Multi-Select Quiz</h3>
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
                    <div className="h-1.5 w-full bg-violet-50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-500 ease-out"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* CENTER SECTION: Question + Options */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-2">
                <div className="relative space-y-3 my-auto">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-violet-500 rounded-full" />
                            <span className="text-[8px] font-black text-violet-600 uppercase tracking-[0.2em]">Question {currentQuestion + 1} / {questions.length} · Select all correct</span>
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">{question.question}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {question.options.map((option, idx) => {
                            const isSelected = selectedOptions.includes(option.id)
                            const isCorrectOpt = option.isCorrect
                            const showCorrect = showResult && isCorrectOpt
                            const showIncorrect = showResult && isSelected && !isCorrectOpt

                            return (
                                <button
                                    key={option.id}
                                    disabled={showResult || isDisabled || isComplete}
                                    onClick={() => handleToggle(option.id)}
                                    className={cn(
                                        'group/opt w-full p-3.5 text-left transition-all duration-200 relative rounded-2xl border-2 bg-white shadow-sm overflow-hidden',
                                        'border-b-4 active:border-b-0 active:translate-y-[2px]',
                                        isSelected && !showResult && 'border-[#1CB0F6] bg-[#1CB0F6]/5 border-b-[#0090CC]',
                                        !isSelected && !showResult && 'border-slate-200 hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5 hover:shadow-md cursor-pointer',
                                        showCorrect && 'bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg',
                                        showIncorrect && 'bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]',
                                        showResult && !isSelected && !isCorrectOpt && 'opacity-40 cursor-not-allowed',
                                        showResult && !isSelected && isCorrectOpt && 'border-[#58CC02] bg-[#58CC02]/10 cursor-not-allowed'
                                    )}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors shrink-0",
                                                isSelected && !showResult ? "bg-[#1CB0F6] text-white border-[#1CB0F6]" :
                                                    showCorrect ? "bg-white/30 text-white border-white/30" :
                                                        showIncorrect ? "bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/30" :
                                                            "bg-slate-50 text-slate-400 border-slate-200 group-hover/opt:border-[#1CB0F6]/50 group-hover/opt:text-[#1CB0F6]"
                                            )}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="font-bold text-sm tracking-tight">{option.text}</span>
                                        </div>
                                        {showCorrect && <CheckCircle2 className="w-5 h-5 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                        {showIncorrect && <XCircle className="w-5 h-5 text-[#FF4B4B] stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: Jump-proof feedback slot + action button */}
            <div className="shrink-0 space-y-3 pb-4 pt-1">
                <div className="min-h-[52px] flex flex-col justify-end">
                    {showResult && (
                        <div className={cn(
                            'p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm',
                            isPerfect
                                ? 'bg-emerald-50/50 border-emerald-500/20 shadow-emerald-500/5'
                                : 'bg-amber-50/50 border-amber-400/20 shadow-amber-500/5'
                        )}>
                            {isPerfect ? (
                                <>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Perfect score!</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900 leading-tight italic">You got every correct answer!</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
                                            {correctSelections.length} of {correctIds.length} correct
                                        </span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900 leading-tight">Not bad — keep going!</p>
                                </>
                            )}
                            {question.explanation && (
                                <p className="text-xs font-bold text-slate-600 leading-tight mt-1">{question.explanation}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-full">
                    {currentQuestion < questions.length - 1 || !showResult ? (
                        <button
                            type="button"
                            onClick={showResult ? handleNext : handleSubmit}
                            disabled={!showResult && (selectedOptions.length === 0 || isDisabled || isComplete)}
                            className={cn(
                                'h-12 w-full rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all transform border-b-4 active:border-b-0 active:translate-y-[2px] shadow-md',
                                showResult
                                    ? 'bg-[#1CB0F6] text-white shadow-sky-500/20 hover:bg-sky-500 border-[#0090CC]'
                                    : selectedOptions.length > 0
                                        ? 'bg-[#58CC02] text-white shadow-emerald-500/20 hover:bg-[#46a302] border-[#3B8C00]'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 border-b-slate-200 shadow-none'
                            )}
                        >
                            {showResult
                                ? (currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz')
                                : 'Check Answer'}
                        </button>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest opacity-100 shadow-lg shadow-emerald-500/20 cursor-default"
                                disabled
                            >
                                Quiz Completed
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
