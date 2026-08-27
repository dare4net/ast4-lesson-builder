"use client"

import React, { useState } from "react"
import { Plus, Trash2, Sliders, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SpectrumItem } from "@/components/renderers/spectrum-sorter-renderer"
import { CONTROL_ICON_OPTIONS } from "@/components/renderers/spectrum-sorter-renderer"
import { cn } from "@/lib/utils"

interface SpectrumSorterEditorProps {
    minLabel: string
    onMinLabelChange: (val: string) => void
    maxLabel: string
    onMaxLabelChange: (val: string) => void
    tolerance: number
    onToleranceChange: (val: number) => void
    items: SpectrumItem[]
    onItemsChange: (items: SpectrumItem[]) => void
}

export function SpectrumSorterEditor({
    minLabel = "Low (0%)",
    onMinLabelChange,
    maxLabel = "High (100%)",
    onMaxLabelChange,
    tolerance = 10,
    onToleranceChange,
    items = [],
    onItemsChange,
}: SpectrumSorterEditorProps) {
    const [activeTabId, setActiveTabId] = useState<string | null>(items[0]?.id || null)

    // Ensure activeTabId remains valid if items change
    const currentActiveId = items.some(i => i.id === activeTabId)
        ? activeTabId
        : items[0]?.id || null

    const activeItem = items.find(i => i.id === currentActiveId)

    const handleAddItem = () => {
        const newItem: SpectrumItem = {
            id: `item-${Date.now()}`,
            label: `Control #${items.length + 1}`,
            correctPosition: 50,
            operator: "=",
            controlType: "slider",
            icon: "sliders",
            colSpan: "1",
        }
        onItemsChange([...items, newItem])
        setActiveTabId(newItem.id)
    }

    const handleUpdateItem = (id: string, updates: Partial<SpectrumItem>) => {
        const nextItems = items.map(i => (i.id === id ? { ...i, ...updates } : i))
        onItemsChange(nextItems)
    }

    const handleRemoveItem = (id: string) => {
        const nextItems = items.filter(i => i.id !== id)
        onItemsChange(nextItems)
        if (activeTabId === id) {
            setActiveTabId(nextItems[0]?.id || null)
        }
    }

    return (
        <div className="space-y-6 text-slate-200">
            {/* Global Settings (Bounds & Tolerance) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-[#0284C7] uppercase tracking-wider">
                    <Settings2 className="w-4 h-4" />
                    <span>Global Control Deck Settings</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                            Min Bound Label (0%)
                        </Label>
                        <Input
                            value={minLabel}
                            onChange={e => onMinLabelChange(e.target.value)}
                            placeholder="e.g. Acidic / Low"
                            className="bg-slate-900 border-slate-800 text-xs font-bold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#16A34A]">
                            Max Bound Label (100%)
                        </Label>
                        <Input
                            value={maxLabel}
                            onChange={e => onMaxLabelChange(e.target.value)}
                            placeholder="e.g. Alkaline / High"
                            className="bg-slate-900 border-slate-800 text-xs font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Target Margin of Error Tolerance
                        </Label>
                        <span className="text-xs font-bold font-mono text-[#0284C7]">±{tolerance}%</span>
                    </div>
                    <Input
                        type="number"
                        min={1}
                        max={25}
                        value={tolerance}
                        onChange={e => onToleranceChange(Number(e.target.value))}
                        className="bg-slate-900 border-slate-800 text-xs font-bold"
                    />
                </div>
            </div>

            {/* TAB-BASED ITEM CONFIGURATION MANAGER */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#0284C7] flex items-center gap-1.5">
                        <Sliders className="w-4 h-4" />
                        <span>Control Widgets ({items.length})</span>
                    </Label>

                    <Button
                        type="button"
                        onClick={handleAddItem}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs h-8 px-3 rounded-xl shadow"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Control
                    </Button>
                </div>

                {/* Tab Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {items.map((item, idx) => {
                        const isActive = item.id === currentActiveId
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTabId(item.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer",
                                    isActive
                                        ? "bg-[#0284C7] text-white border-[#0284C7] shadow-lg shadow-[#0284C7]/20"
                                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
                                )}
                            >
                                <span>#{idx + 1} {item.label || "Untitled"}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Active Tab Panel */}
                {activeItem ? (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                        {/* Title & Delete */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 space-y-1">
                                <Label className="text-[10px] font-black uppercase text-[#0284C7]">Control Name</Label>
                                <Input
                                    value={activeItem.label}
                                    onChange={e => handleUpdateItem(activeItem.id, { label: e.target.value })}
                                    placeholder="e.g. Reactor Pressure"
                                    className="bg-slate-900 border-slate-800 text-xs font-bold"
                                />
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveItem(activeItem.id)}
                                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-bold shrink-0 mt-4"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </Button>
                        </div>

                        {/* Control Hardware Settings */}
                        <div className="space-y-3 pt-2 border-t border-slate-900">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Widget Properties
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-[#0284C7]">Control Widget Type</Label>
                                    <Select
                                        value={activeItem.controlType || "slider"}
                                        onValueChange={val => handleUpdateItem(activeItem.id, { controlType: val as any })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-800 text-xs font-bold h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="slider" className="font-bold">🎚️ Linear Slider</SelectItem>
                                            <SelectItem value="knob" className="font-bold">🔄 Rotary Knob</SelectItem>
                                            <SelectItem value="stepper" className="font-bold">🔢 Digital Stepper</SelectItem>
                                            <SelectItem value="toggle" className="font-bold">🔘 Toggle Switch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-emerald-400">Control Icon</Label>
                                    <Select
                                        value={activeItem.icon || "sliders"}
                                        onValueChange={val => handleUpdateItem(activeItem.id, { icon: val })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-800 text-xs font-bold h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-48 overflow-y-auto">
                                            {CONTROL_ICON_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value} className="font-bold text-xs">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-amber-400">Grid Span Width</Label>
                                    <Select
                                        value={activeItem.colSpan || "1"}
                                        onValueChange={val => handleUpdateItem(activeItem.id, { colSpan: val as any })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-800 text-xs font-bold h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="1" className="font-bold">1 Column</SelectItem>
                                            <SelectItem value="2" className="font-bold">2 Columns</SelectItem>
                                            <SelectItem value="3" className="font-bold">3 Columns (Full Width)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Display Unit</Label>
                                    <Input
                                        value={activeItem.unit || ""}
                                        onChange={e => handleUpdateItem(activeItem.id, { unit: e.target.value })}
                                        placeholder="e.g. °C, PSI, RPM, %"
                                        className="bg-slate-900 border-slate-800 text-xs font-mono h-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Min/Max Labels */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Custom Dial Labels
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black uppercase text-rose-400">Min Label (0%)</Label>
                                    <Input
                                        value={activeItem.minLabel ?? activeItem.leftLabel ?? ""}
                                        onChange={e => handleUpdateItem(activeItem.id, { minLabel: e.target.value, leftLabel: e.target.value })}
                                        placeholder={`Default: ${minLabel}`}
                                        className="bg-slate-900 border-slate-800 text-xs font-medium"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black uppercase text-[#16A34A]">Max Label (100%)</Label>
                                    <Input
                                        value={activeItem.maxLabel ?? activeItem.rightLabel ?? ""}
                                        onChange={e => handleUpdateItem(activeItem.id, { maxLabel: e.target.value, rightLabel: e.target.value })}
                                        placeholder={`Default: ${maxLabel}`}
                                        className="bg-slate-900 border-slate-800 text-xs font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Target Rule & Target Value */}
                        <div className="space-y-3 pt-2 border-t border-slate-900">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#16A34A]">
                                Target Equilibrium Conditions
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-300">Target Rule</Label>
                                    <Select
                                        value={activeItem.operator || "="}
                                        onValueChange={val => handleUpdateItem(activeItem.id, { operator: val as any })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-800 text-xs font-bold h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <SelectItem value="=" className="font-bold">≈ Equals (~pos)</SelectItem>
                                            <SelectItem value="<" className="font-bold">&lt; Less Than (&lt;pos)</SelectItem>
                                            <SelectItem value="<=" className="font-bold">≤ Less or Equal (≤pos)</SelectItem>
                                            <SelectItem value=">" className="font-bold">&gt; Greater Than (&gt;pos)</SelectItem>
                                            <SelectItem value=">=" className="font-bold">≥ Greater or Equal (≥pos)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase text-slate-300">Target Value</Label>
                                        <span className="text-xs font-mono font-black text-[#16A34A]">{activeItem.correctPosition}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={activeItem.correctPosition}
                                        onChange={e => handleUpdateItem(activeItem.id, { correctPosition: Number(e.target.value) })}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#16A34A] mt-2"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Explanation / Hint</Label>
                                <Input
                                    value={activeItem.explanation || ""}
                                    onChange={e => handleUpdateItem(activeItem.id, { explanation: e.target.value })}
                                    placeholder="Explanation revealed upon grading..."
                                    className="bg-slate-900 border-slate-800 text-xs font-medium"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-900 space-y-2">
                        <p className="text-xs font-bold text-slate-500">No controls configured yet.</p>
                        <Button
                            type="button"
                            onClick={handleAddItem}
                            className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs h-8 px-3 rounded-xl"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add First Control
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
