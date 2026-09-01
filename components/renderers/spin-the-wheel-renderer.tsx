"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { RotateCw, Award, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { playWheelSpin } from "@/lib/sound-effects"
import { FormattedText } from "@/components/ui/formatted-text"
import {
    resolveSpinTheWheelQuestions,
    type QuestionType,
    type WheelQuestion,
} from "@/lib/spin-the-wheel-utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { buildLiveStartMeta } from "@/lib/live-start-info"
import { useLiveBlock, readTimeLimit } from "@/hooks/use-live-block"
import { shouldRevealAnswer } from "@/lib/reveal"
import type { Component } from "@/types/lesson"

export type { QuestionType, WheelQuestion }
export {
    DEFAULT_WHEEL_QUESTIONS,
    normalizeWheelQuestion,
    normalizeWheelQuestions,
} from "@/lib/spin-the-wheel-utils"

interface SpinTheWheelRendererProps {
    id?: string
    title?: string
    questions?: WheelQuestion[]
    items?: unknown[]
    requiredSpins?: number
    points?: number
    mode?: "practice" | "live"
    timeLimit?: number
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
}

// ── Wheel colors ────────────────────────────────────────────────────────────────

const SLICE_COLORS = [
    "#FF4B4B", "#FFC800", "#58CC02", "#1CB0F6",
    "#A560F8", "#FF8C00", "#00C9A7", "#FF6B9D",
]

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const s = polarToCartesian(cx, cy, r, startAngle)
    const e = polarToCartesian(cx, cy, r, endAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`
}

// ── Question Card Components ────────────────────────────────────────────────────

function MultipleChoiceCard({
    question,
    onAnswer,
    disabled,
    revealAnswers,
}: {
    question: WheelQuestion
    onAnswer: (correct: boolean) => void
    disabled: boolean
    revealAnswers: boolean
}) {
    const [selected, setSelected] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (idx: number) => {
        if (submitted || disabled) return
        setSelected(idx)
        setSubmitted(true)
        const correct = idx === question.correctOptionIndex
        onAnswer(correct)
    }

    return (
        <div className="space-y-3">
            <FormattedText content={question.prompt} as="p" className="text-base font-black text-slate-900 leading-snug" />
            <div className="space-y-2">
                {(question.options || []).map((opt, idx) => {
                    const isCorrect = submitted && idx === question.correctOptionIndex && (revealAnswers || selected === idx)
                    const isWrong = submitted && selected === idx && idx !== question.correctOptionIndex
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSubmit(idx)}
                            disabled={submitted || disabled}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-2xl border-2 border-b-4 font-bold text-sm transition-all",
                                "active:border-b-2 active:translate-y-[2px] cursor-pointer",
                                !submitted && "bg-white border-slate-200 border-b-slate-300 hover:border-[#1CB0F6] hover:bg-sky-50",
                                isCorrect && "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-900",
                                isWrong && "bg-rose-50 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-900",
                                submitted && !isCorrect && !isWrong && "bg-slate-50 border-slate-200 border-b-slate-200 text-slate-500 cursor-default",
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <FormattedText content={opt} as="span" />
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-[#58CC02] shrink-0" />}
                                {isWrong && <XCircle className="w-4 h-4 text-[#FF4B4B] shrink-0" />}
                            </div>
                        </button>
                    )
                })}
            </div>
            {submitted && question.explanation && (revealAnswers || selected === question.correctOptionIndex) && (
                <p className="text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in fade-in">
                    💡 {question.explanation}
                </p>
            )}
        </div>
    )
}

function InputAnswerCard({
    question,
    onAnswer,
    disabled,
    revealAnswers,
}: {
    question: WheelQuestion
    onAnswer: (correct: boolean) => void
    disabled: boolean
    revealAnswers: boolean
}) {
    const [value, setValue] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [correct, setCorrect] = useState(false)

    const handleSubmit = () => {
        if (submitted || disabled || !value.trim()) return
        const lower = value.toLowerCase().trim()
        const matched = (question.keywords || []).some(k => lower.includes(k.toLowerCase()))
        setCorrect(matched)
        setSubmitted(true)
        onAnswer(matched)
    }

    return (
        <div className="space-y-3">
            <FormattedText content={question.prompt} as="p" className="text-base font-black text-slate-900 leading-snug" />
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    disabled={submitted || disabled}
                    placeholder="Type your answer..."
                    className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl border-2 border-b-4 font-bold text-sm outline-none transition-all",
                        submitted && correct && "bg-emerald-50 border-[#58CC02] text-emerald-900",
                        submitted && !correct && "bg-rose-50 border-[#FF4B4B] text-rose-900",
                        !submitted && "bg-white border-slate-200 border-b-slate-300 focus:border-[#1CB0F6]",
                    )}
                />
                {!submitted && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!value.trim()}
                        className="px-5 py-2.5 rounded-xl border-2 border-b-4 font-black text-sm bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] hover:bg-sky-400 active:border-b-2 active:translate-y-[2px] disabled:opacity-40 cursor-pointer transition-all"
                    >
                        Submit
                    </button>
                )}
            </div>
            {submitted && (
                <div className={cn(
                    "flex items-center gap-2 text-sm font-black px-3 py-2 rounded-xl border",
                    correct ? "bg-emerald-50 border-[#58CC02] text-emerald-700" : "bg-rose-50 border-[#FF4B4B] text-rose-700"
                )}>
                    {correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {correct ? "Correct!" : revealAnswers ? `Needs keyword: "${(question.keywords || [])[0] || ""}"` : "Incorrect"}
                </div>
            )}
            {submitted && question.explanation && (correct || revealAnswers) && (
                <p className="text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in fade-in">
                    💡 {question.explanation}
                </p>
            )}
        </div>
    )
}

function TrueFalseCard({
    question,
    onAnswer,
    disabled,
    revealAnswers,
}: {
    question: WheelQuestion
    onAnswer: (correct: boolean) => void
    disabled: boolean
    revealAnswers: boolean
}) {
    const [selected, setSelected] = useState<boolean | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSelect = (choice: boolean) => {
        if (submitted || disabled) return
        setSelected(choice)
        setSubmitted(true)
        onAnswer(choice === question.isTrue)
    }

    return (
        <div className="space-y-4">
            <p className="text-base font-black text-slate-900 leading-snug">{question.prompt}</p>
            <div className="flex gap-3">
                {[true, false].map(choice => {
                    const isSelected = selected === choice
                    const isCorrectChoice = question.isTrue === choice
                    const correct = submitted && isSelected && isCorrectChoice
                    const wrong = submitted && isSelected && !isCorrectChoice
                    const reveal = submitted && !isSelected && isCorrectChoice && revealAnswers
                    return (
                        <button
                            key={String(choice)}
                            type="button"
                            onClick={() => handleSelect(choice)}
                            disabled={submitted || disabled}
                            className={cn(
                                "flex-1 py-4 rounded-2xl border-2 border-b-4 font-black text-sm uppercase tracking-wider transition-all cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                !submitted && (choice
                                    ? "bg-emerald-50 border-emerald-300 border-b-emerald-400 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-rose-50 border-rose-300 border-b-rose-400 text-rose-700 hover:bg-rose-100"),
                                correct && "bg-emerald-500 border-emerald-500 border-b-emerald-700 text-white scale-105",
                                wrong && "bg-rose-500 border-rose-500 border-b-rose-700 text-white",
                                reveal && "bg-emerald-100 border-[#58CC02] border-b-[#3B8C00] text-emerald-800",
                                submitted && !isSelected && !reveal && "opacity-40 cursor-default",
                            )}
                        >
                            {choice ? "✓ True" : "✗ False"}
                        </button>
                    )
                })}
            </div>
            {submitted && question.explanation && (selected === question.isTrue || revealAnswers) && (
                <p className="text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in fade-in">
                    💡 {question.explanation}
                </p>
            )}
        </div>
    )
}

// ── Main Renderer ───────────────────────────────────────────────────────────────

function SpinTheWheelPlayfield({
    id = "spin-the-wheel-component",
    title = "Spin the Wheel",
    questions = [],
    items,
    requiredSpins = 3,
    points = 20,
    savedState,
    setComponentState,
    isEditing = false,
    handlePoints,
    handleRetry,
    recordAttempt,
    isLive = false,
    timeLimit = 60,
}: SpinTheWheelRendererProps & Pick<ScoredRenderProps<Record<string, unknown>>, "handlePoints" | "handleRetry" | "recordAttempt" | "isLive"> & {
    timeLimit: number
}) {
    const revealAnswers = shouldRevealAnswer(isLive ? "live" : "practice")
    const [rotation, setRotation] = useState(savedState?.rotation ?? 0)
    const [isSpinning, setIsSpinning] = useState(false)
    const safeQuestions = React.useMemo(
        () => resolveSpinTheWheelQuestions({ questions, items }),
        [questions, items],
    )
    const [currentQuestion, setCurrentQuestion] = useState<WheelQuestion | null>(() => {
        if (savedState?.currentQuestionId) {
            return safeQuestions.find(q => q.id === savedState.currentQuestionId) ?? null
        }
        return null
    })
    const [questionKey, setQuestionKey] = useState(0)
    const [spinsCompleted, setSpinsCompleted] = useState(savedState?.spinsCompleted ?? 0)
    const [correctCount, setCorrectCount] = useState(savedState?.correctCount ?? 0)
    const [completedIds, setCompletedIds] = useState<string[]>(savedState?.completedIds ?? [])
    const [activityDone, setActivityDone] = useState(savedState?.completed ?? false)
    const [answerSubmitted, setAnswerSubmitted] = useState(savedState?.answerSubmitted ?? false)
    const { showStartScreen, setHasStarted } = useLiveBlock({
        isLive,
        isComplete: activityDone,
        lockId: id,
    })

    const { playFeedback } = useFeedback()
    const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const setComponentStateRef = useRef(setComponentState)
    setComponentStateRef.current = setComponentState

    const activeQuestions = safeQuestions.filter(q => !completedIds.includes(q.id))
    const displayQuestions = activeQuestions.length > 0 ? activeQuestions : safeQuestions
    const activeSliceAngle = 360 / Math.max(displayQuestions.length, 1)
    const SPIN_DURATION = 6500

    // Persist in-progress state so Next → Previous restores mid-activity progress
    useEffect(() => {
        if (!setComponentStateRef.current || isEditing) return
        setComponentStateRef.current({
            status: activityDone ? "completed" : "active",
            score: activityDone ? Math.round((correctCount / requiredSpins) * points) : undefined,
            maxScore: points,
            spinsCompleted,
            correctCount,
            completedIds,
            completed: activityDone,
            currentQuestionId: currentQuestion?.id ?? null,
            answerSubmitted,
            rotation,
        })
    }, [
        spinsCompleted,
        correctCount,
        completedIds,
        activityDone,
        currentQuestion,
        answerSubmitted,
        rotation,
        isEditing,
        requiredSpins,
        points,
    ])

    // Restore active question card when remounting mid-activity
    useEffect(() => {
        if (currentQuestion || !savedState?.currentQuestionId) return
        const restored = safeQuestions.find(q => q.id === savedState.currentQuestionId)
        if (restored) {
            setCurrentQuestion(restored)
            if (savedState.answerSubmitted) {
                setAnswerSubmitted(true)
            }
        }
    }, [savedState?.currentQuestionId, safeQuestions])

    // Pick a random question that hasn't been completed yet (or any if all done)
    const getNextQuestion = (): WheelQuestion | null => {
        if (safeQuestions.length === 0) return null
        const remaining = safeQuestions.filter(q => !completedIds.includes(q.id))
        const pool = remaining.length > 0 ? remaining : safeQuestions
        return pool[Math.floor(Math.random() * pool.length)]
    }

    const handleSpin = () => {
        if (isSpinning || isEditing || safeQuestions.length === 0 || activityDone) return
        if (answerSubmitted) {
            // Clear question before next spin
            setCurrentQuestion(null)
            setAnswerSubmitted(false)
            void playFeedback("click", { sound: true, animation: false })
            return
        }

        setIsSpinning(true)
        setCurrentQuestion(null)
        playWheelSpin(SPIN_DURATION)

        // Determine which question to show
        const targetQuestion = getNextQuestion()!
        const targetIdx = displayQuestions.findIndex(q => q.id === targetQuestion.id)
        const effectiveIdx = targetIdx >= 0 ? targetIdx : 0

        // Calculate rotation to land on that slice
        const extraTurns = (6 + Math.floor(Math.random() * 4)) * 360
        const targetSliceCenter = effectiveIdx * activeSliceAngle + activeSliceAngle / 2
        const stopAngle = 360 - targetSliceCenter
        const currentMod = rotation % 360
        const deltaToStop = (stopAngle - currentMod + 360) % 360
        const newTotalRotation = rotation + extraTurns + deltaToStop

        setRotation(newTotalRotation)

        spinTimeoutRef.current = setTimeout(() => {
            setIsSpinning(false)
            setCurrentQuestion(targetQuestion)
            setQuestionKey(prev => prev + 1)
        }, SPIN_DURATION)
    }

    const handleAnswer = async (correct: boolean) => {
        setAnswerSubmitted(true)
        const newSpins = spinsCompleted + 1
        const newCorrect = correct ? correctCount + 1 : correctCount
        const newCompletedIds = currentQuestion ? [...completedIds, currentQuestion.id] : completedIds

        setSpinsCompleted(newSpins)
        setCorrectCount(newCorrect)
        setCompletedIds(newCompletedIds)

        if (correct) {
            await playFeedback("quizSuccess", { sound: true })
        } else {
            await playFeedback("incorrect", { sound: true })
        }

        if (newSpins >= requiredSpins) {
            finishActivity(newSpins, newCorrect, newCompletedIds)
        }
    }

    const handleReset = () => {
        handleRetry()
        setRotation(0)
        setIsSpinning(false)
        setCurrentQuestion(null)
        setAnswerSubmitted(false)
        setSpinsCompleted(0)
        setCorrectCount(0)
        setCompletedIds([])
        setActivityDone(false)
    }

    const cx = 150, cy = 150, r = 140

    const canSpin = !isSpinning && !isEditing && safeQuestions.length > 0 && !activityDone
    const spinsLeft = requiredSpins - spinsCompleted

    const finishActivity = (newSpins: number, newCorrect: number, newCompletedIds: string[]) => {
        const earned = Math.round((newCorrect / requiredSpins) * points)
        setActivityDone(true)
        handlePoints(earned)
        recordAttempt(newCorrect === requiredSpins, earned, points)
        if (setComponentState) {
            setComponentState({
                status: "completed",
                score: earned,
                maxScore: points,
                spinsCompleted: newSpins,
                correctCount: newCorrect,
                completedIds: newCompletedIds,
                completed: true,
            })
        }
    }

    const onTimeout = () => {
        if (!activityDone) {
            finishActivity(spinsCompleted, correctCount, completedIds)
        }
    }

    if (showStartScreen) {
        const liveMeta = buildLiveStartMeta({
            type: "spinTheWheel",
            title: title || "Spin the wheel",
            timeLimitSec: timeLimit,
            points,
            units: requiredSpins,
        })
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                {...liveMeta}
            />
        )
    }

    return (
        <div className="w-full py-4 flex flex-col items-center justify-start md:justify-center md:flex-1 md:my-auto">
            <div className="relative w-full bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                            Spin the Wheel • {points} Points
                        </span>
                    </div>
                    {isLive && (
                        <LiveTimer
                            isCompleted={activityDone}
                            duration={timeLimit}
                            onTimeout={onTimeout}
                        />
                    )}
                </div>

                {/* Main Content Grid: Landscape Side-by-Side on LG screens */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                    {/* Left Column: Title, Progress & SVG Wheel */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <FormattedText content={title} as="h3" className="text-xl font-black mb-2 text-slate-900 text-center tracking-tight" />

                        {/* Progress */}
                        {!activityDone && (
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                    {spinsCompleted} / {requiredSpins} answered
                                </span>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: requiredSpins }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "w-3 h-3 rounded-full border-2 transition-all",
                                                i < spinsCompleted
                                                    ? "bg-[#58CC02] border-[#3B8C00]"
                                                    : "bg-slate-100 border-slate-300"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wheel Container */}
                        <div className="relative inline-block">
                            {/* Pointer triangle */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-30 w-0 h-0
                                border-l-[12px] border-l-transparent
                                border-r-[12px] border-r-transparent
                                border-t-[20px] border-t-[#FFC800]
                                drop-shadow-md" />

                            {/* SVG Wheel */}
                            <svg
                                width="280"
                                height="280"
                                viewBox="0 0 300 300"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: isSpinning
                                        ? `transform ${SPIN_DURATION}ms cubic-bezier(0.08, 0.82, 0.17, 1.00)`
                                        : "none",
                                }}
                                className="rounded-full shadow-2xl border-4 border-white max-w-full h-auto"
                            >
                                {displayQuestions.length === 0 ? (
                                    <circle cx={cx} cy={cy} r={r} fill="#e2e8f0" />
                                ) : (
                                    displayQuestions.map((q, idx) => {
                                        const start = idx * activeSliceAngle
                                        const end = start + activeSliceAngle
                                        const mid = start + activeSliceAngle / 2
                                        const originalIdx = safeQuestions.findIndex(orig => orig.id === q.id)
                                        const color = SLICE_COLORS[(originalIdx >= 0 ? originalIdx : idx) % SLICE_COLORS.length]
                                        const labelR = r * 0.65
                                        const labelPos = polarToCartesian(cx, cy, labelR, mid)
                                        return (
                                            <g key={q.id}>
                                                <path
                                                    d={slicePath(cx, cy, r, start, end)}
                                                    fill={color}
                                                    stroke="white"
                                                    strokeWidth="2"
                                                />
                                                <text
                                                    x={labelPos.x}
                                                    y={labelPos.y}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="white"
                                                    fontSize="11"
                                                    fontWeight="900"
                                                    transform={`rotate(${mid + 90}, ${labelPos.x}, ${labelPos.y})`}
                                                >
                                                    Q{originalIdx >= 0 ? originalIdx + 1 : idx + 1}
                                                </text>
                                            </g>
                                        )
                                    })
                                )}
                                {/* Center cap */}
                                <circle cx={cx} cy={cy} r={30} fill="#FFC800" stroke="white" strokeWidth="4" />
                            </svg>

                            {/* Spin button overlay on center cap */}
                            <button
                                type="button"
                                onClick={handleSpin}
                                disabled={!canSpin}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 56,
                                    height: 56,
                                }}
                                className={cn(
                                    "rounded-full border-4 border-white flex flex-col items-center justify-center font-black text-[10px] uppercase tracking-wide shadow-lg transition-colors z-20",
                                    canSpin
                                        ? "bg-[#FFC800] text-slate-900 cursor-pointer hover:bg-amber-400"
                                        : "bg-[#FFC800] text-slate-900 cursor-default opacity-80"
                                )}
                            >
                                <RotateCw className={cn("w-5 h-5", isSpinning && "animate-spin")} />
                                <span className="text-[8px] mt-0.5">{isSpinning ? "..." : answerSubmitted ? "NEXT" : "SPIN"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Active Question Card / Completion / Prompt */}
                    <div className="lg:col-span-7 flex flex-col justify-center w-full">
                        {currentQuestion && !activityDone && (
                            <div
                                key={questionKey}
                                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 border-b-4 shadow-sm animate-in slide-in-from-bottom-3 fade-in duration-300"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span
                                        className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg text-white"
                                        style={{ background: SLICE_COLORS[(safeQuestions.findIndex(q => q.id === currentQuestion.id)) % SLICE_COLORS.length] }}
                                    >
                                        {currentQuestion.type === "multipleChoice" ? "Multiple Choice"
                                            : currentQuestion.type === "inputAnswer" ? "Short Answer"
                                                : "True or False"}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Question {spinsCompleted + 1} of {requiredSpins}
                                    </span>
                                </div>

                                {currentQuestion.type === "multipleChoice" && (
                                    <MultipleChoiceCard
                                        key={`mc-${questionKey}`}
                                        question={currentQuestion}
                                        onAnswer={handleAnswer}
                                        disabled={answerSubmitted}
                                        revealAnswers={revealAnswers}
                                    />
                                )}
                                {currentQuestion.type === "inputAnswer" && (
                                    <InputAnswerCard
                                        key={`ia-${questionKey}`}
                                        question={currentQuestion}
                                        onAnswer={handleAnswer}
                                        disabled={answerSubmitted}
                                        revealAnswers={revealAnswers}
                                    />
                                )}
                                {currentQuestion.type === "trueFalse" && (
                                    <TrueFalseCard
                                        key={`tf-${questionKey}`}
                                        question={currentQuestion}
                                        onAnswer={handleAnswer}
                                        disabled={answerSubmitted}
                                        revealAnswers={revealAnswers}
                                    />
                                )}

                                {answerSubmitted && !activityDone && (
                                    <button
                                        type="button"
                                        onClick={handleSpin}
                                        className="mt-4 w-full h-11 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#1CB0F6] hover:bg-sky-400 text-white border-2 border-[#1CB0F6] border-b-4 border-b-[#0090CC] transition-all cursor-pointer active:border-b-2 active:translate-y-[2px]"
                                    >
                                        Spin Again →
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Prompt when waiting to spin */}
                        {!currentQuestion && !activityDone && (
                            <div className="p-8 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-300 text-center flex flex-col items-center justify-center gap-2">
                                <RotateCw className="w-8 h-8 text-amber-500 animate-bounce" />
                                <h4 className="font-black text-base text-slate-800">Ready to Spin?</h4>
                                <p className="text-xs font-bold text-slate-500 max-w-sm">
                                    Click the yellow center button on the wheel to spin and land on your next challenge!
                                </p>
                            </div>
                        )}

                        {/* Activity Complete */}
                        {activityDone && (
                            <div className="w-full p-6 rounded-2xl bg-amber-50 border-2 border-b-4 border-[#FFC800] border-b-amber-500 flex flex-col items-center text-center gap-3 animate-in zoom-in-95 duration-300">
                                <Award className="w-10 h-10 text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Activity Complete!</p>
                                    <p className="text-2xl font-black text-slate-900">
                                        {correctCount} / {requiredSpins} correct
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        {Math.round((correctCount / requiredSpins) * points)} points earned
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200 border-b-4 border-b-slate-300 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Play Again
                                </button>
                            </div>
                        )}

                        {safeQuestions.length === 0 && (
                            <p className="text-center text-xs font-bold text-slate-400">
                                No questions added yet. Configure questions in the editor.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function SpinTheWheelRenderer(props: SpinTheWheelRendererProps) {
    const {
        id = "spin-the-wheel-component",
        title = "Spin the Wheel",
        questions = [],
        items,
        requiredSpins = 3,
        points = 20,
        savedState,
        mode = "practice",
        timeLimit: timeLimitProp,
    } = props

    const component: Component = {
        id,
        type: "spinTheWheel",
        state: "active",
        status: (savedState?.completed ? "completed" : "uncompleted") as any,
        props: { title, questions, items, requiredSpins, points },
        mode,
    } as Component

    return (
        <ScoredRenderer<Record<string, unknown>>
            component={component}
            initialState={{ completed: Boolean(savedState?.completed) }}
            points={points}
            mode={mode}
            onRender={(renderProps) => (
                <SpinTheWheelPlayfield
                    {...props}
                    handlePoints={renderProps.handlePoints}
                    handleRetry={renderProps.handleRetry}
                    recordAttempt={renderProps.recordAttempt}
                    isLive={renderProps.isLive}
                    timeLimit={readTimeLimit(timeLimitProp, 60)}
                />
            )}
        />
    )
}
