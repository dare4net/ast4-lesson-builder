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
            <div className="relative w-full max-w-4xl bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
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
                    <div className="mb-6 p-4 rounded-2xl bg-slate-50/70 border-2 border-slate-200 border-b-4">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-3">
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
                                <span className="text-xs font-black text-[#58CC02] uppercase tracking-wider">
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
                                    "min-h-[170px] p-4 rounded-2xl border-2 border-b-4 transition-all duration-300 flex flex-col justify-between select-none shadow-sm",
                                    selectedItemId
                                        ? "bg-purple-50/60 border-purple-300 border-b-purple-400 hover:bg-purple-100/60 cursor-pointer"
                                        : "bg-slate-50/40 border-slate-200 border-b-slate-300"
                                )}
                            >
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                                    <h4 className="font-black text-sm text-purple-900 uppercase tracking-wider">
                                        {cat.title}
                                    </h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
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
