"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import type { Component } from "@/types/lesson"

interface Blank {
  id: string
  answer: string
  alternatives?: string[]
}

interface FillInTheBlankRendererProps {
  title?: string
  text: string
  blanks: Blank[]
  caseSensitive?: boolean
  points?: number
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
  mode?: 'practice' | 'live'
  state?: 'active' | 'disabled'
  disabled?: boolean
  // Persistence & Base props
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
  status?: string
}

type FillInTheBlankState = {
  userAnswers: Record<string, string>
  isSubmitted: boolean
  correctAnswers: Record<string, boolean>
  score: number
  status?: string
}

function FillInTheBlankContent({
  title,
  text,
  blanks,
  caseSensitive,
  points, // Points per blank
  state,
  setState,
  handlePoints,
  handleRetry,
  isLive,
  isDisabled: disabledProp,
  props
}: ScoredRenderProps<FillInTheBlankState> & {
  title: string
  text: string
  blanks: Blank[]
  caseSensitive: boolean
  points: number
  isDisabled: boolean
  props: FillInTheBlankRendererProps
}) {
  const { playFeedback } = useFeedback()
  const [mounted, setMounted] = useState(false)
  const { registerLock, unregisterLock } = useNavigationLock()
  const [hasStarted, setHasStarted] = useState(false)

  const timeLimit = (props as any).timeLimit || 10

  const {
    userAnswers,
    isSubmitted,
    correctAnswers,
    score
  } = state

  const parts = text.split("{{blank}}")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const isComplete = isSubmitted || state.status === 'completed'
    if (isLive && hasStarted && !isComplete) {
      registerLock(props.id || 'fitb-renderer')
    } else {
      unregisterLock(props.id || 'fitb-renderer')
    }
    return () => unregisterLock(props.id || 'fitb-renderer')
  }, [isLive, hasStarted, isSubmitted, state.status, registerLock, unregisterLock, props.id])

  // Initialize state if empty (though initial state passed to ScoredRenderer handles this, 
  // we might need to populate keys if they are missing in a "partial" save?)
  // But `initialState` in wrapper does that.

  const handleAnswerChange = (blankId: string, value: string) => {
    const effectiveDisabled = disabledProp || isSubmitted || state.status === 'completed'
    if (effectiveDisabled) return

    setState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [blankId]: value
      }
    }))
  }

  const checkAnswer = (blank: Blank, userAnswer: string): boolean => {
    if (!userAnswer) return false

    const checkAgainst = (answer: string) => {
      return caseSensitive ? userAnswer === answer : userAnswer.toLowerCase() === answer.toLowerCase()
    }

    // Check main answer
    if (checkAgainst(blank.answer)) return true

    // Check alternatives
    if (blank.alternatives && blank.alternatives.length > 0) {
      return blank.alternatives.some((alt) => checkAgainst(alt))
    }

    return false
  }

  const handleSubmit = async () => {
    if (disabledProp || isSubmitted || state.status === 'completed') return;

    const results: Record<string, boolean> = {}
    let correctCount = 0

    blanks.forEach((blank) => {
      const isCorrect = checkAnswer(blank, userAnswers[blank.id] ? userAnswers[blank.id].trim() : "")
      results[blank.id] = isCorrect
      if (isCorrect) correctCount++
    })

    const earnedPoints = correctCount * points;
    const allCorrect = correctCount === blanks.length;

    // Feedback
    if (allCorrect) {
      await playFeedback('quizSuccess');
    } else if (correctCount > 0) {
      await playFeedback('complete');
    } else {
      await playFeedback('incorrect');
    }

    // Scoring (Using standardized handlePoints from base renderer)
    handlePoints(earnedPoints);

    // Update State
    setState(prev => ({
      ...prev,
      isSubmitted: true,
      correctAnswers: results,
      score: earnedPoints,
      status: 'completed'
    }))
  }

  const onLocalRetry = () => {
    handleRetry() // Centralized handler
    const initialAnswers: Record<string, string> = {}
    blanks.forEach((blank) => {
      initialAnswers[blank.id] = ""
    })

    setState(prev => ({
      ...prev,
      userAnswers: initialAnswers,
      isSubmitted: false,
      correctAnswers: {},
      score: 0,
      status: 'active'
    }))
  }

  const onTimeout = () => {
    if (!isSubmitted) {
      handleSubmit()
    }
  }

  if (!mounted) return null

  // Live Start Screen
  if (isLive && !hasStarted && !isSubmitted && state.status !== 'completed') {
    return (
      <LiveStartScreen
        onStart={() => setHasStarted(true)}
        label={`Start Activity (${timeLimit}s Time Limit)`}
      />
    )
  }



  const totalPossible = points * blanks.length

  return (
    <div className={cn(
      "w-full h-full flex-1 flex flex-col bg-white overflow-hidden group/fib transition-all duration-300 px-6",
      disabledProp && "opacity-75"
    )}>
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />

      {/* Header */}
      <div className="shrink-0 relative flex items-center justify-between px-2 pt-2">
        <div className="space-y-0.5">
          <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Activity</span>
          <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <LiveTimer
                isCompleted={isSubmitted || state.status === 'completed'}
                duration={timeLimit}
                onTimeout={onTimeout}
              />
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

      {/* CENTER SECTION: Interactive Text */}
      <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-2">
        <div className="text-base md:text-lg font-bold text-slate-900 leading-relaxed tracking-tight my-auto">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < blanks.length && (
                <span className="inline-flex relative mx-1.5 group/input align-middle">
                  <Input
                    value={userAnswers[blanks[index].id] || ""}
                    onChange={(e) => handleAnswerChange(blanks[index].id, e.target.value)}
                    disabled={isSubmitted || disabledProp}
                    placeholder="..."
                    className={cn(
                      "w-28 md:w-36 h-9 bg-emerald-50/20 border-2 border-emerald-100 focus-visible:ring-emerald-500/50 rounded-lg text-center font-black text-slate-900 transition-all placeholder:text-emerald-600/20 py-0 text-xs md:text-sm shadow-inner",
                      isSubmitted && (
                        correctAnswers[blanks[index].id]
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-none"
                          : "border-rose-500 bg-rose-50 text-rose-600 shadow-none"
                      )
                    )}
                  />
                  {isSubmitted && !correctAnswers[blanks[index].id] && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white border border-emerald-500 px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap animate-in fade-in zoom-in-95 font-black uppercase text-[8px] tracking-widest text-emerald-600">
                      Answer: <span className="text-slate-900">{blanks[index].answer}</span>
                    </div>
                  )}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: Feedback & Buttons */}
      <div className="shrink-0 space-y-3 px-2 pb-4 pt-1">
        <div className="min-h-[52px] flex flex-col justify-end">
          {isSubmitted && (
            <div className={cn(
              'p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm',
              score === totalPossible ? 'bg-emerald-50/50 border-emerald-500/20' : 'bg-rose-50/50 border-rose-500/20'
            )}>
              {score === totalPossible ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Correct</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-tight italic">"Excellent! All answers are correct."</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Score</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-tight">
                    You got {Math.floor(score / points)} / {blanks.length} correct.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {!isSubmitted ? (
            <Button
              className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
              onClick={handleSubmit}
              disabled={disabledProp}
            >
              Check Answers
            </Button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Button
                className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-100 shadow-lg shadow-emerald-500/20"
                disabled
              >
                Completed
              </Button>
              {!isLive && score !== totalPossible && (
                <Button
                  className="h-11 w-full rounded-xl bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95"
                  onClick={onLocalRetry}
                  disabled={disabledProp}
                >
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-0.5">
          <div className="px-4 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded">
            <span className="text-[7px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">
              Points: <span className="text-emerald-700">{score}</span> / {totalPossible}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


export function FillInTheBlankRenderer(props: FillInTheBlankRendererProps) {
  const {
    title = "Fill in the blanks",
    text = "",
    blanks = [],
    caseSensitive = false,
    points = 10,
    isEditing = false,
    scoreContext,
    mode = 'practice',
    state: componentState = 'active',
    disabled = false,
    savedState,
    setComponentState,
    id = 'fill-in-blank-renderer',
    status
  } = props

  const component: Component = {
    id,
    type: 'fillInTheBlank',
    state: componentState as any,
    status: (status || (savedState as any)?.status || 'uncompleted') as any,
    props: { title, text, blanks },
    mode: mode as any
  } as Component

  // Initial State Construction
  const initialAnswers: Record<string, string> = {}
  blanks.forEach((blank) => {
    initialAnswers[blank.id] = ""
  })

  const initialState: FillInTheBlankState = {
    userAnswers: initialAnswers,
    isSubmitted: false,
    correctAnswers: {},
    score: 0
  }

  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="text-sm">
          {text.split("{{blank}}").map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < blanks.length && blanks[index] && (
                <span className="inline-block bg-muted px-2 py-0.5 rounded mx-1">{blanks[index].answer}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ScoredRenderer<FillInTheBlankState>
      component={component}
      initialState={initialState}
      savedState={savedState}
      setComponentState={setComponentState}
      // We pass Points * Blanks as total? No, component consumes 'points' meaning 'Points per blank' in legacy.
      // But ScoredRenderer prop 'points' is typically total.
      // But we use manual scoring. So it doesn't matter what we pass to ScoredRenderer strictly, 
      // EXCEPT if ScoredRenderer uses it for something.
      points={points * blanks.length}
      mode={mode}
      disabled={disabled}
      onRender={(renderProps) => (
        <FillInTheBlankContent
          {...renderProps}
          title={title}
          text={text}
          blanks={blanks}
          caseSensitive={caseSensitive}
          points={points}
          isDisabled={disabled || component.state === 'disabled'}
          props={props}
        />
      )}
    />
  )
}
