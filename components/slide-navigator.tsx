"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, GripVertical, X, ChevronUp, ChevronDown } from "lucide-react"
import type { Slide } from "@/types/lesson"
import { useFeedback } from "@/lib/feedback-context"

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
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-sm font-semibold">Slides</h2>
        <Button onClick={addSlide}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <div className="flex-1">
        {mounted ? (
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
        ) : (
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
        )}
      </div>
    </div>
  )
}
