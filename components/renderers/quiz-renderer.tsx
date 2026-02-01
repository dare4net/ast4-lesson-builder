"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import type { Component } from "@/types/lesson"

interface QuizRendererProps {
  // Component props matching current structure
  title?: string
  questions?: {
    id: string
    question: string
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
    explanation?: string
  }[]
  points?: number
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
  onScoreUpdate?: (score: number) => void
  mode?: 'practice' | 'live'
  state?: 'active' | 'disabled'
  disabled?: boolean
  isLastSlideChild?: boolean
  onCheckSlideCompletion?: () => void
  status?: string
  savedState?: any
  setComponentState?: (state: any) => void
  // Add ID for base renderer compatibility
  id?: string
}

type QuizState = {
  currentQuestion: number
  selectedAnswer: string | null
  isAnswered: boolean
  score: number
  animationClass: string
  isComplete: boolean
  mode: 'practice' | 'live'
}

export function QuizRenderer(props: QuizRendererProps) {
  const { playFeedback } = useFeedback()
  const {
    title = 'Quiz',
    questions = [],
    points = 15,
    isEditing = false,
    mode = 'practice',
    disabled = false,
    state: componentState = 'active',
    id = 'quiz-renderer',
    savedState,
    setComponentState
  } = props

  // Construct a proxy component object for the base renderer
  const component: Component = {
    id,
    type: 'quiz',
    state: componentState as any,
    status: (props.status || (savedState as any)?.status || 'uncompleted') as any,
    props: { title, questions },
    mode: mode as any
  } as Component

  const initialState: QuizState = {
    currentQuestion: 0,
    selectedAnswer: null,
    isAnswered: false,
    score: 0,
    animationClass: '',
    isComplete: false,
    mode
  }

  if (isEditing) {
    return (
      <div className="duo-card space-y-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? 's' : ''} • {points} points
        </p>
      </div>
    )
  }

  return (
    <ScoredRenderer<QuizState>
      component={component}
      initialState={initialState}
      savedState={savedState}
      setComponentState={setComponentState}
      points={points}
      mode={mode}
      disabled={disabled}
      onRender={({ state, setState, handleScore, handleRetry, isLive }) => {
        const { currentQuestion, selectedAnswer, isAnswered, score, animationClass } = state
        const question = questions[currentQuestion]
        const isDisabled = disabled || component.state === 'disabled'

        if (!question) return null

        const { registerLock, unregisterLock } = useNavigationLock()
        const [hasStarted, setHasStarted] = useState(false)
        const timeLimit = (props as any).timeLimit || 10 // Safe default, cast for now as we add prop to interface later or it's extra prop

        // Live Mode Logic
        useEffect(() => {
          if (isLive && hasStarted && !state.isComplete) {
            registerLock(id)
          } else {
            unregisterLock(id)
          }
          return () => unregisterLock(id)
        }, [isLive, hasStarted, state.isComplete, registerLock, unregisterLock, id])

        const onLiveStart = () => {
          setHasStarted(true)
        }

        const onTimeout = () => {
          // Auto submit whatever is selected, or nothing
          if (!state.isAnswered) {
            // If nothing selected, maybe mark incorrect? Or just submit.
            // handleCheckAnswer requires selection or skips?
            // Logic: Force a "Timeout" state.
            // We'll simulate an incorrect answer or just mark complete.
            playFeedback('incorrect')
            setState(prev => ({ ...prev, isComplete: true, status: 'completed' }))
            // We should also probably trigger handlePoints(0) if not triggered.
          } else if (state.isAnswered && !state.isComplete) {
            // If answered but check not clicked? (Quiz usually requires check)
            handleCheckAnswer()
          }
        }

        // Render Start Screen if Live and Not Started
        if (isLive && !hasStarted && !state.isComplete) {
          return (
            <LiveStartScreen
              onStart={onLiveStart}
              label={`Start Quiz (${timeLimit}s Time Limit)`}
            />
          )
        }

        const handleAnswerSelect = async (optionId: string) => {
          const effectiveDisabled = isDisabled || state.isComplete
          if (isAnswered || effectiveDisabled) return
          setState((prev: QuizState) => ({ ...prev, selectedAnswer: optionId }))
          await playFeedback('click', { animation: false, sound: true })
        }

        const handleCheckAnswer = async () => {
          const effectiveDisabled = isDisabled || state.isComplete
          if (selectedAnswer === null || isAnswered || effectiveDisabled) return

          const selectedOption = questions[currentQuestion].options.find(opt => opt.id === selectedAnswer)
          const isCorrect = selectedOption?.isCorrect ?? false
          const isLastQuestion = currentQuestion === questions.length - 1
          const newScore = isCorrect ? score + 1 : score

          // Update state
          const newState = {
            ...state,
            isAnswered: true,
            score: newScore,
            // If last question, mark complete
            ...(isLastQuestion ? { isComplete: true, status: 'completed' } : {})
          }

          setState(newState) // This triggers persistence via InteractiveRenderer

          // Trigger scoring
          handleScore(isCorrect)

          if (isCorrect) {
            await playFeedback('quizSuccess', { animation: false })
          } else {
            await playFeedback('incorrect')
          }

          if (props.onScoreUpdate) {
            props.onScoreUpdate(newScore)
          }
        }

        const handleNextQuestion = async () => {
          if (currentQuestion < questions.length - 1) {
            setState((prev: QuizState) => ({
              ...prev,
              currentQuestion: prev.currentQuestion + 1,
              selectedAnswer: null,
              isAnswered: false
            }))
            await playFeedback('click', { animation: false })
          } else {
            await playFeedback('quizSuccess', { animation: false })
          }
        }

        const onLocalRetry = async () => {
          handleRetry() // Centralized handler (plays feedback, checks live mode)
          setState({
            ...initialState,
            mode: state.mode // Preserve mode
          })
        }

        return (
          <div className={cn(
            "w-full flex-1 flex flex-col bg-white transition-all duration-300 px-6",
            animationClass
          )}>
            {/* TOP SECTION: Meta & Title */}
            <div className="shrink-0 space-y-4 pt-2">
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Activity</span>
                  <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {isLive && (
                    <div className="flex items-center gap-1.5">
                      <LiveTimer
                        isCompleted={state.isComplete}
                        duration={timeLimit}
                        onTimeout={onTimeout}
                      />
                    </div>
                  )}
                  {isDisabled && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-400 rounded text-[7px] font-black uppercase tracking-widest border border-slate-200">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quiz Progress</span>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-emerald-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CENTER SECTION: Interactive Content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="relative space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-emerald-500 rounded-full" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">Question {currentQuestion + 1} / {questions.length}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">{question.question}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option.id
                    const isCorrectAnswer = option.isCorrect
                    const showCorrect = isAnswered && isCorrectAnswer
                    const showIncorrect = isAnswered && isSelected && !isCorrectAnswer

                    return (
                      <button
                        key={option.id}
                        className={cn(
                          'group/opt w-full p-4 text-left transition-all duration-300 relative rounded-xl border-2 border-slate-100 bg-white shadow-sm overflow-hidden',
                          isSelected && !isAnswered && 'border-emerald-500 bg-emerald-50 shadow-emerald-500/10',
                          showCorrect && 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20',
                          showIncorrect && 'bg-rose-50 border-rose-500 text-rose-600 shadow-rose-500/10',
                          (isAnswered || isDisabled) && 'cursor-not-allowed',
                          !isAnswered && !isDisabled && 'hover:border-emerald-500/50 hover:bg-emerald-50/20 hover:shadow-md'
                        )}
                        onClick={() => handleAnswerSelect(option.id)}
                        disabled={isAnswered || isDisabled}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest transition-colors",
                              isSelected ? "text-emerald-600" : "text-slate-300 group-hover/opt:text-emerald-500",
                              showCorrect && "text-white",
                              showIncorrect && "text-rose-600"
                            )}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-bold text-sm tracking-tight">{option.text}</span>
                          </div>
                          {showCorrect && <CheckCircle2 className="w-4 h-4 text-white stroke-[3] animate-in zoom-in-50 duration-500" />}
                          {showIncorrect && <XCircle className="w-4 h-4 text-rose-600 stroke-[3] animate-in shake duration-500" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: Feedback & Actions */}
            <div className="shrink-0 space-y-4 pb-6">
              {/* Jump-Proof Feedback Slot: Reserved height when active */}
              <div className="min-h-[80px] flex flex-col justify-end">
                {isAnswered && (
                  <div className={cn(
                    'p-6 rounded-2xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm',
                    selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                      ? 'bg-emerald-50/50 border-emerald-500/20 shadow-emerald-500/5'
                      : 'bg-rose-50/50 border-rose-500/20 shadow-rose-500/5'
                  )}>
                    {currentQuestion === questions.length - 1 && selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Quiz Completed</span>
                        </div>
                        <p className="text-sm font-black text-slate-900 italic line-clamp-2">"Great job! You've successfully completed the quiz."</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Final Score: {score}/{questions.length}</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          {selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Correct</span>
                          ) : (
                            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Incorrect</span>
                          )}
                        </div>
                        {selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
                          <p className="text-sm font-black text-slate-900 leading-tight italic">Your response is correct.</p>
                        ) : (
                          <p className="text-sm font-black text-slate-900 leading-tight">That answer is incorrect. Please try again.</p>
                        )}
                        {question.explanation && (
                          <p className="text-xs font-bold text-slate-600 leading-tight mt-1">{question.explanation}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full">
                {(!isAnswered || currentQuestion < questions.length - 1) ? (
                  <Button
                    className={cn(
                      'h-11 w-full rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all transform active:scale-95 shadow-md',
                      !isAnswered && selectedAnswer !== null
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none',
                      isAnswered && 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'
                    )}
                    onClick={isAnswered ? handleNextQuestion : handleCheckAnswer}
                    disabled={(selectedAnswer === null && !isAnswered) || isDisabled}
                  >
                    {isAnswered ? 'Next Question' : 'Check Answer'}
                  </Button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-100 shadow-lg shadow-emerald-500/20"
                      disabled
                    >
                      Quiz Completed
                    </Button>
                    {!isLive && (isAnswered || state.isComplete) && (
                      <Button
                        className="h-11 w-full rounded-xl bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95"
                        onClick={onLocalRetry}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
