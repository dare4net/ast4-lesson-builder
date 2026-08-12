"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Volume2, BookOpen } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useAudioPlayer } from "@/hooks/use-audio-player"

interface AccordionItem {
    id?: string
    title: string
    content: string
    audioUrl?: string
}

interface AccordionRendererProps {
    title?: string
    items?: AccordionItem[]
    allowMultiple?: boolean
    isEditing?: boolean
}

const PASTEL_THEMES = [
    {
        bg: "bg-sky-50/90 hover:bg-sky-100/90",
        openBg: "bg-sky-100",
        border: "border-sky-300 border-b-sky-400",
        openBorder: "border-sky-400 border-b-sky-500",
        text: "text-sky-950",
        badgeOpen: "bg-[#1CB0F6] text-white border-[#0090CC]",
        badgeClosed: "bg-sky-200 text-sky-800 border-sky-300",
        divider: "border-sky-200/80",
        activeAudio: "text-[#1CB0F6]",
    },
    {
        bg: "bg-emerald-50/90 hover:bg-emerald-100/90",
        openBg: "bg-emerald-100",
        border: "border-emerald-300 border-b-emerald-400",
        openBorder: "border-emerald-400 border-b-emerald-500",
        text: "text-emerald-950",
        badgeOpen: "bg-[#58CC02] text-white border-[#46A302]",
        badgeClosed: "bg-emerald-200 text-emerald-800 border-emerald-300",
        divider: "border-emerald-200/80",
        activeAudio: "text-[#58CC02]",
    },
    {
        bg: "bg-amber-50/90 hover:bg-amber-100/90",
        openBg: "bg-amber-100",
        border: "border-amber-300 border-b-amber-400",
        openBorder: "border-amber-400 border-b-amber-500",
        text: "text-amber-950",
        badgeOpen: "bg-[#FFC800] text-slate-900 border-[#E5B200]",
        badgeClosed: "bg-amber-200 text-amber-800 border-amber-300",
        divider: "border-amber-200/80",
        activeAudio: "text-[#FFC800]",
    },
    {
        bg: "bg-purple-50/90 hover:bg-purple-100/90",
        openBg: "bg-purple-100",
        border: "border-purple-300 border-b-purple-400",
        openBorder: "border-purple-400 border-b-purple-500",
        text: "text-purple-950",
        badgeOpen: "bg-purple-500 text-white border-purple-600",
        badgeClosed: "bg-purple-200 text-purple-800 border-purple-300",
        divider: "border-purple-200/80",
        activeAudio: "text-purple-500",
    },
    {
        bg: "bg-rose-50/90 hover:bg-rose-100/90",
        openBg: "bg-rose-100",
        border: "border-rose-300 border-b-rose-400",
        openBorder: "border-rose-400 border-b-rose-500",
        text: "text-rose-950",
        badgeOpen: "bg-[#FF4B4B] text-white border-[#EA2B2B]",
        badgeClosed: "bg-rose-200 text-rose-800 border-rose-300",
        divider: "border-rose-200/80",
        activeAudio: "text-[#FF4B4B]",
    },
    {
        bg: "bg-teal-50/90 hover:bg-teal-100/90",
        openBg: "bg-teal-100",
        border: "border-teal-300 border-b-teal-400",
        openBorder: "border-teal-400 border-b-teal-500",
        text: "text-teal-950",
        badgeOpen: "bg-teal-500 text-white border-teal-600",
        badgeClosed: "bg-teal-200 text-teal-800 border-teal-300",
        divider: "border-teal-200/80",
        activeAudio: "text-teal-500",
    },
]

const AccordionItemCard = ({
    item,
    idx,
    isOpen,
    toggleItem,
}: {
    item: AccordionItem
    idx: number
    isOpen: boolean
    toggleItem: (id: string) => void
}) => {
    const itemId = item.id || `acc-${idx}`
    const theme = PASTEL_THEMES[idx % PASTEL_THEMES.length]
    const { speak, isSpeaking: isTtsSpeaking } = useReadAloud()
    const { isPlaying: isAudioPlaying, hasAudio, play: playAudio } = useAudioPlayer({
        audioUrl: item.audioUrl,
    })

    const isSpeaking = isAudioPlaying || isTtsSpeaking

    const handleSpeakItem = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (hasAudio) {
            playAudio()
        } else {
            speak(`${item.title}. ${item.content}`)
        }
    }

    return (
        <div
            className={cn(
                "rounded-2xl border-2 border-b-4 transition-all duration-200 overflow-hidden shadow-xs",
                isOpen ? cn(theme.openBg, theme.openBorder) : cn(theme.bg, theme.border)
            )}
        >
            {/* Header Trigger */}
            <div
                className={cn(
                    "w-full flex items-center justify-between p-4 text-left font-black text-base transition-colors select-none",
                    theme.text
                )}
            >
                {/* Clickable toggle area */}
                <button
                    type="button"
                    onClick={() => toggleItem(itemId)}
                    className="flex-1 flex items-center gap-3 pr-4 cursor-pointer text-left"
                >
                    <div
                        className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all shrink-0 border-2 shadow-2xs",
                            isOpen ? theme.badgeOpen : theme.badgeClosed
                        )}
                    >
                        {idx + 1}
                    </div>
                    <span className="tracking-tight text-slate-900 font-extrabold">{item.title}</span>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleSpeakItem}
                        className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-950 transition-all cursor-pointer border-2 border-slate-200 border-b-3 active:border-b-2 active:translate-y-[1px]"
                        title={hasAudio ? "Play Audio Track" : "Read Aloud"}
                    >
                        <Volume2 className={cn("w-4 h-4", isSpeaking && cn("animate-pulse", theme.activeAudio))} />
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleItem(itemId)}
                        className="p-1 cursor-pointer"
                        aria-label="Toggle section"
                    >
                        <ChevronDown
                            className={cn(
                                "w-5 h-5 text-slate-500 transition-transform duration-300",
                                isOpen && "transform rotate-180 text-slate-900"
                            )}
                        />
                    </button>
                </div>
            </div>

            {/* Content Drawer */}
            {isOpen && (
                <div
                    className={cn(
                        "px-5 pb-5 pt-3 text-sm font-bold leading-relaxed text-slate-800 border-t-2 border-dashed animate-in slide-in-from-top-1 duration-200",
                        theme.divider
                    )}
                >
                    <p>{item.content}</p>
                </div>
            )}
        </div>
    )
}

export function AccordionRenderer({
    title = "Key Definitions",
    items = [
        { id: "1", title: "What is this concept?", content: "Detailed explanation goes here." },
        { id: "2", title: "Why is it important?", content: "Key significance and context." },
    ],
    allowMultiple = false,
}: AccordionRendererProps) {
    const [openIds, setOpenIds] = useState<string[]>(["1"])

    const toggleItem = (id: string) => {
        if (allowMultiple) {
            setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
        } else {
            setOpenIds((prev) => (prev.includes(id) ? [] : [id]))
        }
    }

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl space-y-3">
                {/* Top Section Header Banner (Flat title without icon) */}
                {title && (
                    <div className="px-1 py-1 mb-2 text-slate-900">
                        <h3 className="font-black text-lg tracking-tight">{title}</h3>
                    </div>
                )}

                {items.map((item, idx) => {
                    const itemId = item.id || `acc-${idx}`
                    const isOpen = openIds.includes(itemId)

                    return (
                        <AccordionItemCard
                            key={itemId}
                            item={item}
                            idx={idx}
                            isOpen={isOpen}
                            toggleItem={toggleItem}
                        />
                    )
                })}
            </div>
        </div>
    )
}
