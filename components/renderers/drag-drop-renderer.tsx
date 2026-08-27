"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, MoveUp, MoveDown, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

interface DragItem {
  id: string
  text: string
  correctIndex: number
  color?: string
}

interface DragDropRendererProps {
  title?: string
  items?: DragItem[]
  shuffled?: boolean
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
  savedState?: any
  setComponentState?: (state: any) => void
  isLastSlideChild?: boolean
  onCheckSlideCompletion?: () => void
  id?: string
  status?: string
}

type DragDropState = {
  dragItems: DragItem[]
  isSubmitted: boolean
  isCorrect: boolean
  mode: 'practice' | 'live'
  status?: string
}

const generatePastelColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 70%, 85%)`
}

function DragDropContent({
  title,
  shuffled,
  isEditing,
  state,
  setState,
  handlePoints,
  handleRetry,
  isLive,
  isDisabled: disabledProp,
  onCheckSlideCompletion,
  isLastSlideChild,
  props
}: ScoredRenderProps<DragDropState> & {
  title: string
  shuffled: boolean
  isEditing: boolean
  isDisabled: boolean
  onCheckSlideCompletion?: () => void
  isLastSlideChild?: boolean
  props: DragDropRendererProps
}) {
  const { playFeedback } = useFeedback()
  const [mounted, setMounted] = useState(false)
  const { registerLock, unregisterLock } = useNavigationLock()
  const [hasStarted, setHasStarted] = useState(false)

  const timeLimit = (props as any).timeLimit || 10

  const { dragItems, isSubmitted, isCorrect } = state

  useEffect(() => {
    const isComplete = isSubmitted || state.status === 'completed'
    if (isLive && hasStarted && !isComplete) {
      registerLock(props.id || 'dd-renderer')
    } else {
      unregisterLock(props.id || 'dd-renderer')
    }
    return () => unregisterLock(props.id || 'dd-renderer')
  }, [isLive, hasStarted, isSubmitted, state.status, registerLock, unregisterLock, props.id])

  const onTimeout = () => {
    if (!isSubmitted) {
      // Auto check
      handleCheck()
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const needsInit = dragItems.length > 0 && (!dragItems[0].color || dragItems.some(i => i.correctIndex === undefined))

    if (needsInit) {
      const withColor = (arr: DragItem[]) => arr.map((item, idx) => ({
        ...item,
        correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : idx,
        color: generatePastelColor()
      }))
      let newItems: DragItem[] = []

      if (isEditing) {
        newItems = withColor([...dragItems].sort((a, b) => (a.correctIndex ?? 0) - (b.correctIndex ?? 0)))
      } else {
        newItems = withColor([...dragItems])
        if (shuffled) {
          newItems = [...newItems].sort(() => Math.random() - 0.5)
        }
      }

      setState(prev => ({ ...prev, dragItems: newItems }))
    }
  }, [mounted, isEditing, shuffled, dragItems.length, setState])

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (isSubmitted || disabledProp) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= dragItems.length) return

    await playFeedback('click', { sound: true, animation: false })

    const newItems = [...dragItems]
    const temp = newItems[index]
    newItems[index] = newItems[newIndex]
    newItems[newIndex] = temp

    setState(prev => ({ ...prev, dragItems: newItems }))
  }

  const handleCheck = async () => {
    if (disabledProp || state.isSubmitted || state.status === 'completed') return

    const correctCount = dragItems.reduce((count, item, index) => {
      return count + (item.correctIndex === index ? 1 : 0)
    }, 0)

    const isAllCorrect = correctCount === dragItems.length

    const newState = {
      dragItems,
      isSubmitted: true,
      isCorrect: isAllCorrect,
      status: 'completed'
    }
    setState(prev => ({ ...prev, ...newState }))

    if (isAllCorrect) {
      await playFeedback('dngSuccess', { animation: false })
    } else if (correctCount > 0) {
      await playFeedback('complete')
    } else {
      await playFeedback('incorrect')
    }

    const earnedPoints = correctCount * (props.points || 15)
    handlePoints(earnedPoints)

    if (isLastSlideChild && (isLive || isAllCorrect)) {
      onCheckSlideCompletion?.()
    }
  }

  const onLocalRetry = async () => {
    handleRetry()
    const withColor = (arr: DragItem[]) => arr.map(item => ({ ...item, color: generatePastelColor() }))
    let newItems = withColor([...props.items || []])
    if (shuffled) {
      newItems = [...newItems].sort(() => Math.random() - 0.5)
    }

    setState(prev => ({
      ...prev,
      dragItems: newItems,
      isSubmitted: false,
      isCorrect: false,
      status: 'active'
    }))
  }

  if (!mounted) return null

  // Live Start Screen
  if (isLive && !hasStarted && !isEditing && !isSubmitted && state.status !== 'completed') {
    return (
      <LiveStartScreen
        onStart={() => setHasStarted(true)}
        label={`Start Sorting (${timeLimit}s Time Limit)`}
      />
    )
  }

  if (isEditing) {
    return (
      <div className="duo-card space-y-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="space-y-2">
          {dragItems.map((item, index) => (
            <div key={item.id} className="p-3 bg-muted rounded">
              {index + 1}. {item.text}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 group/dnd transition-all duration-300 px-6 sm:px-10 md:px-12 py-2",
      disabledProp && "opacity-75"
    )}>

      {/* Header */}
      <div className="shrink-0 relative flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Ordering Activity</span>
          <FormattedText content={title} as="h3" className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none" />
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
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded text-[7px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
              <Lock className="h-2.5 w-2.5" />
              <span>Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Interactive List (Full Canvas Width) */}
      <div className="flex-1 min-h-0 flex flex-col justify-center py-4 w-full">
        <div className="relative space-y-3 my-auto w-full">
          {dragItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "group/item relative p-4 rounded-2xl border-2 border-b-4 transition-all duration-200 flex items-center gap-4 shadow-sm",
                isSubmitted && item.correctIndex === index
                  ? "bg-[#58CC02] border-[#46a302] border-b-[#3B8C00] text-white shadow-lg"
                  : isSubmitted && item.correctIndex !== index
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 border-b-rose-600 text-rose-600 font-bold"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5"
              )}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                style={{ backgroundColor: !isSubmitted ? item.color : 'transparent' }}
              />

              <div className="flex items-center gap-3.5 flex-1 pl-1">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-300",
                  isSubmitted && item.correctIndex === index ? "bg-white/20 text-white" : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                )}>
                  {index + 1}
                </div>
                <FormattedText content={item.text} className="font-bold text-sm tracking-tight" />
              </div>

              {!isSubmitted && (
                <div className="flex gap-2">
                  <button
                    className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-4 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-all active:border-b-2 active:translate-y-[2px] p-0 flex items-center justify-center cursor-pointer"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0 || disabledProp}
                  >
                    <MoveUp className="h-4 w-4 stroke-[3]" />
                  </button>
                  <button
                    className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-4 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-all active:border-b-2 active:translate-y-[2px] p-0 flex items-center justify-center cursor-pointer"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === dragItems.length - 1 || disabledProp}
                  >
                    <MoveDown className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
              )}

              {isSubmitted && (
                <div className="animate-in zoom-in-50 duration-300">
                  {item.correctIndex === index ? (
                    <CheckCircle2 className="h-6 w-6 text-white stroke-[3]" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-600 stroke-[3] animate-in shake" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: Reserved Footer Height to Prevent Layout Jump */}
      <div className="shrink-0 space-y-3 pt-1 pb-4 min-h-[56px] flex flex-col justify-center items-center">
        {!isSubmitted ? (
          <button
            className="px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] active:border-b-0 active:translate-y-[2px] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            onClick={handleCheck}
            disabled={disabledProp}
          >
            Check Order
          </button>
        ) : (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-500 w-full max-w-md">
            <div className={cn(
              "p-3.5 rounded-xl border-2 transition-all duration-300 shadow-sm text-center",
              isCorrect ? "bg-emerald-50/50 border-emerald-500/20" : "bg-rose-50/50 border-rose-500/20"
            )}>
              {isCorrect ? (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Correct</span>
                  <p className="text-xs font-black text-slate-900 dark:text-slate-100">"Excellent! The order is correct."</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Incorrect</span>
                  <p className="text-xs font-black text-slate-900 dark:text-slate-100">The order is incorrect. Please try again.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                className="px-5 py-2.5 rounded-xl bg-emerald-600 border-b-4 border-emerald-800 text-white font-black uppercase text-xs tracking-wider cursor-default"
                disabled
              >
                Completed ✓
              </button>
              {!isLive && !isCorrect && (
                <button
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-4 border-emerald-500 border-b-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all font-black uppercase text-xs tracking-wider active:border-b-2 active:translate-y-[2px] cursor-pointer"
                  onClick={onLocalRetry}
                  disabled={disabledProp}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function DragDropRenderer(props: DragDropRendererProps) {
  const {
    title = "Arrange in the correct order",
    items = [],
    shuffled = true,
    points = 15,
    isEditing = false,
    mode = 'practice',
    state: componentState = 'active',
    disabled = false,
    id = 'drag-drop-renderer',
    savedState,
    setComponentState,
    isLastSlideChild,
    onCheckSlideCompletion
  } = props

  const component: Component = {
    id,
    type: 'dragDrop',
    state: componentState as any,
    status: (props.status || (savedState as any)?.status || 'uncompleted') as any,
    props: { title, items, points },
    mode: mode as any
  } as Component

  const initialState: DragDropState = {
    dragItems: items,
    isSubmitted: false,
    isCorrect: false,
    mode
  }

  return (
    <ScoredRenderer<DragDropState>
      component={component}
      initialState={initialState}
      savedState={savedState}
      setComponentState={setComponentState}
      points={points}
      mode={mode}
      disabled={disabled}
      onRender={(renderProps) => (
        <DragDropContent
          {...renderProps}
          title={title}
          shuffled={shuffled}
          isEditing={isEditing}
          isLastSlideChild={isLastSlideChild}
          onCheckSlideCompletion={onCheckSlideCompletion}
          isDisabled={disabled || component.state === 'disabled'}
          props={props}
        />
      )}
    />
  )
}
