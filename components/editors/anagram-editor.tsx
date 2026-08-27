"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor"
import { Label } from "@/components/ui/label"

interface AnagramEditorProps {
    word: string
    onWordChange: (val: string) => void
    hint: string
    onHintChange: (val: string) => void
}

export function AnagramEditor({
    word = "",
    onWordChange,
    hint = "",
    onHintChange,
}: AnagramEditorProps) {
    return (
        <div className="space-y-4 text-slate-200">
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Target Word / Phrase
                </Label>
                <Input
                    value={word}
                    onChange={e => onWordChange(e.target.value.toUpperCase())}
                    placeholder="e.g. ALGORITHM"
                    className="bg-slate-950/60 border-slate-800 text-sm font-bold tracking-widest uppercase"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Hint Text (Optional)
                </Label>
                <WYSIWYGInput
                    value={hint}
                    onChange={val => onHintChange(val)}
                    placeholder="e.g. A step-by-step procedure for solving a problem"
                />
            </div>
        </div>
    )
}
