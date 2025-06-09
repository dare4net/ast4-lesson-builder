"use client"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, GripVertical, X } from "lucide-react"
import type { Slide } from "@/types/lesson"

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
  const handleDragEnd = (result) => {
    if (!result.destination) return

    reorderSlides(result.source.index, result.destination.index)
  }

  const handleSlideClick = (index: number) => {
    setCurrentSlideIndex(index)
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

        <ScrollArea className="flex-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 space-y-2">
                  {slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 rounded-md cursor-pointer flex items-center group ${
                            index === currentSlideIndex
                              ? "bg-primary text-primary-foreground"
                              : "bg-card hover:bg-muted"
                          }`}
                          onClick={() => handleSlideClick(index)}
                        >
                          <div {...provided.dragHandleProps} className="mr-2 opacity-50 group-hover:opacity-100">
                            <GripVertical className="h-4 w-4" />
                          </div>

                          <div className="flex-1 truncate">
                            <span className="text-xs opacity-75">Slide {index + 1}</span>
                            <div className="truncate">{slide.title}</div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={`opacity-0 group-hover:opacity-100 ${
                              index === currentSlideIndex
                                ? "hover:bg-primary-foreground/20 text-primary-foreground"
                                : "hover:bg-muted-foreground/20"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSlide(index)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      </div>
    )
  }

  // Desktop UI
  return (
    <div className="w-64 border-r bg-muted/40 flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Slides</h2>
        <Button size="sm" onClick={addSlide}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="slides">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 space-y-2">
                {slides.map((slide, index) => (
                  <Draggable key={slide.id} draggableId={slide.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-3 rounded-md cursor-pointer flex items-center group ${
                          index === currentSlideIndex ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                        }`}
                        onClick={() => handleSlideClick(index)}
                      >
                        <div {...provided.dragHandleProps} className="mr-2 opacity-50 group-hover:opacity-100">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        <div className="flex-1 truncate">
                          <span className="text-xs opacity-75">Slide {index + 1}</span>
                          <div className="truncate">{slide.title}</div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className={`opacity-0 group-hover:opacity-100 ${
                            index === currentSlideIndex
                              ? "hover:bg-primary-foreground/20 text-primary-foreground"
                              : "hover:bg-muted-foreground/20"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSlide(index)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ScrollArea>
    </div>
  )
}
