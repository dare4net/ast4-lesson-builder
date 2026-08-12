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
            <div className="relative w-full max-w-4xl bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden text-slate-900">
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">
                            True or False • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-indigo-600")} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                {/* Statement Prompt */}
                <div className="mb-8">
                    <h3 className="text-lg sm:text-xl font-black leading-snug tracking-tight text-slate-900">
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
                            "relative flex items-center justify-between p-5 rounded-2xl border-2 border-b-4 font-black text-lg transition-all duration-200 active:border-b-2 active:translate-y-[2px]",
                            !submitted && "bg-emerald-50/50 border-[#58CC02] border-b-[#3B8C00] text-[#58CC02] hover:bg-emerald-100/50 cursor-pointer shadow-sm",
                            submitted && isTrue && "bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-emerald-500/20",
                            submitted && isSelectedTrue && !isTrue && "bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]",
                            submitted && !isSelectedTrue && !isTrue && "opacity-40 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center font-black border-2",
                                submitted && isTrue ? "bg-white/20 border-white/40 text-white" : "bg-emerald-100 border-emerald-300 text-[#58CC02]"
                            )}>
                                T
                            </div>
                            <span>TRUE</span>
                        </div>

                        {submitted && isTrue && (
                            <CheckCircle2 className="w-6 h-6 text-white animate-in zoom-in-50" />
                        )}
                        {submitted && isSelectedTrue && !isTrue && (
                            <XCircle className="w-6 h-6 text-[#FF4B4B] animate-in zoom-in-50" />
                        )}
                    </button>

                    {/* FALSE Card */}
                    <button
                        type="button"
                        onClick={() => handleSelect(false)}
                        disabled={submitted || isEditing}
                        className={cn(
                            "relative flex items-center justify-between p-5 rounded-2xl border-2 border-b-4 font-black text-lg transition-all duration-200 active:border-b-2 active:translate-y-[2px]",
                            !submitted && "bg-rose-50/50 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B] hover:bg-rose-100/50 cursor-pointer shadow-sm",
                            submitted && !isTrue && "bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-emerald-500/20",
                            submitted && isSelectedFalse && isTrue && "bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]",
                            submitted && !isSelectedFalse && isTrue && "opacity-40 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center font-black border-2",
                                submitted && !isTrue ? "bg-white/20 border-white/40 text-white" : "bg-rose-100 border-rose-300 text-[#FF4B4B]"
                            )}>
                                F
                            </div>
                            <span>FALSE</span>
                        </div>

                        {submitted && !isTrue && (
                            <CheckCircle2 className="w-6 h-6 text-white animate-in zoom-in-50" />
                        )}
                        {submitted && isSelectedFalse && isTrue && (
                            <XCircle className="w-6 h-6 text-[#FF4B4B] animate-in zoom-in-50" />
                        )}
                    </button>
                </div>

                {/* Feedback / Explanation Box */}
                {submitted && (
                    <div
                        className={cn(
                            "mt-6 p-4 rounded-2xl border-2 border-b-4 animate-in slide-in-from-top-2 duration-300",
                            isCorrectChoice
                                ? "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950"
                                : "bg-rose-50 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1.5 font-black text-sm uppercase">
                            {isCorrectChoice ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                                    <span>Spot on! +{points} Points</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-[#FF4B4B]" />
                                    <span>Not quite! Correct answer is {isTrue ? "TRUE" : "FALSE"}</span>
                                </>
                            )}
                        </div>

                        {explanation && (
                            <div className="flex items-start gap-2 mt-2 text-xs font-bold pt-2 border-t border-slate-200/80 text-slate-800">
                                <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                                <p>{explanation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
