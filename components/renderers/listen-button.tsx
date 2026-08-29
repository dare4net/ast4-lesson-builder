"use client"

import React from "react"
import { Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ListenButtonProps {
    hasAudio: boolean
    isPlaying: boolean
    onClick: (e: React.MouseEvent) => void
    className?: string
    iconClassName?: string
    showLabel?: boolean
    label?: string
}

export function ListenButton({
    hasAudio,
    isPlaying,
    onClick,
    className,
    iconClassName,
    showLabel = true,
    label = "Listen",
}: ListenButtonProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!hasAudio) return
        onClick(e)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={!hasAudio}
            className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 min-h-11 rounded-xl text-xs font-black transition-all border shadow-sm",
                hasAudio
                    ? "cursor-pointer active:scale-95"
                    : "cursor-not-allowed opacity-45",
                className,
            )}
            title={hasAudio ? "Play audio track" : "Publish lesson to generate audio"}
        >
            <Volume2
                className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isPlaying && hasAudio && "animate-pulse",
                    iconClassName,
                )}
            />
            {showLabel && (
                <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
            )}
        </button>
    )
}
