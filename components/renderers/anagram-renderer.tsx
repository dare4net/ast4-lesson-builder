"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Sparkles, RefreshCw, HelpCircle, CheckCircle2, XCircle, Lightbulb, Shuffle, ArrowRightLeft } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { buildLiveStartMeta } from "@/lib/live-start-info"
import { useLiveBlock, readTimeLimit } from "@/hooks/use-live-block"
import { useHintPack } from "@/hooks/use-hint-pack"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

export interface AnagramRendererProps {
    id?: string
    title?: string
    targetWord?: string
    word?: string
    clue?: string
    hint?: string
    imageUrl?: string
    maxRevealsAllowed?: number
    timeLimit?: number
    points?: number
    mode?: "practice" | "live"
    savedState?: AnagramState
    setComponentState?: (state: AnagramState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

export type AnagramState = {
    /** Current tile order on the board */
    currentTiles: TileItem[]
    /** Currently selected index for swapping */
    selectedIndex: number | null
    revealedIndices: number[]
    hintPackBonus?: number
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

export interface TileItem {
    id: string
    char: string
}

function AnagramContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    isLive,
    mode,
    title,
    targetWord = "ALGORITHM",
    word,
    clue,
    hint,
    imageUrl,
    maxRevealsAllowed = 3,
    points = 15,
    isEditing,
    disabled,
    componentId,
    timeLimit,
}: ScoredRenderProps<AnagramState> & {
    title: string
    targetWord?: string
    word?: string
    clue?: string
    hint?: string
    imageUrl?: string
    maxRevealsAllowed?: number
    points: number
    isEditing: boolean
    disabled: boolean
    componentId: string
    timeLimit: number
}) {
    const { playFeedback } = useFeedback()
    const hintPack = useHintPack()
    const { showStartScreen, setHasStarted } = useLiveBlock({
        isLive,
        isComplete: state.submitted || state.status === "completed",
        lockId: componentId,
    })
    const extraHints = state.hintPackBonus || 0
    const hintLimit = maxRevealsAllowed + extraHints

    // Determine target word and hint text with fallback
    const rawTarget = (word || targetWord || "ALGORITHM").trim().toUpperCase()
    const hintText = hint || clue

    // Build target characters array
    const targetChars = rawTarget.split("")

    useEffect(() => {
        if (!state.currentTiles || state.currentTiles.length === 0) {
            const initialItems: TileItem[] = targetChars.map((char, index) => ({
                id: `tile-${index}-${char}`,
                char,
            }))
            // Shuffle initial items so they are scrambled
            let scrambled = [...initialItems].sort(() => Math.random() - 0.5)
            // Ensure not identical to original word on start
            if (scrambled.map(t => t.char).join("") === rawTarget && scrambled.length > 1) {
                scrambled = scrambled.reverse()
            }
            setState(prev => ({
                ...prev,
                currentTiles: scrambled,
                selectedIndex: null,
                revealedIndices: [],
            }))
        }
    }, [rawTarget])

    const { currentTiles = [], selectedIndex, revealedIndices = [], submitted } = state

    const handleTileClick = (index: number) => {
        if (submitted || isEditing || disabled) return
        if (revealedIndices.includes(index)) return // Locked if revealed by hint

        if (selectedIndex === null) {
            // First click: select this tile
            setState(prev => ({ ...prev, selectedIndex: index }))
            void playFeedback("click", { sound: true, animation: false })
            return
        }

        if (selectedIndex === index) {
            // Clicked same tile again: deselect
            setState(prev => ({ ...prev, selectedIndex: null }))
            void playFeedback("click", { sound: true, animation: false })
            return
        }

        // Second click: Swap tiles at selectedIndex and current index
        const nextTiles = [...currentTiles]
        const temp = nextTiles[selectedIndex]
        nextTiles[selectedIndex] = nextTiles[index]
        nextTiles[index] = temp

        setState(prev => ({
            ...prev,
            currentTiles: nextTiles,
            selectedIndex: null,
        }))

        void playFeedback("categorizeSlot", { sound: true, animation: false })
    }

    const handleShuffleBoard = () => {
        if (submitted || isEditing || disabled) return
        const unrevealedIndices = currentTiles
            .map((_, idx) => idx)
            .filter(idx => !revealedIndices.includes(idx))

        const unrevealedTiles = unrevealedIndices.map(idx => currentTiles[idx])
        const shuffledUnrevealed = [...unrevealedTiles].sort(() => Math.random() - 0.5)

        const nextTiles = [...currentTiles]
        unrevealedIndices.forEach((origIdx, i) => {
            nextTiles[origIdx] = shuffledUnrevealed[i]
        })

        setState(prev => ({
            ...prev,
            currentTiles: nextTiles,
            selectedIndex: null,
        }))
        void playFeedback("click", { sound: true, animation: false })
    }

    const handleRevealHint = async () => {
        if (submitted || isEditing || disabled) return
        const allowed = await hintPack.tryUnlock(revealedIndices.length, maxRevealsAllowed, extraHints, (bonus) => {
            setState(prev => ({ ...prev, hintPackBonus: (prev.hintPackBonus || 0) + bonus }))
        })
        if (!allowed) return

        // Find first slot where tile char does not match target char
        const incorrectIdx = targetChars.findIndex(
            (correctChar, idx) => !revealedIndices.includes(idx) && currentTiles[idx]?.char !== correctChar
        )

        if (incorrectIdx === -1) return

        const correctChar = targetChars[incorrectIdx]
        // Find a tile with matching correctChar starting from right side
        const donorIdx = currentTiles.findIndex(
            (t, idx) => idx !== incorrectIdx && t.char === correctChar && !revealedIndices.includes(idx)
        )

        if (donorIdx === -1) return

        const nextTiles = [...currentTiles]
        const temp = nextTiles[incorrectIdx]
        nextTiles[incorrectIdx] = nextTiles[donorIdx]
        nextTiles[donorIdx] = temp

        setState(prev => ({
            ...prev,
            currentTiles: nextTiles,
            selectedIndex: null,
            revealedIndices: [...prev.revealedIndices, incorrectIdx],
        }))

        void playFeedback("dngSuccess", { sound: true, animation: false })
    }

    const handleCheckAnswer = async (playSounds = true) => {
        if (submitted || isEditing || disabled) return

        const userWord = currentTiles.map(t => t?.char || "").join("")
        const isAllCorrect = userWord === rawTarget

        if (playSounds) {
            if (isAllCorrect) {
                await playFeedback("quizSuccess", { sound: true })
            } else {
                await playFeedback("incorrect", { sound: true })
            }
        }

        const earnedPoints = isAllCorrect ? Math.max(points - revealedIndices.length * 2, 5) : 0

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

    const onTimeout = () => {
        void handleCheckAnswer(false)
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        const initialItems: TileItem[] = targetChars.map((char, index) => ({
            id: `tile-${index}-${char}`,
            char,
        }))
        const scrambled = [...initialItems].sort(() => Math.random() - 0.5)

        setState({
            currentTiles: scrambled,
            selectedIndex: null,
            revealedIndices: [],
            submitted: false,
            status: "active",
        })
    }

    if (showStartScreen) {
        const liveMeta = buildLiveStartMeta({
            type: "anagram",
            title: title || "Anagram",
            timeLimitSec: timeLimit,
            points,
            units: 1,
        })
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                {...liveMeta}
            />
        )
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-3">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#58CC02]">
                        Anagram Challenge • {points} Points
                    </span>
                    <FormattedText content={title} as="h3" className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight" />
                </div>

                <div className="flex items-center gap-2">
                    {isLive ? (
                        <LiveTimer isCompleted={submitted} duration={timeLimit} onTimeout={onTimeout} />
                    ) : null}
                    {!submitted && (
                        <button
                            type="button"
                            onClick={handleShuffleBoard}
                            disabled={isEditing || disabled}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                            <Shuffle className="w-3.5 h-3.5 text-[#1CB0F6]" />
                            <span>Shuffle</span>
                        </button>
                    )}

                    {(revealedIndices.length < hintLimit || hintPack.charges > 0) && !submitted && (
                        <button
                            type="button"
                            onClick={handleRevealHint}
                            disabled={isEditing || disabled}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border-2 border-b-4 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                        >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Hint ({Math.max(0, hintLimit - revealedIndices.length)}{revealedIndices.length >= hintLimit && hintPack.charges > 0 ? ' + pack' : ''})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Hint / Clue Box */}
            {hintText && (
                <div className="shrink-0 my-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <HelpCircle className="w-4 h-4 text-[#1CB0F6] shrink-0" />
                    <span>Clue: <FormattedText content={hintText} as="span" /></span>
                </div>
            )}

            {/* Interactive Tile Swap Stage */}
            <div className="flex-1 flex flex-col justify-center items-center my-4 min-h-[160px]">
                <div className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-[#1CB0F6]" />
                    <span>Tap two tiles to swap their positions until the word is spelled correctly:</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-full">
                    {currentTiles.map((tile, idx) => {
                        const isSelected = selectedIndex === idx
                        const isRevealed = revealedIndices.includes(idx)
                        const isSlotCorrect = submitted && tile?.char === targetChars[idx]
                        const isSlotIncorrect = submitted && tile && tile.char !== targetChars[idx]

                        return (
                            <button
                                key={tile?.id || `slot-${idx}`}
                                type="button"
                                onClick={() => handleTileClick(idx)}
                                disabled={submitted || isRevealed || isEditing || disabled}
                                className={cn(
                                    "w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 border-b-4 flex flex-col items-center justify-center font-black text-xl sm:text-2xl shadow-sm transition-all duration-200 select-none relative cursor-pointer",
                                    !isSelected && !submitted && !isRevealed && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/5 active:border-b-2 active:translate-y-[2px]",
                                    isSelected && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] ring-4 ring-[#1CB0F6]/40 scale-110 z-10",
                                    isRevealed && "bg-amber-100 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 cursor-not-allowed",
                                    isSlotCorrect && "bg-[#58CC02] text-white border-[#58CC02] border-b-[#3B8C00]",
                                    isSlotIncorrect && "bg-[#FF4B4B] text-white border-[#FF4B4B] border-b-[#CC3C3C]"
                                )}
                            >
                                <span>{tile ? tile.char : ""}</span>
                                <span className="absolute bottom-1 text-[9px] font-mono opacity-40">
                                    {idx + 1}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Jump-Proof Footer Controls */}
            <div className="shrink-0 min-h-[56px] flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {submitted ? (
                        <span>
                            {state.isCorrect ? "Correct! Well done solving the anagram." : "Incorrect order. Try again!"}
                        </span>
                    ) : selectedIndex !== null ? (
                        <span className="text-[#1CB0F6] font-extrabold">
                            Tile &quot;{currentTiles[selectedIndex]?.char}&quot; selected — tap another tile to swap.
                        </span>
                    ) : (
                        <span>Tap a letter tile to begin swapping positions.</span>
                    )}
                </div>

                <div>
                    {!submitted ? (
                        <button
                            type="button"
                            onClick={() => void handleCheckAnswer(true)}
                            disabled={isEditing || disabled}
                            className="px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46a302] text-white border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] font-extrabold text-xs uppercase tracking-wider transition-all active:border-b-0 active:translate-y-[2px] shadow-md cursor-pointer"
                        >
                            Check Anagram
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

export function AnagramRenderer({
    id = "anagram-component",
    title = "Unscramble the Word",
    targetWord = "ALGORITHM",
    word,
    clue,
    hint,
    imageUrl,
    maxRevealsAllowed = 3,
    timeLimit: timeLimitProp = 25,
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: AnagramRendererProps) {
    const activeWord = word || targetWord || "ALGORITHM"
    const activeHint = hint || clue

    const component: Component = {
        id,
        type: "anagram",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, targetWord: activeWord, word: activeWord, clue: activeHint, hint: activeHint, imageUrl, points },
        mode: mode as any,
    } as Component

    const initialState: AnagramState = {
        currentTiles: [],
        selectedIndex: null,
        revealedIndices: [],
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
        <ScoredRenderer<AnagramState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={renderProps => (
                <AnagramContent
                    {...renderProps}
                    title={title}
                    targetWord={activeWord}
                    word={activeWord}
                    clue={activeHint}
                    hint={activeHint}
                    imageUrl={imageUrl}
                    maxRevealsAllowed={maxRevealsAllowed}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                    componentId={id}
                    timeLimit={readTimeLimit(timeLimitProp, 25)}
                />
            )}
        />
    )
}
