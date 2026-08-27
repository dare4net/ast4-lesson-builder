"use client"

import React from "react"
import { Quote } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { ListenButton } from "@/components/renderers/listen-button"
import { FormattedText } from "@/components/ui/formatted-text"

interface QuoteRendererProps {
    text?: string
    author?: string
    source?: string
    audioUrl?: string
    isEditing?: boolean
    [key: string]: any
}

export function QuoteRenderer({
    text = "Quote text goes here...",
    author = "Author Name",
    source = "",
    audioUrl,
    isEditing
}: QuoteRendererProps) {
    const { isPlaying, hasAudio, play: playAudio } = useAudioPlayer({ audioUrl })

    const handleSpeak = () => {
        playAudio()
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-10 md:px-12 py-4 my-auto relative min-h-0">
            {/* Centered Decorative Background Quote Icon */}
            <div className="absolute inset-0 flex items-center justify-center text-emerald-500/10 dark:text-emerald-400/15 pointer-events-none group-hover:scale-105 transition-transform duration-500 z-0">
                <Quote className="w-64 h-64" />
            </div>

            <div className="relative z-10 space-y-5 max-w-4xl text-center flex flex-col items-center my-auto">
                <div className="flex items-center gap-2 justify-center">
                    <Quote className="w-5 h-5 text-[#58CC02]" />
                    <span className="text-[9px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-[0.2em]">Inspirational Quote</span>
                    {hasAudio && (
                        <ListenButton
                            hasAudio={hasAudio}
                            isPlaying={isPlaying}
                            onClick={handleSpeak}
                            showLabel={false}
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#58CC02] border-2 border-emerald-200 dark:border-emerald-800 border-b-4 active:border-b-2 active:translate-y-[1px]"
                            iconClassName="w-3.5 h-3.5"
                        />
                    )}
                </div>

                <blockquote className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 italic leading-relaxed tracking-tight text-center">
                    "<FormattedText content={text} />"
                </blockquote>

                {(author || source) && (
                    <div className="flex items-center justify-center gap-2 pt-2 text-center">
                        <span className="text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest">
                            — {author}
                        </span>
                        {source && (
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                                ({source})
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
