"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Layers, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { buildLiveStartMeta } from "@/lib/live-start-info"
import { useLiveBlock, readTimeLimit } from "@/hooks/use-live-block"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

interface Category {
    id: string
    title: string
}

interface CategoriseItem {
    id: string
    text: string
    categoryId: string
}

interface CategoriseRendererProps {
    id?: string
    title?: string
    categories: Category[]
    items: CategoriseItem[]
    points?: number
    mode?: "practice" | "live"
    timeLimit?: number
    savedState?: CategoriseState
    setComponentState?: (state: CategoriseState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

type CategoriseState = {
    assignments: Record<string, string>
    selectedItemId: string | null
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

const PALETTES = [
    { bg: "bg-sky-50/80 border-sky-300 border-b-sky-400", headerBg: "bg-sky-500 text-white", badgeBg: "bg-sky-100 text-sky-900 border-sky-200", hoverBorder: "hover:border-sky-400" },
    { bg: "bg-emerald-50/80 border-emerald-300 border-b-emerald-400", headerBg: "bg-emerald-500 text-white", badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200", hoverBorder: "hover:border-emerald-400" },
    { bg: "bg-amber-50/80 border-amber-300 border-b-amber-400", headerBg: "bg-amber-500 text-white", badgeBg: "bg-amber-100 text-amber-900 border-amber-200", hoverBorder: "hover:border-amber-400" },
    { bg: "bg-purple-50/80 border-purple-300 border-b-purple-400", headerBg: "bg-purple-500 text-white", badgeBg: "bg-purple-100 text-purple-900 border-purple-200", hoverBorder: "hover:border-purple-400" },
    { bg: "bg-rose-50/80 border-rose-300 border-b-rose-400", headerBg: "bg-rose-500 text-white", badgeBg: "bg-rose-100 text-rose-900 border-rose-200", hoverBorder: "hover:border-rose-400" },
    { bg: "bg-teal-50/80 border-teal-300 border-b-teal-400", headerBg: "bg-teal-500 text-white", badgeBg: "bg-teal-100 text-teal-900 border-teal-200", hoverBorder: "hover:border-teal-400" },
]

function CategoriseContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    isLive,
    mode,
    title,
    categories,
    items,
    points,
    isEditing,
    disabled,
    componentId,
    timeLimit,
}: ScoredRenderProps<CategoriseState> & {
    title: string
    categories: Category[]
    items: CategoriseItem[]
    points: number
    isEditing: boolean
    disabled: boolean
    componentId: string
    timeLimit: number
}) {
    const { assignments, selectedItemId, submitted } = state
    const { playFeedback } = useFeedback()
    const { showStartScreen, setHasStarted } = useLiveBlock({
        isLive,
        isComplete: submitted || state.status === "completed",
        lockId: componentId,
    })

    const handleSelectItem = (itemId: string) => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({
            ...prev,
            selectedItemId: prev.selectedItemId === itemId ? null : itemId,
        }))
        playFeedback("click", { sound: true, animation: false })
    }

    const handleAssignToCategory = (catId: string) => {
        if (submitted || isEditing || disabled || !selectedItemId) return
        const newAssignments = { ...assignments, [selectedItemId]: catId }
        const allAssigned = items.every(it => newAssignments[it.id])

        setState(prev => ({
            ...prev,
            assignments: newAssignments,
            selectedItemId: null,
        }))

        void playFeedback("categorizeSlot", { sound: true, animation: false })
        if (allAssigned) {
            void playFeedback("categorizeBucketComplete", { sound: true, animation: false })
        }
    }

    const handleRemoveAssignment = (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (submitted || isEditing || disabled) return
        setState(prev => {
            const next = { ...prev.assignments }
            delete next[itemId]
            return { ...prev, assignments: next }
        })
        playFeedback("click", { sound: true, animation: false })
    }

    const submitAnswers = async (playSounds = true) => {
        if (submitted || isEditing || disabled) return

        let correctCount = 0
        items.forEach(it => {
            if (assignments[it.id] === it.categoryId) correctCount++
        })

        const isAllCorrect = correctCount === items.length
        const earnedPoints = Math.round((correctCount / Math.max(items.length, 1)) * points)

        if (playSounds) {
            if (isAllCorrect) {
                await playFeedback("quizSuccess", { sound: true })
            } else {
                await playFeedback("incorrect", { sound: true })
            }
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

    const handleCheckAnswers = () => void submitAnswers(true)

    const onTimeout = () => {
        void submitAnswers(false)
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState({
            assignments: {},
            selectedItemId: null,
            submitted: false,
            status: "active",
        })
    }

    const unassignedItems = items.filter(it => !assignments[it.id])

    if (showStartScreen) {
        const liveMeta = buildLiveStartMeta({
            type: "categorise",
            title: title || "Categorise",
            timeLimitSec: timeLimit,
            points,
            units: items.length,
        })
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                {...liveMeta}
            />
        )
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-2">
            <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-950/60 border-2 border-violet-200 dark:border-violet-800 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                        Categorisation • {points} Points
                    </span>
                </div>
                {isLive ? (
                    <LiveTimer isCompleted={submitted} duration={timeLimit} onTimeout={onTimeout} />
                ) : null}
            </div>

            <FormattedText content={title} as="h3" className="text-xl md:text-2xl font-black mb-3 text-slate-900 dark:text-slate-100 tracking-tight shrink-0" />

            {!submitted && (
                <div className="mb-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 shrink-0 max-h-[140px] overflow-y-auto shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                        Tap an item card below, then tap a category bucket:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {unassignedItems.map(it => (
                            <button
                                key={it.id}
                                type="button"
                                onClick={() => handleSelectItem(it.id)}
                                disabled={isEditing || disabled}
                                className={cn(
                                    "flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-b-4 font-extrabold text-xs transition-all duration-200 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                    selectedItemId === it.id
                                        ? "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-105"
                                        : "bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 border-b-slate-300 dark:border-b-slate-800 text-slate-800 dark:text-slate-200 hover:border-[#1CB0F6]/60"
                                )}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <FormattedText content={it.text} as="span" />
                            </button>
                        ))}
                        {unassignedItems.length === 0 && (
                            <span className="text-xs font-black text-[#58CC02] uppercase tracking-wider py-1">
                                All items placed into category buckets! Ready to check.
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1 min-h-0 overflow-y-auto p-4 -m-4">
                {categories.map((cat, idx) => {
                    const palette = PALETTES[idx % PALETTES.length]
                    const assignedItems = items.filter(it => assignments[it.id] === cat.id)

                    return (
                        <div key={cat.id} className="flex flex-col gap-1.5 w-full shrink-0 sm:shrink min-h-[160px] sm:min-h-0 p-1">
                            <div className="flex items-center justify-between px-1">
                                <span className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border shadow-xs", palette.badgeBg)}>
                                    {assignedItems.length} item{assignedItems.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            <div
                                onClick={() => handleAssignToCategory(cat.id)}
                                className={cn(
                                    "flex-1 min-h-[140px] rounded-2xl border-2 border-b-4 transition-all duration-300 flex flex-col justify-between select-none shadow-sm p-0.5",
                                    palette.bg,
                                    selectedItemId && palette.hoverBorder,
                                    selectedItemId && "cursor-pointer scale-[1.04] shadow-xl z-10"
                                )}
                            >
                                <div className={cn("p-2.5 flex items-center justify-between border-b border-black/10 shrink-0 rounded-t-xl", palette.headerBg)}>
                                    <FormattedText content={cat.title} as="h4" className="font-black text-xs uppercase tracking-wider drop-shadow-sm" />
                                </div>
                                <div className="p-2.5 flex-1 space-y-2 overflow-y-auto min-h-[80px]">
                                    {assignedItems.map(it => {
                                        const isCorrect = submitted && it.categoryId === cat.id
                                        const isIncorrect = submitted && it.categoryId !== cat.id
                                        return (
                                            <div
                                                key={it.id}
                                                onClick={(e) => handleRemoveAssignment(it.id, e)}
                                                className={cn(
                                                    "flex items-center justify-between p-2.5 rounded-xl border-2 border-b-4 font-extrabold text-xs transition-all shadow-sm",
                                                    !submitted && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 border-b-slate-300 text-slate-800 dark:text-slate-200 hover:border-[#FF4B4B] hover:text-[#FF4B4B] cursor-pointer",
                                                    isCorrect && "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950",
                                                    isIncorrect && "bg-rose-50 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950"
                                                )}
                                            >
                                                <FormattedText content={it.text} as="span" />
                                                {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#58CC02]" />}
                                                {submitted && isIncorrect && <XCircle className="w-4 h-4 text-[#FF4B4B]" />}
                                            </div>
                                        )
                                    })}
                                    {assignedItems.length === 0 && (
                                        <div className="h-full min-h-[50px] flex items-center justify-center p-3 border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 rounded-xl">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
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

            {/* Reserved Footer Height to Prevent Layout Shift */}
            <div className="mt-4 flex items-center justify-center gap-4 shrink-0 min-h-[56px]">
                {submitted ? (
                    <button type="button" onClick={handleReset} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Categorisation</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleCheckAnswers}
                        disabled={Object.keys(assignments).length === 0 || isEditing || disabled}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all duration-200 border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                            Object.keys(assignments).length > 0
                                ? "bg-[#58CC02] hover:bg-[#46a302] text-white border-[#58CC02] border-b-[#3B8C00] shadow-emerald-500/20 cursor-pointer"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 border-b-slate-300 shadow-none cursor-not-allowed"
                        )}
                    >
                        Check Categorisation
                    </button>
                )}
            </div>
        </div>
    )
}

export function CategoriseRenderer({
    id = "categorise-component",
    title = "Categorise the Items",
    categories = [],
    items = [],
    points = 20,
    mode = "practice",
    timeLimit: timeLimitProp = 30,
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: CategoriseRendererProps) {
    const component: Component = {
        id,
        type: "categorise",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, categories, items, points },
        mode: mode as any,
    } as Component

    const initialState: CategoriseState = {
        assignments: {},
        selectedItemId: null,
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
        <ScoredRenderer<CategoriseState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <CategoriseContent
                    {...renderProps}
                    title={title}
                    categories={categories}
                    items={items}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                    componentId={id}
                    timeLimit={readTimeLimit(timeLimitProp, 30)}
                />
            )}
        />
    )
}
