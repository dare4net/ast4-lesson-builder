"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Layers, CheckCircle2, XCircle, Volume2, RefreshCw } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useFeedback } from "@/hooks/use-feedback"

interface Category {
    id: string
    title: string
}

interface CategoriseItem {
    id: string
    text: string
    categoryId: string // Correct target category
}

interface CategoriseRendererProps {
    id?: string
    title?: string
    categories: Category[]
    items: CategoriseItem[]
    points?: number
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
}

const PALETTES = [
    {
        bg: "bg-sky-50/80 border-sky-300 border-b-sky-400",
        headerBg: "bg-sky-500 text-white",
        badgeBg: "bg-sky-100 text-sky-900 border-sky-200",
        hoverBorder: "hover:border-sky-400",
        accentText: "text-sky-900",
    },
    {
        bg: "bg-emerald-50/80 border-emerald-300 border-b-emerald-400",
        headerBg: "bg-emerald-500 text-white",
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
        hoverBorder: "hover:border-emerald-400",
        accentText: "text-emerald-900",
    },
    {
        bg: "bg-amber-50/80 border-amber-300 border-b-amber-400",
        headerBg: "bg-amber-500 text-white",
        badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
        hoverBorder: "hover:border-amber-400",
        accentText: "text-amber-900",
    },
    {
        bg: "bg-purple-50/80 border-purple-300 border-b-purple-400",
        headerBg: "bg-purple-500 text-white",
        badgeBg: "bg-purple-100 text-purple-900 border-purple-200",
        hoverBorder: "hover:border-purple-400",
        accentText: "text-purple-900",
    },
    {
        bg: "bg-rose-50/80 border-rose-300 border-b-rose-400",
        headerBg: "bg-rose-500 text-white",
        badgeBg: "bg-rose-100 text-rose-900 border-rose-200",
        hoverBorder: "hover:border-rose-400",
        accentText: "text-rose-900",
    },
    {
        bg: "bg-teal-50/80 border-teal-300 border-b-teal-400",
        headerBg: "bg-teal-500 text-white",
        badgeBg: "bg-teal-100 text-teal-900 border-teal-200",
        hoverBorder: "hover:border-teal-400",
        accentText: "text-teal-900",
    },
]

export function CategoriseRenderer({
    id = "categorise-component",
    title = "Categorise the Items",
    categories = [],
    items = [],
    points = 20,
    savedState,
    setComponentState,
    isEditing = false,
}: CategoriseRendererProps) {
    // Mapping: itemId -> assignedCategoryId
    const [assignments, setAssignments] = useState<Record<string, string>>({})
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const { speak, isSpeaking } = useReadAloud()
    const { playFeedback } = useFeedback()

    useEffect(() => {
        if (savedState?.assignments) {
            setAssignments(savedState.assignments)
            setSubmitted(true)
        }
    }, [savedState])

    const handleSelectItem = (itemId: string) => {
        if (submitted || isEditing) return
        setSelectedItemId(prev => (prev === itemId ? null : itemId))
        playFeedback("click", { sound: true })
    }

    const handleAssignToCategory = (catId: string) => {
        if (submitted || isEditing || !selectedItemId) return
        setAssignments(prev => ({
            ...prev,
            [selectedItemId]: catId,
        }))
        setSelectedItemId(null)
        playFeedback("click", { sound: true })
    }

    const handleRemoveAssignment = (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (submitted || isEditing) return
        setAssignments(prev => {
            const next = { ...prev }
            delete next[itemId]
            return next
        })
        playFeedback("click", { sound: true })
    }

    const handleCheckAnswers = async () => {
        if (submitted || isEditing) return
        setSubmitted(true)

        let correctCount = 0
        items.forEach(it => {
            if (assignments[it.id] === it.categoryId) {
                correctCount++
            }
        })

        const isAllCorrect = correctCount === items.length
        const earnedPoints = Math.round((correctCount / Math.max(items.length, 1)) * points)

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
                assignments,
                isCorrect: isAllCorrect,
            })
        }
    }

    const handleReset = () => {
        if (isEditing) return
        setAssignments({})
        setSelectedItemId(null)
        setSubmitted(false)
    }

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        const categoriesText = categories.map(c => c.title).join(", ")
        speak(`${title}. Categories: ${categoriesText}`)
    }

    const unassignedItems = items.filter(it => !assignments[it.id])

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-600">
                            Categorisation • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-purple-600")} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <h3 className="text-xl font-black mb-4 text-slate-900 tracking-tight">{title}</h3>

                {/* Item Deck (Unassigned Cards) */}
                {!submitted && (
                    <div className="mb-6 p-4 rounded-2xl bg-slate-50/80 border-2 border-slate-200 border-b-4">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-3">
                            Tap an item card below, then tap a category bucket:
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                            {unassignedItems.map(it => {
                                const isSelected = selectedItemId === it.id

                                return (
                                    <button
                                        key={it.id}
                                        type="button"
                                        onClick={() => handleSelectItem(it.id)}
                                        disabled={isEditing}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-b-4 font-black text-xs transition-all duration-200 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                            isSelected
                                                ? "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-105"
                                                : "bg-white hover:bg-purple-50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-purple-300"
                                        )}
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>{it.text}</span>
                                    </button>
                                )
                            })}

                            {unassignedItems.length === 0 && (
                                <span className="text-xs font-black text-[#58CC02] uppercase tracking-wider py-1">
                                    All items placed into category buckets! Ready to check.
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Category Columns Grid with 3D Duo Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categories.map((cat, idx) => {
                        const palette = PALETTES[idx % PALETTES.length]
                        const assignedItems = items.filter(it => assignments[it.id] === cat.id)

                        return (
                            <div key={cat.id} className="flex flex-col gap-1.5 w-full">
                                {/* Item Count Pill Above Bucket Card */}
                                <div className="flex items-center justify-between px-1">
                                    <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border shadow-xs", palette.badgeBg)}>
                                        {assignedItems.length} item{assignedItems.length === 1 ? "" : "s"}
                                    </span>
                                </div>

                                {/* Category Bucket Card */}
                                <div
                                    onClick={() => handleAssignToCategory(cat.id)}
                                    className={cn(
                                        "min-h-[180px] rounded-2xl border-2 border-b-4 transition-all duration-300 flex flex-col justify-between select-none shadow-sm overflow-hidden",
                                        palette.bg,
                                        selectedItemId && palette.hoverBorder,
                                        selectedItemId && "cursor-pointer scale-[1.01]"
                                    )}
                                >
                                    {/* Category Header Banner */}
                                    <div className={cn("p-3.5 flex items-center justify-between border-b border-black/10", palette.headerBg)}>
                                        <h4 className="font-black text-sm uppercase tracking-wider drop-shadow-sm">
                                            {cat.title}
                                        </h4>
                                    </div>

                                    {/* Items Inside Bucket */}
                                    <div className="p-3 flex-1 space-y-2">
                                        {assignedItems.map(it => {
                                            const isCorrect = submitted && it.categoryId === cat.id
                                            const isIncorrect = submitted && it.categoryId !== cat.id

                                            return (
                                                <div
                                                    key={it.id}
                                                    onClick={(e) => handleRemoveAssignment(it.id, e)}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border-2 border-b-4 font-bold text-xs transition-all shadow-sm",
                                                        !submitted && "bg-white border-slate-200 border-b-slate-300 text-slate-800 hover:border-[#FF4B4B] hover:text-[#FF4B4B] cursor-pointer",
                                                        isCorrect && "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950",
                                                        isIncorrect && "bg-rose-50 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950"
                                                    )}
                                                >
                                                    <span>{it.text}</span>
                                                    {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#58CC02]" />}
                                                    {submitted && isIncorrect && <XCircle className="w-4 h-4 text-[#FF4B4B]" />}
                                                </div>
                                            )
                                        })}
                                        {assignedItems.length === 0 && (
                                            <div className="h-full flex items-center justify-center p-4 border-2 border-dashed border-slate-300/60 rounded-xl">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                                                    Tap item above to assign here
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between gap-4">
                    {submitted ? (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Retry Categorisation</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCheckAnswers}
                            disabled={Object.keys(assignments).length === 0 || isEditing}
                            className={cn(
                                "w-full h-12 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all duration-200 border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                                Object.keys(assignments).length > 0
                                    ? "bg-[#58CC02] hover:bg-[#46a302] text-white border-[#58CC02] border-b-[#3B8C00] shadow-emerald-500/20 cursor-pointer"
                                    : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200 cursor-not-allowed"
                            )}
                        >
                            Check Categorisation
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
