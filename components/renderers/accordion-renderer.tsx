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
                                "rounded-2xl border-2 border-b-4 transition-all duration-200 overflow-hidden shadow-sm bg-white",
                                isOpen
                                    ? "border-[#1CB0F6] border-b-[#0090CC] bg-sky-50/20"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                            )}
                        >
                            {/* Header Trigger */}
                            <button
                                type="button"
                                onClick={() => toggleItem(itemId)}
                                className="w-full flex items-center justify-between p-4 text-left font-black text-slate-900 text-base transition-colors cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-3 pr-4">
                                    <div className={cn(
                                        "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors shrink-0 border-2",
                                        isOpen
                                            ? "bg-[#1CB0F6] text-white border-[#0090CC]"
                                            : "bg-slate-100 text-slate-500 border-slate-200"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <span className="tracking-tight">{item.title}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => handleSpeakItem(e, item)}
                                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer border border-slate-200 active:scale-95"
                                        title="Read Aloud"
                                    >
                                        <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse text-[#1CB0F6]")} />
                                    </button>

                                    <ChevronDown
                                        className={cn(
                                            "w-5 h-5 text-slate-400 transition-transform duration-300",
                                            isOpen && "transform rotate-180 text-[#1CB0F6]"
                                        )}
                                    />
                                </div>
                            </button>

                            {/* Content Drawer */}
                            {isOpen && (
                                <div className="px-5 pb-5 pt-2 text-sm font-bold leading-relaxed text-slate-800 border-t-2 border-dashed border-slate-200/60 animate-in slide-in-from-top-1 duration-200">
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
