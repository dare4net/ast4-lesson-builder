"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ToggleLeft } from "lucide-react"

export interface TrueFalseEditorProps {
    statement?: string
    onStatementChange?: (val: string) => void
    isTrue?: boolean
    onIsTrueChange?: (val: boolean) => void
    explanation?: string
    onExplanationChange?: (val: string) => void
}

export function TrueFalseEditor({
    statement = "",
    onStatementChange,
    isTrue = true,
    onIsTrueChange,
    explanation = "",
    onExplanationChange,
}: TrueFalseEditorProps) {
    return (
        <div className="space-y-6 w-full min-w-0">
            {/* Statement */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4 text-indigo-400 shrink-0" />
                    Statement
                </Label>
                <Textarea
                    value={statement}
                    onChange={e => onStatementChange?.(e.target.value)}
                    placeholder="e.g. The speed of light is approximately 300,000 km/s."
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-indigo-500/50 text-sm font-bold placeholder:text-slate-700 rounded-xl w-full resize-none min-h-[80px]"
                    rows={3}
                />
            </div>

            {/* True / False Toggle */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                    Correct Answer
                </Label>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={isTrue}
                            onCheckedChange={val => onIsTrueChange?.(val)}
                            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500"
                        />
                        <span className={`text-sm font-black uppercase tracking-wider ${isTrue ? "text-emerald-400" : "text-rose-400"}`}>
                            {isTrue ? "TRUE" : "FALSE"}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => onIsTrueChange?.(true)}
                            className={`px-4 py-2 rounded-xl border-2 border-b-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:border-b-2 active:translate-y-[2px] ${isTrue
                                    ? "bg-emerald-500 text-white border-emerald-500 border-b-emerald-700"
                                    : "bg-slate-900 text-slate-500 border-slate-800 border-b-slate-700 hover:border-emerald-500/50"
                                }`}
                        >
                            ✓ True
                        </button>
                        <button
                            type="button"
                            onClick={() => onIsTrueChange?.(false)}
                            className={`px-4 py-2 rounded-xl border-2 border-b-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:border-b-2 active:translate-y-[2px] ${!isTrue
                                    ? "bg-rose-500 text-white border-rose-500 border-b-rose-700"
                                    : "bg-slate-900 text-slate-500 border-slate-800 border-b-slate-700 hover:border-rose-500/50"
                                }`}
                        >
                            ✗ False
                        </button>
                    </div>
                </div>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Explanation (shown after answer)
                </Label>
                <Textarea
                    value={explanation}
                    onChange={e => onExplanationChange?.(e.target.value)}
                    placeholder="e.g. Yes! The speed of light in a vacuum is exactly 299,792,458 m/s."
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-indigo-500/50 text-sm placeholder:text-slate-700 rounded-xl w-full resize-none min-h-[72px]"
                    rows={3}
                />
            </div>
        </div>
    )
}
