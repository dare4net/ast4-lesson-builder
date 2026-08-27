"use client"

import React, { useState } from "react"
import {
    Plus,
    Trash2,
    Grid3X3,
    Sparkles,
    Check,
    AlertTriangle,
    Maximize2,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    RotateCw,
    Move,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { CrosswordWord } from "@/components/renderers/crossword-renderer"

interface CrosswordEditorProps {
    gridSize: { rows: number; cols: number }
    onGridSizeChange: (size: { rows: number; cols: number }) => void
    words: CrosswordWord[]
    onWordsChange: (words: CrosswordWord[]) => void
}

export function CrosswordEditor({
    gridSize = { rows: 6, cols: 6 },
    onGridSizeChange,
    words = [],
    onWordsChange,
}: CrosswordEditorProps) {
    const [selectedWordId, setSelectedWordId] = useState<string | null>(null)
    const [isRelocateMode, setIsRelocateMode] = useState<boolean>(false)

    // Active selected word object
    const selectedWord = words.find(w => w.id === selectedWordId)

    // Build letter map & collision map across the grid
    const cellMap: Record<string, { char: string; wordIds: string[]; startNum?: number }> = {}
    const collisions: string[] = [] // "r,c" keys with letter mismatch

    // Determine starting numbers for across/down clues
    const sortedWords = [...words].sort((a, b) => a.row - b.row || a.col - b.col)
    let numberCounter = 1
    const wordNumbers: Record<string, number> = {}

    sortedWords.forEach(w => {
        const key = `${w.row},${w.col}`
        if (!wordNumbers[key]) {
            wordNumbers[key] = numberCounter++
        }
    })

    words.forEach(w => {
        const chars = (w.word || "").toUpperCase().split("")
        chars.forEach((char, idx) => {
            const r = w.direction === "down" ? w.row + idx : w.row
            const c = w.direction === "across" ? w.col + idx : w.col
            const key = `${r},${c}`

            if (!cellMap[key]) {
                cellMap[key] = {
                    char,
                    wordIds: [w.id],
                    startNum: idx === 0 ? wordNumbers[`${w.row},${w.col}`] : undefined,
                }
            } else {
                cellMap[key].wordIds.push(w.id)
                if (idx === 0) cellMap[key].startNum = wordNumbers[`${w.row},${w.col}`]
                if (cellMap[key].char !== char) {
                    if (!collisions.includes(key)) collisions.push(key)
                }
            }
        })
    })

    const handleAutoFitBounds = () => {
        let maxR = 5
        let maxC = 5

        words.forEach(w => {
            const endR = w.direction === "down" ? w.row + (w.word.length || 1) : w.row + 1
            const endC = w.direction === "across" ? w.col + (w.word.length || 1) : w.col + 1
            if (endR > maxR) maxR = endR
            if (endC > maxC) maxC = endC
        })

        onGridSizeChange({ rows: Math.min(maxR, 12), cols: Math.min(maxC, 12) })
    }

    const handleAddWordAtCell = (r: number, c: number) => {
        const newWord: CrosswordWord = {
            id: `word-${Date.now()}`,
            word: "ATOM",
            clue: "New clue...",
            direction: "across",
            row: r,
            col: c,
        }
        onWordsChange([...words, newWord])
        setSelectedWordId(newWord.id)
    }

    const handleAddWord = () => {
        handleAddWordAtCell(0, 0)
    }

    const handleUpdateWord = (id: string, updates: Partial<CrosswordWord>) => {
        const nextWords = words.map(w => (w.id === id ? { ...w, ...updates } : w))
        onWordsChange(nextWords)
    }

    const handleRemoveWord = (id: string) => {
        onWordsChange(words.filter(w => w.id !== id))
        if (selectedWordId === id) setSelectedWordId(null)
    }

    const handleShiftWord = (deltaR: number, deltaC: number) => {
        if (!selectedWord) return
        const newR = Math.max(0, Math.min(gridSize.rows - 1, selectedWord.row + deltaR))
        const newC = Math.max(0, Math.min(gridSize.cols - 1, selectedWord.col + deltaC))
        handleUpdateWord(selectedWord.id, { row: newR, col: newC })
    }

    const handleToggleDirection = () => {
        if (!selectedWord) return
        const newDir = selectedWord.direction === "across" ? "down" : "across"
        handleUpdateWord(selectedWord.id, { direction: newDir })
    }

    const handleCellClick = (r: number, c: number) => {
        const key = `${r},${c}`
        const cell = cellMap[key]

        if (selectedWord && isRelocateMode) {
            // Relocate selected word to this cell
            handleUpdateWord(selectedWord.id, { row: r, col: c })
            setIsRelocateMode(false)
            return
        }

        if (cell && cell.wordIds.length > 0) {
            // Select word or cycle if multiple
            if (selectedWordId && cell.wordIds.includes(selectedWordId) && cell.wordIds.length > 1) {
                const currentIdx = cell.wordIds.indexOf(selectedWordId)
                const nextIdx = (currentIdx + 1) % cell.wordIds.length
                setSelectedWordId(cell.wordIds[nextIdx])
            } else {
                setSelectedWordId(cell.wordIds[0])
            }
        } else {
            // Clicked empty cell: add new word or move current word if relocate clicked
            handleAddWordAtCell(r, c)
        }
    }

    return (
        <div className="space-y-6 text-slate-200">
            {/* Header Toolbar & Auto Bounds */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Rows</Label>
                        <Input
                            type="number"
                            min={3}
                            max={12}
                            value={gridSize.rows}
                            onChange={e => onGridSizeChange({ ...gridSize, rows: Number(e.target.value) })}
                            className="bg-slate-900 border-slate-800 text-xs font-bold w-16 h-8"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Cols</Label>
                        <Input
                            type="number"
                            min={3}
                            max={12}
                            value={gridSize.cols}
                            onChange={e => onGridSizeChange({ ...gridSize, cols: Number(e.target.value) })}
                            className="bg-slate-900 border-slate-800 text-xs font-bold w-16 h-8"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        onClick={handleAutoFitBounds}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold h-8 px-3 border border-slate-700 cursor-pointer"
                    >
                        <Maximize2 className="w-3.5 h-3.5 mr-1 text-[#1CB0F6]" />
                        Auto-Fit Grid
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAddWord}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-8 px-3 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Word
                    </Button>
                </div>
            </div>

            {/* Interactive Grid Canvas Preview */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6] flex items-center gap-1">
                        <Grid3X3 className="w-3.5 h-3.5" />
                        Interactive Crossword Grid ({gridSize.rows}×{gridSize.cols})
                    </Label>
                    {collisions.length > 0 && (
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {collisions.length} Mismatches
                        </span>
                    )}
                </div>

                {/* Floating Word Repositioning Toolbar (when a word is selected) */}
                {selectedWord && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-[#1CB0F6]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-[#1CB0F6] uppercase tracking-wider">
                                Active: &quot;{selectedWord.word}&quot;
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                                ({selectedWord.direction.toUpperCase()} @ R{selectedWord.row}, C{selectedWord.col})
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Directional Nudges */}
                            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => handleShiftWord(-1, 0)}
                                    title="Move Up"
                                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                                >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleShiftWord(1, 0)}
                                    title="Move Down"
                                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                                >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleShiftWord(0, -1)}
                                    title="Move Left"
                                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleShiftWord(0, 1)}
                                    title="Move Right"
                                    className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                                >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Flip Direction */}
                            <button
                                type="button"
                                onClick={handleToggleDirection}
                                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold flex items-center gap-1 text-[11px] cursor-pointer"
                            >
                                <RotateCw className="w-3 h-3 text-[#1CB0F6]" />
                                <span>Flip</span>
                            </button>

                            {/* Relocate Click Mode */}
                            <button
                                type="button"
                                onClick={() => setIsRelocateMode(!isRelocateMode)}
                                className={cn(
                                    "px-2 py-1.5 rounded-lg font-extrabold flex items-center gap-1 text-[11px] cursor-pointer transition-all",
                                    isRelocateMode
                                        ? "bg-amber-500 text-slate-950 animate-pulse"
                                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                                )}
                            >
                                <Move className="w-3 h-3" />
                                <span>{isRelocateMode ? "Click cell to place" : "Relocate"}</span>
                            </button>

                            {/* Delete Selected Word */}
                            <button
                                type="button"
                                onClick={() => handleRemoveWord(selectedWord.id)}
                                className="px-2 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                            >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedWordId(null)}
                                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* N x M Grid Render */}
                <div className="overflow-x-auto py-2 flex justify-center">
                    <div
                        className="grid gap-1 bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-inner"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
                        }}
                    >
                        {Array.from({ length: gridSize.rows }).map((_, r) =>
                            Array.from({ length: gridSize.cols }).map((_, c) => {
                                const key = `${r},${c}`
                                const cell = cellMap[key]
                                const isCollision = collisions.includes(key)
                                const isSelectedWordCell = cell?.wordIds.includes(selectedWordId || "")

                                return (
                                    <div
                                        key={key}
                                        onClick={() => handleCellClick(r, c)}
                                        className={cn(
                                            "w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 font-black text-sm flex items-center justify-center relative cursor-pointer transition-all select-none",
                                            !cell && "bg-slate-950 border-slate-800/80 text-slate-700 hover:border-[#1CB0F6]/50 hover:bg-[#1CB0F6]/5",
                                            cell && !isSelectedWordCell && !isCollision && "bg-slate-800 border-slate-700 text-slate-100 shadow-xs",
                                            cell && cell.wordIds.length > 1 && !isCollision && "bg-emerald-950/80 border-emerald-500 text-emerald-300",
                                            isSelectedWordCell && "bg-[#1CB0F6] border-[#1CB0F6] text-white ring-2 ring-[#1CB0F6]/40 scale-105 z-10",
                                            isCollision && "bg-rose-950/90 border-rose-500 text-rose-200 animate-pulse"
                                        )}
                                    >
                                        {cell?.startNum && (
                                            <span className="absolute top-0.5 left-1 text-[8px] font-mono leading-none opacity-80">
                                                {cell.startNum}
                                            </span>
                                        )}

                                        <span>{cell ? cell.char : ""}</span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
                <p className="text-[10px] font-bold text-center text-slate-500">
                    💡 Click a word to open movement arrows & delete button • Click an empty cell to add a new word
                </p>
            </div>

            {/* Crossword Words Cards List */}
            <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Puzzle Word Cards ({words.length})
                </Label>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {words.map((w, idx) => {
                        const isSelected = selectedWordId === w.id
                        return (
                            <div
                                key={w.id}
                                onClick={() => setSelectedWordId(w.id)}
                                className={cn(
                                    "p-3.5 rounded-2xl border transition-all space-y-3 cursor-pointer",
                                    isSelected
                                        ? "bg-slate-900 border-[#1CB0F6] ring-1 ring-[#1CB0F6]"
                                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-[#1CB0F6] uppercase tracking-wider">
                                        Word #{idx + 1} ({w.direction.toUpperCase()})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleRemoveWord(w.id)
                                        }}
                                        className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={w.word}
                                        onChange={e => handleUpdateWord(w.id, { word: e.target.value.toUpperCase() })}
                                        placeholder="WORD"
                                        className="bg-slate-900 border-slate-800 text-xs font-black uppercase font-mono tracking-wider"
                                    />

                                    <Select
                                        value={w.direction}
                                        onValueChange={(val: any) => handleUpdateWord(w.id, { direction: val })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-800 text-xs font-bold h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="across" className="font-bold">➡️ Across</SelectItem>
                                            <SelectItem value="down" className="font-bold">⬇️ Down</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <WYSIWYGInput
                                    value={w.clue}
                                    onChange={val => handleUpdateWord(w.id, { clue: val })}
                                    placeholder="Clue description..."
                                />

                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-500 font-bold">Start Row:</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={gridSize.rows - 1}
                                            value={w.row}
                                            onChange={e => handleUpdateWord(w.id, { row: Number(e.target.value) })}
                                            className="bg-slate-900 border-slate-800 text-xs font-bold h-7 w-16"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-500 font-bold">Start Col:</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={gridSize.cols - 1}
                                            value={w.col}
                                            onChange={e => handleUpdateWord(w.id, { col: Number(e.target.value) })}
                                            className="bg-slate-900 border-slate-800 text-xs font-bold h-7 w-16"
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
