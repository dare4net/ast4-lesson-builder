"use client";

import { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { XYCoord } from 'react-dnd';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentRenderer } from "@/components/component-renderer";
import type { Component } from "@/types/lesson";
import { useState, useEffect } from 'react'
import { DragDropContext, DragDropContextProps } from 'react-beautiful-dnd'

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface DraggableComponentProps {
  component: Component;
  index: number;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  onClick: () => void;
  id: string;
}

export function DraggableComponent({ 
  component, 
  index, 
  moveComponent,
  onDelete, 
  onClick, 
  id 
}: DraggableComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: 'COMPONENT',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor<DragItem>) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveComponent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'COMPONENT',
    item: () => ({ id, index, type: 'COMPONENT' }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Initialize drag and drop
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      id={id}
      className={cn(
        "relative group border rounded-md p-4",
        "hover:border-primary transition-colors duration-200",
        isDragging && "opacity-50 cursor-move"
      )}
      onClick={onClick}
      data-handler-id={handlerId}
    >
      <div className="absolute right-2 top-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete Component">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ComponentRenderer component={component} isEditing={true} onClick={onClick} />
    </div>
  );
}

export function ClientOnlyDragDropContext(props: DragDropContextProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <DragDropContext {...props} />
} 