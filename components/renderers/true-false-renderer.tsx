"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Volume2, HelpCircle } from "lucide-react"
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
        <div className={cn(
            "w-full h-full flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 px-6"
        )}>
            {/* TOP SECTION: Meta & Title */}
            <div className="shrink-0 space-y-3 pt-2">
                <div className="relative flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-indigo-600/60 uppercase tracking-[0.2em]">Activity</span>
                        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">True or False</h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 cursor-pointer"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-indigo-600")} />
                        <span className="text-[8px] font-black uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Statement</span>
                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter">{points} pts</span>
                    </div>
                    <div className="h-1.5 w-full bg-indigo-50 rounded-full overflow-hidden">
                        <div className={cn(
                            "h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500 ease-out",
                            submitted ? "w-full" : "w-0"
                        )} />
                    </div>
                </div>
            </div>

            {/* CENTER SECTION: Statement + Choices */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-2">
                <div className="relative space-y-4 my-auto">
                    {/* Question label + statement */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-indigo-500 rounded-full" />
                            <span className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em]">Is this TRUE or FALSE?</span>
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">{statement}</h2>
                    </div>

                    {/* Choice buttons — styled like quiz option buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* TRUE */}
                        <button
                            type="button"
                            onClick={() => handleSelect(true)}
                            disabled={submitted || isEditing}
                            className={cn(
                                'w-full p-3.5 text-left transition-all duration-200 relative rounded-2xl border-2 bg-white shadow-sm overflow-hidden',
                                'border-b-4 active:border-b-0 active:translate-y-[2px]',
                                !submitted && 'border-slate-200 hover:border-[#58CC02]/60 hover:bg-[#58CC02]/5 hover:shadow-md cursor-pointer',
                                submitted && isTrue && 'bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg',
                                submitted && isSelectedTrue && !isTrue && 'bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]',
                                submitted && !isSelectedTrue && !isTrue && 'opacity-40 cursor-not-allowed',
                                submitted && !isSelectedTrue && isTrue && 'cursor-not-allowed'
                            )}
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors shrink-0",
                                        submitted && isTrue ? "bg-white/30 text-white border-white/30" :
                                            submitted && isSelectedTrue && !isTrue ? "bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/30" :
                                                "bg-slate-50 text-slate-400 border-slate-200 group-hover:border-[#58CC02]/50"
                                    )}>T</span>
                                    <span className="font-bold text-sm tracking-tight">TRUE</span>
                                </div>
                                {submitted && isTrue && <CheckCircle2 className="w-5 h-5 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                {submitted && isSelectedTrue && !isTrue && <XCircle className="w-5 h-5 text-[#FF4B4B] stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                            </div>
                        </button>

                        {/* FALSE */}
                        <button
                            type="button"
                            onClick={() => handleSelect(false)}
                            disabled={submitted || isEditing}
                            className={cn(
                                'w-full p-3.5 text-left transition-all duration-200 relative rounded-2xl border-2 bg-white shadow-sm overflow-hidden',
                                'border-b-4 active:border-b-0 active:translate-y-[2px]',
                                !submitted && 'border-slate-200 hover:border-[#FF4B4B]/60 hover:bg-[#FF4B4B]/5 hover:shadow-md cursor-pointer',
                                submitted && !isTrue && 'bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg',
                                submitted && isSelectedFalse && isTrue && 'bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]',
                                submitted && !isSelectedFalse && isTrue && 'opacity-40 cursor-not-allowed',
                                submitted && !isSelectedFalse && !isTrue && 'cursor-not-allowed'
                            )}
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors shrink-0",
                                        submitted && !isTrue ? "bg-white/30 text-white border-white/30" :
                                            submitted && isSelectedFalse && isTrue ? "bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/30" :
                                                "bg-slate-50 text-slate-400 border-slate-200"
                                    )}>F</span>
                                    <span className="font-bold text-sm tracking-tight">FALSE</span>
                                </div>
                                {submitted && !isTrue && <CheckCircle2 className="w-5 h-5 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                                {submitted && isSelectedFalse && isTrue && <XCircle className="w-5 h-5 text-[#FF4B4B] stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: Jump-proof feedback slot */}
            <div className="shrink-0 space-y-3 pb-4 pt-1">
                <div className="min-h-[52px] flex flex-col justify-end">
                    {submitted && (
                        <div className={cn(
                            'p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm',
                            isCorrectChoice
                                ? 'bg-emerald-50/50 border-emerald-500/20 shadow-emerald-500/5'
                                : 'bg-rose-50/50 border-rose-500/20 shadow-rose-500/5'
                        )}>
                            <div className="flex items-center gap-2 mb-1">
                                {isCorrectChoice ? (
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Correct! +{points} Points</span>
                                ) : (
                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Incorrect — answer is {isTrue ? "TRUE" : "FALSE"}</span>
                                )}
                            </div>
                            {isCorrectChoice ? (
                                <p className="text-sm font-black text-slate-900 leading-tight italic">Spot on! Well done!</p>
                            ) : (
                                <p className="text-sm font-black text-slate-900 leading-tight">Not quite — keep going!</p>
                            )}
                            {explanation && (
                                <p className="text-xs font-bold text-slate-600 leading-tight mt-1">{explanation}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
