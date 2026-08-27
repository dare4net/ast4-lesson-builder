"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Type, HelpCircle, Sparkles, Plus, Trash2, AlignLeft, Wand2, Zap, Anchor, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "single" | "multi" | "sentence"

export interface WordScrambleEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    variant?: Variant
    onVariantChange?: (val: Variant) => void
    word?: string
    onWordChange?: (val: string) => void
    words?: string[]
    onWordsChange?: (val: string[]) => void
    sentence?: string
    onSentenceChange?: (val: string) => void
    hint?: string
    onHintChange?: (val: string) => void

    // Hint controls
    allowTextClue?: boolean
    onAllowTextClueChange?: (val: boolean) => void
    allowLetterReveal?: boolean
    onAllowLetterRevealChange?: (val: boolean) => void
    maxLetterReveals?: number
    onMaxLetterRevealsChange?: (val: number) => void
    allowWordSolve?: boolean
    onAllowWordSolveChange?: (val: boolean) => void
    maxWordSolves?: number
    onMaxWordSolvesChange?: (val: number) => void
    allowFirstLetterAnchors?: boolean
    onAllowFirstLetterAnchorsChange?: (val: boolean) => void
}

export function WordScrambleEditor({
    title = "Unscramble the Word",
    onTitleChange,
    variant = "single",
    onVariantChange,
    word = "PHOTOSYNTHESIS",
    onWordChange,
    words = ["SOLAR", "SYSTEM"],
    onWordsChange,
    sentence = "Photosynthesis converts sunlight into energy",
    onSentenceChange,
    hint = "",
    onHintChange,
    allowTextClue = true,
    onAllowTextClueChange,
    allowLetterReveal = true,
    onAllowLetterRevealChange,
    maxLetterReveals = 3,
    onMaxLetterRevealsChange,
    allowWordSolve = true,
    onAllowWordSolveChange,
    maxWordSolves = 1,
    onMaxWordSolvesChange,
    allowFirstLetterAnchors = true,
    onAllowFirstLetterAnchorsChange,
}: WordScrambleEditorProps) {
    const [activeVariant, setActiveVariant] = useState<Variant>(variant)

    useEffect(() => {
        if (variant) {
            setActiveVariant(variant)
        }
    }, [variant])

    const handleVariantSwitch = (v: Variant) => {
        setActiveVariant(v)
        onVariantChange?.(v)
    }

    const handleAddWord = () => {
        onWordsChange?.([...words, ""])
    }

    const handleUpdateWord = (idx: number, val: string) => {
        const next = [...words]
        next[idx] = val.toUpperCase()
        onWordsChange?.(next)
    }

    const handleRemoveWord = (idx: number) => {
        onWordsChange?.(words.filter((_, i) => i !== idx))
    }

    const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean)

    return (
        <div className="space-y-6">
            {/* Header Title */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1CB0F6]" />
                    Header Title
                </Label>
                <Input
                    value={title}
                    onChange={e => onTitleChange?.(e.target.value)}
                    placeholder="e.g. Unscramble the Vocabulary Word"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl"
                />
            </div>

            {/* Rearrange Mode */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#1CB0F6]" />
                    Rearrange Mode
                </Label>
                <div className="grid grid-cols-3 gap-2">
                    {(["single", "multi", "sentence"] as Variant[]).map(v => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => handleVariantSwitch(v)}
                            className={cn(
                                "px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer",
                                activeVariant === v
                                    ? "bg-[#1CB0F6] text-white border-[#1CB0F6]"
                                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
                            )}
                        >
                            {v === "single" ? "🔤 Single" : v === "multi" ? "📝 Multi-Word" : "💬 Sentence"}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-slate-500 font-medium px-1">
                    {activeVariant === "single" && "Student unscrambles one word from a letter pool."}
                    {activeVariant === "multi" && "Student places letters from a shared pool into slots for multiple words."}
                    {activeVariant === "sentence" && "Student arranges letters from a shared pool to build a full sentence."}
                </p>
            </div>

            {/* Single mode target */}
            {activeVariant === "single" && (
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <Type className="w-4 h-4 text-[#1CB0F6]" />
                        Target Word
                    </Label>
                    <Input
                        value={word}
                        onChange={e => onWordChange?.(e.target.value.toUpperCase())}
                        placeholder="e.g. PHOTOSYNTHESIS"
                        className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-11 text-sm font-black tracking-widest uppercase placeholder:text-slate-700 rounded-xl text-sky-400 font-mono"
                    />
                </div>
            )}

            {/* Multi-word mode target */}
            {activeVariant === "multi" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                            <Type className="w-4 h-4 text-[#1CB0F6]" />
                            Target Words ({words.length})
                        </Label>
                        <Button
                            type="button"
                            onClick={handleAddWord}
                            className="bg-[#1CB0F6] hover:bg-sky-400 text-white font-black text-xs h-8 px-3 rounded-xl"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Word
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {words.map((w, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500 w-5 shrink-0 text-right">{idx + 1}.</span>
                                <Input
                                    value={w}
                                    onChange={e => handleUpdateWord(idx, e.target.value)}
                                    placeholder={`e.g. WORD${idx + 1}`}
                                    className="bg-slate-900 border-slate-800 text-xs font-black tracking-widest uppercase font-mono text-sky-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveWord(idx)}
                                    disabled={words.length <= 1}
                                    className="text-rose-400 hover:text-rose-300 disabled:opacity-30 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sentence mode target */}
            {activeVariant === "sentence" && (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-[#1CB0F6]" />
                            Target Sentence
                        </Label>
                        <textarea
                            value={sentence}
                            onChange={e => onSentenceChange?.(e.target.value)}
                            placeholder="e.g. Photosynthesis converts sunlight into chemical energy"
                            rows={3}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-bold text-slate-200 placeholder:text-slate-700 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                        />
                    </div>

                    {sentenceWords.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentence Structure</p>
                            <div className="flex flex-wrap gap-2">
                                {sentenceWords.map((w, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <div className="flex gap-0.5">
                                            {w.toUpperCase().split("").map((_, si) => (
                                                <div key={si} className="w-5 h-5 bg-slate-800 border border-slate-700 rounded-md text-[8px] font-bold text-slate-400 flex items-center justify-center">_</div>
                                            ))}
                                        </div>
                                        <span className="text-[8px] text-slate-500 font-bold">{w.toUpperCase()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Text Clue String */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#1CB0F6]" />
                    Clue / Definition Text
                </Label>
                <Input
                    value={hint}
                    onChange={e => onHintChange?.(e.target.value)}
                    placeholder="e.g. Process plants use to make food from sunlight..."
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-11 text-sm font-medium placeholder:text-slate-700 rounded-xl"
                />
            </div>

            {/* Interactive Student Helpers Config */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-amber-400" />
                    Interactive Hint Helpers
                </Label>

                {/* 1. Text Clue Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            Text Clue Toggle
                        </div>
                        <p className="text-[10px] text-slate-500">Allow student to toggle the text definition clue.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onAllowTextClueChange?.(!allowTextClue)}
                        className={cn(
                            "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                            allowTextClue ? "bg-[#1CB0F6]" : "bg-slate-800"
                        )}
                    >
                        <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-transform", allowTextClue ? "right-1" : "left-1")} />
                    </button>
                </div>

                {/* 2. Auto-Place Letter Helper */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                <Wand2 className="w-3.5 h-3.5 text-sky-400" />
                                Auto-Place Letter Helper
                            </div>
                            <p className="text-[10px] text-slate-500">Places 1 correct letter from pool into slot and locks it.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onAllowLetterRevealChange?.(!allowLetterReveal)}
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                                allowLetterReveal ? "bg-[#1CB0F6]" : "bg-slate-800"
                            )}
                        >
                            <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-transform", allowLetterReveal ? "right-1" : "left-1")} />
                        </button>
                    </div>

                    {allowLetterReveal && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                            <span className="text-[11px] font-bold text-slate-400">Max Letter Reveals</span>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 5].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => onMaxLetterRevealsChange?.(n)}
                                        className={cn(
                                            "w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer",
                                            maxLetterReveals === n
                                                ? "bg-sky-500 text-white"
                                                : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                        )}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Solve Next Word Helper (Multi & Sentence only) */}
                {activeVariant !== "single" && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                                    Solve Next Word Helper
                                </div>
                                <p className="text-[10px] text-slate-500">Auto-fills all letters for the next uncompleted word.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onAllowWordSolveChange?.(!allowWordSolve)}
                                className={cn(
                                    "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                                    allowWordSolve ? "bg-[#1CB0F6]" : "bg-slate-800"
                                )}
                            >
                                <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-transform", allowWordSolve ? "right-1" : "left-1")} />
                            </button>
                        </div>

                        {allowWordSolve && (
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                                <span className="text-[11px] font-bold text-slate-400">Max Word Solves</span>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => onMaxWordSolvesChange?.(n)}
                                            className={cn(
                                                "w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer",
                                                maxWordSolves === n
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                                            )}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Lock First Letter Anchors (Multi & Sentence only) */}
                {activeVariant !== "single" && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                                First-Letter Anchors
                            </div>
                            <p className="text-[10px] text-slate-500">Reveals & locks the 1st letter of every word as a visual scaffold.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onAllowFirstLetterAnchorsChange?.(!allowFirstLetterAnchors)}
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors relative cursor-pointer",
                                allowFirstLetterAnchors ? "bg-[#1CB0F6]" : "bg-slate-800"
                            )}
                        >
                            <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-transform", allowFirstLetterAnchors ? "right-1" : "left-1")} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
