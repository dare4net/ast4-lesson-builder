"use client"

import React from "react"

import { useState, useCallback, useEffect } from "react"
import { useDrop } from "react-dnd"
import { useDrag } from "react-dnd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, GripVertical, Settings } from "lucide-react"
import type { Slide, Component } from "@/types/lesson"
import { ComponentRenderer } from "@/components/component-renderer"
import { ComponentEditor } from "@/components/component-editor"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface SlideEditorProps {
  slide: Slide
  updateSlide: (slide: Slide) => void
  addComponent: (type: string, defaultProps: Record<string, any>) => string
  isMobile?: boolean
}

export function SlideEditor({ slide, updateSlide, addComponent, isMobile = false }: SlideEditorProps) {
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)
  const [isComponentEditorOpen, setIsComponentEditorOpen] = useState(false)

  // Reset editing component when slide changes
  useEffect(() => {
    setEditingComponentId(null)
    setIsComponentEditorOpen(false)
  }, [slide.id])

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "COMPONENT",
      drop: (item: { type: string; defaultProps: Record<string, any> }) => {
        console.log("Component dropped:", item.type, "on slide:", slide.id)
        const newComponentId = addComponent(item.type, item.defaultProps)
        setEditingComponentId(newComponentId)
        if (isMobile) {
          setIsComponentEditorOpen(true)
        }
        return { addedTo: slide.id }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [slide.id, addComponent, isMobile],
  )

  const handleAddParagraph = useCallback(() => {
    console.log("Adding paragraph component")
    const newComponentId = addComponent("paragraph", { content: "Enter your text here..." })
    setEditingComponentId(newComponentId)
    if (isMobile) {
      setIsComponentEditorOpen(true)
    }
  }, [addComponent, isMobile])

  const updateComponent = useCallback(
    (componentId: string, updatedProps: Record<string, any>) => {
      console.log("Updating component:", componentId)
      const updatedComponents = slide.components.map((component) =>
        component.id === componentId ? { ...component, props: updatedProps } : component,
      )

      updateSlide({
        ...slide,
        components: updatedComponents,
      })
    },
    [slide, updateSlide],
  )

  const deleteComponent = useCallback(
    (componentId: string) => {
      console.log("Deleting component:", componentId)
      const updatedComponents = slide.components.filter((component) => component.id !== componentId)

      updateSlide({
        ...slide,
        components: updatedComponents,
      })

      if (editingComponentId === componentId) {
        setEditingComponentId(null)
        setIsComponentEditorOpen(false)
      }
    },
    [slide, updateSlide, editingComponentId],
  )

  const moveComponent = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragComponent = slide.components[dragIndex]
      const updatedComponents = [...slide.components]
      updatedComponents.splice(dragIndex, 1)
      updatedComponents.splice(hoverIndex, 0, dragComponent)

      updateSlide({
        ...slide,
        components: updatedComponents,
      })
    },
    [slide, updateSlide],
  )

  const updateSlideTitle = useCallback(
    (title: string) => {
      updateSlide({
        ...slide,
        title,
      })
    },
    [slide, updateSlide],
  )

  const currentComponent = slide.components.find((component) => component.id === editingComponentId)

  const addNewComponent = useCallback(
    (type: string, defaultProps: Record<string, any>) => {
      console.log("Adding paragraph component")
      const newComponentId = addComponent(type, defaultProps)
      setEditingComponentId(newComponentId)
      if (isMobile) {
        setIsComponentEditorOpen(true)
      }

      // Show a visual indicator for the newly added component
      setTimeout(() => {
        const element = document.getElementById(`component-${newComponentId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.classList.add("highlight-new-component")
          setTimeout(() => {
            element.classList.remove("highlight-new-component")
          }, 1500)
        }
      }, 100)

      return newComponentId
    },
    [addComponent, isMobile],
  )

  // Mobile UI
  if (isMobile) {
    return (
      <div className="flex-1 p-4 overflow-hidden flex flex-col" ref={drop}>
        <div className="mb-4">
          <Input
            value={slide.title}
            onChange={(e) => updateSlideTitle(e.target.value)}
            className="text-lg font-semibold"
            placeholder="Slide Title"
          />
        </div>

        <Card className={`flex-1 overflow-hidden ${isOver ? "border-primary border-dashed" : ""}`}>
          <CardContent className="p-4 h-full">
            <ScrollArea className="h-full">
              {slide.components.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <p>Drag and drop components here</p>
                  <p className="text-sm">or</p>
                  <Button variant="outline" className="mt-2" onClick={handleAddParagraph}>
                    Add Paragraph
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {slide.components.map((component, index) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                      index={index}
                      moveComponent={moveComponent}
                      deleteComponent={deleteComponent}
                      setEditingComponentId={(id) => {
                        setEditingComponentId(id)
                        setIsComponentEditorOpen(true)
                      }}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {currentComponent && (
          <Sheet open={isComponentEditorOpen} onOpenChange={setIsComponentEditorOpen} side="right">
            <SheetContent className="p-0 w-full sm:max-w-md">
              <ComponentEditor
                component={currentComponent}
                updateComponent={(props) => updateComponent(currentComponent.id, props)}
                onClose={() => {
                  setIsComponentEditorOpen(false)
                  setEditingComponentId(null)
                }}
                isMobile={isMobile}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>
    )
  }

  // Desktop UI
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 p-4 overflow-hidden flex flex-col" ref={drop}>
        <div className="mb-4">
          <Input
            value={slide.title}
            onChange={(e) => updateSlideTitle(e.target.value)}
            className="text-lg font-semibold"
            placeholder="Slide Title"
          />
        </div>

        <Card className={`flex-1 overflow-hidden ${isOver ? "border-primary border-dashed" : ""}`}>
          <CardContent className="p-6 h-full">
            <ScrollArea className="h-full">
              {slide.components.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <p>Drag and drop components here</p>
                  <p className="text-sm">or</p>
                  <Button variant="outline" className="mt-2" onClick={handleAddParagraph}>
                    Add Paragraph
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {slide.components.map((component, index) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                      index={index}
                      moveComponent={moveComponent}
                      deleteComponent={deleteComponent}
                      setEditingComponentId={setEditingComponentId}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {currentComponent && (
        <ComponentEditor
          component={currentComponent}
          updateComponent={(props) => updateComponent(currentComponent.id, props)}
          onClose={() => setEditingComponentId(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}

interface DraggableComponentProps {
  component: Component
  index: number
  moveComponent: (dragIndex: number, hoverIndex: number) => void
  deleteComponent: (id: string) => void
  setEditingComponentId: (id: string | null) => void
  isMobile?: boolean
}

function DraggableComponent({
  component,
  index,
  moveComponent,
  deleteComponent,
  setEditingComponentId,
  isMobile = false,
}: DraggableComponentProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: "COMPONENT_REORDER",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "COMPONENT_REORDER",
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveComponent(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  drag(drop(ref))

  return (
    <div
      id={`component-${component.id}`}
      ref={ref}
      className={`relative group border rounded-md p-4 hover:border-primary transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="absolute right-2 top-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={() => setEditingComponentId(component.id)} title="Edit Component">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => deleteComponent(component.id)} title="Delete Component">
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="cursor-move" title="Drag to Reorder">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      <ComponentRenderer component={component} isEditing={true} onClick={() => setEditingComponentId(component.id)} />
    </div>
  )
}
