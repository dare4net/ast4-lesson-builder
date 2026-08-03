"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Check, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

interface MultiSelectOption {
    id: string
    text: string
    isCorrect: boolean
    color: string
}

interface MultiSelectQuestion {
    id: string
    question: string
    options: MultiSelectOption[]
    explanation?: string
}

interface MultiSelectQuizEditorProps {
    questions: MultiSelectQuestion[]
    onQuestionsChange: (questions: MultiSelectQuestion[]) => void
}

const OPTION_COLORS = ["bg-violet-500", "bg-amber-500", "bg-sky-500", "bg-rose-500"]
const MAX_OPTION_CHARS = 50
const MAX_QUESTION_CHARS = 120

const makeDefaultQuestion = (index: number): MultiSelectQuestion => ({
    id: `q${Date.now()}-${index}`,
    question: `Question ${index + 1}`,
    options: [
        { id: `opt-${Date.now()}-a`, text: "Option A", isCorrect: true, color: OPTION_COLORS[0] },
        { id: `opt-${Date.now()}-b`, text: "Option B", isCorrect: false, color: OPTION_COLORS[1] },
        { id: `opt-${Date.now()}-c`, text: "Option C", isCorrect: false, color: OPTION_COLORS[2] },
        { id: `opt-${Date.now()}-d`, text: "Option D", isCorrect: false, color: OPTION_COLORS[3] },
    ],
    explanation: "",
})

export function MultiSelectQuizEditor({ questions = [], onQuestionsChange }: MultiSelectQuizEditorProps) {
    const addQuestion = () => {
        onQuestionsChange([...questions, makeDefaultQuestion(questions.length)])
    }

    const updateQuestion = (index: number, field: keyof MultiSelectQuestion, value: any) => {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        onQuestionsChange(updated)
    }

    const addOption = (qIndex: number) => {
        const q = questions[qIndex]
        if (q.options.length >= 4) return
        const newIndex = q.options.length
        const newOption: MultiSelectOption = {
            id: `opt-${Date.now()}-${newIndex}`,
            text: `Option ${String.fromCharCode(65 + newIndex)}`,
            isCorrect: false,
            color: OPTION_COLORS[newIndex % OPTION_COLORS.length],
        }
        const updated = [...questions]
        updated[qIndex] = {
            ...updated[qIndex],
            options: [...q.options, newOption],
        }
        onQuestionsChange(updated)
    }

    const deleteOption = (qIndex: number, oIndex: number) => {
        const q = questions[qIndex]
        if (q.options.length <= 2) return
        const updatedOptions = q.options
            .filter((_, i) => i !== oIndex)
            .map((opt, idx) => ({ ...opt, color: OPTION_COLORS[idx % OPTION_COLORS.length] }))

        const updated = [...questions]
        updated[qIndex] = {
            ...updated[qIndex],
            options: updatedOptions,
        }
        onQuestionsChange(updated)
    }

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions]
        const opts = [...updated[qIndex].options]
        opts[oIndex] = { ...opts[oIndex], text: text.slice(0, MAX_OPTION_CHARS) }
        updated[qIndex] = { ...updated[qIndex], options: opts }
        onQuestionsChange(updated)
    }

    const toggleCorrect = (qIndex: number, oIndex: number) => {
        const updated = [...questions]
        const opts = [...updated[qIndex].options]
        opts[oIndex] = { ...opts[oIndex], isCorrect: !opts[oIndex].isCorrect }
        updated[qIndex] = { ...updated[qIndex], options: opts }
        onQuestionsChange(updated)
    }

    return (
        <ArrayItemEditor<MultiSelectQuestion>
            items={questions}
            onChange={onQuestionsChange}
            onAddItem={addQuestion}
            getItemLabel={(q, index) => q.question || `Question ${index + 1}`}
            addButtonLabel="Add Question"
            maxItems={10}
            renderItem={(q, qIndex) => (
                <div className="space-y-6">
                    {/* Question Prompt */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Question Prompt
                            </Label>
                            <span className="text-[9px] font-bold text-slate-600">
                                {q.question.length}/{MAX_QUESTION_CHARS}
                            </span>
                        </div>
                        <Input
                            value={q.question}
                            onChange={(e) => updateQuestion(qIndex, "question", e.target.value.slice(0, MAX_QUESTION_CHARS))}
                            placeholder="Enter question..."
                            maxLength={MAX_QUESTION_CHARS}
                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-violet-500/50 h-11 text-sm font-bold rounded-xl"
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Options <span className="text-violet-400">(click ✓ to mark correct — multiple allowed)</span>
                            </Label>
                            {q.options.length < 4 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addOption(qIndex)}
                                    className="h-7 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-violet-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest px-3"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Option ({q.options.length}/4)
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            {q.options.map((opt, oIndex) => (
                                <div key={opt.id} className="flex items-center gap-2.5 group/opt">
                                    {/* Correct Toggle */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-9 w-9 shrink-0 rounded-xl border transition-all duration-300",
                                            opt.isCorrect
                                                ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                                                : "bg-slate-950/50 border-slate-800 text-slate-600 hover:border-violet-500/30 hover:text-violet-400"
                                        )}
                                        onClick={() => toggleCorrect(qIndex, oIndex)}
                                    >
                                        {opt.isCorrect ? <Check className="h-4 w-4 stroke-[3]" /> : <Square className="h-3.5 w-3.5" />}
                                    </Button>

                                    {/* Color Swatch */}
                                    <div className={cn("shrink-0 w-2.5 h-9 rounded-md", opt.color)} />

                                    {/* Text Input */}
                                    <Input
                                        value={opt.text}
                                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                        placeholder={`Option ${oIndex + 1}`}
                                        maxLength={MAX_OPTION_CHARS}
                                        className={cn(
                                            "flex-1 bg-slate-950/50 border-slate-800 focus-visible:ring-violet-500/50 h-9 text-xs font-semibold rounded-xl",
                                            opt.isCorrect && "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-bold"
                                        )}
                                    />

                                    {/* Delete option */}
                                    {q.options.length > 2 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteOption(qIndex, oIndex)}
                                            className="h-9 w-9 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover/opt:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Explanation (Optional)
                        </Label>
                        <Textarea
                            value={q.explanation || ""}
                            onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                            placeholder="Explanation displayed post-submission..."
                            rows={2}
                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-violet-500/50 text-xs font-medium placeholder:text-slate-700 rounded-xl resize-none p-3"
                        />
                    </div>
                </div>
            )}
        />
    )
}
