"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Volume2, Sparkles, HelpCircle } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useFeedback } from "@/hooks/use-feedback"

interface TrueFalseRendererProps {
    id?: string
    statement: string
    isTrue: boolean
    explanation?: string
    points?: number
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
    isBuilder?: boolean
}

export function TrueFalseRenderer({
    id = "true-false-component",
    statement = "The earth revolves around the sun.",
    isTrue = true,
    explanation = "",
    points = 10,
    savedState,
    setComponentState,
    isEditing = false,
}: TrueFalseRendererProps) {
    const [selected, setSelected] = useState<boolean | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const { speak, isSpeaking } = useReadAloud()
    const { playFeedback } = useFeedback()

    // Load previous answer state if exists
    useEffect(() => {
        if (savedState?.selected !== undefined) {
            setSelected(savedState.selected)
            setSubmitted(true)
        }
    }, [savedState])

    const handleSelect = async (userChoice: boolean) => {
        if (submitted || isEditing) return
        setSelected(userChoice)
        setSubmitted(true)

        const isCorrect = userChoice === isTrue
        const earnedPoints = isCorrect ? points : 0

        if (isCorrect) {
            await playFeedback('quizSuccess', { sound: true })
        } else {
            await playFeedback('incorrect', { sound: true })
        }

        if (setComponentState) {
            setComponentState({
                status: "completed",
                score: earnedPoints,
                maxScore: points,
                selected: userChoice,
                isCorrect,
            })
        }
    }

    const isSelectedTrue = selected === true
    const isSelectedFalse = selected === false

    const isCorrectChoice = selected === isTrue

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        speak(`True or false statement: ${statement}`)
    }

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden text-slate-100">
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            True or False • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-indigo-400")} />
                        <span className="text-[10px] uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                {/* Statement Prompt */}
                <div className="mb-8">
                    <h3 className="text-lg sm:text-xl font-black leading-snug tracking-tight text-white">
                        {statement}
                    </h3>
                </div>

                {/* Choice Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* TRUE Card */}
                    <button
                        type="button"
                        onClick={() => handleSelect(true)}
                        disabled={submitted || isEditing}
                        className={cn(
                            "relative flex items-center justify-between p-5 rounded-2xl border-2 font-black text-lg transition-all duration-300 active:scale-[0.98]",
                            !submitted && "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/20 text-emerald-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10",
                            submitted && isTrue && "bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50",
                            submitted && isSelectedTrue && !isTrue && "bg-rose-500/20 border-rose-500 text-rose-300",
                            submitted && !isSelectedTrue && !isTrue && "opacity-40 bg-slate-950 border-slate-800 text-slate-500"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 text-emerald-400">
                                T
                            </div>
                            <span>TRUE</span>
                        </div>

                        {submitted && isTrue && (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-in zoom-in-50" />
                        )}
                        {submitted && isSelectedTrue && !isTrue && (
                            <XCircle className="w-6 h-6 text-rose-400 animate-in zoom-in-50" />
                        )}
                    </button>

                    {/* FALSE Card */}
                    <button
                        type="button"
                        onClick={() => handleSelect(false)}
                        disabled={submitted || isEditing}
                        className={cn(
                            "relative flex items-center justify-between p-5 rounded-2xl border-2 font-black text-lg transition-all duration-300 active:scale-[0.98]",
                            !submitted && "bg-rose-500/10 border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/20 text-rose-300 cursor-pointer shadow-lg hover:shadow-rose-500/10",
                            submitted && !isTrue && "bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50",
                            submitted && isSelectedFalse && isTrue && "bg-rose-500/20 border-rose-500 text-rose-300",
                            submitted && !isSelectedFalse && isTrue && "opacity-40 bg-slate-950 border-slate-800 text-slate-500"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/40 text-rose-400">
                                F
                            </div>
                            <span>FALSE</span>
                        </div>

                        {submitted && !isTrue && (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-in zoom-in-50" />
                        )}
                        {submitted && isSelectedFalse && isTrue && (
                            <XCircle className="w-6 h-6 text-rose-400 animate-in zoom-in-50" />
                        )}
                    </button>
                </div>

                {/* Feedback / Explanation Box */}
                {submitted && (
                    <div
                        className={cn(
                            "mt-6 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-300",
                            isCorrectChoice
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1.5 font-extrabold text-sm">
                            {isCorrectChoice ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Spot on! +{points} Points</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4 text-rose-400" />
                                    <span>Not quite! Correct answer is {isTrue ? "TRUE" : "FALSE"}</span>
                                </>
                            )}
                        </div>

                        {explanation && (
                            <div className="flex items-start gap-2 mt-2 text-xs opacity-90 leading-relaxed pt-2 border-t border-white/10">
                                <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                <p>{explanation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
