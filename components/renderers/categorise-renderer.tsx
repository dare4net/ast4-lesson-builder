"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Layers, CheckCircle2, XCircle, Volume2, Sparkles, RefreshCw } from "lucide-react"
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
            <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-slate-100">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                            Categorisation • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-purple-400")} />
                        <span className="text-[10px] uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <h3 className="text-xl font-black mb-4 text-white">{title}</h3>

                {/* Item Deck (Unassigned Cards) */}
                {!submitted && (
                    <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-3">
                            Tap an item, then tap a category column:
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
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-md",
                                            isSelected
                                                ? "bg-purple-500 text-slate-950 border-purple-300 shadow-purple-500/20 scale-105"
                                                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-purple-200"
                                        )}
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>{it.text}</span>
                                    </button>
                                )
                            })}

                            {unassignedItems.length === 0 && (
                                <span className="text-xs font-bold text-emerald-400 italic">
                                    All items placed into categories! Ready to check.
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Category Columns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => {
                        const assignedItems = items.filter(it => assignments[it.id] === cat.id)

                        return (
                            <div
                                key={cat.id}
                                onClick={() => handleAssignToCategory(cat.id)}
                                className={cn(
                                    "min-h-[160px] p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between select-none",
                                    selectedItemId
                                        ? "bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20 cursor-pointer"
                                        : "bg-slate-950/60 border-slate-800"
                                )}
                            >
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                                    <h4 className="font-extrabold text-sm text-purple-300 uppercase tracking-wider">
                                        {cat.title}
                                    </h4>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">
                                        {assignedItems.length} items
                                    </span>
                                </div>

                                <div className="flex-1 space-y-2">
                                    {assignedItems.map(it => {
                                        const isCorrect = submitted && it.categoryId === cat.id
                                        const isIncorrect = submitted && it.categoryId !== cat.id

                                        return (
                                            <div
                                                key={it.id}
                                                onClick={(e) => handleRemoveAssignment(it.id, e)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border font-bold text-xs transition-all shadow-sm",
                                                    !submitted && "bg-slate-800 border-slate-700 text-slate-200 hover:border-rose-500 hover:text-white cursor-pointer",
                                                    isCorrect && "bg-emerald-500/20 border-emerald-500 text-emerald-200",
                                                    isIncorrect && "bg-rose-500/20 border-rose-500 text-rose-200"
                                                )}
                                            >
                                                <span>{it.text}</span>
                                                {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                                {submitted && isIncorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                                            </div>
                                        )
                                    })}
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
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer"
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
                                "w-full py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all duration-300 shadow-lg",
                                Object.keys(assignments).length > 0
                                    ? "bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-purple-500/20 active:scale-95 cursor-pointer"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
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
