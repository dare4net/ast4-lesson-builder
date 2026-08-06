"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { InteractiveRenderer, InteractiveRenderProps } from "./base/interactive-renderer"
import type { Component } from "@/types/lesson"
import {
  playFlashcardFlipForward,
  playFlashcardFlipBack,
  playFlashcardNext,
  playFlashcardPrev,
  playFlashcardComplete
} from "@/lib/sound-effects"

interface Flashcard {
  id: string
  front: string
  back: string
}

interface FlashcardsRendererProps {
  title?: string
  cards?: Flashcard[]
  isEditing?: boolean
  mode?: 'practice' | 'live'
  state?: 'active' | 'disabled'
  disabled?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
  status?: string
}

type FlashcardsState = {
  currentCardIndex: number
  isFlipped: boolean
  status?: string
}

function FlashcardsContent({
  title,
  cards,
  state,
  setState,
  isLive,
  isDisabled: disabledProp,
  props
}: InteractiveRenderProps<FlashcardsState> & {
  title: string
  cards: Flashcard[]
  isDisabled: boolean
  isLive: boolean
  props: FlashcardsRendererProps
}) {
  const [mounted, setMounted] = useState(false)
  const { playFeedback } = useFeedback()

  const { currentCardIndex, isFlipped } = state

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentCard = cards[currentCardIndex]

  const goToNextCard = () => {
    if (disabledProp) return
    if (currentCardIndex < cards.length - 1) {
      const nextIndex = currentCardIndex + 1
      const isLastCard = nextIndex === cards.length - 1
      playFlashcardNext()
      if (isLastCard) setTimeout(() => playFlashcardComplete(), 180)
      setState(prev => ({
        ...prev,
        currentCardIndex: nextIndex,
        isFlipped: false,
        status: isLastCard ? 'completed' : prev.status
      }))
    }
  }

  const goToPreviousCard = () => {
    if (disabledProp) return
    if (currentCardIndex > 0) {
      playFlashcardPrev()
      setState(prev => ({
        ...prev,
        currentCardIndex: currentCardIndex - 1,
        isFlipped: false
      }))
    }
  }

  const flipCard = () => {
    if (disabledProp) return
    const willBeFlipped = !isFlipped
    if (willBeFlipped) {
      playFlashcardFlipForward()
    } else {
      playFlashcardFlipBack()
    }
    setState(prev => ({
      ...prev,
      isFlipped: willBeFlipped,
    }))
  }

  const onLocalRestart = () => {
    playFlashcardPrev() // Neutral rewind-style sound
    setState(prev => ({
      ...prev,
      currentCardIndex: 0,
      isFlipped: false,
      status: 'active'
    }))
  }

  if (props.isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Front</p>
            {cards.map((card) => (
              <div key={`front-${card.id}`} className="p-2 bg-muted rounded">
                {card.front}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Back</p>
            {cards.map((card) => (
              <div key={`back-${card.id}`} className="p-2 bg-muted rounded">
                {card.back}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No flashcards available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn(
      "w-full flex-1 flex flex-col bg-white overflow-hidden group/flashcards transition-all duration-300",
      disabledProp && "opacity-75"
    )}>
      {/* Inner responsive container */}
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto px-6 h-full">

        {/* Header */}
        <div className="shrink-0 relative flex items-center justify-between pt-3 pb-3">
          <div className="space-y-0.5">
            <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Flashcard Set</span>
            <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[7px] font-black border border-blue-200 uppercase tracking-widest">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>Live</span>
              </div>
            )}
            {disabledProp && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-400 rounded text-[7px] font-black uppercase tracking-widest border border-slate-200">
                <Lock className="h-2.5 w-2.5" />
                <span>Locked</span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT: Flashcard Stage */}
        <div className="flex-1 flex flex-col min-h-0 py-1">
          <div className="relative flex flex-col h-full space-y-3">
            {/* Progress indicator */}
            <div className="shrink-0 space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Study Progress</span>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">{Math.round(((currentCardIndex + 1) / cards.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-emerald-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                  style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* ── Stacked Card Stage ── */}
            <div className="flex-1 min-h-0" style={{ paddingBottom: '18px' }}>
              <div className="relative w-full h-full" style={{ perspective: '2000px' }}>

                {/* Ghost layer 2 — deepest, peeks furthest below */}
                {currentCardIndex < cards.length - 2 && (
                  <div
                    className="absolute inset-0 rounded-[2.5rem] bg-slate-200 border border-slate-300"
                    style={{ zIndex: 1, transform: 'translateY(16px) scaleX(0.92)', transformOrigin: 'bottom center' }}
                  />
                )}

                {/* Ghost layer 1 — middle, peeks slightly below */}
                {currentCardIndex < cards.length - 1 && (
                  <div
                    className="absolute inset-0 rounded-[2.5rem] bg-slate-100 border border-slate-200 shadow-sm"
                    style={{ zIndex: 2, transform: 'translateY(8px) scaleX(0.96)', transformOrigin: 'bottom center' }}
                  />
                )}

                {/* Active card */}
                <div
                  className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-700",
                    !disabledProp && "cursor-pointer"
                  )}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    zIndex: 3
                  }}
                  onClick={flipCard}
                >
                  {/* Front of card */}
                  <div
                    className="absolute inset-0 w-full h-full flex items-center justify-center p-8 border-2 bg-white rounded-[2.5rem] shadow-xl shadow-black/5"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)'
                    }}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight px-4">{currentCard.front}</div>
                      {!disabledProp && (
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">tap card to flip</div>
                      )}
                    </div>
                  </div>

                  {/* Back of card */}
                  <div
                    className="absolute inset-0 w-full h-full flex items-center justify-center p-8 border-2 border-emerald-600 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-2xl font-black text-white tracking-tight leading-tight px-4">{currentCard.back}</div>
                      {!disabledProp && (
                        <div className="text-[9px] font-bold text-white/50 uppercase tracking-[0.15em]">Got it!</div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>


          </div>
        </div>

        {/* BOTTOM SECTION: Nav Controls */}
        <div className="shrink-0 space-y-3 pb-4 pt-2">
          {/* Card counter + dots bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Card {currentCardIndex + 1} of {cards.length}
              </span>
              {state.status === 'completed' && (
                <span className="text-[9px] font-black text-[#58CC02] bg-[#58CC02]/10 border border-[#58CC02]/30 px-2 py-0.5 rounded-full uppercase tracking-wider animate-in fade-in duration-500">
                  ✓ Done
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === currentCardIndex
                      ? "w-5 h-2 bg-[#58CC02]"
                      : i < currentCardIndex
                        ? "w-2 h-2 bg-[#58CC02]/40"
                        : "w-2 h-2 bg-slate-200"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Full-width text control buttons — Previous & Next animate in when available */}
          <div className="flex gap-2.5 w-full items-stretch">
            {/* Previous — slides in from left when not on first card */}
            <div
              className={cn(
                "flex-1 overflow-hidden transition-all duration-300 ease-in-out",
                currentCardIndex > 0
                  ? "max-w-[40%] opacity-100 translate-x-0"
                  : "max-w-0 opacity-0 -translate-x-4 pointer-events-none"
              )}
            >
              <Button
                className="h-11 w-full rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-700 hover:bg-slate-200 transition-all font-black text-[10px] uppercase tracking-wider active:scale-95 disabled:opacity-40 disabled:bg-slate-100 flex items-center justify-center gap-1"
                onClick={goToPreviousCard}
                disabled={currentCardIndex === 0 || disabledProp}
              >
                <ChevronLeft className="h-4 w-4 stroke-[3]" />
                <span>Prev</span>
              </Button>
            </div>

            {/* Flip — always visible, expands to fill */}
            <Button
              className="h-11 flex-1 rounded-xl bg-emerald-600 border-2 border-emerald-700 text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/20 font-black text-[10px] uppercase tracking-wider active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              onClick={flipCard}
              disabled={disabledProp}
            >
              <RotateCw className="h-3.5 w-3.5 stroke-[3]" />
              <span>Flip Card</span>
            </Button>

            {/* Next — slides in from right when not on last card */}
            <div
              className={cn(
                "flex-1 overflow-hidden transition-all duration-300 ease-in-out",
                currentCardIndex < cards.length - 1
                  ? "max-w-[40%] opacity-100 translate-x-0"
                  : "max-w-0 opacity-0 translate-x-4 pointer-events-none"
              )}
            >
              <Button
                className="h-11 w-full rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-700 hover:bg-slate-200 transition-all font-black text-[10px] uppercase tracking-wider active:scale-95 disabled:opacity-40 disabled:bg-slate-100 flex items-center justify-center gap-1"
                onClick={goToNextCard}
                disabled={currentCardIndex === cards.length - 1 || disabledProp}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FlashcardsRenderer(props: FlashcardsRendererProps) {
  const {
    title = "Flashcards",
    cards = [],
    isEditing = false,
    mode = 'practice',
    state: componentState = 'active',
    disabled = false,
    savedState,
    setComponentState,
    id = 'flashcards-renderer',
    status
  } = props

  const component: Component = {
    id,
    type: 'flashcards',
    state: componentState as any,
    status: (status || (savedState as any)?.status || 'uncompleted') as any,
    props: { title, cards },
    mode: mode as any
  } as Component

  const initialState: FlashcardsState = {
    currentCardIndex: 0,
    isFlipped: false,
    status: 'active'
  }

  return (
    <InteractiveRenderer<FlashcardsState>
      component={component}
      initialState={initialState}
      savedState={savedState}
      setComponentState={setComponentState}
      disabled={disabled}
      onRender={(renderProps) => (
        <FlashcardsContent
          {...renderProps}
          title={title}
          cards={cards}
          isDisabled={disabled || component.state === 'disabled'}
          isLive={mode === 'live'}
          props={props}
        />
      )}
    />
  )
}
