"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Info, Lightbulb, AlertTriangle, AlertCircle, Volume2, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { WYSIWYGTextArea, WYSIWYGInput } from "@/components/ui/wysiwyg-editor"

export type CalloutVariant = "note" | "tip" | "warning" | "important"

export interface CalloutEditorProps {
    variant?: CalloutVariant
    onVariantChange?: (val: CalloutVariant) => void
    title?: string
    onTitleChange?: (val: string) => void
    content?: string
    onContentChange?: (val: string) => void
    audioUrl?: string
    onAudioUrlChange?: (val: string) => void
}

const VARIANTS: { id: CalloutVariant; label: string; icon: React.ReactNode; colorClass: string }[] = [
    {
        id: "note",
        label: "Note",
        icon: <Info className="w-4 h-4 text-[#1CB0F6]" />,
        colorClass: "hover:border-sky-500 hover:bg-sky-500/10 data-[state=selected]:border-[#1CB0F6] data-[state=selected]:bg-sky-500/20",
    },
    {
        id: "tip",
        label: "Pro Tip",
        icon: <Lightbulb className="w-4 h-4 text-[#58CC02]" />,
        colorClass: "hover:border-emerald-500 hover:bg-emerald-500/10 data-[state=selected]:border-[#58CC02] data-[state=selected]:bg-emerald-500/20",
    },
    {
        id: "warning",
        label: "Warning",
        icon: <AlertTriangle className="w-4 h-4 text-[#FFC800]" />,
        colorClass: "hover:border-amber-500 hover:bg-amber-500/10 data-[state=selected]:border-[#FFC800] data-[state=selected]:bg-amber-500/20",
    },
    {
        id: "important",
        label: "Important",
        icon: <AlertCircle className="w-4 h-4 text-[#FF4B4B]" />,
        colorClass: "hover:border-rose-500 hover:bg-rose-500/10 data-[state=selected]:border-[#FF4B4B] data-[state=selected]:bg-rose-500/20",
    },
]

export function CalloutEditor({
    variant = "note",
    onVariantChange,
    title = "",
    onTitleChange,
    content = "",
    onContentChange,
    audioUrl = "",
    onAudioUrlChange,
}: CalloutEditorProps) {
    return (
        <div className="space-y-6">
            {/* Variant Selector */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-sky-400" />
                    Callout Style Variant
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {VARIANTS.map((v) => {
                        const isSelected = variant === v.id
                        return (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() => onVariantChange && onVariantChange(v.id)}
                                className={cn(
                                    "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left select-none",
                                    isSelected
                                        ? "bg-slate-900 border-sky-400 shadow-md shadow-sky-500/10"
                                        : "bg-slate-950/40 border-slate-800 hover:bg-slate-900/60"
                                )}
                            >
                                {v.icon}
                                <span
                                    className={cn(
                                        "text-xs font-black uppercase tracking-wider",
                                        isSelected ? "text-white" : "text-slate-400"
                                    )}
                                >
                                    {v.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Callout Header Title */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Callout Header Title
                </Label>
                <WYSIWYGInput
                    value={title}
                    onChange={(val: string) => onTitleChange && onTitleChange(val)}
                    placeholder="e.g. Pro Tip, Key Takeaway, Warning"
                />
            </div>

            {/* Callout Content Textarea */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Callout Message Content
                </Label>
                <WYSIWYGTextArea
                    value={content}
                    onChange={(val: string) => onContentChange && onContentChange(val)}
                    placeholder="Enter the callout explanation message..."
                    rows={4}
                />
            </div>

            {/* Audio Track Field */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-sky-400" />
                        Audio Track URL
                    </Label>
                    {audioUrl && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Audio Attached ✓
                        </span>
                    )}
                </div>
                <Input
                    value={audioUrl}
                    onChange={(e) => onAudioUrlChange && onAudioUrlChange(e.target.value)}
                    placeholder="Auto-generated on publish or enter custom audio URL..."
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-10 text-xs font-mono placeholder:text-slate-700 rounded-xl text-slate-400"
                />
                <p className="text-[10px] text-slate-500 font-medium">
                    Plays automatically when the callout appears in the lesson. Students can replay via the listen button.
                </p>
            </div>
        </div>
    )
}
