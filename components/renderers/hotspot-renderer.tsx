"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import type { Component } from "@/types/lesson"

interface Hotspot {
  id: string
  x: number
  y: number
  label: string
  content: string
}

interface HotspotRendererProps {
  title?: string
  image: string
  hotspots: Hotspot[]
  isEditing?: boolean
  points?: number
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
  id?: string
  status?: string
  behavior?: 'discovery' | 'quiz'
}

type HotspotState = {
  discoveredHotspots: string[]
  status?: string
}

function HotspotContent({
  title,
  image,
  hotspots,
  points,
  state,
  setState,
  handleScore,
  handleRetry,
  isLive,
  isDisabled: disabledProp,
  props
}: ScoredRenderProps<HotspotState> & {
  title: string
  image: string
  hotspots: Hotspot[]
  points: number
  isDisabled: boolean
  props: HotspotRendererProps
}) {
  const [mounted, setMounted] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { discoveredHotspots } = state

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate image dimensions when it loads
  const updateImageSize = () => {
    // Only used for sizing? Logic seems to just use CSS positioning (%).
    // Maybe previously it did calculations?
    // Step 488 shows `updateImageSize` setting `imageSize` state but that state was unused in render?
    // Wait, Step 488, line 56: `const [imageSize, setImageSize] = useState(...)`
    // Line 112: `setImageSize(...)`.
    // It is NEVER used in render in Step 488?
    // Yes, Step 488 lines 193-236 don't use `imageSize`.
    // The previous implementation calculated size but didn't use it.
    // I can remove it.
  }

  // Effect to check validation?
  // Previous used effect at line 84: `setComponentState` if `setComponentState` exists.
  // ScoredRenderer handles persistence.
  // But we need to handle "All Discovered" logic for Live Mode scoring.

  // Logic from `handleHotspotClick` (Step 488 line 119):
  // Check validation immediately.

  const handleHotspotClick = (hotspotId: string) => {
    if (disabledProp || discoveredHotspots.includes(hotspotId)) return

    const newDiscovered = [...discoveredHotspots, hotspotId]
    const behavior = props.behavior || (props as any).subType === 'clickableImage' ? 'discovery' : 'quiz'

    // Check completion
    const allDiscovered = newDiscovered.length === hotspots.length

    // Scoring (Using standardized handleScore)
    // Only award points in Quiz mode, or if Discovery mode is treated as a task
    if (allDiscovered) {
      handleScore(true)
    }

    setState(prev => ({
      ...prev,
      discoveredHotspots: newDiscovered,
      status: (isLive || allDiscovered || behavior === 'discovery') ? 'completed' : 'active'
    }))
  }

  const onLocalRetry = () => {
    handleRetry() // Centralized handler
    setState(prev => ({
      ...prev,
      discoveredHotspots: [],
      status: 'active'
    }))
  }

  if (!mounted) return null

  // Editing Mode
  if (props.isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="relative">
          <img
            src={image || "/placeholder.svg?height=300&width=400"}
            alt={title}
            className="w-full h-auto rounded-md"
          />
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs"
              style={{
                left: `${hotspot.x * 100}%`,
                top: `${hotspot.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {hotspots.indexOf(hotspot) + 1}
            </div>
          ))}
        </div>
        {hotspots.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {hotspots.length} hotspot{hotspots.length !== 1 ? "s" : ""} defined
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "w-full flex-1 flex flex-col bg-white transition-all duration-300 px-6",
      disabledProp && "opacity-75"
    )}>
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />

      {/* TOP SECTION: Meta */}
      <div className="shrink-0 space-y-2 pt-2">
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Image Exploration</span>
            <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {(props.behavior === 'discovery' || (props as any).subType === 'clickableImage') && (
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[7px] font-black border border-emerald-100 uppercase tracking-widest">
                Explore
              </span>
            )}
            {isLive && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[7px] font-black border border-blue-200 uppercase tracking-widest">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>Live</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CENTER SECTION: Image Stage */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
        <div className="flex items-center justify-center w-full h-full">
          <div className="relative inline-block shrink-0 rounded-2xl border-2 border-emerald-100 bg-white overflow-hidden shadow-sm group/stage max-w-full" ref={containerRef}>
            <img
              ref={imageRef}
              src={image || "/placeholder.svg?height=300&width=400"}
              alt={title}
              className="max-h-[55vh] w-auto h-auto object-contain transition-transform duration-700 group-hover/stage:scale-[1.01] block"
            />

            <TooltipProvider>
              {hotspots.map((hotspot, idx) => {
                const isDiscovered = discoveredHotspots.includes(hotspot.id)

                return (
                  <Tooltip key={hotspot.id}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "absolute w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 shadow-lg",
                          isDiscovered
                            ? "bg-emerald-500 border-white text-white scale-110 shadow-emerald-500/20"
                            : "bg-white border-emerald-500 text-emerald-600 hover:scale-110 shadow-black/5"
                        )}
                        style={{
                          left: `${hotspot.x * 100}%`,
                          top: `${hotspot.y * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={() => handleHotspotClick(hotspot.id)}
                      >
                        <span className="text-[10px] font-black">{idx + 1}</span>
                        {!isDiscovered && (
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white border-2 border-emerald-500 text-slate-900 rounded-xl p-4 shadow-xl animate-in zoom-in-95 backdrop-blur-sm z-50">
                      <div className="max-w-xs space-y-1.5">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{hotspot.label}</p>
                        <p className="text-sm font-black text-slate-900 leading-tight">{hotspot.content}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Feedback & Buttons */}
      <div className="shrink-0 space-y-3 pb-4">
        <div className="min-h-[60px] flex flex-col justify-end">
          {discoveredHotspots.length === hotspots.length ? (
            <div className="p-4 rounded-2xl border-2 bg-emerald-50/50 border-emerald-500/20 animate-in slide-in-from-top-2 duration-500 shadow-emerald-500/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Activity Complete</span>
              </div>
              <p className="text-sm font-black text-slate-900 mt-1 italic">You've found all hotspots!</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Progress: <span className="text-emerald-600">{discoveredHotspots.length}</span> / {hotspots.length}
                </span>
              </div>
              {disabledProp && (
                <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-400 uppercase tracking-widest">
                  <Lock className="h-2.5 w-2.5" />
                  <span>Locked</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            className="h-11 rounded-xl bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-sm"
            onClick={onLocalRetry}
            disabled={disabledProp || (isLive && discoveredHotspots.length === hotspots.length)}
          >
            Start Over
          </Button>
          {points > 0 && (
            <div className="h-11 flex items-center justify-center rounded-xl bg-emerald-50/50 border-2 border-emerald-100 transition-all">
              <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">
                Points: <span className="text-emerald-700">{points} Points</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function HotspotRenderer(props: HotspotRendererProps) {
  const {
    title = "Interactive Image",
    image,
    hotspots = [],
    isEditing = false,
    points = 10,
    scoreContext,
    mode = 'practice',
    state: componentState = 'active',
    disabled = false,
    savedState,
    setComponentState,
    id = "hotspot-renderer",
    status,
    behavior = 'quiz',
    ...rest
  } = props

  // Handle migration from clickableImage
  const effectiveType = (props as any).type === 'clickableImage' ? 'hotspot' : 'hotspot'
  const effectiveBehavior = (props as any).type === 'clickableImage' || (props as any).subType === 'clickableImage'
    ? 'discovery'
    : behavior

  const component: Component = {
    id,
    type: 'hotspot',
    state: componentState as any,
    status: (status || (savedState as any)?.status || 'uncompleted') as any,
    props: {
      ...rest, // Capture any other props
      title,
      image,
      hotspots,
      behavior: effectiveBehavior
    },
    mode: mode as any
  } as Component

  const initialState: HotspotState = {
    discoveredHotspots: [],
    status: 'active'
  }

  return (
    <ScoredRenderer<HotspotState>
      component={component}
      initialState={initialState}
      savedState={savedState}
      setComponentState={setComponentState}
      points={points}
      mode={mode}
      disabled={disabled}
      onRender={(renderProps) => (
        <HotspotContent
          {...renderProps}
          title={title}
          image={image}
          hotspots={hotspots}
          points={points}
          isDisabled={disabled || component.state === 'disabled'}
          props={props}
        />
      )}
    />
  )
}
