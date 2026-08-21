"use client"

import * as React from "react"
import { useState } from "react"
import { Play, Youtube } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoRendererProps {
    url?: string
    src?: string
    poster?: string
    caption?: string
    aspectRatio?: "16:9" | "4:3" | "1:1"
    autoPlay?: boolean
    id?: string
}

export function extractYouTubeVideoId(inputUrl?: string): string | null {
    if (!inputUrl) return null
    const trimmed = inputUrl.trim()
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
    const match = trimmed.match(regExp)

    if (match && match[2].length === 11) {
        return match[2]
    } else if (trimmed.length === 11 && !trimmed.includes("/") && !trimmed.includes(".")) {
        return trimmed
    }
    return null
}

export function VideoRenderer({
    url,
    src,
    poster,
    caption,
    aspectRatio = "16:9",
    autoPlay = false,
}: VideoRendererProps) {
    const videoLink = url || src || ""
    const videoId = extractYouTubeVideoId(videoLink)
    const [isPlaying, setIsPlaying] = useState(autoPlay)

    const aspectClass = aspectRatio === "4:3" ? "aspect-[4/3]" : aspectRatio === "1:1" ? "aspect-square" : "aspect-video"

    if (!videoId) {
        return (
            <figure className="my-6 space-y-4 max-w-3xl mx-auto w-full">
                <div className="w-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                        <Youtube className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">YouTube Video Embed</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Please enter a valid YouTube video URL or ID in the component editor.</p>
                    </div>
                </div>
            </figure>
        )
    }

    const defaultThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    const thumbnailSrc = poster || defaultThumbnail
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`

    return (
        <figure className="my-2 space-y-2 max-w-3xl mx-auto w-full h-full flex flex-col items-center justify-center overflow-hidden group/video">
            <div className={cn("relative w-full max-h-[52vh] rounded-2xl overflow-hidden bg-slate-950 shadow-xl border border-slate-800/80", aspectClass)}>
                {!isPlaying ? (
                    <div
                        onClick={() => setIsPlaying(true)}
                        className="absolute inset-0 w-full h-full cursor-pointer group/poster flex items-center justify-center"
                    >
                        <img
                            src={thumbnailSrc}
                            alt={caption || "Video thumbnail"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-[1.02] opacity-90 group-hover/poster:opacity-100"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultThumbnail
                            }}
                        />
                        <div className="absolute inset-0 bg-slate-950/30 group-hover/poster:bg-slate-950/10 transition-colors" />
                        <div className="relative z-10 w-14 h-14 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-600/30 group-hover/poster:scale-110 transition-all duration-300 border border-white/20">
                            <Play className="w-7 h-7 fill-white translate-x-0.5" />
                        </div>
                    </div>
                ) : (
                    <iframe
                        src={embedUrl}
                        title={caption || "YouTube Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0"
                    />
                )}
            </div>

            {caption && (
                <figcaption className="text-center mt-1 shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-0.5">Video Caption</span>
                    <span className="text-slate-900 dark:text-slate-200 text-xs font-bold italic tracking-tight">
                        {caption}
                    </span>
                </figcaption>
            )}
        </figure>
    )
}
