"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Tag, CheckCircle2, XCircle, RefreshCw, Eraser, Info } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import type { Component } from "@/types/lesson"

export interface AnnotationToken {
    id: string
    text: string
    correctLabel?: string // Optional expected label ID for automatic scoring
}

export interface AnnotationLabel {
    id: string
    text: string
    color?: string // Tailwind color class or hex
}

export interface AnnotationBoardRendererProps {
    id?: string
    title?: string
    instruction?: string
    passage?: string
    groups?: { id?: string; wordIndices: number[]; labelId?: string }[]
    correctAnswers?: { wordIndex?: number; wordIndices?: number[]; labelId: string }[]
    tokens?: AnnotationToken[]
    labels?: AnnotationLabel[]
    selectableUnit?: "word" | "phrase" | "sentence"
    points?: number
    mode?: "practice" | "live"
    savedState?: AnnotationBoardState
    setComponentState?: (state: AnnotationBoardState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

export type AnnotationBoardState = {
    /** Token ID -> Assigned Label ID */
    placements: Record<string, string>
    activeLabelId: string | null
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

const DEFAULT_LABELS: AnnotationLabel[] = [
    { id: "subject", text: "Subject", color: "#1CB0F6" },
    { id: "predicate", text: "Predicate", color: "#58CC02" },
    { id: "object", text: "Object", color: "#FFC800" },
    { id: "complement", text: "Complement", color: "#CE82FF" },
]

const DEFAULT_TOKENS: AnnotationToken[] = [
    { id: "t1", text: "The", correctLabel: "subject" },
    { id: "t2", text: "quick", correctLabel: "subject" },
    { id: "t3", text: "brown", correctLabel: "subject" },
    { id: "t4", text: "fox", correctLabel: "subject" },
    { id: "t5", text: "jumps", correctLabel: "predicate" },
    { id: "t6", text: "over", correctLabel: "object" },
    { id: "t7", text: "the", correctLabel: "object" },
    { id: "t8", text: "lazy", correctLabel: "object" },
    { id: "t9", text: "dog.", correctLabel: "object" },
]

function AnnotationBoardContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    mode,
    title,
    instruction,
    passage,
    groups = [],
    correctAnswers = [],
    tokens: rawTokens,
    labels = DEFAULT_LABELS,
    points = 15,
    isEditing,
    disabled,
}: ScoredRenderProps<AnnotationBoardState> & {
    title: string
    instruction?: string
    passage?: string
    groups?: { id?: string; wordIndices: number[]; labelId?: string }[]
    correctAnswers?: { wordIndex?: number; wordIndices?: number[]; labelId: string }[]
    tokens?: AnnotationToken[]
    labels: AnnotationLabel[]
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { placements, activeLabelId, submitted } = state
    const { playFeedback } = useFeedback()

    // Derive effective tokens & groups: if passage is provided, auto-split and merge contiguous word groups
    const tokens: AnnotationToken[] = React.useMemo(() => {
        if (passage && passage.trim()) {
            const words = passage.trim().split(/\s+/)
            const processedIndices = new Set<number>()
            const derivedTokens: AnnotationToken[] = []

            // Gather all groups (from groups prop or correctAnswers with multi-word wordIndices)
            const allGroups: { wordIndices: number[]; labelId?: string }[] = []

            if (Array.isArray(groups)) {
                groups.forEach(g => {
                    if (g.wordIndices && g.wordIndices.length > 1) {
                        allGroups.push(g)
                    }
                })
            }

            if (Array.isArray(correctAnswers)) {
                correctAnswers.forEach(ans => {
                    if (ans.wordIndices && ans.wordIndices.length > 1) {
                        const key = [...ans.wordIndices].sort((a, b) => a - b).join("-")
                        if (!allGroups.some(g => [...g.wordIndices].sort((a, b) => a - b).join("-") === key)) {
                            allGroups.push({ wordIndices: ans.wordIndices, labelId: ans.labelId })
                        }
                    }
                })
            }

            // Sort groups by starting word index
            allGroups.sort((a, b) => Math.min(...a.wordIndices) - Math.min(...b.wordIndices))

            allGroups.forEach(grp => {
                const indices = [...grp.wordIndices].sort((a, b) => a - b)
                if (!indices.some(idx => processedIndices.has(idx))) {
                    indices.forEach(idx => processedIndices.add(idx))
                    const phrase = indices.map(idx => words[idx]).filter(Boolean).join(" ")
                    const matchingAns = correctAnswers?.find(a => {
                        const aIndices = a.wordIndices || (a.wordIndex !== undefined ? [a.wordIndex] : [])
                        return aIndices.length === indices.length && aIndices.every((idx, i) => idx === indices[i])
                    })
                    derivedTokens.push({
                        id: `group-${indices.join("-")}`,
                        text: phrase,
                        correctLabel: grp.labelId || matchingAns?.labelId,
                    })
                }
            })

            // Add remaining individual words
            words.forEach((w, idx) => {
                if (!processedIndices.has(idx)) {
                    const directAnswer = correctAnswers?.find(a => a.wordIndex === idx || (a.wordIndices?.length === 1 && a.wordIndices[0] === idx))
                    derivedTokens.push({
                        id: `word-${idx}`,
                        text: w,
                        correctLabel: directAnswer?.labelId,
                    })
                }
            })

            // Sort tokens by their first word index
            return derivedTokens.sort((a, b) => {
                const getFirstIdx = (t: AnnotationToken) => {
                    const match = t.id.match(/\d+/)
                    return match ? parseInt(match[0], 10) : 0
                }
                return getFirstIdx(a) - getFirstIdx(b)
            })
        }
        return rawTokens && rawTokens.length > 0 ? rawTokens : DEFAULT_TOKENS
    }, [passage, groups, correctAnswers, rawTokens])

    const handleSelectLabel = (labelId: string) => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({
            ...prev,
            activeLabelId: prev.activeLabelId === labelId ? null : labelId,
        }))
        void playFeedback("click", { sound: true, animation: false })
    }

    const handleTokenClick = (tokenId: string) => {
        if (submitted || isEditing || disabled) return

        if (!activeLabelId) {
            // If no active label selected, toggle remove tag if present
            if (placements[tokenId]) {
                setState(prev => {
                    const next = { ...prev.placements }
                    delete next[tokenId]
                    return { ...prev, placements: next }
                })
                void playFeedback("click", { sound: true, animation: false })
            }
            return
        }

        // Assign active label to token
        setState(prev => {
            const currentTag = prev.placements[tokenId]
            const next = { ...prev.placements }
            if (currentTag === activeLabelId) {
                delete next[tokenId]
            } else {
                next[tokenId] = activeLabelId
            }
            return { ...prev, placements: next }
        })

        void playFeedback("categorizeSlot", { sound: true, animation: false })
    }

    const handleClearAll = () => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({ ...prev, placements: {} }))
        void playFeedback("click", { sound: true, animation: false })
    }

    const handleCheckAnswers = async () => {
        if (submitted || isEditing || disabled) return

        const testableTokens = tokens.filter(t => t.correctLabel)

        let correctCount = 0
        let isAllCorrect = false
        let earnedPoints = 0

        if (testableTokens.length > 0) {
            testableTokens.forEach(token => {
                if (token.correctLabel && placements[token.id] === token.correctLabel) {
                    correctCount++
                }
            })
            isAllCorrect = correctCount === testableTokens.length
            earnedPoints = Math.round((correctCount / testableTokens.length) * points)
        } else {
            // Fallback for practice mode with no explicit expected answers configured
            const placedCount = Object.keys(placements).length
            isAllCorrect = placedCount > 0
            earnedPoints = isAllCorrect ? points : 0
        }

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
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState({
            placements: {},
            activeLabelId: null,
            submitted: false,
            status: "active",
        })
    }

    const activeLabel = labels.find(l => l.id === activeLabelId)

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-3">
            {/* Header */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">
                            Text Annotation • {points} Points
                        </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {title}
                    </h3>
                </div>
                {instruction && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                        <Info className="w-3.5 h-3.5 text-[#1CB0F6] shrink-0" />
                        <span>{instruction}</span>
                    </div>
                )}
            </div>

            {/* Label Palette */}
            {!submitted && (
                <div className="shrink-0 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                            Select Label:
                        </span>
                        {labels.map(lbl => {
                            const isSelected = activeLabelId === lbl.id
                            const count = Object.values(placements).filter(val => val === lbl.id).length
                            const color = lbl.color || "#1CB0F6"
                            return (
                                <button
                                    key={lbl.id}
                                    type="button"
                                    onClick={() => handleSelectLabel(lbl.id)}
                                    disabled={isEditing || disabled}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-b-4 font-black text-xs transition-all duration-150 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                        isSelected ? "scale-105 shadow-md" : "hover:opacity-90"
                                    )}
                                    style={
                                        isSelected
                                            ? { backgroundColor: color, borderColor: color, color: "#ffffff" }
                                            : { backgroundColor: `${color}18`, borderColor: color, color: color }
                                    }
                                >
                                    <Tag className="w-3.5 h-3.5" />
                                    <span>{lbl.text || (lbl as any).name}</span>
                                    {count > 0 && (
                                        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-900/20 text-[10px] font-bold">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {Object.keys(placements).length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            disabled={isEditing || disabled}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-500 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                            <Eraser className="w-3.5 h-3.5" />
                            <span>Clear Tags</span>
                        </button>
                    )}
                </div>
            )}

            {/* Passage Display Canvas */}
            <div className="flex-1 min-h-[160px] my-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border-2 border-b-4 border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2 sm:gap-2.5 leading-relaxed overflow-y-auto">
                {tokens.map(token => {
                    const assignedLabelId = placements[token.id]
                    const assignedLabel = labels.find(l => l.id === assignedLabelId)
                    const labelColor = assignedLabel?.color || "#1CB0F6"
                    const isCorrect = submitted && token.correctLabel && assignedLabelId === token.correctLabel
                    const isIncorrect = submitted && token.correctLabel && assignedLabelId && assignedLabelId !== token.correctLabel
                    const isMissing = submitted && token.correctLabel && !assignedLabelId

                    return (
                        <div
                            key={token.id}
                            onClick={() => handleTokenClick(token.id)}
                            className={cn(
                                "group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-b-4 font-bold text-sm sm:text-base transition-all duration-200 select-none cursor-pointer",
                                !assignedLabel && !submitted && "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5",
                                isCorrect && "bg-[#58CC02]/20 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 dark:text-emerald-200",
                                isIncorrect && "bg-[#FF4B4B]/20 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950 dark:text-rose-200",
                                isMissing && "border-dashed border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300"
                            )}
                            style={
                                assignedLabel && !submitted
                                    ? {
                                        backgroundColor: `${labelColor}25`,
                                        borderColor: labelColor,
                                        color: labelColor,
                                    }
                                    : undefined
                            }
                        >
                            <span>{token.text}</span>

                            {assignedLabel && (
                                <span
                                    className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-xs"
                                    style={{
                                        backgroundColor: labelColor,
                                        color: "#ffffff",
                                        borderColor: labelColor,
                                    }}
                                >
                                    {assignedLabel.text || (assignedLabel as any).name}
                                </span>
                            )}

                            {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#58CC02] shrink-0" />}
                            {submitted && isIncorrect && <XCircle className="w-4 h-4 text-[#FF4B4B] shrink-0" />}
                        </div>
                    )
                })}
            </div>

            {/* Jump-Proof Footer Controls */}
            <div className="shrink-0 min-h-[56px] flex items-center justify-between pt-2">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {submitted ? (
                        <span>
                            Annotated: {Object.keys(placements).length} / {tokens.length} items
                        </span>
                    ) : activeLabel ? (
                        <span className="text-[#1CB0F6]">
                            Active tag: <strong>{activeLabel.text}</strong> — tap words above to apply.
                        </span>
                    ) : (
                        <span>Tap a label above, then tap any word or phrase to tag it.</span>
                    )}
                </div>

                <div>
                    {!submitted ? (
                        <button
                            type="button"
                            onClick={handleCheckAnswers}
                            disabled={Object.keys(placements).length === 0 || isEditing || disabled}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                                Object.keys(placements).length > 0
                                    ? "bg-[#58CC02] hover:bg-[#46a302] text-white border-[#58CC02] border-b-[#3B8C00] shadow-md cursor-pointer"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                            )}
                        >
                            Check Annotations
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-b-4 border-slate-200 dark:border-slate-700 text-xs font-extrabold uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Try Again</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export function AnnotationBoardRenderer({
    id = "annotation-board-component",
    title = "Annotate the Text",
    instruction = "Select a label chip, then tap the corresponding words or phrases.",
    passage,
    groups = [],
    correctAnswers = [],
    tokens = DEFAULT_TOKENS,
    labels = DEFAULT_LABELS,
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: AnnotationBoardRendererProps) {
    const component: Component = {
        id,
        type: "annotationBoard",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, instruction, passage, groups, correctAnswers, tokens, labels, points },
        mode: mode as any,
    } as Component

    const initialState: AnnotationBoardState = {
        placements: {},
        activeLabelId: null,
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
        <ScoredRenderer<AnnotationBoardState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={renderProps => (
                <AnnotationBoardContent
                    {...renderProps}
                    title={title}
                    instruction={instruction}
                    passage={passage}
                    groups={groups}
                    correctAnswers={correctAnswers}
                    tokens={tokens}
                    labels={labels}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}

export default AnnotationBoardRenderer

