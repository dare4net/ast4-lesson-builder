"use client"

import React, { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, CheckCircle2 } from "lucide-react"
import { ListenButton } from "@/components/renderers/listen-button"
import { useFeedback } from "@/hooks/use-feedback"
import { canPlayLessonAudio, registerLessonAudio } from "@/lib/lesson-audio"
import { InteractiveRenderer, InteractiveRenderProps } from "./base/interactive-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

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
    savedState?: AccordionState
    setComponentState?: (state: AccordionState) => void
    id?: string
    status?: string
    disabled?: boolean
}

type AccordionState = {
    openIds: string[]
    openedIds: string[]
    status?: "active" | "completed"
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

function useAccordionAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const unregisterRef = useRef<(() => void) | null>(null)
    const [playingItemId, setPlayingItemId] = React.useState<string | null>(null)

    const stopAudio = useCallback(() => {
        unregisterRef.current?.()
        unregisterRef.current = null
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            audioRef.current.src = ""
            audioRef.current = null
        }
        setPlayingItemId(null)
    }, [])

    const playItemAudio = useCallback((itemId: string, audioUrl?: string) => {
        if (!audioUrl || !canPlayLessonAudio()) return

        stopAudio()

        const audio = new Audio(audioUrl)
        audioRef.current = audio
        unregisterRef.current = registerLessonAudio(audio)
        setPlayingItemId(itemId)

        audio.onended = () => {
            setPlayingItemId((current) => (current === itemId ? null : current))
        }
        audio.onerror = () => {
            setPlayingItemId((current) => (current === itemId ? null : current))
        }

        audio.play().catch((err) => {
            console.warn("[accordion] audio play blocked:", err)
            setPlayingItemId((current) => (current === itemId ? null : current))
        })
    }, [stopAudio])

    useEffect(() => () => stopAudio(), [stopAudio])

    return {
        playingItemId,
        playItemAudio,
        stopAudio,
        isPlayingItem: (itemId: string) => playingItemId === itemId,
    }
}

const AccordionItemCard = ({
    item,
    idx,
    isOpen,
    isOpened,
    isPlaying,
    hasAudio,
    onToggle,
    onVolumeClick,
}: {
    item: AccordionItem
    idx: number
    isOpen: boolean
    isOpened: boolean
    isPlaying: boolean
    hasAudio: boolean
    onToggle: () => void
    onVolumeClick: () => void
}) => {
    const theme = PASTEL_THEMES[idx % PASTEL_THEMES.length]

    return (
        <div
            className={cn(
                "rounded-2xl border-2 border-b-4 transition-all duration-200 overflow-hidden shadow-xs",
                isOpen ? cn(theme.openBg, theme.openBorder) : cn(theme.bg, theme.border),
                isOpened && !isOpen && "ring-1 ring-emerald-300/60",
            )}
        >
            <div
                className={cn(
                    "w-full flex items-center justify-between p-4 text-left font-black text-base transition-colors select-none",
                    theme.text,
                )}
            >
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex-1 flex items-center gap-3 pr-4 cursor-pointer text-left"
                >
                    <div
                        className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all shrink-0 border-2 shadow-2xs",
                            isOpen ? theme.badgeOpen : isOpened ? "bg-emerald-100 text-emerald-800 border-emerald-300" : theme.badgeClosed,
                        )}
                    >
                        {isOpened ? "✓" : idx + 1}
                    </div>
                    <FormattedText content={item.title} className="tracking-tight text-slate-900 font-extrabold" />
                </button>

                <div className="flex items-center gap-2 shrink-0">
                    {hasAudio && (
                        <ListenButton
                            hasAudio={hasAudio}
                            isPlaying={isPlaying && isOpen}
                            onClick={onVolumeClick}
                            showLabel={false}
                            className={cn(
                                "p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-950 border-2 border-slate-200 border-b-3 active:border-b-2 active:translate-y-[1px]",
                                !isOpen && "opacity-80",
                            )}
                            iconClassName={cn("w-4 h-4", isPlaying && isOpen && theme.activeAudio)}
                        />
                    )}

                    <button
                        type="button"
                        onClick={onToggle}
                        className="p-1 cursor-pointer"
                        aria-label="Toggle section"
                    >
                        <ChevronDown
                            className={cn(
                                "w-5 h-5 text-slate-500 transition-transform duration-300",
                                isOpen && "transform rotate-180 text-slate-900",
                            )}
                        />
                    </button>
                </div>
            </div>

            {isOpen && (
                <div
                    className={cn(
                        "px-5 pb-5 pt-3 text-sm font-bold leading-relaxed text-slate-800 border-t-2 border-dashed animate-in slide-in-from-top-1 duration-200",
                        theme.divider,
                    )}
                >
                    <FormattedText content={item.content} as="p" />
                </div>
            )}
        </div>
    )
}

function AccordionContent({
    title,
    items,
    allowMultiple,
    isEditing,
    state,
    setState,
    isComplete,
}: InteractiveRenderProps<AccordionState> & {
    title: string
    items: AccordionItem[]
    allowMultiple: boolean
    isEditing: boolean
}) {
    const { playFeedback } = useFeedback()
    const { playItemAudio, stopAudio, isPlayingItem } = useAccordionAudio()

    const itemIds = items.map((item, idx) => item.id || `acc-${idx}`)
    const { openIds, openedIds } = state
    const exploredCount = openedIds.length
    const totalCount = items.length

    const markOpened = useCallback((itemId: string, audioUrl?: string) => {
        let justCompleted = false

        setState((prev) => {
            const nextOpened = prev.openedIds.includes(itemId)
                ? prev.openedIds
                : [...prev.openedIds, itemId]

            const allOpened = itemIds.length > 0 && itemIds.every((id) => nextOpened.includes(id))
            justCompleted = allOpened && prev.status !== "completed"

            return {
                ...prev,
                openedIds: nextOpened,
                status: allOpened ? "completed" : prev.status ?? "active",
            }
        })

        if (justCompleted) {
            void playFeedback("quizSuccess", { sound: true })
        }

        if (audioUrl) {
            playItemAudio(itemId, audioUrl)
        }
    }, [itemIds, playFeedback, playItemAudio, setState])

    const openItem = useCallback((itemId: string, audioUrl?: string) => {
        setState((prev) => {
            const nextOpenIds = allowMultiple
                ? prev.openIds.includes(itemId) ? prev.openIds : [...prev.openIds, itemId]
                : [itemId]

            return { ...prev, openIds: nextOpenIds }
        })
        markOpened(itemId, audioUrl)
    }, [allowMultiple, markOpened, setState])

    const closeItem = useCallback((itemId: string) => {
        if (isPlayingItem(itemId)) {
            stopAudio()
        }
        setState((prev) => ({
            ...prev,
            openIds: prev.openIds.filter((id) => id !== itemId),
        }))
    }, [isPlayingItem, setState, stopAudio])

    const toggleItem = useCallback((itemId: string, audioUrl?: string) => {
        void playFeedback("click", { sound: true, animation: false })
        const isOpen = openIds.includes(itemId)
        if (isOpen) {
            closeItem(itemId)
        } else {
            if (!allowMultiple) {
                openIds.forEach((id) => {
                    if (id !== itemId && isPlayingItem(id)) stopAudio()
                })
            }
            openItem(itemId, audioUrl)
        }
    }, [allowMultiple, closeItem, openIds, openItem, playFeedback, isPlayingItem, stopAudio])

    const handleVolumeClick = useCallback((itemId: string, audioUrl: string | undefined, isOpen: boolean) => {
        if (isOpen) return

        if (!allowMultiple) {
            openIds.forEach((id) => {
                if (id !== itemId && isPlayingItem(id)) stopAudio()
            })
        }
        openItem(itemId, audioUrl)
    }, [allowMultiple, openIds, openItem, isPlayingItem, stopAudio])

    if (isEditing) {
        return (
            <div className="w-full my-6 max-w-4xl mx-auto space-y-2">
                {title && <h3 className="font-black text-lg tracking-tight text-slate-900">{title}</h3>}
                {items.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{item.content}</p>
                        {item.audioUrl && (
                            <p className="text-[10px] text-emerald-600 mt-2 uppercase tracking-wider font-bold">Audio published</p>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="w-full my-2 md:my-6 flex flex-col items-stretch md:items-center justify-start md:justify-center">
            <div className="w-full max-w-4xl space-y-3">
                {title && (
                    <div className="px-1 py-1 mb-2 flex items-end justify-between gap-3">
                        <h3 className="font-black text-lg tracking-tight text-slate-900">{title}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0">
                            {exploredCount} / {totalCount} opened
                        </span>
                    </div>
                )}

                {items.map((item, idx) => {
                    const itemId = itemIds[idx]
                    const isOpen = openIds.includes(itemId)
                    const isOpened = openedIds.includes(itemId)
                    const hasAudio = Boolean(item.audioUrl)

                    return (
                        <AccordionItemCard
                            key={itemId}
                            item={item}
                            idx={idx}
                            isOpen={isOpen}
                            isOpened={isOpened}
                            isPlaying={isPlayingItem(itemId)}
                            hasAudio={hasAudio}
                            onToggle={() => toggleItem(itemId, item.audioUrl)}
                            onVolumeClick={() => handleVolumeClick(itemId, item.audioUrl, isOpen)}
                        />
                    )
                })}

                {isComplete && (
                    <div className="mt-2 p-3.5 rounded-2xl bg-emerald-50 border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                        <span>All sections explored!</span>
                    </div>
                )}
            </div>
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
    isEditing = false,
    savedState,
    setComponentState,
    id = "accordion-component",
    status,
    disabled = false,
}: AccordionRendererProps) {
    const component: Component = {
        id,
        type: "accordion",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as Component["status"],
        props: { title, items, allowMultiple },
    } as Component

    const initialState: AccordionState = {
        openIds: [],
        openedIds: [],
        status: "active",
    }

    return (
        <InteractiveRenderer<AccordionState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={disabled ? undefined : setComponentState}
            disabled={disabled}
            onRender={(renderProps) => (
                <AccordionContent
                    {...renderProps}
                    title={title}
                    items={items}
                    allowMultiple={allowMultiple}
                    isEditing={isEditing}
                />
            )}
        />
    )
}
