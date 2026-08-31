"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { WYSIWYGInput, WYSIWYGTextArea } from "@/components/ui/wysiwyg-editor"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArrayItemEditor } from "./base/ArrayItemEditor"
import { ReferencePicker } from "@/components/reference/reference-picker"
import type { ReferenceOption } from "@/lib/reference"

interface FlashcardQuizQuestion {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
    referenceComponentId?: string
}

interface FlashcardQuizEditorProps {
    questions: FlashcardQuizQuestion[]
    onQuestionsChange: (questions: FlashcardQuizQuestion[]) => void
    referenceOptions?: ReferenceOption[]
    selfId?: string
}

const MAX_OPTION_CHARS = 50
const MAX_QUESTION_CHARS = 120

export function FlashcardQuizEditor({
    questions = [],
    onQuestionsChange,
    referenceOptions,
    selfId,
}: FlashcardQuizEditorProps) {
    const addQuestion = () => {
        onQuestionsChange([
            ...questions,
            {
                id: `fq-${Date.now()}-${questions.length}`,
                question: `Question ${questions.length + 1}`,
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                correctAnswer: 0,
                explanation: "",
            },
        ])
    }

    const updateQuestion = (index: number, field: keyof FlashcardQuizQuestion, value: any) => {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        onQuestionsChange(updated)
    }

    const addOption = (qIndex: number) => {
        const q = questions[qIndex]
        if (q.options.length >= 4) return
        const updated = [...questions]
        updated[qIndex] = {
            ...updated[qIndex],
            options: [...q.options, `Option ${q.options.length + 1}`],
        }
        onQuestionsChange(updated)
    }

    const deleteOption = (qIndex: number, oIndex: number) => {
        const q = questions[qIndex]
        if (q.options.length <= 2) return
        const updatedOptions = q.options.filter((_, i) => i !== oIndex)
        let newCorrect = q.correctAnswer
        if (oIndex === q.correctAnswer) {
            newCorrect = 0
        } else if (oIndex < q.correctAnswer) {
            newCorrect = q.correctAnswer - 1
        }
        const updated = [...questions]
        updated[qIndex] = {
            ...updated[qIndex],
            options: updatedOptions,
            correctAnswer: newCorrect,
        }
        onQuestionsChange(updated)
    }

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions]
        const opts = [...updated[qIndex].options]
        opts[oIndex] = text.slice(0, MAX_OPTION_CHARS)
        updated[qIndex] = { ...updated[qIndex], options: opts }
        onQuestionsChange(updated)
    }

    const setCorrectAnswer = (qIndex: number, oIndex: number) => {
        const updated = [...questions]
        updated[qIndex] = { ...updated[qIndex], correctAnswer: oIndex }
        onQuestionsChange(updated)
    }

    return (
        <ArrayItemEditor<FlashcardQuizQuestion>
            items={questions}
            onChange={onQuestionsChange}
            onAddItem={addQuestion}
            getItemLabel={(q, index) => q.question || `Question ${index + 1}`}
            addButtonLabel="Add Question"
            maxItems={10}
            renderItem={(q, qIndex) => (
                <div className="space-y-6">
                    {/* Question text */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Question Prompt
                            </Label>
                            <span className="text-[9px] font-bold text-slate-600">
                                {q.question.length}/{MAX_QUESTION_CHARS}
                            </span>
                        </div>
                        <WYSIWYGInput
                            value={q.question}
                            onChange={(val) => updateQuestion(qIndex, "question", val)}
                            placeholder="Enter question..."
                        />
                    </div>

                    {/* Options grid / list */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Answer Options <span className="text-indigo-400">(click ✓ to set correct)</span>
                            </Label>
                            {q.options.length < 4 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => addOption(qIndex)}
                                    className="h-7 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-indigo-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest px-3"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Option ({q.options.length}/4)
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2.5 group/opt">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-9 w-9 shrink-0 rounded-xl border transition-all duration-300",
                                            q.correctAnswer === oIndex
                                                ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                                                : "bg-slate-950/50 border-slate-800 text-slate-600 hover:border-indigo-500/30 hover:text-indigo-400"
                                        )}
                                        onClick={() => setCorrectAnswer(qIndex, oIndex)}
                                    >
                                        {q.correctAnswer === oIndex ? (
                                            <Check className="h-4 w-4 stroke-[3]" />
                                        ) : (
                                            <Circle className="h-3.5 w-3.5" />
                                        )}
                                    </Button>

                                    <Input
                                        value={opt}
                                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                        placeholder={`Option ${oIndex + 1}`}
                                        maxLength={MAX_OPTION_CHARS}
                                        className={cn(
                                            "flex-1 bg-slate-950/50 border-slate-800 focus-visible:ring-indigo-500/50 h-9 text-xs font-semibold rounded-xl",
                                            q.correctAnswer === oIndex && "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-bold"
                                        )}
                                    />

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
                        <WYSIWYGTextArea
                            value={q.explanation || ""}
                            onChange={(val) => updateQuestion(qIndex, "explanation", val)}
                            placeholder="Why is this answer correct?"
                            rows={2}
                            showPreviewToggle={false}
                        />
                    </div>
                    <ReferencePicker
                        value={q.referenceComponentId || ''}
                        onChange={(id) => updateQuestion(qIndex, "referenceComponentId", id)}
                        options={referenceOptions}
                        selfId={selfId}
                        label="Question reference"
                    />
                </div>
            )}
        />
    )
}
