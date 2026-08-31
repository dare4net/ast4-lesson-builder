"use client"

import React, { useEffect, useRef } from "react"
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
    recordAttempt,
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
    const captureRef = useRef<HTMLInputElement>(null)
    const selectedRef = useRef(selectedCell)
    const userGridRef = useRef(userGrid)
    const activeWordRef = useRef(activeWordId)
    const captureValueRef = useRef("\u200b")
    userGridRef.current = userGrid
    activeWordRef.current = activeWordId

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

    const resetCaptureValue = (node: HTMLInputElement) => {
        captureValueRef.current = "\u200b"
        node.value = "\u200b"
    }

    const focusCapture = () => {
        const node = captureRef.current
        if (!node || submitted || isEditing || disabled) return
        resetCaptureValue(node)
        node.focus({ preventScroll: true })
    }

    const handleCellClick = (r: number, c: number) => {
        if (submitted || isEditing || disabled) return
        const key = `${r}-${c}`
        if (!validCells.has(key)) return

        const matchedWord = words.find(w => {
            const len = w.word.length
            if (w.direction === "across") {
                return r === w.row && c >= w.col && c < w.col + len
            } else {
                return c === w.col && r >= w.row && r < w.row + len
            }
        })

        const nextCell = { row: r, col: c }
        selectedRef.current = nextCell
        if (matchedWord) activeWordRef.current = matchedWord.id
        setState(prev => ({
            ...prev,
            selectedCell: nextCell,
            activeWordId: matchedWord ? matchedWord.id : prev.activeWordId,
        }))
        focusCapture()
        void playFeedback("click", { sound: true, animation: false })
    }

    const selectWord = (w: CrosswordWord) => {
        if (submitted || isEditing || disabled) return
        const nextCell = { row: w.row, col: w.col }
        selectedRef.current = nextCell
        activeWordRef.current = w.id
        setState(prev => ({ ...prev, activeWordId: w.id, selectedCell: nextCell }))
        focusCapture()
    }

    const stepCell = (r: number, c: number, direction: "across" | "down" | undefined, delta: 1 | -1) => {
        if (direction === "down") {
            for (let nr = r + delta; nr >= 0 && nr < gridSize.rows; nr += delta) {
                if (validCells.has(`${nr}-${c}`)) return { row: nr, col: c }
            }
        } else {
            for (let nc = c + delta; nc >= 0 && nc < gridSize.cols; nc += delta) {
                if (validCells.has(`${r}-${nc}`)) return { row: r, col: nc }
            }
        }
        return { row: r, col: c }
    }

    const placeLetter = (r: number, c: number, char: string) => {
        if (submitted || isEditing || disabled) return
        const key = `${r}-${c}`
        if (!validCells.has(key)) return
        const currentWord = words.find(w => w.id === activeWordRef.current)
        const next = stepCell(r, c, currentWord?.direction, 1)
        selectedRef.current = next
        setState(prev => {
            const nextGrid = { ...prev.userGrid, [key]: char }
            userGridRef.current = nextGrid
            return {
                ...prev,
                userGrid: nextGrid,
                selectedCell: next,
            }
        })
        void playFeedback("click", { sound: true, animation: false })
    }

    const clearLetter = (r: number, c: number, moveBack: boolean) => {
        if (submitted || isEditing || disabled) return
        const key = `${r}-${c}`
        const currentWord = words.find(w => w.id === activeWordRef.current)
        const prevCell = moveBack ? stepCell(r, c, currentWord?.direction, -1) : { row: r, col: c }
        selectedRef.current = prevCell
        setState(prev => {
            const nextGrid = { ...prev.userGrid }
            delete nextGrid[key]
            userGridRef.current = nextGrid
            return {
                ...prev,
                userGrid: nextGrid,
                selectedCell: prevCell,
            }
        })
        void playFeedback("click", { sound: true, animation: false })
    }

    const backspaceCell = () => {
        const cell = selectedRef.current
        if (!cell) return
        const key = `${cell.row}-${cell.col}`
        const hasLetter = Boolean(userGridRef.current[key])
        clearLetter(cell.row, cell.col, !hasLetter)
    }

    const handleCaptureChange = (raw: string) => {
        if (raw === captureValueRef.current) return
        const cell = selectedRef.current
        if (!cell) return
        const letters = raw.replace(/\u200b/g, "").replace(/[^a-zA-Z]/g, "")
        if (letters) {
            placeLetter(cell.row, cell.col, letters[letters.length - 1].toUpperCase())
        } else if (raw.length < captureValueRef.current.length) {
            backspaceCell()
        }
        const node = captureRef.current
        if (node) resetCaptureValue(node)
    }

    const handleCaptureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const cell = selectedRef.current
        if (!cell || submitted || isEditing || disabled) return
        // Letters come from onChange so phone keyboards work and desktop
        // does not double-place (keydown + change).
        if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault()
            backspaceCell()
            const node = captureRef.current
            if (node) resetCaptureValue(node)
            return
        }
        if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault()
            const dir = e.key === "ArrowDown" || e.key === "ArrowUp" ? "down" : "across"
            const delta = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1
            const next = stepCell(cell.row, cell.col, dir, delta)
            selectedRef.current = next
            setState(prev => ({ ...prev, selectedCell: next }))
        }
    }

    useEffect(() => {
        selectedRef.current = selectedCell
        activeWordRef.current = activeWordId
    }, [selectedCell, activeWordId])

    useEffect(() => {
        if (!selectedCell || submitted || isEditing || disabled) return
        const node = captureRef.current
        if (node && document.activeElement !== node) {
            node.focus({ preventScroll: true })
        }
    }, [selectedCell, submitted, isEditing, disabled])

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
        recordAttempt(isAllCorrect, earnedPoints, points)
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        selectedRef.current = null
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
                    <div className="relative">
                        <input
                            ref={captureRef}
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            enterKeyHint="next"
                            disabled={submitted || isEditing || disabled}
                            aria-label="Crossword letter"
                            onChange={e => handleCaptureChange(e.target.value)}
                            onKeyDown={handleCaptureKeyDown}
                            onFocus={e => resetCaptureValue(e.currentTarget)}
                            className="absolute inset-0 z-0 w-full h-full opacity-0 pointer-events-none"
                            style={{ fontSize: 16, caretColor: "transparent" }}
                        />
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
                                    <button
                                        type="button"
                                        key={key}
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => handleCellClick(r, c)}
                                        aria-label={`Crossword cell ${r + 1}, ${c + 1}${userVal ? `, ${userVal}` : ""}`}
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
                                        <span className="uppercase">{userVal}</span>
                                    </button>
                                )
                            })
                        )}
                    </div>
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
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => selectWord(w)}
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
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => selectWord(w)}
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
