"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { CheckCircle2, BarChart2, Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { InteractiveRenderer, InteractiveRenderProps } from "./base/interactive-renderer"
import { useFeedback } from "@/hooks/use-feedback"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

interface PollOption {
    id: string
    text: string
}

interface PollRendererProps {
    question: string
    options: PollOption[]
    isEditing?: boolean
    lessonId?: string
    mode?: 'practice' | 'live'
    state?: 'active' | 'disabled'
    disabled?: boolean
    savedState?: any
    setComponentState?: (state: any) => void
    id?: string
    status?: string
    // Injected by component-renderer from pollStore
    initialVotes?: Record<string, number>
    initialTotalVotes?: number
    onVote?: (optionId: string) => Promise<void>
}

type PollState = {
    selectedOption: string | null
    votes: Record<string, number>
    totalVotes: number
    hasVoted: boolean
    status?: string
}

function PollContent({
    question,
    options = [],
    state,
    setState,
    isDisabled: disabledProp,
    props
}: InteractiveRenderProps<PollState> & {
    question: string
    options: PollOption[]
    isDisabled: boolean
    props: PollRendererProps
}) {
    const [mounted, setMounted] = useState(false)
    const { playFeedback } = useFeedback()

    const { selectedOption, votes, totalVotes, hasVoted } = state

    useEffect(() => {
        setMounted(true)
    }, [])

    // Merge server-fetched votes into local state once they arrive
    useEffect(() => {
        if (!props.initialVotes || hasVoted) return
        // Seed display votes from the server snapshot (don't mark as voted)
        setState(prev => ({
            ...prev,
            votes: props.initialVotes!,
            totalVotes: props.initialTotalVotes || 0,
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.initialVotes, props.initialTotalVotes])

    const handleVote = async (optionId: string) => {
        if (disabledProp || hasVoted) return

        // Optimistically update local state immediately
        const optimisticVotes = { ...votes, [optionId]: (votes[optionId] || 0) + 1 }
        const optimisticTotal = totalVotes + 1

        setState(prev => ({
            ...prev,
            selectedOption: optionId,
            hasVoted: true,
            votes: optimisticVotes,
            totalVotes: optimisticTotal,
            status: 'completed'
        }))

        void playFeedback("dngClick", { sound: true, animation: false })

        // POST vote to server
        if (props.onVote) {
            try {
                await props.onVote(optionId)
                // On success the parent pollStore updates pollData, but since this
                // component already marked hasVoted=true, the server counts will be
                // reflected next time via initialVotes (next lesson session).
            } catch {
                // Vote was optimistically counted locally — acceptable fallback
            }
        }
    }

    if (!mounted) return null

    // Editing Mode
    if (props.isEditing) {
        return (
            <div className="border p-4 rounded-xl bg-white shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                    <BarChart2 className="w-5 h-5" />
                    <h3 className="font-bold text-sm">Poll Preview</h3>
                </div>
                <p className="font-bold text-slate-800 text-base">{question}</p>
                <div className="space-y-2">
                    {options.map((opt) => (
                        <div key={opt.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                            {opt.text}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "w-full flex flex-col bg-white transition-all duration-300 px-4 sm:px-6 py-4 relative rounded-2xl border border-slate-100 shadow-sm md:flex-1",
            disabledProp && "opacity-75"
        )}>
            {/* Visual Accent */}
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-2xl" />

            {/* Header */}
            <div className="shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                            <BarChart2 className="w-4 h-4" />
                        </span>
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Class Opinion Poll</span>
                    </div>
                    {hasVoted && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Voted
                        </span>
                    )}
                </div>
                <FormattedText content={question} as="h3" className="text-lg font-black text-slate-900 leading-tight" />
            </div>

            {/* Options List */}
            <div className="flex-1 space-y-3 my-4">
                {options.map((opt) => {
                    const optVotes = votes[opt.id] || 0
                    const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0
                    const isSelected = selectedOption === opt.id

                    return (
                        <button
                            key={opt.id}
                            disabled={disabledProp || hasVoted}
                            onClick={() => handleVote(opt.id)}
                            className={cn(
                                "w-full relative overflow-hidden text-left p-4 rounded-xl border-2 transition-all duration-300 group",
                                hasVoted
                                    ? isSelected
                                        ? "border-indigo-600 bg-indigo-50/20"
                                        : "border-slate-100 bg-slate-50/50"
                                    : "border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/10 active:scale-[0.99] cursor-pointer"
                            )}
                        >
                            {/* Animated Progress Bar */}
                            {hasVoted && (
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out opacity-20",
                                        isSelected ? "bg-indigo-600" : "bg-slate-400"
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            <div className="relative z-10 flex items-center justify-between">
                                <FormattedText content={opt.text} className={cn("font-bold text-sm", isSelected ? "text-indigo-950 font-black" : "text-slate-700")} />

                                {hasVoted ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-500">{optVotes} votes</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-black",
                                            isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                                        )}>
                                            {percentage}%
                                        </span>
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-indigo-500 transition-colors" />
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Footer Info */}
            <div className="shrink-0 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-400">
                <span>{totalVotes} total responses</span>
                {!hasVoted && <span className="text-indigo-400">Cast your vote above</span>}
            </div>
        </div>
    )
}

export function PollRenderer(props: PollRendererProps) {
    const {
        question = "Poll Question",
        options = [],
        mode = 'practice',
        state: componentState = 'active',
        disabled = false,
        savedState,
        setComponentState,
        id = "poll-renderer",
        status,
    } = props

    const component: Component = {
        id,
        type: 'poll',
        state: componentState as any,
        status: (status || (savedState as any)?.status || 'uncompleted') as any,
        props: { question, options },
        mode: mode as any
    } as Component

    const initialState: PollState = {
        selectedOption: savedState?.selectedOption ?? null,
        votes: savedState?.votes ?? {},
        totalVotes: savedState?.totalVotes ?? 0,
        hasVoted: savedState?.hasVoted ?? false,
        status: savedState?.status ?? 'active'
    }

    return (
        <InteractiveRenderer<PollState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            disabled={disabled}
            onRender={(renderProps) => (
                <PollContent
                    {...renderProps}
                    question={question}
                    options={options}
                    isDisabled={disabled || component.state === 'disabled'}
                    props={props}
                />
            )}
        />
    )
}
