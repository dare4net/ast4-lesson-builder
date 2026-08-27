"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
    Sliders,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Activity,
    Gauge,
    Zap,
    Plus,
    Minus,
    RotateCw,
    Radio,
    Thermometer,
    Volume2,
    Wind,
    Shield,
    Flame,
    Droplets,
} from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import type { Component } from "@/types/lesson"

export type ControlType = "slider" | "knob" | "stepper" | "toggle"
export type ColSpan = "1" | "2" | "3" | "full"

export interface SpectrumItem {
    id: string
    label: string
    correctPosition: number // 0 to 100 percentage along scale
    operator?: "=" | "<" | "<=" | ">" | ">="
    tolerance?: number // Allowed margin of error (+/- %) for '='
    explanation?: string
    minLabel?: string
    leftLabel?: string
    maxLabel?: string
    rightLabel?: string
    controlType?: ControlType
    unit?: string
    colSpan?: ColSpan
    icon?: string
}

export interface SpectrumSorterRendererProps {
    id?: string
    title?: string
    leftLabel?: string
    minLabel?: string
    rightLabel?: string
    maxLabel?: string
    scaleMin?: number
    scaleMax?: number
    showScale?: boolean
    items?: SpectrumItem[]
    points?: number
    mode?: "practice" | "live"
    savedState?: SpectrumSorterState
    setComponentState?: (state: SpectrumSorterState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

export type SpectrumSorterState = {
    /** Item ID -> User percentage position 0-100 */
    positions: Record<string, number>
    activeItemId: string | null
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

export const CONTROL_ICON_OPTIONS = [
    { value: "thermometer", label: "🌡️ Thermometer (Temp)", icon: Thermometer },
    { value: "gauge", label: "⏱️ Gauge (Pressure)", icon: Gauge },
    { value: "zap", label: "⚡ Zap (Power/Voltage)", icon: Zap },
    { value: "activity", label: "📈 Activity (Frequency)", icon: Activity },
    { value: "droplets", label: "💧 Droplets (Fluid/Liquid)", icon: Droplets },
    { value: "shield", label: "🛡️ Shield (Defense/Plasma)", icon: Shield },
    { value: "flame", label: "🔥 Flame (Combustion)", icon: Flame },
    { value: "wind", label: "💨 Wind (Air Flow)", icon: Wind },
    { value: "rotate-cw", label: "🔄 Rotary Knob", icon: RotateCw },
    { value: "volume-2", label: "🔊 Volume Sound", icon: Volume2 },
    { value: "radio", label: "📻 Radio Frequency", icon: Radio },
    { value: "sliders", label: "🎚️ Slider Level", icon: Sliders },
]

function RenderItemIcon({ iconName, fallbackType, className }: { iconName?: string; fallbackType?: ControlType; className?: string }) {
    const cls = className || "w-4 h-4 text-[#0284C7]"
    if (iconName === "thermometer") return <Thermometer className={cls} />
    if (iconName === "gauge") return <Gauge className={cls} />
    if (iconName === "zap") return <Zap className={cls} />
    if (iconName === "activity") return <Activity className={cls} />
    if (iconName === "rotate-cw") return <RotateCw className={cls} />
    if (iconName === "volume-2") return <Volume2 className={cls} />
    if (iconName === "wind") return <Wind className={cls} />
    if (iconName === "radio") return <Radio className={cls} />
    if (iconName === "shield") return <Shield className={cls} />
    if (iconName === "flame") return <Flame className={cls} />
    if (iconName === "droplets") return <Droplets className={cls} />
    if (iconName === "sliders") return <Sliders className={cls} />

    if (fallbackType === "knob") return <RotateCw className={cls} />
    if (fallbackType === "stepper") return <Zap className={cls} />
    if (fallbackType === "toggle") return <Radio className={cls} />
    return <Sliders className={cls} />
}

const DEFAULT_ITEMS: SpectrumItem[] = [
    { id: "i1", label: "Core Temperature", controlType: "knob", icon: "thermometer", unit: "°C", colSpan: "1", minLabel: "100°C", maxLabel: "900°C", correctPosition: 45, operator: "=", tolerance: 8, explanation: "Equilibrium at 450°C" },
    { id: "i2", label: "Coolant Flow Rate", controlType: "knob", icon: "droplets", unit: "L/s", colSpan: "1", minLabel: "0 L/s", maxLabel: "200 L/s", correctPosition: 80, operator: "=", tolerance: 5, explanation: "Locked at 160 L/s" },
    { id: "i3", label: "Shield Resonance", controlType: "knob", icon: "shield", unit: "GHz", colSpan: "1", minLabel: "1 GHz", maxLabel: "10 GHz", correctPosition: 30, operator: "=", tolerance: 10, explanation: "Balanced at 3.0 GHz" },
    { id: "i4", label: "Main Hydro Pressure", controlType: "slider", icon: "gauge", unit: "PSI", colSpan: "3", minLabel: "Closed (0 PSI)", maxLabel: "Max (100 PSI)", correctPosition: 70, operator: ">=", explanation: "Sustained pressure >= 70 PSI" },
]

function checkItemAccuracy(userPos: number, item: SpectrumItem): boolean {
    const op = item.operator || "="
    const target = item.correctPosition
    const tol = item.tolerance ?? 8

    switch (op) {
        case "=":
            return Math.abs(userPos - target) <= tol
        case "<":
            return userPos < target
        case "<=":
            return userPos <= target
        case ">":
            return userPos > target
        case ">=":
            return userPos >= target
        default:
            return Math.abs(userPos - target) <= tol
    }
}

function calculateItemProximityScore(userPos: number, item: SpectrumItem): number {
    const target = item.correctPosition
    const op = item.operator || "="
    const tol = item.tolerance ?? 8

    switch (op) {
        case "=": {
            const diff = Math.abs(userPos - target)
            if (diff <= tol) return 100
            const maxDiff = Math.max(target, 100 - target) || 1
            return Math.max(0, Math.round(100 - ((diff - tol) / maxDiff) * 100))
        }
        case "<":
        case "<=": {
            if (userPos <= target) return 100
            const diff = userPos - target
            const maxDiff = 100 - target || 1
            return Math.max(0, Math.round(100 - (diff / maxDiff) * 100))
        }
        case ">":
        case ">=": {
            if (userPos >= target) return 100
            const diff = target - userPos
            const maxDiff = target || 1
            return Math.max(0, Math.round(100 - (diff / maxDiff) * 100))
        }
        default:
            return Math.max(0, 100 - Math.abs(userPos - target))
    }
}

function getOperatorDisplay(item: SpectrumItem): string {
    const op = item.operator || "="
    const unit = item.unit || "%"
    if (op === "=") return `~${item.correctPosition}${unit}`
    return `${op} ${item.correctPosition}${unit}`
}

/* =========================================================
   WHITE LIGHT NEUMORPHIC (SOFT UI) WIDGETS
   ========================================================= */

function WhiteNeumorphicKnobWidget({
    value,
    onChange,
    disabled,
    minLabel,
    maxLabel,
    unit = "%",
}: {
    value: number
    onChange: (val: number) => void
    disabled?: boolean
    minLabel: string
    maxLabel: string
    unit?: string
}) {
    const angle = -135 + (value / 100) * 270
    const isDraggingRef = React.useRef(false)

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return
        isDraggingRef.current = true
        try {
            e.currentTarget.setPointerCapture(e.pointerId)
        } catch (_) { }
        updateValueFromPointer(e.clientX, e.clientY, e.currentTarget)
    }

    const updateValueFromPointer = (clientX: number, clientY: number, target: HTMLDivElement) => {
        const rect = target.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = clientX - centerX
        const dy = clientY - centerY

        // Ignore dead-center clicks/drags (less than 8px from center)
        if (Math.sqrt(dx * dx + dy * dy) < 8) return

        // Angle in degrees from top (0° = 12 o'clock position)
        let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90
        if (deg > 180) deg -= 360
        if (deg < -180) deg += 360

        // Clamp to dial range (-135° to +135°)
        let norm = deg
        if (deg > 135) {
            norm = 135
        } else if (deg < -135) {
            norm = -135
        }

        let pct = Math.round(((norm + 135) / 270) * 100)
        pct = Math.max(0, Math.min(100, pct))
        onChange(pct)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || !isDraggingRef.current) return
        updateValueFromPointer(e.clientX, e.clientY, e.currentTarget)
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        isDraggingRef.current = false
        try {
            e.currentTarget.releasePointerCapture(e.pointerId)
        } catch (_) { }
    }

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (disabled) return
        const step = e.deltaY < 0 ? 2 : -2
        const nextVal = Math.max(0, Math.min(100, value + step))
        onChange(nextVal)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault()
            onChange(Math.min(100, value + 1))
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault()
            onChange(Math.max(0, value - 1))
        }
    }

    return (
        <div className="flex flex-col items-center justify-between p-2.5 rounded-2xl bg-[#F8FAFC] shadow-[inset_-3px_-3px_7px_#FFFFFF,inset_3px_3px_8px_rgba(148,163,184,0.35)] border border-white/80 space-y-2 h-[110px]">
            {/* Compact Neumorphic Sunken Knob Ring Channel */}
            <div
                tabIndex={disabled ? -1 : 0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                title="Rotate dial, scroll wheel, or use arrow keys"
                className={cn(
                    "relative w-16 h-16 rounded-full bg-[#E2E8F0] shadow-[inset_-3px_-3px_8px_#FFFFFF,inset_4px_4px_10px_rgba(148,163,184,0.5)] border border-slate-300 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none focus:outline-none focus:ring-2 focus:ring-[#0284C7]",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {/* Dial Arc Track */}
                <svg className="absolute inset-0 w-full h-full p-1" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#CBD5E1" strokeWidth="7" strokeDasharray="210 270" strokeDashoffset="-30" />
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="7"
                        strokeDasharray={`${(value / 100) * 188} 270`}
                        strokeDashoffset="-30"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Extruded Dial Cap */}
                <div
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFFFFF] to-[#F1F5F9] shadow-[-4px_-4px_8px_#FFFFFF,4px_4px_10px_rgba(148,163,184,0.45)] border border-white relative flex items-center justify-center transition-transform duration-75 pointer-events-none"
                    style={{ transform: `rotate(${angle}deg)` }}
                >
                    <div className="w-8 h-8 rounded-full border border-slate-200 shadow-inner flex items-center justify-center">
                        <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-[#0284C7] shadow-[0_0_6px_#0284C7]" />
                    </div>
                </div>
            </div>

            {/* Readout Display */}
            <div className="flex items-center justify-between w-full text-[9px] font-black uppercase text-slate-500 px-1">
                <span className="text-rose-600 truncate max-w-[70px]">{minLabel}</span>
                <span className="text-[11px] font-mono font-black text-[#0284C7] bg-[#E2E8F0] px-2 py-0.5 rounded-md border border-slate-300 shadow-inner">
                    {value}{unit}
                </span>
                <span className="text-[#16A34A] truncate max-w-[70px] text-right">{maxLabel}</span>
            </div>
        </div>
    )
}

function WhiteNeumorphicStepperWidget({
    value,
    onChange,
    disabled,
    minLabel,
    maxLabel,
    unit = "%",
}: {
    value: number
    onChange: (val: number) => void
    disabled?: boolean
    minLabel: string
    maxLabel: string
    unit?: string
}) {
    return (
        <div className="flex flex-col justify-between p-2.5 rounded-2xl bg-[#F8FAFC] shadow-[inset_-3px_-3px_7px_#FFFFFF,inset_3px_3px_8px_rgba(148,163,184,0.35)] border border-white/80 h-[110px]">
            {/* Top Labels */}
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-500 px-1">
                <span className="text-rose-600 truncate max-w-[48%]">← {minLabel}</span>
                <span className="text-[#16A34A] truncate max-w-[48%] text-right">{maxLabel} →</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(0, value - 5))}
                    disabled={disabled || value <= 0}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFFFFF] to-[#F1F5F9] shadow-[-3px_-3px_6px_#FFFFFF,3px_3px_8px_rgba(148,163,184,0.4)] active:shadow-[inset_-2px_-2px_4px_#FFFFFF,inset_2px_2px_5px_rgba(148,163,184,0.5)] disabled:opacity-40 text-slate-700 font-black flex items-center justify-center border border-white shrink-0 cursor-pointer"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Sunken LCD Screen */}
                <div className="flex-1 h-9 rounded-xl bg-[#E2E8F0] shadow-[inset_-3px_-3px_6px_#FFFFFF,inset_3px_3px_8px_rgba(148,163,184,0.5)] border border-slate-300 flex items-center justify-center font-mono font-black text-xs text-[#16A34A] min-w-0">
                    {value}{unit}
                </div>

                <button
                    type="button"
                    onClick={() => onChange(Math.min(100, value + 5))}
                    disabled={disabled || value >= 100}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFFFFF] to-[#F1F5F9] shadow-[-3px_-3px_6px_#FFFFFF,3px_3px_8px_rgba(148,163,184,0.4)] active:shadow-[inset_-2px_-2px_4px_#FFFFFF,inset_2px_2px_5px_rgba(148,163,184,0.5)] disabled:opacity-40 text-slate-700 font-black flex items-center justify-center border border-white shrink-0 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

function WhiteNeumorphicToggleWidget({
    value,
    onChange,
    disabled,
    minLabel,
    maxLabel,
}: {
    value: number
    onChange: (val: number) => void
    disabled?: boolean
    minLabel: string
    maxLabel: string
}) {
    const isHigh = value >= 50
    return (
        <div className="flex flex-col justify-between p-2.5 rounded-2xl bg-[#F8FAFC] shadow-[inset_-3px_-3px_7px_#FFFFFF,inset_3px_3px_8px_rgba(148,163,184,0.35)] border border-white/80 h-[110px]">
            {/* Top Labels */}
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-500 px-1">
                <span className={cn("truncate max-w-[48%]", !isHigh ? "text-rose-600" : "text-slate-400")}>← {minLabel}</span>
                <span className={cn("truncate max-w-[48%] text-right", isHigh ? "text-[#16A34A]" : "text-slate-400")}>{maxLabel} →</span>
            </div>

            {/* Switch Control */}
            <div className="flex items-center justify-center py-1">
                <button
                    type="button"
                    onClick={() => onChange(isHigh ? 0 : 100)}
                    disabled={disabled}
                    className={cn(
                        "relative w-20 h-9 rounded-full p-1 bg-[#E2E8F0] shadow-[inset_-3px_-3px_6px_#FFFFFF,inset_3px_3px_8px_rgba(148,163,184,0.5)] border border-slate-300 transition-all cursor-pointer",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <div
                        className={cn(
                            "w-7 h-7 rounded-full bg-gradient-to-br from-[#FFFFFF] to-[#F1F5F9] shadow-[-3px_-3px_6px_#FFFFFF,3px_3px_8px_rgba(148,163,184,0.45)] border border-white transition-transform duration-300 flex items-center justify-center",
                            isHigh ? "translate-x-10" : "translate-x-0"
                        )}
                    >
                        <div className={cn("w-2 h-2 rounded-full shadow-[0_0_6px]", isHigh ? "bg-[#16A34A] shadow-[#16A34A]" : "bg-rose-600 shadow-rose-600")} />
                    </div>
                </button>
            </div>
        </div>
    )
}

function WhiteNeumorphicSliderWidget({
    value,
    onChange,
    disabled,
    minLabel,
    maxLabel,
}: {
    value: number
    onChange: (val: number) => void
    disabled?: boolean
    minLabel: string
    maxLabel: string
}) {
    return (
        <div className="flex flex-col justify-between p-2.5 rounded-2xl bg-[#F8FAFC] shadow-[inset_-3px_-3px_7px_#FFFFFF,inset_3px_3px_8px_rgba(148,163,184,0.35)] border border-white/80 h-[110px]">
            {/* Top Labels */}
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider px-1">
                <span className="text-rose-600 truncate max-w-[48%]">← {minLabel}</span>
                <span className="text-[#16A34A] truncate max-w-[48%] text-right">{maxLabel} →</span>
            </div>

            {/* Slider Control */}
            <div className="relative flex items-center py-2 px-1">
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    disabled={disabled}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-[#E2E8F0] shadow-[inset_-2px_-2px_5px_#FFFFFF,inset_3px_3px_7px_rgba(148,163,184,0.5)] accent-[#0284C7]"
                />
            </div>
        </div>
    )
}

function SpectrumSorterContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    mode,
    title,
    leftLabel,
    minLabel,
    rightLabel,
    maxLabel,
    items = DEFAULT_ITEMS,
    points = 15,
    isEditing,
    disabled,
}: ScoredRenderProps<SpectrumSorterState> & {
    title: string
    leftLabel?: string
    minLabel?: string
    rightLabel?: string
    maxLabel?: string
    items: SpectrumItem[]
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { playFeedback } = useFeedback()
    const { positions, submitted } = state
    const globalMinLabel = minLabel || leftLabel || "Low (0%)"
    const globalMaxLabel = maxLabel || rightLabel || "High (100%)"

    // Calculate live real-time system stability % from continuous proximity scores
    let totalProximity = 0
    let totalAccurate = 0
    items.forEach(item => {
        const userPos = positions[item.id] ?? 50
        totalProximity += calculateItemProximityScore(userPos, item)
        if (checkItemAccuracy(userPos, item)) totalAccurate++
    })
    const stabilityPercentage = Math.round(totalProximity / Math.max(items.length, 1))
    const isSystemStabilized = totalAccurate === items.length || stabilityPercentage === 100

    const handleSliderChange = (itemId: string, value: number) => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({
            ...prev,
            positions: { ...prev.positions, [itemId]: value },
            activeItemId: itemId,
        }))
        void playFeedback("click", { sound: true, animation: false })
    }

    const handleCheckAnswers = async () => {
        if (submitted || isEditing || disabled) return

        let correctCount = 0
        items.forEach(item => {
            const userPos = positions[item.id] ?? 50
            if (checkItemAccuracy(userPos, item)) {
                correctCount++
            }
        })

        const isAllCorrect = correctCount === items.length
        const earnedPoints = Math.round((correctCount / Math.max(items.length, 1)) * points)

        if (isAllCorrect) {
            await playFeedback("quizSuccess", { sound: true })
        } else {
            await playFeedback("incorrect", { sound: true })
        }

        setState(prev => ({
            ...prev,
            submitted: true,
            isCorrect: isAllCorrect,
            status: "completed",
            score: earnedPoints,
            maxScore: points,
        }))

        handlePoints(earnedPoints)
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState({
            positions: {},
            activeItemId: null,
            submitted: false,
            status: "active",
        })
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all duration-300 px-4 sm:px-8 md:px-10 py-4 space-y-4 rounded-3xl">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 pb-3 border-b border-slate-300 dark:border-slate-800">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0284C7]">
                        System Control Deck • {points} Points
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#F8FAFC] shadow-[-4px_-4px_10px_#FFFFFF,5px_5px_12px_rgba(148,163,184,0.35)] border border-white text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Sliders className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>{items.length} Controls</span>
                </div>
            </div>

            {/* CINEMATIC SCI-FI SYSTEM TELEMETRY DISPLAY SCREEN */}
            <div className="shrink-0 p-4 rounded-3xl bg-[#090F1D] shadow-[-6px_-6px_14px_#FFFFFF,8px_8px_20px_rgba(148,163,184,0.4)] border border-slate-800 space-y-3 relative overflow-hidden">
                {/* HUD Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800/90 pb-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex items-center justify-center">
                            <span className={cn("w-2.5 h-2.5 rounded-full", isSystemStabilized ? "bg-[#16A34A] animate-ping" : "bg-[#0284C7] animate-pulse")} />
                            <span className={cn("absolute w-2 h-2 rounded-full", isSystemStabilized ? "bg-[#16A34A]" : "bg-[#0284C7]")} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                            Telemetry Frequency Monitor
                        </span>
                        <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                            {isSystemStabilized ? "SIGNAL: LOCKED • 440.0 Hz" : `NOISE: ${((100 - stabilityPercentage) * 0.32).toFixed(1)} dB`}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            System Stability:
                        </span>
                        <span
                            className={cn(
                                "text-xs font-mono font-black px-3 py-0.5 rounded-xl border shadow-lg transition-all",
                                stabilityPercentage >= 85
                                    ? "bg-emerald-500/20 text-[#16A34A] border-emerald-500/50 shadow-[#16A34A]/20"
                                    : stabilityPercentage >= 50
                                        ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-500/20"
                                        : "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-rose-500/20"
                            )}
                        >
                            {stabilityPercentage}%
                        </span>
                    </div>
                </div>

                {/* SVG Oscilloscope Monitor Screen */}
                <div className="relative h-20 bg-[#040812] shadow-[inset_-4px_-4px_10px_rgba(255,255,255,0.03),inset_5px_5px_15px_rgba(0,0,0,0.95)] rounded-2xl border border-slate-800/90 overflow-hidden flex items-center justify-center p-1">
                    {/* HUD Sci-Fi Target Corners */}
                    <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#0284C7]/60" />
                    <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#0284C7]/60" />
                    <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#0284C7]/60" />
                    <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#0284C7]/60" />

                    <svg className="w-full h-full" viewBox="0 0 400 70" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="waveGradPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0284C7" />
                                <stop offset="50%" stopColor={isSystemStabilized ? "#16A34A" : stabilityPercentage >= 75 ? "#0284C7" : "#F59E0B"} />
                                <stop offset="100%" stopColor="#16A34A" />
                            </linearGradient>
                        </defs>

                        {/* Radial Crosshair & Grid Lines */}
                        <line x1="0" y1="35" x2="400" y2="35" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="100" y1="0" x2="100" y2="70" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="200" y1="0" x2="200" y2="70" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 2" />
                        <line x1="300" y1="0" x2="300" y2="70" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Secondary Ghost Harmonic Noise Wave (Only when un-stabilized) */}
                        {!isSystemStabilized && (
                            <path
                                d={`M 0 35 Q 60 ${35 + (100 - stabilityPercentage) * 0.18}, 120 35 T 240 ${35 - (100 - stabilityPercentage) * 0.18} T 400 35`}
                                fill="none"
                                stroke="#0284C7"
                                strokeWidth="1"
                                strokeOpacity="0.3"
                                strokeDasharray="3 3"
                            />
                        )}

                        {/* Primary Waveform Signal Path */}
                        {isSystemStabilized ? (
                            <path d="M 0 35 Q 100 34.5, 200 35 T 400 35" fill="none" stroke="#16A34A" strokeWidth="3.5" className="animate-pulse" />
                        ) : (
                            <path
                                d={`M 0 35 Q 50 ${35 - (100 - stabilityPercentage) * 0.3}, 100 35 T 200 ${35 + (100 - stabilityPercentage) * 0.3} T 300 ${35 - (100 - stabilityPercentage) * 0.2} T 400 35`}
                                fill="none"
                                stroke="url(#waveGradPrimary)"
                                strokeWidth="2.5"
                            />
                        )}
                    </svg>

                    {isSystemStabilized && (
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-[11px] font-black tracking-widest text-[#16A34A] uppercase bg-[#090F1D]/90 px-4 py-1.5 rounded-xl border border-[#16A34A]/50 shadow-[0_0_20px_rgba(22,163,74,0.3)]">
                                EQUILIBRIUM ACHIEVED • STABILIZED
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* MASONRY AUTO-DENSE RESPONSIVE GRID STAGE */}
            <div className="flex-1 min-h-[220px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start grid-flow-dense">
                    {items.map(item => {
                        const currentPos = positions[item.id] ?? 50
                        const isItemCorrect = submitted && checkItemAccuracy(currentPos, item)
                        const itemMin = item.minLabel || item.leftLabel || globalMinLabel
                        const itemMax = item.maxLabel || item.rightLabel || globalMaxLabel
                        const widgetType = item.controlType || "slider"

                        // Handle colSpan styling
                        let colSpanClass = "col-span-1"
                        if (item.colSpan === "2") colSpanClass = "col-span-1 sm:col-span-2"
                        if (item.colSpan === "3" || item.colSpan === "full") colSpanClass = "col-span-1 sm:col-span-2 xl:col-span-3"

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "p-4 rounded-3xl bg-[#F8FAFC] shadow-[-8px_-8px_16px_#FFFFFF,8px_8px_18px_rgba(148,163,184,0.4)] border border-white transition-all duration-200 space-y-3",
                                    colSpanClass,
                                    submitted && isItemCorrect && "border-[#16A34A] shadow-[0_0_15px_rgba(22,163,74,0.25)]",
                                    submitted && !isItemCorrect && "border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.25)]"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-sm tracking-tight flex items-center gap-2 text-slate-800">
                                        <RenderItemIcon iconName={item.icon} fallbackType={widgetType} />
                                        {item.label}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-slate-500">
                                            {Math.round(currentPos)}{item.unit || "%"}
                                        </span>
                                        {submitted && isItemCorrect && <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />}
                                        {submitted && !isItemCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                                    </div>
                                </div>

                                {/* Render Widget Type */}
                                {widgetType === "knob" && (
                                    <WhiteNeumorphicKnobWidget
                                        value={currentPos}
                                        onChange={val => handleSliderChange(item.id, val)}
                                        disabled={submitted || isEditing || disabled}
                                        minLabel={itemMin}
                                        maxLabel={itemMax}
                                        unit={item.unit}
                                    />
                                )}

                                {widgetType === "stepper" && (
                                    <WhiteNeumorphicStepperWidget
                                        value={currentPos}
                                        onChange={val => handleSliderChange(item.id, val)}
                                        disabled={submitted || isEditing || disabled}
                                        minLabel={itemMin}
                                        maxLabel={itemMax}
                                        unit={item.unit}
                                    />
                                )}

                                {widgetType === "toggle" && (
                                    <WhiteNeumorphicToggleWidget
                                        value={currentPos}
                                        onChange={val => handleSliderChange(item.id, val)}
                                        disabled={submitted || isEditing || disabled}
                                        minLabel={itemMin}
                                        maxLabel={itemMax}
                                    />
                                )}

                                {widgetType === "slider" && (
                                    <WhiteNeumorphicSliderWidget
                                        value={currentPos}
                                        onChange={val => handleSliderChange(item.id, val)}
                                        disabled={submitted || isEditing || disabled}
                                        minLabel={itemMin}
                                        maxLabel={itemMax}
                                    />
                                )}

                                {submitted && (
                                    <p className="text-xs font-semibold text-slate-500 pt-0.5">
                                        Target rule: {getOperatorDisplay(item)} {item.explanation ? `(${item.explanation})` : ""}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer Controls */}
            <div className="shrink-0 flex items-center justify-between pt-2 border-t border-slate-300">
                <div className="text-xs font-bold text-slate-500">
                    {submitted ? (
                        <span>
                            {state.isCorrect ? "All systems locked in target equilibrium!" : "Some parameter levels were out of tolerance range."}
                        </span>
                    ) : (
                        <span>Adjust control widgets to stabilize system telemetry.</span>
                    )}
                </div>

                <div>
                    {!submitted ? (
                        <button
                            type="button"
                            onClick={handleCheckAnswers}
                            disabled={isEditing || disabled}
                            className="px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46a302] text-white border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] font-extrabold text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer shadow-md"
                        >
                            Stabilize System
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-b-4 border-slate-200 dark:border-slate-700 text-xs font-extrabold uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Recalibrate</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export function SpectrumSorterRenderer({
    id = "spectrum-sorter-component",
    title = "System Control Deck",
    leftLabel = "Low (0%)",
    rightLabel = "High (100%)",
    items = DEFAULT_ITEMS,
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: SpectrumSorterRendererProps) {
    const component: Component = {
        id,
        type: "spectrumSorter",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, leftLabel, rightLabel, items, points },
        mode: mode as any,
    } as Component

    const initialState: SpectrumSorterState = {
        positions: {},
        activeItemId: null,
        submitted: false,
        status: "active",
    }

    const mergedSavedState = savedState
        ? {
            ...initialState,
            ...savedState,
            submitted: savedState.submitted ?? savedState.status === "completed",
        }
        : undefined

    return (
        <ScoredRenderer<SpectrumSorterState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={renderProps => (
                <SpectrumSorterContent
                    {...renderProps}
                    title={title}
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                    items={items}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
