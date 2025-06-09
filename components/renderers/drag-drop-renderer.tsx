"use client"

import { useState, useEffect } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ArrowDownUp } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import React from "react"

interface DragItem {
  id: string
  text: string
  correctIndex: number
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
}

export function DragDropRenderer({
  title = "Arrange in the correct order",
  items = [],
  shuffled = true,
  points = 15,
  isEditing = false,
  scoreContext,
}: DragDropRendererProps) {
  const [dragItems, setDragItems] = useState<DragItem[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const isMobile = useMobile()

  // Initialize the items
  useEffect(() => {
    if (isEditing) {
      // In editing mode, show items in correct order
      setDragItems([...items].sort((a, b) => a.correctIndex - b.correctIndex))
      return
    }

    // Create a copy of the items
    let itemsCopy = [...items]

    // Shuffle the items if needed
    if (shuffled) {
      itemsCopy = itemsCopy.sort(() => Math.random() - 0.5)
    }

    setDragItems(itemsCopy)
    setIsSubmitted(false)
    setIsCorrect(false)
  }, [items, shuffled, isEditing])

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    if (isSubmitted) return

    const draggedItem = dragItems[dragIndex]
    const updatedItems = [...dragItems]
    updatedItems.splice(dragIndex, 1)
    updatedItems.splice(hoverIndex, 0, draggedItem)
    setDragItems(updatedItems)
  }

  const handleSubmit = () => {
    // Check if the order is correct
    const isOrderCorrect = dragItems.every((item, index) => {
      const correctItem = items.find((i) => i.correctIndex === index)
      return item.id === correctItem?.id
    })

    setIsCorrect(isOrderCorrect)
    setIsSubmitted(true)

    // Add points if correct and scoreContext is available
    if (isOrderCorrect && scoreContext) {
      scoreContext.addPoints(points)
    }
  }

  const handleReset = () => {
    // Shuffle the items again
    let itemsCopy = [...items]
    if (shuffled) {
      itemsCopy = itemsCopy.sort(() => Math.random() - 0.5)
    }

    setDragItems(itemsCopy)
    setIsSubmitted(false)
    setIsCorrect(false)
  }

  // In editing mode, show a simplified version
  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="space-y-2">
          {dragItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-muted rounded">
              <span className="text-muted-foreground">{index + 1}.</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const Backend = isMobile ? TouchBackend : HTML5Backend

  return (
    <DndProvider backend={Backend}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dragItems.map((item, index) => (
              <DraggableItem
                key={item.id}
                id={item.id}
                text={item.text}
                index={index}
                moveItem={moveItem}
                isSubmitted={isSubmitted}
                isCorrect={isCorrect && items.find((i) => i.id === item.id)?.correctIndex === index}
              />
            ))}
          </div>

          {isSubmitted && (
            <div
              className={`mt-4 p-3 rounded flex items-center ${
                isCorrect
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Great job! The order is correct.</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  <span>The order is not correct. Try again!</span>
                </>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!isSubmitted ? (
            <Button onClick={handleSubmit}>Check Order</Button>
          ) : (
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          )}

          {points > 0 && <div className="ml-auto text-sm text-muted-foreground">Points: {points}</div>}
        </CardFooter>
      </Card>
    </DndProvider>
  )
}

interface DraggableItemProps {
  id: string
  text: string
  index: number
  moveItem: (dragIndex: number, hoverIndex: number) => void
  isSubmitted: boolean
  isCorrect: boolean
}

// Update the DraggableItem component to fix reordering in preview mode
function DraggableItem({ id, text, index, moveItem, isSubmitted, isCorrect }: DraggableItemProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: "DRAG_ITEM",
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isSubmitted,
  })

  const [, drop] = useDrop({
    accept: "DRAG_ITEM",
    hover: (item: { id: string; index: number }, monitor) => {
      if (isSubmitted) return
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect()

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
      moveItem(dragIndex, hoverIndex)

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
      ref={ref}
      className={`p-3 border rounded flex items-center justify-between cursor-move transition-colors ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        isSubmitted
          ? isCorrect
            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          : "hover:border-primary"
      }`}
    >
      <span>{text}</span>
      {!isSubmitted && <ArrowDownUp className="h-4 w-4 text-muted-foreground" />}
      {isSubmitted &&
        (isCorrect ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        ))}
    </div>
  )
}
