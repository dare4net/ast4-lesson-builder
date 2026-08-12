"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Type, HelpCircle, Sparkles } from "lucide-react"

export interface WordScrambleEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    word?: string
    onWordChange?: (val: string) => void
    hint?: string
    onHintChange?: (val: string) => void
}

export function WordScrambleEditor({
    title = "Unscramble the Word",
    onTitleChange,
    word = "PHOTOSYNTHESIS",
    onWordChange,
    hint = "",
    onHintChange,
}: WordScrambleEditorProps) {
    const cleanWord = word.toUpperCase().replace(/\s+/g, "")

    return (
        <div className="space-y-6">
            {/* Title Header */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1CB0F6]" />
                    Word Scramble Header Title
                </Label>
                <Input
                    value={title}
                    onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
                    placeholder="e.g. Unscramble the Vocabulary Word"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl"
                />
            </div>

            {/* Target Word Input */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#1CB0F6]" />
                    Target Answer Word
                </Label>
                <Input
                    value={word}
                    onChange={(e) => onWordChange && onWordChange(e.target.value.toUpperCase())}
                    placeholder="e.g. PHOTOSYNTHESIS"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-11 text-sm font-black tracking-widest uppercase placeholder:text-slate-700 rounded-xl text-sky-400 font-mono"
                />
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] text-slate-500 font-medium">
                        Letters will be automatically shuffled into tile buttons for student unscrambling.
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {cleanWord.length} Letter Tile{cleanWord.length === 1 ? "" : "s"}
                    </span>
                </div>
            </div>

            {/* Hint Text Input */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#1CB0F6]" />
                    Optional Hint Text
                </Label>
                <Input
                    value={hint}
                    onChange={(e) => onHintChange && onHintChange(e.target.value)}
                    placeholder="e.g. Process plants use to make food from sunlight..."
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-11 text-sm font-medium placeholder:text-slate-700 rounded-xl"
                />
            </div>
        </div>
    )
}
