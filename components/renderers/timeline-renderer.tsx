"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Calendar, CheckCircle2 } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { ListenButton } from "@/components/renderers/listen-button"
import { useFeedback } from "@/hooks/use-feedback"
import { InteractiveRenderer, InteractiveRenderProps } from "./base/interactive-renderer"
import type { Component } from "@/types/lesson"

interface TimelineEvent {
    id: string
    year: string
    title: string
    description?: string
    mediaUrl?: string
    audioUrl?: string
}

interface TimelineRendererProps {
    id?: string
    title?: string
    events: TimelineEvent[]
    interactive?: boolean
    points?: number
    savedState?: TimelineState
    setComponentState?: (state: TimelineState) => void
    isEditing?: boolean
}

type TimelineState = {
    activeEventIndex: number
    completed: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

function TimelineContent({
    state,
    setState,
    title,
    events,
    interactive,
    points,
    isEditing,
}: InteractiveRenderProps<TimelineState> & {
    title: string
    events: TimelineEvent[]
    interactive: boolean
    points: number
    isEditing: boolean
}) {
    const { playFeedback } = useFeedback()

    const { activeEventIndex, completed } = state
    const currentEvent = events[activeEventIndex] || events[0]
    const { isPlaying, hasAudio, play: playAudio } = useAudioPlayer({
        audioUrl: currentEvent?.audioUrl,
    })

    const handleSelectEvent = (idx: number) => {
        const isLastEvent = idx === events.length - 1
        const willComplete = interactive && isLastEvent && !completed

        setState(prev => ({
            ...prev,
            activeEventIndex: idx,
            completed: willComplete ? true : prev.completed,
            status: willComplete ? "completed" : prev.status ?? "active",
            score: willComplete ? points : prev.score,
            maxScore: willComplete ? points : prev.maxScore,
        }))

        playFeedback("click", { sound: true })

        if (willComplete) {
            playFeedback("quizSuccess", { sound: true })
        }
    }

    const handleSpeak = () => {
        playAudio()
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col justify-center px-4 sm:px-6 py-4 relative min-h-0 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                        Interactive Timeline • {points} Points
                    </span>
                </div>

                {hasAudio && (
                    <ListenButton
                        hasAudio={hasAudio}
                        isPlaying={isPlaying}
                        onClick={handleSpeak}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        iconClassName={cn(isPlaying && "text-amber-600")}
                    />
                )}
            </div>

            <h3 className="text-lg font-black mb-4 text-slate-900 tracking-tight shrink-0">{title}</h3>

            <div className="relative w-full mb-6 pt-3 pb-5 px-4 shrink-0">
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-2 bg-slate-200 rounded-full z-0" />
                <div
                    className="absolute left-8 top-1/2 -translate-y-1/2 h-2 bg-[#FFC800] transition-all duration-500 z-0 rounded-full"
                    style={{
                        width: events.length > 1 ? `${(activeEventIndex / (events.length - 1)) * 100}%` : "100%",
                    }}
                />
                <div className="relative z-10 flex items-center justify-between">
                    {events.map((ev, idx) => {
                        const isActive = idx === activeEventIndex
                        const isPassed = idx <= activeEventIndex

                        return (
                            <button
                                key={ev.id || idx}
                                type="button"
                                onClick={() => !isEditing && handleSelectEvent(idx)}
                                disabled={isEditing}
                                className="flex flex-col items-center gap-1.5 group cursor-pointer transition-all duration-300 active:translate-y-[2px]"
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-2xl border-2 border-b-4 flex items-center justify-center font-black text-xs transition-all duration-200 shadow-sm",
                                        isActive && "bg-[#FFC800] text-slate-900 border-[#FFC800] border-b-amber-600 scale-110 shadow-amber-500/30",
                                        !isActive && isPassed && "bg-amber-100 border-amber-300 border-b-amber-400 text-amber-900",
                                        !isActive && !isPassed && "bg-white border-slate-200 border-b-slate-300 text-slate-400 group-hover:border-amber-400"
                                    )}
                                >
                                    {idx + 1}
                                </div>
                                <span
                                    className={cn(
                                        "text-[9px] font-black uppercase tracking-wider transition-colors",
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

            {currentEvent && (
                <div className="p-5 rounded-2xl bg-amber-50/50 border-2 border-amber-200 border-b-4 shadow-sm animate-in fade-in duration-300 shrink-0">
                    <div className="flex items-center gap-2 text-amber-700 text-xs font-black uppercase tracking-widest mb-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{currentEvent.year}</span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mb-1.5 tracking-tight">{currentEvent.title}</h4>
                    {currentEvent.description && (
                        <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                            {currentEvent.description}
                        </p>
                    )}
                    {currentEvent.mediaUrl && (
                        <div className="mt-3 rounded-2xl overflow-hidden border-2 border-amber-200 aspect-video max-h-40 shadow-sm">
                            <img
                                src={currentEvent.mediaUrl}
                                alt={currentEvent.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>
            )}

            {completed && (
                <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 flex items-center gap-2 font-black text-xs uppercase tracking-wider shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                    <span>Timeline exploration complete! +{points} Points</span>
                </div>
            )}
        </div>
    )
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
    const component: Component = {
        id,
        type: "timeline",
        state: "active",
        status: (savedState?.status === "completed" ? "completed" : "uncompleted") as any,
        props: { title, events, points },
    } as Component

    const initialState: TimelineState = {
        activeEventIndex: 0,
        completed: false,
        status: "active",
    }

    return (
        <InteractiveRenderer<TimelineState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            onRender={(renderProps) => (
                <TimelineContent
                    {...renderProps}
                    title={title}
                    events={events}
                    interactive={interactive}
                    points={points}
                    isEditing={isEditing}
                />
            )}
        />
    )
}
