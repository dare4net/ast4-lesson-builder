"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

interface TrueFalseRendererProps {
    id?: string
    statement: string
    isTrue: boolean
    explanation?: string
    points?: number
    mode?: "practice" | "live"
    savedState?: TrueFalseState
    setComponentState?: (state: TrueFalseState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

type TrueFalseState = {
    selected: boolean | null
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

function TrueFalseContent({
    state,
    setState,
    handleScore,
    handlePoints,
    recordAttempt,
    statement,
    isTrue,
    explanation,
    points,
    isEditing,
    disabled,
}: ScoredRenderProps<TrueFalseState> & {
    statement: string
    isTrue: boolean
    explanation: string
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { playFeedback } = useFeedback()

    const { selected, submitted } = state
    const isSelectedTrue = selected === true
    const isSelectedFalse = selected === false
    const isCorrectChoice = selected === isTrue

    const handleSelect = async (userChoice: boolean) => {
        if (submitted || isEditing || disabled) return

        void playFeedback("click", { sound: true, animation: false })

        const correct = userChoice === isTrue
        const earnedPoints = correct ? points : 0

        setState({
            selected: userChoice,
            submitted: true,
            isCorrect: correct,
            status: "completed",
            score: earnedPoints,
            maxScore: points,
        })

        recordAttempt(correct, earnedPoints, points)
        if (correct) {
            await playFeedback("quizSuccess", { sound: true })
            handleScore(true)
            handlePoints(earnedPoints)
        } else {
            await playFeedback("incorrect", { sound: true })
            handleScore(false)
        }
    }


    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-2">
            <div className="shrink-0 space-y-3 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-indigo-600/60 uppercase tracking-[0.2em]">Activity</span>
                        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none">True or False</h3>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Statement</span>
                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter">{points} pts</span>
                    </div>
                    <div className="h-1.5 w-full bg-indigo-50 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500 ease-out",
                                submitted ? "w-full" : "w-0"
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col justify-start md:justify-center py-3 md:py-4 w-full">
                <div className="relative space-y-5 my-auto w-full">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-indigo-500 rounded-full" />
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">Is this TRUE or FALSE?</span>
                        </div>
                        <FormattedText content={statement} as="h2" className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <button
                            type="button"
                            onClick={() => handleSelect(true)}
                            disabled={submitted || isEditing || disabled}
                            className={cn(
                                "w-full p-4 text-left transition-all duration-200 relative rounded-2xl border-2 bg-white dark:bg-slate-900 shadow-sm",
                                "border-b-4 active:border-b-0 active:translate-y-[2px]",
                                !submitted && "border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-[#58CC02]/60 hover:bg-[#58CC02]/5 hover:shadow-md cursor-pointer",
                                submitted && isTrue && "bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg",
                                submitted && isSelectedTrue && !isTrue && "bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]",
                                submitted && !isSelectedTrue && !isTrue && "opacity-40 cursor-not-allowed",
                                submitted && !isSelectedTrue && isTrue && "cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3.5">
                                    <span className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-colors shrink-0",
                                        submitted && isTrue ? "bg-white/30 text-white border-white/30" :
                                            submitted && isSelectedTrue && !isTrue ? "bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/30" :
                                                "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                                    )}>T</span>
                                    <span className="font-extrabold text-base tracking-tight text-inherit">TRUE</span>
                                </div>
                                {submitted && isTrue && <CheckCircle2 className="w-6 h-6 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                {submitted && isSelectedTrue && !isTrue && <XCircle className="w-6 h-6 text-[#FF4B4B] stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSelect(false)}
                            disabled={submitted || isEditing || disabled}
                            className={cn(
                                "w-full p-4 text-left transition-all duration-200 relative rounded-2xl border-2 bg-white dark:bg-slate-900 shadow-sm",
                                "border-b-4 active:border-b-0 active:translate-y-[2px]",
                                !submitted && "border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-[#FF4B4B]/60 hover:bg-[#FF4B4B]/5 hover:shadow-md cursor-pointer",
                                submitted && !isTrue && "bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg",
                                submitted && isSelectedFalse && isTrue && "bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]",
                                submitted && !isSelectedFalse && isTrue && "opacity-40 cursor-not-allowed",
                                submitted && !isSelectedFalse && !isTrue && "cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3.5">
                                    <span className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-colors shrink-0",
                                        submitted && !isTrue ? "bg-white/30 text-white border-white/30" :
                                            submitted && isSelectedFalse && isTrue ? "bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/30" :
                                                "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                                    )}>F</span>
                                    <span className="font-extrabold text-base tracking-tight text-inherit">FALSE</span>
                                </div>
                                {submitted && !isTrue && <CheckCircle2 className="w-6 h-6 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                {submitted && isSelectedFalse && isTrue && <XCircle className="w-6 h-6 text-[#FF4B4B] stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="shrink-0 space-y-3 pb-4 pt-1">
                <div className="min-h-[56px] flex flex-col justify-center items-center">
                    {submitted && (
                        <div className={cn(
                            "p-3.5 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm w-full max-w-md text-center",
                            isCorrectChoice
                                ? "bg-emerald-50/50 border-emerald-500/20"
                                : "bg-rose-50/50 border-rose-500/20"
                        )}>
                            <div className="flex items-center justify-center gap-2 mb-0.5">
                                {isCorrectChoice ? (
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Correct! +{points} Points</span>
                                ) : (
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Incorrect — answer is {isTrue ? "TRUE" : "FALSE"}</span>
                                )}
                            </div>
                            {isCorrectChoice ? (
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 italic">Spot on! Well done!</p>
                            ) : (
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100">Not quite — keep going!</p>
                            )}
                            {explanation && (
                                <FormattedText content={explanation} as="p" className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function TrueFalseRenderer({
    id = "true-false-component",
    statement = "The earth revolves around the sun.",
    isTrue = true,
    explanation = "",
    points = 10,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: TrueFalseRendererProps) {
    if (isEditing) {
        return (
            <div className="border p-4 rounded-2xl bg-white shadow-sm">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">True / False Preview</span>
                <p className="text-sm font-bold text-slate-700 mt-2">{statement}</p>
            </div>
        )
    }

    const component: Component = {
        id,
        type: "trueFalse",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { statement, isTrue, explanation, points },
        mode: mode as any,
    } as Component

    const initialState: TrueFalseState = {
        selected: null,
        submitted: false,
        status: "active",
    }

    const mergedSavedState = savedState
        ? {
            ...initialState,
            ...savedState,
            submitted: savedState.submitted ?? savedState.selected !== undefined,
        }
        : undefined

    return (
        <ScoredRenderer<TrueFalseState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <TrueFalseContent
                    {...renderProps}
                    statement={statement}
                    isTrue={isTrue}
                    explanation={explanation}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
