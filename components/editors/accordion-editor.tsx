"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Volume2, Layers, BookOpen } from "lucide-react"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

export interface AccordionItem {
    id: string
    title: string
    content: string
    audioUrl?: string
}

export interface AccordionEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    items: AccordionItem[]
    onChange: (items: AccordionItem[]) => void
    allowMultiple?: boolean
    onAllowMultipleChange?: (val: boolean) => void
}

export function AccordionEditor({
    title = "Key Definitions",
    onTitleChange,
    items = [],
    onChange,
    allowMultiple = false,
    onAllowMultipleChange,
}: AccordionEditorProps) {
    const addItem = () => {
        const newItem: AccordionItem = {
            id: `acc-${Date.now()}`,
            title: "New Concept Title",
            content: "Enter detailed explanation here...",
            audioUrl: "",
        }
        onChange([...items, newItem])
    }

    const updateItem = (index: number, field: keyof AccordionItem, value: any) => {
        const updated = [...items]
        updated[index] = {
            ...updated[index],
            [field]: value,
        }
        onChange(updated)
    }

    return (
        <div className="space-y-6">
            {/* Top Section Header Title Field */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                        Accordion Topic Header
                    </Label>
                </div>
                <Input
                    value={title}
                    onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
                    placeholder="e.g. Key Scientific Terms"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-sky-500/50 h-10 text-sm font-bold placeholder:text-slate-700 rounded-xl"
                />
                <p className="text-[10px] text-slate-500 font-medium">
                    Optional heading card shown at the top of the accordion list.
                </p>
            </div>

            {/* Allow Multiple Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <Label className="text-xs font-bold text-slate-200">
                            Allow Multiple Open Panels
                        </Label>
                        <p className="text-[10px] text-slate-500 font-medium">
                            Students can expand multiple accordion items simultaneously
                        </p>
                    </div>
                </div>
                <Switch
                    checked={allowMultiple}
                    onCheckedChange={(checked) => onAllowMultipleChange && onAllowMultipleChange(checked)}
                    className="data-[state=checked]:bg-sky-500"
                />
            </div>

            {/* Accordion Panels Array */}
            <ArrayItemEditor<AccordionItem>
                items={items}
                onChange={onChange}
                onAddItem={addItem}
                getItemLabel={(item, index) => item.title || `Panel ${index + 1}`}
                addButtonLabel="Add Accordion Panel"
                renderItem={(item, index) => (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Panel Title
                            </Label>
                            <Input
                                value={item.title}
                                onChange={(e) => updateItem(index, "title", e.target.value)}
                                placeholder="Question or Topic Title"
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-sky-500/50 h-10 text-sm font-bold placeholder:text-slate-700 rounded-xl"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Panel Explanation Content
                            </Label>
                            <Textarea
                                value={item.content}
                                onChange={(e) => updateItem(index, "content", e.target.value)}
                                placeholder="Provide details or answers for this panel..."
                                rows={3}
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-sky-500/50 text-sm font-medium placeholder:text-slate-700 rounded-xl resize-none p-3"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Volume2 className="w-3 h-3 text-sky-400" />
                                    Per-Item Audio Track URL
                                </Label>
                                {item.audioUrl && (
                                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                        Audio Generated ✓
                                    </span>
                                )}
                            </div>
                            <Input
                                value={item.audioUrl || ""}
                                onChange={(e) => updateItem(index, "audioUrl", e.target.value)}
                                placeholder="Auto-generated on publish or custom URL..."
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-sky-500/50 h-9 text-xs font-mono placeholder:text-slate-700 rounded-xl text-slate-400"
                            />
                            <p className="text-[9px] text-slate-500 italic ml-1">
                                Clicking 'Publish & Generate Audio' in the toolbar generates individual audio for this item.
                            </p>
                        </div>
                    </div>
                )}
            />
        </div>
    )
}
