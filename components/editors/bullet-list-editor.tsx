"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BulletListEditorProps {
  items: string[]
  onChange: (items: string[]) => void
}

export function BulletListEditor({ items, onChange }: BulletListEditorProps) {
  const addItem = () => {
    const newItems = [...items, "New item"]
    onChange(newItems)
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    onChange(newItems)
  }

  const deleteItem = (index: number) => {
    if (items.length <= 1) {
      return // Don't delete if only 1 item left
    }
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = items[dragIndex]
    const newItems = [...items]
    newItems.splice(dragIndex, 1)
    newItems.splice(hoverIndex, 0, dragItem)
    onChange(newItems)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>List Items</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {items.map((item, index) => (
              <DraggableListItem
                key={index}
                index={index}
                item={item}
                updateItem={updateItem}
                deleteItem={deleteItem}
                moveItem={moveItem}
                isLastItem={items.length <= 1}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </DndProvider>
  )
}

interface DraggableListItemProps {
  index: number
  item: string
  updateItem: (index: number, value: string) => void
  deleteItem: (index: number) => void
  moveItem: (dragIndex: number, hoverIndex: number) => void
  isLastItem: boolean
}

function DraggableListItem({ index, item, updateItem, deleteItem, moveItem, isLastItem }: DraggableListItemProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: "LIST_ITEM",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "LIST_ITEM",
    hover: (draggedItem: { index: number }, monitor) => {
      if (!ref.current) return
      const dragIndex = draggedItem.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      draggedItem.index = hoverIndex
    },
  })

  drag(drop(ref))

  return (
    <div ref={ref} className={`flex items-center gap-2 ${isDragging ? "opacity-50" : "opacity-100"}`}>
      <div className="cursor-move p-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <Input
        value={item}
        onChange={(e) => updateItem(index, e.target.value)}
        placeholder={`Item ${index + 1}`}
        className="flex-1"
      />

      <Button variant="ghost" size="icon" onClick={() => deleteItem(index)} disabled={isLastItem}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
