"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Info, Lightbulb, AlertTriangle, AlertCircle, Volume2 } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"

interface CalloutRendererProps {
    variant?: "note" | "tip" | "warning" | "important"
    title?: string
    content: string
    isEditing?: boolean
    isBuilder?: boolean
}

export function CalloutRenderer({
    variant = "note",
    title = "Important Note",
    content,
    isEditing = false,
}: CalloutRendererProps) {
    const { speak, isSpeaking } = useReadAloud()

    const variantStyles = {
        note: {
            bg: "bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-100",
            accent: "bg-blue-500",
            badge: "text-blue-600 bg-blue-500/10 border-blue-500/20",
            icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
            defaultTitle: "Note",
        },
        tip: {
            bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100",
            accent: "bg-emerald-500",
            badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
            icon: <Lightbulb className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
            defaultTitle: "Pro Tip",
        },
        warning: {
            bg: "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100",
            accent: "bg-amber-500",
            badge: "text-amber-600 bg-amber-500/10 border-amber-500/20",
            icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
            defaultTitle: "Warning",
        },
        important: {
            bg: "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100",
            accent: "bg-rose-500",
            badge: "text-rose-600 bg-rose-500/10 border-rose-500/20",
            icon: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
            defaultTitle: "Important",
        },
    }

    const config = variantStyles[variant] || variantStyles.note

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        const fullText = `${title || config.defaultTitle}. ${content}`
        speak(fullText)
    }

    return (
        <div className="w-full my-4 flex flex-col items-center justify-center">
            <div
                className={cn(
                    "relative w-full max-w-4xl rounded-2xl border-2 p-5 shadow-sm transition-all duration-300 backdrop-blur-sm overflow-hidden",
                    config.bg
                )}
            >
                {/* Left Color Indicator Bar */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.accent)} />

                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-2 pl-2">
                    <div className="flex items-center gap-2.5">
                        {config.icon}
                        <h4 className="font-extrabold text-sm tracking-tight">
                            {title || config.defaultTitle}
                        </h4>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer active:scale-95",
                            config.badge
                        )}
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse")} />
                        <span className="text-[10px] uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="pl-2.5 pr-2 pt-1 text-sm font-medium leading-relaxed opacity-95">
                    <p>{content}</p>
                </div>
            </div>
        </div>
    )
}
