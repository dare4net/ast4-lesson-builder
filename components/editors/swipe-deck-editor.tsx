"use client"

import React from "react"
import { Plus, Trash2, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WYSIWYGTextArea } from "@/components/ui/wysiwyg-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface SwipeCardItem {
    id: string
    front?: string
    text?: string
    statement?: string
    correctSide: "left" | "right"
    explanation: string
}

interface SwipeDeckEditorProps {
    leftLabel: string
    onLeftLabelChange: (val: string) => void
    rightLabel: string
    onRightLabelChange: (val: string) => void
    cards: SwipeCardItem[]
    onCardsChange: (cards: SwipeCardItem[]) => void
}

export function SwipeDeckEditor({
    leftLabel = "Myth",
    onLeftLabelChange,
    rightLabel = "Fact",
    onRightLabelChange,
    cards = [],
    onCardsChange,
}: SwipeDeckEditorProps) {
    const handleAddCard = () => {
        const newCard: SwipeCardItem = {
            id: `card-${Date.now()}`,
            front: "New statement to evaluate...",
            text: "New statement to evaluate...",
            correctSide: "right",
            explanation: "Detailed explanation goes here.",
        }
        onCardsChange([...cards, newCard])
    }

    const handleUpdateCard = (id: string, updates: Partial<SwipeCardItem>) => {
        const nextCards = cards.map(c => (c.id === id ? { ...c, ...updates } : c))
        onCardsChange(nextCards)
    }

    const handleRemoveCard = (id: string) => {
        onCardsChange(cards.filter(c => c.id !== id))
    }

    return (
        <div className="space-y-6 text-slate-200">
            {/* Decision Axis Labels */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                        Left Option Label
                    </Label>
                    <Input
                        value={leftLabel}
                        onChange={e => onLeftLabelChange(e.target.value)}
                        placeholder="e.g. Myth, False, Acid"
                        className="bg-slate-950/60 border-slate-800 text-xs font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">
                        Right Option Label
                    </Label>
                    <Input
                        value={rightLabel}
                        onChange={e => onRightLabelChange(e.target.value)}
                        placeholder="e.g. Fact, True, Base"
                        className="bg-slate-950/60 border-slate-800 text-xs font-bold"
                    />
                </div>
            </div>

            {/* Cards Deck Manager */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#1CB0F6]" />
                        Deck Cards ({cards.length})
                    </Label>
                    <Button
                        type="button"
                        onClick={handleAddCard}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-8 px-3"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Card
                    </Button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {cards.map((card, idx) => (
                        <div
                            key={card.id}
                            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#1CB0F6] uppercase tracking-wider">
                                    Card #{idx + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCard(card.id)}
                                    className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>

                            <WYSIWYGTextArea
                                value={card.front || card.text || card.statement || ""}
                                onChange={(val) => handleUpdateCard(card.id, { front: val, text: val })}
                                placeholder="Statement text..."
                                rows={2}
                                showPreviewToggle={false}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-[9px] font-bold uppercase text-slate-500">
                                        Correct Choice
                                    </Label>
                                    <Select
                                        value={card.correctSide}
                                        onValueChange={(val: any) => handleUpdateCard(card.id, { correctSide: val })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-800 text-xs font-bold h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="left" className="font-bold">⬅️ {leftLabel}</SelectItem>
                                            <SelectItem value="right" className="font-bold">➡️ {rightLabel}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-[9px] font-bold uppercase text-slate-500">
                                        Explanation
                                    </Label>
                                    <Input
                                        value={card.explanation}
                                        onChange={e => handleUpdateCard(card.id, { explanation: e.target.value })}
                                        placeholder="Explanation when flipped..."
                                        className="bg-slate-900 border-slate-800 text-xs font-medium h-9"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
