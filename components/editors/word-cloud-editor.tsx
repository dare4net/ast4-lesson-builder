"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Cloud, Plus, Trash2 } from "lucide-react"

export interface WordCloudEntry {
    id: string
    word: string
}

export interface WordCloudEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    prompt?: string
    onPromptChange?: (val: string) => void
    words?: WordCloudEntry[]
    onWordsChange?: (words: WordCloudEntry[]) => void
    maxWords?: number
    onMaxWordsChange?: (val: number) => void
}

export function WordCloudEditor({
    title = "Word Cloud",
    onTitleChange,
    prompt = "Add words that come to mind about this topic:",
    onPromptChange,
    words = [],
    onWordsChange,
    maxWords = 20,
    onMaxWordsChange,
}: WordCloudEditorProps) {
    const handleAddWord = () => {
        onWordsChange?.([...words, { id: `word-${Date.now()}`, word: "" }])
    }

    const handleUpdateWord = (id: string, word: string) => {
        onWordsChange?.(words.map(w => (w.id === id ? { ...w, word } : w)))
    }

    const handleDeleteWord = (id: string) => {
        onWordsChange?.(words.filter(w => w.id !== id))
    }

    return (
        <div className="space-y-6 w-full min-w-0">
            {/* Title */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-violet-400 shrink-0" />
                    Activity Title
                </Label>
                <Input
                    value={title}
                    onChange={e => onTitleChange?.(e.target.value)}
                    placeholder="e.g. Word Cloud"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-violet-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl w-full"
                />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">Prompt / Instruction</Label>
                <WYSIWYGInput
                    value={prompt}
                    onChange={val => onPromptChange?.(val)}
                    placeholder="e.g. What words come to mind when you think of..."
                />
            </div>

            {/* Max Words */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">Max Words Per Student</Label>
                <Input
                    type="number"
                    min={1}
                    max={50}
                    value={maxWords}
                    onChange={e => onMaxWordsChange?.(Number(e.target.value))}
                    className="bg-slate-950/60 border-slate-800 h-10 text-sm font-bold text-white rounded-xl w-28"
                />
            </div>

            {/* Seed Words (optional) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                        <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                            <Cloud className="w-4 h-4 text-violet-400 shrink-0" />
                            Seed Words (optional)
                        </Label>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Pre-populate the cloud with these words for all students.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddWord}
                        className="bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs h-8 px-2.5 rounded-xl shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Word
                    </Button>
                </div>

                {words.length === 0 ? (
                    <div className="p-5 text-center bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800 space-y-2">
                        <Cloud className="w-6 h-6 text-slate-700 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">No seed words — students start with a blank cloud.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {words.map((w, idx) => (
                            <div key={w.id} className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
                                <span className="text-[10px] font-black text-slate-600 w-5 text-center shrink-0">
                                    {idx + 1}
                                </span>
                                <Input
                                    value={w.word}
                                    onChange={e => handleUpdateWord(w.id, e.target.value)}
                                    placeholder="Seed word"
                                    className="bg-slate-900 border-slate-800 h-8 text-xs font-bold text-white flex-1 min-w-0"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteWord(w.id)}
                                    className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
