"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

interface PollOption {
    id: string
    text: string
}

interface PollEditorProps {
    question: string
    options: PollOption[]
    onQuestionChange: (question: string) => void
    onOptionsChange: (options: PollOption[]) => void
}

const MAX_OPTION_CHARS = 60
const MAX_QUESTION_CHARS = 120

export function PollEditor({
    question,
    options = [],
    onQuestionChange,
    onOptionsChange,
}: PollEditorProps) {
    const handleAddOption = () => {
        if (options.length >= 6) return
        const newOpt: PollOption = {
            id: `opt-${Date.now()}`,
            text: `Option ${options.length + 1}`,
        }
        onOptionsChange([...options, newOpt])
    }

    const handleUpdateOption = (index: number, text: string) => {
        const updated = [...options]
        updated[index] = { ...updated[index], text: text.slice(0, MAX_OPTION_CHARS) }
        onOptionsChange(updated)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Poll Question
                    </Label>
                    <span className="text-[9px] font-bold text-slate-600">
                        {question.length}/{MAX_QUESTION_CHARS}
                    </span>
                </div>
                <WYSIWYGInput
                    value={question}
                    onChange={(val) => onQuestionChange(val)}
                    placeholder="Ask a question..."
                />
            </div>

            <ArrayItemEditor<PollOption>
                items={options}
                onChange={onOptionsChange}
                onAddItem={handleAddOption}
                getItemLabel={(opt, index) => opt.text || `Option ${index + 1}`}
                addButtonLabel="Add Option"
                maxItems={6}
                renderItem={(opt, index) => (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Option Text
                            </Label>
                            <span className="text-[9px] font-bold text-slate-600">
                                {opt.text.length}/{MAX_OPTION_CHARS}
                            </span>
                        </div>
                        <Input
                            value={opt.text}
                            onChange={(e) => handleUpdateOption(index, e.target.value)}
                            placeholder={`Enter option ${index + 1}`}
                            maxLength={MAX_OPTION_CHARS}
                            className="bg-slate-950/50 border-slate-800 focus-visible:ring-indigo-500/50 h-10 text-xs font-semibold rounded-lg"
                        />
                    </div>
                )}
            />
        </div>
    )
}
