"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

interface DragItem {
  id: string
  text: string
  correctIndex: number
}

interface DragDropEditorProps {
  items: DragItem[]
  onChange: (items: DragItem[]) => void
}

export function DragDropEditor({ items, onChange }: DragDropEditorProps) {
  const addItem = () => {
    const newItem: DragItem = {
      id: `item-${Date.now()}`,
      text: "New Item",
      correctIndex: items.length,
    }
    onChange([...items, newItem])
  }

  const updateItem = (index: number, text: string) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      text,
    }
    onChange(updatedItems)
  }

  const deleteItem = (index: number) => {
    if (items.length <= 2) {
      return // Don't delete if only 2 items left
    }

    const updatedItems = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        correctIndex: i,
      }))

    onChange(updatedItems)
  }

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex]
    const updatedItems = [...items]

    // Remove the item from its original position
    updatedItems.splice(dragIndex, 1)

    // Insert the item at the new position
    updatedItems.splice(hoverIndex, 0, draggedItem)

    // Update correctIndex for all items
    const reindexedItems = updatedItems.map((item, index) => ({
      ...item,
      correctIndex: index,
    }))

    onChange(reindexedItems)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Items (in correct order)</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <DraggableEditorItem
              key={item.id}
              index={index}
              item={item}
              updateItem={updateItem}
              deleteItem={deleteItem}
              moveItem={moveItem}
              isLastItem={items.length <= 2}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  )
}

interface DraggableEditorItemProps {
  index: number
  item: DragItem
  updateItem: (index: number, text: string) => void
  deleteItem: (index: number) => void
  moveItem: (dragIndex: number, hoverIndex: number) => void
  isLastItem: boolean
}

function DraggableEditorItem({ index, item, updateItem, deleteItem, moveItem, isLastItem }: DraggableEditorItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "EDITOR_ITEM",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "EDITOR_ITEM",
    hover: (draggedItem: { index: number }, monitor) => {
      if (draggedItem.index === index) return
      moveItem(draggedItem.index, index)
      draggedItem.index = index
    },
  })

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center gap-2 ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className="cursor-move p-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="w-6 h-6 flex items-center justify-center bg-muted rounded-full text-xs font-medium">
        {index + 1}
      </div>

      <Input
        value={item.text}
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
