"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Grid2X2, Plus, Trash2 } from "lucide-react"

export interface MemoryPair {
    id: string
    term: string
    definition: string
}

export interface MemoryGridEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    pairs?: MemoryPair[]
    onPairsChange?: (pairs: MemoryPair[]) => void
}

export function MemoryGridEditor({
    title = "Memory Card Pairs",
    onTitleChange,
    pairs = [],
    onPairsChange,
}: MemoryGridEditorProps) {
    const handleAdd = () => {
        const newPair: MemoryPair = {
            id: `pair-${Date.now()}`,
            term: "",
            definition: "",
        }
        onPairsChange?.([...pairs, newPair])
    }

    const handleUpdate = (id: string, field: "term" | "definition", value: string) => {
        onPairsChange?.(pairs.map(p => (p.id === id ? { ...p, [field]: value } : p)))
    }

    const handleDelete = (id: string) => {
        onPairsChange?.(pairs.filter(p => p.id !== id))
    }

    return (
        <div className="space-y-6 w-full min-w-0">
            {/* Title */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Grid2X2 className="w-4 h-4 text-pink-400 shrink-0" />
                    Activity Title
                </Label>
                <Input
                    value={title}
                    onChange={e => onTitleChange?.(e.target.value)}
                    placeholder="e.g. Match Terms to Definitions"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-pink-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl w-full"
                />
            </div>

            {/* Pairs */}
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                        <Grid2X2 className="w-4 h-4 text-pink-400 shrink-0" />
                        Card Pairs ({pairs.length})
                    </Label>
                    <Button
                        type="button"
                        onClick={handleAdd}
                        className="bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs h-8 px-2.5 rounded-xl shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Pair
                    </Button>
                </div>

                {pairs.length === 0 ? (
                    <div className="p-6 text-center bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800 space-y-3">
                        <Grid2X2 className="w-6 h-6 text-slate-700 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">No card pairs yet.</p>
                        <Button
                            type="button"
                            onClick={handleAdd}
                            className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-bold h-8 px-3 rounded-xl"
                        >
                            Add First Pair
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pairs.map((pair, idx) => (
                            <div key={pair.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5 w-full min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                        Pair #{idx + 1}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(pair.id)}
                                        className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Term (front)</Label>
                                    <Input
                                        value={pair.term}
                                        onChange={e => handleUpdate(pair.id, "term", e.target.value)}
                                        placeholder="e.g. Photosynthesis"
                                        className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Definition (back)</Label>
                                    <Textarea
                                        value={pair.definition}
                                        onChange={e => handleUpdate(pair.id, "definition", e.target.value)}
                                        placeholder="e.g. The process plants use to convert sunlight into energy"
                                        className="bg-slate-900 border-slate-800 text-xs font-bold text-white resize-none min-h-[64px] w-full"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
