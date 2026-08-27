"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Grid3X3, RefreshCw, CheckCircle2, XCircle, Lightbulb, ArrowRight, ArrowDown } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

export interface CrosswordWord {
    id: string
    word: string
    clue: string
    direction: "across" | "down"
    row: number // 0-indexed
    col: number // 0-indexed
}

export interface CrosswordRendererProps {
    id?: string
    title?: string
    gridSize?: { rows: number; cols: number }
    words?: CrosswordWord[]
    allowHints?: boolean
    points?: number
    mode?: "practice" | "live"
    savedState?: CrosswordState
    setComponentState?: (state: CrosswordState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

export type CrosswordState = {
    /** "row-col" key -> entered uppercase character */
    userGrid: Record<string, string>
    activeWordId: string | null
    selectedCell: { row: number; col: number } | null
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

const DEFAULT_WORDS: CrosswordWord[] = [
    { id: "w1", word: "CELL", clue: "Basic unit of life", direction: "across", row: 1, col: 0 },
    { id: "w2", word: "DNA", clue: "Genetic code molecule", direction: "down", row: 0, col: 1 },
    { id: "w3", word: "GENE", clue: "Hereditary trait unit", direction: "across", row: 3, col: 1 },
]

function CrosswordContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    mode,
    title,
    gridSize = { rows: 5, cols: 5 },
    words = DEFAULT_WORDS,
    allowHints = true,
    points = 15,
    isEditing,
    disabled,
}: ScoredRenderProps<CrosswordState> & {
    title: string
    gridSize: { rows: number; cols: number }
    words: CrosswordWord[]
    allowHints: boolean
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { playFeedback } = useFeedback()
    const { userGrid, activeWordId, selectedCell, submitted } = state

    // Map which cells belong to which words and build cell numbers
    const validCells = new Set<string>()
    const cellNumbers: Record<string, number> = {}

    words.forEach((w, idx) => {
        const num = idx + 1
        const startKey = `${w.row}-${w.col}`
        cellNumbers[startKey] = num

        const chars = w.word.toUpperCase().split("")
        chars.forEach((_, i) => {
            const r = w.direction === "down" ? w.row + i : w.row
            const c = w.direction === "across" ? w.col + i : w.col
            validCells.add(`${r}-${c}`)
        })
    })

    const handleCellClick = (r: number, c: number) => {
        if (submitted || isEditing || disabled) return
        const key = `${r}-${c}`
        if (!validCells.has(key)) return

        // Find associated word
        const matchedWord = words.find(w => {
            const len = w.word.length
            if (w.direction === "across") {
                return r === w.row && c >= w.col && c < w.col + len
            } else {
                return c === w.col && r >= w.row && r < w.row + len
            }
        })

        setState(prev => ({
            ...prev,
            selectedCell: { row: r, col: c },
            activeWordId: matchedWord ? matchedWord.id : prev.activeWordId,
        }))

        void playFeedback("click", { sound: true, animation: false })
    }

    const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
        if (submitted || isEditing || disabled) return

        const key = `${r}-${c}`
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            const char = e.key.toUpperCase()
            const nextGrid = { ...userGrid, [key]: char }

            // Find current word direction to move to next cell
            const currentWord = words.find(w => w.id === activeWordId)
            let nextR = r
            let nextC = c

            if (currentWord?.direction === "across") {
                nextC = Math.min(gridSize.cols - 1, c + 1)
            } else if (currentWord?.direction === "down") {
                nextR = Math.min(gridSize.rows - 1, r + 1)
            } else {
                nextC = Math.min(gridSize.cols - 1, c + 1)
            }

            setState(prev => ({
                ...prev,
                userGrid: nextGrid,
                selectedCell: { row: nextR, col: nextC },
            }))

            void playFeedback("click", { sound: true, animation: false })
        } else if (e.key === "Backspace") {
            const nextGrid = { ...userGrid }
            delete nextGrid[key]

            const currentWord = words.find(w => w.id === activeWordId)
            let prevR = r
            let prevC = c

            if (currentWord?.direction === "across") {
                prevC = Math.max(0, c - 1)
            } else if (currentWord?.direction === "down") {
                prevR = Math.max(0, r - 1)
            }

            setState(prev => ({
                ...prev,
                userGrid: nextGrid,
                selectedCell: { row: prevR, col: prevC },
            }))

            void playFeedback("click", { sound: true, animation: false })
        }
    }

    const handleCheckCrossword = async () => {
        if (submitted || isEditing || disabled) return

        let totalLetters = 0
        let correctLetters = 0

        words.forEach(w => {
            const chars = w.word.toUpperCase().split("")
            chars.forEach((char, i) => {
                const r = w.direction === "down" ? w.row + i : w.row
                const c = w.direction === "across" ? w.col + i : w.col
                const key = `${r}-${c}`
                totalLetters++
                if (userGrid[key] === char) correctLetters++
            })
        })

        const isAllCorrect = correctLetters === totalLetters
        const earnedPoints = isAllCorrect ? points : Math.round((correctLetters / totalLetters) * points)

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
            userGrid: {},
            activeWordId: null,
            selectedCell: null,
            submitted: false,
            status: "active",
        })
    }

    const acrossWords = words.filter(w => w.direction === "across")
    const downWords = words.filter(w => w.direction === "down")

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-3">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">
                        Mini Crossword • {points} Points
                    </span>
                    <FormattedText content={title} as="h3" className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight" />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Grid3X3 className="w-3.5 h-3.5 text-[#1CB0F6]" />
                    <span>
                        {gridSize.rows}x{gridSize.cols} Grid
                    </span>
                </div>
            </div>

            {/* Stage: Crossword Grid + Clue Sidebar */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-3 min-h-[240px]">
                {/* Grid Stage */}
                <div className="lg:col-span-6 flex justify-center">
                    <div
                        className="grid gap-1.5 p-3 rounded-3xl bg-slate-900 border-2 border-b-6 border-slate-800 shadow-xl"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                        }}
                    >
                        {Array.from({ length: gridSize.rows }).map((_, r) =>
                            Array.from({ length: gridSize.cols }).map((_, c) => {
                                const key = `${r}-${c}`
                                const isValid = validCells.has(key)
                                const num = cellNumbers[key]
                                const isSelected = selectedCell?.row === r && selectedCell?.col === c
                                const userVal = userGrid[key] || ""

                                // Check correct letter for feedback
                                const targetWord = words.find(w => {
                                    const len = w.word.length
                                    if (w.direction === "across") return r === w.row && c >= w.col && c < w.col + len
                                    return c === w.col && r >= w.row && r < w.row + len
                                })
                                let correctChar = ""
                                if (targetWord) {
                                    const offset = targetWord.direction === "across" ? c - targetWord.col : r - targetWord.row
                                    correctChar = targetWord.word[offset]?.toUpperCase() || ""
                                }

                                const isCellCorrect = submitted && userVal === correctChar
                                const isCellIncorrect = submitted && userVal !== "" && userVal !== correctChar

                                if (!isValid) {
                                    return (
                                        <div
                                            key={key}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-950 border border-slate-900"
                                        />
                                    )
                                }

                                return (
                                    <div
                                        key={key}
                                        onClick={() => handleCellClick(r, c)}
                                        className={cn(
                                            "relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 font-black text-lg sm:text-xl flex items-center justify-center transition-all duration-150 select-none cursor-pointer",
                                            !userVal && !submitted && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100",
                                            userVal && !submitted && "bg-[#1CB0F6]/10 border-[#1CB0F6] text-[#1CB0F6]",
                                            isSelected && "ring-2 ring-[#1CB0F6] border-[#1CB0F6]",
                                            isCellCorrect && "bg-[#58CC02] border-[#58CC02] text-white",
                                            isCellIncorrect && "bg-[#FF4B4B] border-[#FF4B4B] text-white"
                                        )}
                                    >
                                        {num && (
                                            <span className="absolute top-0.5 left-1 text-[9px] font-black text-slate-400">
                                                {num}
                                            </span>
                                        )}
                                        <input
                                            type="text"
                                            maxLength={1}
                                            value={userVal}
                                            onChange={() => { }}
                                            onKeyDown={e => handleKeyDown(r, c, e)}
                                            disabled={submitted || isEditing || disabled}
                                            className="w-full h-full text-center bg-transparent focus:outline-none uppercase cursor-pointer"
                                        />
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Clue Sidebar Panel */}
                <div className="lg:col-span-6 space-y-4 max-h-[300px] overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800">
                    {/* Across Clues */}
                    {acrossWords.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#1CB0F6]">
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>Across</span>
                            </div>
                            <div className="space-y-1.5">
                                {acrossWords.map((w, idx) => (
                                    <div
                                        key={w.id}
                                        onClick={() => setState(prev => ({ ...prev, activeWordId: w.id, selectedCell: { row: w.row, col: w.col } }))}
                                        className={cn(
                                            "p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                            activeWordId === w.id
                                                ? "bg-[#1CB0F6]/15 border-[#1CB0F6] text-[#1CB0F6]"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                        )}
                                    >
                                        <strong>{idx + 1}.</strong> <FormattedText content={w.clue} as="span" /> ({w.word.length} letters)
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Down Clues */}
                    {downWords.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-500">
                                <ArrowDown className="w-3.5 h-3.5" />
                                <span>Down</span>
                            </div>
                            <div className="space-y-1.5">
                                {downWords.map((w, idx) => (
                                    <div
                                        key={w.id}
                                        onClick={() => setState(prev => ({ ...prev, activeWordId: w.id, selectedCell: { row: w.row, col: w.col } }))}
                                        className={cn(
                                            "p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                            activeWordId === w.id
                                                ? "bg-[#1CB0F6]/15 border-[#1CB0F6] text-[#1CB0F6]"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                        )}
                                    >
                                        <strong>{acrossWords.length + idx + 1}.</strong> <FormattedText content={w.clue} as="span" /> ({w.word.length} letters)
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Controls */}
            <div className="shrink-0 min-h-[56px] flex items-center justify-between pt-2">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {submitted ? (
                        <span>
                            {state.isCorrect ? "Crossword completed perfectly!" : "Some letters were incorrect. Try again!"}
                        </span>
                    ) : (
                        <span>Tap grid cells or clues and type letters to complete the puzzle.</span>
                    )}
                </div>

                <div>
                    {!submitted ? (
                        <button
                            type="button"
                            onClick={handleCheckCrossword}
                            disabled={isEditing || disabled}
                            className="px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46a302] text-white border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] font-extrabold text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer shadow-md"
                        >
                            Check Crossword
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

export function CrosswordRenderer({
    id = "crossword-component",
    title = "Key Terms Crossword",
    gridSize = { rows: 5, cols: 5 },
    words = DEFAULT_WORDS,
    allowHints = true,
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: CrosswordRendererProps) {
    const component: Component = {
        id,
        type: "crossword",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, gridSize, words, points },
        mode: mode as any,
    } as Component

    const initialState: CrosswordState = {
        userGrid: {},
        activeWordId: null,
        selectedCell: null,
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
        <ScoredRenderer<CrosswordState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={renderProps => (
                <CrosswordContent
                    {...renderProps}
                    title={title}
                    gridSize={gridSize}
                    words={words}
                    allowHints={allowHints}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
