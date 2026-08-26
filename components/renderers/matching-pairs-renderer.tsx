"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Lock } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { cn } from "@/lib/utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { useNavigationLock } from "@/context/navigation-lock-context"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import type { Component } from "@/types/lesson"

interface MatchingPair {
  id: string
  left: string
  right: string
}

interface MatchingPairsRendererProps {
  title?: string
  pairs: MatchingPair[]
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
  // Persistence & Base props
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
  status?: string
}

// State Definition
type MatchingPairsState = {
  leftItems: (MatchingPair & { selected: boolean })[]
  rightItems: (MatchingPair & { selected: boolean })[]
  selectedLeft: string | null
  selectedRight: string | null
  matches: Record<string, { rightId: string; color: string }>
  isChecking: boolean
  isCorrect: boolean
  matchStats: {
    correctCount: number
    noneCorrect: boolean
    someCorrect: boolean
  }
  mode: 'practice' | 'live'
  status?: string
}

const generatePastelColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 70%, 85%)`
}

function MatchingPairsContent({
  title,
  pairs,
  shuffled,
  isEditing,
  state,
  setState,
  handlePoints,
  handleRetry,
  isLive,
  isDisabled: disabledProp,
  props
}: ScoredRenderProps<MatchingPairsState> & {
  title: string
  pairs: MatchingPair[]
  shuffled: boolean
  isEditing: boolean
  isDisabled: boolean
  props: MatchingPairsRendererProps
}) {
  const { playFeedback } = useFeedback()
  const [mounted, setMounted] = useState(false)
  const { registerLock, unregisterLock } = useNavigationLock()
  const [hasStarted, setHasStarted] = useState(false)

  const timeLimit = (props as any).timeLimit || 10

  const {
    leftItems,
    rightItems,
    selectedLeft,
    selectedRight,
    matches,
    isChecking,
    isCorrect,
    matchStats
  } = state

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const isComplete = isChecking || state.status === 'completed'
    if (isLive && hasStarted && !isComplete) {
      registerLock(props.id || 'mp-renderer')
    } else {
      unregisterLock(props.id || 'mp-renderer')
    }
    return () => unregisterLock(props.id || 'mp-renderer')
  }, [isLive, hasStarted, isChecking, state.status, registerLock, unregisterLock, props.id])


  const onTimeout = () => {
    if (!isChecking) {
      // Auto check/submit
      // We need to call handleCheck logic. 
      // Logic: Perform validation on current matches.

      // This is a duplicate of handleCheck basically. 
      // Refactoring handleCheck to be outside might be cleaner, but for now:
      const results = Object.entries(matches).map(([leftId, { rightId }]) => {
        const leftItem = leftItems.find(item => item.id === leftId)
        const rightItem = rightItems.find(item => item.id === rightId)
        return leftItem && rightItem && leftItem.id === rightItem.id
      })
      const correctCount = results.filter(Boolean).length
      const allCorrect = correctCount === pairs.length && Object.keys(matches).length === pairs.length

      const earnedPoints = correctCount * (props.points || 15)
      handlePoints(earnedPoints)

      // State Update
      setState(prev => ({
        ...prev,
        isChecking: true,
        isCorrect: allCorrect,
        status: 'completed'
      }))

      if (!allCorrect) playFeedback('incorrect')
    }
  }


  // Initialization Effect (Shuffle)
  useEffect(() => {
    if (!mounted) return

    // Check if initialization is needed.
    // If we have items but rightItems match pairs order and we requested shuffle, we should shuffle?
    // But persistence: if `savedState` was loaded, `rightItems` might already be shuffled.
    // How to distinguish "Loaded Unshuffled State" vs "Brand New State"?
    // In `DragDrop`, we used `color` property.
    // Here, `selected` is standard.
    // Maybe we look at `rightItems` order.
    // Or we rely on a flag in state? No, avoid extra flags.
    // If state is EXACTLY initial state (unshuffled right items), AND `shuffled` is true, shuffle it.

    // Simplest approach: If `matchStats.correctCount === 0` and no matches and no selections...
    // But that's true for "Just Reset" too.

    // We can rely on `useEffect` running ONCE on mount (if we add a ref or dependency).
    // Or check if `rightItems` equals `pairs` (same order).

    const isUnshuffled = rightItems.length > 0 &&
      rightItems.every((item, idx) => item.id === pairs[idx]?.id)

    if (shuffled && isUnshuffled && !isEditing && Object.keys(matches).length === 0) {
      // Perform shuffle
      const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5)
      setState(prev => ({ ...prev, rightItems: shuffledRight }))
    }
  }, [mounted, shuffled, isEditing, pairs, rightItems, matches, setState])

  const handleLeftClick = async (id: string) => {
    if (disabledProp) return

    const isMatched = Object.keys(matches).includes(id)
    if (isChecking || isMatched) return

    await playFeedback('click', { sound: true, animation: false })

    setState(prev => {
      let newMatches = { ...prev.matches }
      let newSelLeft: string | null = id
      let newSelRight: string | null = prev.selectedRight

      if (prev.selectedRight) {
        // Form a match
        const color = generatePastelColor()
        newMatches[id] = { rightId: prev.selectedRight, color }
        newSelLeft = null
        newSelRight = null
      } else if (prev.selectedLeft === id) {
        // Deselect
        newSelLeft = null
      }

      return {
        ...prev,
        selectedLeft: newSelLeft,
        selectedRight: newSelRight,
        matches: newMatches
      }
    })
  }

  const handleRightClick = async (id: string) => {
    if (disabledProp) return

    const isMatched = Object.values(matches).some(m => m.rightId === id)
    if (isChecking || isMatched) return

    await playFeedback('click', { sound: true, animation: false })

    setState(prev => {
      let newMatches = { ...prev.matches }
      let newSelRight: string | null = id
      let newSelLeft: string | null = prev.selectedLeft

      if (prev.selectedLeft) {
        // Form a match
        const color = generatePastelColor()
        newMatches[prev.selectedLeft] = { rightId: id, color }
        newSelLeft = null
        newSelRight = null
      } else if (prev.selectedRight === id) {
        newSelRight = null
      }

      return {
        ...prev,
        selectedLeft: newSelLeft,
        selectedRight: newSelRight,
        matches: newMatches
      }
    })
  }

  const validateMatch = (leftId: string, rightId: string) => {
    const leftItem = leftItems.find(item => item.id === leftId)
    const rightItem = rightItems.find(item => item.id === rightId)
    return leftItem && rightItem && leftItem.id === rightItem.id
  }

  const handleCheck = async () => {
    if (disabledProp || state.isChecking || state.status === 'completed') return
    // Validate
    const results = Object.entries(matches).map(([leftId, { rightId }]) =>
      validateMatch(leftId, rightId)
    )
    const correctCount = results.filter(Boolean).length
    const allCorrect = correctCount === pairs.length && Object.keys(matches).length === pairs.length
    const noneCorrect = correctCount === 0
    const someCorrect = correctCount > 0 && !allCorrect

    // Feedback
    if (allCorrect) {
      await playFeedback('quizSuccess')
      // Legacy used 'correct'. I'll stick to 'customCorrect' or 'quizSuccess'.
      // Looking at hook usage in `quiz-renderer`: 'quizSuccess'.
      // Legacy said `playFeedback('correct')`. If strict on FeedbackType, 'correct' might not exist.
      // I'll use 'quizSuccess' as safe bet or 'dngSuccess'.
      // Legacy used 'correct'.
    } else if (correctCount > 0) {
      await playFeedback('complete')
    } else {
      await playFeedback('incorrect')
    }

    // Scoring (Using standardized handlePoints)
    const earnedPoints = correctCount * (props.points || 15)
    handlePoints(earnedPoints)

    // State Update
    setState(prev => ({
      ...prev,
      isChecking: true,
      isCorrect: allCorrect,
      matchStats: { correctCount, noneCorrect, someCorrect },
      status: 'completed'
    }))
  }

  const onLocalRetry = async () => {
    handleRetry() // Centralized handler
    // Logic: Reset matches, re-shuffle rightItems
    let newRight = [...pairs].map(p => ({ ...p, selected: false }))
    if (shuffled) {
      newRight.sort(() => Math.random() - 0.5)
    }

    setState(prev => ({
      ...prev,
      rightItems: newRight,
      matches: {},
      selectedLeft: null,
      selectedRight: null,
      isChecking: false,
      isCorrect: false,
      matchStats: { correctCount: 0, noneCorrect: false, someCorrect: false },
      status: 'active'
    }))
  }

  if (!mounted) return null

  // Live Start Screen
  if (isLive && !hasStarted && !isEditing && !isChecking && state.status !== 'completed') {
    return (
      <LiveStartScreen
        onStart={() => setHasStarted(true)}
        label={`Start Matching (${timeLimit}s Time Limit)`}
      />
    )
  }

  if (isEditing) {
    return (
      <div className="duo-card space-y-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {pairs.map((pair) => (
              <div key={`left-${pair.id}`} className="p-2 bg-muted rounded">
                {pair.left}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {pairs.map((pair) => (
              <div key={`right-${pair.id}`} className="p-2 bg-muted rounded">
                {pair.right}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const allPairsMatched = Object.keys(matches).length === pairs.length

  return (
    <div className={cn(
      "w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 group/matching transition-all duration-300 px-6 sm:px-10 md:px-12 py-2",
      disabledProp && "opacity-75"
    )}>

      {/* TOP SECTION: Progress & Meta */}
      <div className="shrink-0 space-y-3 pt-2">
        <div className="space-y-1">
          <div className="flex justify-between items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">{Math.round((Object.keys(matches).length / pairs.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-50 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
              style={{ width: `${(Object.keys(matches).length / pairs.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Matching Activity</span>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <div className="flex items-center gap-1.5">
                <LiveTimer
                  isCompleted={isChecking || state.status === 'completed'}
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
      </div>

      {/* CENTER SECTION: Interactive Match Grid */}
      <div className="flex-1 min-h-0 flex flex-col justify-center py-4 w-full">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 relative my-auto w-full">
          {/* Connector Lane (Hidden on mobile) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-100 dark:bg-slate-800 hidden md:block -translate-x-1/2 rounded-full" />

          {/* Source Nodes */}
          <div className="space-y-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Group A</span>
            {leftItems.map((item) => {
              const match = matches[item.id]
              const isMatched = !!match
              const isSelected = selectedLeft === item.id

              return (
                <button
                  key={`left-${item.id}`}
                  style={{
                    backgroundColor: isMatched && (!isChecking || item.id === match.rightId) ? match.color : undefined
                  }}
                  className={cn(
                    'group/node w-full p-4 text-left transition-all duration-200 relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm',
                    'border-b-4 active:border-b-0 active:translate-y-[2px]',
                    isSelected && 'border-[#1CB0F6] bg-[#1CB0F6]/5 border-b-[#0090CC]',
                    isMatched && !isChecking && 'border-emerald-500 border-b-emerald-600 font-bold',
                    isChecking && isMatched && (
                      item.id === match.rightId
                        ? 'border-emerald-500 border-b-emerald-600 text-slate-900 dark:text-slate-100 font-bold'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 border-b-rose-600 text-rose-600 font-bold'
                    ),
                    (isMatched || isChecking || disabledProp) && 'cursor-not-allowed',
                    !isMatched && !isChecking && !disabledProp && 'hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5 cursor-pointer'
                  )}
                  onClick={() => handleLeftClick(item.id)}
                  disabled={isMatched || isChecking || disabledProp}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-bold text-xs md:text-sm tracking-tight">{item.left}</span>
                    {isChecking && isMatched && (
                      item.id === match.rightId
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[3] animate-in zoom-in-50" />
                        : <XCircle className="w-4 h-4 text-rose-600 stroke-[3] animate-in shake" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Destination Nodes */}
          <div className="space-y-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Group B</span>
            {rightItems.map((item) => {
              const matchEntry = Object.entries(matches).find(([_, m]) => m.rightId === item.id)
              const isMatched = !!matchEntry
              const isSelected = selectedRight === item.id
              const match = matchEntry ? matches[matchEntry[0]] : null

              return (
                <button
                  key={`right-${item.id}`}
                  style={{
                    backgroundColor: isMatched && match && (!isChecking || matchEntry?.[0] === item.id) ? match.color : undefined
                  }}
                  className={cn(
                    'group/node w-full p-4 text-left transition-all duration-200 relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm',
                    'border-b-4 active:border-b-0 active:translate-y-[2px]',
                    isSelected && 'border-[#1CB0F6] bg-[#1CB0F6]/5 border-b-[#0090CC]',
                    isMatched && !isChecking && 'border-emerald-500 border-b-emerald-600 font-bold',
                    isChecking && isMatched && (
                      matchEntry?.[0] === item.id
                        ? 'border-emerald-500 border-b-emerald-600 text-slate-900 dark:text-slate-100 font-bold'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 border-b-rose-600 text-rose-600 font-bold'
                    ),
                    (isMatched || isChecking || disabledProp) && 'cursor-not-allowed',
                    !isMatched && !isChecking && !disabledProp && 'hover:border-[#1CB0F6]/60 hover:bg-[#1CB0F6]/5 cursor-pointer'
                  )}
                  onClick={() => handleRightClick(item.id)}
                  disabled={isMatched || isChecking || disabledProp}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-bold text-xs md:text-sm tracking-tight">{item.right}</span>
                    {isChecking && isMatched && (
                      matchEntry?.[0] === item.id
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[3] animate-in zoom-in-50" />
                        : <XCircle className="w-4 h-4 text-rose-600 stroke-[3] animate-in shake" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Feedback & Buttons */}
      <div className="shrink-0 space-y-3 pb-4 pt-1">
        <div className="min-h-[52px] flex flex-col justify-end">
          {isChecking && (
            <div className={cn(
              'p-6 rounded-2xl border-2 animate-in slide-in-from-top-2 duration-500 shadow-sm',
              isCorrect ? 'bg-emerald-50/50 border-emerald-500/20 shadow-emerald-500/5' : 'bg-rose-50/50 border-rose-500/20 shadow-rose-500/5'
            )}>
              {isCorrect ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Correct</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-tight">Excellent! All pairs matched correctly.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Incorrect</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 leading-tight">
                    {matchStats.noneCorrect
                      ? "Incorrect. Please try matching them again."
                      : matchStats.someCorrect
                        ? `Partial match. ${matchStats.correctCount} / ${pairs.length} correct.`
                        : "Some matches are incorrect."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full min-h-[56px] flex items-center justify-center shrink-0">
          {!isChecking && allPairsMatched && (
            <button
              className="px-6 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46a302] border-b-4 border-[#3B8C00] active:border-b-0 active:translate-y-[2px] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              onClick={handleCheck}
              disabled={disabledProp}
            >
              Check Matches
            </button>
          )}

          {isChecking && (
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-5 py-2.5 rounded-xl bg-emerald-600 border-b-4 border-emerald-800 text-white font-black uppercase text-xs tracking-wider cursor-default"
                disabled
              >
                Completed ✓
              </button>
              {!isLive && (
                <button
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-4 border-emerald-500 border-b-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all font-black uppercase text-xs tracking-wider active:border-b-2 active:translate-y-[2px] cursor-pointer"
                  onClick={onLocalRetry}
                  disabled={disabledProp}
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center pt-1">
          <div className="px-4 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded">
            <span className="text-[7px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">
              Matches: <span className="text-emerald-700">{Object.keys(matches).length}</span> / {pairs.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MatchingPairsRenderer(props: MatchingPairsRendererProps) {
  const {
    title = "Match the items",
    pairs = [],
    shuffled = true,
    points = 15,
    isEditing = false,
    scoreContext,
    savedState,
    setComponentState,
    mode = 'practice',
    state: componentState = 'active',
    disabled = false,
    id = 'matching-pairs-renderer',
    status
  } = props

  const component: Component = {
    id,
    type: 'matchingPairs',
    state: componentState as any,
    status: (status || (savedState as any)?.status || 'uncompleted') as any,
    props: { title, pairs, points },
    mode: mode as any
  } as Component

  const initialState: MatchingPairsState = {
    leftItems: pairs.map(p => ({ ...p, selected: false })),
    rightItems: pairs.map(p => ({ ...p, selected: false })), // Initially unshuffled
    selectedLeft: null,
    selectedRight: null,
    matches: {},
    isChecking: false,
    isCorrect: false,
    matchStats: { correctCount: 0, noneCorrect: false, someCorrect: false },
    mode
  }

  return (
    <ScoredRenderer<MatchingPairsState>
      component={component}
      initialState={initialState}
      savedState={savedState}
      setComponentState={setComponentState}
      points={points}
      mode={mode}
      disabled={disabled}
      onRender={(renderProps) => (
        <MatchingPairsContent
          {...renderProps}
          title={title}
          pairs={pairs}
          shuffled={shuffled}
          isEditing={isEditing}
          isDisabled={disabled || component.state === 'disabled'}
          props={props}
        />
      )}
    />
  )
}
