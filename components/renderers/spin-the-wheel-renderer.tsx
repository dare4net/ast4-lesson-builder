"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Sparkles, RotateCw, Volume2, Award } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useFeedback } from "@/hooks/use-feedback"

interface WheelItem {
    id: string
    text: string
}

interface SpinTheWheelRendererProps {
    id?: string
    title?: string
    items: WheelItem[]
    points?: number
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
}

export function SpinTheWheelRenderer({
    id = "spin-the-wheel-component",
    title = "Spin the Wheel",
    items = [],
    points = 10,
    savedState,
    setComponentState,
    isEditing = false,
}: SpinTheWheelRendererProps) {
    const [rotation, setRotation] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(savedState?.selectedIndex ?? null)
    const [completed, setCompleted] = useState(!!savedState?.completed)

    const { speak, isSpeaking } = useReadAloud()
    const { playFeedback } = useFeedback()

    const sliceAngle = 360 / Math.max(items.length, 1)

    const handleSpin = async () => {
        if (isSpinning || isEditing) return

        setIsSpinning(true)
        playFeedback("click", { sound: true })

        // Pick random target slice
        const targetIdx = Math.floor(Math.random() * items.length)
        const extraSpins = (3 + Math.floor(Math.random() * 3)) * 360
        const targetDegree = extraSpins + (360 - targetIdx * sliceAngle - sliceAngle / 2)

        setRotation(targetDegree)

        setTimeout(async () => {
            setIsSpinning(false)
            setSelectedIndex(targetIdx)
            setCompleted(true)

            await playFeedback("quizSuccess", { sound: true })

            if (setComponentState) {
                setComponentState({
                    status: "completed",
                    score: points,
                    maxScore: points,
                    selectedIndex: targetIdx,
                    selectedText: items[targetIdx]?.text,
                    completed: true,
                })
            }
        }, 3500)
    }

    const selectedItem = selectedIndex !== null ? items[selectedIndex] : null

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (selectedItem) {
            speak(`Wheel selected: ${selectedItem.text}`)
        } else {
            speak(`${title}. Spin the wheel to select a random question.`)
        }
    }

    const colors = [
        "from-rose-500 to-red-600",
        "from-amber-500 to-yellow-600",
        "from-emerald-500 to-teal-600",
        "from-sky-500 to-blue-600",
        "from-indigo-500 to-purple-600",
        "from-pink-500 to-rose-600",
    ]

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col items-center">
                {/* Header Bar */}
                <div className="w-full flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                            Spin the Wheel • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-amber-400")} />
                        <span className="text-[10px] uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <h3 className="text-xl font-black mb-6 text-white text-center">{title}</h3>

                {/* Wheel Container */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 my-4 flex items-center justify-center">
                    {/* Wheel Pointer */}
                    <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-lg" />

                    {/* Wheel Disc */}
                    <div
                        className="w-full h-full rounded-full border-4 border-slate-800 bg-slate-950 relative overflow-hidden shadow-2xl transition-all duration-[3500ms] cubic-bezier(0.15, 0.90, 0.20, 1.00)"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        {items.map((it, idx) => {
                            const rotateVal = idx * sliceAngle
                            const colorClass = colors[idx % colors.length]

                            return (
                                <div
                                    key={it.id || idx}
                                    className={cn(
                                        "absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left bg-gradient-to-br border border-slate-900/40 flex items-center justify-center p-2",
                                        colorClass
                                    )}
                                    style={{
                                        transform: `rotate(${rotateVal}deg) skewY(${-(90 - sliceAngle)}deg)`,
                                    }}
                                >
                                    <span
                                        className="text-[10px] font-black text-white uppercase tracking-wider line-clamp-1 transform rotate-45 -translate-y-4"
                                        style={{ transform: `rotate(${sliceAngle / 2}deg)` }}
                                    >
                                        #{idx + 1}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Center Spinner Button Hub */}
                    <button
                        type="button"
                        onClick={handleSpin}
                        disabled={isSpinning || isEditing}
                        className={cn(
                            "absolute z-20 w-16 h-16 rounded-full border-4 border-slate-800 bg-slate-900 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95",
                            isSpinning ? "animate-pulse text-amber-400" : "text-white hover:bg-slate-800 hover:border-amber-400"
                        )}
                    >
                        <RotateCw className={cn("w-5 h-5 mb-0.5", isSpinning && "animate-spin text-amber-400")} />
                        <span className="text-[9px]">SPIN</span>
                    </button>
                </div>

                {/* Selected Result Card */}
                {selectedItem && (
                    <div className="w-full mt-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <Award className="w-8 h-8 text-amber-400 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">
                            Wheel Result
                        </span>
                        <p className="text-base font-extrabold text-white">{selectedItem.text}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
