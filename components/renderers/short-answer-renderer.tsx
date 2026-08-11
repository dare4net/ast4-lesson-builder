"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Clock, Lock, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import type { Component } from "@/types/lesson"

interface ShortAnswerRendererProps {
    title?: string
    question?: string
    placeholder?: string
    correctKeywords?: string[]
    markingMode?: "self-mark" | "tutor-mark"
    points?: number
    isEditing?: boolean
    mode?: "practice" | "live"
    state?: "active" | "disabled"
    disabled?: boolean
    savedState?: any
    setComponentState?: (state: any) => void
    id?: string
    status?: string
}

type ShortAnswerState = {
    userResponse: string
    isSubmitted: boolean
    isPendingMarking?: boolean
    tutorMarkedScore?: number
    score: number
    status?: string
}

function ShortAnswerContent({
    title,
    question,
    placeholder,
    correctKeywords,
    markingMode,
    points,
    state,
    setState,
    handlePoints,
    handleRetry,
    isLive,
    isDisabled: disabledProp,
    props
}: ScoredRenderProps<ShortAnswerState> & {
    title: string
    question: string
    placeholder: string
    correctKeywords: string[]
    markingMode: "self-mark" | "tutor-mark"
    points: number
    isDisabled: boolean
    props: ShortAnswerRendererProps
}) {
    const { playFeedback } = useFeedback()
    const [mounted, setMounted] = useState(false)
    const { registerLock, unregisterLock } = useNavigationLock()
    const [hasStarted, setHasStarted] = useState(false)

    const timeLimit = (props as any).timeLimit || 30

    const {
        userResponse,
        isSubmitted,
        isPendingMarking,
        score
    } = state

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const isComplete = isSubmitted || state.status === "completed"
        if (isLive && hasStarted && !isComplete) {
            registerLock(props.id || "shortanswer-renderer")
        } else {
            unregisterLock(props.id || "shortanswer-renderer")
        }
        return () => unregisterLock(props.id || "shortanswer-renderer")
    }, [isLive, hasStarted, isSubmitted, state.status, registerLock, unregisterLock, props.id])

    const handleResponseChange = (val: string) => {
        if (disabledProp || isSubmitted || state.status === "completed") return
        setState(prev => ({
            ...prev,
            userResponse: val
        }))
    }

    const handleSubmit = async () => {
        if (disabledProp || isSubmitted || state.status === "completed" || !userResponse.trim()) return

        const trimmedResponse = userResponse.trim().toLowerCase()

        if (markingMode === "tutor-mark" && isLive) {
            // Tutor mark mode in Live: submit response, set to pending tutor review
            await playFeedback("complete")
            setState(prev => ({
                ...prev,
                isSubmitted: true,
                isPendingMarking: true,
                score: 0,
                status: "completed"
            }))
            return
        }

        // Self-mark mode or practice mode: keyword checking
        let keywordMatch = false
        if (correctKeywords && correctKeywords.length > 0) {
            keywordMatch = correctKeywords.some(kw => trimmedResponse.includes(kw.toLowerCase().trim()))
        } else {
            // If no keywords defined, treat any non-empty answer as valid for self-mark
            keywordMatch = trimmedResponse.length > 0
        }

        const earnedPoints = keywordMatch ? points : 0

        if (earnedPoints > 0) {
            await playFeedback("quizSuccess")
        } else {
            await playFeedback("incorrect")
        }

        handlePoints(earnedPoints)

        setState(prev => ({
            ...prev,
            isSubmitted: true,
            isPendingMarking: false,
            score: earnedPoints,
            status: "completed"
        }))
    }

    const onLocalRetry = () => {
        handleRetry()
        setState(prev => ({
            ...prev,
            userResponse: "",
            isSubmitted: false,
            isPendingMarking: false,
            score: 0,
            status: "active"
        }))
    }

    const onTimeout = () => {
        if (!isSubmitted) {
            handleSubmit()
        }
    }

    if (!mounted) return null

    if (isLive && !hasStarted && !isSubmitted && state.status !== "completed") {
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                label={`Start Short Answer (${timeLimit}s)`}
            />
        )
    }

    return (
        <div className={cn(
            "w-full h-full flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 px-6 relative",
            disabledProp && "opacity-75"
        )}>
            <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />

            {/* Header */}
            <div className="shrink-0 relative flex items-center justify-between px-2 pt-3">
                <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-sky-600/70 uppercase tracking-[0.2em]">Open-Ended Assessment</span>
                    <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isLive && (
                        <LiveTimer
                            isCompleted={isSubmitted || state.status === "completed"}
                            duration={timeLimit}
                            onTimeout={onTimeout}
                        />
                    )}
                    {disabledProp && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-400 rounded text-[7px] font-black uppercase tracking-widest border border-slate-200">
                            <Lock className="h-2.5 w-2.5" />
                            <span>Locked</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Center Prompt & Response Field */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-3 space-y-3">
                <div className="p-4 bg-sky-50/50 border-2 border-sky-100 rounded-2xl">
                    <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
                        {question || "Write your explanation or short response in detail below:"}
                    </p>
                </div>

                <Textarea
                    value={userResponse}
                    onChange={(e) => handleResponseChange(e.target.value)}
                    disabled={isSubmitted || disabledProp}
                    placeholder={placeholder || "Type your answer here..."}
                    rows={4}
                    className="text-xs md:text-sm font-semibold border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-sky-500 rounded-2xl bg-slate-50/50 p-4 resize-none"
                />
            </div>

            {/* Bottom Actions & Status */}
            <div className="shrink-0 space-y-3 px-2 pb-4 pt-1">
                {isSubmitted && (
                    <div className={cn(
                        "p-3.5 rounded-xl border-2 animate-in slide-in-from-top-2 duration-300",
                        isPendingMarking
                            ? "bg-amber-50 border-amber-200 text-amber-800"
                            : score > 0
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-rose-50 border-rose-200 text-rose-800"
                    )}>
                        {isPendingMarking ? (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">Submitted — Pending Tutor Review</p>
                                    <p className="text-[10px] font-medium opacity-80">Your response has been saved for tutor marking.</p>
                                </div>
                            </div>
                        ) : score > 0 ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">Correct Response (+{score} pts)</p>
                                    <p className="text-[10px] font-medium opacity-80">Keywords verified successfully.</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider text-rose-600">Review Required</p>
                                <p className="text-[10px] font-medium opacity-80">Ensure your answer includes key concepts.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2">
                    {!isSubmitted ? (
                        <Button
                            className="h-11 w-full rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-sky-500/20"
                            onClick={handleSubmit}
                            disabled={disabledProp || !userResponse.trim()}
                        >
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Response
                        </Button>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                            <Button disabled className="h-11 rounded-xl bg-sky-600 text-white font-black uppercase text-[10px] tracking-widest">
                                Submitted
                            </Button>
                            {!isLive && (
                                <Button
                                    onClick={onLocalRetry}
                                    variant="outline"
                                    className="h-11 rounded-xl border-2 border-sky-600 text-sky-600 font-black uppercase text-[10px] tracking-widest"
                                >
                                    Try Again
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function ShortAnswerRenderer(props: ShortAnswerRendererProps) {
    const {
        title = "Short Answer",
        question = "Write your answer below:",
        placeholder = "Type your response...",
        correctKeywords = [],
        markingMode = "self-mark",
        points = 10,
        isEditing = false,
        mode = "practice",
        state: componentState = "active",
        disabled = false,
        savedState,
        setComponentState,
        id = "short-answer-renderer",
        status
    } = props

    const component: Component = {
        id,
        type: "shortAnswer",
        state: componentState as any,
        status: (status || (savedState as any)?.status || "uncompleted") as any,
        props: { title, question, correctKeywords, points, markingMode },
        mode: mode as any
    } as Component

    const initialState: ShortAnswerState = {
        userResponse: "",
        isSubmitted: false,
        isPendingMarking: false,
        score: 0
    }

    if (isEditing) {
        return (
            <div className="border p-4 rounded-xl bg-slate-50 space-y-2">
                <h4 className="font-black text-xs uppercase text-sky-600">{title}</h4>
                <p className="text-sm font-bold text-slate-800">{question}</p>
                <Textarea disabled placeholder={placeholder} rows={2} className="text-xs bg-white" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Marking Mode: {markingMode} ({points} pts)
                </span>
            </div>
        )
    }

    return (
        <ScoredRenderer<ShortAnswerState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <ShortAnswerContent
                    {...renderProps}
                    title={title}
                    question={question}
                    placeholder={placeholder}
                    correctKeywords={correctKeywords}
                    markingMode={markingMode}
                    points={points}
                    isDisabled={disabled || component.state === "disabled"}
                    props={props}
                />
            )}
        />
    )
}
