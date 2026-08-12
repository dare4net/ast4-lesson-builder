"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Clock } from "lucide-react"

export interface TimelineEvent {
    id: string
    year: string
    title: string
    description?: string
    mediaUrl?: string
}

export interface TimelineEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    events?: TimelineEvent[]
    onEventsChange?: (events: TimelineEvent[]) => void
}

export function TimelineEditor({
    title = "Historical Timeline",
    onTitleChange,
    events = [],
    onEventsChange,
}: TimelineEditorProps) {
    const handleAddEvent = () => {
        const newEvent: TimelineEvent = {
            id: `ev-${Date.now()}`,
            year: "2024",
            title: "New Timeline Event",
            description: "Describe what happened at this milestone...",
            mediaUrl: "",
        }
        if (onEventsChange) {
            onEventsChange([...events, newEvent])
        }
    }

    const handleUpdateEvent = (index: number, updated: Partial<TimelineEvent>) => {
        const nextEvents = [...events]
        nextEvents[index] = { ...nextEvents[index], ...updated }
        if (onEventsChange) {
            onEventsChange(nextEvents)
        }
    }

    const handleDeleteEvent = (index: number) => {
        const nextEvents = events.filter((_, i) => i !== index)
        if (onEventsChange) {
            onEventsChange(nextEvents)
        }
    }

    const handleMoveEvent = (index: number, direction: "up" | "down") => {
        const targetIdx = direction === "up" ? index - 1 : index + 1
        if (targetIdx < 0 || targetIdx >= events.length) return
        const nextEvents = [...events]
        const temp = nextEvents[index]
        nextEvents[index] = nextEvents[targetIdx]
        nextEvents[targetIdx] = temp
        if (onEventsChange) {
            onEventsChange(nextEvents)
        }
    }

    return (
        <div className="space-y-6">
            {/* Timeline Section Title */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Timeline Main Header Title
                </Label>
                <Input
                    value={title}
                    onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
                    placeholder="e.g. Evolution of Modern Computing"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-amber-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl"
                />
            </div>

            {/* Events Manager Header */}
            <div className="flex items-center justify-between pt-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Timeline Milestone Events ({events.length})
                </Label>

                <Button
                    type="button"
                    onClick={handleAddEvent}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs h-9 px-3 rounded-xl transition-all shadow-md shadow-amber-500/20 active:translate-y-[1px]"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Event Node
                </Button>
            </div>

            {/* Event Nodes List */}
            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800 space-y-3">
                        <Calendar className="w-8 h-8 text-slate-700 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">No milestone events added yet.</p>
                        <Button
                            type="button"
                            onClick={handleAddEvent}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold h-9 px-4 rounded-xl"
                        >
                            Add First Milestone
                        </Button>
                    </div>
                ) : (
                    events.map((ev, idx) => (
                        <div
                            key={ev.id || idx}
                            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative group"
                        >
                            {/* Top Controls Bar */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                                        Milestone Event #{idx + 1}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={idx === 0}
                                        onClick={() => handleMoveEvent(idx, "up")}
                                        className="h-7 w-7 text-slate-500 hover:text-white disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={idx === events.length - 1}
                                        onClick={() => handleMoveEvent(idx, "down")}
                                        className="h-7 w-7 text-slate-500 hover:text-white disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteEvent(idx)}
                                        className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Event Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                        Year / Date Tag
                                    </Label>
                                    <Input
                                        value={ev.year}
                                        onChange={(e) => handleUpdateEvent(idx, { year: e.target.value })}
                                        placeholder="e.g. 1969 or Phase 1"
                                        className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-amber-400"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                        Event Title
                                    </Label>
                                    <Input
                                        value={ev.title}
                                        onChange={(e) => handleUpdateEvent(idx, { title: e.target.value })}
                                        placeholder="e.g. Apollo 11 Moon Landing"
                                        className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white"
                                    />
                                </div>
                            </div>

                            {/* Event Description */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                    Description / Milestone Details
                                </Label>
                                <Textarea
                                    value={ev.description || ""}
                                    onChange={(e) => handleUpdateEvent(idx, { description: e.target.value })}
                                    placeholder="Explain what happened at this stage of the timeline..."
                                    rows={2}
                                    className="bg-slate-900 border-slate-800 text-xs font-medium text-slate-300 rounded-xl resize-none p-3"
                                />
                            </div>

                            {/* Event Image URL */}
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                    <ImageIcon className="w-3 h-3 text-slate-500" />
                                    Media Image URL (Optional)
                                </Label>
                                <Input
                                    value={ev.mediaUrl || ""}
                                    onChange={(e) => handleUpdateEvent(idx, { mediaUrl: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    className="bg-slate-900 border-slate-800 h-8 text-[11px] font-mono text-slate-400"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
