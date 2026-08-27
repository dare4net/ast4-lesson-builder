"use client"

import React, { useState, useRef, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FormattedText } from "@/components/ui/formatted-text"
import { Bold, Italic, Strikethrough, Highlighter, Tag, Code, Eraser, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RichTextProps {
    value?: string
    onChange?: (val: string) => void
    placeholder?: string
    rows?: number
    className?: string
    showPreviewToggle?: boolean
}

/**
 * RichTextArea
 * 
 * Modular textarea wrapper that displays a floating dark-glass formatting bubble
 * whenever text is selected inside the input field.
 */
export function RichTextArea({
    value = "",
    onChange,
    placeholder,
    rows = 3,
    className,
    showPreviewToggle = true
}: RichTextProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    // Track selection changes
    const handleSelectionCheck = useCallback(() => {
        if (!textareaRef.current) return
        const { selectionStart, selectionEnd } = textareaRef.current
        if (selectionStart !== null && selectionEnd !== null && selectionEnd > selectionStart) {
            setSelectedRange({ start: selectionStart, end: selectionEnd })
        } else {
            setSelectedRange(null)
        }
    }, [])

    // Apply formatting token wrapper around selection
    const applyFormat = (formatType: "bold" | "italic" | "strikethrough" | "highlight" | "badge" | "code" | "clear") => {
        if (!textareaRef.current || !selectedRange || !onChange) return
        const { start, end } = selectedRange
        const rawText = value
        const selectedText = rawText.substring(start, end)
        if (!selectedText) return

        let formattedReplacement = ""

        switch (formatType) {
            case "bold":
                formattedReplacement = `**${selectedText.replace(/\*\*/g, "")}**`
                break
            case "italic":
                formattedReplacement = `*${selectedText.replace(/\*/g, "")}*`
                break
            case "strikethrough":
                formattedReplacement = `~${selectedText.replace(/~/g, "")}~`
                break
            case "highlight":
                formattedReplacement = `[highlight:${selectedText.replace(/\[highlight:[^\]]*\]/g, "")}]`
                break
            case "badge":
                formattedReplacement = `[badge:${selectedText.replace(/\[badge:[^\]]*\]/g, "")}]`
                break
            case "code":
                formattedReplacement = `\`${selectedText.replace(/`/g, "")}\``
                break
            case "clear":
                formattedReplacement = selectedText
                    .replace(/\*\*/g, "")
                    .replace(/\*/g, "")
                    .replace(/~/g, "")
                    .replace(/\[highlight:(?:[a-zA-Z]+:)?([^\]]+)\]/g, "$1")
                    .replace(/\[badge:(?:[a-zA-Z]+:)?([^\]]+)\]/g, "$1")
                    .replace(/`/g, "")
                break
        }

        const newText = rawText.substring(0, start) + formattedReplacement + rawText.substring(end)
        onChange(newText)

        // Re-focus and set selection position
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(start, start + formattedReplacement.length)
                setSelectedRange(null)
            }
        }, 0)
    }

    return (
        <div className="relative w-full space-y-2 group">
            {/* Floating Selection Formatting Bubble */}
            {selectedRange && (
                <div className="absolute -top-11 left-2 z-30 flex items-center gap-1 p-1 bg-slate-900/95 border border-sky-500/40 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-[9px] font-black text-sky-400 px-2 border-r border-slate-800 uppercase tracking-widest">
                        Format
                    </span>

                    <button
                        type="button"
                        onClick={() => applyFormat("bold")}
                        title="Bold (**text**)"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => applyFormat("italic")}
                        title="Italic (*text*)"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => applyFormat("strikethrough")}
                        title="Strikethrough (~text~)"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                        <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-3 bg-slate-800 mx-0.5" />

                    <button
                        type="button"
                        onClick={() => applyFormat("highlight")}
                        title="Glowing Highlight ([highlight:text])"
                        className="p-1.5 rounded-lg hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors"
                    >
                        <Highlighter className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => applyFormat("badge")}
                        title="Inline Badge ([badge:text])"
                        className="p-1.5 rounded-lg hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <Tag className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => applyFormat("code")}
                        title="Code Block (`code`)"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <Code className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-3 bg-slate-800 mx-0.5" />

                    <button
                        type="button"
                        onClick={() => applyFormat("clear")}
                        title="Clear Formatting"
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                        <Eraser className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Main Textarea */}
            <div className="relative">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onSelect={handleSelectionCheck}
                    onKeyUp={handleSelectionCheck}
                    onMouseUp={handleSelectionCheck}
                    placeholder={placeholder}
                    rows={rows}
                    className={cn(
                        "bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 text-sm font-medium placeholder:text-slate-700 rounded-2xl resize-none p-4",
                        className
                    )}
                />

                {showPreviewToggle && value && (
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                        <Eye className="w-3 h-3" />
                        {showPreview ? "Hide Preview" : "Preview"}
                    </button>
                )}
            </div>

            {/* Live Formatted Preview Card */}
            {showPreviewToggle && showPreview && value && (
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1 animate-in fade-in duration-200">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                        Student View Preview:
                    </span>
                    <div className="text-xs text-slate-200 leading-relaxed font-medium">
                        <FormattedText content={value} />
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * RichInput
 * 
 * Single-line Input wrapper with floating format bubble for headings, titles & options.
 */
export function RichInput({
    value = "",
    onChange,
    placeholder,
    className
}: Omit<RichTextProps, "rows">) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null)

    const handleSelectionCheck = useCallback(() => {
        if (!inputRef.current) return
        const { selectionStart, selectionEnd } = inputRef.current
        if (selectionStart !== null && selectionEnd !== null && selectionEnd > selectionStart) {
            setSelectedRange({ start: selectionStart, end: selectionEnd })
        } else {
            setSelectedRange(null)
        }
    }, [])

    const applyFormat = (formatType: "bold" | "italic" | "highlight" | "badge" | "clear") => {
        if (!inputRef.current || !selectedRange || !onChange) return
        const { start, end } = selectedRange
        const rawText = value
        const selectedText = rawText.substring(start, end)
        if (!selectedText) return

        let replacement = ""
        switch (formatType) {
            case "bold":
                replacement = `**${selectedText.replace(/\*\*/g, "")}**`
                break
            case "italic":
                replacement = `*${selectedText.replace(/\*/g, "")}*`
                break
            case "highlight":
                replacement = `[highlight:${selectedText.replace(/\[highlight:[^\]]*\]/g, "")}]`
                break
            case "badge":
                replacement = `[badge:${selectedText.replace(/\[badge:[^\]]*\]/g, "")}]`
                break
            case "clear":
                replacement = selectedText
                    .replace(/\*\*/g, "")
                    .replace(/\*/g, "")
                    .replace(/\[highlight:(?:[a-zA-Z]+:)?([^\]]+)\]/g, "$1")
                    .replace(/\[badge:(?:[a-zA-Z]+:)?([^\]]+)\]/g, "$1")
                break
        }

        const newText = rawText.substring(0, start) + replacement + rawText.substring(end)
        onChange(newText)

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
                inputRef.current.setSelectionRange(start, start + replacement.length)
                setSelectedRange(null)
            }
        }, 0)
    }

    return (
        <div className="relative w-full">
            {selectedRange && (
                <div className="absolute -top-11 left-0 z-30 flex items-center gap-1 p-1 bg-slate-900/95 border border-sky-500/40 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
                    <span className="text-[9px] font-black text-sky-400 px-2 border-r border-slate-800 uppercase tracking-widest">
                        Format
                    </span>
                    <button
                        type="button"
                        onClick={() => applyFormat("bold")}
                        className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                        title="Bold"
                    >
                        <Bold className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("italic")}
                        className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                        title="Italic"
                    >
                        <Italic className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("highlight")}
                        className="p-1 rounded hover:bg-amber-500/20 text-amber-400"
                        title="Highlight"
                    >
                        <Highlighter className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("badge")}
                        className="p-1 rounded hover:bg-sky-500/20 text-sky-400"
                        title="Badge"
                    >
                        <Tag className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFormat("clear")}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-400"
                        title="Clear"
                    >
                        <Eraser className="w-3 h-3" />
                    </button>
                </div>
            )}

            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                onSelect={handleSelectionCheck}
                onKeyUp={handleSelectionCheck}
                onMouseUp={handleSelectionCheck}
                placeholder={placeholder}
                className={cn(
                    "bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl",
                    className
                )}
            />
        </div>
    )
}
