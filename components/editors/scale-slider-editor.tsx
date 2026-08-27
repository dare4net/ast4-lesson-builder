"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sliders } from "lucide-react"

export interface ScaleSliderEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    prompt?: string
    onPromptChange?: (val: string) => void
    minLabel?: string
    onMinLabelChange?: (val: string) => void
    maxLabel?: string
    onMaxLabelChange?: (val: string) => void
    min?: number
    onMinChange?: (val: number) => void
    max?: number
    onMaxChange?: (val: number) => void
    step?: number
    onStepChange?: (val: number) => void
    defaultValue?: number
    onDefaultValueChange?: (val: number) => void
}

const inputClass = "bg-slate-950/60 border-slate-800 focus-visible:ring-purple-500/50 h-9 text-sm font-bold placeholder:text-slate-700 rounded-xl w-full"

export function ScaleSliderEditor({
    title = "Rate Your Understanding",
    onTitleChange,
    prompt = "How confident are you with this topic?",
    onPromptChange,
    minLabel = "Not at all",
    onMinLabelChange,
    maxLabel = "Very confident",
    onMaxLabelChange,
    min = 1,
    onMinChange,
    max = 10,
    onMaxChange,
    step = 1,
    onStepChange,
    defaultValue = 5,
    onDefaultValueChange,
}: ScaleSliderEditorProps) {
    const clampedDefault = Math.min(Math.max(defaultValue, min), max)

    return (
        <div className="space-y-6 w-full min-w-0">
            {/* Title */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
                    Activity Title
                </Label>
                <Input
                    value={title}
                    onChange={e => onTitleChange?.(e.target.value)}
                    placeholder="e.g. Rate Your Understanding"
                    className={inputClass}
                />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">Slider Prompt / Question</Label>
                <WYSIWYGInput
                    value={prompt}
                    onChange={val => onPromptChange?.(val)}
                    placeholder="e.g. How well do you understand photosynthesis?"
                />
            </div>

            {/* Range Settings */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-4">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">Slider Range</Label>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Min Value</Label>
                        <Input
                            type="number"
                            value={min}
                            onChange={e => onMinChange?.(Number(e.target.value))}
                            className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Max Value</Label>
                        <Input
                            type="number"
                            value={max}
                            onChange={e => onMaxChange?.(Number(e.target.value))}
                            className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Step</Label>
                        <Input
                            type="number"
                            value={step}
                            onChange={e => onStepChange?.(Number(e.target.value))}
                            min={0.1}
                            className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Default Value</Label>
                        <Input
                            type="number"
                            value={defaultValue}
                            onChange={e => onDefaultValueChange?.(Number(e.target.value))}
                            min={min}
                            max={max}
                            className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full"
                        />
                    </div>
                </div>

                {/* Live preview*/}
                <div className="space-y-2 pt-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Default Position Preview</Label>
                    <Slider
                        value={[clampedDefault]}
                        min={min}
                        max={max}
                        step={step}
                        onValueChange={([v]) => onDefaultValueChange?.(v)}
                        className="w-full"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>{min}</span>
                        <span className="text-purple-400 font-black">{clampedDefault}</span>
                        <span>{max}</span>
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">End Labels</Label>
                <div className="space-y-2">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Left / Min Label</Label>
                        <Input
                            value={minLabel}
                            onChange={e => onMinLabelChange?.(e.target.value)}
                            placeholder="e.g. Not at all"
                            className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Right / Max Label</Label>
                        <Input
                            value={maxLabel}
                            onChange={e => onMaxLabelChange?.(e.target.value)}
                            placeholder="e.g. Very confident"
                            className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
