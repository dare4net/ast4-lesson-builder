"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tag, CheckCircle2, XCircle, Volume2, RefreshCw } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useFeedback } from "@/hooks/use-feedback"

interface AnnotationLabel {
    id: string
    text: string
    x: number // Decimal coordinate 0.0 to 1.0
    y: number // Decimal coordinate 0.0 to 1.0
}

interface AnnotateImageRendererProps {
    id?: string
    title?: string
    image: string
    labels: AnnotationLabel[]
    points?: number
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
}

export function AnnotateImageRenderer({
    id = "annotate-image-component",
    title = "Label the Diagram",
    image = "/placeholder.svg?height=400&width=600",
    labels = [],
    points = 15,
    savedState,
    setComponentState,
    isEditing = false,
}: AnnotateImageRendererProps) {
    // Placement map: labelId -> targetLabelId
    const [placements, setPlacements] = useState<Record<string, string>>({})
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const { speak, isSpeaking } = useReadAloud()
    const { playFeedback } = useFeedback()

    useEffect(() => {
        if (savedState?.placements) {
            setPlacements(savedState.placements)
            setSubmitted(true)
        }
    }, [savedState])

    const handleTagClick = (labelId: string) => {
        if (submitted || isEditing) return
        setSelectedTag(prev => (prev === labelId ? null : labelId))
        playFeedback("click", { sound: true })
    }

    const handleTargetClick = (targetId: string) => {
        if (submitted || isEditing || !selectedTag) return

        setPlacements(prev => ({
            ...prev,
            [targetId]: selectedTag,
        }))
        setSelectedTag(null)
        playFeedback("click", { sound: true })
    }

    const handleRemovePlacement = (targetId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (submitted || isEditing) return
        setPlacements(prev => {
            const next = { ...prev }
            delete next[targetId]
            return next
        })
        playFeedback("click", { sound: true })
    }

    const handleCheckAnswers = async () => {
        if (submitted || isEditing) return
        setSubmitted(true)

        let correctCount = 0
        labels.forEach(lbl => {
            if (placements[lbl.id] === lbl.id) {
                correctCount++
            }
        })

        const isAllCorrect = correctCount === labels.length
        const earnedPoints = Math.round((correctCount / Math.max(labels.length, 1)) * points)

        if (isAllCorrect) {
            await playFeedback("quizSuccess", { sound: true })
        } else {
            await playFeedback("incorrect", { sound: true })
        }

        if (setComponentState) {
            setComponentState({
                status: "completed",
                score: earnedPoints,
                maxScore: points,
                placements,
                isCorrect: isAllCorrect,
            })
        }
    }

    const handleReset = () => {
        if (isEditing) return
        setPlacements({})
        setSelectedTag(null)
        setSubmitted(false)
    }

    const unplacedLabels = labels.filter(lbl => !Object.values(placements).includes(lbl.id))

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        const tagsText = labels.map(l => l.text).join(", ")
        speak(`${title}. Available labels: ${tagsText}`)
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col justify-center px-4 sm:px-6 py-2 relative min-h-0 overflow-hidden text-slate-900">
            {/* Header Bar */}
            <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-teal-600">
                        Annotate Diagram • {points} Points
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleSpeak}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                    title="Read Aloud"
                >
                    <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-teal-600")} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Listen</span>
                </button>
            </div>

            <h3 className="text-lg font-black mb-3 text-slate-900 tracking-tight shrink-0">{title}</h3>

            {/* Main Landscape Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center flex-1 min-h-0 overflow-hidden">

                {/* Left Column: Label Tags Bank + Action Controls */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-3 min-h-0">
                    {/* Available Tags Bank */}
                    {!submitted ? (
                        <div className="p-3.5 rounded-2xl bg-slate-50/80 border-2 border-slate-200 border-b-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2 shrink-0">
                                Tap a tag, then tap a node:
                            </span>
                            <div className="flex flex-wrap gap-2 overflow-y-auto">
                                {labels.map(label => {
                                    const isPlaced = Object.values(placements).includes(label.id)
                                    const isSelected = selectedTag === label.id

                                    return (
                                        <button
                                            key={label.id}
                                            type="button"
                                            onClick={() => handleTagClick(label.id)}
                                            disabled={isPlaced || isEditing}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-b-4 font-black text-xs transition-all duration-200 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                                isSelected && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-105",
                                                !isSelected && !isPlaced && "bg-white hover:bg-teal-50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-teal-300",
                                                isPlaced && "opacity-40 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400 cursor-not-allowed active:border-b-4 active:translate-y-0"
                                            )}
                                        >
                                            <Tag className="w-3 h-3" />
                                            <span>{label.text}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 border-b-4 text-center shrink-0">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 block">
                                Annotation complete! Review your placements on the diagram.
                            </span>
                        </div>
                    )}

                    {/* Action Controls */}
                    <div className="shrink-0 pt-1">
                        {submitted ? (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry Annotation</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleCheckAnswers}
                                disabled={Object.keys(placements).length === 0 || isEditing}
                                className={cn(
                                    "w-full h-11 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all duration-200 border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                                    Object.keys(placements).length > 0
                                        ? "bg-[#58CC02] hover:bg-[#46a302] text-white border-[#58CC02] border-b-[#3B8C00] shadow-emerald-500/20 cursor-pointer"
                                        : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200 cursor-not-allowed"
                                )}
                            >
                                Check Annotations
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Diagram Canvas with Target Drop Zones */}
                <div className="lg:col-span-8 relative w-full aspect-video max-h-[50vh] rounded-2xl overflow-hidden border-2 border-slate-200 border-b-4 bg-slate-900 shadow-sm shrink-0">
                    <img src={image} alt={title} className="w-full h-full object-cover select-none" />

                    {/* Target Target Nodes */}
                    {labels.map((lbl, idx) => {
                        const placedLabelId = placements[lbl.id]
                        const placedLabel = labels.find(l => l.id === placedLabelId)
                        const isCorrect = submitted && placedLabelId === lbl.id
                        const isIncorrect = submitted && placedLabelId && placedLabelId !== lbl.id

                        return (
                            <div
                                key={lbl.id}
                                style={{ left: `${lbl.x * 100}%`, top: `${lbl.y * 100}%` }}
                                onClick={() => handleTargetClick(lbl.id)}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                            >
                                {placedLabel ? (
                                    <div
                                        onClick={(e) => handleRemovePlacement(lbl.id, e)}
                                        className={cn(
                                            "flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-b-4 font-black text-xs shadow-lg transition-all duration-200 animate-in zoom-in-50 cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                            !submitted && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] hover:bg-[#FF4B4B] hover:border-[#FF4B4B] hover:border-b-[#CC3C3C]",
                                            isCorrect && "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950",
                                            isIncorrect && "bg-rose-50 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950"
                                        )}
                                    >
                                        <span>{placedLabel.text}</span>
                                        {submitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-[#58CC02]" />}
                                        {submitted && isIncorrect && <XCircle className="w-3.5 h-3.5 text-[#FF4B4B]" />}
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-2xl border-2 border-b-4 flex items-center justify-center font-black text-xs transition-all duration-200 shadow-md",
                                            selectedTag
                                                ? "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] animate-bounce scale-110"
                                                : "bg-white border-slate-200 border-b-slate-300 text-slate-800 hover:border-teal-400"
                                        )}
                                    >
                                        {idx + 1}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
