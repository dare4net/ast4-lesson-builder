"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, X, ChevronUp, ChevronDown, Lock, CheckCircle } from "lucide-react"
import type { Slide } from "@/types/lesson"
import { useFeedback } from "@/lib/feedback-context"
import { cn } from "@/lib/utils"

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

  const renderSlideList = () => {
    if (!mounted) {
      return (
        <div className="p-2 space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`py-3 px-2 rounded-md cursor-pointer flex items-center group ${
                index === currentSlideIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              }`}
              onClick={() => handleSlideClick(index)}
            >
              <div className="flex flex-col mr-2 gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-5 w-5 p-0 ${
                    index === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                  }`}
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
                  size="sm"
                  className={`h-5 w-5 p-0 ${
                    index === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveSlideDown(index)
                  }}
                  disabled={index === slides.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 truncate min-w-0">
                <span className="text-xs opacity-75 block">Slide {index + 1}</span>
                <div className="truncate text-sm">{slide.title}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="p-2 space-y-2"
            >
              {slides.map((slide, index) => (
                <Draggable key={slide.id} draggableId={slide.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`py-3 px-2 rounded-md cursor-pointer flex items-center group ${
                        index === currentSlideIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-card hover:bg-muted"
                      }`}
                      onClick={() => handleSlideClick(index)}
                    >
                      <div className="flex flex-col mr-2 gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-5 w-5 p-0 ${
                            index === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                          }`}
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
                          size="sm"
                          className={`h-5 w-5 p-0 ${
                            index === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSlideDown(index)
                          }}
                          disabled={index === slides.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 truncate min-w-0">
                        <span className="text-xs opacity-75 block">Slide {index + 1}</span>
                        <div className="truncate text-sm">{slide.title}</div>
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
    )
  }

  // Mobile UI
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Slides</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={addSlide}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                document.querySelector('[data-state="open"]')?.dispatchEvent(new Event("close", { bubbles: true }))
              }
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">{renderSlideList()}</ScrollArea>
      </div>
    )
  }

  // Desktop UI
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Slides</h2>
        <Button size="sm" onClick={addSlide}>
          <Plus className="h-4 w-4 mr-1" />
          Add Slide
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "group relative mb-2",
                            currentSlideIndex === index && "ring-2 ring-primary"
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-md border bg-background",
                              slide.state === "disabled" && "opacity-50",
                              currentSlideIndex === index && "border-primary"
                            )}
                            onClick={() => setCurrentSlideIndex(index)}
                            role="button"
                            tabIndex={0}
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">
                                  {slide.title || `Slide ${index + 1}`}
                                </p>
                                <div className="flex gap-1">
                                  {slide.state === "disabled" && (
                                    <Badge variant="secondary" className="px-1">
                                      <Lock className="h-3 w-3" />
                                    </Badge>
                                  )}
                                  {slide.status === "completed" && (
                                    <Badge variant="primary" className="px-1">
                                      <CheckCircle className="h-3 w-3" />
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                {slide.categorizedComponents?.interactive?.length > 0 && (
                                  <span>{slide.categorizedComponents.interactive.length} Interactive</span>
                                )}
                                {slide.categorizedComponents?.gamified?.length > 0 && (
                                  <span>{slide.categorizedComponents.gamified.length} Gamified</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {!isMobile && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={index === 0}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moveSlideUp(index)
                                    }}
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={index === slides.length - 1}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moveSlideDown(index)
                                    }}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-destructive/90 hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSlide(index)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
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
