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
        <div className="w-full my-4 relative p-8 md:p-10 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl overflow-hidden group transition-all">
            {/* Visual Emerald Accent Strip */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl" />

            {/* Decorative Quote Icon Background */}
            <div className="absolute -right-4 -bottom-4 text-emerald-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Quote className="w-36 h-36" />
            </div>

            <div className="relative space-y-4">
                <Quote className="w-8 h-8 text-emerald-400 opacity-80" />

                <blockquote className="text-lg md:text-xl font-medium text-slate-100 italic leading-relaxed tracking-wide">
                    "{text}"
                </blockquote>

                {(author || source) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-sm">
                        <div className="w-6 h-[2px] bg-emerald-500/80" />
                        <span className="font-bold text-emerald-400 tracking-wider">
                            {author}
                        </span>
                        {source && (
                            <span className="text-slate-400 text-xs font-normal">
                                — {source}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
