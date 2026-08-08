"use client"

import React, { useState } from "react"
import { Check, Copy, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockRendererProps {
    code?: string
    language?: string
    title?: string
    caption?: string
    isEditing?: boolean
    [key: string]: any
}

export function CodeBlockRenderer({
    code = "// Write your code here",
    language = "javascript",
    title,
    caption,
    isEditing
}: CodeBlockRendererProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!code) return
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy code:", err)
        }
    }

    return (
        <div className="w-full my-4 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl text-slate-100 transition-all">
            {/* Top Header Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900/80 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-slate-300 tracking-wide font-mono">
                            {title || `${language.toUpperCase()} Code`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                        {language}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy Code"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Code Area */}
            <div className="p-5 overflow-x-auto bg-[#0d1117] font-mono text-sm leading-relaxed text-emerald-300/90">
                <pre className="whitespace-pre">
                    <code>{code}</code>
                </pre>
            </div>

            {/* Optional Caption */}
            {caption && (
                <div className="px-5 py-2.5 bg-slate-900/50 border-t border-slate-800 text-xs text-slate-400 font-sans italic">
                    {caption}
                </div>
            )}
        </div>
    )
}
