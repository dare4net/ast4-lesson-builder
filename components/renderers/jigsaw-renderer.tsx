"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Puzzle, RefreshCw, CheckCircle2, Info, Sparkles, Eye } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

export interface JigsawHotspot {
    label: string
    x: number // percentage
    y: number // percentage
    content: string
}

export interface JigsawRendererProps {
    id?: string
    title?: string
    image?: string
    gridSize?: 2 | 3 | 4
    hotspots?: JigsawHotspot[]
    points?: number
    mode?: "practice" | "live"
    savedState?: JigsawState
    setComponentState?: (state: JigsawState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

export type JigsawState = {
    /** Target Slot Index (0..N-1) -> Placed Tile ID */
    placements: Record<number, string>
    /** Available Tile IDs in tray */
    trayTileIds: string[]
    selectedTileId: string | null
    activeHotspot: JigsawHotspot | null
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
    moves?: number
}

interface JigsawTile {
    id: string
    correctSlot: number // 0-indexed position in grid
    row: number
    col: number
}

function JigsawContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    mode,
    title,
    image = "/placeholder.svg?height=400&width=600",
    gridSize = 3,
    hotspots = [],
    points = 15,
    isEditing,
    disabled,
}: ScoredRenderProps<JigsawState> & {
    title: string
    image: string
    gridSize: 2 | 3 | 4
    hotspots?: JigsawHotspot[]
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { playFeedback } = useFeedback()
    const totalTiles = gridSize * gridSize

    // Build static tile metadata
    const [tiles, setTiles] = useState<JigsawTile[]>([])

    useEffect(() => {
        const generatedTiles: JigsawTile[] = []
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const idx = row * gridSize + col
                generatedTiles.push({
                    id: `tile-${idx}`,
                    correctSlot: idx,
                    row,
                    col,
                })
            }
        }
        setTiles(generatedTiles)

        const expectedTotal = gridSize * gridSize
        const currentTotalStateTiles = (state.trayTileIds?.length || 0) + Object.keys(state.placements || {}).length

        if (currentTotalStateTiles !== expectedTotal) {
            const shuffledIds = generatedTiles.map(t => t.id).sort(() => Math.random() - 0.5)
            setState(prev => ({
                ...prev,
                placements: {},
                trayTileIds: shuffledIds,
                selectedTileId: null,
                submitted: false,
            }))
        }
    }, [gridSize])

    const { placements, trayTileIds, selectedTileId, activeHotspot, submitted } = state

    const handleTileSelectFromTray = (tileId: string) => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({
            ...prev,
            selectedTileId: prev.selectedTileId === tileId ? null : tileId,
        }))
        void playFeedback("click", { sound: true, animation: false })
    }

    const handleSlotClick = (slotIdx: number) => {
        if (submitted || isEditing || disabled) return

        const currentPlacedId = placements[slotIdx]

        if (selectedTileId) {
            // Place selected tile into slot
            const nextPlacements = { ...placements, [slotIdx]: selectedTileId }
            const nextTray = trayTileIds.filter(id => id !== selectedTileId)

            // If slot already had a tile, return it to tray
            if (currentPlacedId && currentPlacedId !== selectedTileId) {
                nextTray.push(currentPlacedId)
            }

            setState(prev => ({
                ...prev,
                placements: nextPlacements,
                trayTileIds: nextTray,
                selectedTileId: null,
                moves: (prev.moves || 0) + 1,
            }))

            void playFeedback("categorizeSlot", { sound: true, animation: false })
        } else if (currentPlacedId) {
            // Remove tile from slot back to tray
            const nextPlacements = { ...placements }
            delete nextPlacements[slotIdx]
            const nextTray = [...trayTileIds, currentPlacedId]

            setState(prev => ({
                ...prev,
                placements: nextPlacements,
                trayTileIds: nextTray,
                moves: (prev.moves || 0) + 1,
            }))

            void playFeedback("click", { sound: true, animation: false })
        }
    }

    const handleCheckAssembly = async () => {
        if (submitted || isEditing || disabled) return

        let correctCount = 0
        tiles.forEach(tile => {
            if (placements[tile.correctSlot] === tile.id) correctCount++
        })

        const isAllCorrect = correctCount === totalTiles
        const earnedPoints = isAllCorrect ? points : Math.round((correctCount / totalTiles) * points)

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
        recordAttempt(isAllCorrect, earnedPoints, points, undefined, { jigsawMoves: state.moves || 0 })
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        const shuffledIds = tiles.map(t => t.id).sort(() => Math.random() - 0.5)
        setState({
            placements: {},
            trayTileIds: shuffledIds,
            selectedTileId: null,
            activeHotspot: null,
            submitted: false,
            status: "active",
        })
    }

    const placedCount = Object.keys(placements).length

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-3">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">
                        Jigsaw Puzzle • {points} Points
                    </span>
                    <FormattedText content={title} as="h3" className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight" />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Puzzle className="w-3.5 h-3.5 text-[#1CB0F6]" />
                    <span>
                        {gridSize}x{gridSize} ({placedCount}/{totalTiles} Placed)
                    </span>
                </div>
            </div>

            {/* Main Content Area: Side-by-Side on Desktop (lg:grid-cols-12), Stacked on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 min-h-0 w-full max-w-6xl mx-auto my-2">
                {/* Left/Main Column: Puzzle Board Stage */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] w-full">
                    <div
                        className={cn(
                            "relative w-full aspect-square max-w-md sm:max-w-lg min-h-[280px] sm:min-h-[360px] rounded-xl border-4 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl grid gap-0 p-0 mx-auto",
                            gridSize === 2 && "grid-cols-2 grid-rows-2",
                            gridSize === 3 && "grid-cols-3 grid-rows-3",
                            gridSize === 4 && "grid-cols-4 grid-rows-4"
                        )}
                    >
                        {Array.from({ length: totalTiles }).map((_, slotIdx) => {
                            const placedTileId = placements[slotIdx]
                            const tile = tiles.find(t => t.id === placedTileId)
                            const isCorrectSlot = submitted && tile?.correctSlot === slotIdx
                            const isIncorrectSlot = submitted && tile && tile.correctSlot !== slotIdx

                            return (
                                <div
                                    key={`slot-${slotIdx}`}
                                    onClick={() => handleSlotClick(slotIdx)}
                                    className={cn(
                                        "relative transition-all duration-200 overflow-hidden flex items-center justify-center cursor-pointer select-none",
                                        !tile && "border border-dashed border-slate-800 bg-slate-900/90 hover:bg-slate-800/80 text-slate-500 font-black text-base sm:text-lg",
                                        tile && !submitted && "border border-slate-900/30",
                                        isCorrectSlot && "border-0",
                                        isIncorrectSlot && "border-2 border-[#FF4B4B] z-10 ring-2 ring-[#FF4B4B]"
                                    )}
                                >
                                    {tile ? (
                                        <div
                                            className="w-full h-full bg-no-repeat bg-cover"
                                            style={{
                                                backgroundImage: `url(${image})`,
                                                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                                backgroundPosition: `${(tile.col / (gridSize - 1)) * 100}% ${(tile.row / (gridSize - 1)) * 100}%`,
                                            }}
                                        />
                                    ) : (
                                        <span>{slotIdx + 1}</span>
                                    )}
                                </div>
                            )
                        })}

                        {/* Unlocked Hotspots Layer on Completion */}
                        {submitted && state.isCorrect && hotspots.map((hs, idx) => (
                            <button
                                key={`hs-${idx}`}
                                type="button"
                                onClick={() => setState(prev => ({ ...prev, activeHotspot: hs }))}
                                style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1CB0F6] border-2 border-white text-white font-black text-sm flex items-center justify-center shadow-lg animate-bounce cursor-pointer"
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Piece Palette */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4 min-h-0 w-full">
                    {!submitted ? (
                        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 space-y-3 w-full shadow-lg flex-1 flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 shrink-0">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                                    Piece Palette
                                </span>
                                <span className="text-xs font-black text-[#1CB0F6]">
                                    {trayTileIds.length} remaining
                                </span>
                            </div>

                            {/* Screen-breakpoint responsive piece grid (4 cols on large, 3 cols on sm, 2 cols on xs) */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 py-2 max-h-[340px] overflow-y-auto">
                                {trayTileIds.map(id => {
                                    const tile = tiles.find(t => t.id === id)
                                    if (!tile) return null
                                    const isSelected = selectedTileId === id

                                    return (
                                        <div key={tile.id} className="relative w-full aspect-square min-h-[50px]">
                                            <button
                                                type="button"
                                                onClick={() => handleTileSelectFromTray(tile.id)}
                                                disabled={isEditing || disabled}
                                                className={cn(
                                                    "absolute inset-0 w-full h-full rounded-none border-2 border-b-4 overflow-hidden transition-all duration-150 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-md p-0",
                                                    isSelected
                                                        ? "border-[#1CB0F6] border-b-[#0090CC] scale-105 ring-4 ring-[#1CB0F6]/40 shadow-xl z-10"
                                                        : "border-slate-700 border-b-slate-800 hover:border-[#1CB0F6]/60 hover:scale-102"
                                                )}
                                            >
                                                <div
                                                    className="w-full h-full bg-no-repeat bg-cover"
                                                    style={{
                                                        backgroundImage: `url(${image})`,
                                                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                                        backgroundPosition: `${(tile.col / (gridSize - 1)) * 100}% ${(tile.row / (gridSize - 1)) * 100}%`,
                                                    }}
                                                />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 rounded-3xl bg-emerald-950/40 border-2 border-[#58CC02] text-center shrink-0 space-y-2">
                            <span className="text-xs font-black uppercase tracking-wider text-[#58CC02] block">
                                {state.isCorrect ? "Awesome! Diagram assembled perfectly!" : "Some tiles are misplaced."}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hotspot Popup Modal */}
            {activeHotspot && (
                <div className="shrink-0 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/80 border-2 border-[#1CB0F6] text-xs sm:text-sm font-bold text-sky-900 dark:text-sky-100 flex items-center justify-between my-2">
                    <div>
                        <strong>{activeHotspot.label}:</strong> {activeHotspot.content}
                    </div>
                    <button
                        type="button"
                        onClick={() => setState(prev => ({ ...prev, activeHotspot: null }))}
                        className="text-xs font-black text-[#1CB0F6] uppercase hover:underline ml-2 cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Footer Controls */}
            <div className="shrink-0 min-h-[56px] flex items-center justify-between pt-2">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {submitted ? (
                        <span>
                            {state.isCorrect ? "Awesome! Diagram assembled perfectly!" : "Some tiles are misplaced. Give it another shot!"}
                        </span>
                    ) : selectedTileId ? (
                        <span className="text-[#1CB0F6]">Tile selected — tap a grid slot to place it.</span>
                    ) : (
                        <span>Tap a tile from the tray, then tap a grid slot to place it.</span>
                    )}
                </div>

                <div>
                    {!submitted ? (
                        <button
                            type="button"
                            onClick={handleCheckAssembly}
                            disabled={placedCount < totalTiles || isEditing || disabled}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                                placedCount === totalTiles
                                    ? "bg-[#58CC02] hover:bg-[#46a302] text-white border-[#58CC02] border-b-[#3B8C00] shadow-md cursor-pointer"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                            )}
                        >
                            Check Assembly
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

export function JigsawRenderer({
    id = "jigsaw-component",
    title = "Assemble the Diagram",
    image = "/placeholder.svg?height=400&width=600",
    gridSize: rawGridSize = 3,
    hotspots = [],
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: JigsawRendererProps) {
    const gridSize = (typeof rawGridSize === "object" ? (rawGridSize as any)?.rows || 3 : Number(rawGridSize) || 3) as 2 | 3 | 4
    const component: Component = {
        id,
        type: "jigsaw",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, image, gridSize, hotspots, points },
        mode: mode as any,
    } as Component

    const initialState: JigsawState = {
        placements: {},
        trayTileIds: [],
        selectedTileId: null,
        activeHotspot: null,
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
        <ScoredRenderer<JigsawState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={renderProps => (
                <JigsawContent
                    {...renderProps}
                    title={title}
                    image={image}
                    gridSize={gridSize}
                    hotspots={hotspots}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
