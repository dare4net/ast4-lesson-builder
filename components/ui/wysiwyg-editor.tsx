"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Bold, Italic, Strikethrough, Highlighter, Palette, Tag, Eraser, Eye, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WYSIWYGEditorProps {
    value?: string
    onChange?: (val: string) => void
    placeholder?: string
    rows?: number
    className?: string
    showPreviewToggle?: boolean
}

/**
 * WYSIWYGTextArea & WYSIWYGInput
 * 
 * True contentEditable Inline Rich Text Editor.
 * Formatting (bold, italics, custom text color, background highlights, badges) renders
 * VISUALLY directly inside the editing box while typing—no raw code syntax visible!
 */
export function WYSIWYGTextArea({
    value = "",
    onChange,
    placeholder = "Type your content here...",
    rows = 4,
    className,
    showPreviewToggle = true
}: WYSIWYGEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)
    const [selectedRange, setSelectedRange] = useState<Range | null>(null)
    const [showTextColorWheel, setShowTextColorWheel] = useState(false)
    const [showHighlightColorWheel, setShowHighlightColorWheel] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [textColor, setTextColor] = useState("#38bdf8") // Sky blue default
    const [highlightColor, setHighlightColor] = useState("#f59e0b") // Amber default

    // Synchronize external value with innerHTML without resetting cursor on typing
    useEffect(() => {
        if (editorRef.current) {
            const isFocused = document.activeElement === editorRef.current
            if (!isFocused && editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || ""
            }
        }
    }, [value])

    // Save active DOM selection range
    const saveSelection = useCallback(() => {
        // If color wheel popover is open, don't destroy active selection range
        if (showTextColorWheel || showHighlightColorWheel) return

        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0)
            if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                setSelectedRange(range.cloneRange())
                return
            }
        }
    }, [showTextColorWheel, showHighlightColorWheel])

    // Restore DOM selection range
    const restoreSelection = useCallback(() => {
        if (selectedRange) {
            const sel = window.getSelection()
            if (sel) {
                sel.removeAllRanges()
                sel.addRange(selectedRange)
            }
        }
    }, [selectedRange])

    // Handle inner content change
    const handleInput = () => {
        if (editorRef.current && onChange) {
            const html = editorRef.current.innerHTML
            onChange(html)
        }
    }

    // Execute standard formatting command
    const execCmd = (command: string, value: string | undefined = undefined) => {
        restoreSelection()
        document.execCommand(command, false, value)
        handleInput()
        saveSelection()
    }

    // Apply custom inline text color from color wheel (stays open while sliding!)
    const applyTextColor = (colorHex: string, closePopover = false) => {
        setTextColor(colorHex)
        restoreSelection()
        document.execCommand("foreColor", false, colorHex)
        handleInput()
        if (closePopover) {
            setShowTextColorWheel(false)
            setSelectedRange(null)
        }
    }

    // Apply custom inline highlight color from color wheel (stays open while sliding!)
    const applyHighlightColor = (colorHex: string, closePopover = false) => {
        setHighlightColor(colorHex)
        restoreSelection()
        const success = document.execCommand("hiliteColor", false, colorHex)
        if (!success) {
            document.execCommand("backColor", false, colorHex)
        }
        handleInput()
        if (closePopover) {
            setShowHighlightColorWheel(false)
            setSelectedRange(null)
        }
    }

    // Apply Cyber Pill Badge wrapper
    const applyBadge = () => {
        restoreSelection()
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed) return

        const selectedText = sel.toString()
        if (!selectedText) return

        const badgeSpan = document.createElement("span")
        badgeSpan.className =
            "inline-flex items-center px-2.5 py-0.5 mx-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm align-middle select-none"
        badgeSpan.textContent = selectedText

        const range = sel.getRangeAt(0)
        range.deleteContents()
        range.insertNode(badgeSpan)

        handleInput()
        setSelectedRange(null)
    }

    // Clear formatting from selection (removes bold, italic, text colors, background highlights, and cyber badges)
    const clearFormatting = () => {
        restoreSelection()
        document.execCommand("removeFormat", false)
        document.execCommand("foreColor", false, "inherit")
        document.execCommand("backColor", false, "transparent")
        document.execCommand("hiliteColor", false, "transparent")

        const sel = window.getSelection()
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0)
            const container = range.commonAncestorContainer
            const parent = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement
            if (parent && editorRef.current?.contains(parent) && parent !== editorRef.current) {
                parent.removeAttribute("style")
                parent.removeAttribute("color")
                if (parent.tagName === "FONT" || parent.className.includes("rounded-full")) {
                    const textNode = document.createTextNode(parent.textContent || "")
                    parent.parentNode?.replaceChild(textNode, parent)
                }
            }
        }

        handleInput()
        setSelectedRange(null)
    }

    return (
        <div className="relative w-full space-y-2 group">
            {/* Floating Selection Formatting Bubble */}
            {selectedRange && (
                <div className="absolute -top-12 left-2 z-30 flex items-center gap-1 p-1.5 bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 select-none">
                    <span className="text-[9px] font-black text-sky-400 px-2 border-r border-slate-800 uppercase tracking-widest">
                        Format
                    </span>

                    {/* Bold */}
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd("bold")
                        }}
                        title="Bold"
                        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </button>

                    {/* Italic */}
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd("italic")
                        }}
                        title="Italic"
                        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </button>

                    {/* Strikethrough */}
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            execCmd("strikeThrough")
                        }}
                        title="Strikethrough"
                        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                        <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-3 bg-slate-800 mx-0.5" />

                    {/* Text Color Wheel Popover Trigger */}
                    <div className="relative">
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault()
                                setShowTextColorWheel(!showTextColorWheel)
                                setShowHighlightColorWheel(false)
                            }}
                            title="Text Color Wheel"
                            className="p-1.5 rounded-xl hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                        >
                            <Palette className="w-3.5 h-3.5" />
                            <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: textColor }} />
                        </button>

                        {/* Text Color Wheel Popover (Stays Open While Sliding!) */}
                        {showTextColorWheel && (
                            <div
                                onMouseDown={(e) => e.stopPropagation()}
                                className="absolute top-9 left-0 z-40 p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-2.5 w-52 animate-in fade-in zoom-in-95 duration-150"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Text Color Wheel</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowTextColorWheel(false)}
                                        className="text-slate-500 hover:text-white p-1"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => applyTextColor(e.target.value, false)}
                                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <div className="flex-1 text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800">
                                        {textColor.toUpperCase()}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            applyTextColor(textColor, true)
                                        }}
                                        title="Apply & Done"
                                        className="p-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Preset Quick Swatches */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                                    {["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#c084fc", "#ffffff"].map((hex) => (
                                        <button
                                            key={hex}
                                            type="button"
                                            onClick={() => applyTextColor(hex, true)}
                                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-125 transition-transform"
                                            style={{ backgroundColor: hex }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Highlight Color Wheel Popover Trigger */}
                    <div className="relative">
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault()
                                setShowHighlightColorWheel(!showHighlightColorWheel)
                                setShowTextColorWheel(false)
                            }}
                            title="Highlight Background Color Wheel"
                            className="p-1.5 rounded-xl hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                        >
                            <Highlighter className="w-3.5 h-3.5" />
                            <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: highlightColor }} />
                        </button>

                        {/* Highlight Color Wheel Popover (Stays Open While Sliding!) */}
                        {showHighlightColorWheel && (
                            <div
                                onMouseDown={(e) => e.stopPropagation()}
                                className="absolute top-9 left-0 z-40 p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-2.5 w-52 animate-in fade-in zoom-in-95 duration-150"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Highlight Color Wheel</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowHighlightColorWheel(false)}
                                        className="text-slate-500 hover:text-white p-1"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={highlightColor}
                                        onChange={(e) => applyHighlightColor(e.target.value, false)}
                                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <div className="flex-1 text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800">
                                        {highlightColor.toUpperCase()}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            applyHighlightColor(highlightColor, true)
                                        }}
                                        title="Apply & Done"
                                        className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Preset Quick Highlight Swatches */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                                    {["#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#8b5cf6"].map((hex) => (
                                        <button
                                            key={hex}
                                            type="button"
                                            onClick={() => applyHighlightColor(hex, true)}
                                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-125 transition-transform"
                                            style={{ backgroundColor: hex }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Badge */}
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            applyBadge()
                        }}
                        title="Inline Cyber Badge"
                        className="p-1.5 rounded-xl hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <Tag className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-3 bg-slate-800 mx-0.5" />

                    {/* Clear Formatting */}
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault()
                            clearFormatting()
                        }}
                        title="Clear Formatting"
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                        <Eraser className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Main ContentEditable Box */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onSelect={saveSelection}
                    onKeyUp={saveSelection}
                    onMouseUp={saveSelection}
                    data-placeholder={placeholder}
                    style={{ minHeight: `${rows * 1.6}rem` }}
                    className={cn(
                        "w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 text-sm font-medium text-slate-100 rounded-2xl p-4 outline-none transition-all leading-relaxed overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600 empty:before:pointer-events-none",
                        className
                    )}
                />

                {showPreviewToggle && value && (
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all select-none"
                    >
                        <Eye className="w-3 h-3" />
                        {showPreview ? "Hide HTML" : "HTML Source"}
                    </button>
                )}
            </div>

            {/* Raw HTML Source Code Card */}
            {showPreviewToggle && showPreview && value && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 animate-in fade-in duration-200">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                        Sanitized HTML Source Output:
                    </span>
                    <pre className="text-[11px] font-mono text-amber-300/90 whitespace-pre-wrap break-all bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        {value}
                    </pre>
                </div>
            )}
        </div>
    )
}

/**
 * WYSIWYGInput
 * 
 * Single-line contentEditable input box for titles, prompts & short text.
 */
export function WYSIWYGInput({
    value = "",
    onChange,
    placeholder = "Enter text...",
    className
}: Omit<WYSIWYGEditorProps, "rows">) {
    return (
        <WYSIWYGTextArea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={1.5}
            className={cn("h-11 min-h-0 py-2.5 flex items-center", className)}
            showPreviewToggle={false}
        />
    )
}
