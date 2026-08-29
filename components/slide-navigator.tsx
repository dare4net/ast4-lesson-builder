"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import type { XYCoord } from "react-dnd"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { Slide } from "@/types/lesson"
import { SlideValidationResult } from "@/lib/validation/types"
import { useFeedback } from "@/lib/feedback-context"
import { cn } from "@/lib/utils"
import { getCategorizedComponents, formatSlideTitle } from "@/lib/lesson-utils"

const SLIDE_DND_TYPE = "SLIDE_NAV_ITEM"

interface SlideDragItem {
  index: number
}

interface SlideNavigatorProps {
  slides: Slide[]
  currentSlideIndex: number
  setCurrentSlideIndex: (index: number) => void
  addSlide: () => void
  deleteSlide: (index: number) => void
  reorderSlides: (startIndex: number, endIndex: number) => void
  slideResults?: Record<string, SlideValidationResult>
  isMobile?: boolean
}

export function SlideNavigator({
  slides,
  currentSlideIndex,
  setCurrentSlideIndex,
  addSlide,
  deleteSlide,
  reorderSlides,
  slideResults,
  isMobile = false,
}: SlideNavigatorProps) {
  const [mounted, setMounted] = useState(false)
  const { playFeedback } = useFeedback()

  useEffect(() => {
    setMounted(true)
  }, [])

  const moveSlideUp = useCallback(async (index: number) => {
    if (index > 0) {
      reorderSlides(index, index - 1)
      await playFeedback('click')
    }
  }, [reorderSlides, playFeedback])

  const moveSlideDown = useCallback(async (index: number) => {
    if (index < slides.length - 1) {
      reorderSlides(index, index + 1)
      await playFeedback('click')
    }
  }, [slides.length, reorderSlides, playFeedback])

  const handleSlideClick = (index: number) => {
    setCurrentSlideIndex(index)
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col h-full bg-[#1e293b]/10 backdrop-blur-sm">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
        <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Project Timeline</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={addSlide}
          className="h-8 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-[#0F172A] px-3 font-bold text-[10px]"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Slide
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {slides.map((slide, index) => (
            <SlideNavItem
              key={slide.id}
              slide={slide}
              index={index}
              isCurrent={currentSlideIndex === index}
              slideRes={slideResults?.[slide.id]}
              onSelect={() => handleSlideClick(index)}
              onMoveUp={() => moveSlideUp(index)}
              onMoveDown={() => moveSlideDown(index)}
              onDelete={() => deleteSlide(index)}
              isLast={index === slides.length - 1}
              reorderSlides={reorderSlides}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function SlideNavItem({
  slide,
  index,
  isCurrent,
  slideRes,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  isLast,
  reorderSlides,
}: {
  slide: Slide
  index: number
  isCurrent: boolean
  slideRes?: SlideValidationResult
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  isLast: boolean
  reorderSlides: (startIndex: number, endIndex: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const hasErrors = slideRes ? (!slideRes.isValid || slideRes.errors.length > 0) : false
  const hasWarnings = slideRes ? (slideRes.warnings.length > 0 && !hasErrors) : false

  const [{ isDragging }, drag] = useDrag<SlideDragItem, void, { isDragging: boolean }>({
    type: SLIDE_DND_TYPE,
    item: () => ({ index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  const [, drop] = useDrop<SlideDragItem>({
    accept: SLIDE_DND_TYPE,
    hover(item, monitor) {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return
      reorderSlides(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drop(ref)
  drag(handleRef)

  return (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-xl transition-all duration-200",
        isCurrent
          ? hasErrors
            ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-[#0F172A]"
            : hasWarnings
              ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-[#0F172A]"
              : "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0F172A]"
          : "hover:scale-[1.02]",
        isDragging && "scale-105 shadow-2xl z-50 ring-2 ring-emerald-500 opacity-60"
      )}
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer transition-all",
          slide.state === "disabled" && "opacity-40 grayscale",
          hasErrors && "border-rose-500/80 bg-rose-950/20 shadow-md shadow-rose-950/40",
          hasWarnings && "border-amber-500/80 bg-amber-950/20 shadow-md shadow-amber-950/40",
          isCurrent && !hasErrors && !hasWarnings && "border-emerald-500/50 bg-slate-800/80 shadow-lg shadow-emerald-500/5"
        )}
        onClick={onSelect}
      >
        <div className={cn(
          "px-3 py-2 border-b flex items-center justify-between transition-colors",
          hasErrors
            ? "border-rose-900/50 bg-rose-950/60 text-rose-300"
            : hasWarnings
              ? "border-amber-900/50 bg-amber-950/60 text-amber-300"
              : "border-slate-800/50 bg-slate-900/80 text-slate-400"
        )}>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
              hasErrors
                ? "bg-rose-900/90 text-rose-200"
                : hasWarnings
                  ? "bg-amber-900/90 text-amber-200"
                  : "bg-slate-950 text-slate-500"
            )}>
              Slide {index + 1}
            </span>
            {hasErrors ? (
              <div className="flex items-center gap-1 text-rose-400 font-bold text-[10px]" title={`${slideRes?.errors.length} validation errors`}>
                <XCircle className="h-3 w-3 text-rose-500 animate-pulse" />
                <span>{slideRes?.errors.length} Error{slideRes && slideRes.errors.length > 1 ? 's' : ''}</span>
              </div>
            ) : hasWarnings ? (
              <div className="flex items-center gap-1 text-amber-400 font-bold text-[10px]" title={`${slideRes?.warnings.length} validation warnings`}>
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span>{slideRes?.warnings.length} Warn</span>
              </div>
            ) : slide.status === "completed" ? (
              <CheckCircle className="h-3 w-3 text-emerald-500" />
            ) : null}
          </div>
          <div ref={handleRef} className="opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
            <GripVertical className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        <div className="p-3">
          <h4 className={cn(
            "text-xs font-bold truncate transition-colors",
            isCurrent ? "text-white" : "text-slate-400"
          )}>
            {formatSlideTitle(slide.title, 20)}
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(() => {
              const categorized = getCategorizedComponents(slide.components)
              const total = slide.components.length
              if (total === 0) return <span className="text-[9px] text-slate-600 italic">Empty slide</span>
              return (
                <>
                  {categorized.interactive.length > 0 && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded cursor-default">
                      {categorized.interactive.length} Labs
                    </div>
                  )}
                  {categorized.gamified.length > 0 && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400/80 bg-blue-500/10 px-1.5 py-0.5 rounded cursor-default">
                      {categorized.gamified.length} Play
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>

        <div className="absolute top-10 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col gap-1 translate-x-2 group-hover:translate-x-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Move slide up"
            className="h-7 w-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Move slide down"
            className="h-7 w-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            disabled={isLast}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete slide"
            className="h-7 w-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
