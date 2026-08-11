"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cloud, Plus, Lock, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import type { Component } from "@/types/lesson"

interface WordCloudRendererProps {
    title?: string
    question?: string
    placeholder?: string
    maxWords?: number
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

type WordEntry = {
    word: string
    count: number
}

type WordCloudState = {
    submittedWords: string[]
    wordCounts: Record<string, number>
    isSubmitted: boolean
    score: number
    status?: string
}

const BADGE_COLORS = [
    "from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
    "from-sky-500 to-indigo-600 text-white shadow-sky-500/30",
    "from-purple-500 to-pink-600 text-white shadow-purple-500/30",
    "from-amber-500 to-orange-600 text-white shadow-amber-500/30",
    "from-rose-500 to-red-600 text-white shadow-rose-500/30",
    "from-blue-500 to-cyan-600 text-white shadow-blue-500/30",
]

function WordCloudContent({
    title,
    question,
    placeholder,
    maxWords,
    state,
    setState,
    handlePoints,
    isLive,
    isDisabled: disabledProp,
    props
}: ScoredRenderProps<WordCloudState> & {
    title: string
    question: string
    placeholder: string
    maxWords: number
    isDisabled: boolean
    props: WordCloudRendererProps
}) {
    const { playFeedback } = useFeedback()
    const [mounted, setMounted] = useState(false)
    const { registerLock, unregisterLock } = useNavigationLock()
    const [hasStarted, setHasStarted] = useState(false)
    const [inputWord, setInputWord] = useState("")

    const timeLimit = (props as any).timeLimit || 20

    const {
        submittedWords,
        wordCounts,
        isSubmitted
    } = state

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const isComplete = isSubmitted || state.status === "completed"
        if (isLive && hasStarted && !isComplete) {
            registerLock(props.id || "wordcloud-renderer")
        } else {
            unregisterLock(props.id || "wordcloud-renderer")
        }
        return () => unregisterLock(props.id || "wordcloud-renderer")
    }, [isLive, hasStarted, isSubmitted, state.status, registerLock, unregisterLock, props.id])

    const handleAddWord = async () => {
        const word = inputWord.trim()
        if (!word || disabledProp || isSubmitted) return

        const normalized = word.toLowerCase()
        const newSubmitted = [...submittedWords, word]
        const newCounts = { ...wordCounts, [normalized]: (wordCounts[normalized] || 0) + 1 }

        await playFeedback("click")
        setInputWord("")

        setState(prev => ({
            ...prev,
            submittedWords: newSubmitted,
            wordCounts: newCounts
        }))
    }

    const handleSubmitCloud = async () => {
        if (submittedWords.length === 0 || isSubmitted) return

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
        if (!isSubmitted && submittedWords.length > 0) {
            handleSubmitCloud()
        }
    }

    if (!mounted) return null

    if (isLive && !hasStarted && !isSubmitted && state.status !== "completed") {
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                label={`Start Live Word Cloud (${timeLimit}s)`}
            />
        )
    }

    const entries: WordEntry[] = Object.entries(wordCounts).map(([w, c]) => ({ word: w, count: c }))
    const maxCount = Math.max(1, ...entries.map(e => e.count))

    return (
        <div className={cn(
            "w-full h-full flex-1 flex flex-col bg-white overflow-hidden transition-all duration-300 px-6 relative",
            disabledProp && "opacity-75"
        )}>
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-rose-500" />

            {/* Header */}
            <div className="shrink-0 relative flex items-center justify-between px-2 pt-3">
                <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-purple-600/70 uppercase tracking-[0.2em] flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-purple-500" /> Live Word Cloud
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

            {/* Question Prompt & Input */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-3 space-y-3">
                <div className="p-3.5 bg-purple-50/50 border-2 border-purple-100 rounded-2xl">
                    <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
                        {question || "Type words or short key concepts to build the word cloud:"}
                    </p>
                </div>

                {/* Input Bar */}
                {!isSubmitted && (
                    <div className="flex gap-2">
                        <Input
                            value={inputWord}
                            onChange={(e) => setInputWord(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                            placeholder={placeholder || "Type a word and press Enter..."}
                            disabled={disabledProp || submittedWords.length >= maxWords}
                            className="text-xs md:text-sm font-semibold border-2 border-slate-200 focus-visible:ring-0 focus-visible:border-purple-500 rounded-xl bg-slate-50/50 h-11 px-4"
                        />
                        <Button
                            onClick={handleAddWord}
                            disabled={disabledProp || !inputWord.trim() || submittedWords.length >= maxWords}
                            className="h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </div>
                )}

                {/* Visual Word Cloud Box */}
                <div className="min-h-[160px] p-6 bg-slate-950 rounded-2xl border-2 border-slate-800 flex flex-wrap items-center justify-center gap-3 content-center shadow-inner overflow-hidden relative">
                    {entries.length === 0 ? (
                        <div className="text-center space-y-1 py-6">
                            <Sparkles className="w-6 h-6 text-purple-400 mx-auto animate-pulse" />
                            <p className="text-xs font-bold text-slate-400">Word Cloud Canvas Empty</p>
                            <p className="text-[10px] text-slate-600">Type words above to generate the live cloud</p>
                        </div>
                    ) : (
                        entries.map((entry, idx) => {
                            const scale = 0.8 + (entry.count / maxCount) * 0.8
                            const colorClass = BADGE_COLORS[idx % BADGE_COLORS.length]

                            return (
                                <span
                                    key={entry.word}
                                    style={{ transform: `scale(${scale})` }}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider shadow-lg bg-gradient-to-r transition-all duration-300 animate-in zoom-in-75",
                                        colorClass
                                    )}
                                >
                                    {entry.word} {entry.count > 1 && <span className="opacity-75 text-[10px]">({entry.count})</span>}
                                </span>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="shrink-0 space-y-2 px-2 pb-4 pt-1">
                {!isSubmitted ? (
                    <Button
                        onClick={handleSubmitCloud}
                        disabled={disabledProp || submittedWords.length === 0}
                        className="h-11 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-purple-500/20"
                    >
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Word Cloud ({submittedWords.length} words)
                    </Button>
                ) : (
                    <Button disabled className="h-11 w-full rounded-xl bg-purple-600 text-white font-black uppercase text-[10px] tracking-widest">
                        Word Cloud Submitted (+{props.points || 10} pts)
                    </Button>
                )}
            </div>
        </div>
    )
}

export function WordCloudRenderer(props: WordCloudRendererProps) {
    const {
        title = "Live Word Cloud",
        question = "What words best summarize today's topic?",
        placeholder = "Type a word...",
        maxWords = 20,
        points = 10,
        isEditing = false,
        mode = "practice",
        state: componentState = "active",
        disabled = false,
        savedState,
        setComponentState,
        id = "word-cloud-renderer",
        status
    } = props

    const component: Component = {
        id,
        type: "wordCloud",
        state: componentState as any,
        status: (status || (savedState as any)?.status || "uncompleted") as any,
        props: { title, question, placeholder, maxWords, points },
        mode: mode as any
    } as Component

    const initialState: WordCloudState = {
        submittedWords: [],
        wordCounts: {},
        isSubmitted: false,
        score: 0
    }

    if (isEditing) {
        return (
            <div className="border p-4 rounded-xl bg-slate-50 space-y-2">
                <h4 className="font-black text-xs uppercase text-purple-600">{title}</h4>
                <p className="text-sm font-bold text-slate-800">{question}</p>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Max Words: {maxWords} | Points: {points}
                </span>
            </div>
        )
    }

    return (
        <ScoredRenderer<WordCloudState>
            component={component}
            initialState={initialState}
            savedState={savedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <WordCloudContent
                    {...renderProps}
                    title={title}
                    question={question}
                    placeholder={placeholder}
                    maxWords={maxWords}
                    isDisabled={disabled || component.state === "disabled"}
                    props={props}
                />
            )}
        />
    )
}
