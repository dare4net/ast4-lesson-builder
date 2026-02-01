"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GripVertical } from "lucide-react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

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

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex]
    const updatedItems = [...items]
    updatedItems.splice(dragIndex, 1)
    updatedItems.splice(hoverIndex, 0, draggedItem)
    const reindexedItems = updatedItems.map((item, index) => ({
      ...item,
      correctIndex: index,
    }))
    onChange(reindexedItems)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ArrayItemEditor<DragItem>
        items={items}
        onChange={onChange}
        onAddItem={addItem}
        getItemLabel={(_, index) => `Item ${index + 1}`}
        layout="list"
        title="Items (in correct order)"
        addButtonLabel="Add Item"
        minItems={2}
        renderItem={(item, index) => (
          <DraggableEditorItem
            index={index}
            item={item}
            updateItem={updateItem}
            moveItem={moveItem}
          />
        )}
      />
    </DndProvider>
  )
}

interface DraggableEditorItemProps {
  index: number
  item: DragItem
  updateItem: (index: number, text: string) => void
  moveItem: (dragIndex: number, hoverIndex: number) => void
}

function DraggableEditorItem({ index, item, updateItem, moveItem }: DraggableEditorItemProps) {
  const itemRef = React.useRef<HTMLDivElement>(null)

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

  drag(drop(itemRef))

  return (
    <div
      ref={itemRef}
      className={`flex items-center gap-2 ${isDragging ? "opacity-50" : "opacity-100"
        } bg-white hover:bg-[#E8F5E9] rounded-lg border border-[#4CAF50]/20 p-2 transition-colors`}
    >
      <div className="cursor-move p-2">
        <GripVertical className="h-4 w-4 text-[#4CAF50]" />
      </div>

      <div className="w-6 h-6 flex items-center justify-center bg-[#E8F5E9] text-[#2E7D32] rounded-full text-xs font-medium border border-[#4CAF50]/30 mr-2">
        {index + 1}
      </div>

      <Input
        value={item.text}
        onChange={(e) => updateItem(index, e.target.value)}
        placeholder={`Item ${index + 1}`}
        className="flex-1 w-full min-w-0 border-[#4CAF50]/30 focus-visible:ring-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
      />
    </div>
  )
}
