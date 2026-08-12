"use client"

import React from "react"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuoteRendererProps {
    text?: string
    author?: string
    source?: string
    isEditing?: boolean
    [key: string]: any
}

export function QuoteRenderer({
    text = "Quote text goes here...",
    author = "Author Name",
    source = "",
    isEditing
}: QuoteRendererProps) {
    return (
        <div className="w-full my-4 relative p-6 md:p-8 rounded-2xl border-2 border-slate-200 border-b-4 bg-white shadow-sm overflow-hidden group transition-all">
            {/* Visual Emerald Accent Strip */}
            <div className="absolute top-0 left-0 w-2 h-full bg-[#58CC02]" />

            {/* Decorative Quote Icon Background */}
            <div className="absolute -right-4 -bottom-4 text-emerald-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Quote className="w-36 h-36" />
            </div>

            <div className="relative space-y-4 pl-2">
                <div className="flex items-center gap-2">
                    <Quote className="w-6 h-6 text-[#58CC02]" />
                    <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Inspirational Quote</span>
                </div>

                <blockquote className="text-base md:text-xl font-black text-slate-900 italic leading-relaxed tracking-tight">
                    "{text}"
                </blockquote>

                {(author || source) && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[#58CC02] text-xs font-black uppercase tracking-wider">
                            — {author}
                        </span>
                        {source && (
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                ({source})
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
