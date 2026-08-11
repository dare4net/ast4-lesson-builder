"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Clock, Calendar, CheckCircle2, Volume2, Sparkles } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useFeedback } from "@/hooks/use-feedback"

interface TimelineEvent {
    id: string
    year: string
    title: string
    description?: string
    mediaUrl?: string
}

interface TimelineRendererProps {
    id?: string
    title?: string
    events: TimelineEvent[]
    interactive?: boolean
    points?: number
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
}

export function TimelineRenderer({
    id = "timeline-component",
    title = "Historical Timeline",
    events = [],
    interactive = true,
    points = 15,
    savedState,
    setComponentState,
    isEditing = false,
}: TimelineRendererProps) {
    const [activeEventIndex, setActiveEventIndex] = useState(0)
    const [completed, setCompleted] = useState(false)
    const { speak, isSpeaking } = useReadAloud()
    const { playFeedback } = useFeedback()

    const currentEvent = events[activeEventIndex] || events[0]

    const handleSelectEvent = (idx: number) => {
        setActiveEventIndex(idx)
        playFeedback("click", { sound: true })

        if (interactive && idx === events.length - 1 && !completed) {
            setCompleted(true)
            playFeedback("quizSuccess", { sound: true })

            if (setComponentState) {
                setComponentState({
                    status: "completed",
                    score: points,
                    maxScore: points,
                })
            }
        }
    }

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentEvent) {
            speak(`${currentEvent.year}: ${currentEvent.title}. ${currentEvent.description || ""}`)
        }
    }

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-slate-100">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                            Interactive Timeline • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-amber-400")} />
                        <span className="text-[10px] uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <h3 className="text-xl font-black mb-6 text-white">{title}</h3>

                {/* Horizontal Timeline Rail */}
                <div className="relative w-full mb-8 pt-4 pb-6 px-4">
                    {/* Rail Line */}
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0" />

                    {/* Progress Overlay */}
                    <div
                        className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-amber-500 transition-all duration-500 z-0 rounded-full"
                        style={{
                            width: events.length > 1 ? `${(activeEventIndex / (events.length - 1)) * 100}%` : "100%",
                        }}
                    />

                    {/* Timeline Nodes */}
                    <div className="relative z-10 flex items-center justify-between">
                        {events.map((ev, idx) => {
                            const isActive = idx === activeEventIndex
                            const isPassed = idx <= activeEventIndex

                            return (
                                <button
                                    key={ev.id || idx}
                                    type="button"
                                    onClick={() => handleSelectEvent(idx)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 active:scale-95",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-xs transition-all duration-300 shadow-lg",
                                            isActive && "bg-amber-500 text-slate-950 border-amber-300 scale-125 shadow-amber-500/30 ring-4 ring-amber-500/20",
                                            !isActive && isPassed && "bg-amber-500/20 border-amber-500 text-amber-300",
                                            !isActive && !isPassed && "bg-slate-950 border-slate-800 text-slate-500 group-hover:border-amber-400"
                                        )}
                                    >
                                        {idx + 1}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[11px] font-extrabold uppercase tracking-wider transition-colors",
                                            isActive ? "text-amber-300 font-black" : "text-slate-500"
                                        )}
                                    >
                                        {ev.year}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Selected Event Card View */}
                {currentEvent && (
                    <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>{currentEvent.year}</span>
                        </div>

                        <h4 className="text-lg font-black text-white mb-2">{currentEvent.title}</h4>

                        {currentEvent.description && (
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                {currentEvent.description}
                            </p>
                        )}

                        {currentEvent.mediaUrl && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 aspect-video max-h-48">
                                <img
                                    src={currentEvent.mediaUrl}
                                    alt={currentEvent.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Completion Indicator */}
                {completed && (
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Timeline exploration complete! +{points} Points</span>
                    </div>
                )}
            </div>
        </div>
    )
}
