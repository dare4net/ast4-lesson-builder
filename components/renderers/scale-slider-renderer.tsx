"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Sliders, Lock, CheckCircle2, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import type { Component } from "@/types/lesson"

interface ScaleSliderRendererProps {
    title?: string
    prompt?: string
    minLabel?: string
    maxLabel?: string
    min?: number
    max?: number
    step?: number
    defaultValue?: number
    points?: number
    isEditing?: boolean
    mode?: "practice" | "live"
    state?: "active" | "disabled"
    disabled?: boolean
    savedState?: any
    setComponentState?: (state: any) => void
    id?: string
    status?: string
}

type ScaleSliderState = {
    selectedValue: number
    isSubmitted: boolean
    score: number
    status?: string
}

function ScaleSliderContent({
    title,
    prompt,
    minLabel,
    maxLabel,
    min,
    max,
    step,
    state,
    setState,
    handlePoints,
    isLive,
    isDisabled: disabledProp,
    props
}: ScoredRenderProps<ScaleSliderState> & {
    title: string
    prompt: string
    minLabel: string
    maxLabel: string
    min: number
    max: number
    step: number
    isDisabled: boolean
    props: ScaleSliderRendererProps
}) {
    const { playFeedback } = useFeedback()
    const [mounted, setMounted] = useState(false)
    const { registerLock, unregisterLock } = useNavigationLock()
    const [hasStarted, setHasStarted] = useState(false)

    const timeLimit = (props as any).timeLimit || 15

    const {
        selectedValue,
        isSubmitted
    } = state

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const isComplete = isSubmitted || state.status === "completed"
        if (isLive && hasStarted && !isComplete) {
            registerLock(props.id || "scaleslider-renderer")
        } else {
            unregisterLock(props.id || "scaleslider-renderer")
        }
        return () => unregisterLock(props.id || "scaleslider-renderer")
    }, [isLive, hasStarted, isSubmitted, state.status, registerLock, unregisterLock, props.id])

    const handleSliderChange = (vals: number[]) => {
        if (disabledProp || isSubmitted) return
        setState(prev => ({
            ...prev,
            selectedValue: vals[0]
        }))
    }

    const handleSubmit = async () => {
        if (disabledProp || isSubmitted) return

        await playFeedback("quizSuccess")
        handlePoints(props.points || 10)

        setState(prev => ({
            ...prev,
            isSubmitted: true,
            score: props.points || 10,
            status: "completed"
        }))
    }

    const onTimeout = () => {
        if (!isSubmitted) {
            handleSubmit()
        }
    }

    if (!mounted) return null

    if (isLive && !hasStarted && !isSubmitted && state.status !== "completed") {
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                label={`Start Scale Slider (${timeLimit}s)`}
            />
        )
    }

    const percentage = ((selectedValue - min) / (max - min)) * 100

    return (
        <div className={cn(
            "w-full h-full flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 px-6 relative",
            disabledProp && "opacity-75"
        )}>
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600" />

            {/* Header */}
            <div className="shrink-0 relative flex items-center justify-between px-2 pt-3">
                <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-blue-600/70 uppercase tracking-[0.2em] flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-blue-500" /> Opinion Spectrum
                    </span>
                    <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isLive && (
                        <LiveTimer
                            isCompleted={isSubmitted || state.status === "completed"}
                            duration={timeLimit}
                            onTimeout={onTimeout}
                        />
                    )}
                    {disabledProp && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-400 rounded text-[7px] font-black uppercase tracking-widest border border-slate-200">
                            <Lock className="h-2.5 w-2.5" />
                            <span>Locked</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Center Slider Display */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-4 space-y-6">
                <div className="p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl text-center">
                    <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
                        {prompt || "Slide to indicate your rating or confidence level:"}
                    </p>
                </div>

                {/* Selected Value Badge */}
                <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 animate-in zoom-in-95">
                        <span className="text-2xl font-black">{selectedValue}</span>
                        <span className="text-xs font-bold opacity-75 ml-1">/ {max}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Rating</span>
                </div>

                {/* Slider Controls */}
                <div className="px-4 space-y-3">
                    <Slider
                        value={[selectedValue]}
                        min={min}
                        max={max}
                        step={step}
                        disabled={disabledProp || isSubmitted}
                        onValueChange={handleSliderChange}
                        className="cursor-pointer"
                    />

                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                        <span className="text-slate-500 max-w-[120px] text-left">{minLabel}</span>
                        <span className="text-blue-600 max-w-[120px] text-right">{maxLabel}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 space-y-2 px-2 pb-4 pt-1">
                {!isSubmitted ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={disabledProp}
                        className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-500/20"
                    >
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Confirm Rating ({selectedValue})
                    </Button>
                ) : (
                    <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black uppercase tracking-wider">Rating Recorded (+{props.points || 10} pts)</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export function ScaleSliderRenderer(props: ScaleSliderRendererProps) {
    const {
        title = "Scale Rating",
        prompt = "Rate your level of agreement:",
        minLabel = "Strongly Disagree",
        maxLabel = "Strongly Agree",
        min = 1,
        max = 10,
        step = 1,
        defaultValue = 5,
        points = 10,
        isEditing = false,
        mode = "practice",
        state: componentState = "active",
        disabled = false,
        savedState,
        setComponentState,
        id = "scale-slider-renderer",
        status
    } = props

    const component: Component = {
        id,
        type: "scaleSlider",
        state: componentState as any,
        status: (status || (savedState as any)?.status || "uncompleted") as any,
        props: { title, prompt, minLabel, maxLabel, min, max, step, defaultValue, points },
        mode: mode as any
    } as Component

    const initialState: ScaleSliderState = {
        selectedValue: defaultValue,
        isSubmitted: false,
        score: 0
    }

    if (isEditing) {
        return (
            <div className="border p-4 rounded-xl bg-slate-50 space-y-2">
                <h4 className="font-black text-xs uppercase text-blue-600">{title}</h4>
                <p className="text-sm font-bold text-slate-800">{prompt}</p>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{minLabel} ({min})</span>
                    <span>{maxLabel} ({max})</span>
                </div>
            </div>
        )
    }

    return (
        <ScoredRenderer<ScaleSliderState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <ScaleSliderContent
                    {...renderProps}
                    title={title}
                    prompt={prompt}
                    minLabel={minLabel}
                    maxLabel={maxLabel}
                    min={min}
                    max={max}
                    step={step}
                    isDisabled={disabled || component.state === "disabled"}
                    props={props}
                />
            )}
        />
    )
}
