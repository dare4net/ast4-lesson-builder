"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
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
  shuffleOptions?: boolean
  randomizeAnswers?: boolean
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
  isComplete: boolean
  mode: 'practice' | 'live'
}

type QuizQuestion = NonNullable<QuizRendererProps['questions']>[number]
type PlayFeedback = ReturnType<typeof useFeedback>['playFeedback']

function QuizPlayfield({
  state,
  setState,
  handleScore,
  handleRetry,
  recordAttempt,
  isLive,
  question,
  processedQuestions,
  questions,
  title,
  isDisabled,
  componentId,
  timeLimit,
  playFeedback,
  onScoreUpdate,
  initialState,
}: ScoredRenderProps<QuizState> & {
  question: QuizQuestion
  processedQuestions: QuizQuestion[]
  questions: QuizQuestion[]
  title: string
  isDisabled: boolean
  componentId: string
  timeLimit: number
  playFeedback: PlayFeedback
  onScoreUpdate?: (score: number) => void
  initialState: QuizState
}) {
  const { currentQuestion, selectedAnswer, isAnswered, score } = state
  const { registerLock, unregisterLock } = useNavigationLock()
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (isLive && hasStarted && !state.isComplete) {
      registerLock(componentId)
    } else {
      unregisterLock(componentId)
    }
    return () => unregisterLock(componentId)
  }, [isLive, hasStarted, state.isComplete, registerLock, unregisterLock, componentId])

  const onLiveStart = () => {
    setHasStarted(true)
  }

  const handleCheckAnswer = async () => {
    const effectiveDisabled = isDisabled || state.isComplete
    if (selectedAnswer === null || isAnswered || effectiveDisabled) return

    const selectedOption = processedQuestions[currentQuestion].options.find(opt => opt.id === selectedAnswer)
    const isCorrect = selectedOption?.isCorrect ?? false
    const isLastQuestion = currentQuestion === questions.length - 1
    const newScore = isCorrect ? score + 1 : score

    const newState = {
      ...state,
      isAnswered: true,
      score: newScore,
      ...(isLastQuestion ? { isComplete: true, status: 'completed' } : {})
    }

    setState(newState)
    handleScore(isCorrect)
    if (isLastQuestion) {
      recordAttempt(newScore === questions.length, newScore, questions.length)
    }

    if (isCorrect) {
      await playFeedback('quizSuccess', { animation: false })
    } else {
      await playFeedback('incorrect')
    }

    onScoreUpdate?.(newScore)
  }

  const onTimeout = () => {
    if (!state.isAnswered) {
      playFeedback('incorrect')
      recordAttempt(false)
      setState(prev => ({ ...prev, isComplete: true, status: 'completed' } as QuizState))
    } else if (state.isAnswered && !state.isComplete) {
      handleCheckAnswer()
    }
  }

  const handleAnswerSelect = async (optionId: string) => {
    const effectiveDisabled = isDisabled || state.isComplete
    if (isAnswered || effectiveDisabled) return

    if (isLive) {
      const selectedOption = processedQuestions[currentQuestion].options.find(opt => opt.id === optionId)
      const isCorrect = selectedOption?.isCorrect ?? false
      const isLastQuestion = currentQuestion === processedQuestions.length - 1
      const newScore = isCorrect ? score + 1 : score

      const newState = {
        ...state,
        selectedAnswer: optionId,
        isAnswered: true,
        score: newScore,
        ...(isLastQuestion ? { isComplete: true, status: 'completed' } : {})
      }

      setState(newState)
      handleScore(isCorrect)
      if (isLastQuestion) {
        recordAttempt(newScore === processedQuestions.length, newScore, processedQuestions.length)
      }

      if (isCorrect) {
        await playFeedback('quizSuccess', { animation: false })
      } else {
        await playFeedback('incorrect')
      }

      onScoreUpdate?.(newScore)
    } else {
      setState((prev: QuizState) => ({ ...prev, selectedAnswer: optionId }))
      await playFeedback('click', { animation: false, sound: true })
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
    handleRetry()
    setState({
      ...initialState,
      mode: state.mode
    })
  }

  if (isLive && !hasStarted && !state.isComplete) {
    return (
      <LiveStartScreen
        onStart={onLiveStart}
        label={`Start Quiz (${timeLimit}s Time Limit)`}
      />
    )
  }

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-2">
      <div className="shrink-0 space-y-3 pt-2">
        <div className="relative flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Activity</span>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none">{title}</h3>
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
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded text-[7px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                <Lock className="h-2.5 w-2.5" />
                <span>Locked</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quiz Progress</span>
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-50 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-start md:justify-center py-3 md:py-4 w-full">
        <div className="relative space-y-4 my-auto w-full">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-emerald-500 rounded-full" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Question {currentQuestion + 1} / {questions.length}</span>
            </div>
            <FormattedText content={question.question} as="h2" className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option.id
              const isCorrectAnswer = option.isCorrect
              const showCorrect = isAnswered && isCorrectAnswer
              const showIncorrect = isAnswered && isSelected && !isCorrectAnswer

              return (
                <button
                  key={option.id || `option-${idx}`}
                  className={cn(
                    'group/opt w-full p-4 text-left text-slate-900 dark:text-slate-100 transition-all duration-200 relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
                    'border-b-4 active:border-b-0 active:translate-y-[2px]',
                    isSelected && !isAnswered && 'border-[#1CB0F6] bg-[#1CB0F6]/5 border-b-[#0090CC]',
                    showCorrect && 'bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg',
                    showIncorrect && 'bg-[#FF4B4B]/10 border-[#FF4B4B] border-b-[#CC3C3C] text-[#FF4B4B]',
                    (isAnswered || isDisabled) && 'cursor-not-allowed',
                    !isAnswered && !isDisabled && 'hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5 hover:shadow-md cursor-pointer'
                  )}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={isAnswered || isDisabled}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors shrink-0",
                        isSelected && !isAnswered ? "bg-[#1CB0F6] text-white border-[#1CB0F6]" : "bg-slate-50 text-slate-400 border-slate-200 group-hover/opt:border-[#1CB0F6]/50 group-hover/opt:text-[#1CB0F6]",
                        showCorrect && "bg-white/30 text-white border-white/30",
                        showIncorrect && "bg-[#FF4B4B]/20 text-[#FF4B4B] border-[#FF4B4B]/30"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <FormattedText content={option.text} className="font-bold text-sm tracking-tight text-inherit" />
                    </div>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-white stroke-[3] animate-in zoom-in-50 duration-500 shrink-0" />}
                    {showIncorrect && <XCircle className="w-5 h-5 text-[#FF4B4B] stroke-[3] animate-in shake duration-500 shrink-0" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-3 pb-4 pt-1">
        <div className="min-h-[52px] flex flex-col justify-end">
          {isAnswered && (
            <div className={cn(
              'p-4 rounded-xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm',
              selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect
                ? 'bg-emerald-50/50 border-emerald-500/20 shadow-emerald-500/5'
                : 'bg-rose-50/50 border-rose-500/20 shadow-rose-500/5'
            )}>
              {currentQuestion === questions.length - 1 && selectedAnswer && question.options.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Great Job!</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 italic line-clamp-2">You finished the quiz! Keep it up!</p>
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
                    <p className="text-sm font-black text-slate-900 leading-tight italic">Correct! Well done!</p>
                  ) : (
                    <p className="text-sm font-black text-slate-900 leading-tight">Not quite right — keep going, you can do it!</p>
                  )}
                  {question.explanation && (
                    <FormattedText content={question.explanation} as="p" className="text-xs font-bold text-slate-600 leading-tight mt-1" />
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
                'h-12 w-full rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all transform border-b-4 active:border-b-0 active:translate-y-[2px] shadow-md',
                isLive
                  ? isAnswered
                    ? 'bg-[#1CB0F6] text-white shadow-sky-500/20 hover:bg-sky-500 border-[#0090CC]'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 border-b-slate-200 shadow-none'
                  : (!isAnswered && selectedAnswer !== null
                    ? 'bg-[#58CC02] text-white shadow-emerald-500/20 hover:bg-[#46a302] border-[#3B8C00]'
                    : isAnswered
                      ? 'bg-[#1CB0F6] text-white shadow-sky-500/20 hover:bg-sky-500 border-[#0090CC]'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 border-b-slate-200 shadow-none')
              )}
              onClick={isLive ? handleNextQuestion : (isAnswered ? handleNextQuestion : handleCheckAnswer)}
              disabled={isLive ? !isAnswered || isDisabled : (selectedAnswer === null && !isAnswered) || isDisabled}
            >
              {isLive
                ? (currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz')
                : (isAnswered ? 'Next Question' : 'Check Answer')}
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
}

export function QuizRenderer(props: QuizRendererProps) {
  const { playFeedback } = useFeedback()
  const {
    title = 'Quiz',
    questions = [],
    shuffleOptions = true,
    randomizeAnswers = true,
    points = 15,
    isEditing = false,
    mode = 'practice',
    disabled = false,
    state: componentState = 'active',
    id = 'quiz-renderer',
    savedState,
    setComponentState
  } = props

  const shouldShuffle = shuffleOptions !== false && randomizeAnswers !== false

  const [processedQuestions, setProcessedQuestions] = useState(questions)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!questions || questions.length === 0) {
      setProcessedQuestions([])
      return
    }

    const normalized = questions.map((q, qIdx) => ({
      ...q,
      options: (q.options || []).map((opt, optIdx) => ({
        ...opt,
        id: opt.id || `opt-${qIdx}-${optIdx}`
      }))
    }))

    if (!shouldShuffle) {
      setProcessedQuestions(normalized)
      return
    }

    setProcessedQuestions(normalized.map(q => {
      if (!q.options || q.options.length <= 1) return q
      return { ...q, options: [...q.options].sort(() => Math.random() - 0.5) }
    }))
  }, [mounted, shouldShuffle, questions])

  // Construct a proxy component object for the base renderer
  const component: Component = {
    id,
    type: 'quiz',
    state: componentState as any,
    status: (props.status || (savedState as any)?.status || 'uncompleted') as any,
    props: { title, questions: processedQuestions, points },
    mode: mode as any
  } as Component

  const initialState: QuizState = {
    currentQuestion: 0,
    selectedAnswer: null,
    isAnswered: false,
    score: 0,
    isComplete: false,
    mode
  }

  if (isEditing) {
    return (
      <div className="duo-card space-y-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">
          {processedQuestions.length} question{processedQuestions.length !== 1 ? 's' : ''} • {points} points
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
      onRender={(renderProps) => {
        const question = processedQuestions[renderProps.state.currentQuestion]
        if (!question) return null
        return (
          <QuizPlayfield
            {...renderProps}
            question={question}
            processedQuestions={processedQuestions}
            questions={questions}
            title={title}
            isDisabled={disabled || component.state === 'disabled'}
            componentId={id}
            timeLimit={(props as { timeLimit?: number }).timeLimit || 10}
            playFeedback={playFeedback}
            onScoreUpdate={props.onScoreUpdate}
            initialState={initialState}
          />
        )
      }}
    />
  )
}
