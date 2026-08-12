"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Info, Lightbulb, AlertTriangle, AlertCircle, Volume2 } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useAudioPlayer } from "@/hooks/use-audio-player"

interface CalloutRendererProps {
    variant?: "note" | "tip" | "warning" | "important"
    title?: string
    content: string
    audioUrl?: string
    isEditing?: boolean
    isBuilder?: boolean
}

export function CalloutRenderer({
    variant = "note",
    title = "Important Note",
    content,
    audioUrl,
    isEditing = false,
}: CalloutRendererProps) {
    const { speak, isSpeaking: isTtsSpeaking } = useReadAloud()
    const { isPlaying: isAudioPlaying, hasAudio, play: playAudio } = useAudioPlayer({ audioUrl })
    const isSpeaking = isAudioPlaying || isTtsSpeaking

    const variantStyles = {
        note: {
            bg: "bg-sky-50/50 border-sky-200 border-b-sky-300 text-sky-950",
            accent: "bg-[#1CB0F6]",
            badge: "text-[#1CB0F6] bg-sky-100/80 border-sky-200 hover:bg-sky-200/80",
            icon: <Info className="w-5 h-5 text-[#1CB0F6] flex-shrink-0" />,
            defaultTitle: "Note",
        },
        tip: {
            bg: "bg-emerald-50/50 border-emerald-200 border-b-emerald-300 text-emerald-950",
            accent: "bg-[#58CC02]",
            badge: "text-[#58CC02] bg-emerald-100/80 border-emerald-200 hover:bg-emerald-200/80",
            icon: <Lightbulb className="w-5 h-5 text-[#58CC02] flex-shrink-0" />,
            defaultTitle: "Pro Tip",
        },
        warning: {
            bg: "bg-amber-50/50 border-amber-200 border-b-amber-300 text-amber-950",
            accent: "bg-[#FFC800]",
            badge: "text-amber-700 bg-amber-100/80 border-amber-200 hover:bg-amber-200/80",
            icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
            defaultTitle: "Warning",
        },
        important: {
            bg: "bg-rose-50/50 border-rose-200 border-b-rose-300 text-rose-950",
            accent: "bg-[#FF4B4B]",
            badge: "text-[#FF4B4B] bg-rose-100/80 border-rose-200 hover:bg-rose-200/80",
            icon: <AlertCircle className="w-5 h-5 text-[#FF4B4B] flex-shrink-0" />,
            defaultTitle: "Important",
        },
    }

    const config = variantStyles[variant] || variantStyles.note

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (hasAudio) {
            playAudio()
        } else {
            const fullText = `${title || config.defaultTitle}. ${content}`
            speak(fullText)
        }
    }

    return (
        <div className="w-full my-auto py-4 flex flex-col items-center justify-center flex-1 px-4 sm:px-6">
            <div
                className={cn(
                    "relative w-full max-w-2xl rounded-2xl border-2 border-b-4 p-5 shadow-sm transition-all duration-300 overflow-hidden",
                    config.bg
                )}
            >
                {/* Left Color Indicator Bar */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-2", config.accent)} />

                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-2 pl-2">
                    <div className="flex items-center gap-2.5">
                        {config.icon}
                        <h4 className="font-black text-base uppercase tracking-tight text-slate-900">
                            {title || config.defaultTitle}
                        </h4>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all border cursor-pointer active:scale-95 shadow-sm",
                            config.badge
                        )}
                        title={hasAudio ? "Play Audio Track" : "Read Aloud"}
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse")} />
                        <span className="text-[9px] uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="pl-2.5 pr-2 pt-1 text-sm font-bold text-slate-800 leading-relaxed">
                    <p>{content}</p>
                </div>
            </div>
        </div>
    )
}
