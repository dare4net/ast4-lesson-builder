"use client"

import * as React from "react"
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor"
import { GripVertical } from "lucide-react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

interface BulletListEditorProps {
  items: string[]
  onChange: (items: string[]) => void
}

export function BulletListEditor({ items, onChange }: BulletListEditorProps) {
  // Map strings to objects with IDs for ArrayItemEditor
  const objectItems = items.map((text, index) => ({ id: `bullet-${index}`, text }))

  const addItem = () => {
    onChange([...items, "New item"])
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
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
      <ArrayItemEditor<{ id: string; text: string }>
        items={objectItems}
        onChange={(newObjects) => onChange(newObjects.map(obj => obj.text))}
        onAddItem={addItem}
        getItemLabel={(_, index) => `Item ${index + 1}`}
        layout="list"
        title="List Items"
        addButtonLabel="Add Item"
        renderItem={(item, index) => (
          <DraggableListItem
            index={index}
            item={item.text}
            updateItem={updateItem}
            moveItem={moveItem}
          />
        )}
      />
    </DndProvider>
  )
}

interface DraggableListItemProps {
  index: number
  item: string
  updateItem: (index: number, value: string) => void
  moveItem: (dragIndex: number, hoverIndex: number) => void
}

function DraggableListItem({ index, item, updateItem, moveItem }: DraggableListItemProps) {
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
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveItem(dragIndex, hoverIndex)
      draggedItem.index = hoverIndex
    },
  })

  drag(drop(ref))

  return (
    <div ref={ref} className={`flex items-center gap-3 ${isDragging ? "opacity-30 scale-95" : "opacity-100"} hover:bg-slate-900/40 p-1.5 rounded-xl transition-all group/bullet`}>
      <div className="cursor-move p-2 text-slate-700 group-hover/bullet:text-emerald-500 transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>

      <WYSIWYGInput
        value={item}
        onChange={(val) => updateItem(index, val)}
        placeholder={`Data Point ${index + 1}`}
      />
    </div>
  )
}
