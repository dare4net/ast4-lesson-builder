"use client"

import React, { useState } from "react"
import { Plus, Trash2, Tag, Check, Sparkles, Palette, ChevronDown, ChevronUp, Unlink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WYSIWYGTextArea } from "@/components/ui/wysiwyg-editor"
import { cn } from "@/lib/utils"

export interface AnnotationLabel {
    id: string
    name: string
    color: string
}

export interface AnnotationAnswer {
    wordIndex?: number
    wordIndices?: number[]
    labelId: string
}

export interface AnnotationGroup {
    id: string
    wordIndices: number[]
    labelId?: string
}

export interface MergedToken {
    id: string
    text: string
    wordIndices: number[]
    isGrouped: boolean
}

interface AnnotationBoardEditorProps {
    title: string
    onTitleChange: (val: string) => void
    passage: string
    onPassageChange: (val: string) => void
    labels: AnnotationLabel[]
    onLabelsChange: (labels: AnnotationLabel[]) => void
    correctAnswers: AnnotationAnswer[]
    onCorrectAnswersChange: (answers: AnnotationAnswer[]) => void
    groups?: AnnotationGroup[]
    onGroupsChange?: (groups: AnnotationGroup[]) => void
}

const PALETTE_COLORS = [
    "#1CB0F6", // Sky Blue
    "#58CC02", // Emerald Green
    "#FFC800", // Amber Yellow
    "#FF4B4B", // Crimson Red
    "#CE82FF", // Purple Magic
    "#FF9600", // Bright Orange
    "#06B6D4", // Cyan
    "#EC4899", // Pink
    "#8B5CF6", // Violet
    "#14B8A6", // Teal
    "#3B82F6", // Blue
    "#10B981", // Mint
    "#F59E0B", // Gold
    "#EF4444", // Red
    "#A855F7", // Deep Purple
    "#0284C7", // Ocean Blue
]

export function areIndicesConsecutive(indices: number[]): boolean {
    if (indices.length <= 1) return true
    const sorted = [...indices].sort((a, b) => a - b)
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] !== sorted[i] + 1) return false
    }
    return true
}

export function buildMergedTokens(passage: string, groups: AnnotationGroup[]): MergedToken[] {
    if (!passage.trim()) return []
    const words = passage.trim().split(/\s+/)
    const processedIndices = new Set<number>()
    const mergedTokens: MergedToken[] = []

    // Filter valid groups with consecutive indices
    const validGroups = groups.filter(g => g.wordIndices && g.wordIndices.length > 1 && areIndicesConsecutive(g.wordIndices))

    // Sort groups by starting word index
    validGroups.sort((a, b) => Math.min(...a.wordIndices) - Math.min(...b.wordIndices))

    validGroups.forEach(g => {
        const sortedIndices = [...g.wordIndices].sort((a, b) => a - b)
        // Check no index has already been processed
        if (!sortedIndices.some(idx => processedIndices.has(idx))) {
            sortedIndices.forEach(idx => processedIndices.add(idx))
            const phrase = sortedIndices.map(idx => words[idx]).filter(Boolean).join(" ")
            mergedTokens.push({
                id: `group-${sortedIndices.join("-")}`,
                text: phrase,
                wordIndices: sortedIndices,
                isGrouped: true,
            })
        }
    })

    // Add remaining standalone words
    words.forEach((w, idx) => {
        if (!processedIndices.has(idx)) {
            mergedTokens.push({
                id: `word-${idx}`,
                text: w,
                wordIndices: [idx],
                isGrouped: false,
            })
        }
    })

    // Sort tokens by their first word index
    return mergedTokens.sort((a, b) => a.wordIndices[0] - b.wordIndices[0])
}

export function AnnotationBoardEditor({
    passage = "",
    onPassageChange,
    labels = [],
    onLabelsChange,
    correctAnswers = [],
    onCorrectAnswersChange,
    groups = [],
    onGroupsChange,
}: AnnotationBoardEditorProps) {
    const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
    const [newLabelName, setNewLabelName] = useState("")
    const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)
    const [customColor, setCustomColor] = useState(PALETTE_COLORS[0])
    const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([])
    const [warningMessage, setWarningMessage] = useState<string | null>(null)

    const mergedTokens = buildMergedTokens(passage, groups)

    // Helper: auto-pick next unused color from palette
    const getNextAutoColor = () => {
        const usedColors = new Set(labels.map(l => l.color?.toUpperCase()))
        const available = PALETTE_COLORS.find(c => !usedColors.has(c.toUpperCase()))
        return available || PALETTE_COLORS[labels.length % PALETTE_COLORS.length]
    }

    const handleAddLabel = () => {
        if (!newLabelName.trim()) return
        const assignedColor = showCustomColorPicker ? customColor : getNextAutoColor()

        const newLabel: AnnotationLabel = {
            id: `label-${Date.now()}`,
            name: newLabelName.trim(),
            color: assignedColor,
        }
        const nextLabels = [...labels, newLabel]
        onLabelsChange(nextLabels)
        setNewLabelName("")
        setShowCustomColorPicker(false)
        if (!selectedLabelId) setSelectedLabelId(newLabel.id)
    }

    const handleRemoveLabel = (id: string) => {
        const nextLabels = labels.filter(l => l.id !== id)
        onLabelsChange(nextLabels)

        // Clean up answers for this label
        const nextAnswers = correctAnswers.filter(a => a.labelId !== id)
        onCorrectAnswersChange(nextAnswers)

        if (selectedLabelId === id) setSelectedLabelId(nextLabels[0]?.id || null)
    }

    const handleTokenClick = (token: MergedToken) => {
        setWarningMessage(null)

        // Toggle selection for grouping
        setSelectedTokenIds(prev =>
            prev.includes(token.id) ? prev.filter(id => id !== token.id) : [...prev, token.id]
        )

        // If a label is active, apply/toggle answer tag for this token
        if (selectedLabelId) {
            const hasExactAnswer = correctAnswers.some(a => {
                const aIndices = a.wordIndices || (a.wordIndex !== undefined ? [a.wordIndex] : [])
                return (
                    a.labelId === selectedLabelId &&
                    aIndices.length === token.wordIndices.length &&
                    aIndices.every(idx => token.wordIndices.includes(idx))
                )
            })

            if (hasExactAnswer) {
                // Remove answer
                const nextAnswers = correctAnswers.filter(a => {
                    const aIndices = a.wordIndices || (a.wordIndex !== undefined ? [a.wordIndex] : [])
                    return !(
                        aIndices.length === token.wordIndices.length &&
                        aIndices.every(idx => token.wordIndices.includes(idx))
                    )
                })
                onCorrectAnswersChange(nextAnswers)
            } else {
                // Remove existing answers for these indices, then add new answer
                const remainingAnswers = correctAnswers.filter(a => {
                    const aIndices = a.wordIndices || (a.wordIndex !== undefined ? [a.wordIndex] : [])
                    return !aIndices.some(idx => token.wordIndices.includes(idx))
                })

                const newAnswer: AnnotationAnswer =
                    token.wordIndices.length === 1
                        ? { wordIndex: token.wordIndices[0], labelId: selectedLabelId }
                        : { wordIndices: token.wordIndices, labelId: selectedLabelId }

                onCorrectAnswersChange([...remainingAnswers, newAnswer])
            }
        }
    }

    const handleGroupSelected = () => {
        setWarningMessage(null)
        if (selectedTokenIds.length < 2) return

        const selectedTokens = mergedTokens.filter(t => selectedTokenIds.includes(t.id))
        const allIndices = selectedTokens.flatMap(t => t.wordIndices).sort((a, b) => a - b)

        if (!areIndicesConsecutive(allIndices)) {
            setWarningMessage("Only adjacent words that follow each other directly can be grouped into a single phrase.")
            return
        }

        const newGroup: AnnotationGroup = {
            id: `group-${Date.now()}`,
            wordIndices: allIndices,
        }

        if (onGroupsChange) {
            // Filter out old groups overlapping these indices
            const filteredGroups = groups.filter(g => !g.wordIndices.some(idx => allIndices.includes(idx)))
            onGroupsChange([...filteredGroups, newGroup])
        }

        // Clean up old answers overlapping these indices
        const remainingAnswers = correctAnswers.filter(a => {
            const aIndices = a.wordIndices || (a.wordIndex !== undefined ? [a.wordIndex] : [])
            return !aIndices.some(idx => allIndices.includes(idx))
        })

        if (selectedLabelId) {
            remainingAnswers.push({ wordIndices: allIndices, labelId: selectedLabelId })
        }

        onCorrectAnswersChange(remainingAnswers)
        setSelectedTokenIds([])
    }

    const handleUngroupSelected = () => {
        setWarningMessage(null)
        if (selectedTokenIds.length === 0) return

        const selectedTokens = mergedTokens.filter(t => selectedTokenIds.includes(t.id))
        const indicesToUngroup = selectedTokens.flatMap(t => t.wordIndices)

        if (onGroupsChange) {
            const filteredGroups = groups.filter(g => !g.wordIndices.some(idx => indicesToUngroup.includes(idx)))
            onGroupsChange(filteredGroups)
        }

        const remainingAnswers = correctAnswers.filter(a => {
            const aIndices = a.wordIndices || (a.wordIndex !== undefined ? [a.wordIndex] : [])
            return !aIndices.some(idx => indicesToUngroup.includes(idx))
        })
        onCorrectAnswersChange(remainingAnswers)
        setSelectedTokenIds([])
    }

    return (
        <div className="space-y-6 text-slate-200">
            {/* Step 1: Passage Editor */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    1. Passage Text
                </Label>
                <WYSIWYGTextArea
                    value={passage}
                    onChange={val => onPassageChange(val)}
                    placeholder="Enter full passage or sentence here..."
                    rows={4}
                    showPreviewToggle={false}
                />
            </div>

            {/* Step 2: Labels Palette Creator */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        2. Tag Categories Palette
                    </Label>

                    <button
                        type="button"
                        onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                        className="text-[10px] font-extrabold text-[#1CB0F6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <Palette className="w-3 h-3" />
                        <span>{showCustomColorPicker ? "Hide Color Options" : "Choose Custom Color"}</span>
                        {showCustomColorPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Input
                            value={newLabelName}
                            onChange={e => setNewLabelName(e.target.value)}
                            placeholder="e.g. Subject, Direct Object, Noun..."
                            className="bg-slate-950/60 border-slate-800 text-xs font-bold"
                        />

                        <Button
                            type="button"
                            onClick={handleAddLabel}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-10 px-4 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Tag
                        </Button>
                    </div>

                    {/* Collapsible Custom Color Picker Section */}
                    {showCustomColorPicker && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">
                                Select Manual Hex Color:
                            </Label>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {PALETTE_COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setCustomColor(c)}
                                        className={cn(
                                            "w-5 h-5 rounded-full transition-all cursor-pointer border border-slate-700",
                                            customColor === c && "ring-2 ring-white scale-125 z-10"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Existing Labels Badge List */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {labels.map(l => {
                        const isSelected = selectedLabelId === l.id
                        return (
                            <div
                                key={l.id}
                                onClick={() => setSelectedLabelId(l.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all",
                                    isSelected ? "ring-2 ring-emerald-400" : "opacity-80 hover:opacity-100"
                                )}
                                style={{
                                    backgroundColor: `${l.color}20`,
                                    borderColor: l.color,
                                    color: l.color,
                                }}
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>{l.name}</span>
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation()
                                        handleRemoveLabel(l.id)
                                    }}
                                    className="ml-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Step 3: Interactive Word Tagging Canvas & Group Selection */}
            {mergedTokens.length > 0 && labels.length > 0 && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            3. Select adjacent tokens to group or tag as: &quot;{labels.find(l => l.id === selectedLabelId)?.name || "Select Tag"}&quot;
                        </Label>

                        {selectedTokenIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedTokenIds([])}
                                className="text-slate-400 hover:text-slate-200 underline text-[10px] font-bold cursor-pointer"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>

                    {warningMessage && (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{warningMessage}</span>
                        </div>
                    )}

                    {/* Grouping Actions Bar */}
                    {selectedTokenIds.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40">
                            <span className="text-xs font-bold text-emerald-400">
                                {selectedTokenIds.length} token{selectedTokenIds.length > 1 ? "s" : ""} selected
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {selectedTokenIds.length >= 2 && (
                                    <button
                                        type="button"
                                        onClick={handleGroupSelected}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Group Words into 1 Token</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleUngroupSelected}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                    <Unlink className="w-3.5 h-3.5" />
                                    <span>Ungroup Selected</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Render Clean Token List (Total Tokens: mergedTokens.length) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {mergedTokens.map(token => {
                            const answer = correctAnswers.find(a => {
                                const aIndices = a.wordIndices || (a.wordIndex !== undefined ? [a.wordIndex] : [])
                                return (
                                    aIndices.length === token.wordIndices.length &&
                                    aIndices.every(idx => token.wordIndices.includes(idx))
                                )
                            })
                            const matchedLabel = answer ? labels.find(l => l.id === answer.labelId) : null
                            const isSelected = selectedTokenIds.includes(token.id)

                            return (
                                <button
                                    key={token.id}
                                    type="button"
                                    onClick={() => handleTokenClick(token)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer select-none",
                                        matchedLabel && "border-2 shadow-xs",
                                        !matchedLabel && !isSelected && "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700",
                                        isSelected && "ring-2 ring-emerald-400 scale-105"
                                    )}
                                    style={
                                        matchedLabel
                                            ? {
                                                backgroundColor: `${matchedLabel.color}25`,
                                                borderColor: matchedLabel.color,
                                                color: matchedLabel.color,
                                            }
                                            : undefined
                                    }
                                >
                                    <span>{token.text}</span>
                                    {token.isGrouped && !matchedLabel && (
                                        <span className="ml-1 text-[9px] font-black uppercase text-emerald-400 opacity-75">
                                            (grouped)
                                        </span>
                                    )}
                                    {matchedLabel && (
                                        <span className="ml-1 text-[9px] font-black uppercase tracking-wider opacity-90">
                                            [{matchedLabel.name}]
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
