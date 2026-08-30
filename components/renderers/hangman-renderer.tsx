"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Rocket, Shield, Heart, HelpCircle, RefreshCw, CheckCircle2, XCircle, Tag, Bot, Anchor, Radio, Flame } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"
import type { HangmanTheme } from "@/components/editors/hangman-editor"

export interface HangmanRendererProps {
    id?: string
    title?: string
    secretWord?: string
    word?: string
    targetWord?: string
    answer?: string
    category?: string
    clue?: string
    hint?: string
    maxAttempts?: number
    maxLives?: number
    theme?: HangmanTheme
    points?: number
    mode?: "practice" | "live"
    savedState?: HangmanState
    setComponentState?: (state: HangmanState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

export type HangmanState = {
    guessedLetters: string[]
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

function VisualTensionStage({ wrongCount, maxAttempts, theme }: { wrongCount: number; maxAttempts: number; theme: string }) {
    const progress = Math.min(1, wrongCount / Math.max(1, maxAttempts))
    const stage = Math.floor(progress * 6)
    const isGameOver = wrongCount >= maxAttempts

    return (
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 bg-slate-950/90 rounded-2xl border-2 border-slate-800 shadow-2xl flex items-center justify-center p-3 overflow-hidden shrink-0">
            {/* Cyber grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-30" />

            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
                {/* THEME 1: AST Cyber Mascot Robot Eye (Splashscreen Figure) */}
                {theme === "mascot" && (
                    <g>
                        {/* Base Grid Platform */}
                        <line x1="20" y1="180" x2="180" y2="180" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

                        {/* Outer Cyber Eye Box Frame */}
                        <rect x="50" y="40" width="100" height="100" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="4" />

                        {/* Stage 1: Blue Top-Left Tile */}
                        {stage >= 1 && (
                            <rect x="54" y="44" width="44" height="44" rx="4" fill="#4FA8DE" className="animate-in zoom-in-50 duration-300" />
                        )}

                        {/* Stage 2: Green Top-Right Tile */}
                        {stage >= 2 && (
                            <rect x="102" y="44" width="44" height="44" rx="4" fill="#6DBE45" className="animate-in zoom-in-50 duration-300" />
                        )}

                        {/* Stage 3: Purple Bottom-Left Tile */}
                        {stage >= 3 && (
                            <rect x="54" y="92" width="44" height="44" rx="4" fill="#35408C" className="animate-in zoom-in-50 duration-300" />
                        )}

                        {/* Stage 4: Red Bottom-Right Tile */}
                        {stage >= 4 && (
                            <rect x="102" y="92" width="44" height="44" rx="4" fill="#E85B3A" className="animate-in zoom-in-50 duration-300" />
                        )}

                        {/* Stage 5: Eye Socket & Center Pupil */}
                        {stage >= 5 && (
                            <g className="animate-in zoom-in-50 duration-300">
                                <circle cx="100" cy="92" r="22" fill="#ffffff" stroke="#000000" strokeWidth="4" />
                                <circle cx="100" cy="92" r="10" fill={isGameOver ? "#FF4B4B" : "#000000"} />
                                {isGameOver && (
                                    <line x1="94" y1="86" x2="106" y2="98" stroke="#ffffff" strokeWidth="3" />
                                )}
                            </g>
                        )}

                        {/* Stage 6: Antenna Stalk & Warning Red Orb */}
                        {stage >= 6 && (
                            <g className="animate-in fade-in duration-300">
                                <line x1="100" y1="40" x2="100" y2="16" stroke="#ffffff" strokeWidth="4" />
                                <circle cx="100" cy="10" r="8" fill="#D94A3D" stroke="#000000" strokeWidth="3" className="animate-pulse" />
                            </g>
                        )}
                    </g>
                )}

                {/* THEME 2: Classic Gallows Stick Figure */}
                {theme === "classic" && (
                    <g>
                        <line x1="20" y1="180" x2="180" y2="180" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                        {stage >= 1 && <line x1="50" y1="180" x2="50" y2="20" stroke="#1CB0F6" strokeWidth="4" strokeLinecap="round" />}
                        {stage >= 2 && (
                            <g>
                                <line x1="50" y1="20" x2="140" y2="20" stroke="#1CB0F6" strokeWidth="4" strokeLinecap="round" />
                                <line x1="50" y1="50" x2="80" y2="20" stroke="#1CB0F6" strokeWidth="3" />
                            </g>
                        )}
                        {stage >= 3 && <line x1="140" y1="20" x2="140" y2="50" stroke="#F59E0B" strokeWidth="3" strokeDasharray="3 3" />}
                        {stage >= 4 && (
                            <g>
                                <circle cx="140" cy="65" r="15" stroke="#FF4B4B" strokeWidth="3" fill="#0f172a" />
                                {isGameOver ? (
                                    <>
                                        <line x1="133" y1="60" x2="139" y2="66" stroke="#FF4B4B" strokeWidth="2" />
                                        <line x1="139" y1="60" x2="133" y2="66" stroke="#FF4B4B" strokeWidth="2" />
                                        <line x1="141" y1="60" x2="147" y2="66" stroke="#FF4B4B" strokeWidth="2" />
                                        <line x1="147" y1="60" x2="141" y2="66" stroke="#FF4B4B" strokeWidth="2" />
                                    </>
                                ) : (
                                    <>
                                        <circle cx="135" cy="63" r="2" fill="#1CB0F6" />
                                        <circle cx="145" cy="63" r="2" fill="#1CB0F6" />
                                    </>
                                )}
                            </g>
                        )}
                        {stage >= 5 && (
                            <g>
                                <line x1="140" y1="80" x2="140" y2="125" stroke="#FF4B4B" strokeWidth="3.5" strokeLinecap="round" />
                                <line x1="140" y1="90" x2="120" y2="110" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" />
                                <line x1="140" y1="90" x2="160" y2="110" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" />
                            </g>
                        )}
                        {stage >= 6 && (
                            <g>
                                <line x1="140" y1="125" x2="122" y2="155" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" />
                                <line x1="140" y1="125" x2="158" y2="155" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" />
                            </g>
                        )}
                    </g>
                )}

                {/* THEME 3: Spaceship Rocket Launch Pad */}
                {theme === "spaceship" && (
                    <g>
                        <line x1="30" y1="175" x2="170" y2="175" stroke="#475569" strokeWidth="4" />
                        <rect x="85" y="60" width="30" height="90" rx="15" fill="#0f172a" stroke="#1CB0F6" strokeWidth="3" />
                        {stage >= 1 && <path d="M 85 60 Q 100 25 115 60 Z" fill="#1CB0F6" />}
                        {stage >= 2 && <rect x="70" y="90" width="15" height="50" rx="4" fill="#38BDF8" />}
                        {stage >= 3 && <rect x="115" y="90" width="15" height="50" rx="4" fill="#38BDF8" />}
                        {stage >= 4 && <line x1="50" y1="40" x2="50" y2="175" stroke="#64748B" strokeWidth="4" />}
                        {stage >= 5 && <line x1="50" y1="70" x2="85" y2="70" stroke="#F59E0B" strokeWidth="3" />}
                        {stage >= 6 && (
                            <polygon points="90,150 100,185 110,150" fill="#FF4B4B" className="animate-pulse" />
                        )}
                    </g>
                )}

                {/* THEME 4: Castle Siege Fortress */}
                {theme === "castle" && (
                    <g>
                        <line x1="20" y1="170" x2="180" y2="170" stroke="#475569" strokeWidth="4" />
                        <rect x="40" y="90" width="120" height="80" fill="#1E293B" stroke="#9333EA" strokeWidth="3" />
                        {stage >= 1 && <rect x="40" y="70" width="25" height="20" fill="#A855F7" />}
                        {stage >= 2 && <rect x="87" y="70" width="25" height="20" fill="#A855F7" />}
                        {stage >= 3 && <rect x="135" y="70" width="25" height="20" fill="#A855F7" />}
                        {stage >= 4 && <line x1="100" y1="70" x2="100" y2="40" stroke="#E2E8F0" strokeWidth="3" />}
                        {stage >= 5 && <polygon points="100,40 125,50 100,60" fill="#C084FC" />}
                        {stage >= 6 && <path d="M 60 110 L 90 140 M 110 100 L 140 130" stroke="#FF4B4B" strokeWidth="3" strokeDasharray="2 2" />}
                    </g>
                )}

                {/* THEME 5: Deep Sea Submarine */}
                {theme === "submarine" && (
                    <g>
                        <ellipse cx="100" cy="110" rx="65" ry="35" fill="#0F172A" stroke="#06B6D4" strokeWidth="3" />
                        {stage >= 1 && <rect x="90" y="55" width="20" height="20" fill="#0891B2" />}
                        {stage >= 2 && <line x1="100" y1="55" x2="100" y2="35" stroke="#22D3EE" strokeWidth="3" />}
                        {stage >= 3 && <circle cx="70" cy="110" r="10" fill="#22D3EE" opacity="0.6" />}
                        {stage >= 4 && <circle cx="100" cy="110" r="10" fill="#22D3EE" opacity="0.6" />}
                        {stage >= 5 && <circle cx="130" cy="110" r="10" fill="#22D3EE" opacity="0.6" />}
                        {stage >= 6 && <path d="M 70 100 L 130 120" stroke="#EF4444" strokeWidth="3" strokeDasharray="3 3" />}
                    </g>
                )}

                {/* THEME 6: Alien UFO Tractor Beam */}
                {theme === "ufo" && (
                    <g>
                        <ellipse cx="100" cy="45" rx="45" ry="16" fill="#0F172A" stroke="#10B981" strokeWidth="3" />
                        <ellipse cx="100" cy="38" rx="20" ry="12" fill="#34D399" opacity="0.7" />
                        {stage >= 1 && <polygon points="75,55 125,55 145,170 55,170" fill="#10B981" opacity="0.15" />}
                        {stage >= 2 && <polygon points="75,55 125,55 145,170 55,170" fill="#10B981" opacity="0.3" />}
                        {stage >= 3 && <circle cx="100" cy="150" r="12" fill="#34D399" />}
                        {stage >= 4 && <circle cx="100" cy="120" r="12" fill="#34D399" />}
                        {stage >= 5 && <circle cx="100" cy="90" r="12" fill="#34D399" />}
                        {stage >= 6 && <circle cx="100" cy="65" r="12" fill="#EF4444" className="animate-pulse" />}
                    </g>
                )}

                {/* THEME 7: Cyber Bomb Fuse */}
                {theme === "bomb" && (
                    <g>
                        <circle cx="100" cy="115" r="45" fill="#0F172A" stroke="#F59E0B" strokeWidth="3" />
                        <rect x="80" y="100" width="40" height="25" rx="4" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                        <text x="86" y="117" fill="#F59E0B" fontSize="12" fontWeight="900">00:{Math.max(0, maxAttempts - wrongCount).toString().padStart(2, "0")}</text>
                        {stage >= 1 && <path d="M 100 70 Q 120 40 140 50" fill="none" stroke="#D97706" strokeWidth="3" />}
                        {stage >= 2 && <circle cx="140" cy="50" r="5" fill="#EF4444" className="animate-ping" />}
                        {stage >= 3 && <path d="M 100 70 Q 120 40 130 50" fill="none" stroke="#EF4444" strokeWidth="3" />}
                        {stage >= 4 && <path d="M 100 70 Q 115 45 120 50" fill="none" stroke="#EF4444" strokeWidth="3" />}
                        {stage >= 5 && <circle cx="115" cy="55" r="8" fill="#F59E0B" className="animate-pulse" />}
                        {stage >= 6 && <polygon points="100,50 115,20 130,50 145,30 135,65" fill="#EF4444" className="animate-bounce" />}
                    </g>
                )}
            </svg>

            {/* Warning pulse overlay on high mistake count */}
            {wrongCount >= maxAttempts - 1 && (
                <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none rounded-2xl border-2 border-rose-500/50" />
            )}
        </div>
    )
}

function HangmanContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    mode,
    title,
    secretWord,
    word,
    targetWord,
    answer,
    category = "Space & Science",
    clue = "Study of celestial bodies",
    hint,
    maxAttempts = 6,
    theme = "mascot",
    points = 15,
    isEditing,
    disabled,
}: ScoredRenderProps<HangmanState> & {
    title: string
    secretWord?: string
    word?: string
    targetWord?: string
    answer?: string
    category?: string
    clue?: string
    hint?: string
    maxAttempts: number
    theme: HangmanTheme
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { playFeedback } = useFeedback()
    const rawWord = secretWord || word || targetWord || answer || "ASTRONOMY"
    const effectiveClue = clue || hint || ""
    const cleanWord = rawWord.trim().toUpperCase()
    const targetLetters = cleanWord.split("")

    const { guessedLetters, submitted } = state

    // Calculate wrong attempts
    const wrongGuesses = guessedLetters.filter(l => !cleanWord.includes(l))
    const wrongCount = wrongGuesses.length
    const remainingAttempts = Math.max(0, maxAttempts - wrongCount)

    // Check if word is completely guessed
    const isWordGuessed = targetLetters.every(char => char === " " || guessedLetters.includes(char))

    const handleGuess = async (letter: string) => {
        if (submitted || isEditing || disabled || guessedLetters.includes(letter)) return

        const nextGuessed = [...guessedLetters, letter]
        const isHit = cleanWord.includes(letter)

        if (isHit) {
            void playFeedback("dngSuccess", { sound: true, animation: false })
        } else {
            void playFeedback("incorrect", { sound: true, animation: false })
        }

        const nextWrongCount = nextGuessed.filter(l => !cleanWord.includes(l)).length
        const nextIsGuessed = targetLetters.every(char => char === " " || nextGuessed.includes(char))
        const isGameOver = nextWrongCount >= maxAttempts || nextIsGuessed

        if (isGameOver) {
            const earnedPoints = nextIsGuessed ? points : 0
            if (nextIsGuessed) {
                await playFeedback("quizSuccess", { sound: true })
            }

            setState(prev => ({
                ...prev,
                guessedLetters: nextGuessed,
                submitted: true,
                isCorrect: nextIsGuessed,
                status: "completed",
                score: earnedPoints,
                maxScore: points,
            }))

            handlePoints(earnedPoints)
            recordAttempt(nextIsGuessed, earnedPoints, points, undefined, { wrongGuesses: nextWrongCount })
        } else {
            setState(prev => ({
                ...prev,
                guessedLetters: nextGuessed,
            }))
        }
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState({
            guessedLetters: [],
            submitted: false,
            status: "active",
        })
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-4 sm:px-8 md:px-10 py-3 space-y-3">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">
                            Word Quest • {points} Points
                        </span>
                        {category && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                <Tag className="w-3 h-3 text-[#1CB0F6]" />
                                <span>{category}</span>
                            </span>
                        )}
                    </div>
                    <FormattedText content={title} as="h3" className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight" />
                </div>

                {/* Attempts / Lives Display */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                    {theme === "mascot" && <Bot className="w-4 h-4 text-[#4FA8DE]" />}
                    {theme === "spaceship" && <Rocket className="w-4 h-4 text-[#1CB0F6]" />}
                    {theme === "castle" && <Shield className="w-4 h-4 text-purple-500" />}
                    {theme === "submarine" && <Anchor className="w-4 h-4 text-cyan-400" />}
                    {theme === "ufo" && <Radio className="w-4 h-4 text-emerald-400" />}
                    {theme === "bomb" && <Flame className="w-4 h-4 text-amber-500" />}
                    {theme === "classic" && <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />}
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {remainingAttempts} / {maxAttempts} Lives
                    </span>
                </div>
            </div>

            {/* Clue Panel */}
            {effectiveClue && (
                <div className="shrink-0 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <HelpCircle className="w-4 h-4 text-[#1CB0F6] shrink-0" />
                    <span>Clue: <FormattedText content={effectiveClue} as="span" /></span>
                </div>
            )}

            {/* Main Stage: Visual Tension SVG Stage + Letter Slots */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 my-2 min-h-0">
                {/* SVG Visual Tension Stage */}
                <VisualTensionStage wrongCount={wrongCount} maxAttempts={maxAttempts} theme={theme} />

                {/* Letter Slots Display */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-lg">
                    {targetLetters.map((char, idx) => {
                        const isSpace = char === " "
                        const isRevealed = guessedLetters.includes(char) || submitted

                        if (isSpace) {
                            return <div key={`space-${idx}`} className="w-4 sm:w-6 h-12" />
                        }

                        return (
                            <div
                                key={`char-${idx}`}
                                className={cn(
                                    "w-10 h-13 sm:w-12 sm:h-15 rounded-2xl border-2 border-b-4 flex items-center justify-center font-black text-lg sm:text-2xl shadow-sm transition-all duration-200 select-none",
                                    !isRevealed && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-transparent",
                                    isRevealed && guessedLetters.includes(char) && "bg-[#58CC02] text-white border-[#58CC02] border-b-[#3B8C00]",
                                    isRevealed && !guessedLetters.includes(char) && submitted && "bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-300"
                                )}
                            >
                                {isRevealed ? char : "_"}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Virtual A-Z Keyboard */}
            <div className="shrink-0 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    {ALPHABET.map(letter => {
                        const isGuessed = guessedLetters.includes(letter)
                        const isHit = isGuessed && cleanWord.includes(letter)
                        const isMiss = isGuessed && !cleanWord.includes(letter)

                        return (
                            <button
                                key={letter}
                                type="button"
                                onClick={() => handleGuess(letter)}
                                disabled={isGuessed || submitted || isEditing || disabled}
                                className={cn(
                                    "w-8 h-10 sm:w-10 sm:h-12 rounded-xl font-black text-sm sm:text-base border-2 border-b-4 transition-all duration-150 shadow-sm cursor-pointer select-none",
                                    !isGuessed && "bg-white dark:bg-slate-800 hover:bg-[#1CB0F6]/10 border-slate-200 dark:border-slate-700 hover:border-[#1CB0F6] text-slate-800 dark:text-slate-100 active:border-b-2 active:translate-y-[2px]",
                                    isHit && "bg-[#58CC02] border-[#58CC02] border-b-[#3B8C00] text-white cursor-default",
                                    isMiss && "bg-rose-500/20 border-rose-400 text-rose-500 border-b-rose-500 line-through opacity-40 cursor-default"
                                )}
                            >
                                {letter}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Footer Controls */}
            <div className="shrink-0 min-h-[56px] flex items-center justify-between pt-3">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {submitted ? (
                        <span>
                            {state.isCorrect ? "Victory! You unlocked the word!" : `Game Over! The secret word was "${cleanWord}".`}
                        </span>
                    ) : (
                        <span>Tap letters on the keyboard to guess the secret word.</span>
                    )}
                </div>

                {submitted && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-b-4 border-slate-200 dark:border-slate-700 text-xs font-extrabold uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Try Again</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export function HangmanRenderer({
    id = "hangman-component",
    title = "Secret Word Quest",
    secretWord,
    word,
    targetWord,
    answer,
    category = "Space & Science",
    clue,
    hint,
    maxAttempts,
    maxLives,
    theme = "mascot",
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: HangmanRendererProps) {
    const effectiveWord = secretWord || word || targetWord || answer || "ASTRONOMY"
    const effectiveClue = clue || hint || "Study of celestial bodies"
    const effectiveMaxAttempts = maxLives || maxAttempts || 6

    const component: Component = {
        id,
        type: "hangman",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, secretWord: effectiveWord, category, clue: effectiveClue, points, maxLives: effectiveMaxAttempts, theme },
        mode: mode as any,
    } as Component

    const initialState: HangmanState = {
        guessedLetters: [],
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
        <ScoredRenderer<HangmanState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={renderProps => (
                <HangmanContent
                    {...renderProps}
                    title={title}
                    secretWord={effectiveWord}
                    word={word}
                    targetWord={targetWord}
                    answer={answer}
                    category={category}
                    clue={effectiveClue}
                    hint={hint}
                    maxAttempts={effectiveMaxAttempts}
                    theme={theme}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
