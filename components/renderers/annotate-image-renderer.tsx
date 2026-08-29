"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Tag, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

interface AnnotationLabel {
    id: string
    text: string
    x: number
    y: number
}

interface AnnotateImageRendererProps {
    id?: string
    title?: string
    image: string
    labels: AnnotationLabel[]
    points?: number
    mode?: "practice" | "live"
    savedState?: AnnotateImageState
    setComponentState?: (state: AnnotateImageState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

type AnnotateImageState = {
    placements: Record<string, string>
    selectedTag: string | null
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

function AnnotateImageContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    mode,
    title,
    image,
    labels,
    points,
    isEditing,
    disabled,
}: ScoredRenderProps<AnnotateImageState> & {
    title: string
    image: string
    labels: AnnotationLabel[]
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { placements, selectedTag, submitted } = state
    const { playFeedback } = useFeedback()

    const handleTagClick = (labelId: string) => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({
            ...prev,
            selectedTag: prev.selectedTag === labelId ? null : labelId,
        }))
        playFeedback("click", { sound: true, animation: false })
    }

    const handleTargetClick = (targetId: string) => {
        if (submitted || isEditing || disabled || !selectedTag) return
        const newPlacements = { ...placements, [targetId]: selectedTag }
        const allPlaced = labels.every(lbl => newPlacements[lbl.id])

        setState(prev => ({
            ...prev,
            placements: newPlacements,
            selectedTag: null,
        }))

        void playFeedback("categorizeSlot", { sound: true, animation: false })
        if (allPlaced) {
            void playFeedback("categorizeBucketComplete", { sound: true, animation: false })
        }
    }

    const handleRemovePlacement = (targetId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (submitted || isEditing || disabled) return
        setState(prev => {
            const next = { ...prev.placements }
            delete next[targetId]
            return { ...prev, placements: next }
        })
        playFeedback("click", { sound: true, animation: false })
    }

    const handleCheckAnswers = async () => {
        if (submitted || isEditing || disabled) return

        let correctCount = 0
        labels.forEach(lbl => {
            if (placements[lbl.id] === lbl.id) correctCount++
        })

        const isAllCorrect = correctCount === labels.length
        const earnedPoints = Math.round((correctCount / Math.max(labels.length, 1)) * points)

        if (isAllCorrect) {
            await playFeedback("quizSuccess", { sound: true })
        } else {
            await playFeedback("incorrect", { sound: true })
        }

        setState(prev => ({
            ...prev,
            submitted: true,
            isCorrect: isAllCorrect,
            status: "completed",
            score: earnedPoints,
            maxScore: points,
        }))

        handlePoints(earnedPoints)
        recordAttempt(isAllCorrect, earnedPoints, points)
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState({
            placements: {},
            selectedTag: null,
            submitted: false,
            status: "active",
        })
    }

    return (
        <div className="w-full h-auto md:h-full md:flex-1 flex flex-col justify-start md:justify-center px-4 sm:px-6 py-2 relative min-h-0 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-teal-600">
                        Annotate Diagram • {points} Points
                    </span>
                </div>
            </div>

            <FormattedText content={title} as="h3" className="text-lg font-black mb-3 text-slate-900 tracking-tight shrink-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center flex-1 min-h-0 overflow-hidden">
                <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-3 min-h-0">
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
                                        <button key={label.id} type="button" onClick={() => handleTagClick(label.id)} disabled={isPlaced || isEditing || disabled}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-b-4 font-black text-xs transition-all duration-200 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                                isSelected && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-105",
                                                !isSelected && !isPlaced && "bg-white hover:bg-teal-50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-teal-300",
                                                isPlaced && "opacity-40 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400 cursor-not-allowed"
                                            )}>
                                            <Tag className="w-3 h-3" />
                                            <FormattedText content={label.text} as="span" />
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

                    <div className="shrink-0 pt-1">
                        {submitted ? (
                            <button type="button" onClick={handleReset} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer">
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry Annotation</span>
                            </button>
                        ) : (
                            <button type="button" onClick={handleCheckAnswers} disabled={Object.keys(placements).length === 0 || isEditing || disabled}
                                className={cn(
                                    "w-full h-11 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all duration-200 border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                                    Object.keys(placements).length > 0
                                        ? "bg-[#58CC02] hover:bg-[#46a302] text-white border-[#58CC02] border-b-[#3B8C00] shadow-emerald-500/20 cursor-pointer"
                                        : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200 cursor-not-allowed"
                                )}>
                                Check Annotations
                            </button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8 relative w-full aspect-video max-h-[50vh] rounded-2xl overflow-hidden border-2 border-slate-200 border-b-4 bg-slate-900 shadow-sm shrink-0">
                    <img src={image} alt={title} className="w-full h-full object-cover select-none" />
                    {labels.map((lbl, idx) => {
                        const placedLabelId = placements[lbl.id]
                        const placedLabel = labels.find(l => l.id === placedLabelId)
                        const isCorrect = submitted && placedLabelId === lbl.id
                        const isIncorrect = submitted && placedLabelId && placedLabelId !== lbl.id
                        return (
                            <div key={lbl.id} style={{ left: `${lbl.x * 100}%`, top: `${lbl.y * 100}%` }} onClick={() => handleTargetClick(lbl.id)}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10">
                                {placedLabel ? (
                                    <div onClick={(e) => handleRemovePlacement(lbl.id, e)}
                                        className={cn(
                                            "flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-b-4 font-black text-xs shadow-lg transition-all duration-200 animate-in zoom-in-50 cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                            !submitted && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] hover:bg-[#FF4B4B] hover:border-[#FF4B4B] hover:border-b-[#CC3C3C]",
                                            isCorrect && "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950",
                                            isIncorrect && "bg-rose-50 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950"
                                        )}>
                                        <FormattedText content={placedLabel.text} as="span" />
                                        {submitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-[#58CC02]" />}
                                        {submitted && isIncorrect && <XCircle className="w-3.5 h-3.5 text-[#FF4B4B]" />}
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "w-8 h-8 rounded-2xl border-2 border-b-4 flex items-center justify-center font-black text-xs transition-all duration-200 shadow-md",
                                        selectedTag ? "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] animate-bounce scale-110" : "bg-white border-slate-200 border-b-slate-300 text-slate-800 hover:border-teal-400"
                                    )}>
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

export function AnnotateImageRenderer({
    id = "annotate-image-component",
    title = "Label the Diagram",
    image = "/placeholder.svg?height=400&width=600",
    labels = [],
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: AnnotateImageRendererProps) {
    const component: Component = {
        id,
        type: "annotateImage",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, image, labels, points },
        mode: mode as any,
    } as Component

    const initialState: AnnotateImageState = {
        placements: {},
        selectedTag: null,
        submitted: false,
        status: "active",
    }

    const mergedSavedState = savedState
        ? {
            ...initialState,
            ...savedState,
            submitted: savedState.submitted ?? savedState.status === "completed",
        }
        : undefined

    return (
        <ScoredRenderer<AnnotateImageState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <AnnotateImageContent
                    {...renderProps}
                    title={title}
                    image={image}
                    labels={labels}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
