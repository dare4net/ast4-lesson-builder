"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { HelpCircle, RefreshCw, Delete, Shuffle, ChevronRight, Wand2, Zap, Anchor, Lightbulb } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { Button } from "@/components/ui/button"
import { ACTION_LABELS } from "@/lib/action-labels"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"
import { appEventBus } from "@/lib/event-bus"

// ─── Types ─────────────────────────────────────────────────────────────────

interface LetterTile {
    id: string
    letter: string
}

type Variant = "single" | "multi" | "sentence"

interface WordScrambleRendererProps {
    id?: string
    title?: string
    variant?: Variant
    word?: string
    words?: string[]
    sentence?: string
    hint?: string
    points?: number
    mode?: "practice" | "live"

    // Hint feature toggles & limits
    allowTextClue?: boolean
    allowLetterReveal?: boolean
    maxLetterReveals?: number
    allowWordSolve?: boolean
    maxWordSolves?: number
    allowFirstLetterAnchors?: boolean

    savedState?: WordScrambleState
    setComponentState?: (state: WordScrambleState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

interface WordScrambleState {
    pool: LetterTile[]
    slotGrid: (string | null)[][]
    lockedGrid: boolean[][] // lockedGrid[wordIdx][slotIdx] = true if auto-placed/locked by hint
    selectedTileId: string | null
    submitted: boolean
    showHintText: boolean
    revealsUsed: number
    wordSolvesUsed: number
    anchorsUsed: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

function buildPool(wordList: string[]): LetterTile[] {
    let globalIdx = 0
    const tiles: LetterTile[] = []
    for (const word of wordList) {
        for (const char of word) {
            tiles.push({ id: `t-${globalIdx++}`, letter: char })
        }
    }
    return shuffle(tiles)
}

function resolveWords(variant: Variant, word: string, words: string[], sentence: string): string[] {
    if (variant === "single") return [word.toUpperCase().replace(/\s+/g, "")]
    if (variant === "multi") return words.map(w => w.toUpperCase().replace(/\s+/g, "")).filter(Boolean)
    return sentence.toUpperCase().trim().split(/\s+/).filter(Boolean)
}

function buildInitialState(wordList: string[]): WordScrambleState {
    const pool = buildPool(wordList)
    const slotGrid = wordList.map(w => Array(w.length).fill(null))
    const lockedGrid = wordList.map(w => Array(w.length).fill(false))
    return {
        pool,
        slotGrid,
        lockedGrid,
        selectedTileId: null,
        submitted: false,
        showHintText: false,
        revealsUsed: 0,
        wordSolvesUsed: 0,
        anchorsUsed: false,
        status: "active",
    }
}

// Helper to find & place a correct tile into a specific (wordIdx, slotIdx)
function placeCorrectTileInSlot(
    targetLetter: string,
    wordIdx: number,
    slotIdx: number,
    pool: LetterTile[],
    slotGrid: (string | null)[][],
    lockedGrid: boolean[][]
): { newSlotGrid: (string | null)[][]; newLockedGrid: boolean[][] } {
    const newSlotGrid = slotGrid.map(r => [...r])
    const newLockedGrid = lockedGrid.map(r => [...r])

    // If target slot already has a tile that is unlocked, clear it
    const existingTileId = newSlotGrid[wordIdx][slotIdx]
    if (existingTileId && !newLockedGrid[wordIdx][slotIdx]) {
        newSlotGrid[wordIdx][slotIdx] = null
    }

    // Find all placed tile IDs
    const placedTileIds = new Set(newSlotGrid.flat().filter(Boolean) as string[])

    // Find a tile with targetLetter that is NOT currently placed in a locked slot
    let candidateTileId: string | null = null

    // First check unplaced tiles in pool
    const unplacedTile = pool.find(t => t.letter === targetLetter && !placedTileIds.has(t.id))
    if (unplacedTile) {
        candidateTileId = unplacedTile.id
    } else {
        // Find a tile placed in an unlocked slot elsewhere
        for (let wi = 0; wi < newSlotGrid.length; wi++) {
            for (let si = 0; si < newSlotGrid[wi].length; si++) {
                const tid = newSlotGrid[wi][si]
                if (tid && !newLockedGrid[wi][si]) {
                    const tile = pool.find(t => t.id === tid)
                    if (tile?.letter === targetLetter) {
                        candidateTileId = tid
                        newSlotGrid[wi][si] = null // remove from wrong slot
                        break
                    }
                }
            }
            if (candidateTileId) break
        }
    }

    if (candidateTileId) {
        newSlotGrid[wordIdx][slotIdx] = candidateTileId
        newLockedGrid[wordIdx][slotIdx] = true
    }

    return { newSlotGrid, newLockedGrid }
}

// ─── Single Word Component ──────────────────────────────────────────────────

function SingleWordContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    targetWord,
    hint,
    title,
    points,
    isEditing,
    disabled,
    allowTextClue = true,
    allowLetterReveal = true,
    maxLetterReveals = 3,
    componentId = 'word-scramble',
}: {
    state: WordScrambleState
    setState: (fn: (prev: WordScrambleState) => WordScrambleState) => void
    handlePoints: (pts: number) => void
    handleRetry: () => void
    recordAttempt: (isCorrect: boolean, score?: number, maxScore?: number) => void
    targetWord: string
    hint: string
    title: string
    points: number
    isEditing: boolean
    disabled: boolean
    allowTextClue?: boolean
    allowLetterReveal?: boolean
    maxLetterReveals?: number
    componentId?: string
}) {
    const { pool, slotGrid, lockedGrid, submitted, showHintText, revealsUsed } = state
    const { playFeedback } = useFeedback()

    const filled = slotGrid[0] ?? []
    const locked = lockedGrid[0] ?? []
    const placedIds = new Set(filled.filter(Boolean) as string[])

    const handleTileClick = (tileId: string) => {
        if (submitted || isEditing || disabled) return
        if (placedIds.has(tileId)) return
        const nextEmpty = filled.findIndex(v => v === null)
        if (nextEmpty === -1) return
        setState(prev => {
            const g = prev.slotGrid.map(r => [...r])
            g[0][nextEmpty] = tileId
            return { ...prev, slotGrid: g }
        })
        playFeedback("click", { sound: true })
    }

    const handleSlotClick = (idx: number) => {
        if (submitted || isEditing || disabled) return
        if (locked[idx]) return // locked by hint/auto-place
        if (!filled[idx]) return
        setState(prev => {
            const g = prev.slotGrid.map(r => [...r])
            g[0][idx] = null
            return { ...prev, slotGrid: g }
        })
        playFeedback("click", { sound: true })
    }

    const handleReshuffle = () => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({ ...prev, pool: shuffle(pool) }))
    }

    const handleRevealLetter = () => {
        if (submitted || isEditing || disabled) return
        if (revealsUsed >= maxLetterReveals) return

        // Find first empty or incorrect slot
        let targetSlotIdx = -1
        for (let i = 0; i < targetWord.length; i++) {
            const tileId = filled[i]
            const currentLetter = tileId ? pool.find(t => t.id === tileId)?.letter : null
            if (currentLetter !== targetWord[i]) {
                targetSlotIdx = i
                break
            }
        }
        if (targetSlotIdx === -1) return // already full & correct

        const targetLetter = targetWord[targetSlotIdx]
        const { newSlotGrid, newLockedGrid } = placeCorrectTileInSlot(
            targetLetter,
            0,
            targetSlotIdx,
            pool,
            slotGrid,
            lockedGrid
        )

        setState(prev => ({
            ...prev,
            slotGrid: newSlotGrid,
            lockedGrid: newLockedGrid,
            revealsUsed: prev.revealsUsed + 1,
        }))
        playFeedback("click", { sound: true })
        appEventBus.emit('HINT_USED', { componentId, type: 'wordScramble', hintKind: 'letter' })
    }

    const handleCheck = async () => {
        if (submitted || isEditing || disabled) return
        const spelled = filled.map(id => pool.find(t => t.id === id)?.letter ?? "").join("")
        const isCorrect = spelled === targetWord

        setState(prev => ({
            ...prev,
            submitted: true,
            isCorrect,
            status: "completed",
            score: isCorrect ? points : 0,
            maxScore: points,
        }))

        if (isCorrect) {
            handlePoints(points)
            recordAttempt(true, points, points)
            playFeedback("correct", { sound: true })
        } else {
            recordAttempt(false)
            playFeedback("incorrect", { sound: true })
        }
    }

    const handleReset = () => {
        handleRetry()
        setState(prev => ({
            ...buildInitialState([targetWord]),
            showHintText: prev.showHintText,
        }))
    }

    const isFull = filled.every(v => v !== null)
    const isCorrectGrade = submitted && state.isCorrect
    const isIncorrectGrade = submitted && !state.isCorrect

    return (
        <div className="flex flex-col h-full p-4 sm:p-5 max-w-xl mx-auto w-full justify-between overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
                <FormattedText content={title} as="h3" className="text-sm font-black text-slate-800 uppercase tracking-wider" />
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Text Clue Button */}
                    {allowTextClue && hint && (
                        <button
                            type="button"
                            onClick={() => setState(prev => ({ ...prev, showHintText: !prev.showHintText }))}
                            className={cn(
                                "flex items-center gap-1 px-3 py-1.5 min-h-11 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer",
                                showHintText
                                    ? "bg-amber-400 text-slate-900 border-amber-400"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:border-amber-400"
                            )}
                        >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Hint</span>
                        </button>
                    )}

                    {/* Auto Reveal Letter Helper */}
                    {allowLetterReveal && (
                        <button
                            type="button"
                            onClick={handleRevealLetter}
                            disabled={submitted || isEditing || disabled || revealsUsed >= maxLetterReveals}
                            className="flex items-center gap-1 px-3 py-1.5 min-h-11 rounded-xl border-2 bg-sky-50 text-[#1CB0F6] border-sky-200 hover:bg-sky-100 font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            title={`Auto-place 1 correct letter (${maxLetterReveals - revealsUsed} left)`}
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Reveal ({maxLetterReveals - revealsUsed})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Hint text callout */}
            {allowTextClue && showHintText && hint && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <FormattedText content={hint} as="span" />
                </div>
            )}

            {/* Target Slots */}
            <div className="flex justify-center items-center gap-2 mb-6 shrink-0 flex-wrap">
                {targetWord.split("").map((_, idx) => {
                    const tileId = filled[idx]
                    const letter = tileId ? pool.find(t => t.id === tileId)?.letter : null
                    const isLocked = locked[idx]
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSlotClick(idx)}
                            disabled={submitted || isEditing || disabled || !letter || isLocked}
                            className={cn(
                                "w-12 h-14 rounded-2xl border-2 border-b-4 flex items-center justify-center font-black text-xl select-none transition-all duration-150 relative",
                                !letter && "bg-slate-50 border-slate-200 border-b-slate-300 text-transparent",
                                letter && !submitted && !isLocked && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] cursor-pointer hover:opacity-80",
                                letter && !submitted && isLocked && "bg-sky-500 text-white border-sky-500 border-b-sky-700 shadow-md ring-2 ring-amber-400/60",
                                submitted && isCorrectGrade && "bg-[#58CC02] text-white border-[#46a302] border-b-[#3B8C00]",
                                submitted && isIncorrectGrade && "bg-[#FF4B4B] text-white border-[#CC3C3C] border-b-[#992B2B]"
                            )}
                        >
                            {letter || ""}
                            {isLocked && !submitted && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
                                    ★
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Letter Pool */}
            {!submitted && (
                <div className="flex flex-wrap justify-center gap-2 mb-6 shrink-0">
                    {pool.map(tile => {
                        const isPlaced = placedIds.has(tile.id)
                        return (
                            <button
                                key={tile.id}
                                type="button"
                                onClick={() => handleTileClick(tile.id)}
                                disabled={isPlaced || isEditing || disabled}
                                className={cn(
                                    "w-12 h-12 rounded-2xl border-2 border-b-4 font-black text-lg transition-all duration-150 shadow-sm",
                                    !isPlaced && "bg-white hover:bg-sky-50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-[#1CB0F6] cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                    isPlaced && "opacity-25 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {tile.letter}
                            </button>
                        )
                    })}
                    <button
                        type="button"
                        onClick={handleReshuffle}
                        disabled={isEditing || disabled}
                        className="w-12 h-12 rounded-2xl border-2 border-b-4 bg-white hover:bg-sky-50 border-slate-200 border-b-slate-300 hover:border-[#1CB0F6] text-[#1CB0F6] flex items-center justify-center transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer shadow-sm"
                        title="Reshuffle Tiles"
                    >
                        <Shuffle className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Action button */}
            <div className="mt-auto flex items-center justify-between gap-4 shrink-0">
                {submitted ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="w-full h-11 rounded-2xl border-2 border-b-4 border-slate-200 font-black text-xs uppercase tracking-wider"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>{ACTION_LABELS.tryAgain}</span>
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="duo"
                        onClick={handleCheck}
                        disabled={!isFull || isEditing || disabled}
                        className={cn(
                            "w-full h-11",
                            isFull
                                ? "bg-[#1CB0F6] hover:bg-sky-500 border-[#1CB0F6] border-b-[#0090CC]"
                                : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200"
                        )}
                    >
                        {ACTION_LABELS.checkAnswer}
                    </Button>
                )}
            </div>
        </div>
    )
}

// ─── Multi-Word / Sentence Mode Component ───────────────────────────────────

function MultiWordContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    wordList,
    hint,
    title,
    points,
    isEditing,
    disabled,
    variant,
    allowTextClue = true,
    allowLetterReveal = true,
    maxLetterReveals = 3,
    allowWordSolve = true,
    maxWordSolves = 1,
    allowFirstLetterAnchors = true,
    componentId = 'word-scramble',
}: {
    state: WordScrambleState
    setState: (fn: (prev: WordScrambleState) => WordScrambleState) => void
    handlePoints: (pts: number) => void
    handleRetry: () => void
    recordAttempt: (isCorrect: boolean, score?: number, maxScore?: number) => void
    wordList: string[]
    hint: string
    title: string
    points: number
    isEditing: boolean
    disabled: boolean
    variant: "multi" | "sentence"
    allowTextClue?: boolean
    allowLetterReveal?: boolean
    maxLetterReveals?: number
    allowWordSolve?: boolean
    maxWordSolves?: number
    allowFirstLetterAnchors?: boolean
    componentId?: string
}) {
    const { pool, slotGrid, lockedGrid, selectedTileId, submitted, showHintText, revealsUsed, wordSolvesUsed, anchorsUsed } = state
    const { playFeedback } = useFeedback()

    const placedIds = new Set(slotGrid.flat().filter(Boolean) as string[])
    const isSelected = (id: string) => selectedTileId === id

    // Select a tile from pool
    const handleSelectTile = (tileId: string) => {
        if (submitted || isEditing || disabled) return
        if (placedIds.has(tileId)) return
        setState(prev => ({ ...prev, selectedTileId: prev.selectedTileId === tileId ? null : tileId }))
    }

    // Place or remove a tile from slot
    const handleSlotClick = (wordIdx: number, slotIdx: number) => {
        if (submitted || isEditing || disabled) return
        if (lockedGrid[wordIdx]?.[slotIdx]) return // locked by hint

        const slot = slotGrid[wordIdx]?.[slotIdx]
        if (slot !== null && slot !== undefined) {
            // Remove letter back to pool
            setState(prev => {
                const g = prev.slotGrid.map(r => [...r])
                g[wordIdx][slotIdx] = null
                return { ...prev, slotGrid: g, selectedTileId: slot }
            })
            playFeedback("click", { sound: true })
            return
        }
        if (!selectedTileId) return
        setState(prev => {
            const g = prev.slotGrid.map(r => [...r])
            g[wordIdx][slotIdx] = selectedTileId
            return { ...prev, slotGrid: g, selectedTileId: null }
        })
        playFeedback("click", { sound: true })
    }

    const handleReshuffle = () => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({ ...prev, pool: shuffle(pool) }))
    }

    // 🪄 HINT 1: Auto-Place 1 Correct Letter
    const handleRevealLetter = () => {
        if (submitted || isEditing || disabled) return
        if (revealsUsed >= maxLetterReveals) return

        let targetWi = -1
        let targetSi = -1

        // Scan for first empty or wrong slot
        for (let wi = 0; wi < wordList.length; wi++) {
            for (let si = 0; si < wordList[wi].length; si++) {
                const tid = slotGrid[wi]?.[si]
                const currentLetter = tid ? pool.find(t => t.id === tid)?.letter : null
                if (currentLetter !== wordList[wi][si]) {
                    targetWi = wi
                    targetSi = si
                    break
                }
            }
            if (targetWi !== -1) break
        }

        if (targetWi === -1) return

        const targetLetter = wordList[targetWi][targetSi]
        const { newSlotGrid, newLockedGrid } = placeCorrectTileInSlot(
            targetLetter,
            targetWi,
            targetSi,
            pool,
            slotGrid,
            lockedGrid
        )

        setState(prev => ({
            ...prev,
            slotGrid: newSlotGrid,
            lockedGrid: newLockedGrid,
            revealsUsed: prev.revealsUsed + 1,
            selectedTileId: null,
        }))
        playFeedback("click", { sound: true })
        appEventBus.emit('HINT_USED', { componentId, type: 'wordScramble', hintKind: 'letter' })
    }

    // ⚡ HINT 2: Auto-Solve Next Word
    const handleSolveNextWord = () => {
        if (submitted || isEditing || disabled) return
        if (wordSolvesUsed >= maxWordSolves) return

        // Find first word that is not 100% correct
        let targetWi = -1
        for (let wi = 0; wi < wordList.length; wi++) {
            const spelled = (slotGrid[wi] ?? []).map(id => pool.find(t => t.id === id)?.letter ?? "").join("")
            if (spelled !== wordList[wi]) {
                targetWi = wi
                break
            }
        }

        if (targetWi === -1) return

        let currSlotGrid = slotGrid.map(r => [...r])
        let currLockedGrid = lockedGrid.map(r => [...r])

        for (let si = 0; si < wordList[targetWi].length; si++) {
            const targetLetter = wordList[targetWi][si]
            const res = placeCorrectTileInSlot(
                targetLetter,
                targetWi,
                si,
                pool,
                currSlotGrid,
                currLockedGrid
            )
            currSlotGrid = res.newSlotGrid
            currLockedGrid = res.newLockedGrid
        }

        setState(prev => ({
            ...prev,
            slotGrid: currSlotGrid,
            lockedGrid: currLockedGrid,
            wordSolvesUsed: prev.wordSolvesUsed + 1,
            selectedTileId: null,
        }))
        playFeedback("click", { sound: true })
        appEventBus.emit('HINT_USED', { componentId, type: 'wordScramble', hintKind: 'word' })
    }

    // ⚓ HINT 3: Lock First Letter of Every Word
    const handleFirstLetterAnchors = () => {
        if (submitted || isEditing || disabled) return
        if (anchorsUsed) return

        let currSlotGrid = slotGrid.map(r => [...r])
        let currLockedGrid = lockedGrid.map(r => [...r])

        for (let wi = 0; wi < wordList.length; wi++) {
            const targetLetter = wordList[wi][0]
            const res = placeCorrectTileInSlot(
                targetLetter,
                wi,
                0,
                pool,
                currSlotGrid,
                currLockedGrid
            )
            currSlotGrid = res.newSlotGrid
            currLockedGrid = res.newLockedGrid
        }

        setState(prev => ({
            ...prev,
            slotGrid: currSlotGrid,
            lockedGrid: currLockedGrid,
            anchorsUsed: true,
            selectedTileId: null,
        }))
        playFeedback("click", { sound: true })
        appEventBus.emit('HINT_USED', { componentId, type: 'wordScramble', hintKind: 'anchor' })
    }

    // Check answers
    const correctWords = wordList.map((word, wi) => {
        const spelled = (slotGrid[wi] ?? []).map(id => pool.find(t => t.id === id)?.letter ?? "").join("")
        return spelled === word
    })
    const allCorrect = correctWords.every(Boolean)
    const allSlotsFilled = slotGrid.every((row, wi) => row.length === wordList[wi].length && row.every(v => v !== null))

    const handleCheck = async () => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({
            ...prev,
            submitted: true,
            isCorrect: allCorrect,
            status: "completed",
            score: allCorrect ? points : 0,
            maxScore: points,
        }))

        if (allCorrect) {
            handlePoints(points)
            recordAttempt(true, points, points)
            playFeedback("correct", { sound: true })
        } else {
            recordAttempt(false)
            playFeedback("incorrect", { sound: true })
        }
    }

    const handleReset = () => {
        handleRetry()
        setState(prev => ({
            ...buildInitialState(wordList),
            showHintText: prev.showHintText,
        }))
    }

    return (
        <div className="flex flex-col h-full p-3 sm:p-4 md:p-5 max-w-2xl mx-auto w-full justify-between overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2 shrink-0">
                <FormattedText content={title} as="h3" className="text-sm font-black text-slate-800 uppercase tracking-wider" />

                {/* Helper Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {/* Text Clue Button */}
                    {allowTextClue && hint && (
                        <button
                            type="button"
                            onClick={() => setState(prev => ({ ...prev, showHintText: !prev.showHintText }))}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1 min-h-11 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer",
                                showHintText
                                    ? "bg-amber-400 text-slate-900 border-amber-400"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:border-amber-400"
                            )}
                        >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Clue</span>
                        </button>
                    )}

                    {/* Auto-Place Letter */}
                    {allowLetterReveal && (
                        <button
                            type="button"
                            onClick={handleRevealLetter}
                            disabled={submitted || isEditing || disabled || revealsUsed >= maxLetterReveals}
                            className="flex items-center gap-1 px-2.5 py-1 min-h-11 rounded-xl border-2 bg-sky-50 text-[#1CB0F6] border-sky-200 hover:bg-sky-100 font-bold text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={`Place 1 letter (${maxLetterReveals - revealsUsed} left)`}
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Letter ({maxLetterReveals - revealsUsed})</span>
                        </button>
                    )}

                    {/* Solve Next Word */}
                    {allowWordSolve && (
                        <button
                            type="button"
                            onClick={handleSolveNextWord}
                            disabled={submitted || isEditing || disabled || wordSolvesUsed >= maxWordSolves}
                            className="flex items-center gap-1 px-2.5 py-1 min-h-11 rounded-xl border-2 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 font-bold text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={`Solve next word (${maxWordSolves - wordSolvesUsed} left)`}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Word ({maxWordSolves - wordSolvesUsed})</span>
                        </button>
                    )}

                    {/* First Letter Anchors */}
                    {allowFirstLetterAnchors && (
                        <button
                            type="button"
                            onClick={handleFirstLetterAnchors}
                            disabled={submitted || isEditing || disabled || anchorsUsed}
                            className="flex items-center gap-1 px-2.5 py-1 min-h-11 rounded-xl border-2 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 font-bold text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Reveal first letter of every word"
                        >
                            <Anchor className="w-3.5 h-3.5" />
                            <span>{anchorsUsed ? "Anchors Active" : "First Letters"}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Hint text callout */}
            {allowTextClue && showHintText && hint && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <FormattedText content={hint} as="span" />
                </div>
            )}

            {/* Instruction */}
            {!submitted && (
                <p className="text-center text-[10px] font-bold text-slate-500 mb-2 shrink-0 uppercase tracking-wider">
                    {selectedTileId
                        ? "✦ Now tap an empty slot to place the letter"
                        : "Tap a letter, then tap a slot to place it"}
                </p>
            )}

            {/* Word slot rows */}
            <div className={cn(
                "mb-4 shrink-0 space-y-2.5 p-3 bg-slate-50/60 rounded-2xl border-2 border-slate-200 border-b-4",
                variant === "sentence" && "flex flex-wrap gap-x-4 gap-y-3 items-end justify-center space-y-0"
            )}>
                {wordList.map((word, wi) => (
                    <div key={wi} className={cn(
                        "flex items-center gap-2",
                        variant !== "sentence" && "justify-start"
                    )}>
                        {variant !== "sentence" && (
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-6 shrink-0 text-right">
                                {wi + 1}.
                            </span>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                            {word.split("").map((_, si) => {
                                const tileId = slotGrid[wi]?.[si] ?? null
                                const letter = tileId ? pool.find(t => t.id === tileId)?.letter : null
                                const isFilled = !!letter
                                const isLocked = lockedGrid[wi]?.[si] ?? false
                                const correct = submitted && correctWords[wi]
                                const incorrect = submitted && !correctWords[wi]

                                return (
                                    <button
                                        key={si}
                                        type="button"
                                        onClick={() => handleSlotClick(wi, si)}
                                        disabled={submitted || isEditing || disabled || isLocked || (!isFilled && !selectedTileId)}
                                        className={cn(
                                            "min-w-11 min-h-11 w-11 h-11 rounded-xl border-2 border-b-4 flex items-center justify-center font-black text-base select-none transition-all duration-150 relative",
                                            !isFilled && "bg-white border-slate-200 border-b-slate-300 text-slate-300",
                                            !isFilled && !!selectedTileId && !submitted && "border-[#1CB0F6] border-dashed animate-pulse cursor-pointer",
                                            isFilled && !submitted && !isLocked && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] cursor-pointer hover:opacity-80",
                                            isFilled && !submitted && isLocked && "bg-sky-500 text-white border-sky-500 border-b-sky-700 ring-2 ring-amber-400/60 shadow-md",
                                            submitted && correct && "bg-[#58CC02] text-white border-[#46a302] border-b-[#3B8C00]",
                                            submitted && incorrect && "bg-[#FF4B4B] text-white border-[#CC3C3C] border-b-[#992B2B]"
                                        )}
                                        title={isLocked ? "Auto-locked by hint" : isFilled ? "Click to remove" : selectedTileId ? "Place letter here" : ""}
                                    >
                                        {letter || ""}
                                        {isLocked && !submitted && (
                                            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm">
                                                ★
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                        {variant === "sentence" && wi < wordList.length - 1 && (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mb-3" />
                        )}
                    </div>
                ))}
            </div>

            {/* Letter pool */}
            {!submitted && (
                <div className="flex flex-wrap justify-center gap-2 mb-3 shrink-0">
                    {pool.map(tile => {
                        const isPlaced = placedIds.has(tile.id)
                        const isSel = isSelected(tile.id)
                        return (
                            <button
                                key={tile.id}
                                type="button"
                                onClick={() => handleSelectTile(tile.id)}
                                disabled={isPlaced || isEditing || disabled}
                                className={cn(
                                    "min-w-11 min-h-11 w-11 h-11 rounded-xl border-2 border-b-4 font-black text-sm transition-all duration-150 shadow-sm",
                                    !isPlaced && !isSel && "bg-white hover:bg-sky-50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-[#1CB0F6] cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                    !isPlaced && isSel && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-110 shadow-lg shadow-sky-400/30 cursor-pointer",
                                    isPlaced && "opacity-20 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {tile.letter}
                            </button>
                        )
                    })}
                    <button
                        type="button"
                        onClick={handleReshuffle}
                        disabled={isEditing || disabled}
                        className="min-w-11 min-h-11 w-11 h-11 rounded-xl border-2 border-b-4 bg-white hover:bg-sky-50 border-slate-200 border-b-slate-300 hover:border-[#1CB0F6] text-[#1CB0F6] flex items-center justify-center transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        title="Reshuffle Pool"
                    >
                        <Shuffle className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Action */}
            <div className="mt-auto flex gap-3 shrink-0">
                {submitted ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="w-full h-11 rounded-2xl border-2 border-b-4 border-slate-200 font-black text-xs uppercase tracking-wider"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>{ACTION_LABELS.tryAgain}</span>
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="duo"
                        onClick={handleCheck}
                        disabled={!allSlotsFilled || isEditing || disabled}
                        className={cn(
                            "w-full h-11",
                            allSlotsFilled
                                ? "bg-[#1CB0F6] hover:bg-sky-500 border-[#1CB0F6] border-b-[#0090CC]"
                                : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200"
                        )}
                    >
                        {ACTION_LABELS.checkAnswer}
                    </Button>
                )}
            </div>
        </div>
    )
}

// ─── Main Renderer ───────────────────────────────────────────────────────────

export function WordScrambleRenderer({
    id = "word-scramble-component",
    title = "Unscramble the Word",
    variant = "single",
    word = "PHOTOSYNTHESIS",
    words = ["SOLAR", "SYSTEM"],
    sentence = "Photosynthesis converts sunlight into energy",
    hint = "",
    points = 15,
    mode = "practice",
    allowTextClue = true,
    allowLetterReveal = true,
    maxLetterReveals = 3,
    allowWordSolve = true,
    maxWordSolves = 1,
    allowFirstLetterAnchors = true,
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: WordScrambleRendererProps) {
    const wordList = resolveWords(variant, word, words, sentence)

    const component: Component = {
        id,
        type: "wordScramble",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: {
            title,
            variant,
            word,
            words,
            sentence,
            hint,
            points,
            allowTextClue,
            allowLetterReveal,
            maxLetterReveals,
            allowWordSolve,
            maxWordSolves,
            allowFirstLetterAnchors,
        },
        mode: mode as any,
    } as Component

    const initialState = buildInitialState(wordList)

    const mergedSavedState: WordScrambleState | undefined = savedState
        ? {
            ...initialState,
            ...savedState,
            pool: savedState.pool ?? initialState.pool,
            slotGrid: savedState.slotGrid ?? initialState.slotGrid,
            lockedGrid: savedState.lockedGrid ?? initialState.lockedGrid,
        }
        : undefined

    return (
        <ScoredRenderer<WordScrambleState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={({ state, setState, handlePoints, handleRetry, recordAttempt }) => {
                if (variant === "single") {
                    return (
                        <SingleWordContent
                            state={state}
                            setState={setState}
                            handlePoints={handlePoints}
                            handleRetry={handleRetry}
                            recordAttempt={recordAttempt}
                            targetWord={wordList[0] ?? ""}
                            hint={hint}
                            title={title}
                            points={points}
                            isEditing={isEditing}
                            disabled={disabled}
                            allowTextClue={allowTextClue}
                            allowLetterReveal={allowLetterReveal}
                            maxLetterReveals={maxLetterReveals}
                            componentId={id}
                        />
                    )
                }
                return (
                    <MultiWordContent
                        state={state}
                        setState={setState}
                        handlePoints={handlePoints}
                        handleRetry={handleRetry}
                        recordAttempt={recordAttempt}
                        wordList={wordList}
                        hint={hint}
                        title={title}
                        points={points}
                        isEditing={isEditing}
                        disabled={disabled}
                        variant={variant}
                        allowTextClue={allowTextClue}
                        allowLetterReveal={allowLetterReveal}
                        maxLetterReveals={maxLetterReveals}
                        allowWordSolve={allowWordSolve}
                        maxWordSolves={maxWordSolves}
                        allowFirstLetterAnchors={allowFirstLetterAnchors}
                        componentId={id}
                    />
                )
            }}
        />
    )
}
