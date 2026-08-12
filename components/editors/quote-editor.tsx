"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Quote, User, BookOpen, Volume2 } from "lucide-react"

export interface QuoteEditorProps {
    text?: string
    onTextChange?: (val: string) => void
    author?: string
    onAuthorChange?: (val: string) => void
    source?: string
    onSourceChange?: (val: string) => void
    audioUrl?: string
    onAudioUrlChange?: (val: string) => void
}

export function QuoteEditor({
    text = "",
    onTextChange,
    author = "",
    onAuthorChange,
    source = "",
    onSourceChange,
    audioUrl = "",
    onAudioUrlChange,
}: QuoteEditorProps) {
    return (
        <div className="space-y-6">
            {/* Quote Body Text */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Quote className="w-4 h-4 text-emerald-400" />
                    Quote Text Content
                </Label>
                <Textarea
                    value={text}
                    onChange={(e) => onTextChange && onTextChange(e.target.value)}
                    placeholder="Enter the featured quote text..."
                    rows={4}
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500/50 text-sm font-medium placeholder:text-slate-700 rounded-2xl resize-none p-4"
                />
            </div>

            {/* Author & Source Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-400" />
                        Author / Attribution
                    </Label>
                    <Input
                        value={author}
                        onChange={(e) => onAuthorChange && onAuthorChange(e.target.value)}
                        placeholder="e.g. Albert Einstein"
                        className="bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Source Citation (Optional)
                    </Label>
                    <Input
                        value={source}
                        onChange={(e) => onSourceChange && onSourceChange(e.target.value)}
                        placeholder="e.g. Relativity (1916)"
                        className="bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl"
                    />
                </div>
            </div>

            {/* Audio Track Field */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
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
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500/50 h-10 text-xs font-mono placeholder:text-slate-700 rounded-xl text-slate-400"
                />
                <p className="text-[10px] text-slate-500 font-medium">
                    Plays audio narration when student taps the speaker icon on the quote card.
                </p>
            </div>
        </div>
    )
}
