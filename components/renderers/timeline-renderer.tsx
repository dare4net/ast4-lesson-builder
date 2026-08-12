"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Clock, Calendar, CheckCircle2, Volume2 } from "lucide-react"
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
            <div className="relative w-full max-w-4xl bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                            Interactive Timeline • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-amber-600")} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <h3 className="text-xl font-black mb-6 text-slate-900 tracking-tight">{title}</h3>

                {/* Horizontal Timeline Rail */}
                <div className="relative w-full mb-8 pt-4 pb-6 px-4">
                    {/* Rail Line */}
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-2 bg-slate-200 rounded-full z-0" />

                    {/* Progress Overlay */}
                    <div
                        className="absolute left-8 top-1/2 -translate-y-1/2 h-2 bg-[#FFC800] transition-all duration-500 z-0 rounded-full"
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
                                    className="flex flex-col items-center gap-2 group cursor-pointer transition-all duration-300 active:translate-y-[2px]"
                                >
                                    <div
                                        className={cn(
                                            "w-11 h-11 rounded-2xl border-2 border-b-4 flex items-center justify-center font-black text-xs transition-all duration-200 shadow-sm",
                                            isActive && "bg-[#FFC800] text-slate-900 border-[#FFC800] border-b-amber-600 scale-110 shadow-amber-500/30",
                                            !isActive && isPassed && "bg-amber-100 border-amber-300 border-b-amber-400 text-amber-900",
                                            !isActive && !isPassed && "bg-white border-slate-200 border-b-slate-300 text-slate-400 group-hover:border-amber-400"
                                        )}
                                    >
                                        {idx + 1}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-wider transition-colors",
                                            isActive ? "text-amber-600" : "text-slate-400"
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
                    <div className="p-6 rounded-2xl bg-amber-50/40 border-2 border-amber-200 border-b-4 shadow-sm animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-amber-700 text-xs font-black uppercase tracking-widest mb-2">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            <span>{currentEvent.year}</span>
                        </div>

                        <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{currentEvent.title}</h4>

                        {currentEvent.description && (
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                {currentEvent.description}
                            </p>
                        )}

                        {currentEvent.mediaUrl && (
                            <div className="mt-4 rounded-2xl overflow-hidden border-2 border-amber-200 aspect-video max-h-52 shadow-sm">
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
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                        <span>Timeline exploration complete! +{points} Points</span>
                    </div>
                )}
            </div>
        </div>
    )
}
