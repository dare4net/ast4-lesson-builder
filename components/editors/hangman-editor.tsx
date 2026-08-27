"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type HangmanTheme = "mascot" | "classic" | "spaceship" | "castle" | "submarine" | "ufo" | "bomb"

interface HangmanEditorProps {
    word: string
    onWordChange: (val: string) => void
    category: string
    onCategoryChange: (val: string) => void
    clue: string
    onClueChange: (val: string) => void
    theme: HangmanTheme
    onThemeChange: (val: HangmanTheme) => void
    maxLives?: number
    onMaxLivesChange?: (val: number) => void
}

export function HangmanEditor({
    word = "",
    onWordChange,
    category = "",
    onCategoryChange,
    clue = "",
    onClueChange,
    theme = "mascot",
    onThemeChange,
    maxLives = 6,
    onMaxLivesChange,
}: HangmanEditorProps) {
    return (
        <div className="space-y-4 text-slate-200">
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Target Secret Word
                </Label>
                <Input
                    value={word}
                    onChange={e => onWordChange(e.target.value.toUpperCase())}
                    placeholder="e.g. ASTRONOMY"
                    className="bg-slate-950/60 border-slate-800 text-sm font-bold tracking-widest uppercase"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Category Header
                    </Label>
                    <Input
                        value={category}
                        onChange={e => onCategoryChange(e.target.value)}
                        placeholder="e.g. Space & Science"
                        className="bg-slate-950/60 border-slate-800 text-xs font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Max Lives (3 to 10)
                    </Label>
                    <Input
                        type="number"
                        min={3}
                        max={10}
                        value={maxLives}
                        onChange={e => onMaxLivesChange?.(Math.min(10, Math.max(3, Number(e.target.value) || 6)))}
                        className="bg-slate-950/60 border-slate-800 text-xs font-bold"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Visual Tension Theme & Figure
                </Label>
                <Select value={theme} onValueChange={val => onThemeChange(val as any)}>
                    <SelectTrigger className="bg-slate-950/60 border-slate-800 text-xs font-bold">
                        <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="mascot" className="font-bold">🤖 AST Cyber Mascot Robot (Splashscreen Figure)</SelectItem>
                        <SelectItem value="classic" className="font-bold">🎯 Classic Gallows Stick Figure</SelectItem>
                        <SelectItem value="spaceship" className="font-bold">🚀 Spaceship Rocket Launch Pad</SelectItem>
                        <SelectItem value="castle" className="font-bold">🏰 Castle Siege Fortress</SelectItem>
                        <SelectItem value="submarine" className="font-bold">🌊 Deep Sea Submarine Implosion</SelectItem>
                        <SelectItem value="ufo" className="font-bold">🛸 Alien UFO Tractor Beam</SelectItem>
                        <SelectItem value="bomb" className="font-bold">💣 Cyber Bomb Fuse Countdown</SelectItem>
                        <SelectItem value="dino" className="font-bold">🦖 T-Rex Jungle Pursuit</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Clue / Definition
                </Label>
                <Input
                    value={clue}
                    onChange={e => onClueChange(e.target.value)}
                    placeholder="e.g. The scientific study of celestial bodies"
                    className="bg-slate-950/60 border-slate-800 text-xs font-medium"
                />
            </div>
        </div>
    )
}
