"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WYSIWYGTextArea } from "@/components/ui/wysiwyg-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Key, Sparkles } from "lucide-react"

interface ShortAnswerEditorProps {
    question: string
    placeholder: string
    markingMode: "self-mark" | "tutor-mark"
    correctKeywords: string[]
    onQuestionChange: (question: string) => void
    onPlaceholderChange: (placeholder: string) => void
    onMarkingModeChange: (mode: "self-mark" | "tutor-mark") => void
    onKeywordsChange: (keywords: string[]) => void
}

export function ShortAnswerEditor({
    question,
    placeholder,
    markingMode,
    correctKeywords = [],
    onQuestionChange,
    onPlaceholderChange,
    onMarkingModeChange,
    onKeywordsChange
}: ShortAnswerEditorProps) {
    const [newKeyword, setNewKeyword] = useState("")

    const handleAddKeyword = () => {
        if (!newKeyword.trim()) return
        const trimmed = newKeyword.trim()
        if (!correctKeywords.includes(trimmed)) {
            onKeywordsChange([...correctKeywords, trimmed])
        }
        setNewKeyword("")
    }

    const handleRemoveKeyword = (index: number) => {
        const updated = [...correctKeywords]
        updated.splice(index, 1)
        onKeywordsChange(updated)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddKeyword()
        }
    }

    return (
        <div className="space-y-6">
            {/* Question Prompt */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Question Prompt <span className="text-emerald-500">*</span>
                </Label>
                <WYSIWYGTextArea
                    value={question}
                    onChange={(val) => onQuestionChange(val)}
                    placeholder="Enter short answer question..."
                    rows={3}
                    showPreviewToggle={false}
                />
            </div>

            {/* Placeholder Text */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Placeholder Hint Text
                </Label>
                <Input
                    value={placeholder}
                    onChange={(e) => onPlaceholderChange(e.target.value)}
                    placeholder="e.g. Write your answer here..."
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold text-slate-200 rounded-xl"
                />
            </div>

            {/* Marking Mode Selection */}
            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Marking Strategy
                </Label>
                <Select value={markingMode} onValueChange={(val: any) => onMarkingModeChange(val)}>
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 h-11 text-sm font-bold text-slate-200 focus:ring-emerald-500/50 rounded-xl">
                        <SelectValue placeholder="Select marking strategy..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="self-mark" className="focus:bg-emerald-500 focus:text-slate-950 font-bold">
                            Self Mark (Auto-check Key Concepts)
                        </SelectItem>
                        <SelectItem value="tutor-mark" className="focus:bg-emerald-500 focus:text-slate-950 font-bold">
                            Tutor Mark (Manual Evaluation)
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Concepts / Required Keywords */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-400" />
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Key Concepts & Keywords ({correctKeywords.length})
                        </Label>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">
                        {markingMode === "self-mark" ? "Required for Pass" : "Tutor Reference"}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add key concept or keyword (e.g. photosynthesis)..."
                        className="flex-1 bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-10 text-xs font-bold text-slate-200 rounded-xl"
                    />
                    <Button
                        type="button"
                        onClick={handleAddKeyword}
                        disabled={!newKeyword.trim()}
                        className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/20"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>

                {/* Tag List */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {correctKeywords.map((kw, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl group/kw hover:border-emerald-500/50 transition-colors"
                        >
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-bold text-slate-200">{kw}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveKeyword(idx)}
                                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {correctKeywords.length === 0 && (
                        <div className="w-full text-center py-4 border border-dashed border-slate-800 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                No key concepts added yet. Add keywords to evaluate student answers.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
