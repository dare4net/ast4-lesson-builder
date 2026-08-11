"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Volume2, HelpCircle } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"

interface AccordionItem {
    id?: string
    title: string
    content: string
}

interface AccordionRendererProps {
    items?: AccordionItem[]
    allowMultiple?: boolean
    isEditing?: boolean
}

export function AccordionRenderer({
    items = [
        { id: "1", title: "What is this concept?", content: "Detailed explanation goes here." },
        { id: "2", title: "Why is it important?", content: "Key significance and context." },
    ],
    allowMultiple = false,
}: AccordionRendererProps) {
    const [openIds, setOpenIds] = useState<string[]>(["1"])
    const { speak, isSpeaking } = useReadAloud()

    const toggleItem = (id: string) => {
        if (allowMultiple) {
            setOpenIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))
        } else {
            setOpenIds(prev => (prev.includes(id) ? [] : [id]))
        }
    }

    const handleSpeakItem = (e: React.MouseEvent, item: AccordionItem) => {
        e.stopPropagation()
        speak(`${item.title}. ${item.content}`)
    }

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl space-y-3">
                {items.map((item, idx) => {
                    const itemId = item.id || `acc-${idx}`
                    const isOpen = openIds.includes(itemId)

                    return (
                        <div
                            key={itemId}
                            className={cn(
                                "rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm backdrop-blur-sm",
                                isOpen
                                    ? "bg-slate-900 border-indigo-500/50 text-white ring-2 ring-indigo-500/20"
                                    : "bg-slate-900/60 hover:bg-slate-900/80 border-slate-800 text-slate-300"
                            )}
                        >
                            {/* Header Trigger */}
                            <button
                                type="button"
                                onClick={() => toggleItem(itemId)}
                                className="w-full flex items-center justify-between p-5 text-left font-bold text-base transition-colors cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3 pr-4">
                                    <div className={cn(
                                        "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors",
                                        isOpen ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                                    )}>
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span>{item.title}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => handleSpeakItem(e, item)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                                        title="Read Aloud"
                                    >
                                        <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse text-indigo-400")} />
                                    </button>

                                    <ChevronDown
                                        className={cn(
                                            "w-5 h-5 text-slate-400 transition-transform duration-300",
                                            isOpen && "transform rotate-180 text-indigo-400"
                                        )}
                                    />
                                </div>
                            </button>

                            {/* Content Drawer */}
                            {isOpen && (
                                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-slate-300 border-t border-slate-800/80 animate-in slide-in-from-top-1 duration-200">
                                    <p>{item.content}</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
