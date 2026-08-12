"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Lock, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import type { Component } from "@/types/lesson"
import { isInputDisabled, shouldShowRetry, isItemApproved } from "@/lib/tutor-marking-contract"

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
    isTutorView?: boolean
}

type ShortAnswerState = {
    userResponse: string
    isSubmitted: boolean
    isPendingMarking?: boolean
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

    const tutorMarked = Boolean((state as any)?.tutorMarked || (state as any)?.markedBy);

    const contractContext = {
        markingMode,
        mode: isLive ? ('live' as const) : ('practice' as const),
        isTutorView: Boolean(props.isTutorView),
        disabledProp
    };

    const inputsLocked = isInputDisabled(state, contractContext);
    const displayRetry = shouldShowRetry(state, contractContext, points);
    const isApproved = isItemApproved(state, score > 0 || (tutorMarked && !isPendingMarking));

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
        if (inputsLocked) return
        setState(prev => ({
            ...prev,
            userResponse: val
        }))
    }

    const handleSubmit = async () => {
        if (inputsLocked || !userResponse.trim()) return

        const trimmedResponse = userResponse.trim().toLowerCase()

        if (markingMode === "tutor-mark") {
            await playFeedback("quizSuccess")
            setState(prev => ({
                ...prev,
                isSubmitted: true,
                isPendingMarking: true,
                score: 0,
                status: "completed"
            }))
            return
        }

        let keywordMatch = false
        if (correctKeywords && correctKeywords.length > 0) {
            keywordMatch = correctKeywords.some(kw => trimmedResponse.includes(kw.toLowerCase().trim()))
        } else {
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
            {/* Visual Accent */}
            <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-2 pt-2">
                <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-sky-600/60 uppercase tracking-[0.2em]">Open Response</span>
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
                    {isSubmitted && (
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Submitted</span>
                        </div>
                    )}
                </div>
            </div>

            {/* CENTER SECTION: Question & Input Area */}
            <div className="flex-1 min-h-0 flex flex-col justify-center py-2 space-y-3 overflow-y-auto">
                <p className="text-base md:text-lg font-bold text-slate-900 leading-relaxed tracking-tight">
                    {question}
                </p>
                <Textarea
                    value={userResponse}
                    onChange={(e) => handleResponseChange(e.target.value)}
                    disabled={inputsLocked}
                    placeholder={placeholder}
                    rows={4}
                    className="bg-slate-50 border-2 border-slate-200 focus-visible:ring-sky-500 focus-visible:border-sky-500 font-semibold text-slate-900 placeholder:text-slate-400 rounded-xl resize-none p-4 text-sm md:text-base shadow-inner"
                />
            </div>

            {/* BOTTOM SECTION: Feedback & Submit */}
            <div className="shrink-0 space-y-3 px-2 pb-4 pt-1">
                {isSubmitted && (
                    <div className={cn(
                        "p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-300 shadow-sm",
                        ((isPendingMarking && !tutorMarked) || (markingMode === "tutor-mark" && !tutorMarked))
                            ? "bg-amber-50 border-amber-200 text-amber-900"
                            : isApproved
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                : "bg-rose-50 border-rose-200 text-rose-900"
                    )}>
                        {((isPendingMarking && !tutorMarked) || (markingMode === "tutor-mark" && !tutorMarked)) ? (
                            <div className="space-y-0.5">
                                <p className="text-xs font-black uppercase tracking-wider text-amber-700">Submitted — Pending Tutor Review</p>
                                <p className="text-[10px] font-medium opacity-80">Your response has been saved for tutor evaluation.</p>
                            </div>
                        ) : isApproved ? (
                            <div className="space-y-0.5">
                                <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Great Job!</p>
                                <p className="text-[10px] font-medium opacity-80">Your answer covers key concepts.</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
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
                            disabled={inputsLocked || !userResponse.trim()}
                        >
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Response
                        </Button>
                    ) : (
                        <div className={cn("w-full", displayRetry && "grid grid-cols-1 sm:grid-cols-2 gap-2")}>
                            <Button disabled className="h-11 w-full rounded-xl bg-sky-600 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-100">
                                {((isPendingMarking && !tutorMarked) || (markingMode === "tutor-mark" && !tutorMarked)) ? "Submitted" : "Scored"}
                            </Button>
                            {displayRetry && (
                                <Button
                                    onClick={onLocalRetry}
                                    variant="outline"
                                    className="h-11 rounded-xl border-2 border-sky-600 text-sky-600 font-black uppercase text-[10px] tracking-widest"
                                    disabled={inputsLocked}
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
