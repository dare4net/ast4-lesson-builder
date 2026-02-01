"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Lock, CheckCircle, Ghost } from "lucide-react"
import type { Slide } from "@/types/lesson"
import { useFeedback } from "@/lib/feedback-context"
import { cn } from "@/lib/utils"
import { getCategorizedComponents } from "@/lib/lesson-utils"

interface SlideNavigatorProps {
  slides: Slide[]
  currentSlideIndex: number
  setCurrentSlideIndex: (index: number) => void
  addSlide: () => void
  deleteSlide: (index: number) => void
  reorderSlides: (startIndex: number, endIndex: number) => void
  isMobile?: boolean
}

export function SlideNavigator({
  slides,
  currentSlideIndex,
  setCurrentSlideIndex,
  addSlide,
  deleteSlide,
  reorderSlides,
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    reorderSlides(result.source.index, result.destination.index)
  }

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
        <div className="p-3">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "group relative rounded-xl transition-all duration-200",
                            currentSlideIndex === index ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0F172A]" : "hover:scale-[1.02]",
                            snapshot.isDragging && "scale-105 shadow-2xl z-50 ring-2 ring-emerald-500"
                          )}
                        >
                          <div
                            className={cn(
                              "flex flex-col overflow-hidden bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer",
                              slide.state === "disabled" && "opacity-40 grayscale",
                              currentSlideIndex === index && "border-emerald-500/50 bg-slate-800/80 shadow-lg shadow-emerald-500/5"
                            )}
                            onClick={() => handleSlideClick(index)}
                          >
                            {/* Slide Header Info */}
                            <div className="px-3 py-2 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/80">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  Slide {index + 1}
                                </span>
                                {slide.status === "completed" && (
                                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                                )}
                              </div>
                              <div {...provided.dragHandleProps} className="opacity-40 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="h-3 w-3 text-slate-400" />
                              </div>
                            </div>

                            {/* Slide Content Preview */}
                            <div className="p-3">
                              <h4 className={cn(
                                "text-xs font-bold truncate transition-colors",
                                currentSlideIndex === index ? "text-white" : "text-slate-400"
                              )}>
                                {slide.title || "Untitled Fragment"}
                              </h4>

                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {(() => {
                                  const categorized = getCategorizedComponents(slide.components);
                                  const total = slide.components.length;
                                  if (total === 0) return <span className="text-[9px] text-slate-600 italic">Empty scene</span>;

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
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-10 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col gap-1 translate-x-2 group-hover:translate-x-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveSlideUp(index)
                                }}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveSlideDown(index)
                                }}
                                disabled={index === slides.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSlide(index)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </ScrollArea>
    </div>
  )
}
