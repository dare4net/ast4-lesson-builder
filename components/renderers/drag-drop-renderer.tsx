"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, MoveUp, MoveDown, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
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

    const needsInit = dragItems.length > 0 && !dragItems[0].color

    if (needsInit) {
      const withColor = (arr: DragItem[]) => arr.map(item => ({ ...item, color: generatePastelColor() }))
      let newItems: DragItem[] = []

      if (isEditing) {
        newItems = withColor([...dragItems].sort((a, b) => a.correctIndex - b.correctIndex))
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
    if (disabledProp) return

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
      "w-full flex-1 flex flex-col bg-white overflow-hidden group/dnd transition-all duration-300 px-6",
      disabledProp && "opacity-75"
    )}>
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />

      {/* Header */}
      <div className="relative flex items-center justify-between pt-2">
        <div className="space-y-1">
          <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Ordering Activity</span>
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

      {/* CENTER SECTION: Interactive List */}
      <div className="flex-1 flex flex-col justify-center py-4">
        <div className="relative space-y-3">
          {dragItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "group/item relative p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 overflow-hidden shadow-sm",
                isSubmitted && item.correctIndex === index
                  ? "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : isSubmitted && item.correctIndex !== index
                    ? "bg-rose-50 border-rose-500 text-rose-600 shadow-rose-500/10"
                    : "bg-white border-slate-100 text-slate-900 hover:border-emerald-500/30 hover:shadow-md"
              )}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ backgroundColor: !isSubmitted ? item.color : 'transparent' }}
              />

              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-all duration-300",
                  isSubmitted && item.correctIndex === index ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
                )}>
                  {index + 1}
                </div>
                <span className="font-bold text-sm tracking-tight">{item.text}</span>
              </div>

              {!isSubmitted && (
                <div className="flex gap-2">
                  <Button
                    className="h-9 w-9 rounded-lg bg-white border-2 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all active:scale-90 shadow-sm p-0"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0 || disabledProp}
                  >
                    <MoveUp className="h-4 w-4 stroke-[3]" />
                  </Button>
                  <Button
                    className="h-9 w-9 rounded-lg bg-white border-2 border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all active:scale-90 shadow-sm p-0"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === dragItems.length - 1 || disabledProp}
                  >
                    <MoveDown className="h-4 w-4 stroke-[3]" />
                  </Button>
                </div>
              )}

              {isSubmitted && (
                <div className="animate-in zoom-in-50 duration-300">
                  {item.correctIndex === index ? (
                    <CheckCircle2 className="h-5 w-5 text-white stroke-[4]" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600 stroke-[4] animate-in shake" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION: Feedback & Buttons */}
      <div className="shrink-0 space-y-4 pt-2 px-4 pb-6">
        {!isSubmitted ? (
          <Button
            className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
            onClick={handleCheck}
            disabled={disabledProp}
          >
            Check Order
          </Button>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-500">
            <div className={cn(
              "p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm",
              isCorrect ? "bg-emerald-50/50 border-emerald-500/20 shadow-emerald-500/5" : "bg-rose-50/50 border-rose-500/20 shadow-rose-500/5"
            )}>
              {isCorrect ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Correct</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 italic">"Excellent! The order is correct."</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Incorrect</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">The order is incorrect. Please try again.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Button
                className="h-11 w-full rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-100 shadow-lg shadow-emerald-500/20"
                disabled
              >
                Completed
              </Button>
              {!isLive && !isCorrect && (
                <Button
                  className="h-11 w-full rounded-xl bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-sm"
                  onClick={onLocalRetry}
                  disabled={disabledProp}
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center pt-1">
          <div className="px-4 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded">
            <span className="text-[7px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">
              Points: <span className="text-emerald-700">{state.dragItems.reduce((acc, item, idx) => acc + (item.correctIndex === idx ? (props.points || 15) / props.items!.length : 0), 0)}</span> / {props.points || 15}
            </span>
          </div>
        </div>
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
    props: { title, items },
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
