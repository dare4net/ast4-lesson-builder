"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCw, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, Type, ToggleLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WheelQuestion, QuestionType } from "@/components/renderers/spin-the-wheel-renderer"
import { DEFAULT_WHEEL_QUESTIONS } from "@/components/renderers/spin-the-wheel-renderer"

const SLICE_COLORS = [
    "#FF4B4B", "#FFC800", "#58CC02", "#1CB0F6",
    "#A560F8", "#FF8C00", "#00C9A7", "#FF6B9D",
]

const TYPE_META: Record<QuestionType, { label: string; icon: React.ReactNode; desc: string }> = {
    multipleChoice: {
        label: "Multiple Choice",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        desc: "Pick the correct option from a list",
    },
    inputAnswer: {
        label: "Short Answer",
        icon: <Type className="w-3.5 h-3.5" />,
        desc: "Student types an answer – checked against keywords",
    },
    trueFalse: {
        label: "True or False",
        icon: <ToggleLeft className="w-3.5 h-3.5" />,
        desc: "Binary True / False statement",
    },
}

interface SpinTheWheelEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    questions?: WheelQuestion[]
    onQuestionsChange?: (q: WheelQuestion[]) => void
    requiredSpins?: number
    onRequiredSpinsChange?: (val: number) => void
}

function QuestionCard({
    question,
    index,
    color,
    onUpdate,
    onDelete,
}: {
    question: WheelQuestion
    index: number
    color: string
    onUpdate: (updated: WheelQuestion) => void
    onDelete: () => void
}) {
    const [expanded, setExpanded] = useState(index === 0)

    const set = (field: keyof WheelQuestion, value: any) => onUpdate({ ...question, [field]: value })

    const setOption = (idx: number, val: string) => {
        const opts = [...(question.options || [])]
        opts[idx] = val
        set("options", opts)
    }

    const addOption = () => set("options", [...(question.options || []), ""])
    const removeOption = (idx: number) => {
        const opts = (question.options || []).filter((_, i) => i !== idx)
        const correctIdx = question.correctOptionIndex
        set("options", opts)
        if (correctIdx !== undefined) {
            if (idx === correctIdx) onUpdate({ ...question, options: opts, correctOptionIndex: 0 })
            else if (idx < correctIdx) onUpdate({ ...question, options: opts, correctOptionIndex: correctIdx - 1 })
        }
    }

    const setKeyword = (idx: number, val: string) => {
        const kws = [...(question.keywords || [])]
        kws[idx] = val
        set("keywords", kws)
    }
    const addKeyword = () => set("keywords", [...(question.keywords || []), ""])
    const removeKeyword = (idx: number) => set("keywords", (question.keywords || []).filter((_, i) => i !== idx))

    return (
        <div className="w-full max-w-full rounded-2xl border-2 border-b-4 border-slate-200 border-b-slate-300 bg-white shadow-sm min-w-0 overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="w-full max-w-full flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-50 transition-colors text-left min-w-0 overflow-hidden"
            >
                <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm"
                    style={{ background: color }}
                >
                    Q{index + 1}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 max-w-[80px] truncate">
                    {TYPE_META[question.type].icon}
                    <span className="truncate">{TYPE_META[question.type].label}</span>
                </span>
                <span className="text-xs font-bold text-slate-700 w-0 flex-1 truncate min-w-0 max-w-full block">
                    {question.prompt || <span className="text-slate-400 italic">No prompt yet</span>}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={e => { e.stopPropagation(); onDelete() }}
                        className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </div>
            </button>

            {/* Body */}
            {expanded && (
                <div className="p-3 border-t border-slate-100 space-y-4 w-full max-w-full min-w-0 overflow-hidden">
                    {/* Question Type */}
                    <div className="space-y-1 w-full max-w-full min-w-0">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Question Type</Label>
                        <Select value={question.type} onValueChange={v => set("type", v as QuestionType)}>
                            <SelectTrigger className="w-full max-w-full overflow-hidden bg-slate-950/60 border-slate-800 h-9 text-xs font-bold text-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 text-xs font-bold">
                                {(Object.entries(TYPE_META) as [QuestionType, typeof TYPE_META[QuestionType]][]).map(([key, meta]) => (
                                    <SelectItem key={key} value={key} className="focus:bg-amber-500 focus:text-white">
                                        <div className="flex items-center gap-2">
                                            {meta.icon}
                                            <span className="font-bold">{meta.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Prompt */}
                    <div className="space-y-1 w-full max-w-full min-w-0">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Question Prompt</Label>
                        <Textarea
                            value={question.prompt}
                            onChange={e => set("prompt", e.target.value)}
                            placeholder="e.g. What is the powerhouse of the cell?"
                            rows={2}
                            className="bg-slate-900 border-slate-800 text-xs font-bold text-white resize-none w-full max-w-full min-w-0"
                        />
                    </div>

                    {/* TYPE 1: Multiple Choice Fields */}
                    {question.type === "multipleChoice" && (
                        <div className="space-y-2 w-full max-w-full min-w-0">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                Answer Options — click ✓ to mark correct
                            </Label>
                            {(question.options || []).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2 w-full max-w-full min-w-0 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => set("correctOptionIndex", oi)}
                                        className={cn(
                                            "w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-all cursor-pointer",
                                            question.correctOptionIndex === oi
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "border-slate-700 bg-slate-800 text-slate-600 hover:border-emerald-500"
                                        )}
                                    >
                                        {question.correctOptionIndex === oi && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </button>
                                    <Input
                                        value={opt}
                                        onChange={e => setOption(oi, e.target.value)}
                                        placeholder={`Option ${oi + 1}`}
                                        className="bg-slate-900 border-slate-800 h-8 text-xs font-bold text-white w-0 flex-1 min-w-0"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeOption(oi)}
                                        disabled={(question.options || []).length <= 2}
                                        className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0 disabled:opacity-30"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            {(question.options || []).length < 6 && (
                                <Button
                                    type="button"
                                    onClick={addOption}
                                    className="w-full h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1 shrink-0" />Add Option
                                </Button>
                            )}
                        </div>
                    )}

                    {/* TYPE 2: Short Answer / Keyword Fields */}
                    {question.type === "inputAnswer" && (
                        <div className="space-y-2 w-full max-w-full min-w-0">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                Accepted Keywords (any one match = correct)
                            </Label>
                            {(question.keywords || []).map((kw, ki) => (
                                <div key={ki} className="flex items-center gap-2 w-full max-w-full min-w-0 overflow-hidden">
                                    <Input
                                        value={kw}
                                        onChange={e => setKeyword(ki, e.target.value)}
                                        placeholder={`Keyword ${ki + 1}`}
                                        className="bg-slate-900 border-slate-800 h-8 text-xs font-bold text-white w-0 flex-1 min-w-0"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeKeyword(ki)}
                                        className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={addKeyword}
                                className="w-full h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1 shrink-0" />Add Keyword
                            </Button>
                        </div>
                    )}

                    {/* TYPE 3: True / False Fields */}
                    {question.type === "trueFalse" && (
                        <div className="space-y-1 w-full max-w-full min-w-0">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Correct Answer</Label>
                            <div className="flex gap-2 w-full max-w-full min-w-0">
                                <button
                                    type="button"
                                    onClick={() => set("isTrue", true)}
                                    className={cn(
                                        "w-0 flex-1 min-w-0 py-2.5 rounded-xl border-2 border-b-4 font-black text-xs uppercase transition-all cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                        question.isTrue
                                            ? "bg-emerald-500 text-white border-emerald-500 border-b-emerald-700"
                                            : "bg-slate-900 text-slate-500 border-slate-800 border-b-slate-700 hover:border-emerald-500/50"
                                    )}
                                >
                                    ✓ True
                                </button>
                                <button
                                    type="button"
                                    onClick={() => set("isTrue", false)}
                                    className={cn(
                                        "w-0 flex-1 min-w-0 py-2.5 rounded-xl border-2 border-b-4 font-black text-xs uppercase transition-all cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                        question.isTrue === false
                                            ? "bg-rose-500 text-white border-rose-500 border-b-rose-700"
                                            : "bg-slate-900 text-slate-500 border-slate-800 border-b-slate-700 hover:border-rose-500/50"
                                    )}
                                >
                                    ✗ False
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Explanation */}
                    <div className="space-y-1 w-full max-w-full min-w-0">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Explanation (optional, shown after answer)</Label>
                        <Input
                            value={question.explanation || ""}
                            onChange={e => set("explanation", e.target.value)}
                            placeholder="e.g. The mitochondria is the powerhouse of the cell."
                            className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full max-w-full min-w-0"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export function SpinTheWheelEditor({
    title = "Spin the Wheel",
    onTitleChange,
    questions,
    onQuestionsChange,
    requiredSpins = 3,
    onRequiredSpinsChange,
}: SpinTheWheelEditorProps) {

    // Ensure questions pool is never empty (fallback to DEFAULT_WHEEL_QUESTIONS)
    const effectiveQuestions = (questions && questions.length > 0) ? questions : DEFAULT_WHEEL_QUESTIONS

    // Auto-seed parent props if questions were missing
    React.useEffect(() => {
        if (!questions || questions.length === 0) {
            onQuestionsChange?.(DEFAULT_WHEEL_QUESTIONS)
        }
    }, [questions, onQuestionsChange])

    const handleAddQuestion = (type: QuestionType) => {
        const newQ: WheelQuestion = {
            id: `q-${Date.now()}`,
            type,
            prompt: "",
            ...(type === "multipleChoice" ? { options: ["", ""], correctOptionIndex: 0 } : {}),
            ...(type === "inputAnswer" ? { keywords: [""] } : {}),
            ...(type === "trueFalse" ? { isTrue: true } : {}),
        }
        onQuestionsChange?.([...effectiveQuestions, newQ])
    }

    const handleUpdate = (id: string, updated: WheelQuestion) => {
        onQuestionsChange?.(effectiveQuestions.map(q => q.id === id ? updated : q))
    }

    const handleDelete = (id: string) => {
        onQuestionsChange?.(effectiveQuestions.filter(q => q.id !== id))
    }

    const effectiveRequired = Math.min(requiredSpins, Math.max(effectiveQuestions.length, 1))

    return (
        <div className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
            {/* Title */}
            <div className="space-y-2 w-full max-w-full min-w-0">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <RotateCw className="w-4 h-4 text-amber-400 shrink-0" />
                    Activity Title
                </Label>
                <Input
                    value={title}
                    onChange={e => onTitleChange?.(e.target.value)}
                    placeholder="e.g. Spin The Wheel!"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-amber-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl w-full max-w-full min-w-0"
                />
            </div>

            {/* Required Spins */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3 w-full max-w-full min-w-0 overflow-hidden">
                <div>
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide block">Required Spins to Complete</Label>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        How many questions must be answered before the activity ends.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap w-full max-w-full min-w-0">
                    <Input
                        type="number"
                        min={1}
                        max={effectiveQuestions.length || 1}
                        value={requiredSpins}
                        onChange={e => onRequiredSpinsChange?.(Math.max(1, Number(e.target.value)))}
                        className="bg-slate-900 border-slate-800 h-9 text-sm font-black text-amber-400 w-20 shrink-0"
                    />
                    <div className="flex gap-1.5 shrink-0 flex-wrap min-w-0">
                        {Array.from({ length: Math.min(effectiveRequired, 8) }).map((_, i) => (
                            <div key={i} className="w-3 h-3 rounded-full bg-amber-500/60 border border-amber-500 shrink-0" />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">
                        of {effectiveQuestions.length} question{effectiveQuestions.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Question Bank */}
            <div className="space-y-3 w-full max-w-full min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-full min-w-0">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                        <RotateCw className="w-4 h-4 text-amber-400 shrink-0" />
                        Question Bank ({effectiveQuestions.length})
                    </Label>
                </div>

                {/* Add Question buttons */}
                <div className="grid grid-cols-1 gap-2 w-full max-w-full min-w-0">
                    {(Object.entries(TYPE_META) as [QuestionType, typeof TYPE_META[QuestionType]][]).map(([type, meta]) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => handleAddQuestion(type)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-amber-500/40 text-slate-300 transition-all text-left group w-full max-w-full min-w-0 overflow-hidden cursor-pointer"
                        >
                            <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20">
                                {meta.icon}
                            </span>
                            <div className="w-0 flex-1 min-w-0 overflow-hidden">
                                <div className="text-xs font-black text-slate-200 flex items-center gap-1.5 truncate">
                                    <Plus className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span className="truncate">{meta.label}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium truncate">{meta.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {effectiveQuestions.length === 0 ? (
                    <div className="p-6 text-center bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800 space-y-2 w-full max-w-full min-w-0">
                        <RotateCw className="w-6 h-6 text-slate-700 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">Add questions above to build your question bank.</p>
                        <p className="text-[10px] text-slate-600 font-medium">Each question becomes a slice on the wheel.</p>
                    </div>
                ) : (
                    <div className="space-y-3 w-full max-w-full min-w-0">
                        {effectiveQuestions.map((q, idx) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                index={idx}
                                color={SLICE_COLORS[idx % SLICE_COLORS.length]}
                                onUpdate={updated => handleUpdate(q.id, updated)}
                                onDelete={() => handleDelete(q.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
